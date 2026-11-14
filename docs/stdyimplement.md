# Phase 0 Audit Report — NURVIA Study Library & Three-Mode Learning Experience

**Date:** 2026-11-14  
**Scope:** Full-stack audit of `apps/api` (ASP.NET Core 8 / Clean Architecture / EF Core / PostgreSQL) and `apps/web` (Next.js 15 / React 19 / TypeScript / Tailwind CSS).

---

## 1. Existing Capabilities (To Reuse)

### Backend (`apps/api`)
- **Clean Architecture & Modular Monolith**: `Nurvia.Domain`, `Nurvia.Application`, `Nurvia.Infrastructure`, `Nurvia.Api`, `Nurvia.Tests`.
- **Examination & Question Bank Aggregates**:
  - `Exam`, `ExamVersion`, `ExamBlueprint`, `ExamQuestion` (`Nurvia.Domain/Exams`).
  - `Question`, `QuestionVersion`, `QuestionOption`, `QuestionExhibit`, `QuestionReview` (`Nurvia.Domain/Questions`).
  - Full publication lifecycle (`Draft` → `PendingReview` → `Approved` → `Published` → `Archived`) with immutable published versions.
  - 18 canonical `QuestionType` values and NGN/CJMM `CognitiveSkill` & `ClientNeedCategory` enums.
  - `ExamDeliveryMode` enum already supports `Review = 1`, `Exam = 2`, `Tutor = 3`, `All = 4`.
- **Attempt Engine (`ExamAttemptService` & `ExamAttemptsController`)**:
  - `POST /api/attempts/start/{examId}` (supports `Exam` and `Tutor` delivery modes, `Sequential` and `AllInOne` layout modes).
  - `GET /api/attempts/{id}` (session recovery + deadline check).
  - `PUT /api/attempts/{id}/responses` (autosave answer + flag).
  - `POST /api/attempts/{id}/submit` (idempotent grading via `QuestionResponseGrader` across all 18 question types).
  - `GET /api/attempts/{id}/review` and `GET /api/attempts/history`.
  - `GET /api/exams/{id}/review-content` (stateless review content subject to `ReviewReleasePolicy`).
- **Authentication & RBAC**: Cookie-based JWT (`nurvia_session`) + CSRF (`X-CSRF-TOKEN`) + imperative role checks (`HttpContext.HasRole(...)`).

### Frontend (`apps/web`)
- **Learner Shell (`LearnerShell`)**: Persistent sidebar with `Study Library` (`/learner/library`), `My Library` (`/learner/my-exams`), `Attempt History` (`/learner/history`), `Performance` (`/learner/performance`), global search bar, theme toggle, and profile menu.
- **Exam Session Engine (`/exam-session`)**: Supports `Exam`, `Review`, and `Tutor` modes, timer with auto-submit, debounced autosave, question grid modal, flagging, and all 18 question renderers in `QuestionRendererRegistry`.
- **Existing Study Library (`StudyLibraryView`)**: Wired to `nurviaApi.getExams({ status: "Published", ... })` (no mock data fallback).
- **Test Suites**: 4 Node.js frontend test suites (`npm test` — 27/27 passing) and Playwright E2E tests (`tests/e2e/`).

---

## 2. Findings & Gap Classification (P0 – P3)

### P0 — Critical Security, Correctness & Core Feature Gaps
1. **Complex Question Answer Key Leak in Exam Mode (`ExamAttemptService.cs:556`)**:
   - `BuildStartAttemptDto` passes `ContentJsonData = qv.ContentJsonData` verbatim even when `revealAnswers == false` (`ExamDeliveryMode.Exam`). For complex NGN types (`BowTie`, `MatrixGrid`, `MultipleTrueFalse`, `DragAndDrop`, `Cloze`, `OrderedResponse`, `Matching`, `TabularResponse`, `NumericCalculation`, `ShortAnswer`), answer keys (`Correct*` properties) are stored inside `ContentJsonData` and leak to the browser during an active exam.
   - **Required Fix**: Sanitize `ContentJsonData` on the backend when `revealAnswers == false` to strip all answer-key properties before sending `ActiveExamQuestionDto` to the client.
2. **Learner Cannot View Study Set / Exam Details (`ExamsController.cs`)**:
   - `GET /api/exams/{id:guid}` explicitly rejects `Learner` with `403 Forbidden`. There is no learner-accessible study-set detail endpoint.
   - **Required Fix**: Add a learner-accessible `GET /api/study-library/{id}` (or `GET /api/exams/{id}/details`) endpoint returning published metadata, instructions, learning objectives, mode availability, ratings summary, and saved status—strictly for `ExamStatus.Published` exams.
3. **Mode Availability Bypass & Disabled Mode UX**:
   - `StudyLibraryView.tsx` hides unavailable modes instead of showing disabled buttons with clear explanations, and backend `GetExamReviewContentAsync` needs to verify `ModeAllowed` includes `Review` (or `All`) just as `StartAttemptAsync` checks `ModeAllowed` for `Exam` and `Tutor`.
