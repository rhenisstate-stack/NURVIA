# NURVIA Phase 3.5 — Login Implementation Report

**Date:** 2026-11-16  
**Scope:** End-to-end login across `apps/web/app/sign-in/page.tsx`, `apps/web/components/auth/auth-provider.tsx`, `apps/web/lib/api-client.ts`, `apps/web/app/api/auth/login/route.ts`, and `apps/web/lib/lexmacasto/client.ts`.

---

## 1. Implemented Changes

| File | Feature Added / Corrected | Reason | Security Implications |
|---|---|---|---|
| `apps/web/app/sign-in/page.tsx` | Added `Password` / `PIN` `radiogroup` selector, conditional Password and PIN inputs with visibility toggles, `Keep me signed in` (`rememberMe`) checkbox, and method-exact `signIn` submission (`loginMethod`, `LoginProvider: 'email'`). | Enable both Email+Password and Email+PIN login in the UI without silently converting methods. | Never stores tokens in JS; `rememberMe` controls `HttpOnly` cookie `maxAge` server-side. |
| `apps/web/components/auth/auth-provider.tsx` | Widened `signIn` parameter type to `SignInCredentials` supporting `password`, `pin`, `loginMethod`, `LoginProvider`, `challenge`, `fingerprint`, `dashboardName`, `role`, and `rememberMe`. | Connect `SignInPage` PIN & `rememberMe` flows to `nurviaApi.login`. | None. |
| `apps/web/lib/api-client.ts` | Added `role?: string` and `rememberMe?: boolean` to `nurviaApi.login`. | Align client helper with login route. | None. |
| `apps/web/app/api/auth/login/route.ts` | Added `Content-Type: application/json` (`415`) and plain-object JSON (`400`) validation; enforced server-controlled `role: 'Learner'` and `dashboardName: 'web'`; omitted irrelevant `password`/`pin`; wired `rememberMe` to `setServerCastoSession`; preserved `result.status` on success. | Enforce server-controlled `role`/`dashboardName`, content-type checks, and `rememberMe` cookie persistence. | Prevents client spoofing of `role`/`dashboardName`; preserves `no-store` and fail-closed `502` on missing credentials. |
| `apps/web/lib/lexmacasto/client.ts` | Hardened `extractCastoCredentialsFromLogin` to reject `castoLine`/`castoBadge` containing CR/LF/control characters. | Prevent malformed or header-injectable credentials from being persisted in cookies. | Strengthens session credential hygiene. |

---

## 2. Verification Summary

- `node apps/web/tests/auth-handlers-integration.test.mjs`: **14/14 passed** (password login, PIN login, `rememberMe: false` session cookie, server-enforced `role: 'Learner'` & `dashboardName: 'web'`, unsupported `loginMethod`, `415` Content-Type, `401`, `400`, `502` on missing credentials or invalid JSON).
- Playwright E2E (`sign-in` test): **PASS**, verifying `Password` / `PIN` switching, `rememberMe` uncheck, and exact `loginMethod: "pin"`, `LoginProvider: "email"`, `rememberMe: false` payload.
