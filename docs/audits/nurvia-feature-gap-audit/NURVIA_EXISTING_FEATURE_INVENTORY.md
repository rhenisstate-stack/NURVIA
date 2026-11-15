# NURVIA — Existing Feature Inventory

**Audit Date:** 2026-11-15  
**Scope:** Full verification of `apps/web`, `apps/api`, and database schema (`NurviaDbContext` + EF Core Migrations).

---

## 1. Classification Key

- **IMPLEMENTED:** End-to-end verified in frontend, backend controller/service, and database entity.
- **PARTIALLY IMPLEMENTED:** Core exists, but material requirements or UI/backend wiring are missing.
- **PRESENTATION ONLY:** Frontend route/UI exists using hardcoded mock data or `setTimeout` stubs without backend persistence.
- **BACKEND ONLY:** Backend controller/service/entity exists without frontend UI integration.
- **NOT IMPLEMENTED:** No credible implementation evidence across frontend, backend, or database.

---

## 2. Learner Experience Inventory

| Feature | Frontend Route / Component | Backend Endpoint / Service | DB Entity | Status |
|---|---|---|---|---|
| **Registration** | `/sign-up` (`nurviaApi.register`) | `POST /api/auth/register` (`AuthService.RegisterAsync`) | `UserAccounts` | **IMPLEMENTED** |
| **Login & Session** | `/sign-in` (`AuthProvider.signIn`) | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | `UserAccounts` | **IMPLEMENTED** |
| **Password Recovery** | None | None | None | **NOT IMPLEMENTED** |
| **Profile & Pathway** | `/learner/profile`, `/learner/account` | `GET/PUT /api/profile`, `PUT /api/auth/profile` | `UserProfiles` | **IMPLEMENTED** |
| **Avatar Upload/View/Delete** | `UserAvatar.tsx`, `/learner/profile` | `POST/GET/DELETE /api/avatar`, `GET /api/avatar/{storageKey}` | `UserProfiles.AvatarStorageKey` + local storage | **IMPLEMENTED** |
| **Learner Dashboard** | `/learner` (`nurviaApi.getAttemptHistory`, `getExams`) | `GET /api/attempts/history`, `GET /api/exams` | `ExamAttempts`, `Exams` | **IMPLEMENTED** |
| **Exam Catalog & Study Library** | `/exams`, `/study`, `/learner/library`, `/learner/library/[id]` | `GET /api/study-library`, `filters`, `summary`, `{examId}` | `Exams`, `ExamVersions`, `ExamReviews` | **IMPLEMENTED** |
| **Saved Study Sets (My Library)** | `/learner/my-exams`, `StudySetCardActions.tsx` | `GET /api/study-library/saved`, `POST/DELETE /api/study-library/saved/{examId}` | `SavedStudySets` | **IMPLEMENTED** |
| **Custom Practice** | `/learner/custom-practice` | `GET /api/exams?status=Published&pathway=...` | `Exams` | **PARTIALLY IMPLEMENTED** (Pathway filter only; no custom question count/topic builder) |
| **Attempt History** | `/learner/history` | `GET /api/attempts/history` | `ExamAttempts` | **IMPLEMENTED** |
| **Attempt Result & Review** | `/learner/attempts/[id]`, `/exam-session?attemptId=...&mode=Review` | `GET /api/attempts/{id}/review`, `GET /api/exams/{id}/review-content` | `ExamAttempts`, `AttemptResponses` | **IMPLEMENTED** |
| **Performance Dashboard** | `/learner/performance` | `GET /api/attempts/history` | `ExamAttempts` | **PARTIALLY IMPLEMENTED** (Overall count & average only; no topic/subject/cognitive skill breakdown or export) |
| **Study Planner** | `/learner/planner` | None | None | **PRESENTATION ONLY** (Hardcoded 4 tasks & May 15, 2026 countdown) |
| **Study Guides** | `/learner/guides` | None | None | **PRESENTATION ONLY** (Hardcoded 5 guides; Download PDF button has no handler) |
| **Mark K. Lectures** | `/mark-k`, `/mark-k/[slug]` | `GET /api/lectures`, `GET /api/lectures/{slug}` | `Lectures` | **IMPLEMENTED** |
| **Flashcards (SRS)** | `/learner/flashcards` | None | None | **PRESENTATION ONLY** (Hardcoded 3-card array; no SRS or persistence) |
| **Care Plans** | `/care-plans`, `/learner/care-plans` | None | None | **PRESENTATION ONLY** (Hardcoded 2-item array) |
| **Dosage Calculators** | `/learner/calculators`, `ExamShell` modal | Client-side math only | N/A | **PARTIALLY IMPLEMENTED** (Gravity IV drip rate only; no peds weight-based or titration; no zero-hour guard) |
| **AI Tutor (Standalone)** | `/learner/ai-tutor`, `FloatingStudyChat.tsx` | None | None | **PRESENTATION ONLY** (`setTimeout` keyword-matching stub) |
| **Tutor Mode (In-Exam)** | `TutorModePanel.tsx` in `/exam-session` | `POST /api/attempts/{id}/tutor/hint`, `evaluate`, `GET session` | `AttemptResponses.TutorStageReached` | **IMPLEMENTED** (Deterministic 6-stage progressive guidance; `GroundedFallbackAiTutorProvider.IsAvailable => false`) |
| **Saved / Flagged Questions** | `/learner/saved-questions` | None | None (`AttemptResponses.IsFlagged` exists per-attempt, no cross-attempt bookmark endpoint) | **PRESENTATION ONLY** (Hardcoded `sq-1`, `sq-2`; broken link to `/exam-session`) |
| **Community** | `/community`, `/learner/community` | None | None | **PRESENTATION ONLY** (Hardcoded 2-item array; non-clickable replies/likes) |
| **Subscription & Billing** | `/learner/subscription` | None | None | **PRESENTATION ONLY** (Hardcoded plans; non-functional upgrade button) |
| **Notifications & Security Settings** | `/learner/settings`, `/learner/settings/security` | Partial / None | None | **PARTIALLY IMPLEMENTED** (No notification center or password change backend endpoint) |

