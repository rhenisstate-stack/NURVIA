# NURVIA — Unified Academic Discovery & Remote Backend Integration Implementation Report

**Date:** 2026-11-15  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Branch:** `master`  
**Classification:** **BLOCKED** (for live shared-backend API discovery & academic discovery wiring) / **PARTIAL IMPLEMENTATION COMPLETED** (environment fail-closed hardening, BFF/API client resilience, and live connectivity/capability audit)

---

## 1. Executive Summary

NURVIA's frontend environment configuration, Next.js rewrite proxy (`apps/web/next.config.mjs`), and API client (`apps/web/lib/api-client.ts`) have been hardened for fail-closed remote backend resolution (`SKEW_LINE_DOTNET_BASE_URL=http://108.61.9.189:8008`), configurable timeouts, and bounded idempotent retries. Live non-destructive probing confirmed `http://108.61.9.189:8008` is reachable (`GET /health` -> `200 OK "healthy"`), running Kestrel (`LexmaCasto` / "Master Bank"), and exposes `/api/castoline/auth/login` and `/api/castoline/auth/register` (`400 {"error":"Missing site headers"}`). However, OpenAPI/Swagger is disabled (`302 -> /web/restoration/lost`), the site-header contract (`SKEW_LINE_APP_KEY` / `SKEW_LINE_APP_DOMAIN`) is undocumented, and no test credentials were supplied—blocking live verification of `/api/castoline/strata/*` academic discovery endpoints without inventing routes or headers.

---

## 2. Original Project State

- Clean working tree on `master` at commit `6e9f856` (`feat(web): integrate Tutor session recovery in exam-session`), following commits `cb30f33` and `132d732`.
- No `.env`, `.env.local`, `.env.example`, or `.env.local.example` existed in `apps/web/`.
- `apps/web/next.config.mjs` and `apps/web/lib/api-client.ts` silently fell back to `http://localhost:5055` when `NEXT_PUBLIC_API_URL` was unset.

---

## 3. Environment Configuration Findings

- Created `apps/web/.env.local` (excluded from Git via `.gitignore`) with `SKEW_LINE_ACTIVE_BACKEND=dotnet`, `SKEW_LINE_DOTNET_BASE_URL=http://108.61.9.189:8008`, `SKEW_LINE_APP_NAME='Nurvia'`, `SKEW_LINE_APP_TITLE='Nurvia'`, `SKEW_LINE_APP_KEY='WEBSITE_1'`, and `SKEW_LINE_APP_DOMAIN='<REGISTERED_DOMAIN>'`.
- Created safe placeholder templates `apps/web/.env.example` and `apps/web/.env.local.example`.
- Implemented `apps/web/lib/api-config.mjs` (and `.d.ts`) to enforce fail-closed URL resolution, protocol validation (`http:`/`https:`), optional HTTPS enforcement (`requireHttps`), and zero silent `localhost` fallback.

---

## 4. Remote Connectivity Results

- **TCP (`108.61.9.189:8008`):** `TcpTestSucceeded = True`.
- **Health (`GET /health`):** `200 OK`, body `"healthy"`, `Server: Kestrel`.
- **Web Shell (`GET /`, `/web/auth/absolute/login`, `/web/auth/absolute/register`, `/web/pages/entrance`):** `200 OK` (HTML for `Master Bank` / `LexmaCasto`).
- **CORS Preflight (`OPTIONS /api/castoline/auth/login` with `Origin: http://localhost:3000`):** `405 Method Not Allowed` (`Allow: POST`), no `Access-Control-Allow-Origin` headers.

---

## 5. OpenAPI Discovery Results

- Probed `/swagger`, `/swagger/index.html`, `/swagger/v1/swagger.json`, `/swagger/v2/swagger.json`, `/openapi.json`, `/openapi/v1.json`, `/api-docs`, and `/robots.txt`: all returned `302 Found -> /web/restoration/lost?path=...` (`Page Not Found - Master Bank`).
- OpenAPI/Swagger is not exposed on the deployed host; the reported ~803-route inventory could not be extracted.

---

## 6. Verified API Route Inventory

