# Phase 3 — Question Type and Scoring Verification

**Date:** 2026-11-14  
**Authoritative Grader:** `apps/api/Nurvia.Application/Questions/QuestionResponseGrader.cs`  
**Exam-Mode Sanitizer:** `ExamAttemptService.SanitizeContentJsonForExamMode` (`apps/api/Nurvia.Application/Services/ExamAttemptService.cs`)  
**Regression Suites:** `QuestionResponseGraderTests.cs`, `QuestionLifecycleTests.cs`

## 1. Hardening Applied (`LegacyCredit`)

Previously, `QuestionResponseGrader.LegacyCredit(string? responseJson)` only checked `!string.IsNullOrWhiteSpace(responseJson) && responseJson != "[]" && responseJson != "{}"`. This allowed malformed JSON (`"{bad"`), whitespace-padded empty structures (`"  {}  "`, `"  [ ]  "`), empty JSON strings (`"\"\""`), and nested empty objects/arrays (`{"text":"   "}`, `{"Selections":{}}`, `[null, "   ", {}, []]`) to receive full credit (`1m`).

**Fix:** Updated `LegacyCredit` in `QuestionResponseGrader.cs` to parse `responseJson` via `JsonDocument.Parse` (returning `false, 0m` on `JsonException`) and recursively verify via `ContainsSubstantiveValue(JsonElement)` that at least one non-empty, non-whitespace value exists. Added `Evaluate_LegacyCredit_RejectsMalformedAndNestedEmptyPayloads` across all 6 PARTIAL types (`MatrixGrid`, `BowTie`, `MultipleTrueFalse`, `DragAndDrop`, `ClinicalCaseStudy`, `ExtendedResponse`).

## 2. 18-Question-Type Scoring Verification Matrix

| # | Question Type | Scoring Mechanism | Partial Credit | Status |
|---:|---|---|---|---|
| 1 | `MultipleChoice` | `IsCorrect` flag on selected `QuestionOption` (by index, ID, or `SelectedOptionId`) | N/A (binary 1/0) | PASS |
| 2 | `MultipleResponse` (SATA) | Exact set equality against `IsCorrect` options | `selectedCorrect / totalCorrect` | PASS |
| 3 | `TrueFalse` | `IsCorrect` flag on selected option | N/A (binary 1/0) | PASS |
| 4 | `Cloze` (FillInTheBlank) | Case-insensitive trimmed match against `IsCorrect` options | N/A (binary 1/0) | PASS |
| 5 | `NumericCalculation` | Decimal comparison with `< 0.01m` tolerance (or string fallback) | N/A (binary 1/0) | PASS |
| 6 | `OrderedResponse` | Sequence equality against options ordered by `DisplayOrder` | Proportional prefix/position fraction | PASS |
| 7 | `Matching` | Consecutive `(even premise, odd response)` option pairs | Proportional matched-pair fraction | PASS |
| 8 | `MatrixGrid` | `ContentJsonData` (`CorrectSelections` / `MatrixSelections` / `Correct`); hardened `LegacyCredit` fallback when absent | Proportional row fraction (when keyed) | PARTIAL (key optional) |
| 9 | `ClinicalCaseStudy` | Hardened `LegacyCredit` (non-empty substantive JSON = 1m); human/external rubric required | N/A | PARTIAL (no auto rubric) |
| 10 | `BowTie` | `ContentJsonData` (`CorrectActions`, `CorrectCondition`, `CorrectParameters`, 5 slots); hardened `LegacyCredit` fallback when absent | `correctSlots / 5` (when keyed) | PARTIAL (key optional) |
| 11 | `MultipleTrueFalse` | `ContentJsonData` (`CorrectTrueFalse` / `TrueFalseMap` / `Correct`); hardened `LegacyCredit` fallback when absent | Proportional row fraction (when keyed) | PARTIAL (key optional) |
| 12 | `ImageBased` | `IsCorrect` flag on selected option | N/A (binary 1/0) | PASS |
| 13 | `MultipleImageSelection` | Exact set equality against `IsCorrect` options | `selectedCorrect / totalCorrect` | PASS |
| 14 | `DragAndDrop` | `ContentJsonData` (`CorrectBuckets` / `Buckets` / `Correct`); hardened `LegacyCredit` fallback when absent | Proportional item fraction (when keyed) | PARTIAL (key optional) |
| 15 | `ExtendedResponse` | Hardened `LegacyCredit` (non-empty substantive JSON = 1m); human/external rubric required | N/A | PARTIAL (no auto rubric) |
| 16 | `TabularResponse` | `SelectedOptionId` references an `IsCorrect` option | N/A (binary 1/0) | PASS |
| 17 | `ShortAnswer` | Case-insensitive trimmed match against `IsCorrect` options | N/A (binary 1/0) | PASS |
| 18 | `SingleChoice` | `IsCorrect` flag on selected option | N/A (binary 1/0) | PASS |

## 3. Exam-Mode Answer-Key Security

- `ExamAttemptService.SanitizeContentJsonForExamMode` parses `ContentJsonData` and recursively strips sensitive properties (`correct*`, `isCorrect`, `answerKey`, `answer`, `answers`, `expectedAnswer*`, `solution*`, `rationale*`, `generalRationale`, `specificRationale`, `explanation*`, `hint*`, `trueFalseMap`, `matrixSelections`, and object-valued `buckets`) across nested `JsonObject` and `JsonArray` structures.
- Verified by `QuestionLifecycleTests` and `AttemptLifecycleTests`.

## 4. Test Execution Results

- **Command:** `dotnet test .\apps\api\Nurvia.Tests\Nurvia.Tests.csproj --filter "FullyQualifiedName~QuestionResponseGraderTests|FullyQualifiedName~QuestionLifecycleTests" --logger "console;verbosity=minimal"`
- **Result:** **73/73 PASSED** (0 Failed, 0 Skipped, Duration: 387 ms).
