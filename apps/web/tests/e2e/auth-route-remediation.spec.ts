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

  test("sign-up supports Password, PIN, and Both method switching, conditional fields, validation, and payload mapping", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: /create your learner account/i })).toBeVisible();

    // Default Password mode shows password fields and hides PIN fields
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/^confirm password$/i)).toBeVisible();
    await expect(page.getByLabel(/^pin$/i)).toHaveCount(0);

    // Password visibility toggle
    await page.getByRole("button", { name: /show password/i }).click();
    await expect(page.getByLabel(/^password$/i)).toHaveAttribute("type", "text");

    // Switch to PIN mode
    await page.getByRole("radio", { name: /^pin$/i }).click();
    await expect(page.getByLabel(/^pin$/i)).toBeVisible();
    await expect(page.getByLabel(/^confirm pin$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toHaveCount(0);

    // Switch to Both mode
    await page.getByRole("radio", { name: /^both$/i }).click();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/^pin$/i)).toBeVisible();

    // Switch back to PIN mode and verify submission payload + success state
    await page.getByRole("radio", { name: /^pin$/i }).click();
    let capturedRegisterPayload: Record<string, unknown> | null = null;
    await page.route("**/api/auth/register", async (route) => {
      capturedRegisterPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Registration completed.", data: "Registration completed." }),
      });
    });

    await page.getByLabel(/full name/i).fill("Nurse Ada");
    await page.getByLabel(/email address/i).fill("ada@example.com");
    await page.getByLabel(/phone number/i).fill("+15550109988");
    await page.getByLabel(/^pin$/i).fill("123456");
    await page.getByLabel(/^confirm pin$/i).fill("123456");
    await page.getByLabel(/terms of service/i).check();
    await page.locator("form").getByRole("button", { name: /create learner account/i }).click();

    await expect(page.getByText(/your registration request is complete/i)).toBeVisible();
    expect(capturedRegisterPayload).toEqual({
      username: "Nurse Ada",
      email: "ada@example.com",
      phone: "+15550109988",
      pin: "123456",
      pinConfirmation: "123456",
      loginMethod: "pin",
      provider: "email",
      agree: true,
    });
  });

  test("sign-in supports Password and PIN method switching, rememberMe, and submits exact payload", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/^pin$/i)).toHaveCount(0);

    await page.getByRole("radio", { name: /^pin$/i }).click();
    await expect(page.getByLabel(/^pin$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toHaveCount(0);

    let capturedLoginPayload: Record<string, unknown> | null = null;
    await page.route("**/api/auth/login", async (route) => {
      capturedLoginPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Invalid credentials." }),
      });
    });

    await page.getByLabel(/email address/i).fill("ada@example.com");
    await page.getByLabel(/^pin$/i).fill("123456");
    await page.getByLabel(/keep me signed in/i).uncheck();
    await page.locator("form").getByRole("button", { name: /^sign in$/i }).click();

    await expect(page.locator("form").getByRole("alert")).toContainText(/invalid credentials/i);
    expect(capturedLoginPayload).toEqual({
      email: "ada@example.com",
      pin: "123456",
      loginMethod: "pin",
      LoginProvider: "email",
      rememberMe: false,
    });
  });
});