---

## 3. Examination & 18 Question Types Inventory

`QuestionType` enum (`Nurvia.Domain/Enums/DomainEnums.cs`) and `QuestionRendererRegistry.tsx` map 18 canonical types:

| # | QuestionType | Frontend Renderer | Backend Validation (`QuestionVersion.Validate`) | Backend Grader (`QuestionResponseGrader.Evaluate`) | Status |
|---|---|---|---|---|---|
| 1 | `MultipleChoice` / `SingleChoice` (1, 18) | `SingleChoiceRenderer` | >= 2 options, 1 correct | Exact `IsCorrect` | **IMPLEMENTED** |
| 2 | `MultipleResponse` / `SATA` (2) | `MultipleResponseRenderer` | >= 3 options, >= 1 correct | Set equality + partial fraction | **IMPLEMENTED** |
| 3 | `TrueFalse` (3) | `TrueFalseRenderer` | 2 options, 1 correct | Exact `IsCorrect` | **IMPLEMENTED** |
| 4 | `Cloze` / `FillInTheBlank` (4) | `FillInTheBlankRenderer` | Option/text check | Case-insensitive text match | **IMPLEMENTED** |
| 5 | `NumericCalculation` (5) | `NumericCalculationRenderer` | Numeric check | Decimal within `0.01m` tolerance | **IMPLEMENTED** |
| 6 | `OrderedResponse` (6) | `OrderedResponseRenderer` | >= 3 options | Positional match + partial fraction | **IMPLEMENTED** |
| 7 | `Matching` (7) | `MatchingRenderer` | Even/odd option pairs | Pairwise match + partial fraction | **IMPLEMENTED** |
| 8 | `MatrixGrid` (8) | `MatrixGridRenderer` | `ContentJsonData` check | `CorrectSelections` key (falls back to `LegacyCredit` if missing!) | **PARTIALLY IMPLEMENTED** |
| 9 | `ClinicalCaseStudy` (9) | `CaseStudyRenderer` | >= 1 exhibit or `ContentJsonData` | **`LegacyCredit` (100% for any non-empty JSON)** | **PARTIALLY IMPLEMENTED** |
| 10 | `BowTie` (10) | `BowTieRenderer` | `ContentJsonData` check | 5-slot partial credit (falls back to `LegacyCredit` if missing!) | **PARTIALLY IMPLEMENTED** |
| 11 | `MultipleTrueFalse` (11) | `MultipleTrueFalseRenderer` | >= 2 options or `ContentJsonData` | `CorrectTrueFalse` key (falls back to `LegacyCredit` if missing!) | **PARTIALLY IMPLEMENTED** |
| 12 | `ImageBased` (12) | `ImageBasedRenderer` | >= 1 image exhibit + >= 2 options | `IsCorrect` (no true coordinate hotspot grading) | **PARTIALLY IMPLEMENTED** |
| 13 | `MultipleImageSelection` (13) | `MultipleImageSelectionRenderer` | >= 2 options, >= 1 correct | Set equality + partial fraction | **IMPLEMENTED** |
| 14 | `DragAndDrop` (14) | `DragAndDropRenderer` | >= 2 options or `ContentJsonData` | `CorrectBuckets` key (falls back to `LegacyCredit` if missing!) | **PARTIALLY IMPLEMENTED** |
| 15 | `ExtendedResponse` (15) | `ExtendedResponseRenderer` | Rationale/text check | **`LegacyCredit` (100% for any non-empty JSON); no manual grading** | **PARTIALLY IMPLEMENTED** |
| 16 | `TabularResponse` (16) | `TabularResponseRenderer` | Option check | `SelectedOptionId` `IsCorrect` | **IMPLEMENTED** |
| 17 | `ShortAnswer` (17) | `ShortAnswerRenderer` | Option check | Case-insensitive text match | **IMPLEMENTED** |
| — | Highlighting / Trend Item | None | None | None | **NOT IMPLEMENTED** |

