# NURVIA Phase 3.2 — Final Release Acceptance Report

**Date:** 2026-11-16  
**Application:** NURVIA (`apps/web`)  
**Verified Commit:** `6ed4ad7` (`origin/master`)  
**Production URL:** `https://nurvia-black.vercel.app`  
**Final Release Decision:** **REJECTED**

---

## Gate-by-Gate Status

| Gate | Requirement | Status | Evidence |
|---|---|---|---|
| G0 | NURVIA repository & working tree verified | **PASS** | `master` @ `6ed4ad7` matches `origin/master`, clean working tree. |
| G1 | Phase 3.1 implementation preserved | **PASS** | `api-response.ts`, `api-url.mjs`, `no-store` headers, and tests intact. |
| G2 | Full local regression suite passes | **PASS** | `tsc`, `lint`, `npm test` (9 suites), `auth-handlers-integration.test.mjs` (9/9). |
| G3 | Production build and route manifest pass | **PASS** | `npm run build` exit 0; all 5 `/api/auth/*` routes registered. |
| G4 | Secret and stale-route scans pass | **PASS** | `.next/static/**/*.js` scan returned 0 matches. |
| G5 | Vercel configuration verified | **BLOCKED** | No Vercel CLI/token or Dashboard access in this environment. |
| G6 | Correct production environment verified | **BLOCKED** | Cannot inspect Vercel Production env vars (`SKEW_LINE_*`). |
| G7 | Verified changes committed | **PASS** | Commits `5643f9f`, `abcb39f`, `6ed4ad7`. |
| G8 | Changes pushed to `origin/master` | **PASS** | `origin/master` @ `6ed4ad7`. |
| G9 | Vercel deploys exact verified commit | **FAIL** | Live site still serves pre-Phase-1 build (`Last-Modified: 10:42:19Z`). |
| G10 | Production `/api/auth/me` resolves correctly | **FAIL** | Returns `404` HTML (`/404`). |
| G11 | Production `/api/auth/config-status` resolves correctly | **FAIL** | Returns `404` HTML (`/404`). |
| G12 | Obsolete authentication requests eliminated | **FAIL** | Live browser bundle still calls `/api/backend/auth/me` and `/api/backend/auth/csrf`. |
| G13 | Vercel private-hostname issue resolved | **FAIL** | Live `/api/backend/auth/me` & `.../csrf` still return `DNS_HOSTNAME_RESOLVED_PRIVATE` (fixed in local `6ed4ad7`, not yet deployed). |
| G14 | Live login verified | **BLOCKED** | Stale production deployment + no `E2E_AUTH_EMAIL`/`E2E_AUTH_PASSWORD`. |
| G15 | Live current-user retrieval verified | **BLOCKED** | Stale production deployment + no test account. |
| G16 | Session persistence verified | **BLOCKED** | Stale production deployment + no test account. |
| G17 | Local logout and session invalidation verified | **BLOCKED** | Verified locally (9/9); blocked on live production. |
| G18 | Backend logout revocation verified | **BLOCKED** | No live authenticated session. |
| G19 | Live registration verified where authorized | **BLOCKED** | No authorized test identity. |
| G20 | Production unauthenticated E2E passes | **FAIL** | `auth-route-remediation.spec.ts` against `nurvia-black.vercel.app`: 3 failed, 1 skipped. |
| G21 | Production authenticated E2E passes | **BLOCKED** | Skipped (`E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` not provided). |
| G22 | Security regression suite passes | **PASS** | `lexmacasto-phase2-security.test.mjs` (8/8) + bundle scan (0 hits). |
| G23 | All actionable NURVIA defects closed | **FAIL** | Local code defects fixed, but production deployment (`DEF-3.2-01`) remains unverified/stale. |
| G24 | Final production acceptance report complete | **PASS** | This report and all 8 supporting Phase 3.2 reports. |

---

## Decision Rationale & Required Actions

The release is **REJECTED** because `https://nurvia-black.vercel.app` still serves the pre-Phase-1 deployment (`404` on `/api/auth/me` and `/api/auth/config-status`, `DNS_HOSTNAME_RESOLVED_PRIVATE` on `/api/backend/auth/me` and `/api/backend/auth/csrf`, and `Unexpected token 'T'` in live Playwright).

To unblock acceptance:
1. In **Vercel Dashboard** for `nurvia-black`, verify Root Directory = `apps/web`, Production Branch = `master`, and Production env vars (`SKEW_LINE_DOTNET_BASE_URL=https://explicitbackend.com`, `SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN=https://nurvia-black.vercel.app`, `SKEW_LINE_ACTIVE_BACKEND=dotnet`), then deploy `master`.
2. Re-run `auth-route-remediation.spec.ts` against `https://nurvia-black.vercel.app` with `E2E_AUTH_EMAIL` and `E2E_AUTH_PASSWORD`.
