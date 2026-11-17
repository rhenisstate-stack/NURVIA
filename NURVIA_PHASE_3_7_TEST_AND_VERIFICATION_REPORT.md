# NURVIA Phase 3.7 — Test and Verification Report

**Date:** `2026-11-17`  
**Branch:** `phase-3.7-qlex-forensic-migration`  
**Working Directory:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Static TypeScript Check

- **Command:** `npx tsc --noEmit`
- **Result:** **PASS** (exit code `0`, 0 errors)

---

## 2. Automated Unit & Security Test Suites (Local / Source-Verified)

- **Command 1:** `npm test` (10 suites)
- **Result:** **PASS** (exit code `0`):
  1. `tests/navigation-and-carousel.test.mjs` — 9/9 passed
  2. `tests/learning-integration.test.mjs` — 8/8 passed
  3. `tests/question-renderers.test.mjs` — 7/7 passed
  4. `tests/hero-redesign.test.mjs` — 6/6 passed
  5. `tests/remote-api-config.test.mjs` — 8/8 passed
  6. `tests/calculators.test.mjs` — 9/9 passed
  7. `tests/lexmacasto-integration.test.mjs` — 9/9 passed
  8. `tests/lexmacasto-phase2-security.test.mjs` — 8/8 passed
  9. `tests/auth-route-remediation.test.mjs` — 7/7 passed
  10. `tests/phone-country-picker.test.mjs` — 10/10 passed
- **Command 2:** `node tests/phase-3-7-auth-error-and-security.test.mjs`
- **Result:** **PASS** (exit code `0`, 5/5 passed):
  1. `classifyBackendErrorCode` defines `CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, `CHALLENGE_EXPIRED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED`.
  2. `extractSiteMetadataFromRequestHeaders` extracts sanitized geo and mobile metadata.
  3. Zero Qlex hardcoded challenges (`skew8lancasto`, `skew8@lancasto`), `WEBSITE_1`, or JS-readable `skew_blanc_session` cookies in NURVIA source.
  4. Login route returns consistent `VALIDATION_ERROR` codes.
  5. Sign-in and sign-up pages distinguish challenge and credential errors.

---

## 3. Live Hosted Backend Contract Probes (Non-Destructive)

Executed on `2026-11-17T05:38:19Z`–`05:38:35Z` against `https://explicitbackend.com` using NURVIA's server-side `website 11` headers:
- `POST /api/castoline/auth/register` (`{}`) → `400` (`{"errors":{"Challenge":["The Challenge field is required."]}}`)
- `POST /api/castoline/auth/login` (`{}`) → `400` (`{"errors":{"Email":["The Email field is required."],"Password":["The Password field is required."]}}`)
- `POST /api/castoline/auth/login` (valid payload shape, no `challenge`) → `401` (`{"error":"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"}`)
- `GET /api/castoline/system/user/list/current?fetchtype=current` (unauthenticated) → `401` (`{"error":"Missing Casto authentication headers"}`)
- `GET /api/castoline/auth/system/user` (Qlex legacy session route) → `200` HTML `"Page Not Found - Master Bank"`

---

## 4. End-to-End & Production Verification Scope

- **Full E2E Authentication (Sign-up → Sign-in → Session → Protected Routes → Logout):** **BLOCKED** by external dependency `EXT-01` (Deslizar challenge contract/provisioning for `website 11`) and `EXT-02` (authorized live test accounts).
- **Production Deployment:** Not deployed (awaiting operator authorization and resolution of `EXT-01`).
