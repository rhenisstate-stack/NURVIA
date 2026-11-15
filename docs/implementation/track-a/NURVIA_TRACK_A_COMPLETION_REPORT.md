# NURVIA Track A Local Completion & Verification Report

**Date:** 2026-11-15  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Branch:** `master`  
**Base Checkpoint:** `a4affc2` (all 6 prior Track A commits preserved; `apps/web/tsconfig.tsbuildinfo` preserved)  
**Scope:** Local Frontend + Local ASP.NET Core Backend + Local PostgreSQL (`nurvia_db` / isolated `nurvia_test`)  
**Hosted Backend (`108.61.9.189:8008`):** Explicitly out of scope (handled separately; not modified).  

---

## A. Executive Summary

- **Local Integration Restored:** Updated `apps/web/.env.local` (`SKEW_LINE_DOTNET_BASE_URL=http://127.0.0.1:5055`) so the Next.js frontend proxies `/api/backend/*` to the local ASP.NET Core backend (`Nurvia.Api`) connected to PostgreSQL `nurvia_db`.
- **Database & Migrations:** Applied `20261115135502_AddPasswordResetTokens` and created + applied `20261115151022_AddSavedQuestionsAndStudyPlanner` (`SavedQuestions`, `StudyPlanTasks`) to `nurvia_db`. Verified all migrations on isolated `nurvia_test`.
- **Local Password Recovery:** Added `DevelopmentEmailSink` (registered only in `Development`) with `GET /api/dev/emails` and `DELETE /api/dev/emails` (mapped only in `Development`), enabling end-to-end local password recovery testing from `/forgot-password` through `/reset-password` to sign-in. Production continues to use `LoggingEmailSender` / pending SMTP configuration.
- **Admin Modules Completed:** Replaced hardcoded mock data and `PreviewBanner` placeholders on `/admin`, `/admin/learners`, `/admin/question-types`, `/admin/analytics`, `/admin/taxonomy`, `/admin/settings`, and `/admin/cases` with live `AdminController` (`/api/admin/*`) and `/api/questions` persistence. Classified `/admin/plans` transparently as an out-of-scope future billing module.
- **Learner Modules Completed:** Implemented persisted `SavedQuestions` (`/api/learner/saved-questions`) and `StudyPlanTasks` (`/api/learner/planner`) with learner ownership enforcement, and wired `/learner/saved-questions` and `/learner/planner` to PostgreSQL. Classified `/learner/subscription`, `/learner/guides`, and standalone `/learner/ai-tutor` chat transparently (linking `/learner/ai-tutor` to Tutor-mode exam sessions and `/learner/guides` to live Mark K. lectures & Study Library).
- **Overall Local Release Recommendation:** **LOCAL APPLICATION ACCEPTED WITH NON-BLOCKING LIMITATIONS** (hosted backend integration and production SMTP credentials remain separate external dependencies).

---

## B. Repository Preservation

- **Branch:** `master` (ahead of `origin/master`, no pushes, no deploys, no history rewrites)
- **Preserved Track A Commits:** `2ac8c27`, `8298001`, `f294390`, `06f1e6b`, `adb7fc1`, `a4affc2`
- **Preserved Unstaged File:** `apps/web/tsconfig.tsbuildinfo`
- **No `git push`, no `git reset`, no `git rebase`, no `git clean` executed.**

---

## C. Local Environment

- **Frontend URL:** `http://localhost:3005` (Next.js App Router dev server; port `3000` was occupied by an unrelated local app)
- **Backend URL:** `http://127.0.0.1:5055` (`Nurvia.Api`, `Development`)
- **Development Database:** `nurvia_db` on `localhost:5432`
- **Isolated Test Database:** `nurvia_test` on `localhost:5432` (validated by `DatabaseEnvironmentValidator`)
- **Proxy Configuration:** `apps/web/.env.local` sets `SKEW_LINE_DOTNET_BASE_URL=http://127.0.0.1:5055`; `next.config.mjs` rewrites `/api/backend/:path*` to `http://127.0.0.1:5055/api/:path*`.

---

## D. Backend Completion

- **Domain (`Nurvia.Domain`):** Added `SavedQuestion` (`Questions/SavedQuestion.cs`) and `StudyPlanTask` (`Accounts/StudyPlanTask.cs`).
- **Persistence (`Nurvia.Infrastructure`):** Added `SavedQuestionConfiguration`, `StudyPlanTaskConfiguration`, `DbSet`s on `NurviaDbContext` / `INurviaDbContext`, and migration `20261115151022_AddSavedQuestionsAndStudyPlanner`.
- **Services (`Nurvia.Application` & `Nurvia.Infrastructure`):**
  - `AdminDashboardService` (`GetOverviewAsync`, `GetLearnersAsync`, `GetQuestionTypesAsync`, `GetAnalyticsAsync`, `GetTaxonomyAsync`)
  - `SavedQuestionsService` (`GetSavedQuestionsAsync`, `SaveQuestionAsync`, `RemoveSavedQuestionAsync`)
  - `StudyPlannerService` (`GetTasksAsync`, `CreateTaskAsync`, `UpdateTaskAsync`, `DeleteTaskAsync` with duration/title/exam validation and learner ownership)
  - `DevelopmentEmailSink` (Development-only `IEmailSender` implementation)
