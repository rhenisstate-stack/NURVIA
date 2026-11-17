# NURVIA Phase 3.8 — Session Integration Report

- **Cookies:** `nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard` (`httpOnly: true`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'`, `path: '/'`).
- **Credential Extraction:** `extractCastoCredentialsFromLogin()` extracts `castoLine` and `castoBadge` server-side and validates against CRLF/control chars. `sanitizeAuthUser()` strips them before returning `AuthUserDto` to the browser.
- **Session Restoration:** `AuthProvider` calls `GET /api/auth/me` → `/api/castoline/system/user/list/current?fetchtype=current`. Unauthenticated requests return `401`; invalid/expired upstream `401` responses clear local `HttpOnly` cookies.
- **Rejected Qlex Pattern:** Qlex's `document.cookie` storage (`skew_blanc_session_line`, `skew_blanc_session_badge`) is completely excluded.
