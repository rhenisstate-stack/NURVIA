# NURVIA Phase 3.4 — Test and Security Report

**Date:** 2026-11-16  
**Scope:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Automated Verification Results (Post-Final Edit)

| Check | Command | Result | Notes |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | **PASS** (exit 0) | 0 type errors |
| ESLint | `npm run lint` | **PASS** (exit 0) | 0 errors (221 pre-existing warnings) |
| Unit & Security Suites | `npm test` | **PASS** (exit 0) | All 9 test scripts passed (navigation, learning, renderers, hero, remote-api-config, calculators, lexmacasto-integration, lexmacasto-phase2-security, auth-route-remediation) |
| Auth Route Handler Integration | `node tests/auth-handlers-integration.test.mjs` | **PASS** (12/12) | Covers `config-status`, `me`, `/api/backend/auth/*` 404, CSRF, `LoginProvider: 'email'`, `provider: 'email'`, `loginMethod` validation, `ValidationProblemDetails`, redaction, `logout` |
| Production Build | `npm run build` | **PASS** (exit 0) | Next.js 15.5.29 production build succeeded |
| Client Bundle Secret Scan | `findstr /s /i /m "SKEW_LINE_APP_KEY WEBSITE_1 x-site-key x-casto-line x-casto-badge skew8lancasto" *.js` in `.next/static` | **PASS** (0 matches) | Zero secrets, internal headers, or Qlex-Nursing identifiers in client JS |
| Playwright Auth E2E | `npx playwright test tests/e2e/auth-route-remediation.spec.ts` (against local `next start -p 3000`) | **3 passed, 1 skipped** | Tests 1–3 passed; Test 4 skipped (`E2E_AUTH_EMAIL`/`E2E_AUTH_PASSWORD` not provisioned) |

---

## 2. Security Boundary Revalidation

1. `SKEW_LINE_APP_KEY` remains server-only (`process.env`, never `NEXT_PUBLIC_*`, never in `.next/static`).
2. `x-site-key` and `x-site-domain` are server-owned and override caller headers in `lexmaCastoRequest`.
3. `x-casto-line` and `x-casto-badge` are stored only in `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookies — never JS-readable cookies (unlike Qlex-Nursing).
4. Passwords, PINs, challenge tokens, and Casto headers are never logged.
5. `Cache-Control: no-store` is enforced on `/api/auth/config-status`, `/api/auth/me`, `/api/auth/login`, `/api/auth/register`, and `/api/auth/logout`.
6. Same-origin CSRF validation (`validateSameOriginRequest`) is enforced on all auth mutations.
7. `role: 'Learner'` is server-enforced on public registration (`/api/auth/register`).
8. No open proxy, no unsupported `/csrf` or `/refresh` endpoint, no Qlex-Nursing `WEBSITE_1` key/challenge reuse, and no challenge bypass.
