# NURVIA Phase 3.1 — Security Regression Report

**Date:** 2026-11-16  
**Repository:** `C:\Users\gitau\Documents\NURVIA`

---

## 1. Security Controls Verified

| Check | Result | Evidence |
|---|---|---|
| No application key in client code or `.next/static` | **PASS** | `Select-String` across `.next/static/**/*.js` for `website 11`, `SKEW_LINE_APP_KEY`, `x-casto-line`, `x-casto-badge`, `x-site-key`, `/api/backend/auth/me`, `/api/backend/auth/csrf`, `WEBSITE_1` -> **0 matches**. |
| `PROXY_ROUTE_RULES`, `matchProxyRoute`, RBAC, body limits, content-type, traversal | **PASS** | `node tests/lexmacasto-phase2-security.test.mjs` (8/8 PASS). |
| Same-origin CSRF (`validateSameOriginRequest`) | **PASS** | Foreign `Origin`, missing `Origin`/`Referer`, and `Sec-Fetch-Site: cross-site` rejected with `403` in `auth-handlers-integration.test.mjs` test 4. Does not trust `X-Forwarded-Host`. |
| `Cache-Control: no-store` on auth routes | **PASS** | Verified on `/api/auth/config-status`, `/api/auth/me` (200 & 401 & errors), `/api/auth/login`, `/api/auth/logout`. |
| `HttpOnly`, `SameSite=Lax` cookies & no Casto token leakage | **PASS** | Verified in `auth-handlers-integration.test.mjs` test 5. |
| No `/api/backend/auth/me` or `/api/backend/auth/csrf` in proxy | **PASS** | Both return `404` in `auth-handlers-integration.test.mjs` test 3. |
| Error redaction (`parseApiResponse` & `lexmaCastoRequest`) | **PASS** | Verified in `auth-route-remediation.test.mjs` tests 3–5 and `auth-handlers-integration.test.mjs` test 9. |
