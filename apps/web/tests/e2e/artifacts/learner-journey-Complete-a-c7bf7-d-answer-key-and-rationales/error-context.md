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

Locator: getByText(/Clinical Rationale|Overall Clinical Rationale/i).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/Clinical Rationale|Overall Clinical Rationale/i).first() with timeout 15000ms
  - waiting for getByText(/Clinical Rationale|Overall Clinical Rationale/i).first()

```

```yaml
- alert
- complementary:
  - link "NURVIA PATHWAY TO CONFIDENCE":
    - /url: /learner
    - img
    - text: NURVIA PATHWAY TO CONFIDENCE
  - button "Collapse sidebar":
    - img
  - text: OVERVIEW
  - link "Dashboard":
    - /url: /learner
    - img
    - text: Dashboard
  - link "Performance":
    - /url: /learner/performance
    - img
    - text: Performance
  - link "Study Planner New":
    - /url: /learner/planner
    - img
    - text: Study Planner New
  - text: EXAMS
  - link "RN Exams":
    - /url: /learner/exams?track=RN
    - img
    - text: RN Exams
  - button "Toggle RN Exams subcategories":
    - img
  - link "ATI Assessments":
    - /url: /learner/exams?track=RN&category=ATI
  - link "HESI Specialty":
    - /url: /learner/exams?track=RN&category=HESI
  - link "Regular Courses":
    - /url: /learner/exams?track=RN&category=RegularCourse
  - link "Certifications":
    - /url: /learner/exams?track=RN&category=Certification
  - link "LPN / PN Exams":
    - /url: /learner/exams?track=PN_LPN
    - img
    - text: LPN / PN Exams
  - button "Toggle LPN / PN Exams subcategories":
    - img
  - link "RN Exit Predictor":
    - /url: /learner/exams?track=RN_Exit
    - img
    - text: RN Exit Predictor
  - button "Toggle RN Exit subcategories":
    - img
  - link "LPN Exit Predictor":
    - /url: /learner/exams?track=PN_Exit
    - img
    - text: LPN Exit Predictor
  - button "Toggle LPN Exit subcategories":
    - img
  - text: PRACTICE
  - link "Study Library":
    - /url: /learner/library
    - img
    - text: Study Library
  - link "My Library":
    - /url: /learner/my-exams
    - img
    - text: My Library
  - link "Custom Practice":
    - /url: /learner/custom-practice
    - img
    - text: Custom Practice
  - link "Attempt History":
    - /url: /learner/history
    - img
    - text: Attempt History
  - text: RESOURCES
  - link "Study Hub":
    - /url: /learner/hub
    - img
    - text: Study Hub
  - link "Study Guides":
    - /url: /learner/guides
    - img
    - text: Study Guides
  - link "Flashcards SRS":
    - /url: /learner/flashcards
    - img
    - text: Flashcards SRS
  - link "Care Plans":
    - /url: /learner/care-plans
    - img
    - text: Care Plans
  - link "Calculators":
    - /url: /learner/calculators
    - img
    - text: Calculators
  - text: PERSONALIZED LEARNING
  - link "AI Tutor AI":
    - /url: /learner/ai-tutor
    - img
    - text: AI Tutor AI
  - link "Saved Questions":
    - /url: /learner/saved-questions
    - img
    - text: Saved Questions
  - link "Community":
    - /url: /learner/community
    - img
    - text: Community
  - text: ACCOUNT
  - link "My Account":
    - /url: /learner/account
    - img
    - text: My Account
  - link "Settings":
    - /url: /learner/settings
    - img
    - text: Settings
  - link "Subscription":
    - /url: /learner/subscription
    - img
    - text: Subscription
  - paragraph: Journey Test Learner
  - link "Browse Practice Exams":
    - /url: /learner/exams
    - button "Browse Practice Exams"
- banner:
  - img
  - searchbox "Search study sets, topics, or keywords..."
  - button "Switch to dark theme":
    - img
  - button "Sign Out"
  - text: JT Journey Test Learner journey.1794377614342@nurviatest.example
