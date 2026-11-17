# NURVIA — Final Structural & Functional Parity Forensic Review

**Date:** 2026-11-17  
**Auditor:** Antigravity  
**Target Repository:** `C:\Users\gitau\Documents\NURVIA` (`master`, HEAD `16d86e5`)  
**Reference Repository:** `C:\Users\gitau\Documents\Qlex` (strictly read-only)  
**Shared Backend:** `https://explicitbackend.com` (strictly untouched)  
**Application Identity:** `WEBSITE_11`  

---

## 1. Repository and Git Baseline

- **Branch:** `master`
- **HEAD Commit:** `16d86e5 feat(ui,tests): update shells, account menu, avatar fallback, and Phase 3.11-3.12 verification suites`
- **Staged Changes (`git diff --cached`):** None (0 files)
- **Modified Tracked Files (`git diff --name-status`):** 1 file (`apps/web/components/exam/renderers/QuestionRendererRegistry.tsx`, +19 insertions)
- **Deleted Tracked Files:** 16 orphaned root-level files (`components/shared/feedback/*` [9], `hooks/*` [2], `lib/*` [5])
- **Untracked Files (`git ls-files --others --exclude-standard`):** 93 files (78 in `apps/web/`, 15 in `docs/architecture/qlex-nurvia-parity/`)
- **Whitespace / Conflict Markers (`git diff --check`):** 0 errors

---

## 2. Complete Working-Tree Change Inventory

| Category | Count | Paths / Summary |
|---|---:|---|
| Modified | 1 | `apps/web/components/exam/renderers/QuestionRendererRegistry.tsx` |
| Deleted | 16 | `components/shared/feedback/*` (9), `hooks/*` (2), `lib/*` (5) |
| Untracked — Phase A | 16 | `apps/web/middleware.ts`, `apps/web/styles/**` (6), `apps/web/lib/constants/**` (2), `apps/web/lib/contexts/**` (7) |
| Untracked — Phase B | 14 | `apps/web/components/common/**` (10), `apps/web/components/dashboards/includes/**` (3), `apps/web/components/panel/exam/tools/CustomMiniCalculator.tsx` |
| Untracked — Phase C | 21 | `apps/web/lib/programs/programRegistry.ts`, `apps/web/components/programs/ProgramLandingView.tsx`, `apps/web/app/(web)/**` (16), `apps/web/app/web/(nexus)/**` (3) |
| Untracked — Phase D | 15 | `apps/web/lib/services/{strata,dominion}/*`, `apps/web/lib/hooks/nexus/*`, `apps/web/components/dashboards/ProgramDashboardShell.tsx`, `apps/web/app/dashboards/**` (10) |
| Untracked — Phase E | 13 | `apps/web/app/api/exams/upserts/route.ts`, `apps/web/lib/services/nexus/strata/examService.ts`, `apps/web/lib/contexts/**` (2), `apps/web/components/exam/renderers/{AudioBased,VideoBased,HighlightText}Renderer.tsx`, `apps/web/app/web/(livexams)/**` (6), `apps/web/tests/phase-e-exam-engine.test.mjs` |
| Untracked — Phase F | 2 | `apps/web/app/api/media/[...path]/route.ts`, `apps/web/tests/phase-f-media-and-parity.test.mjs` |
| Untracked — Parity Docs | 15 | `docs/architecture/qlex-nurvia-parity/*.md` (15 documents) |

*(Note: 16 + 14 + 21 + 15 + 13 + 2 - 3 overlapping `lib/contexts` = 78 untracked files in `apps/web/` + 15 in `docs/architecture/qlex-nurvia-parity/` = 93 untracked files.)*

---

## 3. Phase A–F Verification Matrix

