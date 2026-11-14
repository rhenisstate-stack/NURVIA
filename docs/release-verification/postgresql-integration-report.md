# Phase 1 — PostgreSQL Integration Test Report

**Date:** 2026-11-14  
**Database Target:** `nurvia_test` on `127.0.0.1:5432` (isolated test database)  
**Environment:** `DOTNET_ENVIRONMENT=Test`, `TEST_CONNECTION_STRING` set via environment variable (credentials redacted).

## 1. Findings & Isolation Fixes

1. **`PostgreSqlIntegrationTests`:** Already enforces `DOTNET_ENVIRONMENT=Test` and `Database=nurvia_test`, runs `await context.Database.MigrateAsync()` in `InitializeAsync()`, and cleans up created entities in `DisposeAsync()`.
2. **Hardcoded `nurvia_db` Defect Fixed:** `AttemptLifecycleTests.cs` and `ReviewReleasePolicyTests.cs` previously hardcoded `Database=nurvia_db` (the development database) and did not run `MigrateAsync()`, causing 11 failures due to missing `AcademicYear` column on `nurvia_db`.
   - Added `DatabaseEnvironmentValidator.ResolveIsolatedTestConnectionString()` in `apps/api/Nurvia.Tests/DatabaseEnvironmentValidator.cs` to require `DOTNET_ENVIRONMENT=Test` and `TEST_CONNECTION_STRING` pointing strictly to `nurvia_test` (rejecting `nurvia_db` and `prod`/`production` targets).
   - Updated `AttemptLifecycleTests.cs` and `ReviewReleasePolicyTests.cs` to resolve `TEST_CONNECTION_STRING` via `DatabaseEnvironmentValidator.ResolveIsolatedTestConnectionString()` and run `await context.Database.MigrateAsync()` in `InitializeAsync()`.
3. **Pre-Existing Parallel Test File (Preserved Untouched):** Untracked `StudyLibraryPostgresIntegrationTests.cs` (part of parallel StudyLibrary work) still hardcodes `Database=nurvia_db` and was left untouched per change-control rules.

## 2. Test Execution Results

### PostgreSQL Suites (`PostgreSqlIntegrationTests`, `AttemptLifecycleTests`, `ReviewReleasePolicyTests`)
- **Command:**
  `dotnet test .\apps\api\Nurvia.Tests\Nurvia.Tests.csproj --filter "FullyQualifiedName~PostgreSqlIntegrationTests|FullyQualifiedName~AttemptLifecycleTests|FullyQualifiedName~ReviewReleasePolicyTests" --logger "console;verbosity=normal"`
- **Result:** **22/22 PASSED** (0 Failed, 0 Skipped, Duration: ~1.03 min).
  - `PostgreSqlIntegrationTests`: 11/11 PASSED (schema tables, seeder idempotency, question/option persistence, cascade delete, Superadmin uniqueness constraint, one-time bootstrap, transaction rollback, Superadmin learner isolation, learner registration/profile persistence, exam blueprint/version immutability, role assignment invariant).
  - `AttemptLifecycleTests`: 8/8 PASSED (save response, pathway match/mismatch/undeclared, submit deterministic scoring + review, IDOR protection, submit idempotency, answer-key concealment + remaining time).
  - `ReviewReleasePolicyTests`: 3/3 PASSED (manual release sanitization, manual release review block until staff release, immediate policy release).

### Full Backend Suite (Excluding Untracked Parallel `StudyLibraryPostgresIntegrationTests`)
- **Command:**
  `dotnet test .\apps\api\Nurvia.Tests\Nurvia.Tests.csproj --no-build --no-restore --filter "FullyQualifiedName!~StudyLibraryPostgresIntegrationTests" --logger "console;verbosity=minimal"`
- **Result:** **229/229 PASSED** (0 Failed, 0 Skipped, Duration: 22 s).
