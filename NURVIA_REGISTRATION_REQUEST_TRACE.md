# NURVIA — Complete Registration HTTP Request Pipeline Trace

**Date:** 2026-11-17  
**Target Flow:** `https://nurvia-black.vercel.app/sign-up` → `POST /api/auth/register` → `POST https://explicitbackend.com/api/castoline/auth/register`

---

## Stage-by-Stage `Challenge` Property Trace

| Stage | Component / File | Lines | `Challenge` Status | Details (Redacted) |
|---|---|---|---|---|
| **Stage 1: Browser Form State** | `apps/web/app/sign-up/page.tsx` (`SignUpPage`) | L44–53 | **Missing** | State holds `name`, `email`, `phoneCountry`, `phone`, `loginMethod`, `password`, `confirmation`, `pin`, `pinConfirmation`, `agree`. No `challenge` state exists. |
| **Stage 2: Registration Submission Handler** | `apps/web/app/sign-up/page.tsx` (`handleSubmit`) | L146–172 | **Missing** | Calls `nurviaApi.register({ username, email, phone, password/pin, loginMethod, provider: "email", agree })`. `challenge` is not in the constructed object. |
| **Stage 3: Internal BFF Request** | `apps/web/lib/api-client.ts` (`nurviaApi.register` → `request`) | L142–161, L72–95 | **Missing** | `nurviaApi.register` payload type omits `challenge`. `POST /api/auth/register` sends JSON without `challenge`. |
| **Stage 4: BFF Transformation** | `apps/web/app/api/auth/register/route.ts` (`POST`) | L138–150 | **Missing** | Reads `username`, `email`, `phone`, `password`, `passwordConfirmation`, `pin`, `pinConfirmation`, `loginMethod`, `agree`, `provider`, `providerPayload`. Hardcodes `role: 'Learner'`, `dashboardName: 'web'`. Does not read or attach `challenge`. |
| **Stage 5: Hosted Backend Request** | `apps/web/lib/lexmacasto/client.ts` (`lexmaCastoRequest`) | L208–239 | **Missing** | Attaches `x-site-key` (`[REDACTED]`), `x-site-domain` (`https://nurvia-black.vercel.app`), `x-site-name`, and `x-site-*` metadata. Serializes `options.body` without `Challenge` / `challenge`. |
| **Stage 6: Backend Response** | `https://explicitbackend.com/api/castoline/auth/register` | N/A (Upstream) | **Rejected (HTTP 400)** | When `Challenge` is omitted, ASP.NET Core returns HTTP `400` (`errors.Challenge = ["The Challenge field is required."]`). Normalized by `client.ts` (L312–327) to `{ success: false, message: "Challenge: The Challenge field is required.", errorCode: "VALIDATION_ERROR", errors: [...] }`, and mapped by `sign-up/page.tsx` (L31–33) to a temporary-unavailability message. |

---

## Comparison With Synthetic Challenge Probe (Recorded Phase 3.3 Evidence)

Per `NURVIA_PHASE_3_3_BACKEND_CONTRACT_VALIDATION_REPORT.md`:

- **With non-empty synthetic `challenge`, without `phone`:**
  - **Stage 6 Response:** HTTP `401 Unauthorized` — `{ "error": "Phone Number is Required ⚓" }`.
  - **Significance:** `Challenge` passed ASP.NET Core `[Required]` model binding; backend then checked `phone`.
- **With non-empty synthetic `challenge` + `phone`:**
  - **Stage 6 Response:** HTTP `401 Unauthorized` — `{ "error": "Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️" }`.
  - **Significance:** Backend rejected the synthetic `Challenge` value during Deslizar validation.

---

## Contract Breakpoint

The registration contract breaks at **two connected points**:
1. **Frontend / BFF omission:** NURVIA sends no `challenge` field at Stages 1–5, triggering HTTP `400` at Stage 6.
2. **Backend-contract gap (Deslizar):** Even if NURVIA forwards a `challenge` field, LexmaCasto rejects non-Deslizar values with HTTP `401` at Stage 6, and no Deslizar token issuance endpoint, widget, or `WEBSITE_11` challenge specification exists in NURVIA's backend contract.
