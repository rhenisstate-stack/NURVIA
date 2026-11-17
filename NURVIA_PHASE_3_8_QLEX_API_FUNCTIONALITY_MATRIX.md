# NURVIA Phase 3.8 — Complete Qlex API Functionality Matrix (All 59 Routes)

| # | Qlex Source Path | NURVIA Implementation Path | Decision | Status | Backend Endpoint | Test Status | Notes / Blocker |
|---|---|---|---|---|---|---|---|
| 1 | `auth/login/route.ts` | `app/api/auth/login/route.ts` | **PRESERVE / ADAPT** | Implemented | `POST /api/castoline/auth/login` | Unit PASS; Live BLOCKED (Deslizar) | `EXT-01`: Deslizar challenge required |
| 2 | `auth/register/route.ts` | `app/api/auth/register/route.ts` | **PRESERVE** | Implemented | `POST /api/castoline/auth/register` | Unit PASS; Live BLOCKED (Deslizar) | `EXT-01`: `Challenge` field required |
| 3 | `auth/logout/route.ts` | `app/api/auth/logout/route.ts` | **PRESERVE** | Implemented | `POST /api/castoline/auth/logout/sessions/{distinct,relative}` | Unit PASS | Server-side HttpOnly revocation + clear |
| 4 | `auth/session/route.ts` | `app/api/auth/me/route.ts` | **REJECT** | Replaced by `/api/auth/me` | `GET /api/castoline/auth/system/user` (obsolete) | Live probe: Page Not Found | NURVIA uses `/system/user/list/current?fetchtype=current` |
| 5 | `auth/account/destroy/route.ts` | `app/api/auth/account/destroy/route.ts` | **ADAPT** | **Implemented (3.8)** | `POST /api/castoline/auth/account/destroy` | Unit PASS | Verifies caller `guidId`/`email` server-side |
| 6 | `auth/validate/route.tsx` | `app/api/auth/validate/route.ts` | **ADAPT** | **Implemented (3.8)** | `GET /api/castoline/strata/support/validate` | Unit PASS | Allowlisted `token` & `context` |
| 7 | `auth/recovery/password/route.ts` | `app/api/backend/[...path]/route.ts` | **BLOCKED** | Backend 302 | `POST /api/castoline/auth/recovery/password` | Live probe: `302` | `EXT-03`: Recovery route not active on `explicitbackend.com` |
| 8 | `auth/recovery/social/route.ts` | None | **REJECT** | Excluded | `POST /api/castoline/auth/recovery/social` | N/A | Social auth out of scope |
| 9–14 | `auth/social/{apple,facebook,github,google,linkedin,microsoft}/route.ts` | None | **REJECT** | Excluded | `GET /api/castoline/auth/social/*` | N/A | Social OAuth not provisioned for `website 11` |
| 15 | `auth/social/onetap/route.ts` | None | **REJECT** | Excluded | `POST /api/castoline/auth/social/onetap` | N/A | Hardcodes `skew8lancasto`, exposes tokens |
| 16–22 | `auth/support/{2fa,account,email,message,password,phone,social}/route.ts` | None | **REJECT** | Excluded | `/api/castoline/strata/support/*` | N/A | Unguarded CRUD proxies, not in NURVIA product |
| 23 | `media/[...path]/route.ts` | `app/api/avatar/[storageKey]/route.ts` | **PRESERVE** | Implemented | `GET /api/avatar/{storageKey}` | Unit PASS | Strict `SAFE_STORAGE_KEY_REGEX` |
| 24 | `seek/route.ts` | `app/api/seek/route.ts` | **ADAPT** | **Implemented (3.8)** | `GET/DELETE /api/castoline/strata/seek/{absolute,distinct,suggest,history}` | Unit PASS | Query allowlist, auth on `suggest`/`history`, CSRF on `DELETE` |
| 25 | `system/backends/route.ts` | `app/api/auth/config-status/route.ts` | **REJECT** | Replaced | None | Unit PASS | Never expose backend URLs |
| 26–28 | `system/{license,privilege,role}/route.ts` | `app/api/backend/[...path]/route.ts` | **REJECT** | Staff allowlist | `/api/auth/assign-role` | Unit PASS | Unprotected Qlex admin routes rejected |
| 29–32 | `users/controls/registration/{control,option}/route.ts`, `users/controls/session/route.ts`, `users/seed/route.ts` | None | **REJECT** | Excluded | `/api/castoline/system/user/*` | Live probe: `session` `302` | `users/seed` is unauthenticated seeding; `session` `302` |
| 33 | `users/user/route.ts` | `app/api/auth/me/route.ts` | **PRESERVE** | Implemented | `GET /api/castoline/system/user/list/current?fetchtype=current` | Unit PASS | `list/absolute` `302` on backend |
| 34–35 | `nexus/dominion/subscription/{item,package}/route.ts` | `app/api/backend/[...path]/route.ts` | **BLOCKED** | Proxy allowlisted | `/api/castoline/nexus/dominion/*` | Live probe: `302` | Subscription packages return `302` on `explicitbackend.com` |
| 36 | `nexus/strata/assessment/assessment/route.ts` | `app/api/strata/[resource]/route.ts` | **ADAPT** | **Upgraded (3.8)** | `/api/castoline/strata/assessment/assessments/*` | Unit PASS | Full `fetchtype` + staff `POST`/`PUT`/`DELETE` |
| 37 | `nexus/strata/assessment/exam/route.ts` | `app/api/strata/[resource]/route.ts` | **ADAPT** | **Upgraded (3.8)** | `/api/castoline/strata/assessment/exams/*` | Unit PASS | Full `fetchtype` + staff `POST`/`PUT`/`DELETE` |
| 38 | `nexus/strata/assessment/exam/diy/route.ts` | `app/api/exams/diy/route.ts` | **ADAPT** | **Implemented (3.8)** | `POST /api/castoline/strata/assessment/exams/diy/learning/store` | Unit PASS | CSRF, auth, `TotalQuestions` bounds |
| 39 | `nexus/strata/assessment/exam/upserts/route.ts` | None | **BLOCKED** | Backend 302 | `POST /api/castoline/strata/assessment/exams/upserts` | Live probe: `302` | Returns `302` on `explicitbackend.com` |
| 40 | `nexus/strata/assessment/question/route.ts` | `app/api/strata/[resource]/route.ts` | **ADAPT** | **Upgraded (3.8)** | `/api/castoline/strata/assessment/questions/*` | Unit PASS | Full `fetchtype` + staff `POST`/`PUT`/`DELETE` |
| 41 | `nexus/strata/assessment/result/route.ts` | `app/api/backend/[...path]/route.ts` | **BLOCKED** | Backend 302 | `/api/castoline/strata/assessment/results/*` | Live probe: `302` | Returns `302` on `explicitbackend.com` |
| 42 | `nexus/strata/assessment/section/route.ts` | `app/api/strata/[resource]/route.ts` | **ADAPT** | **Upgraded (3.8)** | `/api/castoline/strata/assessment/sections/*` | Unit PASS | Full `fetchtype` + staff `POST`/`PUT`/`DELETE` |
| 43–44 | `nexus/strata/content/{cognition,document}/route.ts` | None | **REJECT** | Excluded | `/api/castoline/strata/{cognition,documents}/*` | N/A | Multipart content upload out of scope |
| 45–50 | `nexus/strata/institution/{cohort,department,division,institution,school,strataclass}/route.ts` (6 files) | `app/api/strata/[resource]/route.ts` | **ADAPT** | **Upgraded (3.8)** | `/api/castoline/strata/institution/{cohorts,departments,divisions,institutions,schools,classes}/*` | Unit PASS | Preserves verified `classes` path; full CRUD |
| 51–58 | `nexus/strata/learning/{concept,course,fact,lesson,program,subject,topic,unit}/route.ts` (8 files) | `app/api/strata/[resource]/route.ts` | **ADAPT** | **Upgraded (3.8)** | `/api/castoline/strata/learning/{concepts,courses,facts,lessons,programs,subjects,topics,units}/*` | Unit PASS | Live `courses` `200` & `store` `400`; full CRUD |
| 59–61* | `nexus/strata/main/{category,domain,subcategory}/route.ts` (3 files) | `app/api/strata/[resource]/route.ts` | **ADAPT** | **Upgraded (3.8)** | `/api/castoline/strata/main/{categories,domains,subcategories}/*` | Unit PASS | Full `fetchtype` + staff `POST`/`PUT`/`DELETE` |

*(59 total files in `Qlex/src/app/api`: 22 `auth/*`, 1 `media`, 1 `seek`, 4 `system`, 5 `users`, 26 `nexus`.)*
