# NURVIA Phase 3.5 — Security and Regression Report

**Date:** 2026-11-16  
**Scope:** Unit tests, auth handler integration tests, TypeScript, ESLint, production build, and client bundle security scan.

---

## 1. Automated Test & Build Results

| Check | Command | Outcome | Notes |
|---|---|---|---|
| **Unit & Security Suites** | `npm --prefix apps/web test` | **PASS** | All 9 test suites passed (including `remote-api-config`, `lexmacasto-integration`, `lexmacasto-phase2-security`, `auth-route-remediation`). |
| **Auth Handler Integration Suite** | `node apps/web/tests/auth-handlers-integration.test.mjs` | **PASS (14/14)** | Covers CSRF, `Content-Type` `415`, password/PIN/combined registration, PIN mismatch, password/PIN login, `role`/`dashboardName`/`fingerprint` forwarding, `200` without session credentials (`502`), `HttpOnly`/`SameSite=Lax` cookies, `no-store`, `ValidationProblemDetails`, HTML/malformed/leaky backend error redaction, and logout. |
| **TypeScript Typecheck** | `.\apps\web\node_modules\.bin\tsc.cmd -p apps/web/tsconfig.json --noEmit` | **PASS** | Exit code 0, 0 errors. |
| **ESLint** | `npm --prefix apps/web run lint` | **PASS** | Exit code 0, 0 errors (221 pre-existing warnings). |
| **Production Build** | `npm --prefix apps/web run build` | **PASS** | `next build` succeeded cleanly for all routes including `/api/auth/*`. |
| **Playwright Auth E2E** | `E2E_WEB_URL=http://localhost:4197 npx playwright test tests/e2e/auth-route-remediation.spec.ts` | **PASS (3 passed, 1 skipped)** | Unauthenticated `/sign-in`, `/sign-up`, `/learner` redirect, and plain-text 404 error handling passed against NURVIA production server; live authenticated workflow skipped due to `EXT-3.5-02`. |

---

## 2. Production Client Bundle Security Scan

Scanned `apps/web/.next/static/**/*` after `next build` for:
- `SKEW_LINE_APP_KEY`
- `x-site-key`
- `x-casto-line`
- `x-casto-badge`
- `skew8lancasto`
- `WEBSITE_1`
- `108.61.9.189`

**Result:** **0 matches** in client-delivered static bundles.

---

## 3. Retained Security Controls

- Server-only `SKEW_LINE_APP_KEY` and `SKEW_LINE_APP_DOMAIN` (`resolveApplicationIdentity`).
- Server-generated `x-site-*` headers with CRLF sanitization.
- HTTPS enforcement in production (`resolveBackendBaseUrl`).
- `HttpOnly`, `SameSite=Lax`, `Secure` (production) session cookies (`setServerCastoSession`).
- Same-origin CSRF validation (`validateSameOriginRequest`).
- `Cache-Control: no-store` on all authentication responses.
- `Content-Type: application/json` (`415`) and plain-object JSON (`400`) validation on `POST /api/auth/register` and `POST /api/auth/login`.
- Backend error sanitization and redaction (`lexmaCastoRequest`, `parseApiResponse`).
- Zero credential, password, PIN, challenge, or cookie logging.
