# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: superadmin-navigation.spec.ts >> Browser-level Superadmin dashboard navigation >> Superadmin switches between Admin and Learner dashboards, direct URL, and refresh
- Location: tests\e2e\superadmin-navigation.spec.ts:132:3

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Learner Dashboard' }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - link "NURVIA" [ref=e7] [cursor=pointer]:
            - /url: /admin
          - generic [ref=e17]: Admin
        - button [ref=e18] [cursor=pointer]
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: OVERVIEW
          - link "Platform Overview" [ref=e24] [cursor=pointer]:
            - /url: /admin
          - link "Content Analytics" [ref=e28] [cursor=pointer]:
            - /url: /admin/analytics
          - link "Audit Trail" [ref=e31] [cursor=pointer]:
            - /url: /admin/audit
        - generic [ref=e36]:
          - generic [ref=e37]: CONTENT MANAGEMENT
          - link "Question Bank 12,450" [ref=e38] [cursor=pointer]:
            - /url: /admin/questions
            - generic [ref=e42]: Question Bank
            - generic [ref=e43]: 12,450
          - link "Review Queue Review" [ref=e44] [cursor=pointer]:
            - /url: /admin/reviews
            - generic [ref=e48]: Review Queue
            - generic [ref=e49]: Review
          - link "Question Type Registry" [ref=e50] [cursor=pointer]:
            - /url: /admin/question-types
          - link "Exam Builder & Studio 84" [ref=e56] [cursor=pointer]:
            - /url: /admin/exams
            - generic [ref=e60]: Exam Builder & Studio
            - generic [ref=e61]: "84"
          - link "Curriculum Taxonomy" [ref=e62] [cursor=pointer]:
            - /url: /admin/taxonomy
          - link "Clinical Case Studies" [ref=e69] [cursor=pointer]:
            - /url: /admin/cases
        - generic [ref=e73]:
          - generic [ref=e74]: LEARNER & ACCESS
          - link "Learner Directory" [ref=e75] [cursor=pointer]:
            - /url: /admin/learners
          - link "Roles & RBAC" [ref=e81] [cursor=pointer]:
            - /url: /admin/rbac
        - generic [ref=e86]:
          - generic [ref=e87]: MONETIZATION
          - link "Plans & Entitlements" [ref=e88] [cursor=pointer]:
            - /url: /admin/plans
          - link "System Settings" [ref=e92] [cursor=pointer]:
            - /url: /admin/settings
      - link [ref=e97] [cursor=pointer]:
        - /url: /learner
        - button "Learner App" [ref=e98]
    - generic [ref=e104]:
      - banner [ref=e105]:
        - generic [ref=e107]:
          - generic [ref=e108]: Management Console
          - generic [ref=e109]: â€¢
          - generic [ref=e110]: SUPERADMIN ACCESS
          - generic [ref=e111]: "API: HEALTHY"
        - generic [ref=e112]:
          - button "Switch to dark theme" [ref=e113] [cursor=pointer]
          - generic [ref=e116]:
            - generic [ref=e117]: SA
            - generic [ref=e118]: Admin Workspace
      - main [ref=e119]:
        - generic [ref=e120]:
          - generic [ref=e121]:
            - generic [ref=e122]:
              - heading "Curriculum & Examination Studio" [level=1] [ref=e123]
              - paragraph [ref=e124]: Author, review, publish, and govern nursing examination questions, clinical case studies, and rubrics.
            - generic [ref=e125]:
              - link [ref=e126] [cursor=pointer]:
                - /url: /admin/questions/new
                - button "New Question" [ref=e127]
              - link [ref=e129] [cursor=pointer]:
                - /url: /admin/exams
                - button "Exam Studio" [ref=e130]
              - link [ref=e134] [cursor=pointer]:
                - /url: /admin/reviews
                - button "Review Queue" [ref=e135]
          - generic [ref=e139]:
            - generic [ref=e140]:
              - generic [ref=e141]: Total Question Bank
              - generic [ref=e146]: 12,450
              - paragraph [ref=e147]: +145 added this week
            - generic [ref=e148]:
              - generic [ref=e149]: Published Exams
              - generic [ref=e154]: "84"
              - paragraph [ref=e155]: Across RN, PN & Exit Tracks
            - generic [ref=e156]:
              - generic [ref=e157]: Active Learners
              - generic [ref=e163]: 3,890
              - paragraph [ref=e164]: Logged in during past 30 days
            - generic [ref=e165]:
              - generic [ref=e166]: Clinical Vignettes
              - generic [ref=e172]: 320 Cases
              - paragraph [ref=e173]: NGN 6-item unfolding sets
          - generic [ref=e174]:
            - generic [ref=e175]:
              - heading "Content Lifecycle & Governance Pipeline" [level=3] [ref=e176]
              - paragraph [ref=e177]: "Immutable versioning: Published items served to ongoing attempts remain locked."
            - generic [ref=e179]:
              - generic [ref=e180]:
                - generic [ref=e181]: Drafts
                - generic [ref=e182]: "342"
              - generic [ref=e183]:
                - generic [ref=e184]: Validation
                - generic [ref=e185]: "85"
              - generic [ref=e186]:
                - generic [ref=e187]: Editorial Review
                - generic [ref=e188]: "120"
              - generic [ref=e189]:
                - generic [ref=e190]: Approved
                - generic [ref=e191]: "210"
              - generic [ref=e192]:
                - generic [ref=e193]: Published
                - generic [ref=e194]: 12,450
              - generic [ref=e195]:
                - generic [ref=e196]: Archived
                - generic [ref=e197]: 1,420
          - generic [ref=e198]:
            - generic [ref=e199]:
              - generic [ref=e200]:
                - heading "Recent Question Repository Entries" [level=3] [ref=e201]
                - paragraph [ref=e202]: Authoritative questions with validated rationales and cognitive skill mappings
              - link [ref=e204] [cursor=pointer]:
                - /url: /admin/questions
                - button "Full Question Bank" [ref=e205]
            - table [ref=e210]:
              - rowgroup [ref=e211]:
                - row [ref=e212]:
                  - columnheader "ID" [ref=e213]
                  - columnheader "Question Stem / Concept" [ref=e214]
                  - columnheader "Specialty" [ref=e215]
                  - columnheader "Format" [ref=e216]
                  - columnheader "Status" [ref=e217]
                  - columnheader "Author" [ref=e218]
                  - columnheader "Updated" [ref=e219]
              - rowgroup [ref=e220]:
                - row [ref=e221]:
                  - cell "Q-8902" [ref=e222]
                  - cell "Pediatric Asthma Exacerbation & Bronchodilator Administration" [ref=e223]
                  - cell "Pediatric Nursing" [ref=e224]
                  - cell "NGN Unfolding Case" [ref=e225]
                  - cell "Published" [ref=e226]
                  - cell "Dr. Sarah M., DNP" [ref=e228]
                  - cell "10 mins ago" [ref=e229]
                - row [ref=e230]:
                  - cell "Q-8901" [ref=e231]
                  - cell "Digoxin Toxicity & Serum Electrolyte Monitoring" [ref=e232]
                  - cell "Pharmacology" [ref=e233]
                  - cell "Select All That Apply" [ref=e234]
                  - cell "Editorial Review" [ref=e235]
                  - cell "Prof. James L., MSN, RN" [ref=e237]
                  - cell "25 mins ago" [ref=e238]
                - row [ref=e239]:
                  - cell "Q-8900" [ref=e240]
                  - cell "Postpartum Hemorrhage & Oxytocin Titration Protocol" [ref=e241]
                  - cell "Maternal Newborn" [ref=e242]
                  - cell "Multiple Choice" [ref=e243]
                  - cell "Published" [ref=e244]
                  - cell "Rebecca C., CNS" [ref=e246]
                  - cell "1 hour ago" [ref=e247]
                - row [ref=e248]:
                  - cell "Q-8899" [ref=e249]
                  - cell "Chest Tube Drainage System Complications & Crepitus" [ref=e250]
                  - cell "Adult Med-Surg" [ref=e251]
                  - cell "Matrix Grid" [ref=e252]
                  - cell "Validation" [ref=e253]
                  - cell "Dr. Sarah M., DNP" [ref=e255]
                  - cell "3 hours ago" [ref=e256]
