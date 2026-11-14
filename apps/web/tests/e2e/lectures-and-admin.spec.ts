import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const API = process.env.E2E_API_URL || "http://localhost:5055";
const SUPERADMIN_EMAIL = process.env.E2E_SUPERADMIN_EMAIL || "owner.e2e@nurvia.test";
const SUPERADMIN_PASSWORD = process.env.E2E_SUPERADMIN_PASSWORD || "SuperAdminE2E-2026!";

const stamp = Date.now();
const PASSWORD = "NurviaE2E-Lectures!2026";

async function getCsrf(request: APIRequestContext): Promise<string> {
  const res = await request.get(`${API}/api/auth/csrf`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.data as string;
}

async function apiRegister(request: APIRequestContext, user: { name: string; email: string; password: string }) {
  const csrf = await getCsrf(request);
  const res = await request.post(`${API}/api/auth/register`, {
    data: user,
    headers: { "X-CSRF-TOKEN": csrf },
  });
  expect([200, 202]).toContain(res.status());
}

async function apiSignIn(request: APIRequestContext, email: string, password: string) {
  const csrf = await getCsrf(request);
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email, password },
    headers: { "X-CSRF-TOKEN": csrf },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.data as { id: string; email: string; role: string };
}

async function createStaffUser(
  request: APIRequestContext,
  prefix: string,
  role: "Author" | "Reviewer" | "Publisher" | "Learner"
) {
  const creds = {
    name: `E2E ${role} ${stamp}`,
    email: `e2e.${prefix}.${stamp}@nurvia.test`,
    password: PASSWORD,
  };
  await apiRegister(request, creds);
  const created = await apiSignIn(request, creds.email, creds.password);
  if (role !== "Learner") {
    await apiSignIn(request, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
    const assign = await request.post(`${API}/api/auth/assign-role`, {
      data: { targetUserId: created.id, role },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect(assign.status()).toBe(200);
  }
  return { ...creds, id: created.id, role };
}

async function signInViaUi(page: Page, email: string, password: string, expectedPath: RegExp) {
  await page.goto("/sign-in");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("form").getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(expectedPath, { timeout: 25_000 });
}

test.describe("Mark K. Lecture Catalogue, Reader Access Control & Staff Lifecycle", () => {
  test("Journey D — Public catalogue, public lecture 1 reader, protected lecture 4 gate, and authenticated learner unlock", async ({
    page,
    request,
  }) => {
    // 1. Public catalogue renders seeded lectures
    await page.goto("/mark-k");
    await expect(page.getByRole("heading", { name: "Mark K. NCLEX Lecture Notes Index" })).toBeVisible();

    const catRes = await request.get(`${API}/api/lectures`);
    expect(catRes.status()).toBe(200);
    const catBody = await catRes.json();
    const catalogue = catBody.data as Array<{ number: number; slug: string; title: string; accessLevel: string }>;
    expect(catalogue.length).toBeGreaterThanOrEqual(12);

    const publicLec = catalogue.find((l) => l.number === 1)!;
    const protectedLec = catalogue.find((l) => l.number === 4)!;
    expect(publicLec.accessLevel).toBe("Public");
    expect(protectedLec.accessLevel).toBe("AuthenticatedLearner");

    // 2. Unauthenticated API access to protected lecture returns 401 without bodyMarkdown
    const unauthProtectedRes = await request.get(`${API}/api/lectures/${protectedLec.slug}`);
    expect(unauthProtectedRes.status()).toBe(401);
    const unauthProtectedText = await unauthProtectedRes.text();
    expect(unauthProtectedText).not.toContain("bodyMarkdown");

    // 3. Unauthenticated reader opens Lecture 1 and navigates to Lecture 2 via Next link
    await page.goto(`/mark-k/${publicLec.slug}`);
    await expect(page.getByRole("heading", { name: publicLec.title })).toBeVisible();
    await expect(page.getByText(/NURVIA is independent and is not affiliated/i)).toBeVisible();
    const navNext = page.getByRole("navigation", { name: "Lecture navigation" }).getByRole("link").last();
    await navNext.click();
    await expect(page).toHaveURL(/\/mark-k\//);

    // 4. Unauthenticated browser visit to Lecture 4 shows sign-in gate
    await page.goto(`/mark-k/${protectedLec.slug}`);
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();

    // 5. Authenticated learner signs in and unlocks Lecture 4
    const learner = await createStaffUser(request, "lec-learner", "Learner");
    await signInViaUi(page, learner.email, learner.password, /\/learner/);
    await page.goto(`/mark-k/${protectedLec.slug}`);
    await expect(page.getByRole("heading", { name: protectedLec.title })).toBeVisible({ timeout: 15_000 });
  });

  test("Journey E & F — Learner denied /admin/lectures; Staff RBAC & Lecture Management UI controls", async ({
    browser,
    request,
  }) => {
    const learner = await createStaffUser(request, "lec-rbac-learner", "Learner");
    const author = await createStaffUser(request, "lec-author", "Author");
    const reviewer = await createStaffUser(request, "lec-reviewer", "Reviewer");
    const publisher = await createStaffUser(request, "lec-publisher", "Publisher");

    // 1. Learner cannot access /admin/lectures or management API
    await apiSignIn(request, learner.email, learner.password);
    const learnerMgmtRes = await request.get(`${API}/api/lectures/management`);
    expect(learnerMgmtRes.status()).toBe(403);

    const learnerCtx = await browser.newContext();
    const learnerPage = await learnerCtx.newPage();
    await signInViaUi(learnerPage, learner.email, learner.password, /\/learner/);
    await learnerPage.goto("/admin/lectures");
    await learnerPage.waitForURL(/\/access-denied/, { timeout: 15_000 });
    await learnerCtx.close();

    // 2. Author accesses /admin/lectures, sees seeded lectures, previews Lecture 1, and cannot review or publish
    const authorCtx = await browser.newContext();
    const authorPage = await authorCtx.newPage();
    await signInViaUi(authorPage, author.email, author.password, /\/admin/);
    await authorPage.goto("/admin/lectures");

    await expect(authorPage.getByRole("heading", { name: "Mark K. Lecture Notes Management" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(authorPage.getByRole("button", { name: "New Lecture Draft" })).toBeVisible();
    await expect(authorPage.getByRole("button", { name: "Publish" })).toHaveCount(0);
    await expect(authorPage.getByRole("button", { name: "Archive" })).toHaveCount(0);

    await authorPage.getByRole("button", { name: "Preview" }).first().click();
    await expect(authorPage.getByRole("button", { name: "Hide Preview" })).toBeVisible();

    // API guardrails: Author cannot review/approve or create out-of-range lecture number
    await apiSignIn(request, author.email, author.password);
    const mgmtRes = await request.get(`${API}/api/lectures/management`);
    expect(mgmtRes.status()).toBe(200);
    const mgmtBody = await mgmtRes.json();
    const firstLec = (mgmtBody.data as Array<{ id: string }>)[0];
    expect(firstLec).toBeTruthy();

    const authorReviewRes = await request.post(`${API}/api/lectures/${firstLec.id}/review`, {
      data: { approve: true, comments: "Unauthorized review attempt" },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect(authorReviewRes.status()).toBe(403);

    const invalidNumRes = await request.post(`${API}/api/lectures`, {
      data: {
        number: 99,
        slug: `e2e-invalid-${stamp}`,
        title: "Out of Range",
        category: "Test",
        summary: "Test",
        bodyMarkdown: "Test",
        highYieldConcepts: [],
        accessLevel: "Public",
      },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect([400, 409]).toContain(invalidNumRes.status());
    await authorCtx.close();

    // 3. Reviewer accesses /admin/lectures without Author/Publisher buttons
    const reviewerCtx = await browser.newContext();
    const reviewerPage = await reviewerCtx.newPage();
    await signInViaUi(reviewerPage, reviewer.email, reviewer.password, /\/admin/);
    await reviewerPage.goto("/admin/lectures");
    await expect(reviewerPage.getByRole("heading", { name: "Mark K. Lecture Notes Management" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(reviewerPage.getByRole("button", { name: "New Lecture Draft" })).toHaveCount(0);
    await expect(reviewerPage.getByRole("button", { name: "Archive" })).toHaveCount(0);
    await reviewerCtx.close();

    // 4. Publisher sees Archive two-step confirmation & Reader links, and cancels without mutating catalogue
    const publisherCtx = await browser.newContext();
    const publisherPage = await publisherCtx.newPage();
    await signInViaUi(publisherPage, publisher.email, publisher.password, /\/admin/);
    await publisherPage.goto("/admin/lectures");
    await expect(publisherPage.getByRole("button", { name: "Archive" }).first()).toBeVisible({ timeout: 15_000 });
    await publisherPage.getByRole("button", { name: "Archive" }).first().click();
    await expect(publisherPage.getByRole("button", { name: "Confirm Archive" })).toBeVisible();
    await publisherPage.getByRole("button", { name: "Cancel" }).click();
    await expect(publisherPage.getByRole("button", { name: "Confirm Archive" })).toHaveCount(0);
    await publisherCtx.close();
  });
});
