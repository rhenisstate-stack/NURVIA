# NURVIA — Stage 4: Examination Engine & Attempt Lifecycle

## 1. Executive Summary

Stage 4 establishes the examination engine and attempt lifecycle for the NURVIA nursing education and examination platform. Prior to this stage, NURVIA had complete domain and persistence models for question authoring, blueprints, and exam publishing, but lacked runtime attempt lifecycle management (DEF-003). Learner examination sessions in the web application relied on hardcoded mock question data (`q-4091`) with simulated in-browser timers, lacking server-side persistence, autosave debounce, deterministic grading, and secure review gating.

Stage 4 resolves these gaps through:
1. **Persistent Attempt Lifecycle (`ExamAttempt` & `AttemptResponse`)**: PostgreSQL-backed tables capturing start time, server deadline, response payloads, flagged states, points, and grading status.
2. **Server-Enforced Countdown Timing**: Server-side deadline calculation (`DeadlineUtc = StartedAtUtc.AddMinutes(TimeLimitMinutes)`), dynamic remaining-seconds resolution, and auto-submission on expiration.
3. **Active Exam Question Concealment (DEF-006 Verification)**: Active attempt questions served via `ActiveExamQuestionDto` and `ActiveExamOptionDto`, physically omitting `IsCorrect`, `GeneralRationale`, and `SpecificRationale`.
4. **Idempotent Submission & Deterministic Scoring**: Submission triggers server-side grading across objective question types (SingleChoice, MultipleResponse SATA, NumericCalculation, Cloze, TrueFalse). Subsequent submissions idempotently return the already calculated grade.
5. **IDOR & Ownership Protection**: Strict learner verification ensuring learners can only view, autosave, submit, and review their own examination attempts (`UnauthorizedAccessException` mapped to HTTP 403 Forbidden).
6. **Detailed Post-Submission Review**: Feedback policy and review payloads (`SubmittedExamResultDto`, `ReviewQuestionDto`, `ReviewOptionDto`) disclosing correct answers, explanations, earned points, and learner selections only after submission.

---

## 2. Defects Resolved in Stage 4

| Defect ID | Severity | Component | Finding & Root Cause | Resolution | Verification |
|---|---|---|---|---|---|
| **DEF-003** | Critical | Backend (`Nurvia.Domain`, `Nurvia.Application`, `Nurvia.Infrastructure`) | Absence of persistent exam attempt domain entities and lifecycle services. | Implemented `ExamAttempt` & `AttemptResponse` entities, `IExamAttemptService`, `ExamAttemptService`, and EF Core migration `20261109111457_AddExamAttemptsAndResponses`. | Automated tests in `AttemptLifecycleTests.cs` (5/5 passed); Migration applied to PostgreSQL `nurvia_db`. |
| **DEF-006** | Critical | Application Security & API DTOs | Answer-key and rationale leakage in active exam questions. | Segregated active question payload (`ActiveExamQuestionDto`) from review payload (`ReviewQuestionDto`). Active attempts expose zero answer keys or rationales. | Unit & integration assertions in `StartAttempt_ConcealsAnswerKeysAndCalculatesRemainingTime` and `SubmitAttempt_CalculatesDeterministicScore_AndReturnsComprehensiveReview`. |

---

## 3. Database Schema & Architecture

### 3.1 `ExamAttempts` Table

```sql
CREATE TABLE "ExamAttempts" (
    "Id" uuid NOT NULL,
    "ExamId" uuid NOT NULL,
    "ExamVersionId" uuid NOT NULL,
    "LearnerId" character varying(100) NOT NULL,
    "LearnerName" character varying(200) NOT NULL,
    "Status" integer NOT NULL, -- 1: InProgress, 2: Submitted, 3: Graded, 4: Abandoned, 5: Expired
    "StartedAtUtc" timestamp with time zone NOT NULL,
    "DeadlineUtc" timestamp with time zone NOT NULL,
    "SubmittedAtUtc" timestamp with time zone,
    "TimeLimitMinutes" integer NOT NULL,
    "ScorePercentage" numeric(5,2),
    "PassingScorePercentage" numeric(5,2) NOT NULL,
    "Passed" boolean,
    "TotalQuestions" integer NOT NULL,
    "CorrectQuestions" integer NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "CreatedBy" text NOT NULL,
    "UpdatedAtUtc" timestamp with time zone,
    "UpdatedBy" text,
    CONSTRAINT "PK_ExamAttempts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ExamAttempts_Exams_ExamId" FOREIGN KEY ("ExamId") REFERENCES "Exams" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_ExamAttempts_ExamVersions_ExamVersionId" FOREIGN KEY ("ExamVersionId") REFERENCES "ExamVersions" ("Id") ON DELETE RESTRICT
);

CREATE INDEX "IX_ExamAttempts_ExamId" ON "ExamAttempts" ("ExamId");
CREATE INDEX "IX_ExamAttempts_ExamVersionId" ON "ExamAttempts" ("ExamVersionId");
CREATE INDEX "IX_ExamAttempts_LearnerId_ExamId_Status" ON "ExamAttempts" ("LearnerId", "ExamId", "Status");
```

### 3.2 `AttemptResponses` Table

