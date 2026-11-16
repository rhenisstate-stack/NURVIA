# NURVIA Phase 3.3 — Remediation Report

**Date:** 2026-11-16  
**Scope:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Remediations Implemented (Locally Verified)

### A. `apps/web/lib/lexmacasto/client.ts`
- Added `extractBackendErrors()` to parse both `string[]` and ASP.NET Core `ValidationProblemDetails` dictionary `Record<string, string[] | string>` (`errors` / `Errors`).
- Expanded `rawMsg` extraction to check `message`, `Message`, `error`, `Error`, `detail`, `title`, and nested `data.message` / `data.error`.
- When `ValidationProblemDetails` returns a generic `"One or more validation errors occurred."` `title` alongside specific field errors, `resolvedMessage` surfaces the first sanitized field error (e.g., `Challenge: The Challenge field is required.`).
- Handled HTML error pages safely (no HTML leakage) and preserved sanitized non-JSON `text/plain` error messages on non-2xx responses.
- Expanded `SENSITIVE_BACKEND_MESSAGE_PATTERN` to strip `explicitbackend.com`, `108.61.9.189`, `SKEW_LINE_APP_KEY`, `x-site-key`, `x-casto-line`, `x-casto-badge`, `castoLine`, `castoBadge`, and `Bearer` tokens.

### B. `apps/web/app/api/auth/register/route.ts`
- Added `noStoreJson()` helper so **every** registration response (`200`/`201`, `400`, `403`, `401`, `5xx`) includes `Cache-Control: no-store`.
- Enforced `username` (`>= 2` chars), valid `email` format, required `phone`, explicit `agree === true`, and `password.length >= 12` with `password === passwordConfirmation`.
- Preserved `role: 'Learner'` server-side (ignoring any client-supplied `role`).
- Added conditional `HttpOnly` session cookie attachment only if LexmaCasto returns valid `castoLine`/`castoBadge` + `user` on registration; failure responses never set session cookies.

### C. `apps/web/app/api/auth/login/route.ts`
- Added `noStoreJson()` helper so login error responses (`400`, `401`, `403`, `502`) also carry `Cache-Control: no-store`.

### D. `apps/web/app/sign-up/page.tsx`
- Added required **Phone number** input (`id="phone"`, `type="tel"`, `autoComplete="tel"`, `required`).
- Added explicit **Terms & Privacy** consent checkbox (`id="agree"`, `required`, defaulting to `false`).
- Updated `handleSubmit` to validate `phone` and `agree`, pass both to `nurviaApi.register(...)`, and surface detailed validation messages from `response.errors` when available.

### E. `apps/web/tests/auth-handlers-integration.test.mjs`
- Added mock modes (`problem-400`, `html-400`, `malformed-400`, `leak-400`) and tests `7`, `7a`, `7b` covering all 12 Phase E requirements.
