import { test, expect, APIRequestContext } from "@playwright/test";

const API = process.env.E2E_API_URL || "http://localhost:5055";
const stamp = Date.now();

interface Account {
  email: string;
  password: string;
  name: string;
}

const learnerA: Account = {
  email: `rbac.a.${stamp}@nurviatest.example`,
  password: "RbacTest-2026-Secure-A",
  name: "Rbac Learner A",
};
const learnerB: Account = {
  email: `rbac.b.${stamp}@nurviatest.example`,
  password: "RbacTest-2026-Secure-B",
  name: "Rbac Learner B",
};

async function getCsrf(request: APIRequestContext): Promise<string> {
  const res = await request.get(`${API}/api/auth/csrf`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.data;
}

async function register(request: APIRequestContext, account: Account) {
  const csrf = await getCsrf(request);
  const res = await request.post(`${API}/api/auth/register`, {
    data: { name: account.name, email: account.email, password: account.password },
    headers: { "X-CSRF-TOKEN": csrf },
  });
  expect([202, 200]).toContain(res.status());
}

async function signIn(request: APIRequestContext, account: Account) {
  const csrf = await getCsrf(request);
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email: account.email, password: account.password },
    headers: { "X-CSRF-TOKEN": csrf },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.data as { id: string; name: string; email: string; role: string };
}

