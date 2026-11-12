# NURVIA Master Examination Audit

**Date:** 2026-11-12 · **Branch:** `master` · **HEAD:** `3acf196` ("fix the TS errors") · **Working tree:** clean (no uncommitted changes)

Scope: full audit of the examination lifecycle across `apps/api` (ASP.NET Core 8, PostgreSQL) and `apps/web` (Next.js 15 App Router). Evidence includes exact file paths and line references. No product code was modified during this audit.

---

## 1. Baseline

| Item | State |
|---|---|
| Solution | `apps/api/Nurvia.slnx` — Nurvia.Domain, Nurvia.Application, Nurvia.Infrastructure, Nurvia.Api, Nurvia.Tests (all net8.0) |
| Database | PostgreSQL via Npgsql (`apps/api/Nurvia.Infrastructure/DependencyInjection.cs` L27), 6 migrations, latest `20261111120000_AddUserProfile` |
| Tests | xUnit, 15 files; real-PostgreSQL integration tests (`AttemptLifecycleTests`, `ReviewReleasePolicyTests`, `PostgreSqlIntegrationTests` requires `TEST_CONNECTION_STRING` + db name `nurvia_test`) |
| Frontend | Next.js 15 / React 19, client-rendered, cookie auth + CSRF header, no react-query/SWR, no toast library (inline feedback + `components/shared/feedback/*`) |
| UI kit | Hand-rolled shadcn-styled `components/ui/*` (no Radix deps) |
| Docs conventions | `docs/*.md` kebab-case and stage reports |

## 2. Existing architecture map (backend)

