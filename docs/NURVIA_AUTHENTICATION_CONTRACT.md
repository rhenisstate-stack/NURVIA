# NURVIA — Authentication Contract

**Date:** 2026-11-15  
**Target Remote Backend:** `http://108.61.9.189:8008` (`https://explicitbackend.com`)

---

## 1. Existing NURVIA Frontend Authentication Architecture

Inspected `apps/web/components/auth/auth-provider.tsx` and `apps/web/lib/api-client.ts`:
- **Transport:** `fetch(..., { credentials: 'include', cache: 'no-store' })` via Next.js rewrite `/api/backend/*`.
- **Session Model:** HttpOnly cookie-based session (no `localStorage` token storage).
- **CSRF Protection:** Mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) fetch a token from `GET /api/auth/csrf` and attach `X-CSRF-TOKEN`.
- **Endpoints Used by Existing Frontend:**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `GET /api/auth/csrf`
  - `PUT /api/auth/profile`

---

## 2. Remote Backend (`LexmaCasto`) Authentication Findings

| Operation | Remote Route Probed | Observed Status | Verified Contract Notes |
|---|---|---|---|
| NURVIA Legacy Auth | `GET /api/auth/csrf`, `GET /api/auth/me`, `POST /api/auth/login` | `302 -> /web/restoration/lost` | These routes do not exist on `108.61.9.189:8008` |
| Castoline Login | `POST /api/castoline/auth/login` | `400 {"error":"Missing site headers"}` | Route exists; requires site headers before body/credential validation |
| Castoline Register | `POST /api/castoline/auth/register` | `400 {"error":"Missing site headers"}` | Route exists; requires site headers |
| Razor Login UI | `GET /web/auth/absolute/login` | `200 OK` | Server-rendered Razor login page (`Master Bank`) |
| Razor Register UI | `GET /web/auth/absolute/register` | `200 OK` | Server-rendered Razor registration page (`Master Bank`) |

---

## 3. Unverified Authentication Details (Blocked on Backend Owner)

1. **Request/Response Schemas:** Exact JSON fields for `POST /api/castoline/auth/login` and `POST /api/castoline/auth/register` (cannot be observed while gated by `Missing site headers` and without OpenAPI).
2. **Token / Cookie Mechanism:** Whether `/api/castoline/auth/login` issues HttpOnly cookies, JWT bearer tokens, or both, and how refresh/session expiration works.
3. **Current-User & Logout Routes:** Exact routes for current-user retrieval, logout, and CSRF (if cookie-based).
4. **Permissions & Claims:** Role/permission structure returned for NURVIA learners vs. staff/admins.
