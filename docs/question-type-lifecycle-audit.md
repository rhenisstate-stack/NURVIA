# NURVIA — 18-Question-Type Lifecycle Audit

**Date:** 2026-11-14  
**Authoritative Sources:**
- Domain enum: `apps/api/Nurvia.Domain/Enums/DomainEnums.cs` (`QuestionType`, values `1..18`)
- Domain validation: `apps/api/Nurvia.Domain/Questions/QuestionVersion.cs` (`QuestionVersion.Validate`)
- Server grader: `apps/api/Nurvia.Application/Questions/QuestionResponseGrader.cs` (`QuestionResponseGrader.Evaluate`)
- Renderer registry: `apps/web/components/exam/renderers/QuestionRendererRegistry.tsx`
- Authoring UI: `apps/web/app/admin/questions/new/page.tsx`, `apps/web/app/admin/questions/[id]/edit/page.tsx`
- Automated tests: `apps/api/Nurvia.Tests/QuestionResponseGraderTests.cs`, `QuestionValidationTests.cs`, `QuestionLifecycleTests.cs`, `apps/web/tests/question-renderers.test.mjs`

---

## 1. Twelve-Stage Lifecycle Definition

1. **Enum & Contract Mapping** — Canonical integer (`1..18`) and string alias in `QuestionType` and `apps/web/lib/api-types.ts`.
2. **Admin Authoring UI** — Selectable in `/admin/questions/new`, configurable options/key, unified `QuestionRendererRegistry` preview in `/new` and `/[id]/edit`.
3. **Request DTO & API** — `CreateQuestionRequest` / `UpdateQuestionVersionRequest` in `QuestionsController` / `QuestionService`.
4. **Domain Validation** — `QuestionVersion.Validate` enforces structural/key invariants before `SubmitForReview`.
5. **Persistence & Serialization** — EF Core `QuestionConfigurations` (`QuestionVersions`, `QuestionOptions`, `QuestionExhibits`, `ContentJsonData`).
6. **Retrieval & Deserialization** — `QuestionService` / `ExamAttemptService` DTO projection (`ReviewQuestionDto`, `AttemptQuestionDto`).
7. **Learner Renderer Resolution** — `QuestionRendererRegistry` dispatches integer and string aliases to the dedicated component.
8. **Learner Response Capture** — Canonical JSON payload emitted via `onChange` and restored on resume.
9. **Attempt Submission & Persistence** — `ExamAttemptService.AutosaveResponseAsync` & `SubmitAttemptAsync` persist `ResponseJson`.
10. **Grading & Credit Calculation** — `QuestionResponseGrader.Evaluate` computes deterministic `IsCorrect` and `Fraction` (`0..1`).
11. **Review Display & Rationale Gating** — `isReview` prop + `ReviewReleasePolicy` gate `IsCorrect`, `SpecificRationale`, and nullable `GeneralRationale`.
12. **Version Snapshot & Historical Compatibility** — `ExamAttempt` snapshots `QuestionVersionId` so historical attempts grade and review against their original version (`7825100`).

---

## 2. 18-Question-Type Lifecycle Matrix