See `docs/NURVIA_SHARED_BACKEND_ROUTE_INVENTORY.md` and `docs/NURVIA_REMOTE_API_CAPABILITY_AUDIT.md`.
- **Verified:** `GET /health` (`200 OK`), Razor pages `/`, `/web/auth/absolute/login`, `/web/auth/absolute/register`, `/web/pages/entrance`.
- **Partially Verified:** `POST /api/castoline/auth/login` and `POST /api/castoline/auth/register` (`400 {"error":"Missing site headers"}`).
- **Unverified / Redirecting (`302 -> /web/restoration/lost`):** 228 GET/POST probes and 156 additional POST probes across `/api/castoline/{system,nexus,strata}/*` and NURVIA's `/api/{auth,study-library,exams,questions}/*`.

---

## 7. Authentication Findings

- `POST /api/castoline/auth/login` and `/register` require undocumented site headers (`{"error":"Missing site headers"}`).
- NURVIA's existing `/api/auth/csrf` and `/api/auth/me` endpoints return `302 -> /web/restoration/lost` on `http://108.61.9.189:8008`.
- Direct browser CORS is disabled; Next.js `/api/backend/*` rewrite proxy remains required.

---

## 8. Application Isolation Findings

- Backend enforces site-header presence on `/api/castoline/auth/*`, but exact header names, `SKEW_LINE_APP_DOMAIN`, and confirmation that `WEBSITE_1` isolates NURVIA from PrepFord cannot be verified without backend documentation or authenticated test accounts.

---

## 9. Academic Discovery Implementation

- **Existing NURVIA Support Preserved:** `apps/web/components/study/study-library-view.tsx` and `StudyLibraryAdvancedFilters.tsx` continue to support `pathways`, `categories`, `schools`, `academicYears`, `seasons`, `subjects`, `topics`, `difficulties`, `questionTypes`, `exams`, search, sorting, and pagination against `/api/study-library` and `/api/study-library/filters`.
- **New `strata/*` Discovery Filters:** **BLOCKED** — `/api/castoline/strata/institution/*`, `/api/castoline/strata/learning/*`, and `/api/castoline/strata/assessment/*` routes could not be verified without OpenAPI or site-header documentation.

---

## 10. Examination Integration

- Existing NURVIA examination listing, detail, attempt lifecycle, and Tutor session recovery (`apps/web/lib/api-client.ts`, `apps/web/app/exam-session/page.tsx`) are preserved intact.
- Remote `/api/castoline/strata/assessment/*` integration is **BLOCKED** pending verified OpenAPI contract.

---

## 11. Question Bank Integration

- Existing 18 canonical question renderers (`QuestionRendererRegistry`) and question bank endpoints remain intact and passing (`7/7` renderer suites).
- Remote `/api/castoline/strata/assessment/questions/*` integration is **BLOCKED** pending verified OpenAPI contract.

---

## 12. Frontend Changes

- Added `apps/web/lib/api-config.mjs` & `apps/web/lib/api-config.d.ts` (fail-closed `SKEW_LINE_DOTNET_BASE_URL` / `NEXT_PUBLIC_API_URL` resolution, URL/protocol validation, HTTPS check).
- Updated `apps/web/next.config.mjs` to use `resolveBackendBaseUrl` and emit a production security warning when using HTTP.
- Updated `apps/web/lib/api-client.ts` to use `resolveBackendBaseUrl` server-side, 30s request timeouts, caller `AbortSignal` forwarding, and bounded retries (max 2) on idempotent `GET`/`HEAD` requests only.
- Added `apps/web/.env.example`, `apps/web/.env.local.example`, and local gitignored `apps/web/.env.local`.

---

## 13. Security Improvements

- Removed silent `http://localhost:5055` fallback from `next.config.mjs` and `api-client.ts`.
- Enforced `http:`/`https:` protocol validation and provided `requireHttps` enforcement helper.
- Kept `SKEW_LINE_DOTNET_BASE_URL`, `SKEW_LINE_APP_KEY`, and `SKEW_LINE_APP_DOMAIN` server-only (no `NEXT_PUBLIC_` exposure).
- See `docs/NURVIA_REMOTE_BACKEND_SECURITY_ASSESSMENT.md`.

---

## 14. Performance Improvements

- Added 30s request timeout (`AbortController`) to prevent hanging server/client fetches.
- Added bounded exponential-backoff retries (250ms, 500ms) strictly for idempotent `GET`/`HEAD` requests on transient `502`/`503`/`504` or retryable network errors.

---

## 15. Unit and Integration Test Results