- **Controllers & Endpoints (`Nurvia.Api`):**
  - `Program.cs`: `/api/health` now checks `dbContext.Database.CanConnectAsync(ct)` and reports `Application` + `Database` availability (`503` if DB unavailable). Development-only `/api/dev/emails` (`GET`/`DELETE`) mapped inside `if (app.Environment.IsDevelopment())`.
  - `AdminController`: `GET /api/admin/overview`, `GET /api/admin/learners`, `GET /api/admin/question-types`, `GET /api/admin/analytics`, `GET /api/admin/taxonomy`, `GET /api/admin/system-status`.
  - `LearnerToolsController`: `GET/POST/DELETE /api/learner/saved-questions`, `GET/POST/PUT/DELETE /api/learner/planner`.
  - `appsettings.Development.json`: Added `http://localhost:3005` and `http://127.0.0.1:3005` to `Cors:AllowedOrigins`.

---

## E. Frontend Completion

- **`apps/web/lib/api-client.ts`:** Added `getAdminOverview`, `getAdminLearners`, `getAdminQuestionTypes`, `getAdminAnalytics`, `getAdminTaxonomy`, `getAdminSystemStatus`, `getSavedQuestions`, `saveQuestion`, `removeSavedQuestion`, `getPlannerTasks`, `createPlannerTask`, `updatePlannerTask`, `deletePlannerTask`.
- **Admin Pages:**
  - `/admin`: Wired to `getAdminOverview` (live question, exam, learner, case study counts, pipeline, and recent questions).
  - `/admin/learners`: Wired to `getAdminLearners` with live search and CSV export.
  - `/admin/question-types`: Wired to `getAdminQuestionTypes` displaying all 18 canonical renderers, grading modes, and persisted counts.
  - `/admin/analytics`: Wired to `getAdminAnalytics` with pathway breakdown and CSV export.
  - `/admin/taxonomy`: Wired to `getAdminTaxonomy` displaying Client Needs counts, subjects, topics, and pathways.
  - `/admin/settings`: Wired to `getAdminSystemStatus` (read-only runtime & DB diagnostics).
  - `/admin/cases`: Wired to `getQuestions({ questionType: "ClinicalCaseStudy" })`.
  - `/admin/plans`: Clearly labeled `Out of Scope — Future Module` (billing not enabled).
- **Learner Pages:**
  - `/learner/saved-questions`: Wired to `getSavedQuestions` & `removeSavedQuestion`.
  - `/learner/planner`: Wired to `getPlannerTasks`, `createPlannerTask`, `updatePlannerTask`, `deletePlannerTask`, and `getExams`.
  - `/learner/subscription`, `/learner/guides`, `/learner/ai-tutor`: Removed fake metrics/mock chat; clearly labeled future modules or linked to live Tutor-mode exam sessions and Mark K. / Study Library.

---

## F. Database Verification

- **Isolated Test DB:** `nurvia_test` (`DatabaseEnvironmentValidator` enforces `DOTNET_ENVIRONMENT=Test` and `Database=nurvia_test`).
- **Migrations Applied to `nurvia_db`:** `20261115135502_AddPasswordResetTokens`, `20261115151022_AddSavedQuestionsAndStudyPlanner`.
- **Production:** Untouched.

---

## G. Security Verification

- **Authentication & CSRF:** Verified via `rbac-security.spec.ts` (401 unauthenticated, CSRF rejection without token, inactive user rejection).
- **RBAC:** Verified learner 403 on `/api/admin/overview`, `/api/admin/learners`, and admin route redirects.
- **Rate Limiting & RBAC E2E Root Cause Remediation:**
  - **Root Cause:** Running `rbac-security.spec.ts` alone triggered `429 Too Many Requests` on Test #7 (`signIn(learnerA)`) because `learnerA` performed 5 `signIn` calls across Tests #3–#6 plus 1 invalid-credential attempt in Test #7 (6 attempts in ~22.6s), exceeding `LoginPermitLimitPerAccount = 5` (per 60s window) in `AccountRateLimiter`. Additionally, running all Playwright specs sequentially from `127.0.0.1` shared the single IP partition (`LoginPermitLimitPerIp = 10`, `RegisterPermitLimitPerIp = 5`, `PasswordResetPermitLimitPerIp = 5`).
  - **Corrective Change:** Added explicit, environment-gated test partition isolation via `X-Nurvia-Test-Partition` in `AuthRateLimiting.cs` (`GetTestPartitionKey`, `GetClientIpPartitionKey`, `IAccountRateLimiter`) and `AuthController.cs`. The header is honored **only** when `IHostEnvironment` is `Development` or `Test` (always ignored in `Production`/`Staging`). Production rate limits (`10/min` IP, `5/min` account) remain completely unchanged, and rate limiting remains active within each partition.
  - **Regression & 429 Verification:** Added 3 xUnit tests in `AuthRateLimitingTests.cs` (proving `Production`/`Staging` ignore `X-Nurvia-Test-Partition` and `Development`/`Test` isolate partitions while enforcing quotas) and a dedicated Playwright test in `rbac-security.spec.ts` proving that 6 rapid login attempts within a single partition return HTTP `429` with a valid `Retry-After` header.