| Phase | Deliverable | Status | Evidence |
|---|---|---|---|
| **Phase A** | `apps/web/middleware.ts` (`x-current-*` + `HttpOnly` `x-site-session`) | **VERIFIED** | Built into `ƒ Middleware 34.4 kB`; zero secrets |
| **Phase A** | Orphaned root `components/`, `hooks/`, `lib/` removal | **VERIFIED** | 16 unreferenced files deleted; `tsc` & `build` pass |
| **Phase A** | `apps/web/lib/constants/*`, `apps/web/lib/contexts/*`, `apps/web/styles/*` | **VERIFIED** | Typechecked & built cleanly |
| **Phase B** | Shared UI (`ScrollToTopButton`, `ThemeToggleButton`, `DashboardPreloader`, `Dropdown*`, `SidebarTooltip`, `CustomMiniCalculator`, `RichTextEditor` adapters) | **VERIFIED** | Typechecked, linted, built cleanly |
| **Phase B** | `AccessReminderModals`, `DashboardsAccessGate`, `useExamAccessGuard`, `SeekModal` | **VERIFIED** | Wired to `useAuth()`, `/api/strata/programs`, `/api/subscriptions/packages`, `/api/seek` |
| **Phase C** | 6 Program Landing Pages (`/pages/exams/[program]`), Info pages, Nexus overviews, Auth aliases | **VERIFIED** | SSG generated all 6 programs; zero route collisions |
| **Phase D** | Parameterized `strataService`, `dominionService`, `useStrataResource`, `useSubscriptionPackages`, `dashboards/[program]/` | **VERIFIED** | Consolidated 6×90 Qlex duplication; invalid `[program]` returns `notFound()` in `dashboards/[program]/layout.tsx` |
| **Phase E** | `/api/exams/upserts`, `examService.ts`, 3 new renderers (`AudioBased`, `VideoBased`, `HighlightText`), `QuestionRendererRegistry.tsx` | **VERIFIED** | `phase-e-exam-engine.test.mjs` (4/4) + `tsc` + `build` |
| **Phase E** | `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx` | **PARTIALLY VERIFIED** | Compiles & renders; **3 findings** (client `WEBSITE_11` string, silent fallback on invalid `[program]`/`[theme]`, hardcoded `ActionSingleChoice` submissionType; live upstream `WEBSITE_11` unverified) |
| **Phase F** | `apps/web/app/api/media/[...path]/route.ts` | **VERIFIED** (local) / **BACKEND DEPENDENCY** (live) | Prefix allowlist, traversal guard, `nosniff`, `SAFE_CONTENT_TYPE_PREFIXES`; `phase-f-media-and-parity.test.mjs` (2/2); live upstream storage unverified |

---

## 4. Security Audit Findings

- **Passed Controls:**
  - `SKEW_LINE_APP_KEY` is **never** referenced in any Phase A–F file or `.next/static/` client bundle.
  - `nurvia_casto_line` and `nurvia_casto_badge` `HttpOnly` cookies remain strictly server-managed in `apps/web/lib/lexmacasto/session.ts`.
  - Zero `document.cookie` or `skew_blanc_*` patterns imported from Qlex.
  - `validateSameOriginRequest` (CSRF) + `getServerCastoSession()` enforced on `/api/exams/upserts`.
  - `/api/media/[...path]` enforces `ALLOWED_MEDIA_PREFIXES`, traversal/double-encoding rejection, `SAFE_CONTENT_TYPE_PREFIXES`, and `X-Content-Type-Options: nosniff`.
  - `SKEW_LINE_DOTNET_BASE_URL` HTTPS enforcement in `next.config.mjs` remains intact.
- **Security Finding (Medium):**
  - `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx:78` contains the literal string `WEBSITE_11` inside a Client Component error fallback, which appears in the generated `.next/static` client bundle (`page-7a01ac496fad61f4.js`).

---

## 5. API Contract Verification Matrix

| Frontend Integration | Upstream Route | Method | Auth / CSRF | Live `WEBSITE_11` Status |
|---|---|---|---|---|
| `/api/exams/upserts` (`examService.ts`) | `/api/castoline/strata/assessment/exams/upsert/{user/answers,actions,question/actions,lifecycle,preferences}` (+ `/diy/`) | `POST` | `HttpOnly` session + CSRF | **REQUIRES_BACKEND_OWNER_CONFIRMATION** (unverified live) |
| `strataService.ts` | `/api/strata/[resource]` -> `/api/castoline/strata/*` | `GET` | Public (`absolute`) / Session (`distinct`,`relative`,`live`) | **VERIFIED_SUPPORTED** (via existing NURVIA BFF; `examsLive` unverified live) |
| `dominionService.ts` | `/api/subscriptions/[resource]` -> `/api/castoline/nexus/subscription/*` | `GET` | Session | **VERIFIED_SUPPORTED** (via existing NURVIA BFF) |
| `/api/media/[...path]` | `${baseUrl}/${safePath}` | `GET` | Public allowlisted media prefixes + `buildSiteHeaders` | **UNVERIFIED** against live upstream storage |
| `/auth/{login,register,recovery/password,logout}` | Redirects to `/sign-in`, `/sign-up`, `/forgot-password`, or `useAuth().signOut()` | N/A | Preserves existing NURVIA auth BFF | **VERIFIED_SUPPORTED** |