- **TypeScript (`npx tsc --noEmit`):** **0 errors**.
- **ESLint (`npm run lint`):** **0 errors**, 361 pre-existing legacy warnings (0 warnings in newly added files).
- **Frontend Unit Tests (`npm test`):** **36/36 PASSED** across 5 suites:
  - `navigation-and-carousel.test.mjs`: 7/7 PASSED
  - `learning-integration.test.mjs`: 8/8 PASSED
  - `question-renderers.test.mjs`: 7/7 PASSED
  - `hero-redesign.test.mjs`: 6/6 PASSED
  - `remote-api-config.test.mjs`: 8/8 PASSED (new)
- **Live Remote Probes:** Non-destructive `GET`/`POST`/`OPTIONS` probes executed directly against `http://108.61.9.189:8008`.

---

## 16. Production Build Results

- `npm run build` (`next build` with `apps/web/.env.local` loaded): **PASSED** — compiled cleanly and generated all **54/54** static pages, emitting the expected HTTP transport security warning for `http://108.61.9.189:8008`.

---

## 17. Deployment Requirements

1. Configure `SKEW_LINE_ACTIVE_BACKEND=dotnet`, `SKEW_LINE_DOTNET_BASE_URL`, `SKEW_LINE_APP_NAME`, `SKEW_LINE_APP_TITLE`, `SKEW_LINE_APP_DOMAIN`, and `SKEW_LINE_APP_KEY` in Vercel (Development, Preview, Production).
2. Place `108.61.9.189:8008` behind an **HTTPS** reverse proxy before enabling production cookie authentication.

---

## 18. Git Commits

- Baseline prior to this pass: `6e9f856`
- Changes in this pass are committed cleanly on `master` (excluding gitignored `.env.local`).

---

## 19. Remaining Blockers

1. OpenAPI/Swagger specification for `http://108.61.9.189:8008` is not publicly exposed.
2. Exact site-header names and registered `SKEW_LINE_APP_DOMAIN` required by `/api/castoline/auth/*` are undocumented.
3. Approved NURVIA test credentials for live authenticated verification were not provided.
4. HTTPS TLS termination is not yet configured on `108.61.9.189:8008`.

---

## 20. Final Acceptance Gate Table

| Gate | Acceptance Requirement | Status | Evidence |
|---|---|---|---|
| A | Environment configuration validated | **PASS** | `.env.local` (gitignored), `.env.example`, `.env.local.example`, `api-config.mjs` (8/8 unit tests pass) |
| B | Remote backend reachable | **PASS** | `108.61.9.189:8008` TCP open; `GET /health` -> `200 OK "healthy"` |
| C | API contract discovered | **BLOCKED** | Swagger/OpenAPI routes return `302 -> /web/restoration/lost`; 384 `/api/castoline/*` & `/api/*` probes returned `302` |
| D | Application identity verified | **BLOCKED** | `POST /api/castoline/auth/login` returns `400 {"error":"Missing site headers"}`; header contract & `WEBSITE_1` scope undocumented |
| E | API client correctly integrated | **PASS** | `api-client.ts` & `next.config.mjs` use fail-closed `resolveBackendBaseUrl`, 30s timeout, bounded GET retries |
| F | Authentication and CSRF verified | **BLOCKED** | `/api/auth/csrf` -> `302` on remote host; `/api/castoline/auth/login` blocked on missing site headers & credentials |
| G | Academic reference data integrated | **BLOCKED** | Remote `strata/institution/*` & `strata/learning/*` endpoints unverified without OpenAPI |
| H | Examination filters integrated | **BLOCKED** | Existing NURVIA filters preserved; remote `strata/assessment/exams/*` unverified |
| I | Question filters integrated | **BLOCKED** | Existing 18 renderers preserved; remote `strata/assessment/questions/*` unverified |
| J | Application isolation verified | **BLOCKED** | Cannot verify NURVIA vs. PrepFord server-side isolation without site-header contract & test credentials |
| K | Frontend tests pass | **PASS** | `npm test` -> `36/36 PASSED`; `tsc --noEmit` -> 0 errors; `npm run lint` -> 0 errors |
| L | Production build passes | **PASS** | `npm run build` -> 54/54 static pages generated |
| M | Deployment requirements documented | **PASS** | Documented in `NURVIA_REMOTE_BACKEND_SECURITY_ASSESSMENT.md` and Section 17 above |
