# NURVIA Phase 3.7 — Existing API Baseline (Phase 3.6)

**Baseline Commit:** `50c58f0ae1b01db3f96423dece16df1b811bdec2` (`master`)  
**Target Directory:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Existing NURVIA API Route Handlers (`apps/web/app/api/**`)

| Route Handler | Methods | Responsibility | Security & Validation |
|---|---|---|---|
| `app/api/auth/login/route.ts` | `POST` | Authenticates via `/api/castoline/auth/login` (`password` or `pin`), sets `HttpOnly` cookies (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`). | Same-origin CSRF (`validateSameOriginRequest`), `application/json` check, server-enforced `role: 'Learner'`, `dashboardName: 'web'`, `Cache-Control: no-store`, strips raw Casto tokens from response. |
| `app/api/auth/register/route.ts` | `POST` | Registers learner via `/api/castoline/auth/register`. | Same-origin CSRF, E.164 phone normalization (`lib/phone.ts`), 12+ char password / 4–12 digit PIN validation, server-enforced `role: 'Learner'`, `dashboardName: 'web'`, `Cache-Control: no-store`. |
| `app/api/auth/logout/route.ts` | `POST` | Revokes backend session (`/logout/sessions/distinct` or `/relative`) and clears `HttpOnly` cookies. | Same-origin CSRF, always clears local cookies, accurately reports backend revocation failure. |
| `app/api/auth/me/route.ts` | `GET` | Fetches current user via `/api/castoline/system/user/list/current?fetchtype=current`. | Reads `HttpOnly` cookies server-side, sanitizes user DTO, clears cookies on `401`, `Cache-Control: no-store`. |
| `app/api/auth/config-status/route.ts` | `GET` | Reports boolean configuration readiness (`appDomainConfigured`, `appKeyConfigured`, `activeBackend`, `isHttps`). | Never leaks secrets or raw URLs; `Cache-Control: no-store`. |
| `app/api/backend/[...path]/route.ts` | `GET, POST, PUT, PATCH, DELETE` | Allowlisted BFF proxy (`proxy-allowlist.ts`) for profile, study library, lectures, questions, exams, attempts, learner workspace, community, subscriptions, admin/RBAC. | Same-origin CSRF, strict regex + method allowlist, path-traversal blocking, server-verified `staff` role enforcement, body size limits, `no-store`. |
| `app/api/strata/[resource]/route.ts` | `GET` | Queries 22 verified LexmaCasto strata endpoints with mandatory `fetchtype`. | Resource allowlist, query param allowlist, pagination bounds (`1..10000`, `1..100`), auth check on `examsLive`, `no-store`. |
| `app/api/avatar/[storageKey]/route.ts` | `GET` | Proxies avatar retrieval `/api/avatar/{storageKey}`. | `SAFE_STORAGE_KEY_REGEX` (`^[a-zA-Z0-9._-]{1,128}$`), traversal check. |

---

## 2. Shared LexmaCasto & Client Infrastructure

- `lib/api-config.mjs`: Fail-closed resolution of `SKEW_LINE_DOTNET_BASE_URL`, `SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`, HTTPS enforcement in production.
- `lib/lexmacasto/headers.ts`: `buildSiteHeaders()`, `buildCastoAuthHeaders()`, `sanitizeHeaderValue()` (CRLF/control-char stripping), `redactHeadersForLog()`, `redactPayloadForLog()`.
- `lib/lexmacasto/session.ts`: `HttpOnly` cookie management (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`) and `validateSameOriginRequest()`.
- `lib/lexmacasto/client.ts`: `lexmaCastoRequest()` (SSRF guard, 20s timeout, 3xx redirect rejection, HTML/plain-text safe parsing, message sanitization, credential extraction, user sanitization).
- `lib/lexmacasto/contracts.ts`: Verified endpoints, payload interfaces, and strata definitions.
- `lib/api-client.ts` & `components/auth/auth-provider.tsx`: Browser BFF client routing dedicated auth endpoints to `/api/auth/*` and domain endpoints to `/api/backend/*` and `/api/strata/*`.

---

## 3. Baseline Test Status (Verified `2026-11-17`)

All 10 existing unit test suites in `apps/web/package.json` (`npm test`) pass on the Phase 3.6 baseline.
