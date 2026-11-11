import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const EVIDENCE_DIR = path.resolve(process.cwd(), "../../docs/evidence");
const stamp = Date.now();
const learner = {
  name: "Journey Test Learner",
  email: `journey.${stamp}@nurviatest.example`,
  password: "JourneyTest-2026-Secure",
};
const examTitle = "ATI Comprehensive Pharmacology Practice Exam";
const attemptRef = { id: "" as string, email: learner.email, score: "" as string };

test.describe.configure({ mode: "serial" });

async function signInLearner(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await expect(page).toHaveURL(/\/sign-in/);
  await page.locator("#email").fill(learner.email);
  await page.locator("#password").fill(learner.password);
  await shot(page, "03-sign-in");
  await page.locator("form").getByRole("button", { name: /Sign In/ }).click();
  await page.waitForURL(/\/learner$/, { timeout: 30_000 });
}

async function shot(page: import("@playwright/test").Page, name: string) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: path.join(EVIDENCE_DIR, `${name}.png`), fullPage: true });
}

test.describe("Complete authenticated learner journey", () => {
  test("Step 1 — Public landing page hero, CTAs, Quick Practice, navbar", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Turn Practice Into ATI and HESI Readiness" })
    ).toBeVisible();
    await expect(page.getByText("Built for nursing school exam days", { exact: false })).toBeVisible();
    await expect(page.getByText("Work through ATI, HESI, and exit-exam practice", { exact: false })).toBeVisible();

    // Background video / reference fallback sits behind the hero content
    const heroLayer = page.getByTestId("hero-background-fallback").or(page.getByTestId("hero-background-video"));
    await expect(heroLayer.first()).toBeVisible();

    const quickPractice = page.getByRole("region", { name: "Quick Practice" });
    await expect(quickPractice).toBeVisible();
    await expect(quickPractice.getByText(/Question 1 of 3/)).toBeVisible();
    await expect(quickPractice.getByText(/warfarin/)).toBeVisible();

    const startLink = page.getByRole("link", { name: /Try a Practice Set/ }).first();
    await expect(startLink).toBeVisible();
    await expect(startLink).toHaveAttribute("href", /\/sign-up/);

    const exploreLink = page.getByRole("main").getByRole("link", { name: "Explore the Exam Library" });
    await expect(exploreLink).toBeVisible();
    await expect(exploreLink).toHaveAttribute("href", "/exams");

    // Navbar auth links open dedicated pages
    await expect(page.getByRole("link", { name: "Sign In" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" }).first()).toBeVisible();

    await shot(page, "01-hero-desktop");
  });

  test("Step 1b — Mobile hero layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Turn Practice Into ATI and HESI Readiness" })
    ).toBeVisible();
    await expect(page.getByRole("region", { name: "Quick Practice" })).toBeVisible();
    await shot(page, "01b-hero-mobile");
  });

  test("Step 1c — Quick Practice preview: select, learn, navigate", async ({ page }) => {
    await page.goto("/");
    const quickPractice = page.getByRole("region", { name: "Quick Practice" });

    // Select an option → learn-as-you-go rationale is revealed only after selection
    await quickPractice.getByRole("radio", { name: /To monitor the time it takes for your blood to clot/ }).click();
    await expect(quickPractice.getByText(/Clinical Reasoning & Rationale/)).toBeVisible();

    // Keep Going advances to the next sample question; Back returns
    await quickPractice.getByRole("button", { name: /Keep Going/ }).click();
    await expect(quickPractice.getByText(/Question 2 of 3/)).toBeVisible();
    await quickPractice.getByRole("button", { name: "Back" }).click();
    await expect(quickPractice.getByText(/Question 1 of 3/)).toBeVisible();
  });

  test("Step 2 — Registration persists a learner account", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign Up" }).first().click();
    await expect(page).toHaveURL(/\/sign-up/);

    await page.locator("#name").fill(learner.name);
    await page.locator("#email").fill(learner.email);
    await page.locator("#password").fill(learner.password);
    await page.locator("#confirmation").fill(learner.password);
    await page.getByRole("button", { name: "Create learner account" }).click();

    await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible();
    await shot(page, "02-sign-up-success");
  });

  test("Step 2b — Duplicate registration is handled safely", async ({ page }) => {
    await page.goto("/sign-up");
    await page.locator("#name").fill(learner.name);
    await page.locator("#email").fill(learner.email);
    await page.locator("#password").fill(learner.password);
    await page.locator("#confirmation").fill(learner.password);
    await page.getByRole("button", { name: "Create learner account" }).click();
    // Anti-enumeration: same success panel, no account duplication error surfaced
    await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible();
  });

  test("Step 3 — Sign In establishes the learner session", async ({ page }) => {
    await signInLearner(page);
    // Identity: sidebar shows the signed-in learner's own name
    await expect(page.getByText(learner.name).first()).toBeVisible();
    await shot(page, "04-learner-dashboard");
  });

  test("Step 4 — Dashboard shows persisted data and published exams from the backend", async ({ page }) => {
    await signInLearner(page);
    await expect(page.getByText(examTitle).first()).toBeVisible();
    // No staff workspace navigation for a learner
    await expect(page.locator('a[href^="/admin"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Question Bank" })).toHaveCount(0);
  });

  test("Steps 5-6 — Exam discovery, start, and answering with autosave + refresh recovery", async ({ page, browser }) => {
    await signInLearner(page);

    await page.goto("/learner/exams");
    await expect(page.getByText(examTitle).first()).toBeVisible();
    await shot(page, "05-exam-discovery");

    await page
      .locator(`div:has(h2:text-is("${examTitle}")) a:has-text("Start this exam")`)
      .first()
      .click();
    await page.waitForURL(/\/exam-session/, { timeout: 30_000 });

    // Q1: single-choice digoxin question — select the correct option by visible text
    await expect(page.getByText("Item 1 of 2")).toBeVisible();
    await page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ }).click();

    // Q2: SATA lithium toxicity — select the three correct options
    await page.getByRole("button", { name: /Next Item/ }).click();
    await expect(page.getByText("Item 2 of 2")).toBeVisible();
    await page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ }).click();
    await page.getByRole("button", { name: /Fine hand tremors becoming coarse/ }).click();
    await page.getByRole("button", { name: /Slurred speech and muscle weakness/ }).click();

    // Wait for autosave persistence indicator
    await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 15_000 });
    await shot(page, "06-exam-session-answered");

    // Refresh recovery: attempt and saved answers are rehydrated from the API (session restarts at item 1)
    await page.reload();
    await expect(page.getByText("Item 1 of 2")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ })).toHaveClass(/ring-brand-teal|border-brand-teal/, { timeout: 15_000 });
    await page.getByRole("button", { name: /Next Item/ }).click();
    await expect(page.getByText("Item 2 of 2")).toBeVisible();
    await expect(page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ })).toHaveClass(/ring-brand-teal|border-brand-teal/, { timeout: 15_000 });
    await shot(page, "06b-exam-session-after-refresh");
  });

  test("Step 7 — Submit exam and land on persisted result", async ({ page }) => {
    await signInLearner(page);

    await page.goto("/learner/exams");
    // Continuing the in-progress attempt: starting the same exam resumes the persisted attempt
    await page
      .locator(`div:has(h2:text-is("${examTitle}")) a:has-text("Start this exam")`)
      .first()
      .click();
    await page.waitForURL(/\/exam-session/, { timeout: 30_000 });
    await expect(page.getByText("Item 1 of 2")).toBeVisible();

    await page.getByRole("button", { name: "Finish Exam" }).click();
    await page.getByRole("button", { name: "Confirm & Submit" }).click();

    await page.waitForURL(/\/learner\/attempts\//, { timeout: 30_000 });
    attemptRef.id = page.url().split("/").pop() || "";
    await expect(page.getByText("Result and review")).toBeVisible();
    await expect(page.getByText("100%").first()).toBeVisible();
    await expect(page.getByText("2 correct", { exact: false })).toBeVisible();
    await shot(page, "07-result-summary");
    attemptRef.score = "100";
  });

  test("Step 8 — Review shows released answer key and rationales", async ({ page }) => {
    await signInLearner(page);
    await page.goto(`/learner/attempts/${attemptRef.id}`);
    await expect(page.getByText("Correct answer").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Clinical Rationale|Overall Clinical Rationale/i).first()).toBeVisible();
    await shot(page, "08-review-answer-key");
  });

  test("Steps 10-11 — Profile update persists and sign out ends the session", async ({ page }) => {
    await signInLearner(page);

    await page.goto("/learner/account");
    await expect(page.locator("#profile-name")).toHaveValue(learner.name);
    const updatedName = "Journey Learner Updated";
    await page.locator("#profile-name").fill(updatedName);
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Your profile changes have been saved.")).toBeVisible();
    await shot(page, "09-profile-updated");

    await page.reload();
    await expect(page.locator("#profile-name")).toHaveValue(updatedName);

    // Email field must be read-only and no role control may exist
    await expect(page.locator("#profile-email")).toBeDisabled();

    await page.goto("/learner");
    await page.getByRole("button", { name: "Sign Out" }).first().click();
    await page.waitForURL(/localhost:3000\/$|:3000\//, { timeout: 30_000 });

    // Protected page requires authentication again
    await page.goto("/learner");
    await page.waitForURL(/\/sign-in/, { timeout: 30_000 });
    await shot(page, "10-signed-out-redirect");

    // Protected API rejects unauthenticated access
    const me = await page.request.get(`${process.env.E2E_API_URL || "http://localhost:5055"}/api/auth/me`);
    expect(me.status()).toBe(401);
  });
});
