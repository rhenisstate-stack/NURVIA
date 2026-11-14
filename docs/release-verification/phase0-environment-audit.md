# Phase 0 — Repository and Environment Reconciliation

**Date:** 2026-11-14  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Branch:** `master`  
**Starting HEAD:** `27001555a0fdc6ced54b3a6b2b0f506dea41b7c5` (`chore(repo): update gitignore, tsbuildinfo, and test project backup`)

## 1. Git State & Pre-Existing Parallel Work

### Recent Commits
- `2700155` `chore(repo): update gitignore, tsbuildinfo, and test project backup`
- `4034a6c` `docs(audit): add examination audit and release-readiness reports`
- `55bfcb4` `feat(study-library): add frontend study library details, saved sets, and tutor panel`
- `4511826` `feat(study-library): add backend study library, saved sets, reviews, and tutor service`
- `74aeb8a` `security(auth): harden UserContext role extraction and add regression tests`
- `632e5ed` `docs(nurvia): publish final implementation and verification report`

### Pre-Existing Uncommitted Changes (Preserved)
The working tree contains parallel in-progress work related to StudyLibrary, Tutor, and ExamReview that predates this release-verification pass and must be preserved untouched:
- **Modified:**
  - `apps/api/Nurvia.Application/Services/ExamAttemptService.cs`
  - `apps/api/Nurvia.Application/Services/ExamService.cs`
  - `apps/api/Nurvia.Application/Services/TutorService.cs`
  - `apps/api/Nurvia.Infrastructure/Migrations/20261114181816_AddStudyLibraryMetadataSavedSetsAndReviews.cs`
  - `apps/api/Nurvia.Infrastructure/Persistence/Configurations/ExamConfigurations.cs`
  - `apps/api/Nurvia.Tests/StudyLibraryAndTutorTests.cs`
  - `apps/web/tsconfig.tsbuildinfo`
- **Untracked:**
  - `apps/api/Nurvia.Tests/StudyLibraryPostgresIntegrationTests.cs`
  - `apps/web/tests/e2e/study-library-three-modes.spec.ts`
  - `docs/study-library-production-readiness-report.md`

## 2. Installed Runtime & Tooling Versions

| Component | Version / Status |
|---|---|
| .NET SDK | `10.0.403` |
| Node.js | `v24.21.0` |
| npm | `11.19.0` |
| Next.js | `15.5.29` |
| React / React DOM | `19.3.1` |
| ESLint | `9.39.5` |
| `eslint-config-next` | `15.5.0` |
| `@playwright/test` | `1.65.0` |
| Playwright Browsers | `chromium-1254`, `chromium_headless_shell-1254` installed in `%LOCALAPPDATA%\ms-playwright` |

## 3. PostgreSQL & Test Infrastructure Audit

- **PostgreSQL Server:** Reachable on `127.0.0.1:5432` (`TcpTestSucceeded = True`). `psql` CLI is not on `PATH`.
- **`TEST_CONNECTION_STRING`:** Currently `NOT_SET` in environment.
- **`PostgreSqlIntegrationTests.cs` Requirements:**
  - Enforces `DOTNET_ENVIRONMENT=Test`.
  - Enforces `TEST_CONNECTION_STRING` must target `Database=nurvia_test` (rejects `nurvia_db`, `prod`, or empty password).
- **Other PostgreSQL Test Classes:**
  - `ReviewReleasePolicyTests.cs` and `AttemptLifecycleTests.cs` currently hardcode `Host=127.0.0.1;Port=5432;Database=nurvia_db;...` (development database) and failed in prior runs because `nurvia_db` lacks the `AcademicYear` column from the `20261114181816_AddStudyLibraryMetadataSavedSetsAndReviews` migration.
  - `StudyLibraryPostgresIntegrationTests.cs` (untracked parallel test file) also targets PostgreSQL.
- **Test Project References (`Nurvia.Tests.csproj`):**
  - References `Microsoft.AspNetCore.App` framework, `Nurvia.Domain`, `Nurvia.Application`, `Nurvia.Infrastructure`, `Nurvia.Api`, `Microsoft.EntityFrameworkCore.InMemory` `8.0.10`, `Npgsql` `8.0.5`, `xunit` `2.9.2`, `Moq` `4.20.70`.

## 4. Known Risks Identified at Phase 0

1. **Test Database Isolation Risk:** `AttemptLifecycleTests` and `ReviewReleasePolicyTests` hardcode `Database=nurvia_db` instead of honoring `TEST_CONNECTION_STRING` / `nurvia_test`.
2. **Migration Drift on `nurvia_db`:** `nurvia_db` is missing recent migrations (`AcademicYear` column on `Exams`), causing 11 test failures when running `dotnet test`.
3. **Environment Variables:** `TEST_CONNECTION_STRING` and `DOTNET_ENVIRONMENT=Test` are not set in the default shell.
