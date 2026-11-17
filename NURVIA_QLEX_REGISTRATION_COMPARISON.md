# NURVIA vs QLEX — Forensic Registration Comparison

**Date:** 2026-11-17  
**Reference Application (Read-Only):** QLEX (`C:\Users\gitau\Documents\Qlex`)  
**Target Application:** NURVIA (`C:\Users\gitau\Documents\NURVIA`)  
**Backend:** LexmaCasto ASP.NET Core Service (`POST https://explicitbackend.com/api/castoline/auth/register`)

---

## 1. Executive Summary

- **QLEX registration succeeds** because every QLEX registration entry point (`auth/page.tsx`, `auth/register/page.tsx`, `auth/modals/Register.tsx`, `socialService.ts`) attaches a static, site-specific string literal `challenge: "register-skew8@lancasto"` to the registration payload, and QLEX's BFF (`src/app/api/auth/register/route.ts`) preserves and forwards `challenge` in the JSON body to LexmaCasto.
- **NURVIA registration fails** because:
  1. NURVIA's frontend (`apps/web/app/sign-up/page.tsx`), API client (`apps/web/lib/api-client.ts`), contracts (`apps/web/lib/lexmacasto/contracts.ts`), and BFF (`apps/web/app/api/auth/register/route.ts`) intentionally omit `challenge` (removed in Phase 3.6 after confirming no Deslizar specification exists). Consequently, LexmaCasto's ASP.NET Core model binding rejects the request with **HTTP 400** (`"The Challenge field is required."`).
  2. When an invented/synthetic `Challenge` value is supplied alongside `phone`, LexmaCasto rejects it with **HTTP 401** (`"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"`), proving the backend validates `Challenge` against an expected site-specific or server-verified Deslizar token rather than any non-empty string.
- **No Deslizar widget or challenge-issuance endpoint exists in either QLEX or NURVIA.**

---

## 2. Phase A — QLEX Working Registration Path

1. **Registration Page & Form (`C:\Users\gitau\Documents\Qlex\src\app\(web)\auth\page.tsx`)**:
   - `role` is constant `"Learner"` (line 20).
   - `regForm` state (lines 50–57) holds `username`, `email`, `phone`, `password`, `confirmPassword`, `agree`. There is no `challenge` input or UI state.
   - `handleRegister` (lines 195–247) invokes `registerUser(...)` (lines 216–231) and hardcodes `challenge: "register-skew8@lancasto"` (line 230) and `providerPayload: "Void"` (line 229).
   - Identical hardcoding appears in `src/app/(web)/auth/register/page.tsx` (lines 211–212), `src/app/(web)/auth/modals/Register.tsx` (lines 160–161), and `src/lib/services/auth/socialService.ts` (lines 60–63).
2. **Registration Service (`C:\Users\gitau\Documents\Qlex\src\lib\services\auth\registerService.ts`)**:
   - `RegisterCredentials` (lines 4–19) requires `challenge: string`.
   - `registerUser` (lines 30–61) calls `apiFetch<RegisterResponse>("/api/auth/register", { method: "POST", body: JSON.stringify({...}) })` (lines 34–52), forwarding `challenge: data.challenge` and `providerPayload: data.providerPayload || "Void"`.
   - Note: `registerService.ts` uses `pin_confirmation` (line 43), whereas `route.ts` reads `body.pinConfirmation` (line 55); for password-only registration both are `undefined` and omitted by `JSON.stringify`.
3. **`apiFetch()` (`C:\Users\gitau\Documents\Qlex\src\lib\api\api\api.ts`)**:
   - Lines 43–110: For paths starting with `/api`, sends directly to `/api/auth/register` with `Content-Type: application/json` and optional `renderSystemSessionHeaders()` (`x-casto-line`, `x-casto-badge`), leaving `options.body` untouched (line 82).
