# NURVIA — Controlled Pilot Release Checklist

**Release Gate Decision:** READY FOR CONTROLLED PILOT  
**Target Release:** Study Library & Three-Mode Learning Experience (`Exam`, `Review`, `Tutor`)

---

## Pre-Pilot Verification Gates

- [x] **PostgreSQL Migrations Current**: `20261114181816_AddStudyLibraryMetadataSavedSetsAndReviews` applied on target DB; `LearningObjectives` default `'{}'::text[]` verified.
- [x] **Backend Build**: `dotnet build apps/api/Nurvia.Api/Nurvia.Api.csproj --no-restore` — 0 errors, 0 warnings.
- [x] **Backend Unit Tests**: 83/83 passed (`StudyLibraryAndTutorTests`, `SecurityAuthorizationTests`, `QuestionResponseGraderTests`).
- [x] **PostgreSQL Integration Tests**: 22/22 passed on `nurvia_test` (`AttemptLifecycleTests`, `ReviewReleasePolicyTests`, `PostgreSqlIntegrationTests`).
- [x] **Frontend Build & Typecheck**: `tsc --noEmit` (0 errors), `next build --no-lint` (54/54 routes), `npm --prefix apps/web test` (28/28 passed).
- [x] **Targeted ESLint**: 0 errors on Study Library, `exam-session`, `exam-shell`, and E2E spec files.
- [x] **Live Playwright E2E**: `study-library-three-modes.spec.ts` — 6/6 passed against live `Nurvia.Api` + `Nurvia.Web`.
- [x] **Exam-Mode Confidentiality**: Verified `POST /api/attempts/start/{id}` in Exam mode strips all `IsCorrect`, `GeneralRationale`, `SpecificRationale`, and NGN answer-key mappings.
- [x] **Multi-Account Isolation**: Verified cross-learner IDOR (`403`) on attempts/tutor and Personal Library isolation.

## Operational Readiness Before Onboarding Pilot Cohort

- [ ] **Environment Configuration**: Verify `JwtSettings:Secret`, `ConnectionStrings:DefaultConnection`, and `BootstrapAdmin` settings are configured via environment secrets (never committed).
- [ ] **Database Backup**: Take a verified `pg_dump` snapshot of `nurvia_db` prior to pilot launch.
- [ ] **Study Set Metadata**: Populate `School`, `AcademicYear`, `Season`, `Subject`, `Topic`, and `Difficulty` on published pilot exams so all Study Library filter dropdowns are populated.
- [ ] **Monitoring**: Enable logging/alerts for HTTP `5xx` responses, failed `/api/attempts/{id}/submit`, autosave `PUT` errors, and PostgreSQL connection health (`/api/health`).
- [ ] **Pilot Cohort Onboarding**: Provision synthetic/authorized pilot learner accounts across standard, entitled, and restricted access profiles; test across desktop, tablet, and mobile viewports.

## Post-Pilot Gate for General Production Promotion

- [ ] **Defer Tutor-Mode Answer Key**: Update `ExamAttemptService.BuildStartAttemptDto` (and `SecurityAuthorizationTests.cs#L213`) so `Tutor` mode does not include `isCorrect`/rationales in `StartAttemptResultDto` prior to Stage 4 evaluation.
- [ ] **Resolve Pre-Existing `rbac-security.spec.ts` #7**: Verify `PUT /api/profile` payload contract in `rbac-security.spec.ts`.
- [ ] **Resolve Pre-Existing Admin ESLint Errors**: Clean up `@typescript-eslint/no-explicit-any` in unrelated `app/admin/*` routes so `next build` passes without `--no-lint`.
