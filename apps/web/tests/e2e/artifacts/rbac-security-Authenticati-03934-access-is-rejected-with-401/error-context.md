# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rbac-security.spec.ts >> Authentication, RBAC, and exam integrity >> Unauthenticated API access is rejected with 401
- Location: tests\e2e\rbac-security.spec.ts:53:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 200
```

# Test source

```ts
  1   | import { test, expect, APIRequestContext } from "@playwright/test";
  2   | 
  3   | const API = process.env.E2E_API_URL || "http://localhost:5055";
  4   | const stamp = Date.now();
  5   | 
  6   | interface Account {
  7   |   email: string;
  8   |   password: string;
  9   |   name: string;
  10  | }
  11  | 
  12  | const learnerA: Account = {
  13  |   email: `rbac.a.${stamp}@nurviatest.example`,
  14  |   password: "RbacTest-2026-Secure-A",
  15  |   name: "Rbac Learner A",
  16  | };
  17  | const learnerB: Account = {
  18  |   email: `rbac.b.${stamp}@nurviatest.example`,
  19  |   password: "RbacTest-2026-Secure-B",
  20  |   name: "Rbac Learner B",
  21  | };
  22  | 
  23  | async function getCsrf(request: APIRequestContext): Promise<string> {
  24  |   const res = await request.get(`${API}/api/auth/csrf`);
  25  |   expect(res.status()).toBe(200);
  26  |   const body = await res.json();
  27  |   return body.data;
  28  | }
  29  | 
  30  | async function register(request: APIRequestContext, account: Account) {
  31  |   const csrf = await getCsrf(request);
  32  |   const res = await request.post(`${API}/api/auth/register`, {
  33  |     data: { name: account.name, email: account.email, password: account.password },
  34  |     headers: { "X-CSRF-TOKEN": csrf },
  35  |   });
  36  |   expect([202, 200]).toContain(res.status());
  37  | }
  38  | 
  39  | async function signIn(request: APIRequestContext, account: Account) {
  40  |   const csrf = await getCsrf(request);
  41  |   const res = await request.post(`${API}/api/auth/login`, {
  42  |     data: { email: account.email, password: account.password },
  43  |     headers: { "X-CSRF-TOKEN": csrf },
  44  |   });
  45  |   expect(res.status()).toBe(200);
  46  |   const body = await res.json();
  47  |   return body.data as { id: string; name: string; email: string; role: string };
  48  | }
  49  | 
  50  | test.describe("Authentication, RBAC, and exam integrity", () => {
  51  |   let publishedExamId = "";
  52  | 
  53  |   test("Unauthenticated API access is rejected with 401", async ({ request }) => {
  54  |     const me = await request.get(`${API}/api/auth/me`);
  55  |     expect(me.status()).toBe(401);
  56  | 
  57  |     const history = await request.get(`${API}/api/attempts/history`);
  58  |     expect(history.status()).toBe(401);
  59  | 
  60  |     const questions = await request.get(`${API}/api/Questions`);
  61  |     expect(questions.status()).toBe(401);
  62  | 
  63  |     // Token-less unsafe requests are rejected by the global antiforgery
  64  |     // filter (400) before the controller's authentication check runs; GET
  65  |     // endpoints above return 401 directly. Both outcomes deny the request.
  66  |     const unsafe = await request.post(`${API}/api/attempts/start/00000000-0000-0000-0000-000000000000`);
  67  |     expect([400, 401]).toContain(unsafe.status());
  68  | 
  69  |     const exams = await request.get(`${API}/api/Exams`);
> 70  |     expect(exams.status()).toBe(401);
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  71  |   });
  72  | 
  73  |   test("Unsafe requests without CSRF token are rejected", async ({ request }) => {
  74  |     const res = await request.post(`${API}/api/auth/login`, {
  75  |       data: { email: learnerA.email, password: learnerA.password },
  76  |     });
  77  |     expect(res.status()).toBe(400);
  78  |   });
  79  | 
  80  |   test("Registration assigns Learner role and role escalation is blocked", async ({ request }) => {
  81  |     await register(request, learnerA);
  82  |     await register(request, learnerB);
  83  | 
  84  |     const userA = await signIn(request, learnerA);
  85  |     expect(userA.role).toBe("Learner");
  86  | 
  87  |     // Learner cannot assign roles, cannot escalate via payload tricks
  88  |     const users = await request.get(`${API}/api/auth/me`);
  89  |     expect(users.status()).toBe(200);
  90  | 
  91  |     const escalate = await request.post(`${API}/api/auth/assign-role`, {
  92  |       data: { targetUserId: userA.id, role: "Superadmin" },
  93  |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  94  |     });
  95  |     expect([403, 400]).toContain(escalate.status());
  96  | 
  97  |     // Staff-only API is forbidden for learners
  98  |     const questions = await request.get(`${API}/api/Questions`);
  99  |     expect(questions.status()).toBe(403);
  100 | 
  101 |     const examCreate = await request.post(`${API}/api/Exams`, {
  102 |       data: { title: "Malicious Exam Creation", description: "no", pathway: "RN", category: "ATI", modeAllowed: "All" },
  103 |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  104 |     });
  105 |     expect(examCreate.status()).toBe(403);
  106 |   });
  107 | 
  108 |   test("Learner sees only published exams and cannot open staff exam detail", async ({ request }) => {
  109 |     await signIn(request, learnerA);
  110 |     const exams = await request.get(`${API}/api/Exams?status=Published`);
  111 |     expect(exams.status()).toBe(200);
  112 |     const body = await exams.json();
  113 |     const items = body.data?.items ?? [];
  114 |     expect(items.length).toBeGreaterThan(0);
  115 |     for (const exam of items) {
  116 |       expect(exam.status).toBe("Published");
  117 |     }
  118 |     publishedExamId = items[0].id;
  119 | 
  120 |     const detail = await request.get(`${API}/api/Exams/${publishedExamId}`);
  121 |     expect(detail.status()).toBe(403);
  122 |   });
  123 | 
  124 |   test("Attempt ownership is enforced across learners and answer keys are not exposed", async ({ request }) => {
  125 |     await signIn(request, learnerA);
  126 |     const csrfA = await getCsrf(request);
  127 | 
  128 |     // Learner A starts an attempt
  129 |     const start = await request.post(`${API}/api/attempts/start/${publishedExamId}`, {
  130 |       headers: { "X-CSRF-TOKEN": csrfA },
  131 |     });
  132 |     expect(start.status()).toBe(200);
  133 |     const startBody = await start.json();
  134 |     const attemptId = startBody.data.attemptId;
  135 |     const questions = startBody.data.questions as Array<{
  136 |       id: string;
  137 |       options: Array<{ id: string; isCorrect?: boolean; specificRationale?: string }>;
  138 |     }>;
  139 | 
  140 |     // Active attempt DTOs must not expose the answer key or rationales
  141 |     for (const q of questions) {
  142 |       expect("generalRationale" in q).toBeFalsy();
  143 |       for (const o of q.options) {
  144 |         expect(o.isCorrect).toBeUndefined();
  145 |         expect(o.specificRationale).toBeUndefined();
  146 |       }
  147 |     }
  148 | 
  149 |     // Learner A autosaves a response
  150 |     const save = await request.put(`${API}/api/attempts/${attemptId}/responses`, {
  151 |       data: { questionId: questions[0].id, responseJson: JSON.stringify({ SelectedOptionId: questions[0].options[0].id }), isFlagged: false },
  152 |       headers: { "X-CSRF-TOKEN": csrfA },
  153 |     });
  154 |     expect(save.status()).toBe(200);
  155 | 
  156 |     // Learner B cannot read, save into, submit, or review A's attempt
  157 |     await signIn(request, learnerB);
  158 |     const csrfB = await getCsrf(request);
  159 | 
  160 |     const getOther = await request.get(`${API}/api/attempts/${attemptId}`);
  161 |     expect(getOther.status()).toBe(403);
  162 | 
  163 |     const saveOther = await request.put(`${API}/api/attempts/${attemptId}/responses`, {
  164 |       data: { questionId: questions[0].id, responseJson: "null", isFlagged: false },
  165 |       headers: { "X-CSRF-TOKEN": csrfB },
  166 |     });
  167 |     expect(saveOther.status()).toBe(403);
  168 | 
  169 |     const submitOther = await request.post(`${API}/api/attempts/${attemptId}/submit`, {
  170 |       headers: { "X-CSRF-TOKEN": csrfB },
```