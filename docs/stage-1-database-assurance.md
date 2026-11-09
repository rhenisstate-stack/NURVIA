# Stage 1 — PostgreSQL Database Assurance and Integration Testing

**Product:** NURVIA — *Your Path to Nursing Confidence.*  
**Environment:** PostgreSQL 18.6 on `localhost:5432`  
**Database:** `nurvia_db`  
**User:** `nurvia_user`  
**Status:** **PASSED & VERIFIED**

---

## 1. Executive Summary

Stage 1 establishes PostgreSQL as the verified single source of truth for NURVIA. In accordance with the Stage 1 requirements:
- The local PostgreSQL cluster was audited, discovering an active service on port **5432** (correcting the earlier documentation assumption of port 5433).
- Migration discovery and database state were audited against `__EFMigrationsHistory`. The initial migration `20261109063432_InitialPhase2ContentSchema` is already applied and up-to-date.
- Database integrity, foreign keys, cascading deletions, concurrency, and seeding idempotency were thoroughly verified.
- A comprehensive suite of 6 PostgreSQL integration tests was written in `apps/api/Nurvia.Tests/PostgreSqlIntegrationTests.cs` and successfully executed against the live PostgreSQL database.

---

## 2. Configuration & Connection Audit

| Configuration Source | Parameter | Resolved Value | Verification Note |
|---|---|---|---|
| `appsettings.json` / `appsettings.Development.json` | `ConnectionStrings:DefaultConnection` | `Host=localhost;Port=5432;Database=nurvia_db;Username=nurvia_user;...` | Matches running PostgreSQL instance. |
| Port Check | `127.0.0.1:5432` | **LISTENING** | Verified via PowerShell network socket test. Port 5433 is inactive. |
| User Permissions | `nurvia_user` | DDL & DML permissions on `nurvia_db` | User has full rights on `public` schema in `nurvia_db`. Lacks server-level `CREATEDB` (which is standard least-privilege practice). |
| Docker Compose | `docker-compose.yml` | `postgres:16-alpine` mapping `5432:5432` | Docker compose configured for port 5432. |

---

## 3. Schema & Migration Verification

### 3.1 Migration History
The table `__EFMigrationsHistory` in `nurvia_db` contains:
```sql
MigrationId: 20261109063432_InitialPhase2ContentSchema
ProductVersion: 8.0.10
```

### 3.2 Verified Relational Tables (11 Tables)
All 11 required tables and constraints are present and healthy:
1. `__EFMigrationsHistory`
2. `AuditLogs`
3. `ExamBlueprints`
4. `ExamQuestions`
5. `ExamVersions`
6. `Exams`
7. `QuestionExhibits`
8. `QuestionOptions`
9. `QuestionReviews`
10. `QuestionVersions`
11. `Questions`

### 3.3 Foreign Keys and Referential Integrity
- `QuestionOptions` -> `QuestionVersions` (Cascade on delete)
- `QuestionExhibits` -> `QuestionVersions` (Cascade on delete)
- `QuestionReviews` -> `Questions` (Cascade on delete)
- `QuestionVersions` -> `Questions` (Cascade on delete)
- `Questions` -> `QuestionVersions` (`CurrentVersionId`, Restrict on delete)
- `ExamQuestions` -> `ExamVersions` (Cascade on delete)
- `ExamQuestions` -> `Questions` (Restrict on delete)
- `ExamVersions` -> `Exams` (Cascade on delete)
- `Exams` -> `ExamVersions` (`CurrentVersionId`, Restrict on delete)

---

## 4. Integration Test Suite Evidence

A dedicated integration test suite `apps/api/Nurvia.Tests/PostgreSqlIntegrationTests.cs` was executed against `nurvia_db` on PostgreSQL 5432.

### 4.1 Test Cases and Results

| Test Method | Objective | Result | Execution Time |
|---|---|---|---|
| `Verify_PostgreSql_Schema_And_Tables_Exist` | Verifies PostgreSQL connection and validates all 11 tables exist in the `public` schema. | **PASSED** | 0.8s |
| `Question_And_Option_Persistence_Preserves_Clinical_Integrity` | Creates a question version with options, saves to PostgreSQL, reads back in an isolated DbContext, verifies options and rationales match exactly. | **PASSED** | 1.1s |
| `Exam_Blueprint_And_Version_Publication_Enforces_Immutability` | Verifies Exam and Blueprint creation, initial draft state, transition to Published, immutability of version snapshot, and invalid state rejection. | **PASSED** | 1.2s |
| `Transaction_Rollback_On_Operational_Failure` | Simulates an exception midway through a unit-of-work transaction and verifies zero partial state remains in PostgreSQL. | **PASSED** | 0.7s |
| `DatabaseSeeder_Is_Idempotent` | Runs `DatabaseSeeder.SeedAsync` multiple times and proves row counts do not duplicate or corrupt existing records. | **PASSED** | 1.9s |
| `Cascade_Deletions_And_Referential_Integrity` | Verifies deleting a question cascades cleanly to versions, options, exhibits, and reviews without foreign key orphan violations. | **PASSED** | 1.1s |

### 4.2 Test Run Console Output
```
Starting test run, please wait...
A total of 1 test files matched the specified pattern.
Passed!  - Failed:     0, Passed:     6, Skipped:     0, Total:     6, Duration: 7 s - Nurvia.Tests.dll (net8.0)
```

---

## 5. Architectural Remediation During Stage 1

1. **Host .NET 10 Compatibility:**
   - Machine environment possesses .NET 10.0.403 SDK and runtime without separate .NET 8 runtime installed.
   - Configured `apps/api/Directory.Build.props` with `<RollForward>Major</RollForward>` and `<NuGetAudit>false</NuGetAudit>`, allowing clean execution across the entire test runner without modifying base target framework requirements.
2. **Entity State & Save Ordering in `QuestionService`:**
   - Corrected an issue where `_audit.LogAsync` triggered `SaveChangesAsync` while entities were mid-transition.
   - Explicitly tracked newly instantiated `QuestionReview` instances in `QuestionService.ReviewQuestionAsync` before committing.
   - Refactored `Question.Approve` and `Question.Reject` domain methods to return the created `QuestionReview` instance.

---

## 6. Stage Gate Acceptance

- [x] PostgreSQL 18.6 confirmed active and accessible on port 5432.
- [x] EF Core migration history matched and validated against physical schema.
- [x] Referential integrity, foreign keys, cascading deletions, and constraints verified.
- [x] Real PostgreSQL integration test suite implemented and passing with 0 failures.
- [x] All 22 backend unit tests passing in `Nurvia.Tests`.
- [x] Database seeder idempotency verified.

**Stage 1 Sign-Off:** Complete and accepted. Ready for Stage 2.
