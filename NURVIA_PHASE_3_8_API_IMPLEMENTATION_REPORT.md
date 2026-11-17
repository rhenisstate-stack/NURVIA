# NURVIA Phase 3.8 — API Implementation Report

## New & Upgraded NURVIA API Routes

1. **`apps/web/app/api/seek/route.ts` (`GET`, `DELETE`)**
   - Proxies `/api/castoline/strata/seek/{absolute,distinct,suggest,history}`.
   - Enforces `ALLOWED_SEEK_QUERY_PARAMS`, maps `q` → `query`, requires `HttpOnly` session for `suggest` and `history`, and enforces `validateSameOriginRequest()` CSRF on `DELETE`.
2. **`apps/web/app/api/exams/diy/route.ts` (`POST`)**
   - Proxies `POST /api/castoline/strata/assessment/exams/diy/learning/store`.
   - Enforces CSRF, `HttpOnly` session, `application/json`, `64 KB` body limit, and `title` + `totalQuestions` (`1..500`) validation.
3. **`apps/web/app/api/auth/account/destroy/route.ts` (`POST`)**
   - Proxies `POST /api/castoline/auth/account/destroy`.
   - Enforces CSRF, `HttpOnly` session, requires `reason`, verifies caller's own `guidId` and `email` server-side via `/api/castoline/system/user/list/current?fetchtype=current`, and clears `HttpOnly` session cookies on success.
4. **`apps/web/app/api/auth/validate/route.ts` (`GET`)**
   - Proxies `GET /api/castoline/strata/support/validate` with required `token` and `context` query parameters and `Cache-Control: no-store`.
5. **`apps/web/app/api/strata/[resource]/route.ts` (`GET`, `POST`, `PUT`, `DELETE`)**
   - Upgraded `GET` to support `fetchtype` in `['absolute', 'distinct', 'relative', 'current', 'live']` (requiring `HttpOnly` session for non-`absolute` modes).
   - Added `POST` (`/store`), `PUT` (`/update`), and `DELETE` (`/delete`) with CSRF, `HttpOnly` session, server-verified `STAFF_ROLES` authorization, and `1 MB` body size limit across all 22 verified strata resources.
6. **Shared Contracts & Routing (`lib/lexmacasto/contracts.ts`, `lib/api-url.mjs`, `lib/api-client.ts`)**
   - Added `LEXMACASTO_EXTRA_ENDPOINTS`, `buildStrataMutationPath()`, `DEDICATED_APP_ROUTES`, and 10 typed `nurviaApi` methods.
