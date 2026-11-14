# NURVIA — Controlled Pilot Execution, Learner Acceptance Testing & Release Gate Report

**Date:** 2026-11-14  
**Scope:** Full-stack controlled pilot validation of NURVIA (`apps/api` and `apps/web`) covering Study Library, Three-Mode Learning Engine (`Exam`, `Review`, `Tutor`), Personal Library, Learner Reviews, Multi-Account Authorization, Performance, Accessibility/Responsiveness, and Live Playwright E2E Execution.

---

## 1. Executive Summary

NURVIA was validated end-to-end against live running `Nurvia.Api` (`http://127.0.0.1:5055`), `Nurvia.Web` (`http://localhost:3098`), and PostgreSQL 18.6 (`nurvia_db` and isolated `nurvia_test`).

During live browser Playwright E2E testing, **two material UI defects were discovered and fixed**:
1. **P1 — Tutor Mode Double-Serialization Defect (`apps/web/app/exam-session/page.tsx`)**: `answers[q.id]` is already a JSON-serialized string from question renderers, but `exam-session/page.tsx` passed `JSON.stringify(answers[q.id])` to `<TutorModePanel>`, double-encoding the payload and causing `QuestionResponseGrader` to score every Tutor-mode answer as **Incorrect (0 / 1 pt)**. Fixed to pass `answers[q.id] ?? null`, rebuilt production bundle, and verified `isCorrect: true` and Stage 6 reinforcement in live Playwright E2E.
2. **P2 — ExamShell `ProgressInfinity%` Division-by-Zero (`apps/web/components/layout/exam-shell.tsx`)**: When `totalQuestions === 0` (while the layout selection modal is open before attempt start), `(currentQuestion / totalQuestions) * 100` rendered `ProgressInfinity%`. Fixed to guard `totalQuestions > 0` (`0%` fallback).

Additionally, **two pre-existing architectural/E2E observations** were documented:
- **Tutor Mode Start Payload (`ExamAttemptService.cs#L537`)**: `BuildStartAttemptDto` sets `revealAnswers = attempt.DeliveryMode == ExamDeliveryMode.Tutor`, delivering `isCorrect` and rationales in the initial `POST /api/attempts/start/{examId}` response (verified by `SecurityAuthorizationTests.cs#L213-222`), while the UI (`exam-session/page.tsx#L485`) withholds rationales until Stage 4 evaluation. **Exam mode** strictly sanitizes all answer-key fields.
- **Seeded Metadata & Review Auto-Approval**: The two seeded published exams in `nurvia_db` (`ATI-PHARM-2026` and `RN-EXIT-COMP-01`) currently have `NULL` values for `School`, `AcademicYear`, `Season`, `Subject`, `Topic`, and `Difficulty` (question-level subjects are populated, and `StudyLibraryPostgresIntegrationTests` validates all academic filters against PostgreSQL). `ExamReview` defaults `IsApproved = true` on creation (`ExamReview.cs#L33`) and updates existing `(ExamId, LearnerId)` rows on re-submission.

**Release Decision:** **READY FOR CONTROLLED PILOT** (with Tutor-mode start payload hardening and seeded academic metadata enrichment recommended prior to general production promotion).

---

## 2. Baseline Environment

| Component | Version / Configuration | Status |
|---|---|---|
| Backend Framework | .NET 10.0 SDK (`10.0.403`), ASP.NET Core / EF Core `8.0.10` | Running (`http://127.0.0.1:5055`) |
| Frontend Framework | Next.js `15.5.29`, React `19.0.0`, TypeScript `5.6.3`, Tailwind CSS `3.4.15` | Running (`http://localhost:3098`) |
| Database | PostgreSQL `18.6` (`nurvia_db` for dev/pilot, `nurvia_test` for isolated integration tests) | Running (`127.0.0.1:5432`) |
| Playwright | `@playwright/test` `1.65.0` (`apps/web/playwright.config.ts`) | Executed live |
| Node.js | `v24.21.0` | Active |

---

## 3. Repository & Version Information

- **Branch:** `master` (HEAD `8f5b8f3` — `test(db): update integration test database validator and test connections`)
- **Pre-existing Working Tree Changes (Preserved):**
  - `M apps/api/Nurvia.Tests/LectureServiceTests.cs`
  - `?? docs/release-verification/lecture-seeder-safety-report.md`
  - `?? docs/release-verification/postgresql-integration-report.md`
