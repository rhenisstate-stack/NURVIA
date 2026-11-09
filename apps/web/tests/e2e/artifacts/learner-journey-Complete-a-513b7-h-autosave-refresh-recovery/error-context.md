# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-journey.spec.ts >> Complete authenticated learner journey >> Steps 5-6 — Exam discovery, start, and answering with autosave + refresh recovery
- Location: tests\e2e\learner-journey.spec.ts:105:3

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
  36  |     await expect(page.getByText("Nursing exam preparation, reimagined", { exact: false })).toBeVisible();
  37  |     await expect(page.getByText("Build clinical confidence through focused practice", { exact: false })).toBeVisible();
  38  |     await expect(page.getByRole("link", { name: /Quick Practice/ })).toBeVisible();
  39  | 
  40  |     const startLink = page.getByRole("link", { name: /Start Practicing/ }).first();
  41  |     await expect(startLink).toBeVisible();
  42  |     await expect(startLink).toHaveAttribute("href", /\/sign-up/);
  43  | 
  44  |     const exploreButton = page.getByRole("main").getByRole("button", { name: "Explore Exams" });
  45  |     await expect(exploreButton).toBeVisible();
  46  |     // Secondary CTA stroke must be visible at rest
  47  |     await expect(exploreButton).toHaveClass(/border-2/);
  48  | 
  49  |     // Navbar auth links open dedicated pages
  50  |     await expect(page.getByRole("link", { name: "Sign In" }).first()).toBeVisible();
  51  |     await expect(page.getByRole("link", { name: "Sign Up" }).first()).toBeVisible();
  52  | 
  53  |     await shot(page, "01-hero-desktop");
  54  |   });
  55  | 
  56  |   test("Step 1b — Mobile hero layout", async ({ page }) => {
  57  |     await page.setViewportSize({ width: 390, height: 844 });
  58  |     await page.goto("/");
  59  |     await expect(page.getByRole("heading", { level: 1, name: "Your Path to Nursing Confidence." })).toBeVisible();
  60  |     await expect(page.getByRole("link", { name: /Quick Practice/ })).toBeVisible();
  61  |     await shot(page, "01b-hero-mobile");
  62  |   });
  63  | 
  64  |   test("Step 2 — Registration persists a learner account", async ({ page }) => {
  65  |     await page.goto("/");
  66  |     await page.getByRole("link", { name: "Sign Up" }).first().click();
  67  |     await expect(page).toHaveURL(/\/sign-up/);
  68  | 
  69  |     await page.locator("#name").fill(learner.name);
  70  |     await page.locator("#email").fill(learner.email);
  71  |     await page.locator("#password").fill(learner.password);
  72  |     await page.locator("#confirmation").fill(learner.password);
  73  |     await page.getByRole("button", { name: "Create learner account" }).click();
  74  | 
  75  |     await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible();
  76  |     await shot(page, "02-sign-up-success");
  77  |   });
  78  | 
  79  |   test("Step 2b — Duplicate registration is handled safely", async ({ page }) => {
  80  |     await page.goto("/sign-up");
  81  |     await page.locator("#name").fill(learner.name);
  82  |     await page.locator("#email").fill(learner.email);
  83  |     await page.locator("#password").fill(learner.password);
  84  |     await page.locator("#confirmation").fill(learner.password);
  85  |     await page.getByRole("button", { name: "Create learner account" }).click();
  86  |     // Anti-enumeration: same success panel, no account duplication error surfaced
  87  |     await expect(page.getByRole("button", { name: "Go to Sign In" })).toBeVisible();
  88  |   });
  89  | 
  90  |   test("Step 3 — Sign In establishes the learner session", async ({ page }) => {
  91  |     await signInLearner(page);
  92  |     // Identity: sidebar shows the signed-in learner's own name
  93  |     await expect(page.getByText(learner.name).first()).toBeVisible();
  94  |     await shot(page, "04-learner-dashboard");
  95  |   });
  96  | 
  97  |   test("Step 4 — Dashboard shows persisted data and published exams from the backend", async ({ page }) => {
  98  |     await signInLearner(page);
  99  |     await expect(page.getByText(examTitle).first()).toBeVisible();
  100 |     // No staff workspace navigation for a learner
  101 |     await expect(page.locator('a[href^="/admin"]')).toHaveCount(0);
  102 |     await expect(page.getByRole("link", { name: "Question Bank" })).toHaveCount(0);
  103 |   });
  104 | 
  105 |   test("Steps 5-6 — Exam discovery, start, and answering with autosave + refresh recovery", async ({ page, browser }) => {
  106 |     await signInLearner(page);
  107 | 
  108 |     await page.goto("/learner/exams");
  109 |     await expect(page.getByText(examTitle).first()).toBeVisible();
  110 |     await shot(page, "05-exam-discovery");
  111 | 
  112 |     await page
  113 |       .locator(`div:has(h2:text-is("${examTitle}")) a:has-text("Start this exam")`)
  114 |       .first()
  115 |       .click();
  116 |     await page.waitForURL(/\/exam-session/, { timeout: 30_000 });
  117 | 
  118 |     // Q1: single-choice digoxin question — select the correct option by visible text
  119 |     await expect(page.getByText("Item 1 of 2")).toBeVisible();
  120 |     await page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ }).click();
  121 | 
  122 |     // Q2: SATA lithium toxicity — select the three correct options
  123 |     await page.getByRole("button", { name: /Next Item/ }).click();
  124 |     await expect(page.getByText("Item 2 of 2")).toBeVisible();
  125 |     await page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ }).click();
  126 |     await page.getByRole("button", { name: /Fine hand tremors becoming coarse/ }).click();
  127 |     await page.getByRole("button", { name: /Slurred speech and muscle weakness/ }).click();
  128 | 
  129 |     // Wait for autosave persistence indicator
  130 |     await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 15_000 });
  131 |     await shot(page, "06-exam-session-answered");
  132 | 
  133 |     // Refresh recovery: attempt and saved answers are rehydrated from the API (session restarts at item 1)
  134 |     await page.reload();
  135 |     await expect(page.getByText("Item 1 of 2")).toBeVisible({ timeout: 15_000 });
