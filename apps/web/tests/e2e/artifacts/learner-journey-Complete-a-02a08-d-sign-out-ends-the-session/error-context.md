# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner-journey.spec.ts >> Complete authenticated learner journey >> Steps 10-11 — Profile update persists and sign out ends the session
- Location: tests\e2e\learner-journey.spec.ts:203:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - alert [ref=f4e2]
  - generic [ref=f4e3]:
    - complementary [ref=f4e4]:
      - generic [ref=f4e5]:
        - link "NURVIA PATHWAY TO CONFIDENCE" [ref=f4e6] [cursor=pointer]:
          - /url: /learner
          - generic [ref=f4e14]:
            - generic [ref=f4e15]: NURVIA
            - generic [ref=f4e16]: PATHWAY TO CONFIDENCE
        - button "Collapse sidebar" [ref=f4e18] [cursor=pointer]
      - generic [ref=f4e21]:
        - generic [ref=f4e22]:
          - generic [ref=f4e23]: OVERVIEW
          - link "Dashboard" [ref=f4e26] [cursor=pointer]:
            - /url: /learner
          - link "Performance" [ref=f4e35] [cursor=pointer]:
            - /url: /learner/performance
          - link "Study Planner New" [ref=f4e42] [cursor=pointer]:
            - /url: /learner/planner
            - generic [ref=f4e46]: Study Planner
            - generic [ref=f4e47]: New
        - generic [ref=f4e48]:
          - generic [ref=f4e49]: EXAMS
          - generic [ref=f4e50]:
            - generic [ref=f4e51]:
              - link "RN Exams" [ref=f4e52] [cursor=pointer]:
                - /url: /learner/exams?track=RN
              - button "Toggle RN Exams subcategories" [ref=f4e57] [cursor=pointer]
            - generic [ref=f4e60]:
              - link "ATI Assessments" [ref=f4e61] [cursor=pointer]:
                - /url: /learner/exams?track=RN&category=ATI
              - link "HESI Specialty" [ref=f4e62] [cursor=pointer]:
                - /url: /learner/exams?track=RN&category=HESI
              - link "Regular Courses" [ref=f4e63] [cursor=pointer]:
                - /url: /learner/exams?track=RN&category=RegularCourse
              - link "Certifications" [ref=f4e64] [cursor=pointer]:
                - /url: /learner/exams?track=RN&category=Certification
          - generic [ref=f4e66]:
            - link "LPN / PN Exams" [ref=f4e67] [cursor=pointer]:
              - /url: /learner/exams?track=PN_LPN
            - button "Toggle LPN / PN Exams subcategories" [ref=f4e73] [cursor=pointer]
          - generic [ref=f4e77]:
            - link "RN Exit Predictor" [ref=f4e78] [cursor=pointer]:
              - /url: /learner/exams?track=RN_Exit
              - generic [ref=f4e82]: RN Exit
              - generic [ref=f4e83]: Predictor
            - button "Toggle RN Exit subcategories" [ref=f4e84] [cursor=pointer]
          - generic [ref=f4e88]:
            - link "LPN Exit Predictor" [ref=f4e89] [cursor=pointer]:
              - /url: /learner/exams?track=PN_Exit
              - generic [ref=f4e93]: LPN Exit
              - generic [ref=f4e94]: Predictor
            - button "Toggle LPN Exit subcategories" [ref=f4e95] [cursor=pointer]
        - generic [ref=f4e98]:
          - generic [ref=f4e99]: PRACTICE
          - link "Study Library" [ref=f4e102] [cursor=pointer]:
            - /url: /learner/library
          - link "My Library" [ref=f4e108] [cursor=pointer]:
            - /url: /learner/my-exams
          - link "Custom Practice" [ref=f4e115] [cursor=pointer]:
            - /url: /learner/custom-practice
          - link "Attempt History" [ref=f4e122] [cursor=pointer]:
            - /url: /learner/history
        - generic [ref=f4e128]:
          - generic [ref=f4e129]: RESOURCES
          - link "Study Hub" [ref=f4e132] [cursor=pointer]:
            - /url: /learner/hub
          - link "Study Guides" [ref=f4e140] [cursor=pointer]:
            - /url: /learner/guides
          - link "Flashcards SRS" [ref=f4e147] [cursor=pointer]:
            - /url: /learner/flashcards
            - generic [ref=f4e152]: Flashcards
            - generic [ref=f4e153]: SRS
          - link "Care Plans" [ref=f4e156] [cursor=pointer]:
            - /url: /learner/care-plans
          - link "Calculators" [ref=f4e165] [cursor=pointer]:
            - /url: /learner/calculators
        - generic [ref=f4e169]:
          - generic [ref=f4e170]: PERSONALIZED LEARNING
          - link "AI Tutor AI" [ref=f4e173] [cursor=pointer]:
            - /url: /learner/ai-tutor
            - generic [ref=f4e177]: AI Tutor
            - generic [ref=f4e178]: AI
          - link "Saved Questions" [ref=f4e181] [cursor=pointer]:
            - /url: /learner/saved-questions
          - link "Community" [ref=f4e187] [cursor=pointer]:
            - /url: /learner/community
        - generic [ref=f4e194]:
          - generic [ref=f4e195]: ACCOUNT
          - link "My Account" [ref=f4e198] [cursor=pointer]:
            - /url: /learner/account
          - link "Settings" [ref=f4e205] [cursor=pointer]:
            - /url: /learner/settings
          - link "Subscription" [ref=f4e212] [cursor=pointer]:
            - /url: /learner/subscription
      - generic [ref=f4e217]:
        - paragraph [ref=f4e218]: Journey Learner Updated
        - link [ref=f4e219] [cursor=pointer]:
          - /url: /learner/exams
          - button "Browse Practice Exams" [ref=f4e220]
    - generic [ref=f4e221]:
      - banner [ref=f4e222]:
        - searchbox "Search study sets, topics, or keywords..." [ref=f4e228]
        - generic [ref=f4e229]:
          - button "Switch to dark theme" [ref=f4e230] [cursor=pointer]
          - button "Sign Out" [ref=f4e233] [cursor=pointer]
          - generic [ref=f4e234]:
            - generic [ref=f4e235]: JL
            - generic [ref=f4e236]:
              - generic [ref=f4e237]: Journey Learner Updated
              - generic [ref=f4e238]: journey.1794379340554@nurviatest.example
      - main [ref=f4e239]:
        - generic [ref=f4e240]:
          - generic [ref=f4e241]:
            - paragraph [ref=f4e242]: Learner dashboard
            - heading "Welcome, Journey Learner Updated" [level=1] [ref=f4e243]
            - paragraph [ref=f4e244]: Continue an in-progress attempt or choose a published exam. Your activity and results are drawn from your saved account data.
          - region "Your progress" [ref=f4e245]:
            - generic [ref=f4e246]:
              - paragraph [ref=f4e247]: Completed attempts
              - paragraph [ref=f4e248]: "1"
            - generic [ref=f4e249]:
              - paragraph [ref=f4e250]: Average recorded score
              - paragraph [ref=f4e251]: 100%
            - generic [ref=f4e252]:
              - paragraph [ref=f4e253]: Available exams
              - paragraph [ref=f4e254]: "2"
          - generic [ref=f4e255]:
            - generic [ref=f4e256]:
              - heading "Published exams" [level=2] [ref=f4e257]
              - link "View exam library" [ref=f4e258] [cursor=pointer]:
                - /url: /learner/exams
            - generic [ref=f4e259]:
              - generic [ref=f4e260]:
                - generic [ref=f4e261]:
                  - paragraph [ref=f4e262]: RN_Exit · ExitPredictor
                  - heading "RN Comprehensive Predictor Exit Examination" [level=3] [ref=f4e263]
                  - paragraph [ref=f4e264]: Comprehensive multi-specialty exit exam measuring readiness for NCLEX-RN licensure.
                  - paragraph [ref=f4e265]: 3 questions · 90 minutes
                - link [ref=f4e266] [cursor=pointer]:
                  - /url: /exam-session?examId=cb716374-780f-45c9-80cf-9307fcc8df1a
                  - button "Start exam" [ref=f4e267]
              - generic [ref=f4e268]:
                - generic [ref=f4e269]:
                  - paragraph [ref=f4e270]: RN · ATI
                  - heading "ATI Comprehensive Pharmacology Practice Exam" [level=3] [ref=f4e271]
                  - paragraph [ref=f4e272]: Official simulated ATI Pharmacology exam covering cardiac, endocrine, and psychotropic therapeutics.
                  - paragraph [ref=f4e273]: 2 questions · 60 minutes
                - link [ref=f4e274] [cursor=pointer]:
                  - /url: /exam-session?examId=29121d18-3051-4225-b0bc-27bf728a4a10
                  - button "Start exam" [ref=f4e275]
          - generic [ref=f4e276]:
            - heading "Recent attempts" [level=2] [ref=f4e277]
            - table [ref=f4e279]:
              - rowgroup [ref=f4e280]:
                - row [ref=f4e281]:
                  - columnheader "Exam" [ref=f4e282]
                  - columnheader "Started" [ref=f4e283]
                  - columnheader "Status" [ref=f4e284]
                  - columnheader "Score" [ref=f4e285]
              - rowgroup [ref=f4e286]:
                - row [ref=f4e287]:
                  - cell "ATI Comprehensive Pharmacology Practice Exam" [ref=f4e288]
                  - cell "11/11/2026" [ref=f4e289]
                  - cell "Graded" [ref=f4e290]
                  - cell [ref=f4e291]:
                    - text: 100%
                    - link "Result" [ref=f4e292] [cursor=pointer]:
                      - /url: /learner/attempts/0c197953-b80c-4df7-a113-626fe923de1d
```

# Test source

```ts
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
> 226 |     await page.waitForURL(/\/sign-in/, { timeout: 30_000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  227 |     await shot(page, "10-signed-out-redirect");
  228 | 
  229 |     // Protected API rejects unauthenticated access
  230 |     const me = await page.request.get(`${process.env.E2E_API_URL || "http://localhost:5055"}/api/auth/me`);
  231 |     expect(me.status()).toBe(401);
  232 |   });
  233 | });
  234 | 
```