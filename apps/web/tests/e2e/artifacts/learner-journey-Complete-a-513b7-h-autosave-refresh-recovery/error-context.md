# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-journey.spec.ts >> Complete authenticated learner journey >> Steps 5-6 — Exam discovery, start, and answering with autosave + refresh recovery
- Location: tests\e2e\learner-journey.spec.ts:131:3

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: getByRole('button', { name: /Auscultate the apical pulse rate for one full minute/ })
Expected pattern: /ring-brand-teal|border-brand-teal/
Received string:  "w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5 border-border bg-background hover:bg-surface-muted text-foreground"
Timeout: 15000ms

Call log:
  - Expect "toHaveClass" getByRole('button', { name: /Auscultate the apical pulse rate for one full minute/ }) with timeout 15000ms
  - waiting for getByRole('button', { name: /Auscultate the apical pulse rate for one full minute/ })
    33 × locator resolved to <button type="button" class="w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5 border-border bg-background hover:bg-surface-muted text-foreground">…</button>
       - unexpected value "w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5 border-border bg-background hover:bg-surface-muted text-foreground"

```

```yaml
- button "B Auscultate the apical pulse rate for one full minute"
```

# Test source

```ts
  62  |     await shot(page, "01-hero-desktop");
  63  |   });
  64  | 
  65  |   test("Step 1b — Mobile hero layout", async ({ page }) => {
  66  |     await page.setViewportSize({ width: 390, height: 844 });
  67  |     await page.goto("/");
  68  |     await expect(
  69  |       page.getByRole("heading", { level: 1, name: "Turn Practice Into ATI and HESI Readiness" })
  70  |     ).toBeVisible();
  71  |     await expect(page.getByRole("region", { name: "Quick Practice" })).toBeVisible();
  72  |     await shot(page, "01b-hero-mobile");
  73  |   });
  74  | 
  75  |   test("Step 1c — Quick Practice preview: select, learn, navigate", async ({ page }) => {
  76  |     await page.goto("/");
  77  |     const quickPractice = page.getByRole("region", { name: "Quick Practice" });
  78  | 
  79  |     // Select an option → learn-as-you-go rationale is revealed only after selection
  80  |     await quickPractice.getByRole("radio", { name: /To monitor the time it takes for your blood to clot/ }).click();
  81  |     await expect(quickPractice.getByText(/Clinical Reasoning & Rationale/)).toBeVisible();
  82  | 
  83  |     // Keep Going advances to the next sample question; Back returns
  84  |     await quickPractice.getByRole("button", { name: /Keep Going/ }).click();
  85  |     await expect(quickPractice.getByText(/Question 2 of 3/)).toBeVisible();
  86  |     await quickPractice.getByRole("button", { name: "Back" }).click();
  87  |     await expect(quickPractice.getByText(/Question 1 of 3/)).toBeVisible();
  88  |   });
  89  | 
  90  |   test("Step 2 — Registration persists a learner account", async ({ page }) => {
  91  |     await page.goto("/");
  92  |     await page.getByRole("link", { name: "Sign Up" }).first().click();
  93  |     await expect(page).toHaveURL(/\/sign-up/);
  94  | 
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
> 162 |     await expect(page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ })).toHaveClass(/ring-brand-teal|border-brand-teal/, { timeout: 15_000 });
      |                                                                                                              ^ Error: expect(locator).toHaveClass(expected) failed
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
  197 |     // The review page renders the general rationale text without a
  198 |     // "Clinical Rationale" heading, so anchor on the seeded rationale content.
  199 |     await expect(page.getByText(/cardiac glycoside with positive inotropic/i).first()).toBeVisible();
  200 |     await shot(page, "08-review-answer-key");
  201 |   });
  202 | 
  203 |   test("Steps 10-11 — Profile update persists and sign out ends the session", async ({ page }) => {
  204 |     await signInLearner(page);
  205 | 
  206 |     await page.goto("/learner/account");
  207 |     await expect(page.locator("#profile-name")).toHaveValue(learner.name);
  208 |     const updatedName = "Journey Learner Updated";
  209 |     await page.locator("#profile-name").fill(updatedName);
  210 |     await page.getByRole("button", { name: "Save profile" }).click();
  211 |     await expect(page.getByText("Your profile changes have been saved.")).toBeVisible();
  212 |     await shot(page, "09-profile-updated");
  213 | 
  214 |     await page.reload();
  215 |     await expect(page.locator("#profile-name")).toHaveValue(updatedName);
  216 | 
  217 |     // Email field must be read-only (not editable) and no role control may exist
  218 |     await expect(page.locator("#profile-email")).not.toBeEditable();
  219 | 
  220 |     await page.goto("/learner");
  221 |     await page.getByRole("button", { name: "Sign Out" }).first().click();
  222 |     await page.waitForURL(/localhost:3000\/$|:3000\//, { timeout: 30_000 });
  223 | 
  224 |     // Protected page requires authentication again
  225 |     await page.goto("/learner");
  226 |     await page.waitForURL(/\/sign-in/, { timeout: 30_000 });
  227 |     await shot(page, "10-signed-out-redirect");
  228 | 
  229 |     // Protected API rejects unauthenticated access
  230 |     const me = await page.request.get(`${process.env.E2E_API_URL || "http://localhost:5055"}/api/auth/me`);
  231 |     expect(me.status()).toBe(401);
  232 |   });
  233 | });
  234 | 
```