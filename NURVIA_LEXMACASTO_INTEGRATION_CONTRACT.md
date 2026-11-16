# NURVIA — LexmaCasto Integration Contract Reference

**Project:** NURVIA (`apps/web`)  
**Verified Backend Origin:** `https://explicitbackend.com`  
**Contract Baseline:** Qlex-Nursing Phase 9 — LexmaCasto Backend Contract Discovery  
**Status:** Implemented in `apps/web` (server-side proxy & Next.js Route Handlers); awaiting dedicated `SKEW_LINE_APP_KEY` provisioning from backend owner for live authenticated verification.

---

## 1. Backend Origin & Transport Security

- **Production Origin:** `https://explicitbackend.com` (verified via TLS).
- **Deprecated Origin:** `http://108.61.9.189:8008` (rejected in production).
- **Resolver:** `apps/web/lib/api-config.mjs` (`resolveBackendBaseUrl`, `validateServerConfiguration`).
  - Fails closed if `SKEW_LINE_DOTNET_BASE_URL` is missing, malformed, uses `<...>` placeholder, or uses non-HTTP/HTTPS protocol.
  - Rejects `http://` when `NODE_ENV === 'production'` or `requireHttps: true` (`INSECURE_PRODUCTION_ORIGIN`).
  - `apps/web/next.config.mjs` enforces `requireHttps: process.env.NODE_ENV === 'production'` at startup.

## 2. Application Identity & Required Site Headers

- **Server-Only Environment Variables:**
  - `SKEW_LINE_APP_KEY` (required, never exposed to browser JS or `NEXT_PUBLIC_*`)
  - `SKEW_LINE_APP_DOMAIN` (required, e.g. `https://nurvia-black.vercel.app`)
  - `SKEW_LINE_APP_NAME` / `SKEW_LINE_APP_TITLE` (optional metadata, defaults to `Nurvia`)
- **Required Headers (attached server-side by `apps/web/lib/lexmacasto/headers.ts`):**
  - `x-site-key`
  - `x-site-domain`
- **Optional Sanitized Metadata Headers:**
  - `x-site-name`, `x-site-path`, `x-site-ip-address`, `x-site-location`, `x-site-country`, `x-site-brouser` (preserves backend spelling), `x-site-time`, `x-site-referrer`, `x-site-mobile`, `x-site-request-id`, `x-site-session-id`.
- **Fail-Closed Behavior:** `resolveApplicationIdentity` throws `BackendConfigurationError` (`MISSING_APP_KEY` / `MISSING_APP_DOMAIN`) and never falls back to Qlex-Nursing (`WEBSITE_1`) or any hardcoded key.

## 3. Authentication Contract

- **Custom Auth Headers (Server-to-Backend):**
  - `x-casto-line`
  - `x-casto-badge`
  - Not `Authorization: Bearer <JWT>`.
- **Session Storage (Browser-to-NURVIA):**
  - Server-managed `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (in production) cookies:
    - `nurvia_casto_line`
    - `nurvia_casto_badge`
    - `nurvia_casto_dashboard`
  - Raw `castoLine` and `castoBadge` are stripped by `sanitizeAuthUser()` and never returned to browser JavaScript.
- **CSRF Protection:**
  - LexmaCasto `/api/castoline/auth/csrf` and `/api/castoline/auth/refresh` are unsupported (HTTP 302). NURVIA does not call them.
  - NURVIA's state-changing Next.js Route Handlers enforce same-origin validation (`validateSameOriginRequest`) checking `Sec-Fetch-Site`, `Origin`, and `Referer` against the host.

### Endpoints

| Operation | NURVIA Route Handler | LexmaCasto Backend Endpoint | Method | Mandatory Query / Body |
|---|---|---|---|---|
| Login | `POST /api/auth/login` | `/api/castoline/auth/login` | `POST` | `email`, `loginMethod`, `password` or `pin`, optional `LoginProvider`, `challenge`, `fingerprint`, `ipAddress`, `dashboardName` |
| Register | `POST /api/auth/register` | `/api/castoline/auth/register` | `POST` | `username`, `email`, `loginMethod`, `agree`, `password`/`passwordConfirmation` or `pin`/`pinConfirmation`, optional `phone`, `provider`, `providerPayload`, `challenge`; `role` constrained to `Learner` |
| Current User | `GET /api/auth/me` | `/api/castoline/system/user/list/current` | `GET` | Query `fetchtype=current` |
| Logout (Distinct) | `POST /api/auth/logout` | `/api/castoline/auth/logout/sessions/distinct` | `POST` | Body `{ target_dashboard }` |
| Logout (Relative) | `POST /api/auth/logout` (`scope: 'relative'`) | `/api/castoline/auth/logout/sessions/relative` | `POST` | Body `{ target_dashboard }` |
| Config Status | `GET /api/auth/config-status` | N/A (local non-secret status) | `GET` | Returns booleans (`appKeyConfigured`, `appDomainConfigured`, `isHttps`) |

## 4. Academic Strata Contract

All 22 verified endpoints are exposed via `GET /api/strata/[resource]` (`apps/web/app/api/strata/[resource]/route.ts`) and defined in `apps/web/lib/lexmacasto/contracts.ts`. Every request enforces the mandatory `fetchtype` query parameter:

- **Main (`fetchtype=absolute`):**
  - `categories` -> `/api/castoline/strata/main/categories/list/absolute?fetchtype=absolute`
  - `subcategories` -> `/api/castoline/strata/main/subcategories/list/absolute?fetchtype=absolute`
  - `domains` -> `/api/castoline/strata/main/domains/list/absolute?fetchtype=absolute`
- **Learning (`fetchtype=absolute`):**
  - `programs`, `courses`, `subjects`, `units`, `lessons`, `topics`, `concepts`, `facts` -> `/api/castoline/strata/learning/<resource>/list/absolute?fetchtype=absolute`
- **Assessment (`fetchtype=absolute` / `fetchtype=live`):**
  - `assessments`, `exams`, `sections`, `questions` -> `/api/castoline/strata/assessment/<resource>/list/absolute?fetchtype=absolute`
  - `examsLive` -> `/api/castoline/strata/assessment/exams/list/live?fetchtype=live` (requires authenticated session; returns `401` if unauthenticated)
- **Institution (`fetchtype=absolute`):**
  - `institutions`, `schools`, `departments`, `divisions`, `cohorts`, `classes` -> `/api/castoline/strata/institution/<resource>/list/absolute?fetchtype=absolute` (explicitly `classes`, not `strataclasses`)
- **Response Envelope:** `{ success, message, data: { items, skewPage, skewPerPage, skewTotal, skewTotalPages } }` normalized by `normalizeStrataEnvelope()`.
- **Unverified / Non-Existent Routes:** No `AcademicYear` or `Season` endpoints exist; year/season filters only populate if present in actual returned strata metadata.

## 5. Error Normalization & Safe Logging

- `apps/web/lib/lexmacasto/client.ts` classifies `CONFIGURATION_ERROR`, `MISSING_APP_IDENTITY`, `NETWORK_ERROR`, `TIMEOUT`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`, `BACKEND_ERROR`, and `UNEXPECTED_RESPONSE`.
- Stack traces, internal IPs, `SKEW_LINE_APP_KEY`, `x-casto-line`, `x-casto-badge`, passwords, PINs, and challenges are stripped/redacted.