4. **Internal BFF Route (`C:\Users\gitau\Documents\Qlex\src\app\api\auth\register\route.ts`)**:
   - Resolves `backendUrl = ${getBackendBaseUrl()}/api/castoline/auth/register` (line 35).
   - Attaches `Content-Type: application/json` and `...(await getSiteHeaders())` (lines 44–47).
   - Re-serializes the JSON body (lines 48–62), **preserving `challenge: body.challenge`**, while **dropping `providerPayload`** (not included in lines 48–62).
5. **`getSiteHeaders()` (`C:\Users\gitau\Documents\Qlex\src\lib\config\siteHeaders.ts`)**:
   - Server-only (`import "server-only"`). Attaches `x-site-key` (`APP_KEY`), `x-site-domain` (`APP_DOMAIN`), `x-site-name` (`APP_NAME`), and `x-site-*` request metadata headers (lines 5–22).
6. **Deslizar / Anti-Bot Check**:
   - Repository-wide search of `Qlex/src` for `deslizar` and `captcha` returned **zero matches**. QLEX uses no Deslizar widget and calls no challenge-issuance endpoint.

---

## 3. Phase B — NURVIA Failing Registration Path

1. **Registration Page & Form (`C:\Users\gitau\Documents\NURVIA\apps\web\app\sign-up\page.tsx`)**:
   - State (lines 44–53): `name`, `email`, `phoneCountry`, `phone`, `loginMethod` (`"password" | "pin" | "both"`), `password`, `confirmation`, `pin`, `pinConfirmation`, `agree`.
   - `validateForm()` (lines 100–144): Validates name, email, E.164 phone (`normalizePhoneNumber`), password (≥12 chars) / confirmation, PIN (4–12 digits) / confirmation, and `agree`. No `challenge` state or validation.
   - `handleSubmit()` (lines 146–180) calls `nurviaApi.register({...})` (lines 162–171) without `challenge`, `role`, `dashboardName`, or `providerPayload`.
   - `formatServerRegisterError()` (lines 29–38) intercepts `/challenge/i` backend errors and renders a temporary-unavailability message.
2. **API Client (`C:\Users\gitau\Documents\NURVIA\apps\web\lib\api-client.ts`)**:
   - `nurviaApi.register(payload)` (lines 142–161) does not include `challenge` in its parameter type or payload.
   - `request()` (lines 72–138) sends `POST /api/auth/register` with `Content-Type: application/json`, `credentials: 'include'`, `cache: 'no-store'`.
3. **Internal BFF Route (`C:\Users\gitau\Documents\NURVIA\apps\web\app\api\auth\register\route.ts`)**:
   - Validates same-origin CSRF (`validateSameOriginRequest`), `application/json`, plain-object body, and all registration fields including E.164 phone normalization (`lines 23–133`).
   - Constructs `payload: LexmaCastoRegisterPayload` (lines 138–150) with `role: 'Learner'` and `dashboardName: 'web'` hardcoded server-side. **Does not read or forward `challenge`.**
4. **LexmaCasto Client & Contracts (`apps/web/lib/lexmacasto/contracts.ts`, `client.ts`, `headers.ts`)**:
   - `LexmaCastoRegisterPayload` (`contracts.ts` lines 182–196) has no `challenge` property.
   - `lexmaCastoRequest()` (`client.ts` lines 167–349) resolves NURVIA's server-side `ApplicationIdentity` (`SKEW_LINE_APP_KEY` / `SKEW_LINE_APP_DOMAIN`) via `apps/web/lib/api-config.mjs`, builds `x-site-*` headers via `buildSiteHeaders()` (`headers.ts` lines 66–104), and POSTs `JSON.stringify(options.body)` to `/api/castoline/auth/register`.
   - `headers.ts` line 42 retains `'challenge'` in `SENSITIVE_BODY_KEYS` solely for log redaction.

---

## 4. Phase C — Field-by-Field Final Serialized Payload Comparison

