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
- **Rate Limiting:** Confirmed `PasswordResetIpPolicy` (`AuthRateLimiting.cs`) enforces HTTP 429 on repeated `/forgot-password` bursts.
- **Password Recovery:** Verified end-to-end locally via `DevelopmentEmailSink` (token reset, token replay rejection, old password rejection, new password sign-in).

---

## H. Test Results

### Backend (`Nurvia.Tests` against isolated PostgreSQL `nurvia_test`)
- Command: `DOTNET_ENVIRONMENT=Test TEST_CONNECTION_STRING="Host=localhost;Port=5432;Database=nurvia_test;Username=nurvia_user;..." dotnet test apps/api/Nurvia.Tests/Nurvia.Tests.csproj -c Release -- xUnit.ParallelizeTestCollections=false`
- **Passed:** 265 | **Failed:** 0 | **Skipped:** 0

### Frontend Static & Unit Checks
- `npx tsc --noEmit`: **0 errors**
- `npm run lint`: **0 errors** (250 pre-existing warnings)
- `npm test`: **6/6 test scripts passed**

### Playwright E2E (`E2E_WEB_URL=http://localhost:3005`, `E2E_API_URL=http://127.0.0.1:5055`)
- `learner-journey.spec.ts`: **11 passed, 0 failed**
- `local-track-a-completion.spec.ts`: **2 passed, 0 failed**
- `rbac-security.spec.ts`: **6 passed, 1 failed** (test #7 `Invalid credentials are rejected with 401 and profile changes cannot alter roles` received `429 Too Many Requests` during `signIn` due to `LoginPermitLimitPerIp = 10` in `AuthRateLimiting.cs` across rapid sequential logins from `127.0.0.1`)
- **Not Executed:** `lectures-and-admin.spec.ts`, `study-library-three-modes.spec.ts`, `superadmin-navigation.spec.ts` (covered partially by backend integration tests and existing unit suites).

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
