# NURVIA Phase 3.8 — Test and Verification Report

**Date:** `2026-11-17`  
**Branch:** `feature/phase-3-8-qlex-api-parity`  
**Working Directory:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Static Verification & Build

| Check | Command | Result | Notes |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | **PASS** (exit `0`) | 0 type errors |
| ESLint | `npm run lint` | **PASS** (exit `0`) | 0 errors (221 pre-existing warnings) |
| Production Build | `$env:SKEW_LINE_DOTNET_BASE_URL="https://explicitbackend.com"; npm run build` | **PASS** (exit `0`) | Compiled & generated all routes cleanly; `http://` in `.env.local` correctly rejected by `INSECURE_PRODUCTION_ORIGIN` guard unless `https://` origin is supplied |

---

## 2. Automated Unit & Security Test Suites (`npm test` — 12 Suites)

All **12** test suites passed (`exit 0`):

1. `tests/navigation-and-carousel.test.mjs` — **9/9 PASS**
2. `tests/learning-integration.test.mjs` — **8/8 PASS**
3. `tests/question-renderers.test.mjs` — **7/7 PASS**
4. `tests/hero-redesign.test.mjs` — **6/6 PASS**
5. `tests/remote-api-config.test.mjs` — **8/8 PASS**
6. `tests/calculators.test.mjs` — **9/9 PASS**
7. `tests/lexmacasto-integration.test.mjs` — **9/9 PASS**
8. `tests/lexmacasto-phase2-security.test.mjs` — **8/8 PASS**
9. `tests/auth-route-remediation.test.mjs` — **7/7 PASS**
10. `tests/phone-country-picker.test.mjs` — **10/10 PASS**
11. `tests/phase-3-7-auth-error-and-security.test.mjs` — **5/5 PASS**
12. `tests/phase-3-8-api-parity.test.mjs` — **8/8 PASS**

---

## 3. Live Hosted Backend Probes (Non-Destructive)

Verified on `2026-11-17` against `https://explicitbackend.com`:
- `GET /api/castoline/strata/seek/suggest?q=nclex` → `401` (`Access Denied, Kindly Log In ⚓`)
- `GET /api/castoline/strata/seek/absolute?q=nclex` → `400` (`Query` field required)
- `GET /api/castoline/strata/seek/distinct` → `400` (`Query` field required)
- `GET /api/castoline/strata/seek/history` → `200` (`{"success":true,"data":[]}`)
- `POST /api/castoline/strata/assessment/exams/diy/learning/store` (`{}`) → `400` (`Title`, `TotalQuestions` required)
- `POST /api/castoline/auth/account/destroy` (`{}`) → `400` (`GuidId`, `Reason` required)
- `GET /api/castoline/strata/support/validate` → `400` (`token`, `context` required)
- `GET /api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute` → `200`
- `POST /api/castoline/strata/learning/courses/store` (`{}`) → `400` (`Name`, `Type`, `Target` required)
