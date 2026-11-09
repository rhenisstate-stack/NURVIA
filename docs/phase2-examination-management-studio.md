# NURVIA — Phase 2 Engineering Report
## Examination Management Studio & Question Bank Builder
**Project:** NURVIA — *Your Path to Nursing Confidence*  
**Date:** November 9, 2026  
**Git Branch:** `master`  
**Database:** PostgreSQL 16/18 (`nurvia_db` on `localhost:5432`)  
**Backend:** ASP.NET Core 8 Web API (`apps/api`)  
**Frontend:** Next.js 15 App Router (`apps/web`)  
**Brand Identity:** Midnight Navy (`#142B4A`) + Intelligent Teal (`#0D9488`)

---

## 1. Executive Summary

Phase 2 of NURVIA establishes the foundational content management and examination governance infrastructure that will power all upcoming learner testing modes (Review, Exam, and Tutor). 

Rather than treating questions as isolated database rows or static mocks, Phase 2 implements a robust **Examination Management Studio and Question Bank Builder** following Clean Architecture principles. It enforces strict editorial workflows, immutable published versions, Next Generation NCLEX (NGN) clinical judgment models, and PostgreSQL relational integrity.

### Core Achievements
1. **Repository & Architecture Reconciliation**: Conducted a thorough baseline audit of Phase 1 artifacts. Upgraded frontend foundations to Next.js 15.5.29 and configured PostgreSQL persistence through Entity Framework Core 8 on Npgsql.
2. **Domain-Driven Design (DDD) Aggregates**:
   - `Question` Aggregate: Root entity managing code, pathway, taxonomy, concurrency tokens, and immutable `QuestionVersion` history with associated `QuestionOption`, `QuestionExhibit`, and `QuestionReview` entities.
   - `Exam` Aggregate: Root entity managing examination blueprints, target questions, timing, delivery modes, and strict publishing integrity constraints.
3. **Clinical Content Invariants**:
   - State machine: `Draft` $\rightarrow$ `ValidationFailed` $\rightarrow$ `PendingReview` $\rightarrow$ `Approved` $\rightarrow$ `Published` $\rightarrow$ `Archived` / `Rejected`.
   - Immutable Publication Guard: Direct publication without peer review is programmatically prohibited.
   - Exam Publication Guard: An examination cannot be published if any assigned question is in an unapproved or draft state.
   - Clinical Validation Engine: Validates minimum stem length, detailed pathophysiological rationale, single vs. multiple response constraints, and required EHR exhibits for NGN unfolding case studies.
4. **Relational PostgreSQL Persistence**:
   - Migration `InitialPhase2ContentSchema` generated and applied to PostgreSQL `nurvia_db`.
   - 11 tables created with foreign key cascades, unique indices, and precision settings.
   - Comprehensive clinical database seeder populated with authentic ATI Pharmacology, HESI Medical-Surgical, RN Comprehensive Predictor, and PN dosage calculation questions.
5. **Administrative UI & Learner Navigation Shell**:
   - Reconciled `LearnerShell` navigation into 4 primary examination tracks: `RN Exams`, `LPN/PN Exams`, `RN Exit`, and `LPN Exit` (each sub-categorized into ATI, HESI, Regular Courses, and Certifications).
   - Administrative Question Bank list view (`/admin/questions`) with search and multi-facet filtering.
   - Full-page Question Authoring Studio (`/admin/questions/new`) with real-time validation and interactive learner preview.
   - Review & Approval Queue (`/admin/reviews`) with peer-review comment recording.
   - Examination Studio & Blueprint Editor (`/admin/exams`) with published question assignment.
6. **Automated Verification**:
   - 22 unit tests passing in `Nurvia.Tests` covering question lifecycles, clinical validation rules, blueprint constraints, and publication invariants.
   - Next.js production build (`npm run build`) compiling cleanly with 12/12 static and dynamic routes.

---

## 2. Phase 1 Baseline Audit & Discrepancy Reconciliation

Before writing Phase 2 code, an exhaustive audit was performed:

