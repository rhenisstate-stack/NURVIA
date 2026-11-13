# NURVIA Architecture and Implementation Report — Examination Experience Remediation

**Date:** 2026-11-13 · **Branch:** `master` · **Base HEAD:** `842d198` · **Working tree at start:** clean

Scope: the approved full remediation backlog from `docs/master-examination-audit-2026-11-13.md` (Phase 2 plan → Phases 3–8 execution). Principles honored throughout: extend existing architecture, no duplicate engines, no mock data, backend-authoritative policy, additive-only schema changes, preserve the established NURVIA design system.

---

## 1. Architecture decisions

| Decision | Rationale |
|---|---|
| Admin preview reuses the **review-content pipeline** (`ExamReviewContentDto` + `QuestionRendererRegistry` read-only rendering) instead of a second preview engine | Requirement 11.3 wants preview parity with the learner experience; reusing one renderer chain avoids a second implementation (rule 19) |
| Pathway enforcement lives in **`ExamAttemptService.StartAttemptAsync`**, not the API layer | Assessment policy belongs in the application service where mode/layout/eligibility checks already live; consistent with existing `ModeAllowed` enforcement |
| `UserProfile.Pathway` is **nullable** with "undeclared = unrestricted" | Existing learners have no pathway; a hard restriction would lock out the entire existing user base. Policy is documented and transitional (confirmed decision in the audit) |
| Pathway stored as **string enum name** (RN / PN_LPN), matching `Exam.Pathway` and the layout/mode columns | Consistency with existing exam configuration storage conventions |
| My Library rewritten as a **view over persisted attempt history** (`getAttemptHistory`) | No bookmark backend exists; fabricating one would violate rules 14–15. Resume/review links match the verified exam-session contract |

## 2. Existing functionality reused (not rebuilt)

- `QuestionResponseGrader` (all 18 types) — untouched
- Exam layout policy stack: `ExamVersion.Validate()` → persistence → `StartAttemptAsync` → exam-session toggle — untouched
- `ReviewReleasePolicy` gating, autosave idempotent endpoint, attempt resume, ownership verification — untouched
- `StudyLibraryView` card Exam/Review/Tutor actions — untouched (all three entry points now reach it correctly)
- shadcn-styled `components/ui/*`, learner shell, existing feedback patterns — reused

## 3. New components and services introduced

### Backend
| Item | File(s) | Purpose |
|---|---|---|
| `GetExamPreviewContentAsync` | `Nurvia.Application/Interfaces/IExamAttemptService.cs`, `Services/ExamAttemptService.cs` | Admin preview of any exam status; DTO-building factored into `BuildReviewContentDto` shared by review + preview |
| `GET /api/exams/{id}/preview` | `Nurvia.Api/Controllers/ExamsController.cs` | Administrator/Superadmin only; no attempt; bypasses release policy (admins are answer-key owners) |
| `UserProfile.Pathway` | `Nurvia.Domain/Accounts/UserProfile.cs` | Nullable `NursingPathway?`; extends `UpdateProfile` domain method |
| `UserProfileConfiguration` | `Nurvia.Infrastructure/Persistence/Configurations/UserProfileConfiguration.cs` | String enum conversion (max 30), column lengths, unique UserId index |
| Migration `20261113120000_AddUserPathway` | `Nurvia.Infrastructure/Migrations/` (+ full-model Designer) | Additive nullable `Pathway` column; **applied to `nurvia_db` and `nurvia_test`** |
| Pathway eligibility check + `IsPathwayCompatible` | `Services/ExamAttemptService.cs` | RN→{RN, RN_Exit}, PN_LPN→{PN_LPN, PN_Exit}; undeclared → unrestricted |
| Pathway DTO surface | `Nurvia.Application/Security/ProfileDtos.cs`, `Services/ProfileService.cs` | `Pathway` in read/update DTOs; server-side validation to RN/PN_LPN |
| `SubmittedExamResultDto.TimeLimitMinutes` | `Nurvia.Application/Exams/Dtos.cs` | Allocated-vs-elapsed reporting |
| `ReviewQuestionDto.GeneralRationale` made nullable | `Nurvia.Application/Questions/Dtos.cs` | Correct nullability for withheld rationales (also clears a CS8601 warning) |

