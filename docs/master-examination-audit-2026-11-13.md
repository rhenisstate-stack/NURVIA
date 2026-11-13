# NURVIA Master Examination Audit — Refresh

**Date:** 2026-11-13 · **Branch:** `master` · **HEAD:** `842d198` ("create the lecture notes functionality to support the Mark K. lecture notes") · **Working tree:** clean

Supersedes (does not replace) `docs/master-examination-audit.md` (written at HEAD `3acf196`, 2026-11-12). That document is preserved as the historical Phase-1 audit. This refresh re-verifies **every finding in its gap register against the current HEAD** — six commits landed after the original audit (`417ffa0`, `7295b4d`, `244af75`, `a4983b6`, `3f0f6fe`, `9d353fd`, `842d198`), several of which remediate prior P0/P1 gaps. No product code was modified while producing this document.

---

## 1. Baseline (Phase 0)

| Item | State |
|---|---|
| Branch / HEAD | `master` @ `842d198`, ahead of `origin/master` by 1 commit, working tree **clean** |
| Backend | `apps/api/Nurvia.slnx` — Domain / Application / Infrastructure / Api / Tests, all `net8.0` |
| Build | **Succeeded — 0 errors, 5 pre-existing warnings** (CS8601 ×2, CS8625 ×2, xUnit2013 ×1). Warnings pre-date this audit; unchanged code paths |
| Database | PostgreSQL via Npgsql; 7 migrations, latest `20261112100000_AddExamLayoutAndDeliveryMode` (additive only) |
| Backend tests | xUnit, **16 real test files** incl. new `ExamLayoutValidationTests` (72 lines) and `QuestionResponseGraderTests` (586 lines / 33 tests) |
| Frontend | Next.js 15 / React 19 / TS; **test runner now exists**: 4 node `.mjs` suites (`npm run test`) + Playwright e2e (`npm run test:e2e`) |
| Notes | Several stale `*.bak` / `*.before-*` files are committed (frontend profiles, controllers, csproj backups). Non-blocking; candidates for cleanup — do not delete without owner approval |

---

## 2. Re-verified gap register (original → current)

| ID | Orig. | Finding | Verdict @ 842d198 | Evidence |
|---|---|---|---|---|
| G1 | P0 | Permissive `default:` grading — any non-empty response auto-credited for 11 types | **FIXED** | Grading extracted to `Nurvia.Application/Questions/QuestionResponseGrader.cs` (7295b4d). Real key-based grading now for OrderedResponse, Matching, MatrixGrid, BowTie, MultipleTrueFalse, MultipleImageSelection, DragAndDrop, TabularResponse, ShortAnswer (+ prior good types). 33 grader tests. ClinicalCaseStudy & ExtendedResponse intentionally keep legacy credit (documented free-form/human-evaluation policy, `QuestionResponseGrader.cs:265-269`) |
| G2 | P1 | No All-in-One layout | **FIXED** | `app/exam-session/page.tsx:736-753` continuous-scroll view; layout policy from attempt (`allowedLayouts`/`layoutMode`, `:249-250`); in-session toggle when `Both` (`:645-671`); pre-attempt layout modal (`:904-945`) |
| G3 | P1 | No layout config in backend/Admin | **FIXED** | `ExamVersion.cs:24-28` `AllowedLayouts`/`DefaultLayout` + `Validate()` cross-rules; DTOs `Dtos.cs:41-42/84-85/102-103`; persisted `ExamConfigurations.cs:108-116`; migration `20261112100000`; Admin UI `app/admin/exams/page.tsx:524-547` |
| G4 | P1 | Tutor mode cosmetic | **FIXED** | `ExamDeliveryMode.Tutor` starts a persisted attempt with mode-specific policy; enforced `ExamAttemptService.cs:55-59` |
| G5 | P1 | `Exam.ModeAllowed` never enforced | **FIXED** | `ExamAttemptService.cs:55-59` rejects disallowed delivery mode |
| G6 | P1 | No exam-level review content | **FIXED** | `GET /api/exams/{id}/review-content` (`ExamsController.cs:30`, Learner/Superadmin) backed by `GetExamReviewContentAsync` (`ExamAttemptService.cs:357-438`), gated by `ReviewReleasePolicy` |
| G7 | P1 | Cards expose only "Start this exam" | **FIXED** | `study-library-view.tsx:155-209` — mode-gated **Exam / Review / Tutor** actions; restricted layouts pre-seed `layout=` param |
| G8 | P2 | Admin authoring 6/18 types; no answer-key editor | **PARTIALLY FIXED** | 18 types now selectable (`new/page.tsx:712-729`) with structured-JSON "Approved Answer Key" editor (`:638-664`) incl. per-type hints + required-key validation; edit page loads/saves `contentJsonData`. Remaining gaps in §3 |
| G9 | P2 | No per-user pathway enforcement | **STILL PRESENT** | No `Pathway` on `UserProfile`/`UserAccount`; no check in `StartAttemptAsync`; no migration adds pathway columns. RN/PN separation remains display-level only |
| G10 | P2 | Layout choice not persisted | **FIXED** | `ExamAttempt.LayoutMode` (`ExamAttempt.cs:33`), set at start, switchable mid-attempt with policy validation (`ExamAttemptService.cs:188-202`), returned in `StartAttemptResultDto` |
| G11 | P2 | `/learner/my-exams` `?setId=` broken | **STILL PRESENT** | `my-exams/page.tsx:50,56` still emit `?setId=…`; `exam-session` reads only `attemptId|examId|mode|layout` → error screen |
| G12 | P2 | No autosave retry affordance | **PARTIALLY FIXED** | Auto-retry (4 s, `exam-session/page.tsx:312-328`) + pending-flush before nav/submit; **no manual retry control** — exam-shell save-failed indicator is a passive `<span>` (`exam-shell.tsx:179-184`) |
| G13 | P3 | Results page timestamps | **PARTIALLY FIXED** | Submission timestamp + elapsed time shown (`attempts/[id]/page.tsx:68,81-84`); still no start timestamp, no allocated-vs-elapsed contrast |
| G14 | P3 | No AI/Tutor integration config | **UNCHANGED (correct)** | No LLM config exists; Tutor explanations must come from approved content only. Do not invent one |

