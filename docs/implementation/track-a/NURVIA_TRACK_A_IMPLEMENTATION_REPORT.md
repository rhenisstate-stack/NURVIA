# NURVIA Track A Implementation & Verification Report

**Date:** 2026-11-15  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Branch:** `master` (base commit `271f36d045f74b63b5b8858349e3eaddecb6f81b`, 5 commits ahead of `origin/master`)  
**Scope:** Track A — Critical Defect Remediation, Backend Integration Stabilization & Release Readiness  

---

## 1. Executive Summary & Gate Decisions

| Phase | Scope / Defect IDs | Gate Decision | Notes |
| --- | --- | --- | --- |
| Phase 0 | Baseline & Environment Discovery | **PASS** | Frontend `tsc`/`npm test` passed; local `Nurvia.Api` healthy on `http://127.0.0.1:5055`; PostgreSQL listening on `5432`. |
| Phase 1 | `GAP-001`, `GAP-002`, `SEC-001` (Remote Backend Host) | **BLOCKED** | `apps/web/.env.local` points to `http://108.61.9.189:8008` (`LexmaCasto`), which is incompatible with NURVIA `/api/*` routes. Blocked awaiting backend-owner confirmation, OpenAPI spec, and site-header contract. |
| Phase 2 | `GAP-003` (Unsafe `LegacyCredit` Grader Fallback) | **PASS** | Removed `LegacyCredit`, added `GradingOutcome`, failed closed on missing keys, marked `ClinicalCaseStudy`/`ExtendedResponse` as `PendingManualReview`. |
| Phase 3 | `SEC-002` (Auth Rate Limiting & Abuse Protection) | **PASS** | Added IP-partitioned `UseRateLimiter` policies + per-account `IAccountRateLimiter` with `429` + `Retry-After` and safe `ForwardedHeaders`. |
| Phase 4 | `SEC-003` (Password Recovery / Reset Workflow) | **PASS (SMTP BLOCKED)** | Implemented `PasswordResetToken` (SHA-256 hashed, single-use, 30m expiry), EF migration `AddPasswordResetTokens`, `forgot-password`/`reset-password` endpoints, anti-enumeration `202`, and `/forgot-password` + `/reset-password` UI. Real SMTP delivery is **BLOCKED** until SMTP/email provider credentials are configured (`LoggingEmailSender` fallback active). |
| Phase 5 | `GAP-006` (Broken `/exam-session` Links) | **PASS** | Replaced broken `/exam-session` links without `examId`/`attemptId` in `nclex/page.tsx`, `learner/planner/page.tsx`, and `learner/saved-questions/page.tsx`. |
| Phase 6 | `GAP-007` / `SEC-005` (Admin Audit UI) | **PASS** | Replaced mock events in `/admin/audit` with `nurviaApi.getAuditLogs` (loading, empty, error, pagination, entity filter, CSV export). |
| Phase 7 | `GAP-008` / `SEC-005` (Admin RBAC UI & User Directory) | **PASS** | Added `GET /api/auth/users` (`Administrator`/`Superadmin` only) and wired `/admin/rbac` to `getUsers` + `assignRole` enforcing `RoleAssignmentPolicy`. |
| Phase 8 | `GAP-009` (Calculator Numeric Validation) | **PASS** | Added `apps/web/lib/calculators.ts` finite & positive-divisor validation in `learner/calculators/page.tsx` preventing `Infinity` / `NaN`. |
| Phase 9 | `SEC-006` (Security Headers & CORS) | **PASS** | Added `SecurityHeadersMiddleware` (`nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `CSP`, HTTPS-only `HSTS`) and env-driven `Cors:AllowedOrigins`. |
| Phase 10 | Mock Admin Modules Inventory | **PASS** | Added non-destructive `PreviewBanner` to the 8 static/preview admin pages without deleting modules or expanding into Track B/C/D. |
| Phase 11 | Isolated PostgreSQL Testing (`nurvia_test`) | **PASS** | All 262 backend tests (including PostgreSQL integration tests and `AddPasswordResetTokens` migration) passed against `nurvia_test` with sequential collection execution. |
| Phase 12 | Full Frontend & Backend Regression | **PASS** | `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), `npm test` (6/6 suites passed), `dotnet test -c Release` (262/262 passed). |

---

## 2. Detailed Remediation Summary