| Component | Declared Baseline | Verified Finding in Repo | Remediation / Reconciliation |
| :--- | :--- | :--- | :--- |
| **Backend Projects** | Domain, Application, Infrastructure, Api | Skeletons existed with empty `Class1.cs` and no business logic | Implemented Clean Architecture layers with complete aggregate roots, services, and EF Core configurations |
| **Database** | PostgreSQL 16 schema | Local PostgreSQL service running on port 5432, but `nurvia_db` database and tables did not exist | Created `nurvia_db` database and `nurvia_user` with full permissions; applied initial EF Core migration |
| **Frontend Framework** | Next.js App Router | Next.js 14 failed on Node 24 due to native SWC binary mismatch | Upgraded to Next.js 15.5.29 and React 19; fixed font fetching inside offline sandbox |
| **Learner Navigation** | Generic sidebar | Lacked explicit 4-track exam hierarchy matching user reference screenshots | Reconciled `LearnerShell` to include `RN Exams`, `LPN Exams`, `RN Exit`, and `LPN Exit` with accordion subcategories |

---

## 3. System Architecture & Domain Model

The platform follows Clean Architecture with strict dependency isolation:

```
[ Nurvia.Domain ]
       ^
       |
[ Nurvia.Application ] <----+
       ^                     |
       |                     |
[ Nurvia.Infrastructure ]    |
       ^                     |
       |                     |
  [ Nurvia.Api ] ------------+
```

### 3.1 Domain Aggregates

#### Question Aggregate Root (`Nurvia.Domain.Questions.Question`)
- **Properties**: `Id`, `Code`, `Pathway`, `Category`, `Subject`, `Topic`, `Subtopic`, `Difficulty`, `Status`, `CurrentVersionId`, `ConcurrencyToken`, `CreatedAtUtc`, `CreatedBy`.
- **Children**:
  - `Versions`: Collection of `QuestionVersion`.
  - `CurrentVersion`: Active content version.
  - `Reviews`: Audit log of peer-review approvals and rejections.
- **State Machine Methods**:
  - `SubmitForReview(string actor)`: Runs clinical validation; if valid, advances to `PendingReview`, otherwise sets `ValidationFailed`.
  - `Approve(string reviewerId, string reviewerName, string comments)`: Advances from `PendingReview` to `Approved`.
  - `Reject(string reviewerId, string reviewerName, string comments)`: Advances from `PendingReview` to `Rejected`.
  - `Publish(string publisher)`: Advances from `Approved` to `Published`; freezes the version as immutable.
  - `CreateNewVersion(string author)`: Clones current version into a new `Draft` with incremented `VersionNumber` while preserving historical versions.
  - `Archive(string actor)`: Marks question as `Archived`.

#### Question Version (`Nurvia.Domain.Questions.QuestionVersion`)
- Models the Clinical Judgment Measurement Model (CJMM) dimensions:
  - `QuestionType`: Multiple Choice, SATA, True/False, Matrix Grid, Clinical Case Study, BowTie, Numeric.
  - `CognitiveSkill`: Recognize Cues, Analyze Cues, Prioritize Hypotheses, Generate Solutions, Take Actions, Evaluate Outcomes.
  - `ClientNeedCategory`: Safe & Effective Care, Health Promotion, Psychosocial Integrity, Physiological Integrity.
  - `Stem`, `GeneralRationale`, `ContentJsonData`.
  - `Options`: Collection of `QuestionOption` (index, text, correct flag, specific rationale).
  - `Exhibits`: Collection of `QuestionExhibit` (Nurses Notes, Vital Signs flow sheets, STAT Labs, Provider Orders).

#### Examination Aggregate Root (`Nurvia.Domain.Exams.Exam`)
- **Properties**: `Id`, `Code`, `Title`, `Description`, `Pathway`, `Category`, `ModeAllowed`, `TimeLimitMinutes`, `PassingScorePercentage`, `Status`, `TotalQuestions`, `ConcurrencyToken`.
- **Children**:
  - `Versions`: Collection of `ExamVersion`.
  - `CurrentVersion`: Active version containing `ExamBlueprint` and `ExamQuestion` assignments.
- **Integrity Guard**:
  - `Publish(string publisher)` verifies that every assigned question is in `Published` status. If any question is in `Draft` or `PendingReview`, publication is blocked with a descriptive `DomainException`.

---

## 4. Database Schema & Migration Verification