```

# Test source

```ts
  42  |   const res = await request.post(`${API}/api/auth/register`, {
  43  |     data: { name: account.name, email: account.email, password: account.password },
  44  |     headers: { "X-CSRF-TOKEN": csrf },
  45  |   });
  46  |   expect([200, 202]).toContain(res.status());
  47  | }
  48  | 
  49  | async function shot(page: import("@playwright/test").Page, name: string) {
  50  |   fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  51  |   await page.screenshot({ path: path.join(EVIDENCE_DIR, `${name}.png`), fullPage: true });
  52  | }
  53  | 
  54  | test.describe.configure({ mode: "serial" });
  55  | 
  56  | test.describe("Backend role-assignment security (authenticated HTTP)", () => {
  57  |   test("Superadmin can sign in via the bootstrapped account", async ({ request }) => {
  58  |     const user = await apiSignIn(request, superadmin);
  59  |     expect(user.role).toBe("Superadmin");
  60  |   });
  61  | 
  62  |   test("Superadmin can promote a learner to Administrator", async ({ request }) => {
  63  |     await apiRegister(request, learner);
  64  |     const learnerUser = await apiSignIn(request, learner);
  65  |     expect(learnerUser.role).toBe("Learner");
  66  | 
  67  |     // Switch this request context to the Superadmin before assigning.
  68  |     await apiSignIn(request, superadmin);
  69  |     const assign = await request.post(`${API}/api/auth/assign-role`, {
  70  |       data: { targetUserId: learnerUser.id, role: "Administrator" },
  71  |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  72  |     });
  73  |     expect(assign.status()).toBe(200);
  74  |   });
  75  | 
  76  |   test("Administrator CANNOT assign Superadmin, including to an existing Superadmin", async ({ request }) => {
  77  |     const superadminUser = await apiSignIn(request, superadmin);
  78  |     expect(superadminUser.role).toBe("Superadmin");
  79  | 
  80  |     // The promoted learner is now an Administrator on the server.
  81  |     const adminUser = await apiSignIn(request, learner);
  82  |     expect(adminUser.role).toBe("Administrator");
  83  | 
  84  |     for (const role of ["Superadmin", "superadmin", "SUPERADMIN"]) {
  85  |       const escalate = await request.post(`${API}/api/auth/assign-role`, {
  86  |         data: { targetUserId: superadminUser.id, role },
  87  |         headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  88  |       });
  89  |       expect([403, 400]).toContain(escalate.status());
  90  |     }
  91  | 
  92  |     // Self-escalation is also denied.
  93  |     const self = await request.post(`${API}/api/auth/assign-role`, {
  94  |       data: { targetUserId: adminUser.id, role: "Superadmin" },
  95  |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  96  |     });
  97  |     expect([403, 400]).toContain(self.status());
  98  |   });
  99  | 
  100 |   test("Learner cannot assign any role", async ({ request }) => {
  101 |     const fresh = { email: `nav2.${stamp}@nurviatest.example`, password: "NavLearner2-2026", name: "Nav Learner 2" };
  102 |     await apiRegister(request, fresh);
  103 |     await apiSignIn(request, fresh);
  104 |     const assign = await request.post(`${API}/api/auth/assign-role`, {
  105 |       data: { targetUserId: fresh.email, role: "Administrator" },
  106 |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  107 |     });
  108 |     expect([403, 400]).toContain(assign.status());
  109 |   });
  110 | 
  111 |   test("Superadmin can start their own attempt; other learners cannot touch it", async ({ request }) => {
  112 |     await apiSignIn(request, superadmin);
  113 |     const exams = await request.get(`${API}/api/Exams?status=Published`);
  114 |     const examId = ((await exams.json()).data.items as Array<{ id: string }>)[0].id;
  115 | 
  116 |     const start = await request.post(`${API}/api/attempts/start/${examId}`, {
  117 |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  118 |     });
  119 |     expect(start.status()).toBe(200);
  120 |     const attemptId = (await start.json()).data.attemptId as string;
  121 | 
  122 |     // A different learner cannot read the Superadmin's attempt.
  123 |     const other = { email: `nav3.${stamp}@nurviatest.example`, password: "NavLearner3-2026", name: "Nav Learner 3" };
  124 |     await apiRegister(request, other);
  125 |     await apiSignIn(request, other);
  126 |     const foreign = await request.get(`${API}/api/attempts/${attemptId}`);
  127 |     expect(foreign.status()).toBe(403);
  128 |   });
  129 | });
  130 | 
  131 | test.describe("Browser-level Superadmin dashboard navigation", () => {
  132 |   test("Superadmin switches between Admin and Learner dashboards, direct URL, and refresh", async ({ page }) => {
  133 |     // Sign in through the real UI.
  134 |     await page.goto("/sign-in");
  135 |     await page.locator("#email").fill(superadmin.email);
  136 |     await page.locator("#password").fill(superadmin.password);
  137 |     await page.locator("form").getByRole("button", { name: /Sign In/ }).click();
  138 |     await page.waitForURL(/\/admin$/, { timeout: 30_000 });
  139 |     await shot(page, "40-superadmin-admin-dashboard");
  140 | 
  141 |     // 2. Switch to the Learner Dashboard through the switcher.
> 142 |     await page.getByRole("link", { name: "Learner Dashboard" }).first().click();
      |                                                                         ^ Error: locator.click: Test timeout of 90000ms exceeded.
  143 |     await page.waitForURL(/\/learner$/, { timeout: 30_000 });
  144 |     // The learner shell must render real dashboard content, not the
  145 |     // "Redirecting to the appropriate page…" placeholder.
  146 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
  147 |     await expect(page.getByText("Redirecting to the appropriate page")).toHaveCount(0);
  148 |     await shot(page, "41-superadmin-learner-dashboard");
  149 | 
  150 |     // 3. Direct URL access to the canonical learner dashboard.
  151 |     await page.goto("/learner");
  152 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
  153 |     await expect(page.getByText("Redirecting to the appropriate page")).toHaveCount(0);
  154 | 
  155 |     // 4. Refresh the learner dashboard — session must persist.
  156 |     await page.reload();
  157 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
  158 |     await expect(page.getByText("Redirecting to the appropriate page")).toHaveCount(0);
  159 |     await shot(page, "42-superadmin-learner-refresh");
  160 | 
  161 |     // 5. Navigate back to the Admin Dashboard.
  162 |     await page.getByRole("link", { name: "Admin Dashboard" }).first().click();
  163 |     await page.waitForURL(/\/admin$/, { timeout: 30_000 });
  164 |     await expect(page.getByText("Management Console")).toBeVisible();
  165 |     await shot(page, "43-superadmin-back-to-admin");
  166 | 
  167 |     // 6. Repeat switching to prove stability.
  168 |     await page.goto("/learner");
  169 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
  170 |     await page.goto("/admin");
  171 |     await expect(page.getByText("Management Console")).toBeVisible();
  172 | 
  173 |     // The switcher is visible for Superadmin inside the learner shell.
  174 |     await page.goto("/learner");
  175 |     await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
  176 |     await shot(page, "44-superadmin-switcher-visible");
  177 |   });
  178 | 
  179 |   test("An ordinary Learner keeps access to the learner dashboard only", async ({ page }) => {
  180 |     await page.goto("/sign-in");
  181 |     await page.locator("#email").fill(learner.email);
  182 |     await page.locator("#password").fill(learner.password);
  183 |     await page.locator("form").getByRole("button", { name: /Sign In/ }).click();
  184 |     await page.waitForURL(/\/learner$/, { timeout: 30_000 });
  185 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
  186 | 
  187 |     // No cross-dashboard switcher for a plain Learner.
  188 |     await expect(page.getByRole("link", { name: "Admin Dashboard" })).toHaveCount(0);
  189 | 
  190 |     // Direct access to an admin route is denied.
  191 |     await page.goto("/admin");
  192 |     await page.waitForURL(/\/access-denied$/, { timeout: 30_000 });
  193 |     await shot(page, "45-learner-admin-denied");
  194 |   });
  195 | });
  196 | 
```