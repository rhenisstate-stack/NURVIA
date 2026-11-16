# NURVIA Phase 2 — Test and Release Acceptance Report

**Project:** NURVIA (`apps/web`)  
**Final Release Decision:** **ACCEPTED WITH EXTERNAL DEPENDENCIES**

---

## 1. Automated Verification Summary

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | **PASS** (0 errors) |
| ESLint | `npm run lint` | **PASS** (0 errors) |
| Unit, Contract & Security Suites (8 suites) | `npm test` | **PASS** (all 8 suites passed, including `lexmacasto-integration.test.mjs` 9/9 and `lexmacasto-phase2-security.test.mjs` 8/8) |
| Production Build | `npm run build` | **PASS** (exit 0) |
| Client Bundle Secret Scan | `.next/static/**/*.js` scan | **PASS** (`CLEAN: 0 secret/internal matches in .next/static`) |

## 2. Phase 2 Acceptance Gate Matrix (G0–G20)

| Gate | Requirement | Status | Evidence / Notes |
|---|---|---|---|
| G0 | Repository and scope integrity | **PASS** | Only `apps/web` and NURVIA root docs modified |
| G1 | Existing implementation independently audited | **PASS** | Phase 2A–2G audit completed; 7 internal defects + 1 external dependency identified |
| G2 | No unrestricted backend proxy | **PASS** | `PROXY_ROUTE_RULES` + `matchProxyRoute` in `proxy-allowlist.ts`; `next.config.mjs` `rewrites()` removed |
| G3 | Server-owned privileged headers enforced | **PASS** | `siteHeaders` and `authHeaders` applied after caller headers in `client.ts` |
| G4 | Route and method allowlists enforced | **PASS** | `app/api/backend/[...path]/route.ts` and `app/api/strata/[resource]/route.ts` |
| G5 | Authentication cookie security verified | **PASS** | `HttpOnly`, `SameSite=Lax`, production `Secure`, raw credentials stripped |
| G6 | CSRF and origin protections verified | **PASS** | `validateSameOriginRequest` without `X-Forwarded-Host` trust |
| G7 | Login contract independently verified | **PASS** (Internal) | `POST /api/castoline/auth/login` DTO/cookie wiring verified locally; live auth in G18 |
| G8 | Current-user lifecycle verified | **PASS** (Internal) | `GET /api/castoline/system/user/list/current?fetchtype=current` wired; live auth in G18 |
| G9 | Logout and local session invalidation verified | **PASS** (Internal) | Distinct/relative logout + local cookie & state clearing verified; live revocation in G18 |
| G10 | Session expiry behavior verified | **PASS** (Internal) | 401 clears local cookies and transitions `AuthProvider` to `unauthenticated`; no invented `/refresh` |
| G11 | NURVIA application identity accepted by backend | **BLOCKED — EXTERNAL DEPENDENCY** | `SKEW_LINE_APP_KEY` unprovisioned; fails closed (`MISSING_APP_KEY`) |
| G12 | Academic resource mapping verified | **PASS** | All 22 verified endpoints, `classes` route, mandatory `fetchtype` |
| G13 | Academic hierarchy and filter dependencies verified | **PASS** | Dependent filter resets implemented in `StudyLibraryAdvancedFilters.tsx` |
| G14 | Year/Season support truthfully established | **PASS** | No invented `AcademicYear`/`Season` endpoints; disabled/unavailable state when metadata absent |
| G15 | Cache isolation and server-side RBAC verified | **PASS** | `Cache-Control: no-store` on auth/proxy/live strata; `staff` role verified server-side |
| G16 | Security and regression test suites pass | **PASS** | 8/8 suites pass |
| G17 | Production build and client-bundle security pass | **PASS** | `npm run build` exit 0; 0 secrets in `.next/static` |
| G18 | Live authenticated backend workflows pass | **BLOCKED — EXTERNAL DEPENDENCY** | Awaits `SKEW_LINE_APP_KEY` and authorized NURVIA test account |
| G19 | All internally fixable defects closed | **PASS** | P2-PROXY-01, P2-PROXY-02, P2-ROUTE-01, P2-CSRF-01, P2-HDR-01, P2-STRATA-01, P2-CACHE-01 fixed |
| G20 | Final release evidence and reports complete | **PASS** | All 5 Phase 2 deliverables created |

## 3. Final Release Decision

**ACCEPTED WITH EXTERNAL DEPENDENCIES**