### Phase 1 — Remote Backend Host (`GAP-001`, `GAP-002`, `SEC-001`) — BLOCKED
- Verified `apps/web/.env.local` configures `SKEW_LINE_DOTNET_BASE_URL=http://108.61.9.189:8008`.
- Per `docs/NURVIA_REMOTE_BACKEND_SECURITY_ASSESSMENT.md` and `docs/NURVIA_BACKEND_OWNER_INTEGRATION_REQUIREMENTS.md`, `108.61.9.189:8008` hosts `LexmaCasto` (redirecting `/api/*` and `/swagger` to `/web/restoration/lost`), and `https://explicitbackend.com/health` lacks backend-owner confirmation, OpenAPI specification, and site-header contract.
- `.env.local` was preserved unmodified per Phase 1 stop rules.

### Phase 2 — Question Grader Fail-Closed Remediation (`GAP-003`)
- Updated `apps/api/Nurvia.Application/Questions/QuestionResponseGrader.cs`:
  - Removed `LegacyCredit(...)`.
  - Added `QuestionResponseGrader.GradingOutcome` (`AutoGraded`, `PendingManualReview`, `InvalidConfiguration`) on `QuestionResponseGradingResult`.
  - `MultipleTrueFalse`, `MatrixGrid`, `DragAndDrop`, and `BowTie` fail closed with `(false, 0m, GradingOutcome.InvalidConfiguration)` when required `Correct*` keys are absent or empty.
  - `ClinicalCaseStudy` and `ExtendedResponse` return `(false, 0m, GradingOutcome.PendingManualReview)` for substantive JSON and `(false, 0m, GradingOutcome.AutoGraded)` for empty/malformed payloads.
  - Unknown `QuestionType` values return `(false, 0m, GradingOutcome.InvalidConfiguration)`.
- Updated `apps/api/Nurvia.Tests/QuestionResponseGraderTests.cs` to assert fail-closed and `PendingManualReview` behavior.

### Phase 3 — Authentication Rate Limiting (`SEC-002`)
- Created `apps/api/Nurvia.Api/Security/AuthRateLimiting.cs` (`AuthRateLimitOptions`, `IAccountRateLimiter`, `AccountRateLimiter`, `AddNurviaRateLimiting`) and wired into `Program.cs` and `AuthController.cs`.
- Applied IP-partitioned `EnableRateLimiting` policies on `register`, `login`, `forgot-password`, and `reset-password`, plus per-normalized-email throttling on `login` and `forgot-password`, returning HTTP `429` with `Retry-After`.
- Configured `ForwardedHeadersOptions` to trust only explicitly configured `ForwardedHeaders:KnownProxies`.
- Added unit tests in `apps/api/Nurvia.Tests/AuthRateLimitingTests.cs`.

### Phase 4 — Password Recovery Workflow (`SEC-003`)
- Added `apps/api/Nurvia.Domain/Accounts/PasswordResetToken.cs`, `PasswordResetTokenConfiguration.cs`, `IEmailSender.cs`, `LoggingEmailSender.cs`, and EF Core migration `20261115135502_AddPasswordResetTokens`.
- Implemented `RequestPasswordResetAsync` and `ResetPasswordAsync` in `AuthService.cs` (32-byte CSPRNG token, SHA-256 hash stored in DB, 30-minute expiration, single-use invalidation, `IsActive` enforcement, PBKDF2 password update, and `AuditLog` entries).
- Added `POST /api/auth/forgot-password` (anti-enumeration `202 Accepted`) and `POST /api/auth/reset-password` in `AuthController.cs`.
- Added `forgotPassword` and `resetPassword` to `apps/web/lib/api-client.ts`, created `apps/web/app/forgot-password/page.tsx` and `apps/web/app/reset-password/page.tsx`, and linked from `apps/web/app/sign-in/page.tsx`.
- Added unit tests in `apps/api/Nurvia.Tests/PasswordRecoveryTests.cs`.
- **Remaining Blocker:** Production email delivery requires configuring an SMTP/transactional `IEmailSender` implementation and credentials.

### Phase 5 — Broken `/exam-session` Links (`GAP-006`)
- Updated `apps/web/app/nclex/page.tsx` (lines 74 and 238) from `/exam-session?track=RN&category=NCLEX` to `/exams?track=RN`.
- Updated `apps/web/app/learner/planner/page.tsx` from `/exam-session` to `/exams`.
- Updated `apps/web/app/learner/saved-questions/page.tsx` from `/exam-session` to `/learner/custom-practice`.
- Added regression checks in `apps/web/tests/navigation-and-carousel.test.mjs`.

