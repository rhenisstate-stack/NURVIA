# NURVIA — Registration Root Cause Analysis

**Date:** 2026-11-17  
**Classification Framework:** `CONFIRMED ROOT CAUSE` | `CONTRIBUTING FACTOR` | `BACKEND CONTRACT DEPENDENCY` | `UNVERIFIED HYPOTHESIS`

---

## 1. Classified Findings

### CONFIRMED ROOT CAUSE — 1: Missing `Challenge` Property in NURVIA's Outbound Registration Request
- **Evidence:** `apps/web/app/sign-up/page.tsx` (L162–171), `apps/web/lib/api-client.ts` (L142–161), `apps/web/lib/lexmacasto/contracts.ts` (L182–196), and `apps/web/app/api/auth/register/route.ts` (L138–150) do not generate, accept, or forward `challenge`.
- **Impact:** LexmaCasto's ASP.NET Core model validation rejects the request with HTTP `400` (`errors.Challenge = ["The Challenge field is required."]`).

### CONFIRMED ROOT CAUSE — 2: Undocumented / Unprovisioned Deslizar Challenge Contract for `WEBSITE_11`
- **Evidence:** Recorded live backend probe (`NURVIA_PHASE_3_3_BACKEND_CONTRACT_VALIDATION_REPORT.md` Probe 3) demonstrates that supplying an arbitrary non-empty `Challenge` + `phone` results in HTTP `401` (`"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"`). Neither QLEX nor NURVIA contains any Deslizar SDK, widget, or challenge-issuance endpoint.
- **Impact:** Even if `challenge` is re-added to NURVIA's DTOs and BFF, NURVIA cannot generate a valid `Challenge` value without the backend owner's specification or provisioning.

### BACKEND CONTRACT DEPENDENCY — LexmaCasto `Challenge` / Deslizar Enforcement (`EXT-3.6-01`)
- **Evidence:** QLEX succeeds using a static site-specific string (`"register-skew8@lancasto"`), whereas LexmaCasto enforces Deslizar validation on `WEBSITE_11` (`https://nurvia-black.vercel.app`) without a documented challenge-issuance endpoint or static token provisioned for NURVIA.
- **Impact:** Blocks all public learner self-registration on NURVIA until resolved by the LexmaCasto backend owner.

### CONTRIBUTING FACTOR — Phase 3.6 Removal of `challenge` Forwarding
- **Evidence:** `NURVIA_PHASE_3_6_CHALLENGE_REMOVAL_REPORT.md` documents the deliberate removal of `challenge` from `contracts.ts`, `api-client.ts`, `auth-provider.tsx`, and `register/route.ts` because no Deslizar integration existed.
- **Impact:** Changed the backend failure mode from HTTP `401` (invalid Deslizar challenge, when synthetic) to HTTP `400` (missing required `Challenge` field).

### UNVERIFIED HYPOTHESIS — Whether `WEBSITE_11` Uses a Static Site Token or a Dynamic Deslizar Widget
- **Details:** QLEX uses a static string (`"register-skew8@lancasto"`), which suggests LexmaCasto may support site-specific static challenge identifiers, **or** `WEBSITE_11` may be configured on the backend to require a dynamic Deslizar token. Without backend source access or documentation from the LexmaCasto owner, this cannot be confirmed.

---

## 2. Explicit Answers to Forensic Questions

1. **Why does QLEX registration succeed?**  
   QLEX hardcodes `challenge: "register-skew8@lancasto"` in its registration handlers (`Qlex/src/app/(web)/auth/page.tsx:230`), forwards it through `registerService.ts:46` and `/api/auth/register/route.ts:61`, and pairs it with QLEX's server-side `x-site-*` headers (`siteHeaders.ts`).

2. **What does QLEX send as `Challenge`?**  
   The static string `"register-skew8@lancasto"` in the JSON request body under the key `"challenge"`.

3. **Where does QLEX obtain or construct that value?**  
   It is hardcoded directly as a string literal in QLEX's frontend registration components (`auth/page.tsx:230`, `auth/register/page.tsx:212`, `auth/modals/Register.tsx:161`, `socialService.ts:63`).

4. **Why does NURVIA registration fail?**  
   Two distinct failures occur: (a) NURVIA currently omits `challenge` entirely, failing ASP.NET Core `[Required]` validation with HTTP `400`; and (b) when a synthetic `challenge` is sent, LexmaCasto rejects it with HTTP `401` (`"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"`).

5. **Does NURVIA send `Challenge` at all?**  
   **No.** `challenge` is absent from browser form state, `nurviaApi.register()`, `LexmaCastoRegisterPayload`, and `/api/auth/register/route.ts`.

6. **If it does, where is it lost or transformed?**  
   It is not lost mid-pipeline—it is **never created or included** at Stage 1 (`sign-up/page.tsx`), Stage 2 (`handleSubmit`), Stage 3 (`api-client.ts`), Stage 4 (`register/route.ts`), or Stage 5 (`lexmaCastoRequest`).

7. **Does NURVIA require a Deslizar integration that QLEX does not use?**  
   **Undetermined / Backend-dependent.** QLEX has zero Deslizar code and uses a static string. LexmaCasto's `401` message for NURVIA explicitly demands Deslizar (`"That Must be Deslizar"`), meaning `WEBSITE_11` either requires a real Deslizar integration or a backend-provisioned `WEBSITE_11` challenge configuration/exemption.

8. **Why did the synthetic challenge fail?**  
   Because LexmaCasto does not merely check for a non-empty string; it validates the `Challenge` value against an expected Deslizar / site-registered value and returns `401` for unrecognized tokens.

9. **Is the failure frontend-side, BFF-side, or backend-contract-side?**  
   **Primarily backend-contract-side (`BACKEND CONTRACT DEPENDENCY`)**, paired with a **frontend/BFF omission** that was introduced intentionally because the backend contract for `Challenge` / Deslizar on `WEBSITE_11` is undocumented and unprovisioned.

10. **What is the smallest correct change needed to make NURVIA registration work?**  
    First obtain the official `WEBSITE_11` challenge decision from the LexmaCasto backend owner:
    - **Path A (Backend exemption):** Backend owner removes the `Challenge` requirement for `WEBSITE_11` on `/api/castoline/auth/register` (no NURVIA code change needed beyond verifying registration).
    - **Path B (Provisioned server-side or Deslizar token):** If the backend expects a provisioned `WEBSITE_11` challenge value or a Deslizar widget/endpoint, add `challenge` back to `LexmaCastoRegisterPayload` and `register/route.ts` (server-side env config if static, or Deslizar widget + token forwarding if dynamic).
