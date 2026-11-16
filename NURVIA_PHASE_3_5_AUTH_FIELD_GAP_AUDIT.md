# NURVIA Phase 3.5 — Authentication Field Gap Audit

**Date:** 2026-11-16  
**Scope:** End-to-end field-level audit of Qlex-Nursing reference handlers (`C:\Users\gitau\Documents\Qlex-Nursing`, read-only) vs. NURVIA (`apps/web`) across frontend UI, client API, Next.js API routes, and LexmaCasto backend contracts.

---

## 1. Registration Field Matrix

| Field | Reference | NURVIA frontend | NURVIA API | Backend contract | Action |
|---|---|---|---|---|---|
| `username` | `register/page.tsx` (`username`) | `sign-up/page.tsx` (`name`, >=2 chars) | `register/route.ts` (`username`, >=2 chars) | Required | Already implemented and working |
| `email` | `register/page.tsx` (`email`) | `sign-up/page.tsx` (`email`, regex) | `register/route.ts` (`email`, regex) | Required | Already implemented and working |
| `phone` | `register/page.tsx` (`PhoneInput`) | `sign-up/page.tsx` (`phone`, required) | `register/route.ts` (`phone`, required) | Required (`"Phone Number is Required ⚓"`) | Already implemented and working |
| `loginMethod` | `registerService.ts` (`"password" \| "pin" \| "both"`) | Previously hardcoded `"password"` | `register/route.ts` validated `"password" \| "pin" \| "both"` | Required | **Implemented:** Added `Password` / `PIN` / `Both` selector in `sign-up/page.tsx` |
| `password` | `register/page.tsx` (>=6/8 chars) | `sign-up/page.tsx` (>=12 chars) | `register/route.ts` (>=12 chars) | Required for `password`/`both` | Already implemented (12-char policy preserved); conditional on `loginMethod` |
| `passwordConfirmation` | `register/page.tsx` | `sign-up/page.tsx` | `register/route.ts` | Required for `password`/`both` | Already implemented; conditional on `loginMethod` |
| `pin` | State existed, no UI | Missing from frontend | Allowed whitespace; no digit pattern | Required for `pin`/`both` | **Implemented:** Added conditional PIN input (`4–12` digits) in `sign-up/page.tsx` & `/api/auth/register` |
| `pinConfirmation` | State existed, no UI | Missing from frontend | Checked equality only | Required for `pin`/`both` | **Implemented:** Added conditional Confirm PIN input in `sign-up/page.tsx` |
| `agree` | `register/page.tsx` checkbox | `sign-up/page.tsx` checkbox | `register/route.ts` (`agree === true`) | Required | Already implemented and working |
| `role` | `register/page.tsx` (`"Learner"`) | Not client-supplied | Forced `"Learner"` server-side | `Learner` | Already implemented and working |
| `dashboardName` | `register/route.ts` (`"web"`) | Missing from `nurviaApi.register` | Optional pass-through | `"web"` | **Implemented:** Server-enforced `"web"` in `register/route.ts`; typed on `nurviaApi.register` |
| `provider` | `register/route.ts` (`"email"`) | Implicit | Defaults to `"email"` | `"email"` (or OAuth provider) | Already implemented; explicit `"email"` sent by `sign-up/page.tsx` |
| `providerPayload` | `registerService.ts` (`"Void"` string) | Not applicable for email | Accepted objects only | Optional (OAuth token/code) | **Implemented:** Accepts `string \| Record<string, unknown>` when supplied; never fabricates `"Void"` |
| `challenge` | Hardcoded `"register-skew8@lancasto"` | Not fabricated | Forwarded if supplied | Required (`Deslizar`) | Backend requirement unverified (`EXT-3.5-01`) |

---

## 2. Login Field Matrix

| Field | Reference | NURVIA frontend | NURVIA API | Backend contract | Action |
|---|---|---|---|---|---|
| `email` | `login/page.tsx` | `sign-in/page.tsx` | `login/route.ts` | Required | Already implemented and working |
| `loginMethod` | `loginService.ts` (`"password" \| "pin"`) | Previously hardcoded `"password"` | `login/route.ts` validated `"password" \| "pin"` | Required | **Implemented:** Added `Password` / `PIN` selector in `sign-in/page.tsx` |
| `password` | `login/page.tsx` | `sign-in/page.tsx` | `login/route.ts` | Required for `password` | Already implemented; conditional on `loginMethod` |
| `pin` | State existed, no UI | Missing from frontend | Supported in API; missing from `AuthProvider.signIn` | Required for `pin` | **Implemented:** Added conditional PIN input in `sign-in/page.tsx` & `SignInCredentials` in `AuthProvider` |
| `LoginProvider` | `login/page.tsx` (`"email"`) | Implicit | Defaults to `"email"` | `"email"` (PascalCase) | Already implemented; explicit `"email"` sent by `sign-in/page.tsx` |
| `dashboardName` | `login/page.tsx` (`"web"`) | Not client-supplied | Optional pass-through | `"web"` | **Implemented:** Server-controlled `"web"` in `login/route.ts` |
| `role` | `login/page.tsx` (`"Learner"`) | Not client-supplied | Missing from `login/route.ts` | `"Learner"` | **Implemented:** Server-controlled `"Learner"` in `login/route.ts` |
| `rememberMe` | `login/page.tsx` (`form.remember`) | Missing from frontend | Fixed 7-day `maxAge` | Local cookie persistence | **Implemented:** Added `Keep me signed in` checkbox in `sign-in/page.tsx` controlling persistent vs. session `HttpOnly` cookies |
| `fingerprint` | Client random string | Optional | Bounded optional pass-through | Optional | Already implemented |
| `ipAddress` | Client-resolved | Server-derived | Derived from sanitized headers | Optional | Already implemented |
| `challenge` | Hardcoded `"learner.login.skew8lancasto"` | Not fabricated | Forwarded if supplied | Optional/Deslizar | Backend requirement unverified (`EXT-3.5-01`) |
