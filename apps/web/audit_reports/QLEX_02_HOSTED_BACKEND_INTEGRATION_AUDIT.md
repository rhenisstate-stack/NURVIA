# QLEX_02 — HOSTED BACKEND INTEGRATION AUDIT

## 1. Communication Architecture
QLEX strictly enforces a **Backend-for-Frontend (BFF) Proxy** pattern:
`Browser (apiFetch) → Next.js API Routes (/api/*) → Hosted .NET Backend (http://108.61.9.189:8008)`

- **Enforcement:** `src/lib/api/api/api.ts` (`apiFetch`) throws an error if `path` starts with `http://` or `https://` (`"Direct backend calls are NOT allowed. Use /api/* internal routes."`).
- **Backend Selection:** `getBackendBaseUrl()` in `src/lib/api/api/api.ts` reads `SKEW_LINE_ACTIVE_BACKEND` (`"dotnet"` in `.env.local`) and resolves `SKEW_LINE_DOTNET_BASE_URL` (`http://108.61.9.189:8008`).
- **Data Transformation:** .NET PascalCase responses are normalized client-side via `convertBackendKeysToCamel()` (`src/lib/utils/convertors/pascalToCamelCase.ts`) in hooks such as `useCurrentSystemUser.tsx`.

---

## 2. Integration Identity & Request Headers
Every server-side proxy call attaches `getSiteHeaders()` (`src/lib/config/siteHeaders.ts`):
- `x-site-key`: `SKEW_LINE_APP_KEY` (redacted)
- `x-site-domain`: `SKEW_LINE_APP_DOMAIN` (`http://localhost:3000`)
- `x-site-name`: `SKEW_LINE_APP_NAME` (`QlexNursing`)
- `x-site-path`, `x-site-ip-address`, `x-site-location`, `x-site-country`, `x-site-brouser` (note typo `brouser`), `x-site-time`, `x-site-referrer`, `x-site-mobile`, `x-site-request-id`, `x-site-session-id` (populated by `src/middleware.ts`).

Client-side requests attach `renderSystemSessionHeaders()` (`src/lib/services/partial/helper/systemSessionHeaders.ts`):
- `x-casto-line`: Token extracted from `skew_blanc_session_line` cookie.
- `x-casto-badge`: User badge extracted from `skew_blanc_session_badge` cookie.

---

## 3. Observed Live Backend Behavior (2026-11-16)
During live verification against `http://108.61.9.189:8008` via `http://localhost:3000`:
1. **`GET /api/nexus/strata/assessment/exam?fetchtype=absolute`** -> **HTTP 200**:
   `{"success":true,"message":"Absolute Exams Fetched Successfully ⚓","data":{"items":[],"skewTotal":0,"skewTotalPages":0,...}}`
   *(0 exams exist in the hosted backend for `QlexNursing`.)*
2. **`GET /api/nexus/strata/learning/program?fetchtype=relative&limit=20`** -> **HTTP 200**:
   `{"success":true,"message":"Relative Programs Fetched Successfully ⚓","data":[]}`
3. **`GET /api/nexus/strata/assessment/exam?fetchtype=nominal&identifier=`** -> **HTTP 400**:
   `{"error":"Parent Identifier is Required ⚓"}` (triggered automatically by dashboard because `programs` returned `[]`).
4. **`GET /api/users/user?fetchtype=current`** -> **HTTP 401**:
   `{"error":"Missing Casto authentication headers"}` when unauthenticated.
5. **`GET /api/auth/session`** -> **HTTP 500**:
   `{"logged_in":false}` when unauthenticated (backend `/api/castoline/auth/system/user` returns 500 and proxy forwards status).
6. **`GET /api/nexus/strata/assessment/result?fetchtype=relative...`** -> **HTTP 500**:
   `{"error":"Failed to Parse Backend Response ⚓"}` when unauthenticated.

---

## 4. Integration Defects Identified
1. **Disconnected Route (`sessionService.ts`):** Calls `/api/users/session` instead of `/api/users/controls/session`.
2. **Parameter Mismatch (`registerService.ts` vs `api/auth/register/route.ts`):** Service sends `pin_confirmation` (snake_case), route reads `body.pinConfirmation` (camelCase) and drops `providerPayload`.
3. **Unauthenticated 500s:** `/api/auth/session` and `/api/nexus/strata/assessment/result?fetchtype=relative` return HTTP 500 instead of 401/200 `{ logged_in: false }` when unauthenticated.
4. **Sensitive Server/Client Logging:** `login/route.ts`, `register/route.ts`, `session/route.ts`, `users/user/route.ts`, and `registerService.ts` log request bodies (passwords/PINs) and session tokens (`x-casto-line`, `x-casto-badge`).