---

## 6. Six-Program / Eight-Theme Route Matrix

- **Programs (`NURSING_PROGRAM_SLUGS`):** `nclex-rn`, `nclex-pn`, `rn-nursing`, `lpn-nursing`, `ati-teas`, `hesi-a2`
- **Themes:** `atlas`, `cascade`, `classic`, `generic`, `glacial`, `orbit`, `pulse`, `zen`
- **`/pages/exams/[program]`:** SSG (`generateStaticParams()`) + `notFound()` on invalid slug → **VERIFIED**.
- **`/dashboards/[program]/...`:** `layout.tsx` enforces `isNursingProgramSlug(program)` → `notFound()` on invalid slug → **VERIFIED**.
- **`/web/[program]/vista/exam/[theme]`:** Does **not** call `notFound()` on invalid `[program]` or `[theme]` (silently falls back to `nclex-rn` / `generic`); live exam data & submission depend on `WEBSITE_11` provisioning → **PARTIALLY VERIFIED**.

---

## 7. Content-Source Compliance Findings

- **Mark K / NURVIA Lecture Notes** (`nurvia-lectures-data.ts`) and **Nursing Care Plans** (`care-plans-data.ts`) remain the only local content catalogues.
- `localStorage` in new files (`PanelThemeContext`, `PanelFontSizeContext`, `ExamThemeContext`, `ExamFontSizeContext`) stores **UI theme/font preferences only** — zero learner records, exam attempts, or catalogues are persisted locally.
- Zero hardcoded mock exam questions or fallback catalogues introduced in Phase A–F.

---

## 8. Test Results

| Check | Outcome | Notes |
|---|---|---|
| `npx tsc --noEmit` (`apps/web`) | **Passed** | 0 errors |
| `npm run lint` (`apps/web`) | **Passed** | 0 errors (pre-existing warnings only) |
| `npm test` (`apps/web`) | **Passed** | 17/17 existing `.mjs` suites |
| `node tests/phase-e-exam-engine.test.mjs` | **Passed** | 4/4 structural & security checks |
| `node tests/phase-f-media-and-parity.test.mjs` | **Passed** | 2/2 media & parity doc checks |
| `npm run build` (`apps/web`, HTTPS origin) | **Passed** | Compiled all routes + `Middleware 34.4 kB` |
| `dotnet build --no-restore` (`apps/api`) | **Passed** | `0 Warning(s), 0 Error(s)` |
| `dotnet test` / Playwright E2E / Live `WEBSITE_11` exam submit | **Not Run / Blocked** | Live `WEBSITE_11` exam provisioning unverified |

---

## 9. Outstanding Backend Dependencies (19 Qlex Files)

- Social OAuth (`QLEX-0163`, `QLEX-0166`–`QLEX-0172`: 8 files)
- Content Strata (`QLEX-0191`–`QLEX-0192`: `cognition`, `document`: 2 files)
- System & User Controls (`QLEX-0211`–`QLEX-0219`: 9 files)

---

## 10. Parity Accounting Reconciliation

- `FILE_LEVEL_PARITY_REGISTER.md`: **1,757** unique rows (`QLEX-0001`–`QLEX-1757`), 1 primary disposition per file:
  - `CONSOLIDATE`: 1,318 | `CREATE`: 195 | `ADAPT`: 118 | `EXCLUDE`: 91 | `BACKEND DEPENDENCY`: 19 | `EXACT EQUIVALENT`: 13 | `REPLACE`: 3 → **Sum = 1,757**
- `MASTER_PROGRESS_REGISTER.md`: **49** workstreams: `1,647 Mapped + 91 Excluded + 19 Blocked = 1,757` (exact match).

---

## 11. Findings by Severity

