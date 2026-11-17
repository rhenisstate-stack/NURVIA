# NURVIA Phase 3.7 — Implementation Report

**Branch:** `phase-3.7-qlex-forensic-migration` (branched from Phase 3.6 `50c58f0ae1b01db3f96423dece16df1b811bdec2`)  
**Target:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Architectural Preservation

NURVIA's Phase 3.6 Next.js App Router architecture, `HttpOnly` server-managed session cookies (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`), same-origin CSRF protection (`validateSameOriginRequest`), allowlisted BFF proxy (`/api/backend/[...path]`), and `website 11` identity isolation were preserved intact.

No Qlex hardcoded challenge strings (`"register-skew8@lancasto"`, `"learner.login.skew8lancasto"`, `"custom.login.skew8lancasto"`), `WEBSITE_1` fallbacks, or JavaScript-readable `document.cookie` patterns were introduced.

---

## 2. Files Modified / Created

| File | Change Summary |
|---|---|
| `apps/web/lib/lexmacasto/client.ts` | Added `CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, `CHALLENGE_EXPIRED`, `INVALID_CREDENTIALS`, and `SESSION_EXPIRED` to `NormalizedBackendErrorCode`; added `classifyBackendErrorCode()` to distinguish Deslizar challenge failures (`Ultimatum Turmoil, That Must be Deslizar`), missing `Challenge` field (`The Challenge field is required.`), invalid login credentials, and expired sessions; enhanced `extractSiteMetadataFromRequestHeaders()` to extract sanitized `siteCountry`, `siteLocation`, and `siteMobile` from CDN/browser headers. |
| `apps/web/app/api/auth/login/route.ts` | Added `errorCode: 'VALIDATION_ERROR'` to local 400 validation responses for parity with `/api/auth/register`. |
| `apps/web/app/sign-in/page.tsx` | Added `formatServerLoginError()` to distinguish `CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, `CHALLENGE_EXPIRED`, `INVALID_CREDENTIALS`, and `BACKEND_ERROR`/`NETWORK_ERROR`/`TIMEOUT` without masking the upstream cause. |
| `apps/web/app/sign-up/page.tsx` | Updated `formatServerRegisterError()` to distinguish `CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, and `CHALLENGE_EXPIRED` using `errorCode` and upstream message. |
| `apps/web/tests/phase-3-7-auth-error-and-security.test.mjs` | Added Phase 3.7 unit & security verification suite (error classification, geo/mobile metadata extraction, zero Qlex artifact leakage, login validation codes, frontend error distinction). |

---

## 3. Dependency & Configuration Mapping (Phase H)

No new npm packages were added from Qlex (`libphonenumber-js`, `next`, `react`, `lucide-react`, `framer-motion` are already present in NURVIA).

| Qlex Setting | Qlex Purpose | NURVIA Equivalent | Decision |
|---|---|---|---|
| `SKEW_LINE_APP_KEY` | App key (`x-site-key`) | `SKEW_LINE_APP_KEY` (`website 11`) | **PRESERVE** (server-only, isolated) |
| `SKEW_LINE_APP_DOMAIN` | App domain (`x-site-domain`) | `SKEW_LINE_APP_DOMAIN` | **PRESERVE** (isolated) |
| `SKEW_LINE_APP_NAME` / `TITLE` | App display metadata | `SKEW_LINE_APP_NAME` / `TITLE` | **PRESERVE** |
| `SKEW_LINE_ACTIVE_BACKEND` | Backend selector (`dotnet`) | `SKEW_LINE_ACTIVE_BACKEND=dotnet` | **PRESERVE** |
| `SKEW_LINE_DOTNET_BASE_URL` | Hosted backend origin | `SKEW_LINE_DOTNET_BASE_URL` | **PRESERVE** |
| `SKEW_LINE_LARAVEL_BASE_URL` / `FASTAPI_BASE_URL` | Alternate backends | None | **REJECT** |
| `SKEW_LINE_GOOGLE_CLIENT_ID` | Google One Tap | None | **REJECT / OUT OF SCOPE** |
