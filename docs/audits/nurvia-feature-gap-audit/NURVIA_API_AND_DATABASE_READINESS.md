# NURVIA — API and Database Readiness Assessment

**Audit Date:** 2026-11-15  
**Local API:** `apps/api/Nurvia.Api` (`net10.0`, EF Core `8.0.10`, PostgreSQL `Npgsql 8.0.10`)  
**Configured Remote API:** `http://108.61.9.189:8008` (`LexmaCasto` / Master Bank)

---

## 1. Deployed Remote API vs. Local `apps/api` Reality

| Endpoint Group | Local `apps/api` | Remote `108.61.9.189:8008` | Frontend (`api-client.ts`) | Readiness |
|---|---|---|---|---|
| `GET /api/health` & `/health` | `/api/health` (`200 OK`) | `/health` (`200 OK`); `/api/health` (`302 -> /web/restoration/lost`) | Not called directly | **Mismatch** |
| `GET /swagger/v1/swagger.json` | Enabled in `Development` | Disabled (`302 -> /web/restoration/lost`) | N/A | **Unavailable Remotely** |
| `/api/auth/*` (`csrf`, `register`, `login`, `me`, `logout`, `profile`, `assign-role`) | **Implemented** (`AuthController.cs`) | `302 -> /web/restoration/lost` (uses `/api/castoline/auth/*` requiring `Missing site headers`) | Calls `/api/auth/*` | **Blocked on Remote** |
| `/api/profile`, `/api/avatar/*` | **Implemented** (`ProfileController.cs`, `AvatarController.cs`) | Unverified / `302` | Calls `/api/profile`, `/api/avatar` | **Blocked on Remote** |
| `/api/questions/*` (10 endpoints) | **Implemented** (`QuestionsController.cs`) | `302 -> /web/restoration/lost` | Calls `/api/questions/*` | **Blocked on Remote** |
| `/api/exams/*` (13 endpoints) | **Implemented** (`ExamsController.cs`) | `302 -> /web/restoration/lost` | Calls `/api/exams/*` | **Blocked on Remote** |
| `/api/attempts/*` (9 endpoints incl. `/tutor/*`) | **Implemented** (`ExamAttemptsController.cs`) | `302 -> /web/restoration/lost` | Calls `/api/attempts/*` | **Blocked on Remote** |
| `/api/study-library/*` (9 endpoints) | **Implemented** (`StudyLibraryController.cs`) | `302 -> /web/restoration/lost` | Calls `/api/study-library/*` | **Blocked on Remote** |
| `/api/lectures/*` (10 endpoints) | **Implemented** (`LecturesController.cs`) | `302 -> /web/restoration/lost` | Calls `/api/lectures/*` | **Blocked on Remote** |
| `GET /api/audit-logs` | **Implemented** (`AuditLogsController.cs`) | `302 -> /web/restoration/lost` | Defined in `api-client.ts`, **unused by `/admin/audit`** | **Backend Ready / UI Mock** |

---

## 2. Missing Backend API Contracts (Required for Existing UI & Roadmap)

1. **Auth & Account:** `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/change-password`, `POST /api/auth/refresh`, `GET /api/users` (admin user directory for `/admin/rbac` & `/admin/learners`).
2. **Analytics & Reporting:** `GET /api/attempts/analytics` (subject, topic, `CognitiveSkill`, `ClientNeedCategory` breakdown), `GET /api/admin/analytics` (real pipeline counts & cohort stats).
3. **NGN Case Studies & Manual Grading:** `POST/GET/PUT /api/case-studies/*`, `POST /api/attempts/{id}/responses/{responseId}/grade` (instructor/reviewer manual grading).
4. **Question of the Day:** `GET /api/qotd/today?pathway=RN|PN_LPN`, `POST /api/qotd/{id}/answer`, `GET /api/qotd/streak`, `POST /api/admin/qotd`.
5. **Study Resources & Saved Questions:** `GET/POST/DELETE /api/saved-questions/*`, `GET/POST/PUT /api/care-plans/*`, `GET/POST/PUT /api/study-guides/*`, `GET/POST /api/flashcards/*`.
6. **AI Tutor (Standalone):** `POST /api/tutor/conversations`, `GET /api/tutor/conversations/{id}`, `POST /api/tutor/conversations/{id}/messages`.
7. **Community & Study Groups:** `GET/POST /api/community/posts`, `POST /api/community/posts/{id}/replies`, `POST /api/community/posts/{id}/report`, `GET/POST /api/study-groups/*`.
8. **Subscriptions & Entitlements:** `GET /api/plans`, `POST /api/subscriptions/checkout`, webhook handler, `SubscriptionGuard` middleware/policy.

---

## 3. Database Architecture & Schema Readiness

### Existing Schema (`NurviaDbContext.cs` — 17 Tables, 11 Migrations)
- **Identity & Profile:** `UserAccounts` (single `Role` string, `IsActive`, `NormalizedEmail`), `UserProfiles` (`Pathway`, `Country`, `City`, `Organization`, `AvatarStorageKey`).
- **Content & Versioning:** `Questions` -> `QuestionVersions` -> `QuestionOptions`, `QuestionExhibits`, `QuestionReviews`; `Exams` -> `ExamVersions` -> `ExamQuestions`, `ExamBlueprints`; `Lectures`.
- **Learner Activity:** `ExamAttempts` (snapshots `ExamVersionId`, `DeliveryMode`, `LayoutMode`, `StartedAtUtc`, `SubmittedAtUtc`, `ScorePercentage`), `AttemptResponses` (`QuestionVersionId`, `ResponseJson`, `IsFlagged`, `IsCorrect`, `PointsAwarded`, `TutorStageReached`).
- **Engagement & Governance:** `SavedStudySets`, `ExamReviews`, `AuditLogs`.
- **Observations:**
  - `IAuditableEntity` (`CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`) is consistently applied.
  - No `IsDeleted` soft-delete global query filter; content uses `ContentStatus.Archived` / `ExamStatus.Archived`.
  - No `InstitutionId` / multi-tenant isolation column exists yet.
  - `Exam` already has `School`, `AcademicYear`, `Season`, `Subject`, `Topic`, `Difficulty`, `LearningObjectives` — **missing `Country` and `Curriculum`**.

### Proposed Additive Schema Changes (Preserving Existing Records)
1. **Auth & Security:** `PasswordResetTokens`, `RefreshTokens` (hashed token, expiry, revoked timestamp).
2. **NGN Case Studies:** `CaseStudies`, `CaseStudySteps` (ordered links to `Question` + `ExhibitPhase` progression), `AttemptResponse.GradingStatus` (`AutoGraded`, `PendingManualReview`, `ManuallyGraded`).
3. **QOTD & SRS:** `DailyQuestionSchedules`, `DailyQuestionAttempts`, `FlashcardDecks`, `Flashcards`, `FlashcardProgress` (SM-2 ease factor, interval, next review date), `SavedQuestions`.
4. **Clinical Studio & AI:** `CarePlans`, `StudyGuides`, `TutorConversations`, `TutorMessages` (with token usage & rate-limit tracking).
5. **Community & Subscriptions:** `CommunityPosts`, `CommunityReplies`, `CommunityReactions`, `ContentReports`, `StudyGroups`, `StudyGroupMembers`, `SubscriptionPlans`, `UserSubscriptions`.
6. **Catalogue Expansion:** Add `Country` and `Curriculum` nullable columns to `Exams` and `TEAS`/`NCK`/`NMC_CBT` to `ExamCategory`.
