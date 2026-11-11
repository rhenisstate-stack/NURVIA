import { test, expect, APIRequestContext } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const API = process.env.E2E_API_URL || "http://localhost:5055";
const EVIDENCE_DIR = path.resolve(process.cwd(), "../../docs/evidence");
const stamp = Date.now();

// Bootstrapped Superadmin identity: the API under test is started with the
// BootstrapAdmin configuration that provisions exactly this account.
const superadmin = {
  email: process.env.E2E_SUPERADMIN_EMAIL || "owner.e2e@nurvia.test",
  password: process.env.E2E_SUPERADMIN_PASSWORD || "SuperAdminE2E-2026!",
  name: "Platform Owner",
};

const learner = {
  email: `nav.${stamp}@nurviatest.example`,
  password: "NavLearner-2026-Secure",
  name: "Navigation Learner",
};

async function getCsrf(request: APIRequestContext): Promise<string> {
  const res = await request.get(`${API}/api/auth/csrf`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.data;
}

async function apiSignIn(request: APIRequestContext, account: { email: string; password: string }) {
  const csrf = await getCsrf(request);
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email: account.email, password: account.password },
    headers: { "X-CSRF-TOKEN": csrf },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).data as { id: string; role: string };
}

async function apiRegister(request: APIRequestContext, account: { email: string; password: string; name: string }) {
  const csrf = await getCsrf(request);
  const res = await request.post(`${API}/api/auth/register`, {
    data: { name: account.name, email: account.email, password: account.password },
    headers: { "X-CSRF-TOKEN": csrf },
  });
  expect([200, 202]).toContain(res.status());
}

async function shot(page: import("@playwright/test").Page, name: string) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: path.join(EVIDENCE_DIR, `${name}.png`), fullPage: true });
}

test.describe.configure({ mode: "serial" });

test.describe("Backend role-assignment security (authenticated HTTP)", () => {
  test("Superadmin can sign in via the bootstrapped account", async ({ request }) => {
    const user = await apiSignIn(request, superadmin);
    expect(user.role).toBe("Superadmin");
  });

  test("Superadmin can promote a learner to Administrator", async ({ request }) => {
    await apiRegister(request, learner);
    const learnerUser = await apiSignIn(request, learner);
    expect(learnerUser.role).toBe("Learner");

    // Switch this request context to the Superadmin before assigning.
    await apiSignIn(request, superadmin);
    const assign = await request.post(`${API}/api/auth/assign-role`, {
      data: { targetUserId: learnerUser.id, role: "Administrator" },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect(assign.status()).toBe(200);
  });

  test("Administrator CANNOT assign Superadmin, including to an existing Superadmin", async ({ request }) => {
    const superadminUser = await apiSignIn(request, superadmin);
    expect(superadminUser.role).toBe("Superadmin");

    // The promoted learner is now an Administrator on the server.
    const adminUser = await apiSignIn(request, learner);
    expect(adminUser.role).toBe("Administrator");

    for (const role of ["Superadmin", "superadmin", "SUPERADMIN"]) {
      const escalate = await request.post(`${API}/api/auth/assign-role`, {
        data: { targetUserId: superadminUser.id, role },
        headers: { "X-CSRF-TOKEN": await getCsrf(request) },
      });
      expect([403, 400]).toContain(escalate.status());
    }

    // Self-escalation is also denied.
    const self = await request.post(`${API}/api/auth/assign-role`, {
      data: { targetUserId: adminUser.id, role: "Superadmin" },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect([403, 400]).toContain(self.status());
  });

  test("Learner cannot assign any role", async ({ request }) => {
    const fresh = { email: `nav2.${stamp}@nurviatest.example`, password: "NavLearner2-2026", name: "Nav Learner 2" };
    await apiRegister(request, fresh);
    await apiSignIn(request, fresh);
    const assign = await request.post(`${API}/api/auth/assign-role`, {
      data: { targetUserId: fresh.email, role: "Administrator" },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect([403, 400]).toContain(assign.status());
  });

  test("Superadmin can start their own attempt; other learners cannot touch it", async ({ request }) => {
    await apiSignIn(request, superadmin);
    const exams = await request.get(`${API}/api/Exams?status=Published`);
    const examId = ((await exams.json()).data.items as Array<{ id: string }>)[0].id;

    const start = await request.post(`${API}/api/attempts/start/${examId}`, {
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect(start.status()).toBe(200);
    const attemptId = (await start.json()).data.attemptId as string;

    // A different learner cannot read the Superadmin's attempt.
    const other = { email: `nav3.${stamp}@nurviatest.example`, password: "NavLearner3-2026", name: "Nav Learner 3" };
    await apiRegister(request, other);
    await apiSignIn(request, other);
    const foreign = await request.get(`${API}/api/attempts/${attemptId}`);
    expect(foreign.status()).toBe(403);
  });
});

test.describe("Browser-level Superadmin dashboard navigation", () => {
  test("Superadmin switches between Admin and Learner dashboards, direct URL, and refresh", async ({ page }) => {
    // Sign in through the real UI.
    await page.goto("/sign-in");
    await page.locator("#email").fill(superadmin.email);
    await page.locator("#password").fill(superadmin.password);
    await page.locator("form").getByRole("button", { name: /Sign In/ }).click();
    await page.waitForURL(/\/admin$/, { timeout: 30_000 });
    await shot(page, "40-superadmin-admin-dashboard");

    // 2. Switch to the Learner Dashboard through the switcher.
    await page.getByRole("link", { name: "Learner Dashboard" }).first().click();
    await page.waitForURL(/\/learner$/, { timeout: 30_000 });
    // The learner shell must render real dashboard content, not the
    // "Redirecting to the appropriate page…" placeholder.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Redirecting to the appropriate page")).toHaveCount(0);
    await shot(page, "41-superadmin-learner-dashboard");

    // 3. Direct URL access to the canonical learner dashboard.
    await page.goto("/learner");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Redirecting to the appropriate page")).toHaveCount(0);

    // 4. Refresh the learner dashboard — session must persist.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Redirecting to the appropriate page")).toHaveCount(0);
    await shot(page, "42-superadmin-learner-refresh");

    // 5. Navigate back to the Admin Dashboard.
    await page.getByRole("link", { name: "Admin Dashboard" }).first().click();
    await page.waitForURL(/\/admin$/, { timeout: 30_000 });
    await expect(page.getByText("Management Console")).toBeVisible();
    await shot(page, "43-superadmin-back-to-admin");

    // 6. Repeat switching to prove stability.
    await page.goto("/learner");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    await page.goto("/admin");
    await expect(page.getByText("Management Console")).toBeVisible();

    // The switcher is visible for Superadmin inside the learner shell.
    await page.goto("/learner");
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
    await shot(page, "44-superadmin-switcher-visible");
  });

  test("An ordinary Learner keeps access to the learner dashboard only", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill(learner.email);
    await page.locator("#password").fill(learner.password);
    await page.locator("form").getByRole("button", { name: /Sign In/ }).click();
    await page.waitForURL(/\/learner$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });

    // No cross-dashboard switcher for a plain Learner.
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toHaveCount(0);

    // Direct access to an admin route is denied.
    await page.goto("/admin");
    await page.waitForURL(/\/access-denied$/, { timeout: 30_000 });
    await shot(page, "45-learner-admin-denied");
  });
});