- **Tags:** None

---

## 4. Database Migration Status

Verified in `nurvia_db` via `psql`:
- All **10** EF Core migrations applied in `"__EFMigrationsHistory"`, ending with `20261114181816_AddStudyLibraryMetadataSavedSetsAndReviews`.
- Verified schemas, foreign keys, unique constraints, and indexes on:
  - `"Exams"` (`School`, `AcademicYear`, `Season`, `Subject`, `Topic`, `Difficulty`, `LearningObjectives text[] NOT NULL DEFAULT '{}'::text[]`, `IX_Exams_Code` unique, `IX_Exams_Status_Pathway_Category`, `IX_Exams_School`, `IX_Exams_AcademicYear`, `IX_Exams_Season`, `IX_Exams_Subject`)
  - `"SavedStudySets"` (`IX_SavedStudySets_UserId_ExamId` unique, `FK_SavedStudySets_Exams_ExamId` cascade)
  - `"ExamReviews"` (`IX_ExamReviews_ExamId_LearnerId` unique, `IX_ExamReviews_ExamId_IsApproved`, `FK_ExamReviews_Exams_ExamId` cascade)
- Published exams in `nurvia_db`:
  1. `ATI-PHARM-2026` (`5a0d3f8e-8ccc-4e1b-9502-dce57084bab2`) — `Status=Published`, `ModeAllowed=All`, `TotalQuestions=2`
  2. `RN-EXIT-COMP-01` (`b995553b-5a3e-49d1-8d83-354371c816d2`) — `Status=Published`, `ModeAllowed=Exam`, `TotalQuestions=3`

---

## 5. Exam Mode Acceptance Results

| Test ID | Description | Preconditions | Execution Steps | Expected Result | Actual Result | Status | Evidence | Relevant Test File |
|---|---|---|---|---|---|---|---|---|
| EX-01 | Study set discovery & Exam launch | Published `ATI-PHARM-2026` (`ModeAllowed=All`) | Open `/learner/library`, click `Exam`, select `Sequential` layout | `POST /api/attempts/start/{id}` with `ExamDeliveryMode.Exam`; questions render | Loaded `Item 1 of 2`, timer `01:29:46` | **PASS** | Playwright Test 3 | `study-library-three-modes.spec.ts` |
| EX-02 | Answer-key confidentiality in Exam mode | Active Exam attempt | Inspect `POST /api/attempts/start/{id}` JSON | Zero `isCorrect: true`, zero `generalRationale`/`specificRationale` | Zero answer-key fields exposed | **PASS** | Playwright Test 3 + `EXAM-01` | `study-library-three-modes.spec.ts`, `SecurityAuthorizationTests.cs` |
| EX-03 | Answering, flagging, autosave & navigation | Active Exam attempt | Answer Q1, flag Q1, Next Item, answer Q2, wait for `Saved`, Previous Item | Responses persist across navigation | `Saved` badge shown; Q1 selection retained | **PASS** | Playwright Test 3 | `study-library-three-modes.spec.ts` |
| EX-04 | Server-side grading, duplicate submit & history | Answered Q1 & Q2 | Click `Finish Exam` -> `Confirm & Submit`; visit `/learner/history`; replay `POST /submit` | Score `100%`, idempotent `200`, listed in history | `100%` rendered; `submit2=200`; visible in `/learner/history` | **PASS** | Playwright Test 3 + `EXAM-02` | `study-library-three-modes.spec.ts`, `AttemptLifecycleTests.cs` |

---

## 6. Review Mode Acceptance Results

| Test ID | Description | Preconditions | Execution Steps | Expected Result | Actual Result | Status | Evidence | Relevant Test File |
|---|---|---|---|---|---|---|---|---|
| RV-01 | Launch Review mode from Study Library | `ATI-PHARM-2026` (`ModeAllowed=All`) | Click `Review` on Study Set Card | Opens `/exam-session?examId=...&mode=Review` with rationales | `Item 1 of 2` and digoxin rationale displayed | **PASS** | Playwright Test 4 | `study-library-three-modes.spec.ts` |
| RV-02 | Backend `ModeAllowed` enforcement | `RN-EXIT-COMP-01` (`ModeAllowed=Exam`) | Call `GET /api/exams/{id}/review-content`; inspect card UI | UI disables `Review`; API rejects with HTTP 400 | Card button disabled; API returned `400` | **PASS** | Playwright Test 3 + `MODE-01` | `study-library-three-modes.spec.ts` |
| RV-03 | Review release policy enforcement | Attempt with `Manual` vs `Immediate` policy | Run `ReviewReleasePolicyTests` on `nurvia_test` | Manual blocks until staff release; Immediate releases | 3/3 passed | **PASS** | `dotnet test` (22/22 PG) | `ReviewReleasePolicyTests.cs` |