---

## 4. Administrative Modules Inventory

| Admin Route | Backend API Used | Status |
|---|---|---|
| `/admin` (Overview) | None | **PRESENTATION ONLY** (Hardcoded `contentPipeline`: 12,450 published, `recentQuestions`) |
| `/admin/questions`, `/new`, `/[id]/edit` | `GET/POST/PUT /api/questions/*`, `validate`, `submit`, `review`, `publish`, `archive`, `versions` | **IMPLEMENTED** |
| `/admin/exams` | `GET/POST/PUT /api/exams/*`, `validate`, `submit`, `approve`, `publish`, `archive`, `release-review`, `versions`, `preview` | **IMPLEMENTED** |
| `/admin/reviews` | `GET /api/questions`, `GET /api/exams`, `review` / `approve` | **IMPLEMENTED** |
| `/admin/lectures` | `GET/POST/PUT /api/lectures/management/*`, `submit-for-review`, `review`, `publish`, `archive` | **IMPLEMENTED** |
| `/admin/audit` | None (`GET /api/audit-logs` exists on backend!) | **PRESENTATION ONLY** (Backend exists, UI uses hardcoded `AUD-1049`..`AUD-1046`) |
| `/admin/rbac` | None (`POST /api/auth/assign-role` exists on backend!) | **PRESENTATION ONLY** (Backend endpoint exists, UI uses hardcoded 4 roles) |
| `/admin/analytics` | None | **PRESENTATION ONLY** (Hardcoded cohort metrics) |
| `/admin/cases` | None | **PRESENTATION ONLY** (Hardcoded `CS-401`..`CS-404`) |
| `/admin/learners` | None | **PRESENTATION ONLY** (Hardcoded `LRN-7701`..`LRN-7704`) |
| `/admin/plans` | None | **PRESENTATION ONLY** (Hardcoded 4 pricing tiers) |
| `/admin/question-types` | None | **PRESENTATION ONLY** (Hardcoded 6 of 18 types) |
| `/admin/settings` | None | **PRESENTATION ONLY** (Hardcoded DB pool & "Gemini 1.5 Pro Clinical") |
| `/admin/taxonomy` | None | **PRESENTATION ONLY** (Hardcoded 4 NCSBN categories) |

---

## 5. Database Entities Inventory (`NurviaDbContext`)

17 persisted `DbSet<T>` tables across 11 migrations:
1. `UserAccounts`, `UserProfiles`
2. `Questions`, `QuestionVersions`, `QuestionOptions`, `QuestionExhibits`, `QuestionReviews`
3. `Exams`, `ExamVersions`, `ExamQuestions`, `ExamBlueprints`, `SavedStudySets`, `ExamReviews`
4. `ExamAttempts`, `AttemptResponses`
5. `Lectures`
6. `AuditLogs`
