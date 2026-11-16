# NURVIA Phase 3.1 — Browser E2E Report

**Date:** 2026-11-16  
**Spec:** `apps/web/tests/e2e/auth-route-remediation.spec.ts`  
**Target:** Local production build (`http://localhost:4197` via `next start -p 4197`)

---

## Execution Summary

- **Command:** `npx playwright test tests/e2e/auth-route-remediation.spec.ts` (with `E2E_WEB_URL=http://localhost:4197`)
- **Result:** **3 passed, 1 skipped, 0 failed** (8.7s)

| Scenario | Status | Verified Behavior |
|---|---|---|
| Unauthenticated `/sign-in` & `/sign-up` | **PASS** | Calls `GET /api/auth/me` (`401`, `Cache-Control: no-store`); 0 requests to `/api/backend/auth/me`, `/api/backend/auth/csrf`, or `/api/auth/csrf`. |
| Protected `/learner` route when unauthenticated | **PASS** | Redirects to `/sign-in`. |
| Plain-text 404 on `/api/auth/login` (Vercel-style error) | **PASS** | Displays controlled form alert (`The requested service endpoint was not found.`); no `"Unexpected token"` crash and no `DNS_HOSTNAME_RESOLVED_PRIVATE` leak. |
| Authenticated workflow (login, `/api/auth/me`, reload, multi-tab, logout, post-logout denial) | **SKIPPED (BLOCKED)** | Skipped because `E2E_AUTH_EMAIL` and `E2E_AUTH_PASSWORD` are not available. |