- **Critical:** None.
- **High:** None.
- **Medium:**
  1. **Client-bundle `WEBSITE_11` literal** in `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx:78`.
  2. **Missing `notFound()` validation** for invalid `[program]` / `[theme]` params in `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx:37-39`.
  3. **Hardcoded `ActionSingleChoice`** in `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx:154` instead of mapping from `currentQuestion.questionType`.
  4. **Unverified live `WEBSITE_11` upstream contracts** for `/api/exams/upserts`, `/api/strata/examsLive`, and `/api/media/[...path]`.
- **Low:**
  1. `PanelThemeContext` / `ExamThemeContext` store custom colors in state/`localStorage` without applying CSS variables to `document.documentElement` yet.
  2. `TipTapEditor.tsx` / `LexicalEditor.tsx` are textarea-backed adapters (intentional to avoid unapproved npm dependencies).

---

## 12. Exact Files Requiring Remediation (Before Commit Approval)

1. `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx` (remove `WEBSITE_11` literal, enforce `notFound()` on invalid `[program]`/`[theme]`, and map `questionType` to `ExamSubmissionType`).

---

## 13. Final Recommendation (Initial Forensic Pass — 2026-11-17)

**CONDITIONALLY ACCEPTED — SPECIFIC FINDINGS REMAIN**

The working tree is structurally sound, regression-free across all local test suites and builds, mathematically reconciled across all 1,757 Qlex files, and preserves all NURVIA security boundaries. Remediating the single file `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx` (Findings #1–#3) will bring the branch to **ACCEPTED — READY FOR OWNER COMMIT APPROVAL**.

---

## 14. Forensic Findings Remediation & Pre-Commit Verification (2026-11-17)

All three application-code findings in `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx` have been remediated and verified:

| Finding | Root Cause | File Modified | Fix Applied | Verification & Result |
|---|---|---|---|---|
| **1. Client-side `WEBSITE_11` disclosure** | Literal `WEBSITE_11` in Client Component error fallback | `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx` | Replaced with neutral message (`Live exam session is not currently available (${res.status}).`) | **PASS** — `0` matches for `WEBSITE_11`, `SKEW_LINE_APP_KEY`, `nurvia_casto_*`, `skew_blanc_` in `.next/static/*.js` |
| **2. Silent fallback on invalid `[program]` / `[theme]`** | Ternary fallbacks to `'nclex-rn'` and `'generic'` | `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx` | Strict validation via `isNursingProgramSlug` + `isExamTheme`; invalid routes call `notFound()` and skip data loading | **PASS** — `phase-e-exam-engine.test.mjs` (7/7), all 48 valid `6×8` combinations preserved |
| **3. Hardcoded `ActionSingleChoice`** | `submitQuestionAnswer('ActionSingleChoice', ...)` ignored `questionType` | `apps/web/app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx` | Added `QUESTION_TYPE_TO_SUBMISSION` + `resolveExamSubmissionType()`; unsupported/missing types render an explicit `role="alert"` state | **PASS** — `phase-e-exam-engine.test.mjs` (7/7), `QuestionRendererRegistry.tsx` intact |

### Updated Test & Build Evidence
- `npx tsc --noEmit` (`apps/web`): **PASS** (0 errors)
- `npm run lint` (`apps/web`): **PASS** (0 errors)
- `npm test` (`apps/web`): **PASS** (17/17 suites)
- `node tests/phase-e-exam-engine.test.mjs`: **PASS** (7/7)
- `node tests/phase-f-media-and-parity.test.mjs`: **PASS** (2/2 — updated to `>= 15` to account for `FINAL_FORENSIC_REVIEW.md`)
- `npm run build` (`apps/web`, `SKEW_LINE_DOTNET_BASE_URL=https://explicitbackend.com`): **PASS** (`ƒ /web/[program]/vista/exam/[theme] 9.11 kB`, `ƒ Middleware 34.4 kB`)
- `dotnet build --no-restore` (`apps/api`): **PASS** (`0 Warning(s), 0 Error(s)`)

### Unresolved External Backend Dependencies (Unchanged)
- `/api/exams/upserts`, `/api/strata/examsLive`, and `/api/media/[...path]` remain **unverified against live `WEBSITE_11` upstream access** on `https://explicitbackend.com` and require authorized backend owner confirmation / live integration testing.

### Revised Final Recommendation

**ACCEPTED — READY FOR OWNER COMMIT APPROVAL**

All three local code findings are resolved and verified by typecheck, lint, unit/parity tests, clean production build, and `.next/static` client-bundle inspection, with all NURVIA security invariants preserved.
