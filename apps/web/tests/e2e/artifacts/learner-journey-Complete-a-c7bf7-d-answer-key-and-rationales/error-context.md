# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-journey.spec.ts >> Complete authenticated learner journey >> Step 8 — Review shows released answer key and rationales
- Location: tests\e2e\learner-journey.spec.ts:193:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Correct answer').first()
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Correct answer').first() with timeout 20000ms
  - waiting for getByText('Correct answer').first()

```

```yaml
- alert
- img
- text: NURVIA Education NURVIA — Your Path to Nursing Confidence. Next-Gen NCLEX, ATI & HESI preparation.
- banner:
  - link "NURVIA PATHWAY TO CONFIDENCE":
    - /url: /
    - img
    - text: NURVIA PATHWAY TO CONFIDENCE
  - navigation "Main Navigation":
    - link "Home":
      - /url: /
    - link "Exams":
      - /url: /exams
    - link "Study":
      - /url: /study
    - link "Care Plans":
      - /url: /care-plans
    - link "Mark K.":
      - /url: /mark-k
    - link "Community":
      - /url: /community
    - link "FAQ":
      - /url: /faq
    - link "NCLEX":
      - /url: /nclex
    - link "TEAS":
      - /url: /teas
  - button "Switch to dark theme":
    - img
  - link "Sign In":
    - /url: /sign-in
    - button "Sign In"
  - link "Sign Up":
    - /url: /sign-up
    - button "Sign Up"
  - link "Explore Exams":
    - /url: /exams
    - button "Explore Exams"
- main:
  - main:
    - heading "Welcome back" [level=1]
    - paragraph: Sign in to continue your nursing exam preparation.
    - text: Email address
    - textbox "Email address"
    - text: Password
    - textbox "Password"
    - button "Show password":
      - img
    - button "Sign In"
    - paragraph:
      - text: New to NURVIA?
      - link "Create an account":
        - /url: /sign-up
- contentinfo:
  - link "NURVIA PATHWAY TO CONFIDENCE":
    - /url: /
    - img
    - text: NURVIA PATHWAY TO CONFIDENCE
  - paragraph: NURVIA provides structured exam preparation, clinical judgment training, and personalized revision intelligence for nursing learners across ATI, HESI, NCLEX, and TEAS tracks.
  - img
  - text: Evidence-based clinical education architecture
  - heading "Exam Tracks" [level=4]
  - list:
    - listitem:
      - link "RN Examinations":
        - /url: /exams?track=RN
    - listitem:
      - link "LPN / PN Tracks":
        - /url: /exams?track=PN_LPN
    - listitem:
      - link "ATI Subject Sets":
        - /url: /exams?category=ATI
    - listitem:
      - link "HESI Specialties":
        - /url: /exams?category=HESI
    - listitem:
      - link "Exit Predictor Exams":
        - /url: /exams?category=ExitPredictor
    - listitem:
      - link "NCLEX-RN & PN":
        - /url: /nclex
    - listitem:
      - link "TEAS Prep":
        - /url: /teas
  - heading "Learning Tools" [level=4]
  - list:
    - listitem:
      - link "Study Hub":
        - /url: /study
    - listitem:
      - link "Care Plans":
        - /url: /care-plans
    - listitem:
      - link "Mark K. Review":
        - /url: /mark-k
    - listitem:
      - link "Student Community":
        - /url: /community
    - listitem:
      - link "Frequently Asked Questions":
        - /url: /faq
    - listitem:
      - link "AI Clinical Tutor":
        - /url: /learner/ai-tutor
  - heading "Platform Workspaces" [level=4]
  - list:
    - listitem:
      - link "Learner Dashboard":
        - /url: /learner
    - listitem:
      - link "Study Library":
        - /url: /learner/library
    - listitem:
      - link "Exam Experience Shell":
        - /url: /exam-session
    - listitem:
      - link "Design System Showcase":
        - /url: /design-system
  - paragraph: © 2026 NURVIA. All rights reserved. Your Path to Nursing Confidence.
  - paragraph: "Disclaimer: NURVIA is an independent educational prep platform and is not affiliated with or endorsed by ATI, HESI, or NCSBN. Rationales are intended solely for academic study."
