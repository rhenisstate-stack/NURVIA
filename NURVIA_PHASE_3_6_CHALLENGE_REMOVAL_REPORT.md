# NURVIA Phase 3.6 — Challenge Removal Report

**Date:** 2026-11-16  
**Phase:** C — Remove the Nonexistent Challenge Dependency  
**Status:** COMPLETE (Client & NURVIA API routes challenge-free; upstream backend blocker retained as `EXT-3.6-01`)

---

## 1. Removed References

| Layer | File | Change |
|---|---|---|
| **Contracts** | `apps/web/lib/lexmacasto/contracts.ts` | Removed `challenge?: string` from `LexmaCastoLoginPayload` and `LexmaCastoRegisterPayload`. |
| **Client API** | `apps/web/lib/api-client.ts` | Removed `challenge?: string` from `nurviaApi.register` and `nurviaApi.login`. |
| **Auth Provider** | `apps/web/components/auth/auth-provider.tsx` | Removed `challenge?: string` from `SignInCredentials`. |
| **Register Route** | `apps/web/app/api/auth/register/route.ts` | Removed `challenge` forwarding (`body.challenge`). |
| **Login Route** | `apps/web/app/api/auth/login/route.ts` | Removed `challenge` forwarding (`body.challenge`). |
| **Frontend UI** | `apps/web/app/sign-up/page.tsx`, `apps/web/app/sign-in/page.tsx` | Verified zero challenge inputs, sliders, CAPTCHAs, or challenge-required validation exist. |

Retained `'challenge'` only in `SENSITIVE_BODY_KEYS` (`apps/web/lib/lexmacasto/headers.ts`) for defensive log redaction.

---

## 2. Hosted Backend Compatibility Gate (C3)

- Per Phase 3.3/3.4 live probes (`NURVIA_PHASE_3_4_DESLIZAR_CHALLENGE_DISCOVERY_REPORT.md`), the hosted LexmaCasto backend (`POST /api/castoline/auth/register`) previously returned HTTP `400 Bad Request` (`errors.Challenge = ["The Challenge field is required."]`) when `Challenge` was omitted, and `401` (`Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️`) for arbitrary values.
- NURVIA **never** fabricates a challenge value, never copies Qlex-Nursing's `skew8lancasto` strings, and never weakens security controls.
- Upstream `Challenge` requirement remains tracked as external blocker **`EXT-3.6-01`** until the LexmaCasto backend owner removes the `Challenge` requirement for NURVIA (`website 11`) or provides an official challenge specification.

---

## 3. Security Controls Preserved (C4)

- Same-origin CSRF validation (`validateSameOriginRequest`) unchanged.
- Server-side `SKEW_LINE_APP_KEY` / `SKEW_LINE_APP_DOMAIN` headers unchanged.
- `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookies unchanged.
- `Cache-Control: no-store`, `Content-Type: application/json` (`415`), plain-object JSON (`400`), password/PIN validation, and error redaction unchanged.
