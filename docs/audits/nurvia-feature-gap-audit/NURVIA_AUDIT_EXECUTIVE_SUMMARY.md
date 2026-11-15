# NURVIA — Comprehensive Audit Executive Summary

**Audit Date:** 2026-11-15  
**Mode:** READ-ONLY / NON-DESTRUCTIVE  
**Repository:** `c:\Users\gitau\Documents\NURVIA`  
**Branch / Commit:** `master` @ `3aab62ed9172fa9fc448218e6997860ce09df6d3` (4 commits ahead of `origin/master`; pre-existing unstaged change only in `apps/web/tsconfig.tsbuildinfo`)  
**Benchmark:** `https://nursingplex.com/`

---

## 1. Project Overview & Actual Architecture

NURVIA is a nursing education and examination-preparation monorepo comprising:

- **Frontend (`apps/web`):** Next.js `15.5.0` (App Router), React `19.0.0`, TypeScript `5.6.3`, Tailwind CSS `3.4.15`, Framer Motion `14.12.0`, Lucide React `0.454.0`. Contains **57 `page.tsx` routes** across public, authentication, learner, exam-session, and administrative surfaces, plus **18 canonical question renderers** (`apps/web/components/exam/renderers/`).
- **Local Backend (`apps/api`):** ASP.NET Core (`net10.0` target, EF Core `8.0.10`, Swashbuckle `6.6.2`) structured in Clean Architecture:
  - `Nurvia.Domain` — Entities (`UserAccount`, `UserProfile`, `Question`, `QuestionVersion`, `QuestionOption`, `QuestionExhibit`, `QuestionReview`, `Exam`, `ExamVersion`, `ExamQuestion`, `ExamBlueprint`, `SavedStudySet`, `ExamReview`, `ExamAttempt`, `AttemptResponse`, `Lecture`, `AuditLog`) and domain enums (`QuestionType`, `NursingPathway`, `ExamCategory`, `CognitiveSkill`, `ClientNeedCategory`, `ReviewReleasePolicy`, `ExamLayoutPolicy`).
  - `Nurvia.Application` — Use cases, DTOs, `QuestionResponseGrader`, `TutorService`, `RoleAssignmentPolicy`, `JwtService`, `Pbkdf2PasswordHasher`, `BootstrapConfigurationValidator`.
  - `Nurvia.Infrastructure` — `NurviaDbContext` (PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL 8.0.10`), 11 EF Core migrations, `DatabaseSeeder`, `LectureSeeder`, `FileStorageService`, `SkiaAvatarImageValidator`.
  - `Nurvia.Api` — 9 API controllers (`AuthController`, `ProfileController`, `AvatarController`, `QuestionsController`, `ExamsController`, `ExamAttemptsController`, `StudyLibraryController`, `LecturesController`, `AuditLogsController`) + Minimal API endpoints `/api/health` and `/api/catalogue/summary`.
  - `Nurvia.Tests` — xUnit test suite (235+ tests including InMemory unit tests and isolated PostgreSQL integration tests).
- **Deployed / Configured Remote Backend (`SKEW_LINE_DOTNET_BASE_URL`):** `apps/web/.env.local` points `SKEW_LINE_DOTNET_BASE_URL` to `http://108.61.9.189:8008` (HTTP, non-HTTPS). `apps/web/next.config.mjs` rewrites `/api/backend/:path*` to `${apiBase}/api/:path*`.

---

## 2. Overall Product Maturity

| Layer / Area | Maturity Assessment | Summary |
|---|---|---|
| **Core Exam Engine & 18 Question Renderers** | **High (Implemented)** | Real end-to-end persistence, autosave, timer, `AllInOne`/`Sequential` layouts, `Review`/`Exam`/`Tutor` modes, deterministic grading (`QuestionResponseGrader`), and `ReviewReleasePolicy`. |
| **Study Library & Mark K. Lectures** | **High (Implemented)** | Published catalog, academic metadata filtering (`School`, `AcademicYear`, `Season`, `Subject`, `Topic`, `Difficulty`), saved study sets, exam reviews, and Mark K. lecture authoring/publishing workflow. |
| **Auth, Profile, Avatar & RBAC (Local API)** | **High (Implemented)** | Cookie-based JWT (`nurvia_session`, `HttpOnly`, `SameSite=Strict`), CSRF (`X-CSRF-TOKEN`), PBKDF2 hashing, `RoleAssignmentPolicy`, IDOR checks, Skia-validated avatar upload. |
| **Remote Backend Integration (`108.61.9.189:8008`)** | **Blocked / Incompatible** | Live HTTP probes return `302 Found -> /web/restoration/lost` for `/api/health`, `/swagger/v1/swagger.json`, `/api/auth/*`, `/api/exams`, `/api/study-library`. The remote host runs `LexmaCasto` / "Master Bank" (`/api/castoline/*`), not NURVIA's `/api/*` contract. |
| **Learner Ancillary Modules** | **Presentation Only (Mock)** | `/learner/ai-tutor`, `/learner/flashcards`, `/learner/care-plans`, `/learner/community`, `/learner/planner`, `/learner/guides`, `/learner/saved-questions`, `/learner/subscription` render hardcoded arrays or keyword-matched `setTimeout` stubs. |
| **Admin Ancillary Modules** | **Presentation Only (Mock)** | `/admin`, `/admin/analytics`, `/admin/audit`, `/admin/cases`, `/admin/learners`, `/admin/plans`, `/admin/rbac`, `/admin/settings`, `/admin/taxonomy`, `/admin/question-types` render hardcoded mock data (even where `/api/audit-logs` and `/api/auth/assign-role` exist on the backend). |
| **NGN Unfolding Simulation & Clinical Studio** | **Partial / Missing** | Single-item `ClinicalCaseStudy` and `BowTie`/`MatrixGrid` exist, but there is no multi-step unfolding case engine, no automated `ClinicalCaseStudy`/`ExtendedResponse` grading (defaults to `LegacyCredit` = 100% for any non-empty JSON), and no care plan builder. |

---

## 3. Critical Findings (P0 / Release Blockers)

1. **P0 — Deployed Backend Contract Mismatch (`108.61.9.189:8008`):** `apps/web/.env.local` targets `http://108.61.9.189:8008`, which serves `LexmaCasto` ("Master Bank") and returns `302 -> /web/restoration/lost` for all NURVIA `/api/*` endpoints (`/api/auth/me`, `/api/exams`, `/api/study-library`, etc.). No NURVIA frontend workflow can operate against this remote host without either deploying `apps/api` or implementing an adapter for the `/api/castoline/*` contract.
2. **P0 — Plaintext HTTP Backend URL in `.env.local`:** `SKEW_LINE_DOTNET_BASE_URL=http://108.61.9.189:8008` uses unencrypted `http://`. In production, `AuthController.Login` sets `Secure = Request.IsHttps`, and `next.config.mjs` emits a security warning.
3. **P0 — Missing Rate Limiting & Password Recovery:** `AuthController` has no brute-force rate limiting on `/api/auth/login` or `/api/auth/register`, and no password recovery/reset flow exists anywhere in backend or frontend.
4. **P0 — `QuestionResponseGrader` Silent Full Credit Fallback:** `ClinicalCaseStudy` (Type 9) and `ExtendedResponse` (Type 15) unconditionally award `1m` (100%) via `LegacyCredit` for any non-empty JSON. Furthermore, `MultipleTrueFalse`, `MatrixGrid`, `DragAndDrop`, and `BowTie` silently fall back to `LegacyCredit` if `ContentJsonData` lacks the `Correct*` key.

---

## 4. Most Important Product Opportunities (vs. NursingPlex)

Benchmarking against `https://nursingplex.com/` reveals where NURVIA already leads (18 NGN renderers, deterministic partial-credit grading, 3 delivery modes, Mark K. editorial workflow, academic metadata filters) and where genuine gaps exist:

1. **NGN Unfolding Case Study Engine** (linked multi-question vignettes with evolving EHR vitals/labs/notes and manual/rubric grading for `ExtendedResponse`).
2. **Question of the Day (`/qotd`)** with RN/PN tracks, streaks, rationales, and community discussion.
3. **Interactive Nursing Care Plans Library & Builder** (100+ NANDA-I/NIC/NOC plans replacing the 2-item mock on `/learner/care-plans`).
4. **Real Community Forum, Study Groups & Results Insights** (replacing the 2-item mock on `/learner/community`).
5. **Grounded AI Clinical Tutor & Spaced Repetition Flashcards** (connecting `/learner/ai-tutor` to a real `IAiTutorProvider` and building persisted SRS `Flashcard` entities).
6. **Live Performance Intelligence & Readiness Analytics** (extending `/learner/performance` with persisted topic/cognitive-skill breakdowns without uncalibrated pass-probability claims).

---

## 5. Security Posture & Implementation Readiness

- **Local `apps/api` Security Posture:** **Strong core controls** (PBKDF2-SHA256, `HttpOnly`/`SameSite=Strict` JWT cookies, `AutoValidateAntiforgeryTokenAttribute`, `RoleAssignmentPolicy` blocking Administrator-to-Superadmin elevation, IDOR checks on attempts, Skia image re-validation on avatars, `BootstrapConfigurationValidator`). Gaps: no rate limiting, no password reset, no refresh tokens/revocation list, no security headers middleware, and `Admin` UI pages (`/admin/rbac`, `/admin/audit`, `/admin/learners`) are un-wired mocks.
- **Test & Build Readiness:**
  - Frontend `npx tsc --noEmit`: **PASS** (0 errors).
  - Frontend `npm run lint`: **PASS** (0 errors, 361 warnings).
  - Frontend `npm test`: **PASS** (5 test scripts, 35+ assertions).
  - Backend `dotnet test --filter "FullyQualifiedName!~Postgres" --no-build`: **224 Passed, 11 Failed** (the 11 failures in `AttemptLifecycleTests` and `ReviewReleasePolicyTests` fail-closed because `DOTNET_ENVIRONMENT=Test` and `TEST_CONNECTION_STRING` were not set; `*Postgres*` integration tests were excluded to keep the audit non-destructive).
  - **Release Blocker:** `apps/web` cannot be released against `http://108.61.9.189:8008` until the backend deployment/contract mismatch is resolved and the 14 mock/presentation-only pages are either wired, gated, or removed from production navigation.