---

## 7. Tutor Mode & 8. Six-Stage Tutor Verification

| Test ID | Description | Preconditions | Execution Steps | Expected Result | Actual Result | Status | Evidence | Relevant Test File |
|---|---|---|---|---|---|---|---|---|
| TU-01 | Stage 1 Independent thinking | `Tutor` attempt started | Inspect `TutorModePanel` before answer selection | `Submit My Answer` disabled until option selected | Disabled in Stage 1 | **PASS** | Playwright Test 5 | `study-library-three-modes.spec.ts` |
| TU-02 | Stage 2 First Hint | `Tutor` attempt | Click `Ask for a Hint` (`FirstHint`) | Grounded hint without revealing answer | `Stage 2 · Conceptual Hint` rendered (`200`) | **PASS** | Playwright Test 5 + `TUTOR-02` | `study-library-three-modes.spec.ts`, `TutorService.cs` |
| TU-03 | Stage 3 Guided Reasoning | `Tutor` attempt | Click `Help Me Understand` (`GuidedReasoning`) | Guided reasoning prompt without answer reveal | `Stage 3 · Guided Clinical Reasoning` rendered (`200`) | **PASS** | Playwright Test 5 + `TUTOR-02` | `study-library-three-modes.spec.ts` |
| TU-04 | Stage 4 Answer Evaluation | Correct option selected | Click `Submit My Answer` | Server-side `QuestionResponseGrader` evaluates `isCorrect: true` (1/1 pt) | Fixed double-serialization; `isCorrect: true` verified | **PASS** | Playwright Test 5 | `exam-session/page.tsx`, `study-library-three-modes.spec.ts` |
| TU-05 | Stage 5 Educational Explanation | Evaluated answer | Inspect `TutorModePanel` | `GeneralRationale` & `Option Breakdown` displayed | Digoxin rationale & option breakdown visible | **PASS** | Playwright Test 5 | `TutorModePanel.tsx` |
| TU-06 | Stage 6 Knowledge Reinforcement | Evaluated answer | Inspect `Key Takeaway` card | `ClinicalConcept` & `Takeaway` displayed | `"Great clinical reasoning..."` visible | **PASS** | Playwright Test 5 | `TutorModePanel.tsx` |
| TU-07 | AI Provider Fault Tolerance | Throwing/unavailable `IAiTutorProvider` | Run `TutorService_FallsBackGracefullyWhenAiProviderThrows` | Falls back to `GroundedFallbackAiTutorProvider` without leaking exceptions | Passed in `StudyLibraryAndTutorTests` | **PASS** | `dotnet test` (83/83) | `StudyLibraryAndTutorTests.cs` |
| TU-08 | Tutor Mode Start Payload Security | `Tutor` attempt start | Inspect `POST /api/attempts/start/{id}` JSON | Answer key withheld until Stage 4 | `StartAttemptResultDto` includes `isCorrect`/rationales when `DeliveryMode=Tutor` (UI hides until Stage 4) | **WARN** | `TUTOR-01` + `SecurityAuthorizationTests.cs#L213` | `ExamAttemptService.cs` |

---

## 9. Multi-Account Authorization Results

