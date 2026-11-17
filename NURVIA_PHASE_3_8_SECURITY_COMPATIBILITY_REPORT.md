# NURVIA Phase 3.8 — Security Compatibility Report

All Phase 3.8 routes enforce NURVIA's mandatory security controls:
- **Application Identity Isolation:** `website 11` (`SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`) remains server-only; zero Qlex `WEBSITE_1` or `skew8lancasto` artifacts exist.
- **HttpOnly Cookies:** `nurvia_casto_line` and `nurvia_casto_badge` are never returned to browser JS.
- **Same-Origin CSRF:** `validateSameOriginRequest()` enforced on all `POST`, `PUT`, `DELETE` handlers (`/api/seek`, `/api/exams/diy`, `/api/auth/account/destroy`, `/api/strata/[resource]`).
- **Server-Side Authorization:**
  - `/api/strata/[resource]` `POST`/`PUT`/`DELETE` verify `STAFF_ROLES` via `/api/castoline/system/user/list/current?fetchtype=current`.
  - `/api/auth/account/destroy` verifies caller's own `guidId` and `email` server-side (prevents IDOR account deletion).
  - `/api/seek` requires authentication for `suggest` and `history`.
- **No Sensitive Logging:** Zero `console.log` of passwords, PINs, tokens, or keys.
- **Rejected Qlex Routes:** `system/backends`, `users/seed`, unguarded `system/*`, unguarded `auth/support/*`, `auth/social/*`, `auth/session`, and `media/[...path]` remain excluded.
