# NURVIA Phase 3.7 — Complete Qlex API Inventory

**Read-Only Reference Source:** `C:\Users\gitau\Documents\Qlex\src\app\api`  
**Total Route Files Inventoried:** 59 (`route.ts` / `route.tsx`)  
**Shared API & Auth Infrastructure Inspected:**
- `src/lib/api/api/api.ts` (client `apiFetch` & server `getBackendBaseUrl`)
- `src/lib/api/axios/axios.ts` (commented-out legacy axios instance)
- `src/lib/config/config.ts` (`SKEW_LINE_*` env vars, `WEBSITE_1` fallback)
- `src/lib/config/siteHeaders.ts` (`getSiteHeaders()`)
- `src/middleware.ts` (`x-current-*` header injection & `x-site-session` cookie)
- `src/lib/services/partial/helper/systemSessionHeaders.ts` (client `document.cookie` reader)
- `src/lib/utils/sessions/generateSystemUserSessionCookies.ts` (client `document.cookie` writer)
- `src/lib/utils/sessions/clearSystemUserSessionCookies.ts` (client `document.cookie` clearer)

---

## 1. Shared Qlex API Infrastructure Summary

| File | Responsibility | Key Behavior | Security / Migration Assessment |
|---|---|---|---|
| `src/lib/api/api/api.ts` | Backend URL resolution (`getBackendBaseUrl`) and frontend `apiFetch` wrapper | Reads `SKEW_LINE_ACTIVE_BACKEND` (default `"dotnet"`) and `SKEW_LINE_DOTNET_BASE_URL`. Client `apiFetch` attaches `renderSystemSessionHeaders()` from `document.cookie` and calls `/api/*`. | **REJECT** client-side `document.cookie` session header injection; NURVIA uses server-only `HttpOnly` cookies via `apps/web/lib/lexmacasto/session.ts` and `client.ts`. |
| `src/lib/config/siteHeaders.ts` | Server-only `getSiteHeaders()` | Attaches `x-site-key`, `x-site-domain`, `x-site-name`, plus `x-site-path`, `x-site-ip-address`, `x-site-location`, `x-site-country`, `x-site-brouser`, `x-site-time`, `x-site-referrer`, `x-site-mobile`, `x-site-request-id`, `x-site-session-id` from `next/headers`. | **PRESERVE / ADAPT**: NURVIA already implements `buildSiteHeaders()` with CRLF sanitization and server-only identity isolation (`apps/web/lib/lexmacasto/headers.ts`). |
| `src/middleware.ts` | Request metadata header injection | Sets `x-current-*` headers from `x-forwarded-for`, `cf-ipcountry`, `x-vercel-ip-country`, `x-vercel-ip-city`, `sec-ch-ua-mobile`, `referer`, and sets `x-site-session` HttpOnly cookie. | **ADAPT (optional metadata)**: NURVIA can extract `x-vercel-ip-country`/`cf-ipcountry`, `x-vercel-ip-city`, and `sec-ch-ua-mobile` directly in `extractSiteMetadataFromRequestHeaders()` without needing Qlex's middleware. |
| `src/lib/utils/sessions/generateSystemUserSessionCookies.ts` | Client-side auth cookie writer, fingerprint, IP lookup | Writes `skew_blanc_session_badge` and `skew_blanc_session_line` via `document.cookie` (non-HttpOnly!). Calls `https://api.ipify.org?format=json` from browser. | **REJECT**: Exposes session tokens (`castoLine`, `castoBadge`) to JavaScript (`XSS` risk). NURVIA uses `HttpOnly`, `SameSite=Lax`, `Secure` (prod) server-managed cookies. |
| `src/lib/services/partial/helper/systemSessionHeaders.ts` | Reads `document.cookie` and builds `x-casto-line` / `x-casto-badge` in browser | Sends session credentials in custom request headers from client JS to Next.js API routes. | **REJECT**: NURVIA never exposes Casto credentials to browser JS. |

---

## 2. Authentication & Account Routes (`src/app/api/auth/**`)