### Phase 6 — Admin Audit UI (`GAP-007` / `SEC-005`)
- Rewrote `apps/web/app/admin/audit/page.tsx` to query `nurviaApi.getAuditLogs` with `entityType` filtering, search over loaded records, pagination, CSV export, and explicit loading/empty/error states (no mock fallback).

### Phase 7 — Admin RBAC UI & User Directory (`GAP-008` / `SEC-005`)
- Added `AuthUserSummaryDto` and `IAuthService.GetUsersAsync` (`AuthDtos.cs`, `AuthService.cs`) returning non-sensitive user summaries (`Id`, `Name`, `Email`, `Role`, `IsActive`, `CreatedAtUtc`).
- Added `GET /api/auth/users` in `AuthController.cs` restricted to `Administrator` and `Superadmin`.
- Added `getUsers` and `assignRole` to `apps/web/lib/api-client.ts` and wired `apps/web/app/admin/rbac/page.tsx` to live user listing and role assignment while preserving `RoleAssignmentPolicy` restrictions.
- Added unit tests in `apps/api/Nurvia.Tests/RbacUserManagementTests.cs`.

### Phase 8 — Calculator Numeric Validation (`GAP-009`)
- Created `apps/web/lib/calculators.ts` (`calculateIvRates`, `calculateDosage`) enforcing `Number.isFinite`, `volume >= 0`, `timeHours > 0`, and `dropFactor > 0`.
- Updated `apps/web/app/learner/calculators/page.tsx` to render `—` and an accessible `role="alert"` validation message instead of `Infinity` or `NaN`.
- Added `apps/web/tests/calculators.test.mjs` and wired it into `apps/web/package.json`.

### Phase 9 — Security Headers & Environment-Driven CORS (`SEC-006`)
- Created `apps/api/Nurvia.Api/Security/SecurityHeadersMiddleware.cs` and `CorsConfigurationHelper`, wired into `apps/api/Nurvia.Api/Program.cs`.
- Added unit tests in `apps/api/Nurvia.Tests/SecurityHeadersAndCorsTests.cs`.

### Phase 10 — Mock Admin Modules Inventory
- Created `apps/web/components/admin/preview-banner.tsx` and added it to the 8 preview-only admin pages:
  - `/admin`, `/admin/analytics`, `/admin/cases`, `/admin/learners`, `/admin/plans`, `/admin/question-types`, `/admin/settings`, `/admin/taxonomy`.
- Verified live/persisted admin pages: `/admin/audit`, `/admin/rbac`, `/admin/exams`, `/admin/lectures`, `/admin/questions`, `/admin/reviews`.

---

## 3. Verification Evidence

- **Backend (Isolated PostgreSQL `nurvia_test`):**
  - Command: `DOTNET_ENVIRONMENT=Test TEST_CONNECTION_STRING="Host=localhost;Port=5432;Database=nurvia_test;..." dotnet test apps/api/Nurvia.Tests/Nurvia.Tests.csproj -c Release --no-build -- xUnit.ParallelizeTestCollections=false`
  - Result: **262 passed, 0 failed, 0 skipped** (Duration: 2m 17s).
  - Note: Sequential test collection execution avoids concurrent `MigrateAsync()` races on the shared `nurvia_test` database.
- **Frontend:**
  - `npx tsc --noEmit`: **0 errors**
  - `npm run lint`: **0 errors** (345 pre-existing warnings)
  - `npm test`: **6/6 test scripts passed** (`navigation-and-carousel.test.mjs`, `learning-integration.test.mjs`, `question-renderers.test.mjs`, `hero-redesign.test.mjs`, `remote-api-config.test.mjs`, `calculators.test.mjs`).

---

## 4. Proposed Logical Commits (Pending Authorization)

1. `fix(api): fail closed on unkeyed questions and mark subjective items pending manual review (GAP-003)`
2. `feat(security): add auth rate limiting, security headers middleware, and env-driven CORS (SEC-002, SEC-006)`
3. `feat(auth): implement password recovery workflow and AddPasswordResetTokens migration (SEC-003)`
4. `feat(admin): add GET /api/auth/users and wire /admin/audit and /admin/rbac to live APIs (GAP-007, GAP-008, SEC-005)`
5. `fix(web): repair broken /exam-session links, harden IV calculator validation, and label preview admin modules (GAP-006, GAP-009)`
6. `docs(track-a): add Track A implementation and verification report`
