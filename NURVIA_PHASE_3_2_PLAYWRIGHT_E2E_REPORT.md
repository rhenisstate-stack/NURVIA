# NURVIA Phase 3.2 — Playwright E2E Report

**Date:** 2026-11-16  
**Spec:** `apps/web/tests/e2e/auth-route-remediation.spec.ts`

---

## 1. Live Production Run (`E2E_WEB_URL=https://nurvia-black.vercel.app`)

- **Result:** **3 failed, 1 skipped**
  1. Unauthenticated `/sign-in` & `/sign-up`: **FAIL** (timed out waiting for `GET /api/auth/me`; stale site still calls `/api/backend/auth/me`).
  2. Protected `/learner` redirect: **FAIL** (timed out waiting for `/sign-in` redirect).
  3. Plain-text 404 error handling on login: **FAIL** (observed `"Unexpected token 'T', \"The page c\"... is not valid JSON"` from stale client bundle).
  4. Authenticated workflow: **SKIPPED** (`E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` not provided).

## 2. Local Production Build Run (`E2E_WEB_URL=http://localhost:4197`)

- **Result:** **3 passed, 1 skipped** (8.6s)
  1. Unauthenticated `/sign-in` & `/sign-up` use `/api/auth/me` (`401`, `no-store`) and never call `/api/backend/auth/me`, `/api/backend/auth/csrf`, or `/api/auth/csrf`: **PASS**
  2. Protected `/learner` redirects to `/sign-in`: **PASS**
  3. Plain-text 404 on `/api/auth/login` displays controlled alert without JSON parse crash: **PASS**
  4. Authenticated workflow: **SKIPPED** (`E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` not provided).
