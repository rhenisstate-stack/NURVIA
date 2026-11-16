# NURVIA Phase 3.2 — Security Regression Report

**Date:** 2026-11-16  
**Commit Verified:** `6ed4ad7` (`apps/web`)

---

## Security Checks

- **Client Bundle Secret & Stale-Route Scan (`.next/static/**/*.js`):** **PASS** — 0 matches for `website 11`, `SKEW_LINE_APP_KEY`, `x-casto-line`, `x-casto-badge`, `x-site-key`, `/api/backend/auth/me`, `/api/backend/auth/csrf`, `WEBSITE_1`.
- **Phase 2 Adversarial Security Suite (`tests/lexmacasto-phase2-security.test.mjs`):** **PASS** (8/8) — proxy allowlist, RBAC, body limits, content-type, traversal protection, no open rewrites, CSRF `X-Forwarded-Host` rejection, server-owned headers, `no-store`.
- **Phase 3 Contract Suite (`tests/lexmacasto-integration.test.mjs`):** **PASS** (9/9).
- **Phase 3.1 Auth Unit & Integration Suites:** **PASS** (`auth-route-remediation.test.mjs` 7/7; `auth-handlers-integration.test.mjs` 9/9).
- **Git History Secret Check:** No application keys, `.env.local`, or credentials committed.
