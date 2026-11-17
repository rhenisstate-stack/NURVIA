# NURVIA Phase 3.8 — Authentication and Session Report

- **Preserved Core Auth Routes:** `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/config-status`.
- **Added Verified Account Routes:** `/api/auth/account/destroy` (server-verified `guidId`/`email` + cookie clearing) and `/api/auth/validate` (support token validation).
- **Session Architecture:** Strictly server-side `HttpOnly`, `SameSite=Lax`, production `Secure` cookies (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`). Qlex's `document.cookie` session storage (`skew_blanc_session_line`, `skew_blanc_session_badge`) was **rejected**.
- **Deslizar Challenge Status:** Remains explicitly **BLOCKED** (`CHALLENGE_REQUIRED` on register, `CHALLENGE_REJECTED` / `"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"` on login) pending backend owner provisioning for `website 11`. Zero hardcoded or fabricated challenge strings exist in NURVIA.