| # | `QuestionType` (Aliases) | Backend & Domain Validation | Authoring & Preview | Learner Renderer | Canonical Response Payload | Grading & Partial Credit | Evidence / Test Reference | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | `MultipleChoice` (1) | Requires `>=2` options, `1` `IsCorrect` | Full + shared preview | `SingleChoiceRenderer` | Option `id` / `optionIndex` | Exact `IsCorrect` (`1` or `0`) | `QuestionResponseGraderTests` (`Evaluate_SingleAnswerType_*`) | **PASS** |
| 2 | `MultipleResponse` / `SelectAllThatApply` (2) | Requires `>=2` options, `>=1` `IsCorrect` | Full + shared preview | `MultipleResponseRenderer` | Array of selected option IDs/indices | Exact set for `IsCorrect`; proportional `Fraction` on partial without wrong picks | `QuestionResponseGraderTests` (`Evaluate_SATA_*`) | **PASS** |
| 3 | `TrueFalse` (3) | Requires `2` options, `1` `IsCorrect` | Full + shared preview | `TrueFalseRenderer` | `{ SelectedOptionId }` / index | Exact `IsCorrect` (`1` or `0`) | `QuestionResponseGraderTests` (`Evaluate_TrueFalse_ObjectPayloadWithOptionId_IsCorrect`) | **PASS** |
| 4 | `FillInTheBlank` / `Cloze` (4) | Requires `>=1` option with expected text | Full + shared preview | `FillInTheBlankRenderer` | `{ TextResponse }` / string | Case-insensitive trimmed match against `IsCorrect` options | `QuestionResponseGraderTests` (`Evaluate_TextMatch_*`) | **PASS** |
| 5 | `NumericResponse` / `NumericCalculation` (5) | Requires `>=1` numeric option | Full + shared preview | `NumericCalculationRenderer` | Numeric string / `{ value }` | Decimal match within `0.01` tolerance | `QuestionResponseGraderTests` (`Evaluate_NumericCalculation_*`) | **PASS** |
| 6 | `OrderedResponse` (6) | Requires `>=2` options | Full + shared preview | `OrderedResponseRenderer` | Ordered array of option IDs/indices | Exact `DisplayOrder` sequence; proportional `Fraction` | `QuestionResponseGraderTests` (`Evaluate_OrderedResponse_*`) | **PASS** |
| 7 | `Matching` (7) | Even option count (`>=2`), non-empty pairs, no duplicate premises | Full + shared preview | `MatchingRenderer` | Pair map (premise -> response ID/text) | Exact premise->next-option match; proportional `Fraction` | `QuestionValidationTests` + `QuestionResponseGraderTests` (`Evaluate_Matching_*`) | **PASS** |
| 8 | `MatrixGrid` (8) | Requires options / `ContentJsonData` | `ContentJsonData` JSON + shared preview | `MatrixGridRenderer` | `{ MatrixSelections: { rowId: col } }` | Keyed (`CorrectSelections`) proportional; **legacy credit if key absent** | `QuestionResponseGraderTests` (`Evaluate_MatrixGrid_*`) | **PARTIAL** (optional key) |
| 9 | `ClinicalCaseStudy` / `UnfoldingCaseStudy` (9) | Requires stem + exhibits/options | Stem/exhibits + shared preview | `CaseStudyRenderer` | Substantive non-empty JSON/text | **Legacy credit** (non-empty `1`, empty/`[]`/`{}` `0`) | `QuestionResponseGraderTests` (`Evaluate_FreeFormTypes_*`) | **PARTIAL** (legacy policy) |
| 10 | `BowTie` / `DynamicLabBowTie` (10) | Requires options / `ContentJsonData` | `ContentJsonData` JSON + shared preview | `BowTieRenderer` | `{ Actions, Condition, Parameters }` | Keyed (`CorrectActions/Condition/Parameters`, 5 slots); **legacy credit if key absent** | `QuestionResponseGraderTests` (`Evaluate_BowTie_*`) | **PARTIAL** (optional key) |
| 11 | `MultipleTrueFalse` (11) | Requires options / `ContentJsonData` | `ContentJsonData` JSON + shared preview | `MultipleTrueFalseRenderer` | `{ TrueFalseMap: { id: "True"\|"False" } }` | Keyed (`CorrectTrueFalse`) proportional; **legacy credit if key absent** | `QuestionResponseGraderTests` (`Evaluate_MultipleTrueFalse_*`) | **PARTIAL** (optional key) |
| 12 | `ImageBased` (12) | Requires `>=2` options, `1` `IsCorrect` + exhibit | Full + shared preview | `ImageBasedRenderer` | Option `id` / `optionIndex` | Exact `IsCorrect` (`1` or `0`) | `QuestionResponseGraderTests` (`Evaluate_SingleAnswerType_*`) | **PASS** |
| 13 | `MultipleImageSelection` (13) | Requires `>=2` options, `>=1` `IsCorrect`, valid option IDs | Full + shared preview | `MultipleImageSelectionRenderer` | `{ SelectedOptionIds: string[] }` (legacy scalar restored) | Exact set for `IsCorrect`; proportional `Fraction`; deduplicated | `QuestionValidationTests` + `QuestionResponseGraderTests` (`Evaluate_MultipleImageSelection_*`) + `question-renderers.test.mjs` | **PASS** |
| 14 | `DragAndDrop` (14) | Requires options / `ContentJsonData` | `ContentJsonData` JSON + shared preview | `DragAndDropRenderer` | `{ Buckets: { itemId: bucket } }` | Keyed (`CorrectBuckets`) proportional; **legacy credit if key absent** | `QuestionResponseGraderTests` (`Evaluate_DragAndDrop_*`) | **PARTIAL** (optional key) |
| 15 | `ExtendedResponse` (15) | Requires stem + rationale | Stem/rationale + shared preview | `ExtendedResponseRenderer` | `{ TextResponse }` / non-empty text | **Legacy credit** (non-empty `1`, empty `0`; human review outside engine) | `QuestionResponseGraderTests` (`Evaluate_FreeFormTypes_*`) | **PARTIAL** (legacy policy) |
| 16 | `TabularResponse` (16) | Requires options (`>=1` `IsCorrect`) | Full + shared preview | `TabularResponseRenderer` | `{ SelectedOptionId }` | Selected option `IsCorrect` (`1` or `0`) | `QuestionResponseGraderTests` (`Evaluate_TabularResponse_*`) | **PASS** |
| 17 | `ShortAnswer` (17) | Requires `>=1` `IsCorrect` non-empty option | Full + shared preview | `ShortAnswerRenderer` | `{ TextResponse }` (legacy `{ ShortAnswer }` accepted) | Case-insensitive trimmed match against `IsCorrect` options | `QuestionValidationTests` + `QuestionResponseGraderTests` (`Evaluate_ShortAnswer_*`) + `question-renderers.test.mjs` | **PASS** |
| 18 | `SingleChoice` (18) | Requires `>=2` options, `1` `IsCorrect` | Full + shared preview | `SingleChoiceRenderer` | Option `id` / `optionIndex` | Exact `IsCorrect` (`1` or `0`) | `QuestionResponseGraderTests` (`Evaluate_SingleAnswerType_*`) | **PASS** |

