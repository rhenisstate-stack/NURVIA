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
Received: 400
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
  63  |     const unsafe = await request.post(`${API}/api/attempts/start/00000000-0000-0000-0000-000000000000`);
> 64  |     expect(unsafe.status()).toBe(401);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  65  | 
  66  |     const exams = await request.get(`${API}/api/Exams`);
  67  |     expect(exams.status()).toBe(401);
  68  |   });
  69  | 
  70  |   test("Unsafe requests without CSRF token are rejected", async ({ request }) => {
  71  |     const res = await request.post(`${API}/api/auth/login`, {
  72  |       data: { email: learnerA.email, password: learnerA.password },
  73  |     });
  74  |     expect(res.status()).toBe(400);
  75  |   });
  76  | 
  77  |   test("Registration assigns Learner role and role escalation is blocked", async ({ request }) => {
  78  |     await register(request, learnerA);
  79  |     await register(request, learnerB);
  80  | 
  81  |     const userA = await signIn(request, learnerA);
  82  |     expect(userA.role).toBe("Learner");
  83  | 
  84  |     // Learner cannot assign roles, cannot escalate via payload tricks
  85  |     const users = await request.get(`${API}/api/auth/me`);
  86  |     expect(users.status()).toBe(200);
  87  | 
  88  |     const escalate = await request.post(`${API}/api/auth/assign-role`, {
  89  |       data: { targetUserId: userA.id, role: "Superadmin" },
  90  |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  91  |     });
  92  |     expect([403, 400]).toContain(escalate.status());
  93  | 
  94  |     // Staff-only API is forbidden for learners
  95  |     const questions = await request.get(`${API}/api/Questions`);
  96  |     expect(questions.status()).toBe(403);
  97  | 
  98  |     const examCreate = await request.post(`${API}/api/Exams`, {
  99  |       data: { title: "Malicious Exam Creation", description: "no", pathway: "RN", category: "ATI", modeAllowed: "All" },
  100 |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  101 |     });
  102 |     expect(examCreate.status()).toBe(403);
  103 |   });
  104 | 
  105 |   test("Learner sees only published exams and cannot open staff exam detail", async ({ request }) => {
  106 |     await signIn(request, learnerA);
  107 |     const exams = await request.get(`${API}/api/Exams?status=Published`);
  108 |     expect(exams.status()).toBe(200);
  109 |     const body = await exams.json();
  110 |     const items = body.data?.items ?? [];
  111 |     expect(items.length).toBeGreaterThan(0);
  112 |     for (const exam of items) {
  113 |       expect(exam.status).toBe("Published");
  114 |     }
  115 |     publishedExamId = items[0].id;
  116 | 
  117 |     const detail = await request.get(`${API}/api/Exams/${publishedExamId}`);
  118 |     expect(detail.status()).toBe(403);
  119 |   });
  120 | 
  121 |   test("Attempt ownership is enforced across learners and answer keys are not exposed", async ({ request }) => {
  122 |     await signIn(request, learnerA);
  123 |     const csrfA = await getCsrf(request);
  124 | 
  125 |     // Learner A starts an attempt
  126 |     const start = await request.post(`${API}/api/attempts/start/${publishedExamId}`, {
  127 |       headers: { "X-CSRF-TOKEN": csrfA },
  128 |     });
  129 |     expect(start.status()).toBe(200);
  130 |     const startBody = await start.json();
  131 |     const attemptId = startBody.data.attemptId;
  132 |     const questions = startBody.data.questions as Array<{
  133 |       id: string;
  134 |       options: Array<{ id: string; isCorrect?: boolean; specificRationale?: string }>;
  135 |     }>;
  136 | 
  137 |     // Active attempt DTOs must not expose the answer key or rationales
  138 |     for (const q of questions) {
  139 |       expect("generalRationale" in q).toBeFalsy();
  140 |       for (const o of q.options) {
  141 |         expect(o.isCorrect).toBeUndefined();
  142 |         expect(o.specificRationale).toBeUndefined();
  143 |       }
  144 |     }
  145 | 
  146 |     // Learner A autosaves a response
  147 |     const save = await request.put(`${API}/api/attempts/${attemptId}/responses`, {
  148 |       data: { questionId: questions[0].id, responseJson: JSON.stringify({ SelectedOptionId: questions[0].options[0].id }), isFlagged: false },
  149 |       headers: { "X-CSRF-TOKEN": csrfA },
  150 |     });
  151 |     expect(save.status()).toBe(200);
  152 | 
  153 |     // Learner B cannot read, save into, submit, or review A's attempt
  154 |     await signIn(request, learnerB);
  155 |     const csrfB = await getCsrf(request);
  156 | 
  157 |     const getOther = await request.get(`${API}/api/attempts/${attemptId}`);
  158 |     expect(getOther.status()).toBe(403);
  159 | 
  160 |     const saveOther = await request.put(`${API}/api/attempts/${attemptId}/responses`, {
  161 |       data: { questionId: questions[0].id, responseJson: "null", isFlagged: false },
  162 |       headers: { "X-CSRF-TOKEN": csrfB },
  163 |     });
  164 |     expect(saveOther.status()).toBe(403);
```