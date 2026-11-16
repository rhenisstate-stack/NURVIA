# NURVIA Phase 2 — Remediation Report

**Project:** NURVIA (`apps/web`)  
**Execution Mode:** Independent Audit -> Fix -> Adversarial Test -> Verify

---

## Confirmed Defects Remediated

### 1. P2-PROXY-01 — Eliminated Unrestricted Generic Proxy
- **Root Cause:** `apps/web/app/api/backend/[...path]/route.ts` accepted any `/api/...` path segments without an allowlist, method matrix, authentication/staff checks, or payload limits.
- **Files Changed:** Created `apps/web/lib/lexmacasto/proxy-allowlist.ts`; updated `apps/web/app/api/backend/[...path]/route.ts`.
- **Remediation:** Implemented `PROXY_ROUTE_RULES` and `matchProxyRoute()` enforcing explicit route regexes, HTTP method allowlists (`405`), path traversal/encoding rejection (`400`/`404`), `authenticated` (`401`) and `staff` (`403` via live `CURRENT_USER` role verification) boundaries, `maxBodyBytes` (`413`), `Content-Type: application/json` (`415`), and `Cache-Control: no-store`.
- **Verification:** `lexmacasto-phase2-security.test.mjs` (#1, #2).

### 2. P2-PROXY-02 — Removed Remaining `next.config.mjs` Rewrite
- **Root Cause:** `apps/web/next.config.mjs` still had `rewrites()` for `/api/avatar/:storageKey`.
- **Files Changed:** `apps/web/next.config.mjs`; created `apps/web/app/api/avatar/[storageKey]/route.ts`.
- **Remediation:** Removed `rewrites()` completely and added a Route Handler validating `SAFE_STORAGE_KEY_REGEX` (`^[a-zA-Z0-9._-]{1,128}$`).
- **Verification:** `lexmacasto-phase2-security.test.mjs` (#3).

### 3. P2-ROUTE-01 — Fixed `/api/auth/*` Routing Collision
- **Root Cause:** `api-client.ts` matched `endpoint.startsWith('/api/auth/')`, misrouting `/api/auth/users`, `/api/auth/assign-role`, `/api/auth/profile`, and `/api/auth/forgot-password` away from `/api/backend`.
- **Files Changed:** `apps/web/lib/api-client.ts`.
- **Remediation:** Restricted direct routing to `DEDICATED_AUTH_ROUTES` (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/config-status`).
- **Verification:** `lexmacasto-phase2-security.test.mjs` (#4).

### 4. P2-CSRF-01 — Hardened Same-Origin CSRF Guard
- **Root Cause:** `validateSameOriginRequest` trusted `X-Forwarded-Host` and allowed mutations when both `Origin` and `Referer` were absent.
- **Files Changed:** `apps/web/lib/lexmacasto/session.ts`.
- **Remediation:** Removed `x-forwarded-host` trust; required matching `Origin`, matching `Referer`, or `Sec-Fetch-Site: same-origin` on all state-changing requests.
- **Verification:** `lexmacasto-phase2-security.test.mjs` (#5).

### 5. P2-HDR-01, P2-STRATA-01, P2-CACHE-01 — Header Ownership, Strata Query Allowlist & `no-store`
- **Root Cause:** Caller `options.headers` could theoretically shadow server headers; `/api/strata/[resource]` lacked query param allowlisting and pagination bounds; auth routes lacked explicit `Cache-Control: no-store`.
- **Files Changed:** `apps/web/lib/lexmacasto/client.ts`, `apps/web/app/api/strata/[resource]/route.ts`, `apps/web/app/api/auth/login/route.ts`, `apps/web/app/api/auth/me/route.ts`.
- **Remediation:** Forced `siteHeaders` and `authHeaders` last in `lexmaCastoRequest`; added `ALLOWED_STRATA_QUERY_PARAMS` and `1..100` pagination bounds; added `Cache-Control: no-store`.
- **Verification:** `lexmacasto-phase2-security.test.mjs` (#6, #7, #8).