---

## 3. Legacy-Credit Fallback Investigation (Types 8, 9, 10, 11, 14, 15)

Inspected `QuestionResponseGrader.cs` (`lines 176–290`):

1. **Keyed NGN Types (`MatrixGrid=8`, `BowTie=10`, `MultipleTrueFalse=11`, `DragAndDrop=14`):**
   - When `ContentJsonData` contains the expected key (`CorrectSelections`, `CorrectActions`/`CorrectCondition`/`CorrectParameters`, `CorrectTrueFalse`, `CorrectBuckets`), the grader scores deterministically with proportional partial credit (`correctCount / totalKeyCount`).
   - When `ContentJsonData` is `null`, blank, or lacks the key property, `LegacyCredit(responseJson)` runs: any non-whitespace response other than `"[]"` or `"{}"` receives `IsCorrect = true, Fraction = 1m`. Empty/null/`"[]"`/`"{}"` receives `0m`.
   - **Why preserved:** Explicitly documented in `QuestionResponseGrader.cs` so historical published questions authored before structured `ContentJsonData` keys are not silently re-scored as `0%`.
2. **Free-Form Types (`ClinicalCaseStudy=9`, `ExtendedResponse=15`):**
   - No automated key exists; `LegacyCredit(responseJson)` awards `1m` for any substantive non-empty response and `0m` for empty/null/`"[]"`/`"{}"`. Full rubric grading is outside the automated engine.
3. **Historical Compatibility:**
   - `ExamAttempt` snapshots `QuestionVersionId` at attempt start (`7825100`), ensuring historical attempts are always graded and reviewed against the exact `QuestionVersion` active when the learner took the exam.
