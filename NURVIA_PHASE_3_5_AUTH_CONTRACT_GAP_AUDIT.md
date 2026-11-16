# NURVIA Phase 3.5 — Authentication Contract Gap Audit

**Date:** 2026-11-16  
**Scope:** Comparison of Qlex-Nursing reference authentication handlers (`C:\Users\gitau\Documents\Qlex-Nursing`, read-only) and verified LexmaCasto backend behavior against NURVIA's implementation (`apps/web`).

---

## 1. Inspected Files

- **NURVIA:**
  - `apps/web/app/api/auth/register/route.ts`
  - `apps/web/app/api/auth/login/route.ts`
  - `apps/web/app/api/auth/me/route.ts`
  - `apps/web/app/api/auth/logout/route.ts`
  - `apps/web/app/api/auth/config-status/route.ts`
  - `apps/web/lib/lexmacasto/contracts.ts`
  - `apps/web/lib/lexmacasto/client.ts`
  - `apps/web/lib/lexmacasto/headers.ts`
  - `apps/web/lib/lexmacasto/session.ts`
  - `apps/web/lib/api-client.ts`
  - `apps/web/lib/api-response.ts`
  - `apps/web/lib/api-config.mjs`
  - `apps/web/components/auth/auth-provider.tsx`
  - `apps/web/app/sign-in/page.tsx`
  - `apps/web/app/sign-up/page.tsx`
  - `apps/web/tests/auth-handlers-integration.test.mjs`
  - `apps/web/tests/auth-route-remediation.test.mjs`
  - `apps/web/tests/e2e/auth-route-remediation.spec.ts`
- **Qlex-Nursing (Read-Only Reference):**
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/auth/login/route.ts`
  - `src/lib/services/auth/registerService.ts`
  - `src/lib/services/auth/loginService.ts`

---

## 2. Gap Matrix

| Capability | Reference contract | NURVIA implementation | Evidence | Required action |
|---|---|---|---|---|
| **Registration fields (`username`, `email`, `phone`, `password`, `passwordConfirmation`, `pin`, `pinConfirmation`, `loginMethod`, `agree`, `role`, `dashboardName`, `provider`, `providerPayload`, `challenge`)** | `Qlex-Nursing/src/app/api/auth/register/route.ts` forwards all 14 fields; `providerPayload` typed as `string` (`"Void"` placeholder for email) | `apps/web/app/api/auth/register/route.ts` supports all 14 fields, forces `role: "Learner"`, defaults `provider: "email"`, and requires `phone`, `agree === true`, and matching confirmations. Prior to 3.5, `providerPayload` only accepted objects (not strings) and `nurviaApi.register` omitted `dashboardName`. | `register/route.ts` L34–117; `contracts.ts` L183–198; `api-client.ts` L142–161 | **Implemented:** Accept string or object `providerPayload` (without fabricating `"Void"`) and expose `dashboardName` in `nurviaApi.register`. |
| **Registration `pin` whitespace check** | Reference passes `pin` directly | Prior to 3.5, `register/route.ts` checked `!pin` (allowing whitespace-only strings) | `register/route.ts` L89–96 | **Implemented:** Reject `!pin \|\| !pin.trim()`. |
| **Registration session establishment** | Reference registration does not establish session cookies; redirects to login | `register/route.ts` only sets `HttpOnly` cookies if backend actually returns both valid `castoLine`/`castoBadge` and `sanitizedUser`; `sign-up/page.tsx` directs user to Sign In | `register/route.ts` L139–155; `sign-up/page.tsx` L104–108 | **None** — NURVIA behavior is compliant and safer. |
| **Login fields (`email`, `password`, `pin`, `loginMethod`, `LoginProvider`, `dashboardName`, `role`, `fingerprint`, `ipAddress`, `challenge`)** | `Qlex-Nursing/src/app/api/auth/login/route.ts` forwards full body including `role` (`"Learner"`), `dashboardName`, `fingerprint`, `ipAddress`, `LoginProvider` | Prior to 3.5, `login/route.ts` and `nurviaApi.login` omitted `role` even though `LexmaCastoLoginPayload` defined `role?: string`; `auth-provider.tsx` `signIn` only accepted `{ email, password }`. | `login/route.ts` L59–73; `contracts.ts` L170–181; `api-client.ts` L163–177; `auth-provider.tsx` L19, L63 | **Implemented:** Forward sanitized `role` in `login/route.ts`, add `role?: string` to `nurviaApi.login`, and widen `AuthProvider.signIn` to `SignInCredentials`. |
| **Login backend status preservation** | Reference returns `{ status: backendResponse.status }` | Prior to 3.5, `login/route.ts` omitted `status: result.status` on success (defaulting to `200`) | `login/route.ts` L113–121 | **Implemented:** Pass `result.status` to `noStoreJson` on login success. |
| **Session credential validation (`castoLine`, `castoBadge`)** | Reference reads `user?.castoBadge` and `user?.castoLine` and writes JS-readable cookies | NURVIA extracts via `extractCastoCredentialsFromLogin`, strips them from JSON responses, and stores them in `HttpOnly`, `SameSite=Lax`, `Secure` (prod) cookies. | `client.ts` L354–372; `session.ts` L17–74 | **Hardened:** Reject `castoLine`/`castoBadge` containing CR/LF/control characters in `extractCastoCredentialsFromLogin`. |
| **Request `Content-Type` & JSON object validation** | Reference calls `req.json()` directly | Prior to 3.5, `register/route.ts` and `login/route.ts` did not validate `Content-Type: application/json` or reject `null`/array JSON payloads | `register/route.ts` L27–32; `login/route.ts` L25–30 | **Implemented:** Enforce `application/json` (`415`) and plain-object JSON (`400`) with `Cache-Control: no-store`. |
| **CSRF protection** | Reference has no CSRF check on `/api/auth/login` or `/api/auth/register` | NURVIA enforces `validateSameOriginRequest` (`Origin`, `Referer`, `Sec-Fetch-Site`) | `session.ts` L94–138 | **None** — NURVIA security improvement preserved. |
| **Site headers & server-only key** | Reference uses `getSiteHeaders()` (`x-site-key`, `x-site-domain`, etc.) | NURVIA enforces `SKEW_LINE_APP_KEY` and `SKEW_LINE_APP_DOMAIN` server-side, failing closed if missing, with CRLF sanitization | `headers.ts` L66–104; `api-config.mjs` L99–148 | **None** — NURVIA security improvement preserved. |
| **Deslizar `challenge`** | Reference hardcodes `skew8lancasto` static strings (`"learner.login.skew8lancasto"`, `"register-skew8@lancasto"`) | NURVIA forwards client-supplied `challenge` if present, never fabricates one, and awaits official Deslizar spec/provisioning (`EXT-3.5-01`) | `NURVIA_PHASE_3_4_DESLIZAR_CHALLENGE_DISCOVERY_REPORT.md` | **External dependency** — documented in `NURVIA_PHASE_3_5_EXTERNAL_DEPENDENCY_REGISTER.md`. |
