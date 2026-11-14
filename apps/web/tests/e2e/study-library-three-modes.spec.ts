import { test, expect, type Page } from "@playwright/test";

const API_URL = process.env.E2E_API_URL || "http://localhost:5055";
const stamp = Date.now();

const learnerA = {
  name: "Study Library Pilot A",
  email: `studylib.a.${stamp}@nurviatest.example`,
  password: "StudyLibTest-2026-SecureA",
};

const learnerB = {
  name: "Study Library Pilot B",
  email: `studylib.b.${stamp}@nurviatest.example`,
  password: "StudyLibTest-2026-SecureB",
};

let learnerAAttemptId = "";

async function registerLearner(page: Page, account: typeof learnerA) {
  await page.goto("/sign-up");
  await page.locator("#name").fill(account.name);
  await page.locator("#email").fill(account.email);
  await page.locator("#password").fill(account.password);
  await page.locator("#confirmation").fill(account.password);
  await page.getByRole("button", { name: "Create learner account" }).click();
  await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible({ timeout: 30_000 });
}

async function signInLearner(page: Page, account: typeof learnerA) {
  await page.goto("/sign-in");
  await page.locator("#email").fill(account.email);
  await page.locator("#password").fill(account.password);
  await page.locator("form").getByRole("button", { name: /Sign In/i }).click();
  await page.waitForURL(/\/learner/, { timeout: 30_000 });
}

test.describe.configure({ mode: "serial" });