```sql
CREATE TABLE "AttemptResponses" (
    "Id" uuid NOT NULL,
    "ExamAttemptId" uuid NOT NULL,
    "QuestionId" uuid NOT NULL,
    "QuestionVersionId" uuid NOT NULL,
    "OrderIndex" integer NOT NULL,
    "ResponseJson" text,
    "IsAnswered" boolean NOT NULL,
    "IsFlagged" boolean NOT NULL,
    "SavedAtUtc" timestamp with time zone NOT NULL,
    "IsCorrect" boolean,
    "PointsAwarded" numeric(5,2) NOT NULL,
    "MaxPoints" numeric(5,2) NOT NULL,
    CONSTRAINT "PK_AttemptResponses" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AttemptResponses_ExamAttempts_ExamAttemptId" FOREIGN KEY ("ExamAttemptId") REFERENCES "ExamAttempts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AttemptResponses_Questions_QuestionId" FOREIGN KEY ("QuestionId") REFERENCES "Questions" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_AttemptResponses_QuestionVersions_QuestionVersionId" FOREIGN KEY ("QuestionVersionId") REFERENCES "QuestionVersions" ("Id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX "IX_AttemptResponses_ExamAttemptId_QuestionId" ON "AttemptResponses" ("ExamAttemptId", "QuestionId");
CREATE INDEX "IX_AttemptResponses_QuestionId" ON "AttemptResponses" ("QuestionId");
CREATE INDEX "IX_AttemptResponses_QuestionVersionId" ON "AttemptResponses" ("QuestionVersionId");
```

---

## 4. API Endpoints (`ExamAttemptsController`)

All attempt endpoints enforce JWT authentication via `[Authorize]` or current user context resolution:

| Method | Route | Description | Authorization / IDOR Gate |
|---|---|---|---|
| `POST` | `/api/attempts/start/{examId}` | Initializes or resumes an active exam attempt. Returns sanitized questions. | Authenticated learner; resume existing in-progress attempt if active. |
| `GET` | `/api/attempts/{id}` | Retrieves active attempt state and remaining seconds. | Verifies `attempt.LearnerId == currentLearnerId`. Returns 403 on mismatch. |
| `PUT` | `/api/attempts/{id}/responses` | Debounced autosave for a question response (`ResponseJson`, `IsFlagged`). | Verifies learner ownership and `Status == InProgress`. Enforces deadline. |
| `POST` | `/api/attempts/{id}/submit` | Submits the attempt, runs deterministic grading, and records score. | Verifies learner ownership. Idempotent on repeated calls. |
| `GET` | `/api/attempts/{id}/review` | Returns comprehensive post-exam review with answers and rationales. | Blocked if attempt is `InProgress`. Gated to attempt owner or admin. |
| `GET` | `/api/attempts/history` | Returns summary list of all completed and in-progress attempts for learner. | Filtered strictly to `currentLearnerId`. |

---

## 5. Scoring & Review Engine

The scoring engine evaluates learner responses deterministically against the canonical question models:
- **SingleChoice / MultipleChoice / TrueFalse / ImageBased**: Supports selection by Option ID (GUID), OptionIndex (int), option text string, or JSON envelope (`{"SelectedOptionId": ...}`). Awards full `MaxPoints` if correct, `0.0m` otherwise.
- **MultipleResponse (SATA)**: Supports array of GUIDs, array of option indices, or JSON envelope (`{"SelectedOptionIds": [...]}`). Requires exact match of all positive keys and exclusion of all distractors.
- **NumericCalculation**: Strips units and whitespace; compares candidate value to target within clinical tolerance ($\pm 0.01$).
- **Cloze / ShortAnswer**: Case-insensitive normalized matching against approved clinical terminology.

---

## 6. Automated Verification Evidence

The test suite in `Nurvia.Tests` was executed against the live PostgreSQL cluster on `localhost:5432`:

```
Test run for C:\Users\gitau\Documents\NURVIA\apps\api\Nurvia.Tests\bin\Debug\net8.0\Nurvia.Tests.dll (.NETCoreApp,Version=v8.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:    48, Skipped:     0, Total:    48, Duration: 10 s - Nurvia.Tests.dll (net8.0)
```

### Stage 4 Test Suite Breakdown (`AttemptLifecycleTests`):
1. `StartAttempt_ConcealsAnswerKeysAndCalculatesRemainingTime`: **PASSED** (Conceals answer keys, hides rationales, returns correct deadline seconds).
2. `SaveResponse_UpdatesLearnerAnswerAndFlagState`: **PASSED** (Autosaves response JSON, updates flagged state and timestamp in PostgreSQL).
3. `IDOR_Protection_PreventsUnauthorizedAccessAcrossLearners`: **PASSED** (Learner B accessing Learner A's attempt throws `UnauthorizedAccessException` -> HTTP 403).
4. `SubmitAttempt_CalculatesDeterministicScore_AndReturnsComprehensiveReview`: **PASSED** (Deterministic grading: 1/2 correct = 50.0%, reveals rationales and option selections upon review).
5. `SubmitAttempt_IsIdempotent_DoesNotMutateOnRepeatedSubmissions`: **PASSED** (Repeated submissions preserve initial score and timestamp without re-evaluating or duplicating records).