4. **Tutor Mode Lacks Progressive Guided Learning (Stages 1–6) & AI Abstraction**:
   - Currently, `Tutor` mode on `/exam-session` immediately sends `IsCorrect` and `GeneralRationale` in `StartAttemptResultDto` and reveals the answer as soon as an option is clicked, without progressive hints, guided reasoning, or an AI service abstraction.
   - **Required Fix**: Implement a backend `ITutorService` (with an explicit AI provider abstraction + deterministic fallback grounded in stored rationales/exhibits/clinical concepts) and Tutor endpoints (`POST /api/attempts/{id}/tutor/hint`, `POST /api/attempts/{id}/tutor/explain`) supporting progressive stages (Independent thinking → First hint → Guided reasoning → Answer evaluation → Educational explanation → Knowledge reinforcement) without leaking answer keys prematurely.

### P1 — High-Priority Study Library, Filtering, Personal Library & Reviews
5. **Missing Academic & Examination Metadata (`School`, `Year`, `Season`, `Subject`, `Topic`, `Difficulty`)**:
   - `Exam` currently has `Pathway`, `Category`, `ModeAllowed`, `TimeLimitMinutes`, `PassingScorePercentage`, `TotalQuestions`. It lacks scalar/filterable fields for `School`, `AcademicYear`, `Season`, `Subject`, `Topic`, `Difficulty`, `LearningObjectives`, and `QuestionType` filtering.
   - **Required Fix**: Add normalized/indexed columns (or metadata fields) to `Exam` / `ExamVersion` via a PostgreSQL migration, expose data-driven filter options (`GET /api/study-library/filters`) derived strictly from actual published exams and their questions, and support server-side filtering + sorting + pagination in `GET /api/study-library` (or `GET /api/exams`).
6. **Personal Library (Saved Study Sets) Does Not Exist**:
   - `/learner/my-exams` currently only lists in-progress and completed attempts, not saved study sets. There is no `SavedStudySet` table or API.
   - **Required Fix**: Add `SavedStudySet` entity (`UserId`, `ExamId`, `SavedAtUtc`) with unique constraint `(UserId, ExamId)`, endpoints (`GET /api/library/saved`, `POST /api/library/saved/{examId}`, `DELETE /api/library/saved/{examId}`), and UI integration on Study Library cards, detail page, and `/learner/my-exams` / `/learner/library`.
7. **Authentic Learner Ratings, Reviews & Testimonials Do Not Exist**:
   - `StudyLibraryView` cards do not show ratings, review counts, or testimonials. No `ExamReview` (learner rating/review) table exists.
   - **Required Fix**: Add `ExamReview` entity (`ExamId`, `LearnerId`, `Rating` 1–5, `Comment`, `IsApproved`, `CreatedAtUtc`) with unique constraint `(ExamId, LearnerId)` and eligibility check (learner must have a submitted/graded attempt for that exam). Never fabricate ratings—display `"Not yet rated"` when `reviewCount == 0`.
8. **Live Catalog Statistics & Server-Side Pagination**:
   - `StudyLibraryView` currently fetches `pageSize: 100` without pagination controls, debounced search, URL query sync, or live catalog statistics (total published study sets, total available questions, examination categories).
   - **Required Fix**: Upgrade `StudyLibrary` with debounced server-side search, URL query param sync, pagination controls, and real backend catalog stats (`GET /api/study-library/summary` or enhanced `/api/catalogue/summary`).

### P2 — Medium-Priority UX, Review Mode & Performance Enhancements
9. **Review Mode Enhancements**:
   - Support configurable review behaviors: immediate feedback vs end-of-session feedback, filtering by incorrect answers and flagged questions, and subject/topic performance breakdown in results.
10. **Study Set Card & Detail Page Architecture**:
    - Refactor monolithic `StudyLibraryView` into modular components (`StudyLibraryHeader`, `StudyLibrarySearch`, `StudyLibraryCategoryTabs`, `StudyLibraryAdvancedFilters`, `StudyLibraryResultsHeader`, `StudySetGrid`, `StudySetCard`, `StudySetCardActions` with overflow menu, `StudySetDetails`, `StudyModeLauncher`, `StudyLibraryEmptyState`, `StudyLibraryLoadingState`).
    - Add dedicated Study Set Detail route (`/learner/library/[id]` and `/exams/[id]`).
11. **Backend Caching**:
    - Add `IMemoryCache` for public/published Study Library catalog & filter metadata, invalidated on exam publish/archive/review changes.

### P3 — Low-Priority / Out-of-Scope Secondary Pages
12. Secondary `/learner/*` pages (`/learner/planner`, `/learner/guides`, `/learner/flashcards`, `/learner/care-plans`, `/learner/community`, `/learner/subscription`) still use static/mock data; these are outside the core Study Library & Three-Mode Learning Experience scope and should remain untouched unless needed.

---

## 3. Baseline Test Status
- **Frontend Unit Tests (`npm --prefix apps/web test`)**: 27/27 passed across 4 suites (`navigation-and-carousel`, `learning-integration`, `question-renderers`, `hero-redesign`).
- **Backend Tests (`dotnet test`)**: Investigating `vstest.console` testhost connection timeout in sandboxed environment.
