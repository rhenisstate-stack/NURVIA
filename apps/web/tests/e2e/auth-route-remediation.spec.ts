import { test, expect } from "@playwright/test";

const AUTH_EMAIL = process.env.E2E_AUTH_EMAIL || "";
const AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD || "";

test.describe("NURVIA Phase 3.1 Authentication Route Remediation", () => {
  test("unauthenticated /sign-in and /sign-up use /api/auth/me and never call /api/backend/auth/me or /api/backend/auth/csrf", async ({ page }) => {
    const requestedUrls: string[] = [];
    page.on("request", (req) => {
      requestedUrls.push(req.url());
    });

    const meResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/auth/me") && res.request().method() === "GET"
    );

    await page.goto("/sign-in");
    const meResponse = await meResponsePromise;
    expect(meResponse.status()).toBe(401);
    expect(meResponse.headers()["cache-control"] || "").toContain("no-store");

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: /create your learner account/i })).toBeVisible();

    const forbiddenRequests = requestedUrls.filter(
      (url) =>
        url.includes("/api/backend/auth/me") ||
        url.includes("/api/backend/auth/csrf") ||
        url.includes("/api/auth/csrf")
    );
    expect(forbiddenRequests).toEqual([]);
  });

  test("unauthenticated access to protected /learner route redirects to /sign-in", async ({ page }) => {
    await page.goto("/learner");
    await page.waitForURL(/\/sign-in/);
    expect(page.url()).toContain("/sign-in");
  });

  test("non-JSON plain-text 404 on login shows controlled error instead of JSON parse crash", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "text/plain; charset=utf-8",
        body: "The page could not be found\n\nDNS_HOSTNAME_RESOLVED_PRIVATE",
      });
    });

    await page.getByLabel(/email address/i).fill("nurse@example.com");
    await page.getByLabel(/^password$/i).fill("TestPassword123!");
    await page.locator("form").getByRole("button", { name: /^sign in$/i }).click();

    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toBeVisible();
    const alertText = await alert.textContent();
    expect(alertText || "").not.toContain("Unexpected token");
    expect(alertText || "").not.toContain("DNS_HOSTNAME_RESOLVED_PRIVATE");
    expect(alertText || "").toContain("not found");
  });

  test("authenticated workflow: login, current-user, reload persistence, multi-tab, logout, post-logout denial", async ({
    browser,
    page,
  }) => {
    test.skip(!AUTH_EMAIL || !AUTH_PASSWORD, "Authorized NURVIA test account credentials not provided.");

    await page.goto("/sign-in");
    await page.getByLabel(/email address/i).fill(AUTH_EMAIL);
    await page.getByLabel(/^password$/i).fill(AUTH_PASSWORD);

    const loginResPromise = page.waitForResponse(
      (res) => res.url().includes("/api/auth/login") && res.request().method() === "POST"
    );
    await page.locator("form").getByRole("button", { name: /^sign in$/i }).click();
    const loginRes = await loginResPromise;
    expect(loginRes.status()).toBe(200);

    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));

    // Reload persistence
    const meReloadPromise = page.waitForResponse(
      (res) => res.url().includes("/api/auth/me") && res.request().method() === "GET"
    );
    await page.reload();
    const meReload = await meReloadPromise;
    expect(meReload.status()).toBe(200);

    // Second tab consistency
    const context = page.context();
    const page2 = await context.newPage();
    await page2.goto("/learner");
    await expect(page2).not.toHaveURL(/\/sign-in/);
    await page2.close();

    // Logout
    const accountMenu = page.getByRole("button", { name: /account|profile|sign out/i }).first();
    await accountMenu.click();
    const logoutBtn = page.getByRole("menuitem", { name: /sign out|log out/i }).or(
      page.getByRole("button", { name: /sign out|log out/i })
    );
    await logoutBtn.first().click();

    await page.goto("/learner");
    await page.waitForURL(/\/sign-in/);
  });
});
