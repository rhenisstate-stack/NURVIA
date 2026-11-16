# NURVIA Phase 3.6 — Final Acceptance Report

**Date:** 2026-11-16  
**Project:** NURVIA (`apps/web`)  
**Repository:** `C:\Users\gitau\Documents\NURVIA` (`master` @ `56428ae9ba01138189ae088f9b263f6aea4c6941` + local Phase 3.6 changes)  
**Final Decision:** **`ACCEPTED — BACKEND INTEGRATION BLOCKED`**

---

## 1. Executive Summary

Phase 3.6 completed all NURVIA-side objectives:
1. **Production 400 Root Cause Documented:** Identified upstream LexmaCasto `ValidationProblemDetails` (`errors.Challenge = ["The Challenge field is required."]`) for valid registration submissions, plus local validation gaps (`phone` format validation and inline UI error presentation).
2. **Nonexistent Challenge Removed:** Removed `challenge` from `contracts.ts`, `api-client.ts`, `auth-provider.tsx`, `register/route.ts`, and `login/route.ts`, with zero challenge UI or fabricated tokens.
3. **International Country Code Picker Implemented:** Added `libphonenumber-js` (`apps/web/lib/phone.ts` + `apps/web/components/auth/phone-country-input.tsx`) with searchable flags, country names, dialing codes (including shared `+1`), keyboard navigation, leading-zero E.164 normalization, and server-side validation/normalization in `POST /api/auth/register`.
4. **Authentication UX Redesigned:** Built unified, responsive, accessible `AuthShell`, `/sign-up`, and `/sign-in` pages using NURVIA's Clinical Precision design system and `<Logo />`.

---

## 2. Acceptance Checklist

- **Registration & Login UX:** Polished, responsive, accessible, challenge-free, with `Password | PIN | Both` (register) and `Password | PIN` + `rememberMe` (login).
- **Country-Code Picker:** Maintained `libphonenumber-js` dataset, E.164 normalization, leading-zero rules, keyboard-accessible searchable dropdown.
- **Security:** `HttpOnly`, `SameSite=Lax`, `Secure` (prod) cookies, CSRF, `no-store`, `415`/`400` validation, server-side `role: 'Learner'` & `dashboardName: 'web'`, 0 matches in 98 `.next/static` files.
- **Verification:** `tsc` (`0` errors), `npm test` (`10/10` suites), `auth-handlers-integration.test.mjs` (`15/15`), `eslint` (`0` errors, 221 pre-existing warnings), `next build` (`0`), Playwright E2E (`6 passed, 1 skipped` for `EXT-3.6-02`).

---

## 3. External Blockers & Next Authorized Action

- **EXT-3.6-01:** Hosted LexmaCasto backend `Challenge` requirement on `POST /api/castoline/auth/register`.
- **EXT-3.6-02:** Authorized NURVIA Learner test account.
- **Next Action:** Review and approve committing and pushing Phase 3.6 changes to `origin/master` for Vercel deployment, and coordinate with the LexmaCasto backend owner to resolve `EXT-3.6-01` and `EXT-3.6-02`.