The database was provisioned on local PostgreSQL 18 at `127.0.0.1:5432` in database `nurvia_db`.

### 4.1 Schema Tables
1. `__EFMigrationsHistory` (Migration tracking)
2. `Questions` (Question aggregate roots with unique code index)
3. `QuestionVersions` (Content versions with composite unique index on QuestionId + VersionNumber)
4. `QuestionOptions` (Answer options with correct flag and specific distractor feedback)
5. `QuestionExhibits` (EHR chart tabs for unfolding case studies)
6. `QuestionReviews` (Clinical peer-review log with reviewer credentials and comments)
7. `Exams` (Examination aggregate roots with unique code index)
8. `ExamVersions` (Exam versions and settings)
9. `ExamBlueprints` (Distribution targets for subjects, skills, and difficulties)
10. `ExamQuestions` (Junction table linking exam versions to specific question versions)
11. `AuditLogs` (Full regulatory audit trail for content governance)

### 4.2 Seeded Clinical Content
The database seeder automatically populated:
- `Q-RN-ATI-PHARM-001`: ATI Pharmacology Digoxin assessment (Multiple Choice, Recognize Cues).
- `Q-RN-ATI-PHARM-002`: ATI Pharmacology Lithium toxicity (Select All That Apply, Analyze Cues).
- `Q-RN-HESI-MS-003`: HESI Med-Surg Heart Failure unfolding case study with 3 EHR exhibits (Nurses Notes, Vital Signs flowsheet, STAT Labs).
- `Q-RN-EXIT-PRED-004`: RN Exit Predictor Pulmonary Embolism vs. Atelectasis item.
- `Q-PN-ATI-CALC-005`: LPN Pediatric amoxicillin dosage calculation item.
- `ATI-PHARM-2026`: Published ATI Comprehensive Pharmacology Practice Exam.
- `RN-EXIT-COMP-01`: Published RN Comprehensive Predictor Exit Examination.

---

## 5. Web API & Authorization Specifications

All endpoints return uniform `ApiResponse<T>` envelopes and enforce role-based access control (RBAC):

