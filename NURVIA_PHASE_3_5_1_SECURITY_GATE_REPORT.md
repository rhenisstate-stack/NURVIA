# NURVIA Phase 3.5.1 — Security Gate Report

**Date:** 2026-11-16  
**Gate:** C — Security Review  
**Status:** PASS

---

## 1. C1 — Authentication & Authorization

- **Registration privilege isolation:** `POST /api/auth/register` (`apps/web/app/api/auth/register/route.ts` L136–137) hardcodes `role: 'Learner'` and `dashboardName: 'web'` server-side. Client-supplied roles cannot escalate privileges.
- **Login role handling:** `POST /api/auth/login` (`apps/web/app/api/auth/login/route.ts` L77–78) enforces `role: 'Learner'` and `dashboardName: 'web'` server-side, preventing caller-controlled authorization context manipulation.
- **Credential validation parity:** Password (`>= 12` chars, confirmation match) and PIN (`/^\d{4,12}$/`, confirmation match) validation are enforced server-side in `register/route.ts` and `login/route.ts` regardless of client-side UI checks.
- **Fail-closed session handling:** `GET /api/auth/me` returns `401` when `nurvia_casto_line` or `nurvia_casto_badge` is missing, and clears cookies on `401` or invalid user DTOs. `POST /api/auth/login` returns `502` (`UNEXPECTED_RESPONSE`) and sets no cookies if backend `200` lacks valid `castoLine`/`castoBadge` or `user`.

---

## 2. C2 — Cookie & Session Security

- **Attributes (`apps/web/lib/lexmacasto/session.ts`):**
  - `HttpOnly: true` on `nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`.
  - `Secure: process.env.NODE_ENV === 'production'`.
  - `SameSite: 'lax'`, `Path: '/'`.
- **Persistence (`rememberMe`):**
  - `rememberMe !== false` sets `maxAge: 604800` (7 days).
  - `rememberMe === false` omits `maxAge` (browser session cookie).
- **Logout & clearing:** `clearServerCastoSession` sets `maxAge: 0` and `expires: new Date(0)` on all three cookies. `POST /api/auth/logout` always clears local cookies even if backend revocation fails, while still surfacing backend failure status.
- **Zero JS token exposure:** `sanitizeAuthUser` strips `castoLine` and `castoBadge` before returning `AuthUserDto`.

---

## 3. C3 — CSRF & Request Integrity

- **Same-origin CSRF guard (`validateSameOriginRequest`):** Enforced on `POST /api/auth/register`, `POST /api/auth/login`, and `POST /api/auth/logout`.
  - Rejects `Sec-Fetch-Site: cross-site`.
  - Validates `Origin` or `Referer` host against `host` (`request.headers.get('host') || request.nextUrl.host`) without trusting `X-Forwarded-Host`.
  - Fails closed (`403`, `errorCode: 'FORBIDDEN'` on login/register) when `Origin`, `Referer`, and `Sec-Fetch-Site: same-origin` are absent.
- **Server-owned site headers (`lexmaCastoRequest`):** `siteHeaders` and `authHeaders` are merged *after* `options.headers`, ensuring caller-supplied headers cannot override `x-site-key`, `x-site-domain`, `x-casto-line`, or `x-casto-badge`.

---

## 4. C4 — Secret & Logging Protection Scan

Scanned `apps/web/app`, `apps/web/lib`, and `apps/web/components` for `SKEW_LINE_APP_KEY`, `x-site-key`, `x-casto-line`, `x-casto-badge`, `skew8lancasto`, `WEBSITE_1`, `108.61.9.189`, and `explicitbackend.com`:

| File | Finding Category | Assessment |
|---|---|---|
| `apps/web/lib/api-config.mjs` | Env var lookup (`SKEW_LINE_APP_KEY` L100, L107, L174) & comment (`WEBSITE_1` L94) | Safe (server-only env resolution; no hardcoded secret) |
| `apps/web/lib/lexmacasto/client.ts` | Redaction regex (`SENSITIVE_BACKEND_MESSAGE_PATTERN` L86) | Safe (server-only redaction filter) |
| `apps/web/lib/lexmacasto/headers.ts` | Header constants & redaction sets (L28–30, L45–47, L63, L78, L107, L115–116) | Safe (server-only header builder) |
| `apps/web/lib/lexmacasto/session.ts` | Comment (L3) | Safe (documentation only) |

- **Console logging check:** `0` `console.log`/`info`/`warn`/`error`/`debug` calls found in `apps/web/app/api/auth/**` or `apps/web/lib/lexmacasto/**`.
- **No Qlex credentials or challenge strings (`skew8lancasto`)** exist anywhere in `apps/web/app`, `apps/web/lib`, or `apps/web/components`.

---

## 5. C5 — Production Configuration Check

- `apps/web/.env.example` defines non-secret template names: `SKEW_LINE_APP_NAME`, `SKEW_LINE_APP_TITLE`, `SKEW_LINE_APP_DOMAIN`, `SKEW_LINE_APP_KEY`, `SKEW_LINE_ACTIVE_BACKEND`, `SKEW_LINE_DOTNET_BASE_URL`.
- `apps/web/.env.local` exists locally (430 bytes, git-ignored, values not printed).
- `resolveBackendBaseUrl` enforces `https://` when `NODE_ENV === 'production'`.
- `resolveApplicationIdentity` fails closed (`MISSING_APP_KEY`, `MISSING_APP_DOMAIN`, `INVALID_APP_IDENTITY`) if NURVIA's dedicated identity is missing or malformed.

---

## 6. Gate C Conclusion

**PASS** — Zero critical or high-severity security issues remain.
