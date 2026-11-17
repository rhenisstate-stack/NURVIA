# Test and Verification Report

## 1. Static Verification (`apps/web`)
- **`npx tsc --noEmit`:** Exited `0` (zero TypeScript errors across all replicated Qlex + preserved NURVIA files).
- **ESLint (`eslint.config.mjs`):** Exited `0` (zero ESLint errors; legacy Qlex warnings preserved without altering exact Qlex SHA-256 file hashes).
- **Route Collision Audit:** Verified `0` duplicate Next.js App Router page/API route paths after reconciling `(web)/pages/(more)/*` and `api/auth/validate/route.ts`.

## 2. Automated Frontend & Security Test Suites (`npm test` — 17 Suites)
All **17** test suites in `apps/web` pass (`0` failures):
1. `tests/navigation-and-carousel.test.mjs` (9/9 passed)
2. `tests/learning-integration.test.mjs` (8/8 passed)
3. `tests/question-renderers.test.mjs` (7/7 passed)
4. `tests/hero-redesign.test.mjs` (6/6 passed)
5. `tests/remote-api-config.test.mjs` (8/8 passed)
6. `tests/calculators.test.mjs` (9/9 passed)
7. `tests/lexmacasto-integration.test.mjs` (9/9 passed)
8. `tests/lexmacasto-phase2-security.test.mjs` (8/8 passed)
9. `tests/auth-route-remediation.test.mjs` (7/7 passed)
10. `tests/phone-country-picker.test.mjs` (10/10 passed)
11. `tests/phase-3-7-auth-error-and-security.test.mjs` (5/5 passed — verified zero `WEBSITE_1`, zero `skew8lancasto`/`skew8@lancasto` outside `temporaryChallenge.ts`, and zero JS-readable `skew_blanc_session_*` cookies)
12. `tests/phase-3-8-api-parity.test.mjs` (9/9 passed)
13. `tests/phase-3-9-dashboard-and-public-routes.test.mjs` (5/5 passed)
14. `tests/phase-3-10-learner-filters-and-menu.test.mjs` (5/5 passed)
15. `tests/phase-3-11-content-and-recovery.test.mjs` (6/6 passed)
16. `tests/phase-3-12-parity-and-compliance.test.mjs` (5/5 passed)
17. `tests/phase-qlex-full-replication.test.mjs` (5/5 passed — verified all 6 program dashboards, all 48 `6x8` livexams routes, `HttpOnly` session bridging on replicated API routes, `PublicShell` `SeekModal` integration, and all 14 replication registers)

## 3. Backend Verification (`apps/api`)
- **`dotnet build`:** Succeeded (`0 Warning(s)`, `0 Error(s)` across `Nurvia.Domain`, `Nurvia.Application`, `Nurvia.Infrastructure`, `Nurvia.Api`, and `Nurvia.Tests`).
- **`dotnet test --no-build`:** `246` unit/in-memory tests passed; `30` PostgreSQL integration tests fail closed as designed when `DOTNET_ENVIRONMENT=Test` and an isolated local PostgreSQL `TEST_CONNECTION_STRING` (`Database=nurvia_test`) are not provisioned in the shell environment. No tests touched the shared LexmaCasto backend (`https://explicitbackend.com`).

## 4. Production Build (`npm run build` in `apps/web`)
- Webpack production compilation: `✓ Compiled successfully` using `.env.local` (`SKEW_LINE_DOTNET_BASE_URL=https://explicitbackend.com`).
