# Phase 4 — Authorization and Lecture Security Audit Report

**Date:** 2026-11-14  
**Scope:** `UserContext.cs`, `CurrentUser.cs`, `LecturesController.cs`, `LectureService.cs`, `ExamsController.cs`, `QuestionsController.cs`, `StudyLibraryController.cs`, `AuditLogsController.cs`

## 1. Lecture & Public/Learner Access Policy

1. **Public Visitors (`GET /api/lectures`, `GET /api/lectures/{slug}`):**
   - `LectureService.GetPublishedCatalogueAsync` returns only `ContentStatus.Published` lectures and strips `HighYieldConcepts` (`new List<string>()`) for any `AuthenticatedLearner` lecture when `CanReadProtectedLectures(user)` is `false`.
   - `LectureService.GetPublishedBySlugAsync` returns `BodyMarkdown` for `LectureAccessLevel.Public` lectures anonymously, and throws `UnauthorizedAccessException` for `LectureAccessLevel.AuthenticatedLearner` lectures unless `CanReadProtectedLectures(user)` is `true` (mapped by `LecturesController` to `401 Unauthorized` when unauthenticated or `403 Forbidden` when authenticated without entitlement).
2. **Authenticated Identity Without Entitlement:**
   - `HttpContextExtensions.GetCurrentUser()` (`UserContext.cs`) no longer defaults missing/whitespace `ClaimTypes.Role` to `"Learner"` — it returns `string.Empty`.
   - `CurrentUser.HasRole("Learner")` returns `false` for empty, whitespace, invalid, `Author`, `Reviewer`, and `Publisher` roles.
3. **Staff Role Separation & Lifecycle Boundaries:**
   - `Author`, `Reviewer`, and `Publisher` do NOT inherit `Learner` entitlement (`CanReadProtectedLectures` returns `false`). Staff preview uses `/api/lectures/management` and `/api/lectures/management/{id}` guarded by `HasManagementAccess`.
   - `Author` can create/edit `Draft` and submit for review (`LecturesController` lines 167, 211, 258).
   - `Reviewer` can approve/reject (`LecturesController` line 309), and domain/service logic blocks self-approval (`Lecture.Approve` / `LectureService.ReviewAsync`).
   - `Publisher` can publish approved and archive published lectures (`LecturesController` lines 361, 411).
   - `Administrator` cannot pass `HasRole("Superadmin")` (`CurrentUser.cs` lines 19–25), preventing regular admins from escalating to or assigning `Superadmin` privileges.

## 2. Cross-Module Consistency

- `ExamsController`, `QuestionsController`, `LecturesController`, `AuditLogsController`, and `StudyLibraryController` all enforce backend role checks via `HttpContext.HasRole(...)` / `GetCurrentUser()` before executing service logic.
- No frontend-only authorization bypasses were identified.

## 3. Security & Authorization Test Execution

- **Command:** `dotnet test .\apps\api\Nurvia.Tests\Nurvia.Tests.csproj --no-build --no-restore --filter "FullyQualifiedName~SecurityAuthorizationTests|FullyQualifiedName~SuperadminAuthorizationTests|FullyQualifiedName~SuperadminRoleTests|FullyQualifiedName~UserContextTests|FullyQualifiedName~LectureServiceTests" --logger "console;verbosity=minimal"`
- **Result:** **60/60 PASSED** (0 Failed, 0 Skipped, Duration: 10 s).