- **Domain** (`Nurvia.Domain`): `Exams\Exam.cs`, `ExamVersion.cs`, `ExamQuestion.cs`, `ExamBlueprint.cs`; `Questions\Question.cs`, `QuestionVersion.cs`, `QuestionOption.cs`, `QuestionExhibit.cs`, `QuestionReview.cs`; `Attempts\ExamAttempt.cs`, `AttemptResponse.cs`.
- **Application** (`Nurvia.Application`): `Services\ExamAttemptService.cs` (attempt lifecycle + grading), `ExamService.cs`, `QuestionService.cs`; DTOs in `Exams\Dtos.cs`, `Questions\Dtos.cs`; JWT/auth in `Security\`.
- **API** (`Nurvia.Api\Controllers`): `ExamsController` (`api/exams`), `ExamAttemptsController` (`api/attempts`), `QuestionsController` (`api/questions`), plus Auth/Profile/Avatar/AuditLogs. Imperative role checks (roles: Learner, Author, Reviewer, Publisher, Administrator, Superadmin); CSRF header middleware wired.
- **Lifecycle**: Draft→Configured→PendingReview→Approved→Published→Archived for exams and questions; attempts: InProgress→Submitted→Graded (Expired supported).

## 3. The actual question types (evidence-backed inventory)

`Nurvia.Domain\Enums\DomainEnums.cs` L24–51 defines **18 enum member names covering 18 canonical types**, with 5 aliases sharing numeric values:

| # | Canonical type | Enum value | Admin authoring | Learner renderer | Machine-grading (today) |
|---|---|---|---|---|---|
| 1 | MultipleChoice / SingleChoice | 1 / 18 | ✅ (`app/admin/questions/new/page.tsx`) | ✅ `SingleChoiceRenderer` | ✅ option IsCorrect |
| 2 | MultipleResponse / SATA | 2 | ✅ | ✅ `MultipleResponseRenderer` | ✅ all-or-nothing set equality |
| 3 | TrueFalse | 3 | ✅ | ✅ `TrueFalseRenderer` | ✅ |
| 4 | FillInTheBlank / Cloze | 4 | ✅ | ✅ `FillInTheBlankRenderer` | ✅ case-insensitive text vs correct option |
| 5 | NumericResponse / NumericCalculation | 5 | ✅ | ✅ `NumericCalculationRenderer` | ✅ decimal ±0.01 tolerance |
| 6 | OrderedResponse | 6 | ❌ | ✅ `OrderedResponseRenderer` | ❌ `default:` non-empty = correct |
| 7 | Matching | 7 | ❌ | ✅ `MatchingRenderer` | ❌ `default:` |
| 8 | MatrixGrid | 8 | ✅ (dropdown; **no answer-key capture**) | ✅ `MatrixGridRenderer` | ❌ `default:` |
| 9 | ClinicalCaseStudy / UnfoldingCaseStudy | 9 | ✅ (dropdown + NGN exhibits) | ✅ `CaseStudyRenderer` | ❌ `default:` |
| 10 | BowTie / DynamicLabBowTie | 10 | ❌ | ✅ `BowTieRenderer` | ❌ `default:` |
| 11 | MultipleTrueFalse | 11 | ❌ | ✅ `MultipleTrueFalseRenderer` | ❌ `default:` |
| 12 | ImageBased | 12 | ❌ | ✅ `ImageBasedRenderer` | ✅ option IsCorrect |
| 13 | MultipleImageSelection | 13 | ❌ | ✅ `MultipleImageSelectionRenderer` | ❌ `default:` |
| 14 | DragAndDrop | 14 | ❌ | ✅ `DragAndDropRenderer` | ❌ `default:` |
| 15 | ExtendedResponse | 15 | ❌ | ✅ `ExtendedResponseRenderer` | ❌ `default:` |
| 16 | TabularResponse | 16 | ❌ | ✅ `TabularResponseRenderer` | ❌ `default:` |
| 17 | ShortAnswer | 17 | ❌ | ✅ `ShortAnswerRenderer` | ❌ `default:` |
| 18 | (SingleChoice counted at 1) | — | — | — | — |

- Learner rendering: **all 18 types render** via `components/exam/renderers/QuestionRendererRegistry.tsx` (17 distinct renderer components; registry covers every value 1–18 plus alias names).
- Admin authoring: **only 6 types exposed** in the type dropdown (MultipleChoice, MultipleResponse, TrueFalse, ClinicalCaseStudy, MatrixGrid, NumericResponse).
- Backend validation: `QuestionVersion.Validate()` (`Nurvia.Domain\Questions\QuestionVersion.cs` L44–163) has per-type rules for **all 18**, so a type is publishable without authoring UI support.
- **Answer-key gap:** for MatrixGrid, MultipleTrueFalse, DragAndDrop, BowTie, Matching, OrderedResponse there is **no authoring surface to record the correct key**, and the grading engine never consults one (fallback: any non-empty response = full credit). No seeded data exercises these types (`DatabaseSeeder.cs` only seeds MultipleChoice/MultipleResponse/ClinicalCaseStudy).

## 4. Gap register

| ID | Priority | Finding | Evidence | Impact |
|---|---|---|---|---|
| G1 | **P0** | Grading for 8+ types: `EvaluateQuestionResponse` `default:` case returns `true` for **any non-empty response** — Matching, MatrixGrid, OrderedResponse, DragAndDrop, BowTie, CaseStudy, Tabular, ExtendedResponse, ShortAnswer (when options absent) are auto-credited | `ExamAttemptService.cs` L335–337 | Assessment correctness: a learner scores 100% by typing anything. Results are not trustworthy for these types. |
| G2 | P1 | No All-in-One layout anywhere; exam-session is always a one-question stepper | `app/exam-session/page.tsx` (no layoutMode state); grep `AllInOne|Sequential|layoutMode` = 0 matches | Requirement 6 unmet. |
| G3 | P1 | No layout configuration in backend or Admin UI | `ExamVersion.cs`, `app/admin/exams/page.tsx` | Requirement 6.3 unmet. |
| G4 | P1 | Tutor mode is cosmetic: `ExamDeliveryMode.Tutor=3` exists (`DomainEnums.cs` L107) and the shell shows a badge, but starting a Tutor session produces an identical sanitized Exam attempt; no correct answers/rationales are delivered; no immediate feedback | `ExamAttemptService.cs` L361 comment "Active exam questions NEVER contain IsCorrect…", `app/page.tsx` L489 is the only Tutor entry | Requirement 3C/10 unmet. |
| G5 | P1 | `Exam.ModeAllowed` is never enforced at attempt start | `StartAttemptAsync` L23–100 (no ModeAllowed check) | Mode policy bypass. |
| G6 | P1 | Review mode only works via a completed `attemptId`; there is no way to study a published exam's questions before taking it (no exam-level review-content endpoint) | `ExamAttemptsController` routes; frontend `exam-session` Review path requires attemptId | Requirement 3B/9 partially unmet. |
| G7 | P1 | Study-library exam cards expose only "Start this exam" — no Exam/Review/Tutor direct access | `components/study/study-library-view.tsx` L146–161 | Requirement 4 unmet. |
| G8 | P2 | Admin authoring supports 6/18 types; no ContentJsonData editor, so complex-type answer keys cannot be authored at all | `app/admin/questions/new/page.tsx` L652–663 | 18-type lifecycle incomplete. |
| G9 | P2 | No per-user pathway enforcement on attempts (`UserProfile` has no pathway; `StartAttemptAsync` doesn't check) | — | RN/PN separation is display-level only. |
| G10 | P2 | `ExamAttempt`/`StartAttemptResultDto` don't persist or return a layout choice | `ExamAttempt.cs`, `Dtos.cs` | Requirement 6.3 learner-selection persistence unmet. |
| G11 | P2 | `/learner/my-exams` links use `?setId=` which `exam-session` never reads → error state | `app/learner/my-exams/page.tsx` L50–61 | Broken learner entry point. |
| G12 | P2 | Autosave has saving/saved/idle/error states but no explicit retry affordance for failures | `exam-session/page.tsx` L217–255, `exam-shell.tsx` L154–176 | Requirement 7.2 partially met. |
| G13 | P3 | Results page lacks start/submission timestamps and allocated-vs-elapsed time distinction | `app/learner/attempts/[id]/page.tsx` | Requirement 8.2 partially met. |
| G14 | P3 | No AI/Tutor integration config exists anywhere in the backend (no LLM settings) — do not invent one | `appsettings.json` | Tutor explanations must come from approved content only. |

## 5. What already works (preserve — do not rebuild)

1. **Answer-key protection during active attempts** — `BuildStartAttemptDto` strictly strips IsCorrect/rationales (L361–377); post-submission feedback gated by `ReviewReleasePolicy` (`IsReviewReleased` L418–426, `ReviewNotReleasedException`→403).
2. **Server-authoritative scoring** — all grading in `ExamAttemptService.SubmitAttemptAsync`; client never sends scores.
3. **Idempotent submission** — already-graded attempts return the existing result (L198–201); no double grading.
4. **Autosave persistence** — per-question debounced save (`PUT /api/attempts/{id}/responses`), pre-created `AttemptResponse` rows per question, resume via InProgress attempt with saved responses (`StartAttemptResultDto.SavedResponses`), deadline-expiry auto-submit.
5. **Ownership enforcement** — `VerifyLearnerOwnership` with no role bypass (L640–647).
6. **Version integrity** — attempts bind `ExamVersionId` at start; grading uses `Question.CurrentVersion`; review release policy per version.
7. **17 learner renderers covering all 18 types** with a shared registry and review-rationale affordances.
8. **Results page** with correct/incorrect/unanswered distribution, rationales, reviewReleased gating.

## 6. Test baseline

- Backend: 15 xUnit files; run `dotnet test` under `apps/api` (integration tests need local PostgreSQL `nurvia_db` / `nurvia_test`).
- Frontend: **no test runner configured** (no jest/vitest in `package.json`). Verification limited to `tsc`/`next build` — documented limitation, not fabricated as "tests passed".
