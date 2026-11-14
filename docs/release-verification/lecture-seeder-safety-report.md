# Phase 2 — Lecture Seeder and Publication Safety Report

**Date:** 2026-11-14  
**Source Audited:** `apps/api/Nurvia.Infrastructure/Persistence/LectureSeeder.cs`, `apps/api/Nurvia.Api/Program.cs`, `apps/api/Nurvia.Api/appsettings*.json`, `apps/api/Nurvia.Tests/LectureServiceTests.cs`

## 1. Seeder & Publication Configuration Audit

1. **Fail-Safe Default (`publishPreApprovedCatalogue = false`):**
   - `LectureSeeder.SeedAsync(NurviaDbContext context, bool publishPreApprovedCatalogue = false, CancellationToken ct = default)` defaults to `false`.
   - `Program.cs:191-192` binds `builder.Configuration.GetValue<bool>("Lectures:PublishSeededCatalogue")` and passes it to `LectureSeeder.SeedAsync`.
   - Neither `appsettings.json` nor `appsettings.Development.json` sets `Lectures:PublishSeededCatalogue` (so it evaluates to `false` by default in all environments unless explicitly overridden).
2. **Idempotency & Non-Destructive Behavior:**
   - Queries existing `Number` and `Slug` values first (`AsNoTracking()`).
   - Inserts only lectures whose `Number` AND `Slug` do not already exist (`!numberSet.Contains(l.Number) && !slugSet.Contains(l.Slug)`).
   - Never updates, overwrites, or re-promotes existing `Draft`, `Published`, `Rejected`, or `Archived` lectures.
3. **Seed Content Quality (All 12 Lectures):**
   - Original NURVIA educational material with explicit disclaimer in `LectureSeeder.cs` that NURVIA is independent and not affiliated with Mark Klimek / Klimek Reviews.
   - Lectures 1–3 are `LectureAccessLevel.Public`; lectures 4–12 are `LectureAccessLevel.AuthenticatedLearner`.
   - All 12 lectures have unique numbers (`1..12`), unique slugs, non-empty summaries, structured markdown content, and non-empty `HighYieldConcepts`.
   - No unsafe HTML, no embedded secrets, and no placeholder text.

## 2. Regression Tests Added & Executed

Added `LectureSeeder_PreservesPublishedArchivedAndEditedRecords_AndRepairsPartialSeedWithoutDuplicates` to `apps/api/Nurvia.Tests/LectureServiceTests.cs` to verify:
- Pre-existing `Published` and `Archived` lectures retain their status and edited fields even when `publishPreApprovedCatalogue: true`.
- Slug collisions prevent duplicate slug insertion when repairing partial seed data.
- Repeated execution is idempotent with unique `Number` and `Slug` values.

- **Execution Result (`LectureServiceTests`):** **13/13 PASSED** (0 Failed, 0 Skipped, Duration: 14.27 s).