| # | Relative Path | HTTP Methods | Incoming Contract | Outgoing Backend Endpoint | Headers Added/Modified | Cookie / Session | Security Implications | Migration Decision |
|---|---|---|---|---|---|---|---|---|
| 1 | `auth/login/route.ts` | `POST` | JSON `LoginCredentials` (`email`, `password` or `pin`, `loginMethod`, `LoginProvider`, optional `dashboardName`, `role`, `fingerprint`, `ipAddress`; forwards `body` verbatim including `challenge` if sent) | `POST /api/castoline/auth/login` | `Content-Type: application/json`, `getSiteHeaders()` | None (returns `casto_badge`, `casto_line` in JSON body to browser JS!) | **HIGH RISK**: Logs full request body (including plaintext `password`/`pin`) and full response body (including `castoLine`/`castoBadge`) to `console.log`. Returns session tokens to JS. Trusts client `role`/`dashboardName`. | **PRESERVE** NURVIA `/api/auth/login` (HttpOnly cookies, server-enforced `role: 'Learner'`, `dashboardName: 'web'`, CSRF check, no secret logging). |
| 2 | `auth/register/route.ts` | `POST` | JSON `RegisterCredentials` (`username`, `email`, `phone`, `password`, `passwordConfirmation`, `pin`, `pinConfirmation`, `loginMethod`, `agree`, `role`, `dashboardName`, `provider`, `challenge`) | `POST /api/castoline/auth/register` | `Content-Type: application/json`, `getSiteHeaders()` | None | **HIGH RISK**: Logs full request body (plaintext `password`/`pin`). Trusts client `role` (defaults `"user"`). Forwards hardcoded `challenge` from client. | **PRESERVE** NURVIA `/api/auth/register` (E.164 phone normalization, server-enforced `role: 'Learner'`, CSRF, no hardcoded challenge). |
| 3 | `auth/logout/route.ts` | `POST` | JSON `{ fetchType: "distinct" | "relative", targetDashboard }` | `POST /api/castoline/auth/logout/sessions/distinct` or `/relative` | `Content-Type`, `getSiteHeaders()`, `cookie`, `x-casto-line`, `x-casto-badge` | None server-side (client clears `document.cookie` in `finally`) | Forwards raw `cookie` header; no CSRF check. | **PRESERVE** NURVIA `/api/auth/logout` (CSRF check, HttpOnly cookie read/clear, accurate failure reporting). |
| 4 | `auth/session/route.ts` | `GET` | Headers `x-casto-line`, `x-casto-badge` | `GET /api/castoline/auth/system/user` | `getSiteHeaders()`, `x-casto-line`, `x-casto-badge` | None | Logs `castoLine` and `castoBadge` to `console.log`. Live probe on 2026-11-17 confirmed `/api/castoline/auth/system/user` returns HTML Page Not Found on `explicitbackend.com`! | **REJECT** (obsolete backend endpoint + logs secrets). NURVIA `/api/auth/me` uses verified `/api/castoline/system/user/list/current?fetchtype=current`. |
| 5 | `auth/recovery/password/route.ts` | `POST` | `PasswordRecoveryRequest` (`step: "request" | "verify" | "reset"`, `email`, `code`, `context`, `loginMethod`, `password`, `pin`, etc.) | `POST /api/castoline/auth/recovery/password` | `Content-Type`, `getSiteHeaders()` | None | Logs full request body (including new password/pin) to `console.log`. | **INVESTIGATE / BLOCKED**: NURVIA uses `/api/backend/auth/forgot-password` & `/api/backend/auth/reset-password` via allowlist; `/api/castoline/auth/recovery/password` is unverified for NURVIA. |
| 6 | `auth/recovery/social/route.ts` | `POST` | JSON recovery payload | `POST /api/castoline/auth/recovery/social` | `Content-Type`, `getSiteHeaders()` | None | Logs request/response bodies. | **REJECT / NOT NEEDED**: NURVIA does not use social auth in Phase 3.7. |
| 7 | `auth/account/destroy/route.ts` | `POST` | JSON `{ guidId, email, reason }` | `POST /api/castoline/auth/account/destroy` | `Content-Type`, `getSiteHeaders()`, `cookie`, `x-casto-line`, `x-casto-badge` | None | No CSRF check; forwards raw `cookie` header. | **INVESTIGATE / BLOCKED**: Account destruction not in NURVIA Phase 3.7 scope. |
| 8 | `auth/validate/route.tsx` | `GET` | Query string forwarded verbatim; headers `x-casto-line`, `x-casto-badge`, `x-session-id` | `GET /api/castoline/strata/support/validate?...` | `Content-Type`, `getSiteHeaders()`, optional casto/session headers | None | No query param allowlist. | **REJECT**: Unrelated support validation route. |
| 9–14 | `auth/social/{apple,facebook,github,google,linkedin,microsoft}/route.ts` | `GET` | Query params (`context`, `role`, `dashboardName`, `challenge`, `redirectPath`, `fingerprint`, `ipAddress`) | `GET /api/castoline/auth/social/{provider}?...` (`redirect: "manual"`) | `getSiteHeaders()` | Sets `socialError` non-HttpOnly cookie on missing `Location` | Open redirect risk if `Location` unvalidated; social OAuth not configured for NURVIA. | **REJECT / OUT OF SCOPE** for Phase 3.7. |
| 15 | `auth/social/onetap/route.ts` | `POST` | `{ credential, select_by, context, role, dashboardName, challenge, fingerprint, ipAddress }` | `POST /api/castoline/auth/social/onetap` | `Content-Type`, `getSiteHeaders()` | Returns `casto_badge`, `casto_line` in JSON | Hardcodes fallback `challenge: "learner.login.skew8lancasto"`; logs response body; returns tokens to JS. | **REJECT**. |
| 16–22 | `auth/support/{2fa,account,email,message,password,phone,social}/route.ts` | `POST, PUT, DELETE, GET` | JSON body + `fetchtype` query param | `/api/castoline/strata/support/{2fa,account,email,message,password,phone,social}/{store,update,delete,list/*}` | `Content-Type`, `getSiteHeaders()`, `x-casto-line`, `x-casto-badge` | None | Unauthenticated/unrestricted forwarding of `POST`/`PUT`/`DELETE` with `console.log` of payloads. | **REJECT / OUT OF SCOPE** (not used by NURVIA). |

