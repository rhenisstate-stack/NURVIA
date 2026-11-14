# NURVIA — Lecture Security & Lifecycle Audit

**Date:** 2026-11-14  
**Authoritative Implementation:**
- Domain entity & invariants: `apps/api/Nurvia.Domain/Lectures/Lecture.cs`
- Persistence & migration: `apps/api/Nurvia.Infrastructure/Persistence/Configurations/LectureConfiguration.cs`, `apps/api/Nurvia.Infrastructure/Migrations/20261114160604_AddLectures.cs`
- Seeder: `apps/api/Nurvia.Infrastructure/Persistence/LectureSeeder.cs`, `apps/api/Nurvia.Api/Program.cs`
- Service & DTOs: `apps/api/Nurvia.Application/Services/LectureService.cs`, `apps/api/Nurvia.Application/Lectures/LectureDtos.cs`
- Controller: `apps/api/Nurvia.Api/Controllers/LecturesController.cs`
- Tests: `apps/api/Nurvia.Tests/LectureServiceTests.cs`

---

## 1. Access Control Policy Matrix

| Requester | `GET /api/lectures` (Public Catalogue) | `GET /api/lectures/{slug}` (Lectures 1–3 `Public`) | `GET /api/lectures/{slug}` (Lectures 4–12 `AuthenticatedLearner`) | `GET /api/lectures/management` & `/{id}` | Draft / Submit | Review (Approve / Reject) | Publish / Archive |
|---|---|---|---|---|---|---|---|
| Anonymous visitor | Allowed (`HighYieldConcepts` withheld on 4–12) | Allowed | **401 Unauthorized** | **401 Unauthorized** | **401** | **401** | **401** |
| Role-less / blank-role authenticated user | Allowed (`HighYieldConcepts` withheld on 4–12) | Allowed | **403 Forbidden** | **403 Forbidden** | **403** | **403** | **403** |
| `Learner` | Allowed (`HighYieldConcepts` included) | Allowed | Allowed | **403 Forbidden** | **403** | **403** | **403** |
| `Author` | Allowed (`HighYieldConcepts` **withheld** on 4–12) | Allowed | **403 Forbidden** (uses `/management/{id}`) | Allowed | Allowed | **403** | **403** |
| `Reviewer` | Allowed (`HighYieldConcepts` **withheld** on 4–12) | Allowed | **403 Forbidden** (uses `/management/{id}`) | Allowed | **403** | Allowed (cannot self-approve) | **403** |
| `Publisher` | Allowed (`HighYieldConcepts` **withheld** on 4–12) | Allowed | **403 Forbidden** (uses `/management/{id}`) | Allowed | **403** | **403** | Allowed |
| `Administrator` / `Superadmin` | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed (cannot self-approve) | Allowed |

---

## 2. Protected Fields & Separation of Concerns

- **Public Catalogue (`LectureCatalogueItemDto`):** Never exposes `BodyMarkdown`, `ReviewNotes`, or audit fields. For `AuthenticatedLearner` lectures (4–12), `HighYieldConcepts` is projected as an empty list unless the caller has `Learner` entitlement (`CanReadProtectedLectures` in `LectureService.cs`).
- **Staff Preview Separation:** `Author`, `Reviewer`, and `Publisher` roles do not receive learner entitlement on `GET /api/lectures` or `GET /api/lectures/{slug}` for protected lectures; they preview draft/pending/approved/published content via `GET /api/lectures/management` and `GET /api/lectures/management/{id}`.

---

## 3. Lifecycle Transitions & Immutability

- **Workflow:** `Draft → PendingReview → Approved → Published → Archived` (with `PendingReview → Rejected → Draft` on revision).
- **Published Immutability:** `Lecture.UpdateContent` throws `DomainException` if `Status == ContentStatus.Published` (or `PendingReview`, `Approved`, `Archived`).
- **Self-Approval Prevention:** `LectureService.ReviewAsync` rejects `ReviewDecision.Approved` when `reviewerName` matches `lecture.CreatedBy`.
- **Uniqueness:** Both `LectureService.EnsureUniqueNumberAndSlugAsync` and unique database indexes (`IX_Lectures_Number`, `IX_Lectures_Slug`) enforce uniqueness.

---

## 4. Seeder Behaviour (`LectureSeeder.cs`)

- **Idempotency:** Checks existing `Number` and `Slug` sets before inserting; repeated startup runs never duplicate records or overwrite/promote existing admin-authored or rejected lectures.
- **Publication Safety:** Defaults to `publishPreApprovedCatalogue: false` (`ContentStatus.Draft`) on startup so unreviewed content is never auto-published unless explicitly opted in via `Lectures:PublishSeededCatalogue=true`.
- **Independence:** All 12 lectures are original NURVIA educational material with an explicit independence notice from Mark Klimek / Klimek Reviews.

---

## 5. Test Evidence & Remaining Risks

- **Evidence:** `LectureServiceTests.cs` verifies default Draft seeding, idempotency, preservation of existing rejected lectures, withholding of `HighYieldConcepts` on 4–12 from anonymous/role-less/invalid-role/staff callers, learner access, duplicate number/slug rejection, self-approval rejection, illegal transitions, published immutability, and controller 401/403 boundaries (all passing in the 210-test non-PostgreSQL suite).
- **Remaining Risks:** PostgreSQL integration tests (`PostgreSqlIntegrationTests`) are blocked because `TEST_CONNECTION_STRING` is not configured, and Playwright browser E2E tests were not executed against a running API + PostgreSQL stack.
