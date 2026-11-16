# NURVIA Phase 3.5 — Session and Cookie Security Report

**Date:** 2026-11-16  
**Scope:** `apps/web/lib/lexmacasto/session.ts`, `apps/web/lib/lexmacasto/client.ts`, `apps/web/app/api/auth/me/route.ts`, `apps/web/app/api/auth/logout/route.ts`.

---

## 1. Cookie & Session Controls

- **Cookies Managed:** `nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`.
- **Attributes:** `HttpOnly: true`, `SameSite: 'lax'`, `Path: '/'`, `Secure: true` when `NODE_ENV === 'production'`.
- **Persistence (`rememberMe`):**
  - When `rememberMe !== false` (default): `maxAge = 604800` (7 days).
  - When `rememberMe === false`: `maxAge` omitted (browser session cookie cleared on browser close).
- **Zero JS Exposure:** `extractCastoCredentialsFromLogin` extracts `castoLine`/`castoBadge` server-side and `sanitizeAuthUser` strips them before returning `AuthUserDto` to browser JavaScript.
- **Credential Validation:** `extractCastoCredentialsFromLogin` rejects values containing CR/LF/control characters and bounds them via `sanitizeHeaderValue(..., 2048)`.

---

## 2. Current-User, CSRF, and Logout

- **Current User (`GET /api/auth/me`):** Calls `GET /api/castoline/system/user/list/current?fetchtype=current` with server-attached `x-site-*`, `x-casto-line`, and `x-casto-badge` headers; clears cookies on `401`; sets `Cache-Control: no-store`.
- **CSRF (`validateSameOriginRequest`):** Enforced on all state-changing routes (`POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`); checks `Sec-Fetch-Site`, `Origin`, and `Referer` against `host` without trusting `X-Forwarded-Host`.
- **Logout (`POST /api/auth/logout`):** Calls `/api/castoline/auth/logout/sessions/distinct` (or `relative`) with `{ target_dashboard }` and always clears local `HttpOnly` cookies (`maxAge: 0`, `expires: 1970-01-01`).
