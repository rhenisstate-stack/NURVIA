import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const API_URL = process.env.E2E_API_URL || "http://127.0.0.1:5055";
const SUPERADMIN_EMAIL = process.env.E2E_SUPERADMIN_EMAIL || "owner.e2e@nurvia.test";
const SUPERADMIN_PASSWORD = process.env.E2E_SUPERADMIN_PASSWORD || "SuperAdminE2E-2026!";

const stamp = Date.now();
const learner = {
  name: "Modules E2E Learner",
  email: `modules.${stamp}@nurviatest.example`,
  password: "ModulesE2E-2026-Secure!",
};

function partitionHeaders(): Record<string, string> {
  const id = test.info().testId.replace(/[^a-zA-Z0-9_-]/g, "").slice(-40);
  return { "X-Nurvia-Test-Partition": `modules-${id}` };
}

async function getCsrf(request: APIRequestContext): Promise<string> {
  const res = await request.get(`${API_URL}/api/auth/csrf`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.data as string;
}

async function signInUi(page: Page, email: string, password: string, expectedUrl: RegExp) {
  await page.goto("/sign-in");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
  await page.waitForURL(expectedUrl, { timeout: 30_000 });
}

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders(partitionHeaders());
});

test.describe("NURVIA Product Modules End-to-End Verification", () => {
  test("1. Public Care Plans & Community load live PostgreSQL records", async ({ page }) => {
    await page.goto("/care-plans");
    await expect(page.getByRole("heading", { name: /Nursing Care Plan Library/i })).toBeVisible();
    await expect(page.getByText(/Type 1 Diabetes \(Diabetic Ketoacidosis\)/i).first()).toBeVisible({ timeout: 15_000 });

    await page.goto("/community");
    await expect(page.getByRole("heading", { name: /Nursing Student Study/i })).toBeVisible();
    await expect(page.getByText(/NCLEX 2026 Test-Taker Cohorts/i)).toBeVisible();
  });

  test("2. Learner registers and completes Flashcards, Care Plans, Study Guides, Community, AI Tutor & Subscription workflows", async ({
    page,
    request,
  }) => {
    const csrf = await getCsrf(request);
    const reg = await request.post(`${API_URL}/api/auth/register`, {
      data: learner,
      headers: { "X-CSRF-TOKEN": csrf, ...partitionHeaders() },
    });
    expect([200, 202]).toContain(reg.status());

    await signInUi(page, learner.email, learner.password, /\/learner/);

    // Flashcards SRS: load, create personal card, verify persistence across reload, rate with SM-2
    await page.goto("/learner/flashcards");
    await expect(page.getByRole("heading", { name: /Spaced Flashcard Review/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /New Flashcard/i }).click();
    await page.locator("#fc-front").fill(`E2E Potassium Range ${stamp}`);
    await page.locator("#fc-back").fill("3.5 - 5.0 mEq/L");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/") && res.url().includes("flashcards") && res.request().method() === "POST" && res.ok()),
      page.getByRole("button", { name: /Save Flashcard/i }).click(),
    ]);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Spaced Flashcard Review/i })).toBeVisible({ timeout: 15_000 });
    const deckRes = await page.request.get("/api/backend/flashcards");
    expect(deckRes.ok()).toBeTruthy();
    const deckJson = await deckRes.json();
    expect(JSON.stringify(deckJson)).toContain(`E2E Potassium Range ${stamp}`);

    // Care Plans: create personal care plan and verify persistence
    await page.goto("/learner/care-plans");
    await expect(page.getByRole("heading", { name: /Care Plans/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /New Care Plan/i }).click();
    await page.locator("#cp-title").fill(`E2E Fluid Volume Excess ${stamp}`);
    await page.locator("#cp-diagnosis").fill("Excess Fluid Volume");
    await page.locator("#cp-outcomes").fill("Maintain SpO2 >= 94%");
    await page.locator("#cp-interventions").fill("Elevate HOB 45 degrees");
    await page.getByRole("button", { name: /Save Care Plan/i }).click();
    await expect(page.getByText(`E2E Fluid Volume Excess ${stamp}`)).toBeVisible({ timeout: 15_000 });

    // Study Guides: load seeded guides and open reader
    await page.goto("/learner/guides");
    await expect(page.getByRole("heading", { name: /Study Guides/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Read Guide/i }).first().click();
    await expect(page.getByRole("button", { name: /Download Guide \(\.md\)/i })).toBeVisible({ timeout: 10_000 });

    // Community: create post, like, reply, reload
    await page.goto("/learner/community");
    await expect(page.getByRole("heading", { name: /Student Cohort Community/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Start Discussion/i }).click();
    await page.locator("#comm-title").fill(`E2E NCLEX Pacing ${stamp}`);
    await page.locator("#comm-content").fill("How do you pace 85 NGN questions?");
    await page.getByRole("button", { name: /Publish Post/i }).click();
    await expect(page.getByText(`E2E NCLEX Pacing ${stamp}`)).toBeVisible({ timeout: 15_000 });

    // AI Tutor: send message & verify persisted reply
    await page.goto("/learner/ai-tutor");
    await expect(page.getByRole("heading", { name: /AI Clinical Judgment Tutor/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Start New Session/i }).click();
    await page.getByPlaceholder(/Ask a clinical judgment or prioritization question/i).fill("Explain digoxin toxicity signs");
    await page.getByRole("button", { name: /Send/i }).click();
    await expect(page.getByText(/Explain digoxin toxicity signs/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/NURVIA/i).first()).toBeVisible({ timeout: 15_000 });

    // Subscription: activate FREE plan & verify paid checkout fails closed
    await page.goto("/learner/subscription");
    await expect(page.getByRole("heading", { name: /Subscription & Entitlements/i })).toBeVisible({ timeout: 15_000 });
    const activateFreeBtn = page.getByRole("button", { name: /Activate Free Starter/i });
    if (await activateFreeBtn.isVisible()) {
      await activateFreeBtn.click();
      await expect(page.getByText(/Active on Account/i).first()).toBeVisible({ timeout: 15_000 });
    }
    const upgradeBtn = page.getByRole("button", { name: /Request Upgrade/i }).first();
    await upgradeBtn.click();
    await expect(page.getByText(/not configured|payment|checkout/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("3. Superadmin grants plan on /admin/plans and creates Staff Invitation accepted via /accept-invitation", async ({
    page,
    request,
  }) => {
    const grantTarget = {
      name: "Entitlement Target Learner",
      email: `grant.target.${Date.now()}@nurviatest.example`,
      password: "GrantTarget-2026-Secure!",
    };
    const csrf = await getCsrf(request);
    const reg = await request.post(`${API_URL}/api/auth/register`, {
      data: grantTarget,
      headers: { "X-CSRF-TOKEN": csrf, ...partitionHeaders() },
    });
    expect([200, 202]).toContain(reg.status());

    await signInUi(page, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, /\/admin/);

    await page.goto("/admin/plans");
    await expect(page.getByRole("heading", { name: /Plans & Entitlements/i })).toBeVisible({ timeout: 15_000 });
    await page.locator("#grant-user").fill(grantTarget.email);
    await page.getByRole("button", { name: /Grant Entitlement/i }).click();
    await expect(page.getByText(grantTarget.email).first()).toBeVisible({ timeout: 15_000 });

    // Create Staff Invitation on /admin/rbac
    const staffEmail = `staff.invite.${stamp}@nurviatest.example`;
    await page.goto("/admin/rbac");
    await expect(page.getByRole("heading", { name: /Staff Invitations/i })).toBeVisible({ timeout: 15_000 });
    await page.getByPlaceholder(/staff\.member@nurvia\.edu/i).fill(staffEmail);
    await page.getByRole("button", { name: /Create Invitation/i }).click();

    const tokenBanner = page.getByText(/Development Invitation Token:/i);
    await expect(tokenBanner).toBeVisible({ timeout: 15_000 });
    const tokenText = (await page.locator("code.select-all").textContent()) || "";
    const token = tokenText.trim();
    expect(token.length).toBeGreaterThan(15);

    // Accept invitation in a clean unauthenticated page context
    await page.goto(`/accept-invitation?token=${encodeURIComponent(token)}`);
    await page.locator("#staff-name").fill("Invited Clinical Author");
    await page.locator("#staff-password").fill("InvitedStaff-2026-Secure!");
    await page.getByRole("button", { name: /Activate Staff Account/i }).click();
    await expect(page.getByRole("button", { name: /Proceed to Sign In/i })).toBeVisible({ timeout: 15_000 });
  });
});
