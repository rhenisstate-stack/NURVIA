# NURVIA — LexmaCasto Complete Integration Alignment Report

**Project:** NURVIA (`apps/web`)  
**Verified Backend Origin:** `https://explicitbackend.com`  
**Baseline Git Branch / Commit:** `master` at `95abc78`  
**Final Release Decision:** **ACCEPTED WITH EXTERNAL DEPENDENCIES**

---

## 1. Executive Summary

NURVIA's Next.js frontend (`apps/web`) has been brought into alignment with the verified LexmaCasto backend contract established in Qlex-Nursing Phase 9. All internally controllable P0, P1, and P2 defects—including direct rewrite bypasses, missing site/Casto header injection, unsupported `/api/auth/csrf` pre-flights, missing HttpOnly session management, misaligned auth endpoints/DTOs, missing Academic Strata routes/mandatory `fetchtype`, and client-bundle config leakage—have been remediated and verified via TypeScript, ESLint, automated unit/security tests, and a clean production build.

Live authenticated end-to-end verification against `https://explicitbackend.com` remains **BLOCKED — EXTERNAL DEPENDENCY** because NURVIA's dedicated `SKEW_LINE_APP_KEY` in `apps/web/.env.local` is currently unprovisioned (empty) and no authorized NURVIA test credentials are available. In accordance with security policy, NURVIA fails closed with `MISSING_APP_KEY` (`HTTP 503`) and never borrows Qlex-Nursing's `WEBSITE_1` identity.

## 2. Scope and Restrictions

- **Modified Scope:** Only `apps/web` source/config/test files and the four required NURVIA acceptance documents at the repository root.
- **Untouched Systems:** Qlex-Nursing and the shared LexmaCasto backend (`https://explicitbackend.com`) were not modified.

## 3. Baseline Architecture

- **Framework:** Next.js 15.5 (`apps/web`), React 19, TypeScript 5.6.
- **Pre-Remediation Gap:** `next.config.mjs` used a direct `rewrites()` rule (`/api/backend/:path*` -> `${apiBase}/api/:path*`), and `lib/api-client.ts` targeted legacy `/api/auth/*` endpoints with a `/api/auth/csrf` pre-flight. No Next.js API Route Handlers existed under `apps/web/app/api/`.

## 4. Verified Backend Contract Reference

- **Origin:** `https://explicitbackend.com` (HTTPS enforced in production; `http://108.61.9.189:8008` rejected in production).
- **Site Headers:** `x-site-key` and `x-site-domain` (required), plus sanitized optional `x-site-*` metadata including `x-site-brouser`.
- **Auth Headers:** `x-casto-line` and `x-casto-badge` (custom headers; no Bearer JWT).
- **Auth Endpoints:** `/api/castoline/auth/login`, `/api/castoline/auth/register`, `/api/castoline/system/user/list/current?fetchtype=current`, `/api/castoline/auth/logout/sessions/distinct`, `/api/castoline/auth/logout/sessions/relative`.
- **Academic Strata:** 22 verified endpoints across Main, Learning, Assessment (`exams/list/live` requires auth), and Institution (`classes`, not `strataclasses`), all requiring `fetchtype`.

## 5. Baseline Findings & 6. Root-Cause Analysis

See `NURVIA_INTEGRATION_REMEDIATION_INVENTORY.md` for the full finding-by-finding table (F-01 through F-10).

## 7. Remediation Performed & 8. Files Modified

