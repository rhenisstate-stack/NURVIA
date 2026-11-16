# NURVIA Phase 3.6 — Production Registration HTTP 400 Root-Cause Report

**Date:** 2026-11-16  
**Phase:** B — Investigate the Production HTTP 400 Registration Failure  
**Target Endpoint:** `POST https://nurvia-black.vercel.app/api/auth/register`

---

## 1. Root-Cause Analysis

A same-origin `POST https://nurvia-black.vercel.app/api/auth/register` request from `/sign-up` with `Content-Type: application/json` can return HTTP `400 Bad Request` (`Cache-Control: no-store`) from two distinct layers:

### A. Upstream LexmaCasto Backend `400` (Primary Cause for Valid Form Submissions)
When all client-side and Next.js route validations pass, `apps/web/app/api/auth/register/route.ts` forwards the registration payload (`username`, `email`, `phone`, `loginMethod`, `agree: true`, `role: 'Learner'`, `dashboardName: 'web'`, `provider`, conditional credentials) to `POST https://explicitbackend.com/api/castoline/auth/register` **without** a `challenge` field.

Per recorded Phase 3.3/3.4 live backend probes (`NURVIA_PHASE_3_4_DESLIZAR_CHALLENGE_DISCOVERY_REPORT.md`):
- **Upstream HTTP Status:** `400 Bad Request` (`application/problem+json`)
- **Upstream Error:** `errors.Challenge = ["The Challenge field is required."]`
- **Normalized Route Response:**
  - HTTP `400 Bad Request`, `Cache-Control: no-store`
  - `{"success": false, "message": "Challenge: The Challenge field is required.", "errorCode": "VALIDATION_ERROR", "errors": ["Challenge: The Challenge field is required."]}`
- **Origin of Failure:** **Upstream** (LexmaCasto `.NET` backend), surfaced through NURVIA's route handler.

### B. Local Route Handler `400` Conditions (`register/route.ts`)
`register/route.ts` also returns HTTP `400` locally before calling the backend when:
- Request body is malformed JSON or not a plain object (`"Invalid JSON request body."`)
- `username.length < 2` (`"Full name or username is required (minimum 2 characters)."`)
- `email` fails `EMAIL_PATTERN` (`"A valid email address is required."`)
- `phone` is empty (`"Phone number is required."`)
- `agree !== true` (`"You must agree to the terms and privacy policy."`)
- `loginMethod` is not `'password' | 'pin' | 'both'` (`"Unsupported login method."`)
- `password` missing, `< 12` chars, or `!== passwordConfirmation`
- `pin` missing, fails `/^\d{4,12}$/`, or `!== pinConfirmation`

---

## 2. UI Error Handling Gaps Identified

In `apps/web/app/sign-up/page.tsx`:
- All validation and backend errors were rendered only as a single generic `<p role="alert">` at the bottom of the form rather than inline field-level errors (`aria-invalid`, `aria-describedby`).
- Phone validation only checked `!phone.trim()`, providing no format validation or clear invalid-phone message.
- If the upstream backend returned `Challenge: The Challenge field is required.`, the raw field name `Challenge` leaked into the UI alert instead of a clear user-friendly message explaining that registration is temporarily unavailable pending backend configuration.

---

## 3. Remediation Plan

1. **Phase C:** Remove `challenge` from NURVIA's client-facing registration/login contracts and API routes, and map any upstream `Challenge`-required error safely without fabricating a challenge.
2. **Phase D:** Add an international country-code picker + `libphonenumber-js` E.164 normalization and validation for `phone` on both client and server.
3. **Phase E:** Add accessible inline field-level validation and server error presentation in `sign-up/page.tsx` and `sign-in/page.tsx`.
