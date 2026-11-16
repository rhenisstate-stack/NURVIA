# NURVIA Phase 2 — Integration Security Audit Report

**Project:** NURVIA (`apps/web`)  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Baseline Commit:** `b3b7c0a` (`master`)  
**Target Backend:** `https://explicitbackend.com`  
**Audit Scope:** Independent adversarial audit of Phase 1 LexmaCasto integration, proxy boundaries, session/cookie/CSRF security, application identity, academic strata, caching, RBAC, and reliability.

---

## 1. Files Inspected

- `apps/web/next.config.mjs`
- `apps/web/lib/api-config.mjs` & `apps/web/lib/api-config.d.ts`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/lexmacasto/contracts.ts`, `headers.ts`, `session.ts`, `client.ts`, `strata-filters.ts`
- `apps/web/app/api/auth/{login,register,me,logout,config-status}/route.ts`
- `apps/web/app/api/strata/[resource]/route.ts`
- `apps/web/app/api/backend/[...path]/route.ts`
- `apps/web/components/auth/auth-provider.tsx`, `apps/web/app/sign-up/page.tsx`
- `apps/web/components/study/study-library-view.tsx`, `StudyLibraryAdvancedFilters.tsx`

## 2. Adversarial Audit Findings & Final Disposition

| Finding ID | Severity | Area | Finding | Disposition |
|---|---|---|---|---|
| P2-PROXY-01 | **P0** | Proxy Security | `/api/backend/[...path]` functioned as an unrestricted generic proxy forwarding any `/api/...` path without route allowlist, per-route method rules, auth/staff role enforcement, body size limits, content-type validation, or `no-store` headers. | **FIXED AND VERIFIED** (`proxy-allowlist.ts`, `app/api/backend/[...path]/route.ts`) |
| P2-PROXY-02 | **P1** | Proxy / Rewrites | `next.config.mjs` retained a direct `rewrites()` rule for `/api/avatar/:storageKey` bypassing Route Handler validation. | **FIXED AND VERIFIED** (removed `rewrites()`; added `app/api/avatar/[storageKey]/route.ts` with `SAFE_STORAGE_KEY_REGEX`) |
| P2-ROUTE-01 | **P1** | Auth Routing | `api-client.ts` routed all `/api/auth/*` paths directly to Next.js, causing `/api/auth/users`, `/api/auth/assign-role`, `/api/auth/profile`, `/api/auth/forgot-password`, etc. to 404 instead of going through `/api/backend`. | **FIXED AND VERIFIED** (`DEDICATED_AUTH_ROUTES` allowlist in `api-client.ts`) |
| P2-CSRF-01 | **P1** | CSRF / Origin | `validateSameOriginRequest` trusted `X-Forwarded-Host` and allowed state-changing requests when both `Origin` and `Referer` were absent. | **FIXED AND VERIFIED** (`session.ts`: removed `x-forwarded-host` trust, requires `Origin`, `Referer`, or `Sec-Fetch-Site: same-origin`) |
| P2-HDR-01 | **P1** | Header Ownership | `lexmaCastoRequest` spread `options.headers` after `siteHeaders`/`authHeaders`. | **FIXED AND VERIFIED** (`client.ts`: `siteHeaders` and `authHeaders` spread last so server-owned headers cannot be overridden) |
| P2-STRATA-01 | **P1** | Academic Strata | `/api/strata/[resource]` forwarded arbitrary query params without allowlisting or pagination bounds, and lacked explicit `Cache-Control: no-store`. | **FIXED AND VERIFIED** (`ALLOWED_STRATA_QUERY_PARAMS`, `1..100` page-size bounds, `Cache-Control` headers) |
| P2-CACHE-01 | **P2** | Cache Isolation | `/api/auth/login` and `/api/auth/me` did not explicitly emit `Cache-Control: no-store`. | **FIXED AND VERIFIED** (added `Cache-Control: no-store`) |
| P2-EXT-01 | **EXTERNAL** | App Identity & Live Auth | `SKEW_LINE_APP_KEY` in `apps/web/.env.local` is unprovisioned (empty) and no authorized NURVIA test account exists yet. | **BLOCKED — EXTERNAL DEPENDENCY** (fail-closed `MISSING_APP_KEY` verified; see Dependency Register) |