```

# Test source

```ts
  95  |     await page.locator("#name").fill(learner.name);
  96  |     await page.locator("#email").fill(learner.email);
  97  |     await page.locator("#password").fill(learner.password);
  98  |     await page.locator("#confirmation").fill(learner.password);
  99  |     await page.getByRole("button", { name: "Create learner account" }).click();
  100 | 
  101 |     await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible();
  102 |     await shot(page, "02-sign-up-success");
  103 |   });
  104 | 
  105 |   test("Step 2b — Duplicate registration is handled safely", async ({ page }) => {
  106 |     await page.goto("/sign-up");
  107 |     await page.locator("#name").fill(learner.name);
  108 |     await page.locator("#email").fill(learner.email);
  109 |     await page.locator("#password").fill(learner.password);
  110 |     await page.locator("#confirmation").fill(learner.password);
  111 |     await page.getByRole("button", { name: "Create learner account" }).click();
  112 |     // Anti-enumeration: same success panel, no account duplication error surfaced
  113 |     await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible();
  114 |   });
  115 | 
  116 |   test("Step 3 — Sign In establishes the learner session", async ({ page }) => {
  117 |     await signInLearner(page);
  118 |     // Identity: sidebar shows the signed-in learner's own name
  119 |     await expect(page.getByText(learner.name).first()).toBeVisible();
  120 |     await shot(page, "04-learner-dashboard");
  121 |   });
  122 | 
  123 |   test("Step 4 — Dashboard shows persisted data and published exams from the backend", async ({ page }) => {
  124 |     await signInLearner(page);
  125 |     await expect(page.getByText(examTitle).first()).toBeVisible();
  126 |     // No staff workspace navigation for a learner
  127 |     await expect(page.locator('a[href^="/admin"]')).toHaveCount(0);
  128 |     await expect(page.getByRole("link", { name: "Question Bank" })).toHaveCount(0);
  129 |   });
  130 | 
  131 |   test("Steps 5-6 — Exam discovery, start, and answering with autosave + refresh recovery", async ({ page, browser }) => {
  132 |     await signInLearner(page);
  133 | 
  134 |     await page.goto("/learner/exams");
  135 |     await expect(page.getByText(examTitle).first()).toBeVisible();
  136 |     await shot(page, "05-exam-discovery");
  137 | 
  138 |     await page
  139 |       .locator(`div:has(h2:text-is("${examTitle}")) a:has-text("Start this exam")`)
  140 |       .first()
  141 |       .click();
  142 |     await page.waitForURL(/\/exam-session/, { timeout: 30_000 });
  143 | 
  144 |     // Q1: single-choice digoxin question — select the correct option by visible text
  145 |     await expect(page.getByText("Item 1 of 2")).toBeVisible();
  146 |     await page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ }).click();
  147 | 
  148 |     // Q2: SATA lithium toxicity — select the three correct options
  149 |     await page.getByRole("button", { name: /Next Item/ }).click();
  150 |     await expect(page.getByText("Item 2 of 2")).toBeVisible();
  151 |     await page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ }).click();
  152 |     await page.getByRole("button", { name: /Fine hand tremors becoming coarse/ }).click();
  153 |     await page.getByRole("button", { name: /Slurred speech and muscle weakness/ }).click();
  154 | 
  155 |     // Wait for autosave persistence indicator
  156 |     await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 15_000 });
  157 |     await shot(page, "06-exam-session-answered");
  158 | 
  159 |     // Refresh recovery: attempt and saved answers are rehydrated from the API (session restarts at item 1)
  160 |     await page.reload();
  161 |     await expect(page.getByText("Item 1 of 2")).toBeVisible({ timeout: 15_000 });
  162 |     await expect(page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ })).toHaveClass(/ring-brand-teal|border-brand-teal/, { timeout: 15_000 });
  163 |     await page.getByRole("button", { name: /Next Item/ }).click();
  164 |     await expect(page.getByText("Item 2 of 2")).toBeVisible();
  165 |     await expect(page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ })).toHaveClass(/ring-brand-teal|border-brand-teal/, { timeout: 15_000 });
  166 |     await shot(page, "06b-exam-session-after-refresh");
  167 |   });
  168 | 
  169 |   test("Step 7 — Submit exam and land on persisted result", async ({ page }) => {
  170 |     await signInLearner(page);
  171 | 
  172 |     await page.goto("/learner/exams");
  173 |     // Continuing the in-progress attempt: starting the same exam resumes the persisted attempt
  174 |     await page
  175 |       .locator(`div:has(h2:text-is("${examTitle}")) a:has-text("Start this exam")`)
  176 |       .first()
  177 |       .click();
  178 |     await page.waitForURL(/\/exam-session/, { timeout: 30_000 });
  179 |     await expect(page.getByText("Item 1 of 2")).toBeVisible();
  180 | 
  181 |     await page.getByRole("button", { name: "Finish Exam" }).click();
  182 |     await page.getByRole("button", { name: "Confirm & Submit" }).click();
  183 | 
  184 |     await page.waitForURL(/\/learner\/attempts\//, { timeout: 30_000 });
  185 |     attemptRef.id = page.url().split("/").pop() || "";
  186 |     await expect(page.getByText("Result and review")).toBeVisible();
  187 |     await expect(page.getByText("100%").first()).toBeVisible();
  188 |     await expect(page.getByText("2 correct", { exact: false })).toBeVisible();
  189 |     await shot(page, "07-result-summary");
  190 |     attemptRef.score = "100";
  191 |   });
  192 | 
  193 |   test("Step 8 — Review shows released answer key and rationales", async ({ page }) => {
  194 |     await page.goto(`/learner/attempts/${attemptRef.id}`);
> 195 |     await expect(page.getByText("Correct answer").first()).toBeVisible({ timeout: 20_000 });
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  196 |     await expect(page.getByText(/Clinical Rationale|Overall Clinical Rationale/i).first()).toBeVisible();
  197 |     await shot(page, "08-review-answer-key");
  198 |   });
  199 | 
  200 |   test("Steps 10-11 — Profile update persists and sign out ends the session", async ({ page }) => {
  201 |     await signInLearner(page);
  202 | 
  203 |     await page.goto("/learner/account");
  204 |     await expect(page.locator("#profile-name")).toHaveValue(learner.name);
  205 |     const updatedName = "Journey Learner Updated";
  206 |     await page.locator("#profile-name").fill(updatedName);
  207 |     await page.getByRole("button", { name: "Save profile" }).click();
  208 |     await expect(page.getByText("Your profile changes have been saved.")).toBeVisible();
  209 |     await shot(page, "09-profile-updated");
  210 | 
  211 |     await page.reload();
  212 |     await expect(page.locator("#profile-name")).toHaveValue(updatedName);
  213 | 
  214 |     // Email field must be read-only and no role control may exist
  215 |     await expect(page.locator("#profile-email")).toBeDisabled();
  216 | 
  217 |     await page.goto("/learner");
  218 |     await page.getByRole("button", { name: "Sign Out" }).first().click();
  219 |     await page.waitForURL(/localhost:3000\/$|:3000\//, { timeout: 30_000 });
  220 | 
  221 |     // Protected page requires authentication again
  222 |     await page.goto("/learner");
  223 |     await page.waitForURL(/\/sign-in/, { timeout: 30_000 });
  224 |     await shot(page, "10-signed-out-redirect");
  225 | 
  226 |     // Protected API rejects unauthenticated access
  227 |     const me = await page.request.get(`${process.env.E2E_API_URL || "http://localhost:5055"}/api/auth/me`);
  228 |     expect(me.status()).toBe(401);
  229 |   });
  230 | });
  231 | 
```