test.describe("Study Library & Three-Mode Learning Experience", () => {
  test("1. Register Learner A and Learner B", async ({ page }) => {
    await registerLearner(page, learnerA);
    await registerLearner(page, learnerB);
  });

  test("2. Discover, search, filter, save study set, and verify persistence & responsive viewports", async ({ page }) => {
    const pageErrors: string[] = [];
    const unexpected404s: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("response", (res) => {
      if (res.status() === 404) unexpected404s.push(`${res.status()} ${res.url()}`);
    });

    await signInLearner(page, learnerA);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/learner/library");

    await expect(page.getByRole("heading", { name: "Study Library" })).toBeVisible();
    const atiLink = page.getByRole("link", { name: /ATI Comprehensive Pharmacology Practice Exam/i }).first();
    const exitLink = page.getByRole("link", { name: /RN Comprehensive Predictor Exit Examination/i }).first();
    await expect(atiLink).toBeVisible({ timeout: 15_000 });
    await expect(exitLink).toBeVisible();

    // Expand academic & examination filters
    await page.getByRole("button", { name: /Academic & Examination Filters/i }).click();
    await expect(page.locator("#filter-school")).toBeVisible();
    await expect(page.locator("#filter-year")).toBeVisible();
    await expect(page.locator("#filter-season")).toBeVisible();
    await expect(page.locator("#filter-subject")).toBeVisible();
    await expect(page.locator("#filter-exam")).toBeVisible();

    // Filter by Subject if Pharmacology is present
    const subjectSelect = page.locator("#filter-subject");
    if ((await subjectSelect.locator('option[value="Pharmacology"]').count()) > 0) {
      await subjectSelect.selectOption("Pharmacology");
      await expect(atiLink).toBeVisible({ timeout: 15_000 });
      await subjectSelect.selectOption("");
    }

    // Search for Pharmacology
    const searchInput = page.getByPlaceholder("Search study sets, subjects, examinations or keywords...");
    await searchInput.fill("Pharmacology");
    await expect(atiLink).toBeVisible({ timeout: 15_000 });
    await searchInput.fill("");
    await expect(exitLink).toBeVisible({ timeout: 15_000 });

    // Save ATI Pharmacology to My Library via overflow menu
    const moreBtn = page.getByRole("button", { name: /More actions for ATI Comprehensive Pharmacology Practice Exam/i });
    await moreBtn.click();
    await page.getByRole("menuitem", { name: /Save to My Library/i }).click();

    // Verify in My Library and across page refresh
    await page.goto("/learner/my-exams");
    await expect(page.getByRole("heading", { name: "Saved Study Sets" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/ATI Comprehensive Pharmacology Practice Exam/i).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(/ATI Comprehensive Pharmacology Practice Exam/i).first()).toBeVisible({ timeout: 15_000 });

    // Desktop, Tablet & Mobile responsiveness check (no horizontal overflow)
    for (const vp of [
      { width: 1280, height: 800 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(vp);
      await page.goto("/learner/library");
      await expect(page.getByRole("heading", { name: "Study Library" })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(overflow).toBe(false);
    }

    expect(pageErrors).toEqual([]);
    if (unexpected404s.length > 0) {
      console.log("Observed 404s:", unexpected404s);
    }
  });

  test("3. Exam Mode from Study Library: launch, answer, flag, autosave, navigate, submit, history", async ({ page }) => {
    await signInLearner(page, learnerA);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/learner/library");

    // Verify Exam-only set disables Review and Tutor
    await expect(page.getByTitle("Review mode is not enabled for this study set.")).toBeDisabled();
    await expect(page.getByTitle("Tutor mode is not enabled for this study set.")).toBeDisabled();

    // Intercept start attempt response to verify Exam-mode answer-key confidentiality
    let startPayload: Record<string, unknown> | null = null;
    page.on("response", async (res) => {
      if (res.url().includes("/attempts/start/") && res.request().method() === "POST") {
        try {
          startPayload = await res.json();
        } catch {
          // ignore
        }
      }
    });

    // Launch Exam mode on ATI Pharmacology
    const atiCard = page.getByRole("link", { name: "ATI Comprehensive Pharmacology Practice Exam" }).locator("xpath=ancestor::div[contains(@class,'flex-col')][1]");
    await atiCard.getByRole("link", { name: "Exam", exact: true }).click();
    await page.waitForURL(/\/exam-session.*mode=Exam/, { timeout: 30_000 });

    const layoutHeading = page.getByRole("heading", { name: "Choose your navigation layout" });
    await layoutHeading.waitFor({ state: "visible", timeout: 5_000 }).then(
      () => page.getByRole("button", { name: /Sequential/i }).click(),
      () => {}
    );

    await expect(page.getByText("Item 1 of 2")).toBeVisible({ timeout: 15_000 });
    expect(startPayload).not.toBeNull();
    const rawJson = JSON.stringify(startPayload);
    expect(rawJson).not.toContain('"isCorrect":true');
    expect(rawJson).not.toContain('"generalRationale":"');

    // Answer Q1 and flag it
    await page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ }).click();
    const flagBtn = page.getByRole("button", { name: /Flag/i }).first();
    if ((await flagBtn.count()) > 0) {
      await flagBtn.click();
    }

    // Navigate to Q2 and answer
    await page.getByRole("button", { name: /Next Item/ }).click();
    await expect(page.getByText("Item 2 of 2")).toBeVisible();
    await page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ }).click();
    await page.getByRole("button", { name: /Fine hand tremors becoming coarse/ }).click();
    await page.getByRole("button", { name: /Slurred speech and muscle weakness/ }).click();

    await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 15_000 });

    // Navigate back to Q1 and verify persistence
    await page.getByRole("button", { name: /Previous/i }).click();
    await expect(page.getByText("Item 1 of 2")).toBeVisible();
    await expect(page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ })).toHaveClass(/ring-brand-teal|border-brand-teal/);

    // Submit exam
    await page.getByRole("button", { name: "Finish Exam" }).click();
    await page.getByRole("button", { name: "Confirm & Submit" }).click();
    await page.waitForURL(/\/learner\/attempts\//, { timeout: 30_000 });
    learnerAAttemptId = page.url().split("/").pop() || "";
    await expect(page.getByText("100%").first()).toBeVisible({ timeout: 15_000 });

    // Verify attempt appears in history
    await page.goto("/learner/history");
    await expect(page.getByText(/ATI Comprehensive Pharmacology Practice Exam/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("4. Review Mode from Study Library: inspect questions and rationales", async ({ page }) => {
    await signInLearner(page, learnerA);
    await page.goto("/learner/library");

    const atiCard = page.getByRole("link", { name: "ATI Comprehensive Pharmacology Practice Exam" }).locator("xpath=ancestor::div[contains(@class,'flex-col')][1]");
    await atiCard.getByRole("link", { name: "Review", exact: true }).click();
    await page.waitForURL(/\/exam-session.*mode=Review/, { timeout: 30_000 });

    await expect(page.getByText("Item 1 of 2")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/cardiac glycoside with positive inotropic/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("5. Tutor Mode from Study Library: progressive 6-stage learning", async ({ page }) => {
    await signInLearner(page, learnerA);
    await page.goto("/learner/library");

    const atiCard = page.getByRole("link", { name: "ATI Comprehensive Pharmacology Practice Exam" }).locator("xpath=ancestor::div[contains(@class,'flex-col')][1]");
    await atiCard.getByRole("link", { name: "Tutor", exact: true }).click();
    await page.waitForURL(/\/exam-session.*mode=Tutor/, { timeout: 30_000 });

    const layoutHeading = page.getByRole("heading", { name: "Choose your navigation layout" });
    await layoutHeading.waitFor({ state: "visible", timeout: 5_000 }).then(
      () => page.getByRole("button", { name: /Sequential/i }).click(),
      () => {}
    );

    await expect(page.getByText("Guided Tutor Mode")).toBeVisible({ timeout: 15_000 });
    // Stage 1: Independent thinking — Submit My Answer disabled until an answer is chosen
    await expect(page.getByRole("button", { name: "Submit My Answer" })).toBeDisabled();

    // Stage 2: First Hint
    await page.getByRole("button", { name: /Ask for a Hint/i }).click();
    await expect(page.getByText(/Stage 2/i)).toBeVisible({ timeout: 10_000 });

    // Stage 3: Guided Reasoning
    await page.getByRole("button", { name: /Help Me Understand/i }).click();
    await expect(page.getByText(/Stage 3/i)).toBeVisible({ timeout: 10_000 });

    // Stage 4, 5, 6: Select answer, evaluate, view explanation & takeaway
    let evalPayload: Record<string, unknown> | null = null;
    let evalReqBody: string | null = null;
    page.on("response", async (res) => {
      if (res.url().includes("/tutor/evaluate") && res.request().method() === "POST") {
        evalReqBody = res.request().postData();
        try {
          evalPayload = await res.json();
        } catch {
          // ignore
        }
      }
    });

    await page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ }).click();
    await page.getByRole("button", { name: "Submit My Answer" }).click();
    await expect(page.getByText(/Digoxin is a cardiac glycoside/i).first()).toBeVisible({ timeout: 15_000 });
    expect((evalPayload as { data?: { isCorrect?: boolean } } | null)?.data?.isCorrect).toBe(true);
    await expect(page.getByText(/Great clinical reasoning/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("6. Multi-account security: Learner B isolation & unauthenticated rejection", async ({ page }) => {
    // Unauthenticated API rejection
    const unauthSaved = await page.request.get(`${API_URL}/api/study-library?savedOnly=true`);
    expect(unauthSaved.status()).toBe(401);

    await signInLearner(page, learnerB);

    // Learner B's personal library must NOT include Learner A's saved study set
    await page.goto("/learner/my-exams");
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Your library is empty.")).toBeVisible();
    await expect(page.getByText(/ATI Comprehensive Pharmacology Practice Exam/i)).toHaveCount(0);

    // Learner B cannot access Learner A's attempt via API
    if (learnerAAttemptId) {
      const idorRes = await page.request.get(`${API_URL}/api/attempts/${learnerAAttemptId}/review`);
      expect([401, 403]).toContain(idorRes.status());
    }
  });
});
