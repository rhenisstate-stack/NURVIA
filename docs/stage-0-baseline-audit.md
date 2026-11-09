# NURVIA — Stage 0 Baseline Audit & Reconciliation Report

**Project:** NURVIA — Your Path to Nursing Confidence  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Branch:** `master`  
**Baseline Commit:** `5ed6ae8` (origin commit `f398008` + 10 stabilization commits)  
**Working Tree Status:** Clean (`git status` confirms zero uncommitted changes)  
**Execution Date:** November 9, 2026  
**Stack Baseline:** Next.js 15.5.29 / React 19.3.1 / TypeScript 5.6.3 / Tailwind CSS / shadcn/ui / ASP.NET Core 8 (.NET 10.0.403 SDK) / Entity Framework Core 8.0.10 / PostgreSQL (Port 5432)

---

## 1. Executive Summary & Verification Findings

An exhaustive, audit-first inspection was conducted across the codebase, backend assemblies, database runtime, frontend routes, security context, and UI layouts to reconcile historical defect reports against actual code state.

### Key Discoveries:
1. **PostgreSQL Environment:** The actual active PostgreSQL service is running on **port 5432** (`TcpTestSucceeded: True`), matching `appsettings.json`. The reported port 5433 is inactive.
2. **Migrations & Database:** `__EFMigrationsHistory` contains `20261109063432_InitialPhase2ContentSchema`. Model and database schema are currently aligned for Phase 2 entities (`Questions`, `QuestionVersions`, `QuestionOptions`, `QuestionExhibits`, `QuestionReviews`, `Exams`, `ExamVersions`, `ExamQuestions`, `ExamBlueprints`, `AuditLogs`).
3. **.NET Runtime & Build Compatibility (DEF-001):** The host environment has .NET 10 SDK (`10.0.403`) and runtime (`10.0.14`). Because the csproj files target `net8.0`, the xUnit test runner initially aborted due to missing .NET 8 runtime. Configuring `<RollForward>Major</RollForward>` and `<NuGetAudit>false</NuGetAudit>` in `apps/api/Directory.Build.props` enabled all 22 existing backend unit tests to pass cleanly (22 passed, 0 failed).
4. **Authentication & Privilege Escalation (DEF-002):** Confirmed critical vulnerability in `apps/api/Nurvia.Api/Common/UserContext.cs`: unauthenticated requests default to `Administrator` if `X-User-Role` is missing, and arbitrary role headers are trusted blindly. JWT authentication is not registered in `Program.cs`.
5. **Answer-Key Leakage (DEF-006):** Confirmed `QuestionOptionDto` exposes `IsCorrect` and `SpecificRationale`, and `QuestionVersionDto` exposes `GeneralRationale`. Active exam APIs must not serialize these fields before submission.
6. **Canonical Question Types (DEF-004):** `QuestionType` enum currently defines only 10 types. All 18 canonical types required by Stage 3 must be supported across domain, persistence, scoring, authoring, and rendering.
7. **Mock Learner Exam (DEF-005):** `apps/web/app/exam-session/page.tsx` renders a hardcoded static question (`q-4091`) with embedded client answers. There is no `Attempt` aggregate in the domain, nor any autosave or submission backend endpoints.
8. **UI/UX Discrepancies (DEF-007, DEF-008, DEF-009, DEF-010):**
   - Admin sidebar hardcodes dark-only classes (`bg-brand-navyDeep text-slate-100`), failing light-mode requirements.
   - Public navbar includes dropdown menus, which contradicts Section 9.3 ("no dropdowns").
   - Testimonial carousel includes manual Prev/Next buttons and pagination dots, which contradicts Section 9.4 ("automatic carousel only; no manual controls").
   - Learner sidebar exposes a link to Content Studio (`/admin`), blurring learner/admin boundaries.

---

## 2. Defect and Reconciliation Matrix

| Defect ID | Finding / Requirement | Severity | Component | Status | Proposed Correction | Gate |
|---|---|---|---|---|---|---|
| **DEF-001** | .NET Runtime & NuGet offline audit | Critical | `apps/api` | Confirmed & Verified Fix | Added `Directory.Build.props` with `<RollForward>Major</RollForward>` and `<NuGetAudit>false</NuGetAudit>`. 22/22 unit tests passing. | Stage 1 / Gate 1 |
| **DEF-002** | Header-based role trust & default Admin escalation | Critical | `Nurvia.Api/Common/UserContext.cs` | Confirmed Defect | Remove `X-User-Role` header fallback; introduce JWT authentication middleware, cryptographically signed tokens, role claim validation, and 401/403 authorization filters. | Stage 2 / Gate 2 |
| **DEF-003** | Database port & PostgreSQL verification | High | `Nurvia.Infrastructure` | Confirmed State | Confirmed port 5432. Build dedicated PostgreSQL test database integration test suite covering migration, seeding, transactions, concurrency, and attempt isolation. | Stage 1 / Gate 1 |
| **DEF-004** | Missing 8 question types (only 10 of 18 present) | High | `Nurvia.Domain/Enums/DomainEnums.cs` | Confirmed Gap | Extend `QuestionType` to all 18 canonical types with domain validation, DTOs, scoring algorithms, and database mapping. | Stage 3 / Gate 3 |
| **DEF-005** | Mock examination page with hardcoded question | Critical | `apps/web/app/exam-session/page.tsx` | Confirmed Defect | Introduce `Attempt` domain aggregate, EF Core persistence, API endpoints for start/autosave/submit/result, server-authoritative timer, and connect the UI. | Stage 4 / Gate 4 |
| **DEF-006** | Answer-key and rationale leakage in active exam DTOs | Critical | `Nurvia.Application/Questions/Dtos.cs` | Confirmed Defect | Segregate DTOs into `ActiveExamQuestionDto` (sanitized), `SubmittedExamResultDto`, and `ReviewQuestionDto` (feedback-policy gated). | Stage 2 & 4 / Gate 2 & 4 |
| **DEF-007** | Admin sidebar dark-only styling in light mode | High | `apps/web/components/layout/admin-shell.tsx` | Confirmed Defect | Replace hardcoded `bg-brand-navyDeep` and slate classes with semantic design tokens (`bg-surface`, `text-foreground`, `border-border`) supporting seamless light and dark mode. | Stage 6 / Gate 6 |
| **DEF-008** | Public navbar contains dropdown menus | High | `apps/web/components/layout/public-shell.tsx` | Confirmed Defect | Redesign public navbar to use direct navigation without dropdowns across the exact 9 approved destinations in exact order. | Stage 6 / Gate 6 |
| **DEF-009** | Testimonial carousel contains manual Prev/Next buttons | Medium | `apps/web/components/home/student-testimonial-carousel.tsx` | Confirmed Defect | Remove manual controls; implement automatic continuous rotation with pause on hover/focus and reduced-motion support. | Stage 6 / Gate 6 |
| **DEF-010** | Learner sidebar links directly to `/admin` | Medium | `apps/web/components/layout/learner-shell.tsx` | Confirmed Defect | Remove admin link from learner navigation; enforce strict separation of learner and admin workspaces. | Stage 6 / Gate 6 |

