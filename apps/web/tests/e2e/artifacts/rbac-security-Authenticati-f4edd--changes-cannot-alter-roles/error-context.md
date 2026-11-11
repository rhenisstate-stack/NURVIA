# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rbac-security.spec.ts >> Authentication, RBAC, and exam integrity >> Invalid credentials are rejected with 401 and profile changes cannot alter roles
- Location: tests\e2e\rbac-security.spec.ts:225:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 400
```

# Test source

```ts
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
  165 | 
  166 |     const submitOther = await request.post(`${API}/api/attempts/${attemptId}/submit`, {
  167 |       headers: { "X-CSRF-TOKEN": csrfB },
  168 |     });
  169 |     expect(submitOther.status()).toBe(403);
  170 | 
  171 |     const reviewOther = await request.get(`${API}/api/attempts/${attemptId}/review`);
  172 |     expect(reviewOther.status()).toBe(403);
  173 |   });
  174 | 
  175 |   test("Scoring is backend-performed, idempotent, and released only per policy", async ({ request }) => {
  176 |     await signIn(request, learnerA);
  177 |     const csrf = await getCsrf(request);
  178 | 
  179 |     const start = await request.post(`${API}/api/attempts/start/${publishedExamId}`, {
  180 |       headers: { "X-CSRF-TOKEN": csrf },
  181 |     });
  182 |     const attemptId = (await start.json()).data.attemptId;
  183 | 
  184 |     // Answer everything with the first option (deliberately not full credit)
  185 |     const active = await (await request.get(`${API}/api/attempts/${attemptId}`)).json();
  186 |     for (const q of active.data.questions) {
  187 |       await request.put(`${API}/api/attempts/${attemptId}/responses`, {
  188 |         data: {
  189 |           questionId: q.id,
  190 |           responseJson: q.questionType === "MultipleResponse" || q.questionType === 2
  191 |             ? JSON.stringify({ SelectedOptionIds: [q.options[0].id] })
  192 |             : JSON.stringify({ SelectedOptionId: q.options[0].id }),
  193 |           isFlagged: false,
  194 |         },
  195 |         headers: { "X-CSRF-TOKEN": csrf },
  196 |       });
  197 |     }
  198 | 
  199 |     const submit1 = await request.post(`${API}/api/attempts/${attemptId}/submit`, {
  200 |       headers: { "X-CSRF-TOKEN": csrf },
  201 |     });
  202 |     expect(submit1.status()).toBe(200);
  203 |     const result1 = (await submit1.json()).data;
  204 |     expect(result1.status).toBe("Graded");
  205 |     expect(result1.reviewReleased).toBe(true); // seeded exams use the Immediate policy
  206 | 
  207 |     // Duplicate submission is idempotent
  208 |     const submit2 = await request.post(`${API}/api/attempts/${attemptId}/submit`, {
  209 |       headers: { "X-CSRF-TOKEN": csrf },
  210 |     });
  211 |     const result2 = (await submit2.json()).data;
  212 |     expect(result2.scorePercentage).toBe(result1.scorePercentage);
  213 |     expect(result2.correctQuestions).toBe(result1.correctQuestions);
  214 | 
  215 |     // Review corresponds to the submitted attempt and includes the released key
  216 |     const review = await request.get(`${API}/api/attempts/${attemptId}/review`);
  217 |     expect(review.status()).toBe(200);
  218 |     const reviewBody = (await review.json()).data;
  219 |     expect(reviewBody.attemptId).toBe(attemptId);
  220 |     expect(reviewBody.reviewReleased).toBe(true);
  221 |     const withKey = reviewBody.reviewQuestions.flatMap((q: { options: Array<{ isCorrect: boolean }> }) => q.options);
  222 |     expect(withKey.some((o: { isCorrect: boolean }) => o.isCorrect)).toBe(true);
  223 |   });
  224 | 
  225 |   test("Invalid credentials are rejected with 401 and profile changes cannot alter roles", async ({ request }) => {
  226 |     const csrf = await getCsrf(request);
  227 |     const bad = await request.post(`${API}/api/auth/login`, {
  228 |       data: { email: learnerA.email, password: "WrongPassword-Not-It-123" },
  229 |       headers: { "X-CSRF-TOKEN": csrf },
  230 |     });
  231 |     expect(bad.status()).toBe(401);
  232 | 
  233 |     await signIn(request, learnerA);
  234 |     const profile = await request.put(`${API}/api/auth/profile`, {
  235 |       data: { name: "Rbac Learner A Renamed", role: "Superadmin" },
  236 |       headers: { "X-CSRF-TOKEN": csrf },
  237 |     });
> 238 |     expect(profile.status()).toBe(200);
      |                              ^ Error: expect(received).toBe(expected) // Object.is equality
  239 |     const profileBody = (await profile.json()).data;
  240 |     expect(profileBody.role).toBe("Learner");
  241 |     expect(profileBody.name).toBe("Rbac Learner A Renamed");
  242 | 
  243 |     // Restore original name for the reconciliation evidence
  244 |     await request.put(`${API}/api/auth/profile`, {
  245 |       data: { name: learnerA.name },
  246 |       headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  247 |     });
  248 |   });
  249 | });
  250 | 
```