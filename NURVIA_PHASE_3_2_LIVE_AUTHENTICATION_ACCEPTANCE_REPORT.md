# NURVIA Phase 3.2 — Live Authentication Acceptance Report

**Date:** 2026-11-16  
**Production URL:** `https://nurvia-black.vercel.app`  
**Backend:** `https://explicitbackend.com`

---

## Gate Summary

- **Live Login (G14):** **BLOCKED** — production still serves pre-Phase-1 deployment, and no authorized NURVIA test account (`E2E_AUTH_EMAIL`, `E2E_AUTH_PASSWORD`) is available. (Note: local `next start` -> `https://explicitbackend.com/api/castoline/auth/login` with synthetic invalid credentials returned `401` with `Set-Cookie: null`, confirming server-side site header transmission.)
- **Live Current-User Retrieval (G15):** **BLOCKED** — requires deployed `/api/auth/me` and active authenticated session.
- **Session Persistence (G16):** **BLOCKED** — requires live authenticated session.
- **Local Logout & Session Invalidation (G17):** **BLOCKED** on production (verified locally via `auth-handlers-integration.test.mjs` test 8).
- **Backend Logout Revocation (G18):** **BLOCKED** — requires live authenticated session against `POST /api/castoline/auth/logout/sessions/distinct` with `{ target_dashboard }`.
- **Live Registration (G19):** **BLOCKED** — requires authorized test registration identity (verified against mock backend in `auth-handlers-integration.test.mjs` test 7).