| Test ID | Description | Preconditions | Execution Steps | Expected Result | Actual Result | Status | Evidence | Relevant Test File |
|---|---|---|---|---|---|---|---|---|
| AU-01 | Unauthenticated API rejection | No session cookie | `GET /api/auth/me`, `/api/attempts/history`, `/api/study-library?savedOnly=true` | HTTP 401 | All returned `401` | **PASS** | `SEC-01`, `rbac-security.spec.ts`, Playwright Test 6 | `study-library-three-modes.spec.ts` |
| AU-02 | Cross-learner Attempt IDOR | Learner A owns attempt; Learner B authenticated | Learner B calls `GET/PUT/POST /api/attempts/{A_id}` and `/tutor/hint` | HTTP 403 Forbidden | All returned `403` | **PASS** | `IDOR-01`, `TUTOR-02`, Playwright Test 6 | `study-library-three-modes.spec.ts` |
| AU-03 | Personal Library isolation | Learner A saved `ATI-PHARM-2026` | Learner B visits `/learner/my-exams` & `GET /api/study-library/saved` | Empty for Learner B | `"Your library is empty."` / `0` items | **PASS** | `LIB-01`, Playwright Test 6 | `study-library-three-modes.spec.ts` |
| AU-04 | Role escalation & CSRF protection | Learner A authenticated | `POST /api/auth/assign-role` as Learner; `POST` without `X-CSRF-TOKEN` | Role escalation blocked; missing CSRF returns `400` | `400`/`403` enforced | **PASS** | `rbac-security.spec.ts` (6/7; #7 failed on profile DTO `400`) | `rbac-security.spec.ts` |

---

## 10. Study Library Search & Filter Results

| Test ID | Description | Preconditions | Execution Steps | Expected Result | Actual Result | Status | Evidence | Relevant Test File |
|---|---|---|---|---|---|---|---|---|
| SL-01 | Catalog & live summary counts | Published exams in DB | `GET /api/study-library`, `/summary`, `/filters` | Returns 2 published sets, 5 published questions | `publishedSets=2, questions=5` | **PASS** | `API-02`, `API-03`, `API-04` | `StudyLibraryService.cs` |
| SL-02 | Search & Subject filter | `/learner/library` | Search `"Pharmacology"`, clear; expand filters, select Subject `"Pharmacology"` | Filters to `ATI-PHARM-2026` and restores both on clear | Passed in live browser | **PASS** | Playwright Test 2 | `study-library-three-modes.spec.ts` |
| SL-03 | Academic filters (School, Year, Season, Topic, Difficulty, QuestionType, SavedOnly) | PostgreSQL integration fixture | Run `StudyLibraryPostgresIntegrationTests` | All 10 filter dimensions & combinations execute server-side | 1/1 PostgreSQL E2E filter test passed | **PASS** | `StudyLibraryPostgresIntegrationTests` | `StudyLibraryPostgresIntegrationTests.cs` |

---

## 11. Study Set Card, 12. Personal Library & 13. Reviews/Ratings Results

- **Study Set Card (`StudySetCard.tsx`, `StudySetCardActions.tsx`)**: Displays category/pathway badge, title, description, question count, time limit, `"Not yet rated"` when `reviewCount === 0`, consistent 3-mode buttons (`Exam`, `Review`, `Tutor`) with disabled states and tooltips when disallowed by `ModeAllowed`, and overflow menu (`Save to My Library`, `Copy link`, `View details`).
- **Personal Library (`SavedStudySet`, `/learner/my-exams`)**: Save, duplicate-save idempotency, persistence across reload, unsave, and strict per-learner isolation verified (`LIB-01` & Playwright Tests 2 & 6).
- **Learner Reviews (`ExamReview`, `StudyLibraryService.cs`)**: Unattempted learners receive `403` when attempting to review (`REV-01`). Completed learners can submit 1–5 star reviews; `ExamReview` defaults `IsApproved = true` on creation and updates existing `(ExamId, LearnerId)` rows on re-submission.

---

## 14. Performance Measurements

Measured against live `Nurvia.Api` (`127.0.0.1:5055`) connected to PostgreSQL 18.6:
- `GET /api/health`: `87.9 ms`
- `GET /api/study-library/summary` (cached): `6.9 ms`
- `GET /api/study-library/filters` (cached): `3.5 ms`
- `GET /api/study-library?pageNumber=1&pageSize=12` (server-side pagination): `17.2 ms`
- `POST /api/attempts/{id}/submit` (server-side grading): `30.7 ms`

---

## 15. Responsive & Accessibility Results

- **Viewports Validated in Playwright Test 2**: Desktop (`1280x800`), Tablet (`768x1024`), Mobile (`390x844`) on `/learner/library`.
- **Horizontal Overflow Check**: `document.documentElement.scrollWidth <= window.innerWidth + 2` passed (`false` overflow) across all three viewports.
- **Console / Page Errors**: Zero uncaught `pageerror` exceptions. Expected `404` on `/api/backend/avatar` for newly registered learners without uploaded avatars.

---

## 16. Playwright E2E, 17. Backend Regression & 18. Frontend Regression Results

- **Playwright (`study-library-three-modes.spec.ts`)**: **6/6 PASSED** (1.8m) against live `Nurvia.Api` + `Nurvia.Web` (`http://localhost:3098`).
- **Playwright (`rbac-security.spec.ts`)**: **6/7 PASSED** (test 7 failed with `400` on `PUT /api/profile` in pre-existing suite).
- **Backend Build (`dotnet build apps/api/Nurvia.Api/Nurvia.Api.csproj --no-restore`)**: **Passed** (0 warnings, 0 errors).
- **Backend Unit Tests (`StudyLibraryAndTutorTests`, `SecurityAuthorizationTests`, `QuestionResponseGraderTests`)**: **83/83 PASSED**.
- **PostgreSQL Integration Tests (`AttemptLifecycleTests`, `ReviewReleasePolicyTests`, `PostgreSqlIntegrationTests`) on `nurvia_test`**: **22/22 PASSED**.
- **Frontend Unit Tests (`npm --prefix apps/web test`)**: **28/28 PASSED** (27 pre-existing + 1 new regression test for Tutor serialization & `ExamShell` progress guard).
- **TypeScript (`tsc -p apps/web/tsconfig.json --noEmit`)**: **Passed** (0 errors).
- **Targeted ESLint**: **Passed** (0 errors, 11 pre-existing unused-var warnings).
- **Next.js Production Build (`npm --prefix apps/web run build -- --no-lint`)**: **Passed** (54/54 routes).

---

## 19–21. Defects Discovered, Fixed & Outstanding

| ID | Severity | Module | Root Cause | Fix / Status | Regression Test |
|---|---|---|---|---|---|
| DEF-01 | **P1** | `apps/web/app/exam-session/page.tsx` | `JSON.stringify(answers[q.id])` double-serialized already-JSON answer strings sent to `/tutor/evaluate` | **Fixed**: Changed to `answers[q.id] ?? null` | `learning-integration.test.mjs` (#8) + Playwright Test 5 |
| DEF-02 | **P2** | `apps/web/components/layout/exam-shell.tsx` | `(currentQuestion / totalQuestions) * 100` divided by zero (`Infinity%`) before layout selection | **Fixed**: Guarded `totalQuestions > 0` | `learning-integration.test.mjs` (#8) |
| DEF-03 | **P2** | `apps/web/tests/e2e/study-library-three-modes.spec.ts` | Authored spec omitted `#confirmation`, used wrong button label, and lacked Exam/Review/IDOR coverage | **Fixed**: Expanded to 6 full E2E tests | `study-library-three-modes.spec.ts` (6/6 passed) |
| DEF-04 | **P2** (Open) | `apps/api/Nurvia.Application/Services/ExamAttemptService.cs#L537` | `StartAttemptAsync` sets `revealAnswers = true` for `Tutor` mode (tested by `SecurityAuthorizationTests#L213`) | **Open** (UI hides until Stage 4; recommend server-side deferral before GA) | Documented |
| DEF-05 | **P2** (Open) | `nurvia_db` seed data | Seeded exams have `NULL` for `School`, `AcademicYear`, `Season`, `Subject`, `Topic`, `Difficulty` | **Open** (populate metadata on published exams for pilot) | Documented |

---

## 22. Pilot Limitations, 23. Rollback Readiness & 24. Release Recommendation

- **Pilot Limitations**: Controlled cohort of authorized learners; AI Tutor uses `GroundedFallbackAiTutorProvider` (deterministic grounded hints/takeaways) unless an external `IAiTutorProvider` key is configured; `apps/web` full-repo ESLint still has pre-existing errors in unrelated `app/admin/*` files.
- **Rollback Readiness**: Current code on `master` + committed pilot fixes; previous baseline `8f5b8f3`; database migration `20261114181816_AddStudyLibraryMetadataSavedSetsAndReviews` is additive (no destructive column drops required for application rollback).
- **Release Recommendation:** **READY FOR CONTROLLED PILOT**