- main:
  - paragraph: Persisted exam result
  - heading "Result and review" [level=1]
  - link "Back to dashboard":
    - /url: /learner
    - button "Back to dashboard"
  - heading "ATI Comprehensive Pharmacology Practice Exam" [level=2]
  - paragraph: Submitted 11/11/2026, 9:14:47 AM
  - paragraph: Score
  - paragraph: 100%
  - paragraph: Met configured passing score (78%).
  - paragraph: Questions correct
  - paragraph: 2 / 2
  - paragraph: Time recorded
  - paragraph: 0 min
  - heading "Question outcome distribution" [level=2]
  - paragraph: 2 correct, 0 incorrect, and 0 unanswered out of 2 questions.
  - text: Correct 2
  - 'img "Correct: 2 of 2"'
  - text: Incorrect 0
  - 'img "Incorrect: 0 of 2"'
  - text: Unanswered 0
  - 'img "Unanswered: 0 of 2"'
  - heading "Question review" [level=2]
  - paragraph: Question 1
  - text: Correct
  - paragraph: A nurse is preparing to administer digoxin 0.25 mg PO to an adult client diagnosed with heart failure. Which clinical assessment is a priority before administering this medication?
  - list:
    - listitem:
      - text: Measure the client's blood pressure in both arms
      - paragraph: Blood pressure is monitored but apical heart rate is the decisive withholding parameter.
    - listitem:
      - text: Auscultate the apical pulse rate for one full minuteCorrect answer · Your selection
      - paragraph: "Correct: Digoxin must be withheld if the apical heart rate is below 60 bpm in adults."
    - listitem:
      - text: Check the client's capillary blood glucose level
      - paragraph: Digoxin does not directly influence acute blood glucose.
    - listitem:
      - text: Check the client's most recent sodium laboratory value
      - paragraph: Potassium (hypokalemia), not sodium, potentiates digoxin toxicity.
  - paragraph: Digoxin is a cardiac glycoside with positive inotropic and negative chronotropic effects. The apical pulse must be counted for a full 60 seconds before administration. If the apical rate is less than 60 beats/min in an adult (or <90 in infants), the dose must be withheld and the healthcare provider notified to prevent fatal bradyarrhythmias.
  - paragraph: Question 2
  - text: Correct
  - paragraph: A nurse is educating a client who is newly prescribed lithium carbonate for bipolar I disorder. Which clinical signs should the nurse teach the client to identify as early manifestations of lithium toxicity? (Select all that apply.)
  - list:
    - listitem:
      - text: Nausea, vomiting, and diarrheaCorrect answer · Your selection
      - paragraph: Early gastrointestinal toxicity cue.
    - listitem:
      - text: Fine hand tremors becoming coarseCorrect answer · Your selection
      - paragraph: Early neuromuscular cue of toxic accumulation.
    - listitem:
      - text: Constipation and urinary retention
      - paragraph: Lithium typically causes polyuria and loose stools, not retention.
    - listitem:
      - text: Slurred speech and muscle weaknessCorrect answer · Your selection
      - paragraph: Early central nervous system impairment cue.
    - listitem:
      - text: Hypertensive crisis and cardiac arrest
      - paragraph: Hypertensive crisis is characteristic of MAOI interactions, not early lithium toxicity.
  - paragraph: Lithium has a narrow therapeutic window (0.6 to 1.2 mEq/L). Early manifestations of toxicity (serum level 1.5 to 2.0 mEq/L) include gastrointestinal disturbances (nausea, vomiting, diarrhea), neurological symptoms (fine hand tremors, muscle weakness, lethargy), and slurred speech. Polyuria and mild thirst are common side effects, but gross ataxia and seizures occur in severe toxicity (>2.5 mEq/L).
```

# Test source

```ts
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
  194 |     await signInLearner(page);
  195 |     await page.goto(`/learner/attempts/${attemptRef.id}`);
  196 |     await expect(page.getByText("Correct answer").first()).toBeVisible({ timeout: 20_000 });
> 197 |     await expect(page.getByText(/Clinical Rationale|Overall Clinical Rationale/i).first()).toBeVisible();
      |                                                                                            ^ Error: expect(locator).toBeVisible() failed
  198 |     await shot(page, "08-review-answer-key");
  199 |   });
  200 | 
  201 |   test("Steps 10-11 — Profile update persists and sign out ends the session", async ({ page }) => {
  202 |     await signInLearner(page);
  203 | 
  204 |     await page.goto("/learner/account");
  205 |     await expect(page.locator("#profile-name")).toHaveValue(learner.name);
  206 |     const updatedName = "Journey Learner Updated";
  207 |     await page.locator("#profile-name").fill(updatedName);
  208 |     await page.getByRole("button", { name: "Save profile" }).click();
  209 |     await expect(page.getByText("Your profile changes have been saved.")).toBeVisible();
  210 |     await shot(page, "09-profile-updated");
  211 | 
  212 |     await page.reload();
  213 |     await expect(page.locator("#profile-name")).toHaveValue(updatedName);
  214 | 
  215 |     // Email field must be read-only and no role control may exist
  216 |     await expect(page.locator("#profile-email")).toBeDisabled();
  217 | 
  218 |     await page.goto("/learner");
  219 |     await page.getByRole("button", { name: "Sign Out" }).first().click();
  220 |     await page.waitForURL(/localhost:3000\/$|:3000\//, { timeout: 30_000 });
  221 | 
  222 |     // Protected page requires authentication again
  223 |     await page.goto("/learner");
  224 |     await page.waitForURL(/\/sign-in/, { timeout: 30_000 });
  225 |     await shot(page, "10-signed-out-redirect");
  226 | 
  227 |     // Protected API rejects unauthenticated access
  228 |     const me = await page.request.get(`${process.env.E2E_API_URL || "http://localhost:5055"}/api/auth/me`);
  229 |     expect(me.status()).toBe(401);
  230 |   });
  231 | });
  232 | 
```