### Frontend
| Item | File(s) | Purpose |
|---|---|---|
| `getExamPreviewContent` | `apps/web/lib/api-client.ts` | Preview endpoint client |
| Preview session mode | `apps/web/app/exam-session/page.tsx` | `mode=Preview` → admin preview endpoint; distinct banner; reuses read-only review rendering; `deliveryMode` coerced to Review |
| My Library rewrite | `apps/web/app/learner/my-exams/page.tsx` | Real data: resume in-progress attempts, review completed; loading skeletons; honest empty/error states; mock `initialStudySets` removed |
| Attempt History honesty | `apps/web/app/learner/history/page.tsx` | Fabricated `fallbackAttempts` deleted; explicit load-failure state |
| Homepage mode links | `apps/web/app/page.tsx` | Route to `/exams` catalog (real card actions) instead of an exam-session URL the runtime can't resolve |
| Admin preview link | `apps/web/app/admin/exams/page.tsx` | `?examId=…&mode=Preview` |
| Pathway selector | `apps/web/app/learner/profile/page.tsx`, `lib/api-types.ts` | Learner declares RN / PN_LPN; explanatory copy |
| Manual save-retry | `apps/web/components/layout/exam-shell.tsx`, `app/exam-session/page.tsx` | "Save failed — retry" button; `retrySaveNow` re-persists the current question's latest answer immediately (safe: idempotent autosave) |
| Results timestamps | `apps/web/app/learner/attempts/[id]/page.tsx` | Started + Submitted timestamps; "Time used X min of Y min allocated (Z%)" |
| Answer-key editor exposure | `apps/web/app/admin/questions/new/page.tsx` | Auto-shown for Matching, ShortAnswer, MultipleImageSelection too |

## 4. Question types (Phase 3 status)

All 18 types retain their complete lifecycle from the base HEAD (grader + 33 tests + 17 renderers verified by `question-renderers.test.mjs`). No new question-type work was required at this HEAD — verified in the audit. Authoring-UX gaps N3 fixed; N4 (edit-page type read-only) retained pending product confirmation.

## 5. Navigation layouts (Phase 4 status)

Already complete at base HEAD (domain policy, persistence, attempt layout, learner selection, in-session switch). No changes required; regressions covered by `ExamLayoutValidationTests`.

## 6. Database changes

| Migration | Change | Character |
|---|---|---|
| `20261113120000_AddUserPathway` | `UserProfiles.Pathway varchar(30) NULL` | **Purely additive**, reversible (Down drops the column), no data touched |

Applied via `dotnet ef database update --connection <nurvia_db>` and via the integration suite's `MigrateAsync` (verified in `nurvia_test` history). `nurvia_db` data untouched; no destructive statements anywhere.

**Infrastructure defect found and partially fixed:** EF discovers only migrations carrying a `.Designer.cs` `[DbContext]` file. The new migration received a full-model Designer; the pre-existing `20261111120000_AddUserProfile` and `20261112100000_AddExamLayoutAndDeliveryMode` still lack one (undiscovered by EF tooling — harmless on already-provisioned databases, but a fresh-database bootstrap would silently skip them, and no migration exists for the Lectures feature). Requires owner-approved follow-up.

## 7. Security measures

- Preview endpoint is **role-gated to Administrator/Superadmin** and creates no attempt and no learner activity record.
- Pathway authorization enforced **server-side** at attempt start; the client cannot bypass it (the check runs before any attempt state transition).
- Profile pathway values are validated server-side (only RN / PN_LPN accepted; invalid values leave the persisted declaration untouched rather than failing the whole save).
- No learner-facing endpoint change exposes answer keys: exam delivery sanitization and `ReviewReleasePolicy` are untouched; the preview endpoint is staff-only by design.
- Removed committed backup files that duplicated live source (reduced risk of divergent stale copies).

## 8. Mock-data elimination

| Location | Before | After |
|---|---|---|
| `/learner/my-exams` | 4 static study sets + broken `?setId=` links | Real attempt history (resume/review), skeletons, empty/error states |
| `/learner/history` | 3 fabricated attempts shown until API load (and shown forever on failure) | Real data only; explicit load-failure message |

Not touched: homepage static catalog (`initialStudySets`) — asserted by the approved hero-redesign test suite; flagged for owner decision (marketing content vs. live catalog).
---

## Current Status Clarification — 2026-11-13

This report records an earlier implementation snapshot. Its statements about
complete question-type grading lifecycles and release readiness must not be
treated as current verification.

Subsequent repository inspection at HEAD `7bf7862` identified unresolved
renderer, validation, and grading-contract issues:

- ShortAnswer renderer payload and grader extraction contract do not align.
- MultipleImageSelection currently submits a singular selection while the
  grader expects a collection of selected values.
- Matching validation does not enforce an even number of options.
- MultipleImageSelection validation can accept exhibit-only configuration
  although the grader requires configured answer options.
- ShortAnswer validation can accept ContentJsonData-only answer configuration
  although the grader evaluates configured answer options.

The structured answer-key editor changes do not, by themselves, resolve these
runtime contract issues.

Migration discovery also requires more precise qualification. Current EF
tooling discovers six migrations, while the two local databases contain eight
migration-history rows. `AddUserProfile` lacks migration/context attributes
and a Designer file. `AddExamLayoutAndDeliveryMode` has a Migration attribute
in its main file but lacks the DbContext association and Designer file.
Missing Designer files alone should not be treated as a complete explanation
of both discovery failures.

The `AddUserPathway` migration was applied to the existing local databases;
that does not prove a clean database can reproduce the complete schema.

The current deferred findings and follow-up requirements are recorded in
`docs/technical-debt-register-2026-11-13.md`. This clarification does not
certify production readiness or replace fresh build, test, migration, and
browser verification.
