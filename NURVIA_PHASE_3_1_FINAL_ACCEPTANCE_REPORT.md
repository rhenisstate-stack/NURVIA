# NURVIA Phase 3.1 — Final Acceptance Report

**Date:** 2026-11-16  
**Application:** NURVIA (`apps/web`)  
**Final Release Decision:** **REJECTED**

> **Reason for Rejection:** All confirmed internal NURVIA code defects (`DEF-3.1-01` through `DEF-3.1-03`) have been remediated and verified locally (`npm test`, `auth-handlers-integration.test.mjs`, `tsc`, `eslint`, `next build`, `.next/static` secret scan, and unauthenticated Playwright E2E). However, the live production deployment at `https://nurvia-black.vercel.app` still serves a stale pre-Phase-1 build (returning `404` on `/api/auth/me` and `/api/auth/config-status`, and `DNS_HOSTNAME_RESOLVED_PRIVATE` on `/api/backend/auth/me` and `/api/backend/auth/csrf`), and no authorized test account is available to verify live authenticated workflows.

---

## Gate-by-Gate Acceptance Status

| Gate | Requirement | Status | Evidence |
|---|---|---|---|
| G0 | Correct NURVIA repository and change boundary verified | **PASS** | `master` @ `b3b7c0a`, `C:\Users\gitau\Documents\NURVIA`; no edits to Qlex-Nursing or LexmaCasto. |
| G1 | Root cause of incorrect current-user URL established | **PASS** | `NURVIA_PHASE_3_1_PRODUCTION_ROUTE_FORENSIC_REPORT.md` (stale pre-Phase-1 deployment). |
| G2 | All stale authentication URL references resolved | **PASS** | `apps/web/lib/api-url.mjs`, `auth-route-remediation.test.mjs` tests 1 & 7. |
| G3 | Correct deployed `/api/auth/me` route verified | **FAIL** | Local `next build` & `next start` PASS; live `https://nurvia-black.vercel.app/api/auth/me` still returns `404`. |
| G4 | Unsupported CSRF endpoint calls removed | **PASS** | `lexmacasto-integration.test.mjs` test 5, `auth-route-remediation.test.mjs` test 7, Playwright test 1. |
| G5 | Existing application-level CSRF protections verified | **PASS** | `auth-handlers-integration.test.mjs` test 4, `lexmacasto-phase2-security.test.mjs` test 5. |
| G6 | Response parser safely handles JSON and non-JSON errors | **PASS** | `apps/web/lib/api-response.ts`, `auth-route-remediation.test.mjs` tests 2–5, Playwright test 3. |
| G7 | Backend hostname and Vercel private-hostname issue investigated | **PASS** | Traced to pre-Phase-1 `next.config.mjs` rewrite + private/localhost `apiBase` on stale Vercel deployment. |
| G8 | Login route and contract verified | **PASS** | Local `next start` -> `https://explicitbackend.com/api/castoline/auth/login` (`401` with site headers) + integration test 5. |
| G9 | Authenticated current-user retrieval verified | **BLOCKED** | Verified against mock backend (`auth-handlers-integration.test.mjs` test 6); live blocked (no test account). |
| G10 | Session persistence verified | **BLOCKED** | Requires authorized NURVIA test account. |
| G11 | Logout and local session invalidation verified | **BLOCKED** | Verified against mock backend (`auth-handlers-integration.test.mjs` test 8); live blocked (no test account). |
| G12 | Backend logout revocation verified | **BLOCKED** | Requires authorized NURVIA test account. |
| G13 | Registration verified where authorized | **BLOCKED** | Verified against mock backend (`auth-handlers-integration.test.mjs` test 7); live blocked (no authorized test identity). |
| G14 | Proxy and RBAC regression tests pass | **PASS** | `npm test` (`lexmacasto-phase2-security.test.mjs` 8/8 PASS). |
| G15 | Secret-leak scans pass | **PASS** | `.next/static/**/*.js` scan returned 0 matches. |
| G16 | Unit and integration tests pass | **PASS** | `npm test` (9 suites PASS) + `auth-handlers-integration.test.mjs` (9/9 PASS). |
| G17 | Unauthenticated browser E2E passes | **PASS** | `auth-route-remediation.spec.ts` (3 passed, 1 skipped). |
| G18 | Authenticated browser E2E passes | **BLOCKED** | Skipped (`E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` not provided). |
| G19 | Production deployment contains the verified commit | **BLOCKED** | No Vercel CLI/token locally; `https://nurvia-black.vercel.app` still serves pre-Phase-1 build. |
| G20 | Production route and response semantics verified | **FAIL** | `https://nurvia-black.vercel.app/api/auth/me` and `/api/auth/config-status` return `404`. |
| G21 | No remaining confirmed, actionable NURVIA defect in scope | **PASS** | All local code/test defects (`DEF-3.1-01`..`03`) closed; only external deployment & test credentials remain. |
