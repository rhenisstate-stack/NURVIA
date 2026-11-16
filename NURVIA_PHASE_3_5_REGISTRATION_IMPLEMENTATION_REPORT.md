# NURVIA Phase 3.5 — Registration Implementation Report

**Date:** 2026-11-16  
**Scope:** End-to-end registration across `apps/web/app/sign-up/page.tsx`, `apps/web/lib/api-client.ts`, `apps/web/lib/lexmacasto/contracts.ts`, and `apps/web/app/api/auth/register/route.ts`.

---

## 1. Implemented Changes

| File | Feature Added / Corrected | Reason | Security Implications |
|---|---|---|---|
| `apps/web/app/sign-up/page.tsx` | Added `Password` / `PIN` / `Both` `radiogroup` selector, conditional Password/Confirm Password and PIN/Confirm PIN inputs with visibility toggles, `4–12` digit PIN validation, email regex check, and method-scoped payload submission. | Close frontend parity gap so learners can register with Password, PIN, or Both without sending irrelevant fields. | Preserves 12-char password minimum; never exposes secrets or fabricates Deslizar `challenge`. |
| `apps/web/app/api/auth/register/route.ts` | Added `Content-Type: application/json` (`415`) and plain-object JSON (`400`) validation; enforced `PIN_PATTERN` (`/^\d{4,12}$/`); enforced `role: 'Learner'` and `dashboardName: 'web'` server-side; omitted irrelevant `password`/`pin` fields based on `loginMethod`; supported `string \| Record<string, unknown>` `providerPayload`. | Enforce server-controlled `role`/`dashboardName`, content-type validation, and clean payload forwarding. | Prevents client privilege escalation, content-type smuggling, and `"Void"` fabrication. |
| `apps/web/lib/lexmacasto/contracts.ts` | Updated `LexmaCastoRegisterPayload.providerPayload` to `string \| Record<string, unknown>`. | Match backend/OAuth payload types. | Type-safe contract without runtime exposure. |
| `apps/web/lib/api-client.ts` | Added `dashboardName` and `string \| Record<string, unknown>` `providerPayload` to `nurviaApi.register`. | Align client helper with registration contract. | None. |

---

## 2. Verification Summary

- `node apps/web/tests/auth-handlers-integration.test.mjs`: **14/14 passed** (including password, PIN, combined `both`, PIN mismatch, invalid non-numeric PIN, missing phone, invalid email, missing consent, unsupported method, `415` Content-Type, `ValidationProblemDetails`, HTML/malformed/leaky error redaction, and conditional cookie creation).
- Playwright E2E (`sign-up` test): **PASS** at mobile viewport (`375x812`), verifying method switching, conditional field visibility, password toggle, and exact PIN registration payload.
