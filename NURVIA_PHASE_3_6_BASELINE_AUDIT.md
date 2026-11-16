# NURVIA Phase 3.6 — Authentication Baseline Audit

**Date:** 2026-11-16  
**Phase:** A — Authentication Baseline Audit  
**Repository:** `C:\Users\gitau\Documents\NURVIA` (`master` @ `56428ae9ba01138189ae088f9b263f6aea4c6941`, matching `origin/master`)  
**Production URL:** `https://nurvia-black.vercel.app`

---

## 1. Inspected Files

- `apps/web/app/sign-up/page.tsx`
- `apps/web/app/sign-in/page.tsx`
- `apps/web/app/forgot-password/page.tsx`
- `apps/web/components/auth/auth-provider.tsx`
- `apps/web/components/brand/logo.tsx`
- `apps/web/components/ui/button.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/lexmacasto/contracts.ts`
- `apps/web/lib/lexmacasto/client.ts`
- `apps/web/lib/lexmacasto/headers.ts`
- `apps/web/lib/lexmacasto/session.ts`
- `apps/web/app/api/auth/register/route.ts`
- `apps/web/app/api/auth/login/route.ts`
- `apps/web/tests/auth-handlers-integration.test.mjs`
- `apps/web/tests/e2e/auth-route-remediation.spec.ts`
- `apps/web/package.json`

---

## 2. Baseline Findings (Questions 1–9)

| # | Baseline Question | Verified Source Fact |
|---|---|---|
| **1** | **How registration constructs its request** | `sign-up/page.tsx` collects `name` (sent as `username`), `email`, `phone`, `loginMethod` (`"password" \| "pin" \| "both"`), conditional `password`/`passwordConfirmation` and `pin`/`pinConfirmation`, `provider: "email"`, `agree: true`, and calls `nurviaApi.register(...)` -> `POST /api/auth/register`. `register/route.ts` validates fields and forwards `username`, `email`, `phone`, `loginMethod`, `agree: true`, `role: 'Learner'`, `dashboardName: 'web'`, `provider`, conditional credentials, optional `providerPayload`, and optional `challenge` to `POST /api/castoline/auth/register`. |
| **2** | **How login constructs its request** | `sign-in/page.tsx` collects `email`, `loginMethod` (`"password" \| "pin"`), conditional `password` or `pin`, `LoginProvider: "email"`, `rememberMe` (default `true`), and calls `AuthProvider.signIn` -> `nurviaApi.login(...)` -> `POST /api/auth/login`. `login/route.ts` forwards `email`, `loginMethod`, `LoginProvider`, `dashboardName: 'web'`, `role: 'Learner'`, conditional credential, optional `challenge`, optional `fingerprint`, and server-derived `ipAddress` to `POST /api/castoline/auth/login`. |
| **3** | **Whether either page requires a challenge** | Neither `sign-up/page.tsx` nor `sign-in/page.tsx` renders a challenge input, widget, or challenge validation. |
| **4** | **Whether API routes require a challenge** | Neither `register/route.ts` nor `login/route.ts` requires `challenge`, though both still accept `challenge?: string` in `nurviaApi` / `AuthProvider` / `contracts.ts` and forward `body.challenge.trim()` if provided. |
| **5** | **Whether the backend contract requires a challenge** | Previous Phase 3.4/3.5 evidence (`NURVIA_PHASE_3_5_EXTERNAL_DEPENDENCY_REGISTER.md`) showed live `POST /api/castoline/auth/register` returning `400` (`The Challenge field is required.`) when omitted. To be re-verified in Phase B/C. |
| **6** | **Whether any challenge string is fabricated or hardcoded** | **No.** Zero `skew8lancasto` or hardcoded challenge strings exist anywhere in `apps/web`. |
| **7** | **How phone numbers are collected & forwarded** | `sign-up/page.tsx` currently uses a plain `<input type="tel">` with `placeholder="+1 555 010 9988"` and checks only `!phone.trim()`. There is no country-code picker, no E.164 normalization, and no phone-format validation. `libphonenumber-js` is not yet installed in `apps/web/package.json`. |
| **8** | **How backend registration errors are returned to the UI** | `lexmaCastoRequest` normalizes `errors` (`string[]`) and `message` (with redaction). `register/route.ts` returns `{ success: false, message, errorCode, errors }` with `result.status`. `sign-up/page.tsx` displays `response.message` (plus `response.errors[0]` if different) in a single `<p role="alert">` above the submit button. |
| **9** | **Whether production contains latest Phase 3.5** | **Yes.** `GET https://nurvia-black.vercel.app/sign-up` serves the Phase 3.5 `Sign-in method` (`Password`/`PIN`/`Both`) UI, and `POST /api/auth/register` & `POST /api/auth/login` enforce `415` `Content-Type` and `PIN_PATTERN` validation. |