> 136 |     await expect(page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ })).toHaveClass(/ring-brand-teal|border-brand-teal/, { timeout: 15_000 });
      |                                                                                                              ^ Error: expect(locator).toHaveClass(expected) failed
  137 |     await page.getByRole("button", { name: /Next Item/ }).click();
  138 |     await expect(page.getByText("Item 2 of 2")).toBeVisible();
  139 |     await expect(page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ })).toHaveClass(/ring-brand-teal|border-brand-teal/, { timeout: 15_000 });
  140 |     await shot(page, "06b-exam-session-after-refresh");
  141 |   });
  142 | 
  143 |   test("Step 7 — Submit exam and land on persisted result", async ({ page }) => {
  144 |     await signInLearner(page);
  145 | 
  146 |     await page.goto("/learner/exams");
  147 |     // Continuing the in-progress attempt: starting the same exam resumes the persisted attempt
  148 |     await page
  149 |       .locator(`div:has(h2:text-is("${examTitle}")) a:has-text("Start this exam")`)
  150 |       .first()
  151 |       .click();
  152 |     await page.waitForURL(/\/exam-session/, { timeout: 30_000 });
  153 |     await expect(page.getByText("Item 1 of 2")).toBeVisible();
  154 | 
  155 |     await page.getByRole("button", { name: "Finish Exam" }).click();
  156 |     await page.getByRole("button", { name: "Confirm & Submit" }).click();
  157 | 
  158 |     await page.waitForURL(/\/learner\/attempts\//, { timeout: 30_000 });
  159 |     attemptRef.id = page.url().split("/").pop() || "";
  160 |     await expect(page.getByText("Result and review")).toBeVisible();
  161 |     await expect(page.getByText("100%").first()).toBeVisible();
  162 |     await expect(page.getByText("2 correct", { exact: false })).toBeVisible();
  163 |     await shot(page, "07-result-summary");
  164 |     attemptRef.score = "100";
  165 |   });
  166 | 
  167 |   test("Step 8 — Review shows released answer key and rationales", async ({ page }) => {
  168 |     await page.goto(`/learner/attempts/${attemptRef.id}`);
  169 |     await expect(page.getByText("Correct answer").first()).toBeVisible({ timeout: 20_000 });
  170 |     await expect(page.getByText(/Clinical Rationale|Overall Clinical Rationale/i).first()).toBeVisible();
  171 |     await shot(page, "08-review-answer-key");
  172 |   });
  173 | 
  174 |   test("Steps 10-11 — Profile update persists and sign out ends the session", async ({ page }) => {
  175 |     await signInLearner(page);
  176 | 
  177 |     await page.goto("/learner/account");
  178 |     await expect(page.locator("#profile-name")).toHaveValue(learner.name);
  179 |     const updatedName = "Journey Learner Updated";
  180 |     await page.locator("#profile-name").fill(updatedName);
  181 |     await page.getByRole("button", { name: "Save profile" }).click();
  182 |     await expect(page.getByText("Your profile changes have been saved.")).toBeVisible();
  183 |     await shot(page, "09-profile-updated");
  184 | 
  185 |     await page.reload();
  186 |     await expect(page.locator("#profile-name")).toHaveValue(updatedName);
  187 | 
  188 |     // Email field must be read-only and no role control may exist
  189 |     await expect(page.locator("#profile-email")).toBeDisabled();
  190 | 
  191 |     await page.goto("/learner");
  192 |     await page.getByRole("button", { name: "Sign Out" }).first().click();
  193 |     await page.waitForURL(/localhost:3000\/$|:3000\//, { timeout: 30_000 });
  194 | 
  195 |     // Protected page requires authentication again
  196 |     await page.goto("/learner");
  197 |     await page.waitForURL(/\/sign-in/, { timeout: 30_000 });
  198 |     await shot(page, "10-signed-out-redirect");
  199 | 
  200 |     // Protected API rejects unauthenticated access
  201 |     const me = await page.request.get(`${process.env.E2E_API_URL || "http://localhost:5055"}/api/auth/me`);
  202 |     expect(me.status()).toBe(401);
  203 |   });
  204 | });
  205 | 
```