test.describe("Authentication, RBAC, and exam integrity", () => {
  let publishedExamId = "";

  test("Unauthenticated API access is rejected with 401", async ({ request }) => {
    const me = await request.get(`${API}/api/auth/me`);
    expect(me.status()).toBe(401);

    const history = await request.get(`${API}/api/attempts/history`);
    expect(history.status()).toBe(401);

    const questions = await request.get(`${API}/api/Questions`);
    expect(questions.status()).toBe(401);

    // Token-less unsafe requests are rejected by the global antiforgery
    // filter (400) before the controller's authentication check runs; GET
    // endpoints above return 401 directly. Both outcomes deny the request.
    const unsafe = await request.post(`${API}/api/attempts/start/00000000-0000-0000-0000-000000000000`);
    expect([400, 401]).toContain(unsafe.status());

    // The public catalogue endpoint intentionally serves only Published exams
    // to unauthenticated visitors (drafts are never exposed).
    const exams = await request.get(`${API}/api/Exams`);
    expect(exams.status()).toBe(200);
    const publicItems = ((await exams.json()).data?.items ?? []) as Array<{ status: string }>;
    for (const item of publicItems) {
      expect(item.status).toBe("Published");
    }
  });

  test("Unsafe requests without CSRF token are rejected", async ({ request }) => {
    const res = await request.post(`${API}/api/auth/login`, {
      data: { email: learnerA.email, password: learnerA.password },
    });
    expect(res.status()).toBe(400);
  });

  test("Registration assigns Learner role and role escalation is blocked", async ({ request }) => {
    await register(request, learnerA);
    await register(request, learnerB);

    const userA = await signIn(request, learnerA);
    expect(userA.role).toBe("Learner");

    // Learner cannot assign roles, cannot escalate via payload tricks
    const users = await request.get(`${API}/api/auth/me`);
    expect(users.status()).toBe(200);

    const escalate = await request.post(`${API}/api/auth/assign-role`, {
      data: { targetUserId: userA.id, role: "Superadmin" },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect([403, 400]).toContain(escalate.status());

    // Staff-only API is forbidden for learners
    const questions = await request.get(`${API}/api/Questions`);
    expect(questions.status()).toBe(403);

    const examCreate = await request.post(`${API}/api/Exams`, {
      data: { title: "Malicious Exam Creation", description: "no", pathway: "RN", category: "ATI", modeAllowed: "All" },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
    expect(examCreate.status()).toBe(403);
  });

  test("Learner sees only published exams and cannot open staff exam detail", async ({ request }) => {
    await signIn(request, learnerA);
    const exams = await request.get(`${API}/api/Exams?status=Published`);
    expect(exams.status()).toBe(200);
    const body = await exams.json();
    const items = body.data?.items ?? [];
    expect(items.length).toBeGreaterThan(0);
    for (const exam of items) {
      expect(exam.status).toBe("Published");
    }
    publishedExamId = items[0].id;

    const detail = await request.get(`${API}/api/Exams/${publishedExamId}`);
    expect(detail.status()).toBe(403);
  });

  test("Attempt ownership is enforced across learners and answer keys are not exposed", async ({ request }) => {
    await signIn(request, learnerA);
    const csrfA = await getCsrf(request);

    // Learner A starts an attempt
    const start = await request.post(`${API}/api/attempts/start/${publishedExamId}`, {
      headers: { "X-CSRF-TOKEN": csrfA },
    });
    expect(start.status()).toBe(200);
    const startBody = await start.json();
    const attemptId = startBody.data.attemptId;
    const questions = startBody.data.questions as Array<{
      id: string;
      options: Array<{ id: string; isCorrect?: boolean; specificRationale?: string }>;
    }>;

    // Active attempt DTOs must not expose the answer key or rationales
    for (const q of questions) {
      expect("generalRationale" in q).toBeFalsy();
      for (const o of q.options) {
        expect(o.isCorrect).toBeFalsy();
        expect(o.specificRationale).toBeUndefined();
      }
    }

    // Learner A autosaves a response
    const save = await request.put(`${API}/api/attempts/${attemptId}/responses`, {
      data: { questionId: questions[0].id, responseJson: JSON.stringify({ SelectedOptionId: questions[0].options[0].id }), isFlagged: false },
      headers: { "X-CSRF-TOKEN": csrfA },
    });
    expect(save.status()).toBe(200);

    // Learner B cannot read, save into, submit, or review A's attempt
    await signIn(request, learnerB);
    const csrfB = await getCsrf(request);

    const getOther = await request.get(`${API}/api/attempts/${attemptId}`);
    expect(getOther.status()).toBe(403);

    const saveOther = await request.put(`${API}/api/attempts/${attemptId}/responses`, {
      data: { questionId: questions[0].id, responseJson: "null", isFlagged: false },
      headers: { "X-CSRF-TOKEN": csrfB },
    });
    expect(saveOther.status()).toBe(403);

    const submitOther = await request.post(`${API}/api/attempts/${attemptId}/submit`, {
      headers: { "X-CSRF-TOKEN": csrfB },
    });
    expect(submitOther.status()).toBe(403);

    const reviewOther = await request.get(`${API}/api/attempts/${attemptId}/review`);
    expect(reviewOther.status()).toBe(403);
  });

  test("Scoring is backend-performed, idempotent, and released only per policy", async ({ request }) => {
    await signIn(request, learnerA);
    const csrf = await getCsrf(request);

    const start = await request.post(`${API}/api/attempts/start/${publishedExamId}`, {
      headers: { "X-CSRF-TOKEN": csrf },
    });
    const attemptId = (await start.json()).data.attemptId;

    // Answer everything with the first option (deliberately not full credit)
    const active = await (await request.get(`${API}/api/attempts/${attemptId}`)).json();
    for (const q of active.data.questions) {
      await request.put(`${API}/api/attempts/${attemptId}/responses`, {
        data: {
          questionId: q.id,
          responseJson: q.questionType === "MultipleResponse" || q.questionType === 2
            ? JSON.stringify({ SelectedOptionIds: [q.options[0].id] })
            : JSON.stringify({ SelectedOptionId: q.options[0].id }),
          isFlagged: false,
        },
        headers: { "X-CSRF-TOKEN": csrf },
      });
    }

    const submit1 = await request.post(`${API}/api/attempts/${attemptId}/submit`, {
      headers: { "X-CSRF-TOKEN": csrf },
    });
    expect(submit1.status()).toBe(200);
    const result1 = (await submit1.json()).data;
    expect(result1.status).toBe("Graded");
    expect(result1.reviewReleased).toBe(true); // seeded exams use the Immediate policy

    // Duplicate submission is idempotent
    const submit2 = await request.post(`${API}/api/attempts/${attemptId}/submit`, {
      headers: { "X-CSRF-TOKEN": csrf },
    });
    const result2 = (await submit2.json()).data;
    expect(result2.scorePercentage).toBe(result1.scorePercentage);
    expect(result2.correctQuestions).toBe(result1.correctQuestions);

    // Review corresponds to the submitted attempt and includes the released key
    const review = await request.get(`${API}/api/attempts/${attemptId}/review`);
    expect(review.status()).toBe(200);
    const reviewBody = (await review.json()).data;
    expect(reviewBody.attemptId).toBe(attemptId);
    expect(reviewBody.reviewReleased).toBe(true);
    const withKey = reviewBody.reviewQuestions.flatMap((q: { options: Array<{ isCorrect: boolean }> }) => q.options);
    expect(withKey.some((o: { isCorrect: boolean }) => o.isCorrect)).toBe(true);
  });

  test("Invalid credentials are rejected with 401 and profile changes cannot alter roles", async ({ request }) => {
    const csrf = await getCsrf(request);
    const bad = await request.post(`${API}/api/auth/login`, {
      data: { email: learnerA.email, password: "WrongPassword-Not-It-123" },
      headers: { "X-CSRF-TOKEN": csrf },
    });
    expect(bad.status()).toBe(401);

    await signIn(request, learnerA);
    // ASP.NET Core binds antiforgery tokens to the authenticated user, so the
    // token fetched before sign-in is rejected after authentication. Fetch a
    // fresh token for the authenticated session.
    const authenticatedCsrf = await getCsrf(request);
    const profile = await request.put(`${API}/api/auth/profile`, {
      data: {
        firstName: "Rbac Learner A Renamed",
        lastName: "Tester",
        displayName: "Rbac Learner A Renamed",
        role: "Superadmin",
      },
      headers: { "X-CSRF-TOKEN": authenticatedCsrf },
    });
    expect(profile.status()).toBe(200);
    const profileBody = (await profile.json()).data;
    expect(profileBody.role).toBe("Learner");
    expect(profileBody.name).toBe("Rbac Learner A Renamed");

    // Restore original name for the reconciliation evidence
    await request.put(`${API}/api/auth/profile`, {
      data: {
        firstName: learnerA.name,
        lastName: "Tester",
        displayName: learnerA.name,
      },
      headers: { "X-CSRF-TOKEN": await getCsrf(request) },
    });
  });
});