---

## 3. Media, Seek, System & User Administration Routes

| # | Relative Path | HTTP Methods | Incoming Contract | Outgoing Backend Endpoint | Headers Added/Modified | Security Implications | Migration Decision |
|---|---|---|---|---|---|---|---|
| 23 | `media/[...path]/route.ts` | `GET` | Catch-all `path` segments | `GET {backend}/{filePath}` | `getSiteHeaders()` | **SSRF / Path Traversal risk**: Joins `path` without traversal validation (`..`, encoded slashes). | **PRESERVE** NURVIA `api/avatar/[storageKey]/route.ts` (strict `SAFE_STORAGE_KEY_REGEX`). |
| 24 | `seek/route.ts` | `GET, DELETE` | Query `fetchtype` (`absolute`, `distinct`, `suggest`, `history`) + other params | `/api/castoline/strata/seek/{segment}?...` | `Content-Type`, `getSiteHeaders()`, `x-casto-line`, `x-casto-badge`, `x-session-id` | No query param allowlist; no CSRF on `DELETE`. | **REJECT** (NURVIA uses `/api/strata/[resource]` with strict allowlist). |
| 25 | `system/backends/route.ts` | `GET` | None | None (reads `process.env`) | None | **INFO DISCLOSURE**: Exposes internal backend URLs (`SKEW_LINE_FASTAPI_BASE_URL`, `SKEW_LINE_LARAVEL_BASE_URL`, `SKEW_LINE_DOTNET_BASE_URL`) unauthenticated. | **REJECT** (NURVIA `/api/auth/config-status` only returns booleans, never URLs or keys). |
| 26 | `system/license/route.ts` | `POST, PUT, DELETE, GET` | JSON + `fetchtype` | `/api/castoline/system/license/*` | `getSiteHeaders()` (no casto session headers!) | Unauthenticated admin mutation proxy. | **REJECT**. |
| 27 | `system/privilege/route.ts` | `POST, PUT, DELETE, GET` | JSON + `fetchtype` | `/api/castoline/system/user/privilege/*` | `getSiteHeaders()` (no casto session headers!) | Unauthenticated privilege mutation proxy. | **REJECT**. |
| 28 | `system/role/route.ts` | `POST, PUT, DELETE, GET` | JSON + `fetchtype` | `/api/castoline/system/user/role/*` | `getSiteHeaders()`, `x-casto-line`, `x-casto-badge` | No server-side staff role enforcement. | **REJECT** (NURVIA uses `/api/backend/auth/assign-role` with `staff` role check). |
| 29 | `users/controls/registration/control/route.ts` | `POST, PUT, DELETE, GET` | JSON + `fetchtype` | `/api/castoline/system/user/registration/control/*` | `getSiteHeaders()` | Unauthenticated control mutation. | **REJECT**. |
| 30 | `users/controls/registration/option/route.ts` | `POST, PUT, DELETE, GET` | JSON + `fetchtype` | `/api/castoline/system/user/registration/option/*` | `getSiteHeaders()` | Unauthenticated option mutation. | **REJECT**. |
| 31 | `users/controls/session/route.ts` | `POST, PUT, DELETE, GET` | JSON + `fetchtype` | `/api/castoline/system/user/session/*` | `getSiteHeaders()`, `x-casto-line`, `x-casto-badge` | No CSRF or role guard. | **REJECT**. |
| 32 | `users/seed/route.ts` | `POST` | JSON | `POST /api/castoline/system/user/developer/seed` | `getSiteHeaders()` | **CRITICAL**: Unauthenticated developer account seeding endpoint. | **REJECT**. |
| 33 | `users/user/route.ts` | `POST, PUT, DELETE, GET` | JSON + `fetchtype` (`current`, `absolute`, `distinct`, etc.) | `/api/castoline/system/user/{store,update,delete,list/*}` | `getSiteHeaders()`, `x-casto-line`, `x-casto-badge` | Logs `castoLine`/`castoBadge` and full response body. | **PRESERVE** NURVIA `/api/auth/me` (uses `list/current?fetchtype=current` safely). |