### New Files
- `apps/web/lib/lexmacasto/contracts.ts` — Verified auth & 22 strata endpoint definitions, `buildStrataEndpointPath`, `buildCurrentUserEndpointPath`, DTOs.
- `apps/web/lib/lexmacasto/headers.ts` — `buildSiteHeaders`, `buildCastoAuthHeaders`, CRLF sanitization, `redactHeadersForLog`, `redactPayloadForLog`.
- `apps/web/lib/lexmacasto/session.ts` — HttpOnly cookie helpers (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`) and `validateSameOriginRequest`.
- `apps/web/lib/lexmacasto/client.ts` — Centralized `lexmaCastoRequest`, SSRF path guard, error normalization, `extractCastoCredentialsFromLogin`, `sanitizeAuthUser`, `normalizeStrataEnvelope`.
- `apps/web/lib/lexmacasto/strata-filters.ts` — Academic Strata filter loader preserving hierarchy without inventing `AcademicYear` or `Season` endpoints.
- `apps/web/app/api/auth/login/route.ts`
- `apps/web/app/api/auth/register/route.ts`
- `apps/web/app/api/auth/me/route.ts`
- `apps/web/app/api/auth/logout/route.ts`
- `apps/web/app/api/auth/config-status/route.ts`
- `apps/web/app/api/strata/[resource]/route.ts`
- `apps/web/app/api/backend/[...path]/route.ts`
- `apps/web/tests/lexmacasto-integration.test.mjs`

### Modified Files
- `apps/web/lib/api-config.mjs` & `apps/web/lib/api-config.d.ts`
- `apps/web/next.config.mjs`
- `apps/web/lib/api-client.ts`
- `apps/web/components/auth/auth-provider.tsx`
- `apps/web/app/sign-up/page.tsx`
- `apps/web/components/study/study-library-view.tsx`
- `apps/web/components/study/StudyLibraryAdvancedFilters.tsx`
- `apps/web/package.json`

## 9. Authentication & 10. Session Security Implementation

Browser requests hit same-origin Next.js Route Handlers (`/api/auth/*`), which enforce `validateSameOriginRequest` (CSRF protection via `Sec-Fetch-Site`, `Origin`, `Referer`), attach server-side `x-site-key` / `x-site-domain`, store `castoLine` and `castoBadge` exclusively in `HttpOnly`, `SameSite=Lax`, production `Secure` cookies, strip raw credentials from JSON responses, and forward `x-casto-line` / `x-casto-badge` on server-to-backend calls.

## 11. Application Identity Status

- **Dedicated NURVIA `SKEW_LINE_APP_KEY`:** Not yet provisioned (`apps/web/.env.local` has empty `SKEW_LINE_APP_KEY=`).
- **Configured `SKEW_LINE_APP_DOMAIN`:** `https://nurvia-black.vercel.app` (confirmation from backend owner pending).
- **Live Backend Acceptance:** Not yet verified due to missing `SKEW_LINE_APP_KEY`; application fails closed with `MISSING_APP_KEY` (`503`) rather than borrowing Qlex-Nursing's `WEBSITE_1` identity.

## 12. Academic Strata & 13. Filter Implementation

All 22 verified strata endpoints are exposed via `/api/strata/[resource]` with mandatory `fetchtype` injection. `StudyLibraryView` and `StudyLibraryAdvancedFilters` hydrate school, subject, topic, and exam options from verified strata endpoints, reset dependent child selections when parent filters change, and never fabricate `AcademicYear` or `Season` endpoints.

## 14. RBAC and Isolation Verification

Public registration enforces `role: 'Learner'` server-side; `examsLive` requires an authenticated session (`401` when missing); logout clears both HttpOnly cookies and React auth state.

## 15–17. Testing, Live Verification & Production Build

See `NURVIA_INTEGRATION_VERIFICATION_AND_RELEASE_ACCEPTANCE_REPORT.md` for full command outputs, live checks, bundle scan results, and the G0–G17 Acceptance Gate Matrix.

## 18–21. Acceptance Gates, External Dependencies & Final Decision

- **External Dependencies:**
  1. Backend owner must provision a dedicated `SKEW_LINE_APP_KEY` for NURVIA and confirm `https://nurvia-black.vercel.app` registration.
  2. Backend owner/QA must supply an authorized NURVIA test account for live login, current-user, strata, and logout verification.
- **Final Release Decision:** **ACCEPTED WITH EXTERNAL DEPENDENCIES**.