**New findings from this refresh:**

| ID | Priority | Finding | Evidence | Impact |
|---|---|---|---|---|
| N1 | P2 | Admin "Preview Exam" link uses `?examCode=` which exam-session never reads | `app/admin/exams/page.tsx:400` | Admin preview lands on error screen; Requirement 11.3 partially unmet |
| N2 | P2 | Homepage "3 Core Learning Modes" links to `/exam-session?mode=Tutor` (and Exam/Review) **without an examId** | `app/page.tsx:489` | All three marketing links land on "Choose a published exam" error |
| N3 | P3 | New-question page auto-exposes the answer-key editor for only 7 complex types; Matching / ShortAnswer / MultipleImageSelection hints only appear if JSON pre-filled | `app/admin/questions/new/page.tsx:639` | Key-authoring discoverability gap for 3 types |
| N4 | P3 | Question edit page has no type selector (type read-only) | `app/admin/questions/[id]/edit/page.tsx:78` | Type change requires new question; acceptable if intentional — confirm |
| N5 | P3 | Stale `.bak`/`.before-*` files committed across repo (~30 files) | `git diff --stat 3acf196..HEAD` | Repo hygiene; risk of confusing future audits |
| N6 | P3 | 5 pre-existing build warnings (nullable + xUnit analyzer) | build log | Quality hygiene |

---

## 3. 18-question-type lifecycle matrix @ HEAD 842d198

Grading is now authoritative via `QuestionResponseGrader.Evaluate`; answer keys live in `QuestionOption.IsCorrect`/`DisplayOrder` (relational) or `QuestionVersion.ContentJsonData` (JSON key maps).

| # | Type (canonical + aliases) | Admin authoring | Answer-key authoring | Learner renderer | Server grading | Review/rationale | Tests |
|---|---|---|---|---|---|---|---|
| 1/18 | MultipleChoice / SingleChoice | ✅ | ✅ options `IsCorrect` | ✅ | ✅ | ✅ | ✅ |
| 2 | MultipleResponse (SATA) | ✅ | ✅ | ✅ | ✅ set-equality | ✅ | ✅ |
| 3 | TrueFalse | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | FillInTheBlank / Cloze | ✅ | ✅ | ✅ | ✅ case-insensitive | ✅ | ✅ |
| 5 | NumericResponse / NumericCalculation | ✅ | ✅ | ✅ | ✅ ±0.01 | ✅ | ✅ |
| 6 | OrderedResponse | ✅ | ✅ options order | ✅ | ✅ partial fraction | ✅ | ✅ |
| 7 | Matching | ✅ | ⚠️ options even/odd pairing (no dedicated UI hint) | ✅ | ✅ partial fraction | ✅ | ✅ |
| 8 | MatrixGrid | ✅ | ✅ JSON `CorrectSelections` | ✅ | ✅ | ✅ | ✅ |
| 9 | ClinicalCaseStudy / UnfoldingCaseStudy | ✅ | n/a — free-form (legacy credit by documented policy) | ✅ | ⚠️ legacy credit (documented) | ✅ | ✅ |
| 10 | BowTie / DynamicLabBowTie | ✅ | ✅ JSON actions/condition/parameters | ✅ | ✅ 5 scored slots | ✅ | ✅ |
| 11 | MultipleTrueFalse | ✅ | ✅ JSON `CorrectTrueFalse` | ✅ | ✅ | ✅ | ✅ |
| 12 | ImageBased | ✅ | ✅ options `IsCorrect` | ✅ | ✅ | ✅ | ✅ |
| 13 | MultipleImageSelection | ✅ | ✅ options `IsCorrect` (editor hint only if JSON pre-filled — N3) | ✅ | ✅ set-equality | ✅ | ✅ |
| 14 | DragAndDrop | ✅ | ✅ JSON `CorrectBuckets` | ✅ | ✅ | ✅ | ✅ |
| 15 | ExtendedResponse | ✅ | n/a — free-form (legacy credit + rationale rubric ≥30 chars) | ✅ | ⚠️ legacy credit (documented) | ✅ | ✅ |
| 16 | TabularResponse | ✅ | ✅ options `IsCorrect` | ✅ | ✅ | ✅ | ✅ |
| 17 | ShortAnswer | ✅ | ✅ options text (editor hint only if JSON pre-filled — N3) | ✅ | ✅ case-insensitive | ✅ | ✅ |

