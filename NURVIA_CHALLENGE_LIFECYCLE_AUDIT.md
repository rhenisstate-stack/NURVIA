# NURVIA — Challenge & Deslizar Lifecycle Audit

**Date:** 2026-11-17  
**Scope:** Phase D — Investigation of the `Challenge` / Deslizar contract across QLEX, NURVIA, and the hosted LexmaCasto backend (`https://explicitbackend.com`).

---

## 1. How `Challenge` Works in QLEX (Reference)

- **Origin:** Hardcoded string literal `"register-skew8@lancasto"` directly in frontend React components (`Qlex/src/app/(web)/auth/page.tsx:230`, `auth/register/page.tsx:212`, `auth/modals/Register.tsx:161`, and `src/lib/services/auth/socialService.ts:63`).
- **Dynamic Generation / Challenge Endpoint:** None. QLEX makes zero pre-registration challenge API calls.
- **Deslizar Widget / SDK:** None. Searching `Qlex/src` for `deslizar` and `captcha` yields 0 matches.
- **Transmission:** Sent in the JSON request body as `"challenge": "register-skew8@lancasto"` (lowercase `c`), preserved by `/api/auth/register/route.ts:61`, and accepted by LexmaCasto under QLEX's site headers.
- **Nature of QLEX's Value:** `"register-skew8@lancasto"` is a static, site-specific application identifier tied to QLEX's `skew8lancasto` / `WEBSITE_1` registration contract—not a dynamic, single-use anti-bot slider token.

---

## 2. Codebase Search Results in NURVIA

Searches across `NURVIA/apps`, `NURVIA/components`, `NURVIA/hooks`, and `NURVIA/lib` for `Challenge`, `challenge`, `Deslizar`, `captcha`, `providerPayload`, `pinConfirmation`, and `WEBSITE_11` establish:

1. **No Deslizar SDK or Widget:** Zero Deslizar scripts, components, or third-party CAPTCHA packages exist in NURVIA.
2. **No Challenge Endpoint:** `apps/web/lib/lexmacasto/contracts.ts` lists all verified LexmaCasto endpoints (`LOGIN`, `REGISTER`, `CURRENT_USER`, `LOGOUT_DISTINCT`, `LOGOUT_RELATIVE`, and 22 strata endpoints). No challenge-issuance or challenge-verification endpoint is documented or present.
3. **Intentional Removal in Phase 3.6:** Per `NURVIA_PHASE_3_6_CHALLENGE_REMOVAL_REPORT.md`, `challenge` was removed from `contracts.ts`, `api-client.ts`, `auth-provider.tsx`, `app/api/auth/register/route.ts`, and `app/api/auth/login/route.ts`. Only `SENSITIVE_BODY_KEYS` in `apps/web/lib/lexmacasto/headers.ts:42` retains `'challenge'` for log redaction, and `sign-up/page.tsx:31` maps `/challenge/i` errors to a user-friendly unavailability notice.

---

## 3. Deslizar Contract Analysis (12 Questions)

Based on source-code inspection and recorded live backend probes (`NURVIA_PHASE_3_3_BACKEND_CONTRACT_VALIDATION_REPORT.md`, `NURVIA_PHASE_3_4_DESLIZAR_CHALLENGE_DISCOVERY_REPORT.md`):

| # | Question | Finding | Evidence / Status |
|---|---|---|---|
| 1 | Is Deslizar required for NURVIA registration? | **Yes, by the current hosted backend configuration.** | Arbitrary `Challenge` + `phone` returns `401 { "error": "Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️" }`. |
| 2 | Does QLEX use a different site-level registration contract? | **Yes.** | QLEX succeeds with static `"register-skew8@lancasto"` and no Deslizar widget. |
| 3 | Is QLEX's challenge a static app identifier or generated token? | **Static application identifier.** | Hardcoded string literal `"register-skew8@lancasto"` in 4 QLEX files. |
| 4 | Must NURVIA initialize a Deslizar widget? | **Unverified / Undocumented.** | No Deslizar SDK, script URL, or widget spec exists in QLEX or NURVIA docs. It is unknown whether `WEBSITE_11` requires a real Deslizar widget or a provisioned static identifier like QLEX. |
| 5 | Must a challenge token be issued before registration? | **Unknown (Backend-owned).** | No challenge-issuance endpoint is documented in `NURVIA_LEXMACASTO_INTEGRATION_CONTRACT.md`. |
| 6 | Is the token associated with `WEBSITE_11`? | **Yes (inferred from site-scoped auth).** | LexmaCasto identifies the app via `x-site-key` (`WEBSITE_11`) and `x-site-domain` (`https://nurvia-black.vercel.app`). |
| 7 | Is the token tied to a particular domain? | **Likely yes (via `x-site-domain`).** | `buildSiteHeaders()` sends `x-site-domain` on every request. |
| 8 | Does the token expire? | **Unknown (Backend-owned).** | Cannot be determined without backend source or Deslizar spec. |
| 9 | Must the token be single-use? | **Unknown (Backend-owned).** | Cannot be determined without backend source or Deslizar spec. |
| 10 | Is a phone number a prerequisite to challenge issuance? | **No for model binding; Yes for registration.** | Probe 2 showed non-empty `Challenge` without `phone` returned `401 "Phone Number is Required ⚓"`; Probe 3 showed `Challenge` + `phone` reached Deslizar validation (`401`). |
| 11 | What token format does the backend expect? | **Unknown for `WEBSITE_11`.** | QLEX uses `"register-skew8@lancasto"` (`register-<site_token>`). NURVIA's valid `WEBSITE_11` Deslizar token or issuance mechanism has not been provided by the backend owner. |
| 12 | Where must `Challenge` be submitted? | **JSON request body (`challenge` / `Challenge`).** | ASP.NET Core `ValidationProblemDetails` reports `errors.Challenge = ["The Challenge field is required."]` on the JSON body. |

---

## 4. Security & Boundary Assessment

- NURVIA **must not** copy `"register-skew8@lancasto"` (belongs to QLEX's site identity).
- NURVIA **must not** manufacture synthetic tokens or attempt to bypass Deslizar validation.
- Resolving this contract requires either:
  1. The LexmaCasto backend owner provisioning/documenting the official Deslizar challenge issuance endpoint, widget SDK, or `WEBSITE_11` challenge configuration, **or**
  2. The LexmaCasto backend owner disabling the `Challenge` / Deslizar requirement for `WEBSITE_11` if NURVIA is intended to register without it.
