# NURVIA Phase 3.6 — Security and Regression Report

**Date:** 2026-11-16  
**Phases:** I & J — Security Regression and Automated Verification  
**Status:** PASS

---

## 1. Automated Verification Summary

| Check | Exact Command | Exit Code | Outcome | Notes |
|---|---|---|---|---|
| **TypeScript** | `.\apps\web\node_modules\.bin\tsc.cmd -p apps/web/tsconfig.json --noEmit` | `0` | **PASS** | 0 errors |
| **Unit & Security Suites** | `npm --prefix apps/web test` | `0` | **PASS (10/10 suites)** | Includes new `phone-country-picker.test.mjs` (10/10 checks) + all 9 existing suites |
| **Auth Handler Integration** | `node apps/web/tests/auth-handlers-integration.test.mjs` | `0` | **PASS (15/15)** | Local mocked backend; includes Test 10 (E.164 normalization, invalid phone `400`, challenge stripping) |
| **ESLint** | `npm --prefix apps/web run lint` | `0` | **PASS** | 0 errors (221 pre-existing warnings; 0 new warnings) |
| **Production Build** | `npm --prefix apps/web run build` | `0` | **PASS** | Clean `next build` after clearing `.next` cache |
| **Playwright Auth E2E** | `$env:E2E_WEB_URL='http://localhost:4197'; npx --prefix apps/web playwright test --config=apps/web/playwright.config.ts tests/e2e/auth-route-remediation.spec.ts` | `0` | **PASS (6 passed, 1 skipped)** | Local `next start -p 4197` + route mocks; credential workflow skipped (`EXT-3.6-02`) |
| **Client Bundle Scan** | `Select-String -Path apps/web\.next\static\**\*` | `0` | **PASS (0 matches)** | 98 static files scanned for `SKEW_LINE_APP_KEY`, `x-site-key`, `x-casto-line`, `x-casto-badge`, `skew8lancasto`, `WEBSITE_1`, `108.61.9.189`, `explicitbackend.com`, cookie/credential names |

---

## 2. Preserved Security Controls

- Server-side `SKEW_LINE_APP_KEY` and `SKEW_LINE_APP_DOMAIN` (`website 11`) identity headers.
- `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookies; zero `localStorage`/`sessionStorage` token storage.
- Same-origin CSRF validation (`validateSameOriginRequest`) on `register`, `login`, `logout`.
- `Cache-Control: no-store`, `Content-Type: application/json` (`415`), plain-object JSON (`400`), `role: 'Learner'` and `dashboardName: 'web'` server enforcement, strict `extractCastoCredentialsFromLogin` CR/LF/control-char rejection, and backend error redaction.