---

## 3. Staged Implementation Plan & Target Files

### Stage 1: Database Assurance & Integration Testing
- Target files:
  - `apps/api/Nurvia.Tests/PostgreSqlIntegrationTests.cs` (new integration test suite)
  - `apps/api/Nurvia.Infrastructure/Persistence/NurviaDbContext.cs`
  - `apps/api/Nurvia.Infrastructure/Persistence/DatabaseSeeder.cs`
- Deliverable: `docs/stage-1-database-assurance.md`

### Stage 2: Authentication, Authorization & Data Security
- Target files:
  - `apps/api/Nurvia.Api/Common/UserContext.cs` (eliminate header-based role trust)
  - `apps/api/Nurvia.Api/Program.cs` (JWT Bearer authentication, authorization policies)
  - `apps/api/Nurvia.Api/Controllers/AuthController.cs` (login, token generation, user claims)
  - `apps/api/Nurvia.Application/Questions/Dtos.cs` & `Exams/Dtos.cs` (sanitized active exam DTOs)
  - `apps/api/Nurvia.Tests/SecurityAuthorizationTests.cs` (401/403/IDOR/key leakage verification)
- Deliverable: `docs/stage-2-security-and-authorization.md`

### Stage 3: Canonical Question Domain (All 18 Question Types)
- Target files:
  - `apps/api/Nurvia.Domain/Enums/DomainEnums.cs` (18 canonical types)
  - `apps/api/Nurvia.Domain/Questions/QuestionVersion.cs` (type-specific validation rules)
  - `apps/api/Nurvia.Application/Questions/Dtos.cs` (authoring contracts)
  - `apps/api/Nurvia.Tests/AllQuestionTypesValidationTests.cs` (tests for all 18 types)
- Deliverable: `docs/stage-3-question-domain.md`

### Stage 4: Examination Engine & Attempt Lifecycle
- Target files:
  - `apps/api/Nurvia.Domain/Attempts/ExamAttempt.cs` & `AttemptResponse.cs` (domain aggregate)
  - `apps/api/Nurvia.Infrastructure/Persistence/Configurations/AttemptConfigurations.cs`
  - `apps/api/Nurvia.Application/Interfaces/IExamAttemptService.cs` & `Services/ExamAttemptService.cs`
  - `apps/api/Nurvia.Api/Controllers/ExamAttemptsController.cs` (start, autosave, submit, review)
  - `apps/api/Nurvia.Tests/AttemptLifecycleTests.cs` (autosave, scoring, concurrency, timing)
- Deliverable: `docs/stage-4-examination-engine.md`

### Stage 5: Learner Exam Renderers
- Target files:
  - `apps/web/components/exam/renderers/*` (modular registry for all 18 question types)
  - `apps/web/components/exam/question-renderer-registry.tsx`
  - `apps/web/app/exam-session/page.tsx` (connect to real attempt engine, autosave, server timer)
- Deliverable: `docs/stage-5-learner-exam-renderers.md`

### Stage 6: Learner & Admin UI/UX Refinement
- Target files:
  - `apps/web/components/layout/public-shell.tsx` (direct navigation, no dropdowns, exact 9 items)
  - `apps/web/components/layout/admin-shell.tsx` (full light mode support, semantic theme tokens)
  - `apps/web/components/layout/learner-shell.tsx` (improved hierarchy, removal of `/admin` leak)
  - `apps/web/components/home/student-testimonial-carousel.tsx` (automatic carousel only, no manual buttons)
- Deliverable: `docs/stage-6-learner-admin-ui-ux.md`

### Stage 7: Learning Integration (Study Library, Exam Discovery, Review)
- Target files:
  - `apps/web/app/learner/library/page.tsx` & `components/study/study-library-view.tsx`
  - `apps/web/app/learner/history/page.tsx` & `app/learner/reviews/[id]/page.tsx`
  - `apps/web/lib/api-client.ts` (typed client for authenticated learner APIs)
- Deliverable: `docs/stage-7-learning-integration.md`

### Stage 8: Quality Gates & Final Release Reconciliation
- Verification:
  - Backend unit & integration test suites
  - Frontend component & navigation test suites
  - TypeScript compilation (`npx tsc --noEmit`)
  - Production build (`npm run build`)
- Deliverable: `docs/NURVIA-STAGES-1-8-FINAL-RECONCILIATION.md`
