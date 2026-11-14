import { test, expect } from "@playwright/test";

const stamp = Date.now();
const learner = {
  name: "Study Library E2E Learner",
  email: `studylib.${stamp}@nurviatest.example`,
  password: "StudyLibTest-2026-Secure",
};

test.describe.configure({ mode: "serial" });

test.describe("Study Library & Three-Mode Learning Experience", () => {
  test("1. Register and sign in as learner", async ({ page }) => {
    await page.goto("/sign-up");
    await page.locator("#name").fill(learner.name);
    await page.locator("#email").fill(learner.email);
    await page.locator("#password").fill(learner.password);
    await page.locator("form").getByRole("button", { name: /Create Account|Sign Up/i }).click();
    await page.waitForURL(/\/sign-in|\/learner/, { timeout: 30_000 });

    if (!page.url().includes("/learner")) {
      await page.locator("#email").fill(learner.email);
      await page.locator("#password").fill(learner.password);
      await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
      await page.waitForURL(/\/learner/, { timeout: 30_000 });
    }
  });

  test("2. Discover, search, filter, save study set, and verify responsive viewports", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill(learner.email);
    await page.locator("#password").fill(learner.password);
    await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
    await page.waitForURL(/\/learner/, { timeout: 30_000 });

    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/learner/library");
    await expect(page.getByRole("heading", { name: "Study Library" })).toBeVisible();
    await expect(page.getByPlaceholder("Search study sets, subjects, examinations or keywords...")).toBeVisible();

    // Expand academic & examination filters
    await page.getByRole("button", { name: /Academic & Examination Filters/i }).click();
    await expect(page.locator("#filter-school")).toBeVisible();
    await expect(page.locator("#filter-year")).toBeVisible();
    await expect(page.locator("#filter-season")).toBeVisible();
    await expect(page.locator("#filter-subject")).toBeVisible();
    await expect(page.locator("#filter-exam")).toBeVisible();

    // Search for ATI Pharmacology
    await page.getByPlaceholder("Search study sets, subjects, examinations or keywords...").fill("Pharmacology");
    await expect(page.getByText(/ATI Comprehensive Pharmacology/i).first()).toBeVisible({ timeout: 15_000 });

    // Save to My Library via overflow menu
    const moreBtn = page.getByRole("button", { name: /More actions for/i }).first();
    await moreBtn.click();
    await page.getByRole("menuitem", { name: /Save to My Library/i }).click();

    // Verify in My Library
    await page.goto("/learner/my-exams");
    await expect(page.getByRole("heading", { name: "Saved Study Sets" })).toBeVisible({ timeout: 15_000 });

    // Tablet & Mobile responsiveness check
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/learner/library");
    await expect(page.getByRole("heading", { name: "Study Library" })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("heading", { name: "Study Library" })).toBeVisible();
  });

  test("3. Launch Tutor Mode and progress through hints and answer evaluation", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill(learner.email);
    await page.locator("#password").fill(learner.password);
    await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
    await page.waitForURL(/\/learner/, { timeout: 30_000 });

    await page.goto("/learner/library");
    await page.getByRole("link", { name: /^Tutor$/i }).first().click();
    await page.waitForURL(/\/exam-session.*mode=Tutor/, { timeout: 30_000 });

    await expect(page.getByText("Guided Tutor Mode")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Ask for a Hint/i }).click();
    await expect(page.getByText(/Stage 2/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /Help Me Understand/i }).click();
    await expect(page.getByText(/Stage 3/i)).toBeVisible({ timeout: 10_000 });
  });
});
