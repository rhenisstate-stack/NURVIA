# NURVIA Phase 3.7 — Qlex Authentication Lifecycle Report

**Reference Source:** `C:\Users\gitau\Documents\Qlex`  
**Scope:** End-to-end runtime trace of Registration, Sign-in, Logout, Session Restoration, and Protected API Requests.

---

## B1. Registration Lifecycle

**Trace:**  
`src/app/(web)/auth/register/page.tsx` (and dashboard register pages / `modals/Register.tsx` / `modals/auth.tsx`)  
→ `registerUser()` in `src/lib/services/auth/registerService.ts`  
→ `apiFetch("/api/auth/register", { method: "POST", body })` in `src/lib/api/api/api.ts`  
→ `POST /api/auth/register` (`src/app/api/auth/register/route.ts`)  
→ `POST {backendBaseUrl}/api/castoline/auth/register`

### Contract Details (Observed in Source)
- **HTTP Method:** `POST`
- **Backend Endpoint:** `/api/castoline/auth/register`
- **Required/Forwarded Fields:**
  - `username` (string)
  - `email` (string)
  - `phone` (string)
  - `loginMethod`: `"password" | "pin" | "both"`
  - `password` / `passwordConfirmation` (when `loginMethod !== "pin"`)
  - `pin` / `pinConfirmation` (note: `registerService.ts` sends `pin_confirmation`, while `route.ts` reads `body.pinConfirmation` — a casing mismatch in Qlex!)
  - `agree` (boolean)
  - `role` (e.g. `"Learner"` from UI, defaults to `"user"` in `route.ts`)
  - `dashboardName` (defaults to `"web"`)
  - `provider` (defaults to `"email"`)
  - `challenge` (**hardcoded** in every Qlex UI file as `"register-skew8@lancasto"`)
- **Headers:** `Content-Type: application/json` + `getSiteHeaders()` (`x-site-key`, `x-site-domain`, `x-site-name`, etc.)
- **Session / Redirect:** Does **not** set session cookies; redirects user to `${LOGIN_PATH}?registered=true&email=...` on success.

---

## B2. Sign-in Lifecycle

**Trace:**  
`src/app/(web)/auth/login/page.tsx` (and `modals/Login.tsx`, `modals/Annex.tsx`, `dashboards/*/auth/login/page.tsx`)  
→ `login()` in `src/lib/services/auth/loginService.ts`  
→ `getOrCreateFingerprint()` (64-char random alphanumeric stored in non-HttpOnly cookie `skew_blanc_session_fingerprint`)  
→ `resolveAndStoreIPAddress()` (fetches `https://api.ipify.org?format=json`, stores in `skew_blanc_session_address`)  
→ `apiFetch("/api/auth/login", { method: "POST", body, credentials: "include" })`  
→ `POST /api/auth/login` (`src/app/api/auth/login/route.ts`)  
→ `POST {backendBaseUrl}/api/castoline/auth/login`

### Contract Details (Observed in Source)
- **Authentication Methods:** `"password"` (`email` + `password`) or `"pin"` (`email` + `pin`).
- **Hardcoded Challenge:** Every Qlex login UI hardcodes `challenge: "learner.login.skew8lancasto"` (or `"custom.login.skew8lancasto"` in `Annex.tsx`). `login/route.ts` forwards `JSON.stringify(body)` verbatim.
- **Additional Fields:** `LoginProvider: "email"`, `loginProviderPayload: "Void"`, `dashboardName: "web"`, `role: "Learner"`, `fingerprint`, `ipAddress`.
- **Credential Extraction & Cookie Creation (INSECURE in Qlex):**
  - `login/route.ts` extracts `user?.castoBadge` and `user?.castoLine` from backend response and returns them in the JSON body as `casto_badge` and `casto_line`.
  - `loginService.ts` calls `writeAuthSessionCookies(result.casto_badge, result.casto_line)` in the **browser**, writing `skew_blanc_session_badge` and `skew_blanc_session_line` via `document.cookie` (readable by any JavaScript / XSS).

---

## B3. Logout Lifecycle

**Trace:**  
`dynamicLogoutService(targetDashboard, fetchType)` in `src/lib/services/auth/logoutService.ts`  
→ `POST /api/auth/logout` (`src/app/api/auth/logout/route.ts`)  
→ `POST /api/castoline/auth/logout/sessions/distinct` (or `/relative` for all sessions)

### Contract Details (Observed in Source)
- **Payload:** `{ target_dashboard: targetDashboard }`
- **Headers:** `getSiteHeaders()`, `cookie`, `x-casto-line`, `x-casto-badge`
- **Local Cleanup:** `clearSystemUserSessionCookies()` runs in a `finally` block in `logoutService.ts`, deleting `skew_blanc_session_line` and `skew_blanc_session_badge` even if backend logout fails.
- **Multiple Sessions:** Supports `fetchType: "distinct"` (current session) and `"relative"` (all sessions).

---

## B4. Current User & Session Restoration

Qlex has **two** separate mechanisms in source:
1. **`/api/auth/session` (`src/app/api/auth/session/route.ts`)**: Calls `GET /api/castoline/auth/system/user` with `x-casto-line` and `x-casto-badge`. **Live probe on 2026-11-17 confirmed `/api/castoline/auth/system/user` returns HTML Page Not Found on `explicitbackend.com`.**
2. **`useCurrentSystemUser` (`src/lib/hooks/users/account/current/useCurrentSystemUser.tsx`) → `userService` → `/api/users/user?fetchtype=current`**: Calls `GET /api/castoline/system/user/list/current?fetchtype=current` with `x-casto-line` and `x-casto-badge`. This is the working endpoint that NURVIA already uses!
3. **Refresh Tokens:** None exist in Qlex or LexmaCasto. Sessions are 1-day cookies in Qlex (`COOKIE_DAYS = 1`) and 7-day HttpOnly cookies in NURVIA.

---

## B5. Protected API Requests

- In Qlex, `apiFetch` (`src/lib/api/api/api.ts`) runs in the browser, calls `renderSystemSessionHeaders()` to read `skew_blanc_session_badge` and `skew_blanc_session_line` from `document.cookie`, and attaches `x-casto-line` and `x-casto-badge` as custom HTTP headers on every `/api/*` request.
- Next.js route handlers read `req.headers.get("x-casto-line")` and `req.headers.get("x-casto-badge")` and forward them with `getSiteHeaders()` to the backend.
- **Security Assessment:** NURVIA's BFF architecture (`HttpOnly` cookies read server-side in `getServerCastoSession()` and injected into `lexmaCastoRequest()`) is strictly superior and eliminates client-side token exposure.
