# NURVIA Phase 3.5.1 — Regression and Build Verification Report

**Date:** 2026-11-16  
**Gate:** D — Regression and Build Verification  
**Status:** PASS

---

## 1. Executed Checks & Exact Counts

| Check | Exact Command | Timestamp | Exit Code | Passed | Failed | Skipped | Warnings | Execution Mode |
|---|---|---|---|---|---|---|---|---|
| **TypeScript Typecheck** | `.\apps\web\node_modules\.bin\tsc.cmd -p apps/web/tsconfig.json --noEmit` | 2026-11-16T18:41:55+03:00 | `0` | Pass (0 errors) | 0 | 0 | 0 | Local static analysis |
| **Unit & Security Suites** | `npm --prefix apps/web test` | 2026-11-16T18:42:07+03:00 | `0` | **9/9 suites** (71 checks) | 0 | 0 | 1 Node `MODULE_TYPELESS_PACKAGE_JSON` warning | Local Node test runner |
| **Auth Handler Integration** | `node apps/web/tests/auth-handlers-integration.test.mjs` | 2026-11-16T18:42:17+03:00 | `0` | **14/14** | 0 | 0 | 0 | Local mocked backend (`fetch` stub) |
| **ESLint** | `npm --prefix apps/web run lint` | 2026-11-16T18:42:35+03:00 | `0` | Pass (0 errors) | 0 | 0 | 221 pre-existing warnings | Local ESLint |
| **Production Build** | `npm --prefix apps/web run build` | 2026-11-16T18:43:01+03:00 | `0` | Pass (all routes compiled) | 0 | 0 | 221 pre-existing ESLint warnings | Local `next build` |
| **Playwright Auth E2E** | `$env:E2E_WEB_URL='http://localhost:4197'; npx --prefix apps/web playwright test --config=apps/web/playwright.config.ts tests/e2e/auth-route-remediation.spec.ts` | 2026-11-16T18:45:13+03:00 | `0` | **5** | 0 | **1** (`EXT-3.5-02` credential workflow) | 0 | Local `next start -p 4197` + route mocks for 404/payload tests |

---

## 2. Unit & Security Suite Breakdown (`npm --prefix apps/web test`)

1. `tests/navigation-and-carousel.test.mjs` — **9/9 passed**
2. `tests/learning-integration.test.mjs` — **8/8 passed**
3. `tests/question-renderers.test.mjs` — **7/7 passed**
4. `tests/hero-redesign.test.mjs` — **6/6 passed**
5. `tests/remote-api-config.test.mjs` — **8/8 passed**
6. `tests/calculators.test.mjs` — **9/9 passed**
7. `tests/lexmacasto-integration.test.mjs` — **9/9 passed**
8. `tests/lexmacasto-phase2-security.test.mjs` — **8/8 passed**
9. `tests/auth-route-remediation.test.mjs` — **7/7 passed**

**Total:** **9/9 suites passed** (**71/71 individual assertions/sub-tests passed**, 0 failed).

---

## 3. Reconciliation of Previously Reported Test Totals

- **Playwright `3 passed / 1 skipped` vs `5 passed / 1 skipped`:**
  - `NURVIA_PHASE_3_5_SECURITY_AND_REGRESSION_REPORT.md` (5:11 PM) reported `3 passed, 1 skipped` from the pre-Phase-3.5 4-test spec.
  - Commit `1360765` added 2 new Playwright tests to `apps/web/tests/e2e/auth-route-remediation.spec.ts` (sign-up `Password`/`PIN`/`Both` + mobile viewport; sign-in `Password`/`PIN` + `rememberMe`), bringing the suite to **6 total tests**: **5 passed, 1 skipped** (`authenticated workflow` skipped when `E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` are unset).
- **14/14 auth integration tests:** Confirmed (`node apps/web/tests/auth-handlers-integration.test.mjs` passes 14/14).
- **9/9 unit and security suites:** Confirmed (`npm --prefix apps/web test` runs 9 scripts, all passing).
- **221 ESLint warnings:** Confirmed pre-existing (`0` errors, `221` warnings across untouched admin/learner/component/legacy files, `api-client.ts`, and `auth-route-remediation.spec.ts`).

---

## 4. Gate D Conclusion

**PASS** — All local TypeScript, unit/security, integration, lint, production build, and non-credential Playwright E2E checks pass. The single skipped Playwright test (`authenticated workflow`) is explicitly tied to `EXT-3.5-02`.
