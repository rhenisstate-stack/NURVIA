# NURVIA — Phase 8 Deployment Readiness Checklist

**Target Environment:** Staging  
**Branch:** `master`  
**Verification Date:** 2026-11-15

---

## 1. Database & Migration Readiness
- [x] Isolated PostgreSQL test database (`nurvia_test`) provisioned and migrated via EF Core `MigrateAsync()`.
- [x] `AttemptLifecycleTests` and `ReviewReleasePolicyTests` resolve `TEST_CONNECTION_STRING` under `DOTNET_ENVIRONMENT=Test` via `DatabaseEnvironmentValidator.ResolveIsolatedTestConnectionString()`.
- [x] Production/development database (`nurvia_db`) untouched during verification.
- [ ] **Staging Pre-Deploy:** Run `dotnet ef database update` (or verify startup `MigrateAsync()`) against the target staging PostgreSQL instance before opening traffic.

## 2. Seed Data & Content Publication Safety
- [x] `LectureSeeder` defaults to `publishPreApprovedCatalogue = false` (`Lectures:PublishSeededCatalogue` is absent/false in `appsettings.json` and `appsettings.Development.json`).
- [x] `LectureSeeder` preserves existing `Published`, `Archived`, and staff-edited lecture records without creating duplicates (`LectureServiceTests`: 13/13 passed).
- [ ] **Staging Pre-Deploy:** Explicitly set `Lectures__PublishSeededCatalogue=true` only if the staging environment should auto-publish the 12-lecture catalogue on first boot; leave `false` for production editorial sign-off.

## 3. Security, RBAC & Authorization
- [x] Cookie-based authentication + CSRF (`X-CSRF-TOKEN`) verified by backend tests and Playwright E2E (`rbac-security.spec.ts`: 7/7 passed).
- [x] Role-escalation and self-approval guards verified (`superadmin-navigation.spec.ts`: 7/7 passed; `lectures-and-admin.spec.ts`: 2/2 passed).
- [x] Protected lecture content (`Lectures 4–12`) returns `401` without `bodyMarkdown` for unauthenticated callers.
- [x] Exam-mode sanitization strips `isCorrect` / `correctOptionIds` before serving active attempts.
- [ ] **Staging/Prod Pre-Deploy:** Configure strong unique `BootstrapAdmin__Password` (or disable bootstrap after initial owner account creation) and ensure HTTPS-only cookies (`Secure`) in production reverse proxy.

## 4. Build & Automated Verification Gates
- [x] Backend build: `dotnet build .\apps\api\Nurvia.slnx --no-restore` — **0 Warning(s), 0 Error(s)**.
- [x] Backend tests (against `nurvia_test`): `236/236 PASSED` (0 failed, 0 skipped; excludes untracked/parallel `StudyLibraryPostgresIntegrationTests`).
- [x] Frontend unit tests: `28/28 PASSED` across 4 suites.
- [x] TypeScript (`npx tsc --noEmit`): **0 errors**.
- [x] ESLint (`npm run lint`): **0 errors**, 361 pre-existing legacy warnings (0 warnings in files authored/modified in this pass).
- [x] Next.js production build (`npm run build`): **54/54 routes** compiled cleanly.
- [x] Playwright E2E suite: **27/27 PASSED** (`learner-journey.spec.ts`, `rbac-security.spec.ts`, `superadmin-navigation.spec.ts`, `lectures-and-admin.spec.ts`).