| Registration Property | QLEX Final Backend JSON (`route.ts` L48–62) | NURVIA Final Backend JSON (`route.ts` L138–150) | Backend Expectation (Observed) | Finding |
|---|---|---|---|---|
| `username` | `body.username` (string) | `username` (trimmed string, min 2 chars) | Required string | **Aligned** |
| `email` | `body.email` (string) | `email` (trimmed, regex-validated) | Required valid email | **Aligned** |
| `phone` | `body.phone` (from `PhoneInput`, E.164) | `normalizedPhone.e164` (E.164 via `libphonenumber-js`) | Required (`401 "Phone Number is Required ⚓"` if missing) | **Aligned** |
| `password` | `body.password` (optional; sent for `password`/`both`) | `password` (≥12 chars; sent for `password`/`both`) | Required when `loginMethod` uses password | **Aligned** |
| `passwordConfirmation` | `body.passwordConfirmation` | `passwordConfirmation` (must match `password`) | Required when `loginMethod` uses password | **Aligned** |
| `pin` | `body.pin` (`undefined` in `auth/page.tsx`) | `pin.trim()` (4–12 digits; sent for `pin`/`both`) | Required when `loginMethod` uses PIN | **Aligned** (NURVIA supports PIN; QLEX `auth/page.tsx` omits) |
| `pinConfirmation` | `body.pinConfirmation` (mismatch in `registerService.ts` `pin_confirmation`) | `pinConfirmation?.trim()` (must match `pin`) | Required when `loginMethod` uses PIN | **NURVIA cleaner** (consistent camelCase) |
| `challenge` | `"register-skew8@lancasto"` (string, preserved by BFF L61) | **OMITTED** (removed from UI, `api-client.ts`, `contracts.ts`, `route.ts`) | **Required** (`400 "The Challenge field is required."` if missing; `401` Deslizar error if invalid) | **CRITICAL DISCREPANCY — Primary Blocker** |
| `loginMethod` | `"password"` (or `"pin"` / `"both"`) | `"password"` \| `"pin"` \| `"both"` | Required | **Aligned** |
| `agree` | `body.agree` (`true`) | `true` (validated server-side) | Required (`true`) | **Aligned** |
| `role` | `body.role \|\| "user"` (`"Learner"` from `auth/page.tsx`) | `"Learner"` (enforced server-side) | `"Learner"` | **Aligned** (NURVIA prevents privilege escalation) |
| `dashboardName` | `body.dashboardName \|\| "web"` (`"web"`) | `"web"` (enforced server-side) | `"web"` | **Aligned** |
| `provider` | `body.provider \|\| "email"` (`"email"`) | `provider` (`"email"` default) | `"email"` | **Aligned** |
| `providerPayload` | **Dropped by QLEX BFF** (`route.ts` L48–62 omits it despite `registerService.ts` L50 sending `"Void"`) | Conditionally forwarded if provided (omitted by `sign-up/page.tsx`) | Optional for `provider: "email"` | **Not a blocker** (QLEX succeeds without it in final backend JSON) |
| Website Identity (Headers) | `x-site-key`, `x-site-domain`, `x-site-name` + `x-site-*` metadata (`siteHeaders.ts` L7–21) | `x-site-key` (`WEBSITE_11`), `x-site-domain` (`https://nurvia-black.vercel.app`), `x-site-name` + `x-site-*` (`headers.ts` L77–103) | Required site headers identifying caller application | **Aligned** (distinct identities preserved) |

### Key Discrepancy Detail: `challenge`
- **QLEX:** `C:\Users\gitau\Documents\Qlex\src\app\(web)\auth\page.tsx` (`handleRegister`, line 230) sets `challenge: "register-skew8@lancasto"`; `registerService.ts` (line 46) and `route.ts` (line 61) forward it in the JSON body to LexmaCasto.
- **NURVIA:** `C:\Users\gitau\Documents\NURVIA\apps\web\app\sign-up\page.tsx` (`handleSubmit`, lines 162–171), `lib/api-client.ts` (`nurviaApi.register`, lines 142–161), `lib/lexmacasto/contracts.ts` (`LexmaCastoRegisterPayload`, lines 182–196), and `app/api/auth/register/route.ts` (lines 138–150) do not generate, accept, or forward `challenge`.
- **Expected Behaviour:** LexmaCasto `POST /api/castoline/auth/register` requires `Challenge` in the JSON body and validates it for the calling website identity (`WEBSITE_11`).