| HTTP Method | Route | Description | Required Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/questions` | Filtered, paged list of questions | Author, Reviewer, Admin |
| `GET` | `/api/questions/{id}` | Detailed question with versions & exhibits | Author, Reviewer, Admin |
| `POST` | `/api/questions` | Create new draft question | Author, Admin |
| `PUT` | `/api/questions/{id}` | Update draft question version | Author, Admin |
| `POST` | `/api/questions/{id}/validate` | Run clinical validation rules | Author, Admin |
| `POST` | `/api/questions/{id}/submit` | Submit question for clinical review | Author, Admin |
| `POST` | `/api/questions/{id}/review` | Record peer-review approval/rejection | Reviewer, Admin |
| `POST` | `/api/questions/{id}/publish` | Publish approved question | Publisher, Admin |
| `POST` | `/api/questions/{id}/versions` | Create revision draft from published question | Author, Admin |
| `POST` | `/api/questions/{id}/archive` | Archive question | Publisher, Admin |
| `GET` | `/api/exams` | Filtered, paged list of exams | Author, Reviewer, Admin |
| `GET` | `/api/exams/{id}` | Detailed exam with blueprint & questions | Author, Reviewer, Admin |
| `POST` | `/api/exams` | Create new examination blueprint | Author, Admin |
| `PUT` | `/api/exams/{id}` | Configure blueprint & assign questions | Author, Admin |
| `POST` | `/api/exams/{id}/submit` | Submit exam for review | Author, Admin |
| `POST` | `/api/exams/{id}/approve` | Reviewer approval of exam | Reviewer, Admin |
| `POST` | `/api/exams/{id}/publish` | Publish exam (verifies question statuses) | Publisher, Admin |
| `GET` | `/api/audit-logs` | Filterable compliance audit trail | Administrator |

---

## 6. Frontend Examination Management Studio

The administrative studio at `/admin` was built using Tailwind CSS and custom shadcn/ui primitives conforming to NURVIA brand guidelines:

### 6.1 Reconciled Learner Navigation Shell (`components/layout/learner-shell.tsx`)
Reconciled to reflect the NursGuru multi-track model:
- `01 — EXAMS`:
  - `RN Exams`: ATI Assessments, HESI Specialty, Regular Courses, Certifications.
  - `LPN / PN Exams`: ATI Practical, HESI PN, Regular Courses.
  - `RN Exit Exams`: Comprehensive Predictor, HESI Exit Assessment.
  - `LPN Exit Exams`: PN Exit Predictor.
- `02 — PRACTICE & PROGRESS`: Study Library, Performance Intel, My Library, Custom Practice.
- `03 — CLINICAL RESOURCES`: Study Hub, Study Cards/Flashcards (SRS), Study Guides, Care Plans, Calculators, AI Clinical Tutor, Study Planner.
- `04 — NCLEX PREP`: NCLEX-RN Next-Gen, NCLEX-PN, TEAS.
- `05 — MANAGEMENT & ACCOUNT`: Content Studio, My Account, Settings.

### 6.2 Question Bank Management (`app/admin/questions/page.tsx`)
- Multi-facet search across stem, code, topic, and rationale.
- Dropdown filters for Pathway (RN, PN, RN Exit, PN Exit), Category (ATI, HESI, Regular, Exit), and Status (Draft, ValidationFailed, PendingReview, Approved, Published, Archived).
- Tabular display with question code, item type badge, cognitive skill tag, status badge, version pill, and contextual actions.

### 6.3 Question Authoring Studio (`app/admin/questions/new/page.tsx`)
- Clinical scenario and stem editor with real-time character count.
- NGN Clinical Exhibits manager: add/edit Nurses Notes, Vital Signs flowsheets, and STAT Laboratory results.
- Answer options editor with single-choice vs. multi-select (SATA) logic and per-option distractor rationales.
- Real-time client-side validation engine alerting the author immediately to validation discrepancies.
- **Interactive Learner Preview Mode**: Switches instantly between Authoring Mode and Student Exam Preview, allowing authors to test the question exactly as it will render in the exam engine.

### 6.4 Review & Approval Queue (`app/admin/reviews/page.tsx`)
- Queue of submitted questions and exam blueprints in `PendingReview`.
- Peer-review dialog allowing clinical educators to evaluate questions, record decisions (`Approved`, `Rejected`, `ChangesRequested`), and submit required feedback notes.

### 6.5 Examination Studio & Blueprint Editor (`app/admin/exams/page.tsx`)
- Catalogue of examinations with time limits, passing score benchmarks, and delivery modes.
- Modal to assemble new exams.
- Interactive Blueprint Drawer allowing authors to assign approved/published questions directly from the question bank.

---

## 7. Automated Testing & Verification Evidence

### 7.1 .NET Unit Test Suite (`Nurvia.Tests`)
Command executed:
`dotnet test apps/api/Nurvia.Tests/Nurvia.Tests.csproj --no-build`

**Result:**
```
Passed!  - Failed: 0, Passed: 22, Skipped: 0, Total: 22, Duration: 310 ms
```

#### Test Inventory Breakdown:
1. `QuestionLifecycleTests.FullLifecycle_FromDraftToPublished_TransitionsCorrectly` (VERIFIED)
2. `QuestionLifecycleTests.Publish_DirectlyFromDraft_ThrowsDomainException` (VERIFIED)
3. `QuestionLifecycleTests.SubmitForReview_WithInvalidData_ThrowsDomainExceptionAndMarksValidationFailed` (VERIFIED)
4. `QuestionLifecycleTests.Reject_SetsStatusToRejectedAndRecordsReviewHistory` (VERIFIED)
5. `QuestionLifecycleTests.CreateNewVersion_FromPublishedQuestion_PreservesHistoricalVersionAndCreatesDraftV2` (VERIFIED)
6. `QuestionLifecycleTests.Archive_MarksQuestionAndCurrentVersionArchived` (VERIFIED)
7. `QuestionValidationTests.Validate_StemUnderTenChars_ReturnsValidationError` (VERIFIED)
8. `QuestionValidationTests.Validate_RationaleUnderFifteenChars_ReturnsValidationError` (VERIFIED)
9. `QuestionValidationTests.Validate_MultipleChoice_WithZeroCorrectAnswers_FailsValidation` (VERIFIED)
10. `QuestionValidationTests.Validate_MultipleChoice_WithMultipleCorrectAnswers_FailsValidation` (VERIFIED)
11. `QuestionValidationTests.Validate_SATA_WithLessThanThreeOptions_FailsValidation` (VERIFIED)
12. `QuestionValidationTests.Validate_TrueFalse_WithNotTwoOptions_FailsValidation` (VERIFIED)
13. `QuestionValidationTests.Validate_ClinicalCaseStudy_WithoutExhibits_FailsValidation` (VERIFIED)
14. `QuestionValidationTests.Validate_ClinicalCaseStudy_WithExhibit_PassesValidation` (VERIFIED)
15. `ExamLifecycleAndBlueprintTests.ExamBlueprint_Validate_FailsWhenZeroQuestionsAssigned` (VERIFIED)
16. `ExamLifecycleAndBlueprintTests.ExamPublish_WithUnpublishedQuestion_ThrowsDomainException` (VERIFIED)
17. `ExamLifecycleAndBlueprintTests.ExamPublish_WithAllPublishedQuestions_Succeeds` (VERIFIED)
18. `ExamLifecycleAndBlueprintTests.ExamVersion_Validate_FailsWhenTimeLimitZeroOrNegative` (VERIFIED)
19. `ExamLifecycleAndBlueprintTests.ExamVersion_Validate_FailsWhenPassingScoreExceedsHundred` (VERIFIED)

### 7.2 Next.js Production Build
Command executed:
`npm --prefix apps/web run build`

**Result:**
```
✓ Compiled successfully in 19.7s
✓ Generating static pages (12/12)
Route (app)                                 Size  First Load JS
┌ ○ /                                      173 B         118 kB
├ ○ /_not-found                            123 B         103 kB
├ ○ /admin                               4.24 kB         121 kB
├ ○ /admin/exams                         7.25 kB         124 kB
├ ○ /admin/questions                     4.04 kB         124 kB
├ ƒ /admin/questions/[id]/edit           3.63 kB         123 kB
├ ○ /admin/questions/new                  8.4 kB         125 kB
├ ○ /admin/reviews                       5.96 kB         123 kB
├ ○ /design-system                       4.35 kB         122 kB
├ ○ /exam-session                        8.27 kB         122 kB
└ ○ /learner                               10 kB         123 kB
+ First Load JS shared by all             103 kB
```

---

## 8. Honest Accounting of Delivery Status

| Area | Feature | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Domain Model** | Question & Version Aggregates | Verified | Fully implemented in `Nurvia.Domain`, tested via 22 unit tests |
| **Domain Model** | Exam & Blueprint Aggregates | Verified | Strict publication guards and validation rules enforced |
| **Persistence** | PostgreSQL 16/18 Schema | Verified | EF Core migration applied, 11 tables verified via psql |
| **Persistence** | Realistic Clinical Seeding | Verified | 5 rich clinical questions and 2 published exams seeded in database |
| **API Endpoints** | REST Endpoints & RBAC | Verified | Questions, Exams, Reviews, and Audit controllers implemented |
| **Admin UI** | Question Bank Management | Verified | Interactive filters, search, and action dispatchers implemented |
| **Admin UI** | Question Authoring & Student Preview | Verified | Live validation feedback and exam simulator preview verified |
| **Admin UI** | Review & Approval Queue | Verified | Peer-review dialog with decision recording implemented |
| **Admin UI** | Exam Studio & Blueprint Editor | Verified | Examination assembly and question assignment implemented |
| **Learner UI** | 4-Track Exam Hierarchy | Verified | Reconciled `LearnerShell` with expandable RN, LPN, RN Exit, LPN Exit tracks |
| **Future Phase** | Dynamic CAT / Item Response Theory | Deferred | Scheduled for Phase 3 Adaptive Examination Engine |
| **Future Phase** | Rich Text LaTeX/Formula WYSIWYG | Deferred | Plain text with structured format implemented; full WYSIWYG planned for Phase 3 |

---

## 9. Conclusion & Next Phase Readiness

NURVIA Phase 2 has successfully established a reliable, secure, and production-ready Examination Management Studio and Question Bank Builder. All data models and publishing rules uphold the rigorous clinical standards required for nursing education, ensuring that upcoming learner testing experiences consume verified, immutable, and high-quality assessment content.
