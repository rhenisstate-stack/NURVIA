# NURVIA Phase 3.8 — Temporary Challenge Compatibility Report

**Status:** `TEMPORARY — REMOVE WHEN OFFICIAL DESLIZAR INTEGRATION IS AVAILABLE`  
**Module:** `apps/web/lib/auth/temporaryChallenge.ts`

---

## 1. Qlex Values Verified & Centralized

| Operation | Temporary Value | Qlex Source Call Sites | NURVIA Consumer |
|---|---|---|---|
| `register` | `register-skew8@lancasto` | `register/page.tsx:212`, `modals/Register.tsx:161`, `dashboards/*/auth/register/page.tsx:238` | `apps/web/app/api/auth/register/route.ts` |
| `standard_login` | `learner.login.skew8lancasto` | `login/page.tsx:152,165`, `modals/Login.tsx:108,120`, `modals/Annex.tsx:14` | `apps/web/app/api/auth/login/route.ts` |
| `custom_login` | `custom.login.skew8lancasto` | `modals/Annex.tsx:15` | Reserved in `temporaryChallenge.ts` (NURVIA has no custom target-email impersonation flow) |

## 2. Live Backend Acceptance Evidence (`website 11`)

- **Login (`2026-11-17T06:00:42.220Z`):** `POST /api/castoline/auth/login` with `challenge: "learner.login.skew8lancasto"` and redacted test email returned `401` `{"error":"Your Account Does not Exist in our System  ⚓"}` instead of `"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"` — **CONFIRMED ACCEPTED by `explicitbackend.com`**.
- **Registration (`2026-11-17T06:00:42.666Z`):** `POST /api/castoline/auth/register` with `challenge: "register-skew8@lancasto"` (without `agree`) returned `401` `{"error":"You Must Agree to the Terms and Conditions ⚓"}` instead of `400` `"The Challenge field is required."` — **CONFIRMED ACCEPTED by `explicitbackend.com`**.

## 3. Security & Official Deslizar Replacement Requirements

- Values are strictly server-side in `apps/web/lib/auth/temporaryChallenge.ts`, never imported in `'use client'` files, never logged, and never returned in API responses.
- Future Deslizar replacement requires: official challenge issuance endpoint, challenge ID/token schema, expiration/single-use rules, client widget/SDK integration (if interactive), and server-side verification forwarding — replacing `getTemporaryChallenge()` without rewriting NURVIA's auth architecture.
