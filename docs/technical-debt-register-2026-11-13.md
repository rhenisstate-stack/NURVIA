# NURVIA Technical Debt Register

**Assessment date:** 2026-11-13
**Repository baseline:** `master` at `7bf7862`
**Purpose:** Record verified unresolved risks for controlled follow-up.
**Scope:** Examination grading contracts, EF migration discovery, and migration consistency.

This register supplements the historical examination and implementation reports. It does not silently rewrite their original test results or claim that unresolved items have been fixed.

## Status definitions

- **Confirmed:** Reproduced or established from source/configuration inspection.
- **Deferred:** Intentionally not changed during the current remediation.
- **Requires verification:** Evidence identifies a concern, but its complete impact or resolution has not been established.
- **Not a release certification:** This register is not a substitute for full regression, database-bootstrap, or browser E2E verification.

## NUR-001 — Historical EF migration discovery metadata

**Status:** Confirmed / Deferred
**Priority:** High

EF migration discovery currently reports six migrations, while the two local databases contain eight migration-history entries.

The two historical migrations not discovered by the current tooling are:

- `20261111120000_AddUserProfile`
- `20261112100000_AddExamLayoutAndDeliveryMode`

Observed metadata:

- `AddUserProfile.cs` has no `[Migration]` or `[DbContext]` attributes and has no Designer file.
- `AddExamLayoutAndDeliveryMode.cs` has a `[Migration]` attribute, but no `[DbContext]` association and no Designer file.

**Risk:** A clean database bootstrap may not reproduce the schema represented by the existing databases.

**Required follow-up:**

1. Reconstruct the intended migration metadata and historical target models.
2. Verify the complete migration chain using EF tooling.
3. Test a fresh database bootstrap in an isolated database.
4. Compare the resulting schema with the existing database schema.
5. Do not apply reconstructed migrations to production databases without a separately reviewed migration plan.

## NUR-002 — Historical migration target-model reconstruction

**Status:** Confirmed / Deferred
**Priority:** High

The two undiscovered historical migrations do not currently have Designer files containing their historical target models.

**Risk:** Reconstructing only migration attributes without correct historical target models could produce an incomplete or misleading migration chain.

**Required follow-up:** Reconstruct each migration's historical model from source history and database evidence. Review generated metadata and migration operations before accepting the result.

## NUR-003 — ShortAnswer renderer/grader payload mismatch

**Status:** Confirmed / Deferred
**Priority:** High

Observed contract mismatch:

- Learner renderer sends `{ ShortAnswer: val }`.
- Grader extracts `TextResponse`, `textResponse`, or `value`.

The renderer's submitted field is not among the grader's recognized fields.

**Risk:** A learner's valid short-answer response may not be evaluated as intended.

**Required follow-up:**

1. Define one canonical request payload.
2. Align renderer, API contract, and grader.
3. Add tests covering the actual renderer payload through grading.
4. Verify case handling and accepted-answer behavior.

## NUR-004 — MultipleImageSelection payload mismatch

**Status:** Confirmed / Deferred
**Priority:** High

Observed contract mismatch:

- Renderer submits a singular `{ SelectedOptionId: id }`.
- Grader expects an array or array-valued field, including `SelectedOptionIds`, `selectedOptionIds`, `OptionIds`, `optionIds`, `SelectedIndices`, `selectedIndices`, `values`, or `Values`.
- The learner UI currently behaves as single-select while the grader expects multiple selections.

**Risk:** The UI and server disagree about the answer cardinality and payload representation.

**Required follow-up:** Agree on single-select versus multi-select semantics, align the UI and API payload, and test the complete response-to-grade path.

## NUR-005 — Matching option-count validation

**Status:** Confirmed / Deferred
**Priority:** Medium

The backend Matching validation does not enforce an even option count, while the grader ignores an odd trailing option.

**Risk:** Invalid authoring data may be accepted and interpreted inconsistently during grading.

**Required follow-up:** Validate the expected pairing structure and reject incomplete pairs before publication.

## NUR-006 — MultipleImageSelection accepted-answer validation

**Status:** Confirmed / Deferred
**Priority:** Medium

Validation permits an exhibits-only configuration, while grading requires correct Options.

**Risk:** An author may publish a question without the answer-key configuration required by the grader.

**Required follow-up:** Align publication validation with the authoritative grading contract.

## NUR-007 — ShortAnswer accepted-answer validation

**Status:** Confirmed / Deferred
**Priority:** Medium

Validation permits a ContentJsonData-only accepted-answer configuration, while the grader checks Options.

**Risk:** A question may pass authoring validation but lack an answer key that the grader can evaluate.

**Required follow-up:** Define one authoritative accepted-answer representation and enforce it consistently.

## NUR-008 — Database migration ProductVersion discrepancy

**Status:** Confirmed / Requires verification
**Priority:** Medium

The migration-history row for `20261111054031_AddSuperadminRoleUniqueness` reports:

- `nurvia_db`: EF ProductVersion `8.0.11`
- `nurvia_test`: EF ProductVersion `8.0.10`

Other observed migration-history versions match.

**Risk:** The discrepancy may reflect different tooling or migration execution histories.

**Required follow-up:** Establish the cause and document the supported EF tooling/package version. Do not edit migration-history rows merely to make the values match.

## NUR-009 — AddUserPathway Designer brace structure

**Status:** Confirmed / Requires verification
**Priority:** Low

`AddUserPathway.Designer.cs` contains an additional nested block in `BuildTargetModel`, with matching closing braces. It compiles, so this is not currently a demonstrated syntax failure.

**Required follow-up:** Review and simplify the generated Designer structure when the migration metadata work is undertaken. Preserve generated model semantics.

---

## Work completed and explicitly outside this deferred scope

The following work was committed before this register:

- `c09ffa9` — allocated and elapsed time in examination results.
- `54a8709` — additional question answer-key editor exposure.
- `cad5b2f` — profile select-control change handling.
- `0e8c95d` — nullable withheld review rationales.
- `7bf7862` — test null handling and lifecycle assertions.

These commits do not resolve NUR-001 through NUR-009.

## Execution order for follow-up

1. Resolve and test the ShortAnswer and MultipleImageSelection grading contracts.
2. Correct authoring validation for Matching and the two affected answer-key types.
3. Reconstruct historical EF migration metadata and validate a fresh database bootstrap.
4. Investigate the ProductVersion discrepancy.
5. Clean up the AddUserPathway Designer structure.
6. Re-run backend, frontend, PostgreSQL integration, and browser E2E verification.

**Change-control rule:** No migration reconstruction, database update, or grading behavior change is authorized merely by recording an item in this register. Each follow-up requires a reviewed implementation and its own verification evidence.
