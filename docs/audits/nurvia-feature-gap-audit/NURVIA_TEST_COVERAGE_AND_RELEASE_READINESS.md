# NURVIA — Test Coverage and Release Readiness

**Audit Date:** 2026-11-15  
**Execution Mode:** Read-only / non-destructive (no production or dev DB mutations).

---

## 1. Executed Checks & Actual Results (This Session)

| Suite / Check | Command Executed | Result | Scope & Observations |
|---|---|---|---|
| **Frontend TypeScript Check** | `cd apps/web; npx tsc --noEmit` | **PASS (0 errors)** | Full `apps/web` TypeScript compilation verified. |
| **Frontend ESLint** | `cd apps/web; npm run lint` | **PASS (0 errors, 361 warnings)** | Warnings are primarily `@typescript-eslint/no-unused-vars` and `@typescript-eslint/no-explicit-any` (notably in mock pages and `api-client.ts`). |
| **Frontend Unit Tests** | `cd apps/web; npm test` | **PASS (5/5 scripts)** | `navigation-and-carousel.test.mjs` (7/7), `learning-integration.test.mjs` (8/8), `question-renderers.test.mjs` (7/7), `hero-redesign.test.mjs` (6/6), `remote-api-config.test.mjs` (8/8). |
| **Backend Unit Tests (Non-Postgres)** | `dotnet test apps/api/Nurvia.Tests/Nurvia.Tests.csproj --filter "FullyQualifiedName!~Postgres" --no-build` | **224 Passed, 11 Failed (235 Total)** | All 11 failures (`AttemptLifecycleTests` [8], `ReviewReleasePolicyTests` [3]) failed-closed with `InvalidOperationException: Tests must be run with DOTNET_ENVIRONMENT=Test` from `DatabaseEnvironmentValidator.ResolveIsolatedTestConnectionString()`. Note: `dotnet test` without `--no-build` failed MSB3027 because `Nurvia.Api (10316)` was running locally and locking `bin/Debug/net10.0/*.dll`. |
| **Backend Postgres Integration Tests** | Not executed (`PostgreSqlIntegrationTests`, `StudyLibraryPostgresIntegrationTests`) | **UNVERIFIED (Excluded)** | Excluded intentionally to avoid requiring `TEST_CONNECTION_STRING` / `nurvia_test` DB setup during read-only audit. |
| **Playwright E2E Suite** | Not executed (`apps/web/tests/e2e/*.spec.ts` — 5 specs) | **UNVERIFIED (Not Run)** | Requires running frontend + compatible `apps/api` backend + seeded DB (`learner-journey.spec.ts`, `lectures-and-admin.spec.ts`, `rbac-security.spec.ts`, `study-library-three-modes.spec.ts`, `superadmin-navigation.spec.ts`). |

---

## 2. Feature-to-Test Coverage Matrix

| Feature Area | Backend Tests (`Nurvia.Tests`) | Frontend Unit Tests (`apps/web/tests`) | E2E Specs (`tests/e2e`) | Coverage Gap |
|---|---|---|---|---|
| **Auth, Password Hashing & Superadmin RBAC** | `PasswordHashingTests`, `SecurityAuthorizationTests`, `SuperadminAuthorizationTests`, `SuperadminRoleTests`, `UserContextTests`, `BootstrapConfigurationValidatorTests` | `navigation-and-carousel.test.mjs` | `rbac-security.spec.ts`, `superadmin-navigation.spec.ts` | Missing rate-limit tests, password-reset tests (feature absent). |
| **Question Lifecycle & 18 Renderers** | `QuestionLifecycleTests`, `QuestionValidationTests`, `QuestionResponseGraderTests` | `question-renderers.test.mjs` | `lectures-and-admin.spec.ts` | Missing negative test for missing `Correct*` keys on complex types. |
| **Exam Lifecycle, Layouts & Attempts** | `ExamLifecycleAndBlueprintTests`, `ExamLayoutValidationTests`, `AttemptLifecycleTests` (requires `nurvia_test`), `ReviewReleasePolicyTests` (requires `nurvia_test`) | `learning-integration.test.mjs` | `learner-journey.spec.ts`, `study-library-three-modes.spec.ts` | Attempt & review-release tests require isolated Postgres in CI. |
| **Study Library & Mark K. Lectures** | `StudyLibraryAndTutorTests`, `StudyLibraryPostgresIntegrationTests`, `LectureServiceTests` | `learning-integration.test.mjs` | `study-library-three-modes.spec.ts`, `lectures-and-admin.spec.ts` | Covered. |
| **Tutor Mode & Confidentiality** | `TutorConfidentialityTests`, `StudyLibraryAndTutorTests` | `learning-integration.test.mjs` | `study-library-three-modes.spec.ts` | Covered for deterministic mode; no AI provider tests. |
| **Avatar & File Storage** | `AvatarServiceTests`, `FileStorageServiceTests` | None | None | Missing frontend avatar upload E2E. |
| **Mock Modules (AI Tutor, Flashcards, Care Plans, Community, Planner, Admin Analytics/RBAC/Audit)** | None | None | None | **0% real workflow coverage** (modules are static mocks). |

---

## 3. Release Blockers

1. **Remote Backend Incompatibility (`GAP-001`):** `apps/web` is configured to proxy to `http://108.61.9.189:8008`, which does not serve NURVIA's `/api/*` endpoints.
2. **Plaintext HTTP Backend (`GAP-002`):** Must use HTTPS in production.
3. **14+ Mock Pages Exposed in Navigation (`GAP-008`):** Users clicking AI Tutor, Flashcards, Care Plans, Community, Study Planner, Study Guides, Saved Questions, Subscription, or Admin Overview/Analytics/Audit/RBAC/Cases/Learners/Plans/Settings/Taxonomy encounter static mock data or dead buttons.
4. **Auth Rate Limiting & Password Recovery (`GAP-004`, `GAP-005`):** Required before public user registration.
5. **Grading Bypass (`GAP-003`):** `ClinicalCaseStudy` and `ExtendedResponse` award 100% credit for any non-empty JSON.

---

## 4. Minimum Acceptance Criteria for Pilot / Production Release

- All 235+ `Nurvia.Tests` (including `AttemptLifecycleTests`, `ReviewReleasePolicyTests`, and `*Postgres*` tests) pass against an isolated `nurvia_test` PostgreSQL instance in CI.
- All 5 Playwright E2E specs pass against the deployed HTTPS backend URL.
- Zero `PRESENTATION ONLY` mock pages reachable from production navigation (either backed by real APIs or feature-flagged off).
- Rate limiting enabled and tested on `/api/auth/login` and `/api/auth/register`.
