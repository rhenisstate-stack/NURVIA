# QLEX_06 — SESSION AND IDENTITY AUDIT

## 1. Session Storage & Cookie Configuration
- **Auth Cookies:** `skew_blanc_session_badge` and `skew_blanc_session_line` (JSON map `{ [badge]: line }`) are written **client-side** via `document.cookie` in `generateSystemUserSessionCookies.ts` (lines 14-32, 69-73).
- **Security Flags:** `SameSite=Strict`, `expires=1 day`, `Secure` only when `NODE_ENV === "production"`, and **NOT `HttpOnly`** (readable by any JavaScript running in the origin).
- **Middleware Cookie:** `src/middleware.ts` sets `x-site-session` (`httpOnly: true, sameSite: "lax", path: "/"` — missing `Secure` flag).
- **Header Forwarding:** `renderSystemSessionHeaders()` reads `document.cookie` and attaches `x-casto-line` and `x-casto-badge` to every `apiFetch()` call.

## 2. Session Restoration & Route Protection
- **Session Check:** `session.check()` calls `GET /api/auth/session` -> `GET {backend}/api/castoline/auth/system/user`.
  - **Defect (`P1`):** When unauthenticated, `GET /api/auth/session` returns **HTTP 500** (`{"logged_in":false}`) instead of `200`/`401`.
- **Current User:** `useCurrentSystemUser()` calls `GET /api/users/user?fetchtype=current` -> returns **HTTP 401** (`{ error: "Missing Casto authentication headers" }`) when unauthenticated.
- **Protected Routes:** `src/middleware.ts` performs **zero** authentication or role checks. Protected pages (dashboards, profile, results) render client-side and rely on `useCurrentSystemUser()` returning `null` to show a login prompt or modal.
- **Logout:** `dynamicLogoutService()` (`src/lib/services/auth/logoutService.ts`) posts to `/api/auth/logout` (`distinct` or `relative` session) and clears `skew_blanc_session_line` and `skew_blanc_session_badge` in `finally`.
- **Token Logging (`P1`):** `src/app/api/auth/session/route.ts` and `src/app/api/users/user/route.ts` log `castoLine` and `castoBadge` to server console.
