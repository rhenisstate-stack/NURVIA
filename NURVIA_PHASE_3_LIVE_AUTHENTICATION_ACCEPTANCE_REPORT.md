# NURVIA Phase 3 — Live Authentication Acceptance Report

**Project:** NURVIA (`apps/web`)  
**Backend Origin:** `https://explicitbackend.com`

---

## 1. Observed Live Authentication Checks

- **Login Endpoint Reachability & Site-Header Acceptance:** `POST /api/castoline/auth/login` with server-side `x-site-key` and `x-site-domain` and synthetic invalid credentials returned `HTTP 401 {"error":"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"}` — confirming the endpoint accepts NURVIA's identity and reaches credential validation.
- **Current-User Endpoint Without Session:** `GET /api/castoline/system/user/list/current?fetchtype=current` returned `HTTP 401 {"error":"Missing Casto authentication headers"}`.

## 2. Internal Authentication & Session Controls Verified Locally

- **HttpOnly Cookie Issuance (`app/api/auth/login/route.ts`, `lib/lexmacasto/session.ts`):** `nurvia_casto_line`, `nurvia_casto_badge`, and `nurvia_casto_dashboard` use `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `secure: process.env.NODE_ENV === 'production'`. Raw `castoLine` and `castoBadge` are stripped by `sanitizeAuthUser()` and never returned in JSON.
- **CSRF & Origin Protection:** `validateSameOriginRequest` rejects cross-site/mismatched `Origin`/`Referer` and missing origin headers on state-changing requests without trusting `X-Forwarded-Host`.
- **Logout & Expiry:** `app/api/auth/logout/route.ts` calls `/api/castoline/auth/logout/sessions/distinct` or `.../relative` with `target_dashboard`, always clears local HttpOnly cookies, and never disguises failed backend revocation as success. `401` on `/api/auth/me` clears local cookies and transitions `AuthProvider` to `unauthenticated`.

## 3. Blocked Live Authenticated Gates (No Authorized NURVIA Test Account Available)

- **G7 (Login successfully verified):** `BLOCKED — EXTERNAL DEPENDENCY` (requires authorized NURVIA test account).
- **G9 (Current-user successfully verified):** `BLOCKED — EXTERNAL DEPENDENCY` (requires active authenticated session).
- **G10 (Session persistence verified):** `BLOCKED — EXTERNAL DEPENDENCY` (requires active authenticated session).
- **G11 (Registration verified where authorized):** `BLOCKED — EXTERNAL DEPENDENCY` (requires approved test registration identity).
- **G12 / G13 / G14 (Logout request, backend revocation, post-logout denial):** `BLOCKED — EXTERNAL DEPENDENCY` (requires active authenticated session).