---

## 4. Nexus Dominion & Strata Routes (`src/app/api/nexus/**`) — 26 Files

All 26 routes follow Qlex's identical `forwardToBackend` template (`POST`/`PUT`/`DELETE`/`GET`, `getSiteHeaders()`, forwarding `x-casto-line` and `x-casto-badge` from browser headers, logging bodies):

| # | Relative Path | Methods | Backend Base Path | Special Notes | Migration Decision |
|---|---|---|---|---|---|
| 34 | `nexus/dominion/subscription/item/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/nexus/dominion/subscription-items/*` | Subscription item CRUD | **PRESERVE** NURVIA `/api/backend/subscriptions/*` |
| 35 | `nexus/dominion/subscription/package/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/nexus/dominion/subscription-packages/*` | Subscription package CRUD | **PRESERVE** NURVIA `/api/backend/subscriptions/plans` |
| 36 | `nexus/strata/assessment/assessment/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/assessment/assessments/*` | Assessments CRUD | **PRESERVE** NURVIA `/api/strata/assessments` |
| 37 | `nexus/strata/assessment/exam/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/assessment/exams/*` | Exams CRUD | **PRESERVE** NURVIA `/api/strata/exams` & `examsLive` |
| 38 | `nexus/strata/assessment/exam/diy/route.ts` | `POST` | `/api/castoline/strata/assessment/exams/diy/learning/store` | DIY exam creation | **REJECT / OUT OF SCOPE** (NURVIA uses `/api/backend/attempts/start/*`) |
| 39 | `nexus/strata/assessment/exam/upserts/route.ts` | `POST` | `/api/castoline/strata/assessment/exams/upserts` | Bulk exam upsert | **REJECT / OUT OF SCOPE** |
| 40 | `nexus/strata/assessment/question/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/assessment/questions/*` | Questions CRUD | **PRESERVE** NURVIA `/api/strata/questions` |
| 41 | `nexus/strata/assessment/result/route.ts` | `DELETE, GET` | `/api/castoline/strata/assessment/results/*` | Results list/delete | **PRESERVE** NURVIA `/api/backend/attempts/*` |
| 42 | `nexus/strata/assessment/section/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/assessment/sections/*` | Sections CRUD | **PRESERVE** NURVIA `/api/strata/sections` |
| 43 | `nexus/strata/content/cognition/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/cognition/*` | Supports `multipart/form-data` | **REJECT / OUT OF SCOPE** |
| 44 | `nexus/strata/content/document/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/documents/*` | Supports `multipart/form-data` | **REJECT / OUT OF SCOPE** |
| 45 | `nexus/strata/institution/cohort/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/institution/cohorts/*` | Cohorts CRUD | **PRESERVE** NURVIA `/api/strata/cohorts` |
| 46 | `nexus/strata/institution/department/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/institution/departments/*` | Departments CRUD | **PRESERVE** NURVIA `/api/strata/departments` |
| 47 | `nexus/strata/institution/division/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/institution/divisions/*` | Divisions CRUD | **PRESERVE** NURVIA `/api/strata/divisions` |
| 48 | `nexus/strata/institution/institution/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/institution/institutions/*` | Institutions CRUD | **PRESERVE** NURVIA `/api/strata/institutions` |
| 49 | `nexus/strata/institution/school/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/institution/schools/*` | Schools CRUD | **PRESERVE** NURVIA `/api/strata/schools` |
| 50 | `nexus/strata/institution/strataclass/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/institution/strataclasses/*` | Note: backend uses `classes`, not `strataclasses` | **PRESERVE** NURVIA `/api/strata/classes` |
| 51 | `nexus/strata/learning/concept/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/concepts/*` | Concepts CRUD | **PRESERVE** NURVIA `/api/strata/concepts` |
| 52 | `nexus/strata/learning/course/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/courses/*` | Courses CRUD | **PRESERVE** NURVIA `/api/strata/courses` |
| 53 | `nexus/strata/learning/fact/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/facts/*` | Facts CRUD | **PRESERVE** NURVIA `/api/strata/facts` |
| 54 | `nexus/strata/learning/lesson/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/lessons/*` | Lessons CRUD | **PRESERVE** NURVIA `/api/strata/lessons` |
| 55 | `nexus/strata/learning/program/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/programs/*` | Programs CRUD | **PRESERVE** NURVIA `/api/strata/programs` |
| 56 | `nexus/strata/learning/subject/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/subjects/*` | Subjects CRUD | **PRESERVE** NURVIA `/api/strata/subjects` |
| 57 | `nexus/strata/learning/topic/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/topics/*` | Topics CRUD | **PRESERVE** NURVIA `/api/strata/topics` |
| 58 | `nexus/strata/learning/unit/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/learning/units/*` | Units CRUD | **PRESERVE** NURVIA `/api/strata/units` |
| 59 | `nexus/strata/main/category/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/main/categories/*` | Categories CRUD | **PRESERVE** NURVIA `/api/strata/categories` |
| 60* | `nexus/strata/main/domain/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/main/domains/*` | Domains CRUD | **PRESERVE** NURVIA `/api/strata/domains` |
| 61* | `nexus/strata/main/subcategory/route.ts` | `POST, PUT, DELETE, GET` | `/api/castoline/strata/main/subcategories/*` | Subcategories CRUD | **PRESERVE** NURVIA `/api/strata/subcategories` |

*(Note: Total file count in `src/app/api` is 59 files; `auth/social/*` is 7 files, `auth/support/*` is 7 files, `auth/*` other is 8 files = 22 auth files; `media` = 1; `seek` = 1; `system` = 4; `users` = 5; `nexus` = 26; 22 + 1 + 1 + 4 + 5 + 26 = 59 files.)*
