# NURVIA Phase 3.4 — Implementation and Remediation Report

**Date:** 2026-11-16  
**Modified Repository:** `C:\Users\gitau\Documents\NURVIA` (`apps/web`)  
**Untouched Read-Only Repositories:** `C:\Users\gitau\Documents\Qlex-Nursing`, `https://explicitbackend.com`

---

## 1. Evidence-Backed Remediations Applied in NURVIA

1. **`apps/web/app/api/auth/login/route.ts`**
   - Added strict `loginMethod` validation (`'password'` or `'pin'`), returning `400` with `Cache-Control: no-store` for unsupported methods.
   - Aligned `LoginProvider` mapping with the verified Qlex-Nursing / LexmaCasto contract by defaulting `LoginProvider` to `'email'` when omitted.
   - Preserved optional `challenge` forwarding (trimmed, never fabricated) and server-side `ipAddress` enrichment.

2. **`apps/web/app/api/auth/register/route.ts`**
   - Added strict `loginMethod` validation (`'password'`, `'pin'`, or `'both'`), returning `400` (`VALIDATION_ERROR`) for unsupported values and validating both password and PIN fields when `'both'` is selected.
   - Aligned `provider` mapping by defaulting `provider` to `'email'` when omitted.
   - Preserved Phase 3.3 protections: `username` >= 2 chars, `EMAIL_PATTERN`, required `phone`, `agree === true`, `password.length >= 12`, `password === passwordConfirmation`, server-enforced `role: 'Learner'`, `Cache-Control: no-store`, and `HttpOnly` session cookies only when backend returns valid credentials and user.

3. **`apps/web/app/sign-up/page.tsx`**
   - Added explicit client-side `name.trim().length < 2` check in `handleSubmit` matching `/api/auth/register` validation.
   - Preserved `phone`, `password` (>= 12 chars), `confirmation`, `agree` checkbox, duplicate-submission prevention (`submitting`), and `ValidationProblemDetails` error rendering.

4. **`apps/web/tests/auth-handlers-integration.test.mjs`**
   - Expanded integration assertions for `LoginProvider: 'email'`, `provider: 'email'`, unsupported `loginMethod` rejection on `/api/auth/login` and `/api/auth/register`, `'both'` method validation, and non-fabrication of `challenge`.

---

## 2. Deslizar Challenge Status

- Per Phase C investigation, Qlex-Nursing does not implement a Deslizar widget or SDK; it hardcodes `skew8lancasto` strings.
- NURVIA does **not** copy Qlex-Nursing's `skew8lancasto` strings and does **not** fabricate a synthetic challenge. Genuine Deslizar integration remains tracked under `EXT-3.4-01`.
