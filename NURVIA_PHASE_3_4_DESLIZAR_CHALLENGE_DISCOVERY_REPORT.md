# NURVIA Phase 3.4 — Deslizar Challenge Discovery Report

**Date:** 2026-11-16  
**Scope:** Forensic investigation of Qlex-Nursing (`C:\Users\gitau\Documents\Qlex-Nursing\src`) and live LexmaCasto backend (`https://explicitbackend.com`) behavior.

---

## 1. Repository-Wide Search Findings in Qlex-Nursing

A full-repository search of `C:\Users\gitau\Documents\Qlex-Nursing\src` for `deslizar`, `challenge`, `slider`, `lancasto`, and `skew8` established:

1. **No Deslizar Widget or SDK Exists in Qlex-Nursing:**
   - Zero occurrences of `deslizar` anywhere in `Qlex-Nursing/src`.
   - Zero third-party challenge/CAPTCHA SDKs in `Qlex-Nursing/package.json` (no Cloudflare Turnstile, hCaptcha, reCAPTCHA, or Deslizar script).
   - Zero challenge-issuance API calls or endpoints in `Qlex-Nursing/src/app/api/**`.
   - Every `slider` match in `Qlex-Nursing/src` refers to UI exam `StatSlider` progress bars or color-picker Hue/Lightness sliders.

2. **How Qlex-Nursing Populates `challenge`:**
   - Qlex-Nursing hardcodes static application-specific challenge strings directly in its frontend auth components:
     - **Standard Login & One-Tap:** `"learner.login.skew8lancasto"` (`login/page.tsx`, `modals/Login.tsx`, `auth/page.tsx`, `modals/auth.tsx`, `socialService.ts`, `api/auth/social/onetap/route.ts`).
     - **Custom/Annex Login:** `"custom.login.skew8lancasto"` (`modals/Annex.tsx`).
     - **Registration:** `"register-skew8@lancasto"` (`register/page.tsx`, `modals/Register.tsx`, `auth/page.tsx`, `modals/auth.tsx`, `socialService.ts`, dashboard register pages).

---

## 2. Live LexmaCasto Backend Evidence (from Phase 3.3 Probes)

- `POST https://explicitbackend.com/api/castoline/auth/register` with NURVIA's site headers (`x-site-key`, `x-site-domain`):
  - **Missing `Challenge`:** Returns HTTP `400 Bad Request` (`application/problem+json`) with `errors.Challenge = ["The Challenge field is required."]`.
  - **Arbitrary non-empty `Challenge`:** Returns HTTP `401 Unauthorized` with `{ "error": "Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️" }`.

---

## 3. Architectural Conclusion & Boundary Compliance

- LexmaCasto enforces a `Challenge` value ("Deslizar") on `POST /api/castoline/auth/register`.
- Qlex-Nursing satisfies its own `WEBSITE_1` (`skew8lancasto`) challenge check using static `skew8lancasto` strings, **not** a visible slider widget.
- **NURVIA must NOT copy Qlex-Nursing's `skew8lancasto` strings** (those belong to Qlex-Nursing's identity) and **must NOT fabricate a synthetic challenge or client-side bypass**.
- Because LexmaCasto's Deslizar challenge specification, issuance endpoint, widget SDK, or NURVIA-registered challenge token has not yet been documented or provisioned by the LexmaCasto backend owner, this remains an **OPEN external dependency (`EXT-3.4-01`)**.
- NURVIA's `/api/auth/register` and `/api/auth/login` handlers safely forward a client-supplied `challenge` token if present, never fabricate one, and surface LexmaCasto's `ValidationProblemDetails` / `401` messages safely without leaking secrets.
