# NURVIA Phase 3.7 — Security Review

**Scope:** Unsafe Qlex patterns identified during forensic extraction vs. NURVIA security controls.

---

## 1. Critical Qlex Vulnerabilities Rejected from Migration

1. **JavaScript-Readable Authentication Cookies (`CWE-1004` / XSS Token Theft):**
   - `Qlex/src/lib/utils/sessions/generateSystemUserSessionCookies.ts` writes `skew_blanc_session_badge` and `skew_blanc_session_line` via `document.cookie` without `HttpOnly`.
   - `Qlex/src/app/api/auth/login/route.ts` returns `casto_badge` and `casto_line` in the JSON response body to browser JavaScript.
   - **NURVIA Control:** `nurvia_casto_line` and `nurvia_casto_badge` are strictly `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookies managed only on the server (`apps/web/lib/lexmacasto/session.ts`). Raw Casto credentials are stripped by `sanitizeAuthUser()`.

2. **Sensitive Credential & Token Logging (`CWE-532`):**
   - Qlex route handlers (`auth/login`, `auth/register`, `auth/recovery/password`, `auth/session`, `users/user`) call `console.log` on request bodies (plaintext `password`, `pin`) and response bodies (`castoLine`, `castoBadge`).
   - **NURVIA Control:** NURVIA never logs raw request/response bodies and provides `redactHeadersForLog()` / `redactPayloadForLog()` in `apps/web/lib/lexmacasto/headers.ts`.

3. **Hardcoded / Fabricated Challenge Values:**
   - Qlex hardcodes `"register-skew8@lancasto"`, `"learner.login.skew8lancasto"`, and `"custom.login.skew8lancasto"` across all client auth pages.
   - **NURVIA Control:** Zero hardcoded challenge strings. Deslizar integration remains explicitly `BLOCKED` until official backend provisioning for `website 11`.

4. **Missing CSRF Protection on Mutations (`CWE-352`):**
   - Qlex API routes do not validate `Origin`, `Referer`, or `Sec-Fetch-Site`.
   - **NURVIA Control:** `validateSameOriginRequest()` is enforced on all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).

5. **Client-Controlled Privilege & Dashboard Escalation:**
   - Qlex `auth/register` and `auth/login` trust client-supplied `role` and `dashboardName`.
   - **NURVIA Control:** Public `/api/auth/register` and `/api/auth/login` enforce `role: 'Learner'` and `dashboardName: 'web'` server-side.

6. **Unauthenticated Admin, Seed & Info-Disclosure Endpoints:**
   - Qlex exposes `system/backends/route.ts` (backend URLs), `users/seed/route.ts` (developer seeding), and unguarded `system/{license,privilege,role}/route.ts`.
   - **NURVIA Control:** `/api/auth/config-status` exposes only boolean flags; `/api/backend/[...path]` enforces `PROXY_ROUTE_RULES` and server-verified `STAFF_ROLES`.

7. **SSRF / Path Traversal in Catch-All Media Proxy:**
   - Qlex `media/[...path]/route.ts` joins `path` segments without traversal validation.
   - **NURVIA Control:** `api/avatar/[storageKey]/route.ts` enforces `SAFE_STORAGE_KEY_REGEX` and `..` rejection.

---

## 2. Safe NURVIA Enhancements Approved for Phase 3.7 (Stage 8)

1. **Granular Authentication & Challenge Error Classification (`lib/lexmacasto/client.ts`):**
   - Distinguish `CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, `CHALLENGE_EXPIRED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `BACKEND_ERROR`, `NETWORK_ERROR`, `TIMEOUT`.
   - Preserve safe upstream error distinction to the frontend without leaking internal URLs, stack traces, keys, or tokens.
2. **Consistent `errorCode: 'VALIDATION_ERROR'` on `/api/auth/login`:**
   - Align `app/api/auth/login/route.ts` local validation responses with `register/route.ts`.
3. **Optional Sanitized Geo/Device Site Metadata (`lib/lexmacasto/client.ts`):**
   - Safely extract `x-vercel-ip-country` / `cf-ipcountry`, `x-vercel-ip-city`, and `sec-ch-ua-mobile` in `extractSiteMetadataFromRequestHeaders()` using `sanitizeHeaderValue()`.
4. **Frontend Error Distinction (`app/sign-in/page.tsx`, `app/sign-up/page.tsx`):**
   - Surface clear, accurate messages for `CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, `CHALLENGE_EXPIRED`, `INVALID_CREDENTIALS`, `BACKEND_ERROR`/`NETWORK_ERROR`/`TIMEOUT` without masking the actual integration blocker.
