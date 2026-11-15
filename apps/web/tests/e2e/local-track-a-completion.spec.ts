import { test, expect } from "@playwright/test";

const API_URL = process.env.E2E_API_URL || "http://127.0.0.1:5055";
const stamp = Date.now();
const testUser = {
  name: "Track A E2E Learner",
  email: `tracka.${stamp}@nurviatest.example`,
  initialPassword: "TrackA-Initial-2026!",
  newPassword: "TrackA-Updated-2026!",
};

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }, testInfo) => {
  const id = testInfo.testId.replace(/[^a-zA-Z0-9_-]/g, "").slice(-40);
  await page.setExtraHTTPHeaders({ "X-Nurvia-Test-Partition": `tracka-${id}` });
});

test.describe("Track A local completion E2E workflows", () => {
  test("1. Password recovery end-to-end via local DevelopmentEmailSink", async ({ page, request }) => {
    // Clear dev email sink before test
    await request.delete(`${API_URL}/api/dev/emails`);

    // Register a new learner
    await page.goto("/sign-up");
    await page.locator("#name").fill(testUser.name);
    await page.locator("#email").fill(testUser.email);
    await page.locator("#password").fill(testUser.initialPassword);
    await page.locator("#confirmation").fill(testUser.initialPassword);
    await page.locator("form").getByRole("button", { name: /Create learner account/i }).click();
    await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible({ timeout: 20_000 });

    // Request password reset
    await page.goto("/forgot-password");
    await page.locator("#email").fill(testUser.email);
    await page.locator("form").getByRole("button", { name: /Send Reset/i }).click();
    await expect(page.getByRole("status")).toBeVisible();

    // Retrieve captured email from dev sink
    const emailsRes = await request.get(`${API_URL}/api/dev/emails`);
    expect(emailsRes.ok()).toBeTruthy();
    const emails = (await emailsRes.json()) as { toEmail: string; resetUrl: string }[];
    const match = emails.find((e) => e.toEmail.toLowerCase() === testUser.email.toLowerCase());
    expect(match).toBeTruthy();
    expect(match!.resetUrl).toContain("/reset-password?token=");

    // Open reset link and set new password
    const resetPath = new URL(match!.resetUrl).pathname + new URL(match!.resetUrl).search;
    await page.goto(resetPath);
    await page.locator("#new-password").fill(testUser.newPassword);
    await page.locator("#confirm-password").fill(testUser.newPassword);
    await page.locator("form").getByRole("button", { name: /Update Password/i }).click();
    await expect(page.getByRole("status")).toBeVisible();

    // Token replay must fail
    await page.goto(resetPath);
    await page.locator("#new-password").fill("AnotherPass-2026!");
    await page.locator("#confirm-password").fill("AnotherPass-2026!");
    await page.locator("form").getByRole("button", { name: /Update Password/i }).click();
    await expect(page.locator("main [role='alert']:not(#__next-route-announcer__)")).toBeVisible();

    // Old password must fail on sign-in
    await page.goto("/sign-in");
    await page.locator("#email").fill(testUser.email);
    await page.locator("#password").fill(testUser.initialPassword);
    await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
    await expect(page.locator("main [role='alert']:not(#__next-route-announcer__)")).toBeVisible();

    // New password must succeed
    await page.locator("#password").fill(testUser.newPassword);
    await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
    await page.waitForURL(/\/learner$/, { timeout: 20_000 });
  });

  test("2. Learner Planner CRUD persists across reload and Saved Questions has no mock data", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill(testUser.email);
    await page.locator("#password").fill(testUser.newPassword);
    await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
    await page.waitForURL(/\/learner$/, { timeout: 20_000 });

    // Planner CRUD
    await page.goto("/learner/planner");
    const taskTitle = `Pharmacology Review ${stamp}`;
    await page.locator("#planner-title").fill(taskTitle);
    await page.locator("#planner-duration").fill("45");
    await page.getByRole("button", { name: /Add Study Task/i }).click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Reload to verify PostgreSQL persistence
    await page.reload();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Toggle complete & delete
    await page.getByRole("button", { name: /Mark task complete/i }).first().click();
    await page.getByRole("button", { name: /Delete task/i }).first().click();
    await expect(page.getByText(taskTitle)).toHaveCount(0);

    // Saved questions loads persisted empty state (no hardcoded sq-1/digoxin mock)
    await page.goto("/learner/saved-questions");
    await expect(page.getByText(/No saved questions yet/i)).toBeVisible();

    // Calculator rejects zero divisor cleanly
    await page.goto("/learner/calculators");
    const inputs = page.locator("input[type='number']");
    await inputs.nth(1).fill("0");
    await expect(page.locator("main [role='alert']:not(#__next-route-announcer__)")).toBeVisible();

    // Learner cannot access admin endpoints (403)
    const adminOverviewRes = await page.request.get("/api/backend/admin/overview");
    expect(adminOverviewRes.status()).toBe(403);
    const adminLearnersRes = await page.request.get("/api/backend/admin/learners");
    expect(adminLearnersRes.status()).toBe(403);
  });
});
