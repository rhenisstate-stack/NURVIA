# NURVIA Phase 3.5 — Test and Regression Report

**Date:** 2026-11-16  
**Scope:** Full regression, auth integration, frontend E2E, typecheck, lint, build, and client bundle security scan after final edits.

---

## 1. Execution Summary

| Check | Command | Outcome | Details |
|---|---|---|---|
| **Unit & Security Suites** | `npm --prefix apps/web test` | **PASS (9/9 suites)** | `navigation-and-carousel`, `learning-integration`, `question-renderers`, `hero-redesign`, `remote-api-config`, `calculators`, `lexmacasto-integration`, `lexmacasto-phase2-security`, `auth-route-remediation`. |
| **Auth Handler Integration** | `node apps/web/tests/auth-handlers-integration.test.mjs` | **PASS (14/14)** | Covers CSRF, `415` Content-Type, password/PIN/combined registration, PIN mismatch, non-numeric PIN, password/PIN login, `rememberMe: false` session cookie, server-enforced `role: 'Learner'` & `dashboardName: 'web'`, `200` without session creds (`502`), `ValidationProblemDetails`, HTML/malformed/leaky redaction, `/api/auth/me`, and `/api/auth/logout`. |
| **TypeScript** | `.\apps\web\node_modules\.bin\tsc.cmd -p apps/web/tsconfig.json --noEmit` | **PASS** | 0 errors. |
| **ESLint** | `npm --prefix apps/web run lint` | **PASS** | 0 errors (221 pre-existing warnings). |
| **Production Build** | `npm --prefix apps/web run build` | **PASS** | `next build` completed cleanly. |
| **Client Bundle Scan** | `Select-String -Path apps/web\.next\static\**\*` | **PASS (0 matches)** | Zero occurrences of `SKEW_LINE_APP_KEY`, `x-site-key`, `x-casto-line`, `x-casto-badge`, `skew8lancasto`, `WEBSITE_1`, or `108.61.9.189`. |
| **Playwright Auth E2E** | `E2E_WEB_URL=http://localhost:4197 npx playwright test tests/e2e/auth-route-remediation.spec.ts` | **PASS (5 passed, 1 skipped)** | Verified unauthenticated `/sign-in` & `/sign-up`, `/learner` redirect, plain-text 404 handling, `/sign-up` Password/PIN/Both switching + mobile viewport + PIN payload, `/sign-in` Password/PIN switching + `rememberMe` + payload. Live credential test skipped (`EXT-3.5-02`). |
