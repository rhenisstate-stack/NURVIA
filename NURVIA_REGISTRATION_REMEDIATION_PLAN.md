# NURVIA — Registration Remediation Plan & Executive Summary

**Date:** 2026-11-17  
**Status:** INVESTIGATION COMPLETE — AWAITING APPROVAL & BACKEND OWNER CONFIRMATION BEFORE CODE CHANGES

---

## 1. Phase G — Implementation Decision

### Non-Negotiable Constraints
- Do **not** copy QLEX's `"register-skew8@lancasto"` into NURVIA.
- Do **not** invent or hardcode a synthetic `Challenge` token.
- Do **not** modify QLEX (`C:\Users\gitau\Documents\Qlex`).
- Do **not** modify NURVIA application code until the plan is approved.

### Why a Frontend-Only Code Change Cannot Fix This Alone
In `apps/web/app/api/auth/register/route.ts`, NURVIA already sends every other required field (`username`, `email`, E.164 `phone`, `password`/`passwordConfirmation` or `pin`/`pinConfirmation`, `loginMethod`, `agree: true`, `role: 'Learner'`, `dashboardName: 'web'`, `provider: 'email'`) along with NURVIA's server-side `x-site-key` (`WEBSITE_11`) and `x-site-domain` (`https://nurvia-black.vercel.app`).

Because LexmaCasto returns:
- **HTTP 400** when `Challenge` is omitted, and
- **HTTP 401** (`"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"`) when an arbitrary `Challenge` is supplied,

**no valid `Challenge` value can be derived from NURVIA's codebase alone.**

---

## 2. Recommended Minimal Remediation Plan (Two-Path)

### Step 1 — Backend Owner Alignment (Prerequisite)
Confirm with the LexmaCasto backend owner how `WEBSITE_11` (`https://nurvia-black.vercel.app`) is configured on `POST /api/castoline/auth/register`:
- **Option A (Recommended Minimal Backend Fix):** Disable/exempt `Challenge` (Deslizar) validation for `WEBSITE_11` on `POST /api/castoline/auth/register`, **or**
- **Option B (Provisioned Challenge / Deslizar Contract):** Provide either:
  - **(B1)** An official Deslizar widget SDK / challenge-issuance endpoint and verification contract, **or**
  - **(B2)** An officially provisioned `WEBSITE_11` registration challenge identifier (stored server-side in `SKEW_LINE_REGISTER_CHALLENGE`, never in client bundles).

### Step 2 — Minimal NURVIA Code Changes (Only After Step 1)
- **If Option A:** Zero registration payload changes required in NURVIA. Run a live registration verification test against `https://nurvia-black.vercel.app/api/auth/register` and remove the temporary unavailability mapping in `apps/web/app/sign-up/page.tsx:31` if desired.
- **If Option B1 (Dynamic Deslizar Widget):**
  1. Integrate the official Deslizar widget in `apps/web/app/sign-up/page.tsx` and pass the issued token to `nurviaApi.register()`.
  2. Add `challenge: string` to `nurviaApi.register` (`apps/web/lib/api-client.ts`), `LexmaCastoRegisterPayload` (`apps/web/lib/lexmacasto/contracts.ts`), and forward validated `body.challenge` in `apps/web/app/api/auth/register/route.ts`.
- **If Option B2 (Server-Side Provisioned Token):**
  1. Read `process.env.SKEW_LINE_REGISTER_CHALLENGE` server-side in `apps/web/app/api/auth/register/route.ts` (never exposed to client JS).
  2. Add `challenge?: string` to `LexmaCastoRegisterPayload` and attach it in `register/route.ts`.

### Step 3 — Verification Gate (After Implementation)
1. `POST /api/auth/register` returns HTTP `200`/`201` with sanitized user response and `HttpOnly` session cookies (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`).
2. Verify `GET /api/auth/me` succeeds for the newly registered Learner.
3. Confirm no secrets, `SKEW_LINE_APP_KEY`, or challenge secrets appear in client bundles or logs.

---

## 3. Final Executive Summary

| Dimension | Finding |
|---|---|
| **QLEX's Proven Working Behaviour** | Hardcodes `challenge: "register-skew8@lancasto"` in frontend auth handlers (`auth/page.tsx:230`), forwards it via `registerService.ts:46` and `/api/auth/register/route.ts:61` in the JSON body, and pairs it with QLEX's `x-site-*` headers. Uses no Deslizar widget. |
| **NURVIA's Observed Failing Behaviour** | Omits `challenge` across UI, `api-client.ts`, `contracts.ts`, and `register/route.ts`, causing HTTP `400` (`"The Challenge field is required."`). Sending a synthetic `challenge` + `phone` causes HTTP `401` (`"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"`). |
| **Exact `Challenge` Property Differences** | QLEX sends `"challenge": "register-skew8@lancasto"` in the backend JSON body. NURVIA sends no `challenge` property at all. |
| **Exact Point of Failure** | 1. **Stage 1–5 Omission:** `challenge` is absent from NURVIA's form, client, and BFF (`register/route.ts` L138–150).<br>2. **Stage 6 Backend Contract:** LexmaCasto requires a valid Deslizar / site-registered `Challenge` for `WEBSITE_11`, which is not documented or provisioned. |
| **Is Deslizar Required?** | **Yes on LexmaCasto for `WEBSITE_11` currently** (evidenced by the `401` Deslizar error), even though QLEX does not use a Deslizar widget. |
| **Is Backend Intervention Necessary?** | **Yes.** Either the LexmaCasto backend owner must exempt `WEBSITE_11` from `Challenge`, or provision/document the official `WEBSITE_11` Deslizar contract. |
| **Recommended Minimal Fix** | Obtain backend owner resolution (Option A exemption or Option B Deslizar/token spec), then either test as-is (Option A) or restore `challenge` forwarding in `contracts.ts` + `register/route.ts` (+ Deslizar widget if dynamic). |
| **Evidence & Confidence Level** | **High Confidence (Direct Source + Recorded Probe Evidence).** Verified directly in QLEX and NURVIA source files and corroborated by recorded Phase 3.3/3.4 live HTTP probes against `https://explicitbackend.com/api/castoline/auth/register`. |