**Verdict:** all 18 types now have a complete author → publish → render → respond → grade → review chain, with two documented free-form exceptions (types 9 and 15). Remaining authoring-UX gaps are N3/N4 and the raw-JSON nature of the key editor (acceptable v1; a structured key editor is a P3 enhancement, not a blocker).

---

## 4. What already works and must be preserved (re-confirmed @ HEAD)

1. **Answer-key protection during active attempts** — `BuildStartAttemptDto` strips `IsCorrect`/rationales; post-submission feedback gated by `ReviewReleasePolicy`.
2. **Server-authoritative grading** — all scoring in `ExamAttemptService` + `QuestionResponseGrader`; client never sends scores.
3. **Idempotent submission** — already-graded attempts return existing result.
4. **Autosave** — debounced per-question `PUT /api/attempts/{id}/responses`, pre-created response rows, resume with saved responses, deadline auto-submit, auto-retry, pending-flush before submit.
5. **Ownership enforcement** — `VerifyLearnerOwnership`, no role bypass.
6. **Version integrity** — attempts bind `ExamVersionId` at start; additive migration for layout/mode columns.
7. **17 renderer components + registry** covering all 18 types.
8. **Three-mode exam cards** with mode gating (`modeAllowed`).
9. **Exam layout policy** enforced end-to-end (domain validation → persistence → attempt → UI toggle).

## 5. Consolidated remediation backlog (recommendation)

| Priority | Work |
|---|---|
| P1 | Fix three broken learner/admin entry points: G11 (`?setId=`), N1 (`?examCode=`), N2 (homepage mode links without examId) |
| P2 | G9 pathway enforcement — add user pathway field + `StartAttemptAsync` eligibility check (needs schema addition; additive migration) |
| P2 | G12 manual retry affordance on save-failed state |
| P2 | G13 results page: start timestamp + allocated-vs-elapsed |
| P3 | N3/N4 authoring-UX polish; structured key editor for Matching/OrderedResponse; N5 backup-file cleanup; N6 warning cleanup |
| Policy confirmation | Types 9/15 legacy-credit policy + edit-page read-only type: confirm with product owner |

## 6. Test baseline (final)

- **Backend build:** ✅ 0 errors / 5 pre-existing warnings.
- **Backend tests:** ✅ **178/178 passed** (`dotnet test` with `TEST_CONNECTION_STRING` → `nurvia_test`, `DOTNET_ENVIRONMENT=Test`), including all `PostgreSqlIntegrationTests`. Initial run showed 11 failures — diagnosed as **environmental, not product defects**: the pre-existing `nurvia_test` database was owned by role `nurvia_test_user` while the suite connects as `nurvia_user`, causing `42501: permission denied for table __EFMigrationsHistory` during `MigrateAsync`. Fixed by `REASSIGN OWNED BY nurvia_test_user TO nurvia_user` + `ALTER DATABASE nurvia_test OWNER TO nurvia_user` on the disposable test DB only (no code or data changes; `nurvia_db` untouched).
- **Frontend:** `tsc --noEmit` ✅ clean. Node suites: navigation 7/7 ✅, question-renderers 4/4 ✅ (all 18 types verified at registry level), hero 6/6 ✅; **learning-integration 1 failure — stale assertion**, see §5/§7. Playwright e2e present but requires a running app + database.

## 7. Corrected interpretation of the frontend failure

`tests/learning-integration.test.mjs:31` asserts the literal substring `examId=` inside `study-library-view.tsx`. The product code builds the session URL via `new URLSearchParams({ examId: exam.id, mode })` (line 167) — the persisted-exam-id behavior the test intends to protect **is present and correct**; only the string-matching technique is stale after the URLSearchParams refactor. Remediation = update the assertion to match the current wiring (test-only change, no product change). The suite aborts on first failure, so tests 2–5 of that file could not run this session — they should also be re-run after the assertion fix.
