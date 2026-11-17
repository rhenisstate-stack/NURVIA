# NURVIA Phase 3.8 — Complete API Migration Matrix (All 59 Qlex Routes)

Classifications: `IMPLEMENTED` | `ADAPT` | `MIGRATE` | `REPLACE` | `EXCLUDE` | `BLOCKED`

| # | Qlex Route Path | NURVIA Path | Decision | Status | Backend Endpoint | Verification | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `auth/login/route.ts` | `app/api/auth/login/route.ts` | **ADAPT** | Implemented | `POST /api/castoline/auth/login` | Unit PASS + Live probe PASS (`learner.login.skew8lancasto` accepted) | Attaches temporary challenge server-side |
| 2 | `auth/register/route.ts` | `app/api/auth/register/route.ts` | **ADAPT** | Implemented | `POST /api/castoline/auth/register` | Unit PASS + Live probe PASS (`register-skew8@lancasto` accepted) | Attaches temporary challenge server-side |
| 3 | `auth/logout/route.ts` | `app/api/auth/logout/route.ts` | **IMPLEMENTED** | Implemented | `POST /api/castoline/auth/logout/sessions/{distinct,relative}` | Unit PASS | Server HttpOnly cookie revocation |
| 4 | `auth/session/route.ts` | `app/api/auth/me/route.ts` | **REPLACE** | Replaced | `GET /api/castoline/auth/system/user` (Page Not Found) | Live probe confirmed obsolete | Uses `/system/user/list/current?fetchtype=current` |
| 5 | `auth/account/destroy/route.ts` | `app/api/auth/account/destroy/route.ts` | **MIGRATE** | Implemented | `POST /api/castoline/auth/account/destroy` | Unit PASS + Live probe `400` | Verifies caller `guidId`/`email` server-side |
| 6 | `auth/validate/route.tsx` | `app/api/auth/validate/route.ts` | **MIGRATE** | Implemented | `GET /api/castoline/strata/support/validate` | Unit PASS + Live probe `400` | Enforces `token` & `context` |
| 7 | `auth/recovery/password/route.ts` | `app/api/backend/[...path]/route.ts` | **BLOCKED** | Backend 302 | `POST /api/castoline/auth/recovery/password` | Live probe `302` | `EXT-3.8-04` |
| 8 | `auth/recovery/social/route.ts` | None | **EXCLUDE** | Excluded | `POST /api/castoline/auth/recovery/social` | N/A | Social auth not used in NURVIA |
| 9–14 | `auth/social/{apple,facebook,github,google,linkedin,microsoft}/route.ts` (6) | None | **EXCLUDE** | Excluded | `GET /api/castoline/auth/social/*` | N/A | Social OAuth not provisioned for `website 11` |
| 15 | `auth/social/onetap/route.ts` | None | **EXCLUDE** | Excluded | `POST /api/castoline/auth/social/onetap` | N/A | Google One Tap not provisioned |
| 16–22 | `auth/support/{2fa,account,email,message,password,phone,social}/route.ts` (7) | None | **EXCLUDE** | Excluded | `/api/castoline/strata/support/*` | N/A | Unguarded support CRUD not in NURVIA product |
| 23 | `media/[...path]/route.ts` | `app/api/avatar/[storageKey]/route.ts` | **IMPLEMENTED** | Implemented | `GET /api/avatar/{storageKey}` | Unit PASS | Strict `SAFE_STORAGE_KEY_REGEX` |
| 24 | `seek/route.ts` | `app/api/seek/route.ts` | **MIGRATE** | Implemented | `GET/DELETE /api/castoline/strata/seek/*` | Unit PASS + Live probes `200`/`400`/`401` | Allowlisted params + CSRF on `DELETE` |
| 25 | `system/backends/route.ts` | `app/api/auth/config-status/route.ts` | **EXCLUDE** | Replaced | None | Unit PASS | Unsafe URL disclosure rejected |
| 26–28 | `system/{license,privilege,role}/route.ts` (3) | `app/api/backend/[...path]/route.ts` | **EXCLUDE** | Staff proxy | `/api/auth/assign-role` | Unit PASS | Unguarded Qlex admin routes rejected |
| 29–32 | `users/controls/registration/{control,option}`, `users/controls/session`, `users/seed` (4) | None | **EXCLUDE** | Excluded | `/api/castoline/system/user/*` | Live probe `session` `302` | `users/seed` is unauthenticated seeding |
| 33 | `users/user/route.ts` | `app/api/auth/me/route.ts` | **IMPLEMENTED** | Implemented | `GET /api/castoline/system/user/list/current?fetchtype=current` | Unit PASS + Live probe `401` | `list/absolute` `302` on backend |
| 34–35 | `nexus/dominion/subscription/{item,package}/route.ts` (2) | `app/api/backend/[...path]/route.ts` | **BLOCKED** | Backend 302 | `/api/castoline/nexus/dominion/*` | Live probe `302` | `EXT-3.8-04` |
| 36–37 | `nexus/strata/assessment/{assessment,exam}/route.ts` (2) | `app/api/strata/[resource]/route.ts` | **ADAPT** | Upgraded | `/api/castoline/strata/assessment/{assessments,exams}/*` | Unit PASS | Full `fetchtype` + staff CRUD |
| 38 | `nexus/strata/assessment/exam/diy/route.ts` | `app/api/exams/diy/route.ts` | **MIGRATE** | Implemented | `POST /api/castoline/strata/assessment/exams/diy/learning/store` | Unit PASS + Live probe `400` | CSRF, auth, `TotalQuestions` bounds |
| 39 | `nexus/strata/assessment/exam/upserts/route.ts` | None | **BLOCKED** | Backend 302 | `POST /api/castoline/strata/assessment/exams/upserts` | Live probe `302` | `EXT-3.8-04` |
| 40 | `nexus/strata/assessment/question/route.ts` | `app/api/strata/[resource]/route.ts` | **ADAPT** | Upgraded | `/api/castoline/strata/assessment/questions/*` | Unit PASS | Full `fetchtype` + staff CRUD |
| 41 | `nexus/strata/assessment/result/route.ts` | `app/api/backend/[...path]/route.ts` | **BLOCKED** | Backend 302 | `/api/castoline/strata/assessment/results/*` | Live probe `302` | `EXT-3.8-04` |
| 42 | `nexus/strata/assessment/section/route.ts` | `app/api/strata/[resource]/route.ts` | **ADAPT** | Upgraded | `/api/castoline/strata/assessment/sections/*` | Unit PASS | Full `fetchtype` + staff CRUD |
| 43–44 | `nexus/strata/content/{cognition,document}/route.ts` (2) | None | **EXCLUDE** | Excluded | `/api/castoline/strata/{cognition,documents}/*` | N/A | Multipart content upload out of scope |
| 45–50 | `nexus/strata/institution/{cohort,department,division,institution,school,strataclass}/route.ts` (6) | `app/api/strata/[resource]/route.ts` | **ADAPT** | Upgraded | `/api/castoline/strata/institution/{...,classes}/*` | Unit PASS | Preserves `classes`; full `fetchtype` + staff CRUD |
| 51–58 | `nexus/strata/learning/{concept,course,fact,lesson,program,subject,topic,unit}/route.ts` (8) | `app/api/strata/[resource]/route.ts` | **ADAPT** | Upgraded | `/api/castoline/strata/learning/*` | Unit PASS + Live `200`/`400` | Full `fetchtype` + staff CRUD |
| 59* | `nexus/strata/main/{category,domain,subcategory}/route.ts` (3) | `app/api/strata/[resource]/route.ts` | **ADAPT** | Upgraded | `/api/castoline/strata/main/*` | Unit PASS | Full `fetchtype` + staff CRUD |