- **Password Recovery & Development Email Isolation:**
  - `DevelopmentEmailSink` is registered only inside `if (builder.Environment.IsDevelopment())` in `Program.cs`.
  - `GET /api/dev/emails` and `DELETE /api/dev/emails` are mapped only inside `if (app.Environment.IsDevelopment())` in `Program.cs` (inaccessible in Production).
  - Production/fallback `LoggingEmailSender` logs only the recipient email domain and never logs reset tokens or full reset URLs.
  - Verified end-to-end locally via `DevelopmentEmailSink` (token reset, token replay rejection, old password rejection, new password sign-in).

---

## H. Test Results

### Backend (`Release` Build + `Nurvia.Tests` against isolated PostgreSQL `nurvia_test`)
- Build Command: `dotnet build apps/api/Nurvia.slnx -c Release` → **Succeeded (0 warnings, 0 errors)**
- Test Command: `$env:DOTNET_ENVIRONMENT="Test"; $env:TEST_CONNECTION_STRING="Host=localhost;Port=5432;Database=nurvia_test;..."; dotnet test apps/api/Nurvia.Tests/Nurvia.Tests.csproj -c Release --no-build -- xUnit.ParallelizeTestCollections=false`
- **Passed:** 270 | **Failed:** 0 | **Skipped:** 0 (includes all auth/rate-limiting, RBAC, password recovery, admin/learner persistence, and PostgreSQL integration tests)
- EF Core Snapshot Check: `dotnet ef migrations has-pending-model-changes --project apps/api/Nurvia.Infrastructure/Nurvia.Infrastructure.csproj --startup-project apps/api/Nurvia.Api/Nurvia.Api.csproj --no-build --configuration Release` → **`No changes have been made to the model since the last migration.`**

### Frontend Static & Unit Checks
- `npx tsc --noEmit`: **0 errors**
- `npm run lint`: **0 errors** (250 pre-existing warnings)
- `npm test`: **6/6 test scripts passed**

### Playwright E2E (`E2E_WEB_URL=http://localhost:3005`, `E2E_API_URL=http://127.0.0.1:5055`)
- `learner-journey.spec.ts`: **11 passed, 0 failed**
- `local-track-a-completion.spec.ts`: **2 passed, 0 failed**
- `rbac-security.spec.ts`: **8 passed, 0 failed** (all 7 original RBAC/security tests + new 429 `Retry-After` burst test)
- **Pre-existing Non-Track-A E2E Suites (run with `nurvia_db`):**
  - `lectures-and-admin.spec.ts`: 2 failed (requires `Lectures:PublishSeededCatalogue=true` and clean `BootstrapAdmin` credentials matching `nurvia_db`)
  - `superadmin-navigation.spec.ts`: 1 failed, 9 skipped (requires clean `BootstrapAdmin` credentials on `nurvia_db`, which already had a pre-existing Superadmin)
  - `study-library-three-modes.spec.ts`: 1 passed, 1 timed out at 90s on `/learner/my-exams` (`Saved Study Sets` heading), 4 skipped

---

## I. Git Status & Exclusions

- **Preserved Commits:** All 6 prior Track A commits (`2ac8c27`, `8298001`, `f294390`, `06f1e6b`, `adb7fc1`, `a4affc2`) and 5 pre-existing commits (`271f36d`, `3aab62e`, `ccd8eeb`, `fd726b9`, `2b8df3c`) plus local Track A completion commits (`6f7dbca`, `a798a90`, `15a09df`, `58eca0b`) remain intact. No push, deploy, reset, rebase, or history rewrite performed.
- **Excluded from Commits:** `apps/web/tsconfig.tsbuildinfo`, transient Playwright artifacts (`apps/web/tests/e2e/artifacts/*`), `docs/evidence/*`, and local `.env*` files.

---

## I. Remaining Blockers

1. **Local Blockers:** None.
2. **Hosted Backend Dependencies (Out of Scope):** `108.61.9.189:8008` (`LexmaCasto`) remains incompatible and excluded from this mission.
3. **External SMTP Provider (Blocked Externally):** Production email delivery requires configuring an SMTP/transactional `IEmailSender` implementation and credentials.
4. **Future Product Roadmap (Out of Scope):** Subscription billing (`/admin/plans`, `/learner/subscription`), downloadable PDF Study Guides (`/learner/guides`), Spaced Repetition Flashcards (`/learner/flashcards`), Community Forum, and full NGN unfolding simulator.

---

## J. Final Acceptance

**Decision:** **LOCAL APPLICATION ACCEPTED WITH NON-BLOCKING LIMITATIONS**

All in-scope local frontend, backend, and PostgreSQL workflows are implemented, integrated, and verified; only external production SMTP credentials and the separately tracked hosted backend remain pending.
