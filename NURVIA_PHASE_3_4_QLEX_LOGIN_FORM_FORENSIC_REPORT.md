# NURVIA Phase 3.4 — Qlex-Nursing Login Form Forensic Report

**Date:** 2026-11-16  
**Reference Repository (READ-ONLY):** `C:\Users\gitau\Documents\Qlex-Nursing`  
**Inspection Method:** Direct read-only source inspection of pages, modals, services, and BFF route handlers.

---

## 1. Located Login Implementation Files

| Layer | File Path | Directly Verified |
|---|---|---|
| Primary Web Login Page | `src/app/(web)/auth/login/page.tsx` | Yes |
| Login Modal Component | `src/app/(web)/auth/modals/Login.tsx` | Yes |
| Tabbed Auth Page | `src/app/(web)/auth/page.tsx` | Yes |
| Custom/Annex Login Modal | `src/app/(web)/auth/modals/Annex.tsx` | Yes |
| Client Login Service | `src/lib/services/auth/loginService.ts` | Yes |
| Client Social Service | `src/lib/services/auth/socialService.ts` | Yes |
| Client Session Cookie Utility | `src/lib/utils/sessions/generateSystemUserSessionCookies.ts` | Yes |
| Next.js BFF Login Route | `src/app/api/auth/login/route.ts` | Yes |

---

## 2. Exact Visible Login Field Inventory (`src/app/(web)/auth/login/page.tsx` & `src/app/(web)/auth/modals/Login.tsx`)

| Visible Label | Input Type | Form State / Name | Required | Frontend Validation | Default | Conditional | Backend Mapping | Source File | Directly Verified |
|---|---|---|---|---|---|---|---|---|---|
| `Enter your Email` | `email` | `form.email` (`name="email"`) | Yes (`required`) | HTML5 `type="email"` + `required` | `""` (or prefilled from `?registered=true&email=...`) | No | `email` | `src/app/(web)/auth/login/page.tsx` (L366–375) | Yes |
| `Enter Your Password` | `password` / `text` (eye toggle) | `form.password` (`name="password"`) | Yes when `loginMethod === "password"` | HTML5 `required`, `maxLength={32}` | `""` | Hidden only if `loginMethod !== "password"` (hardcoded `"password"`) | `password` | `src/app/(web)/auth/login/page.tsx` (L379–401) | Yes |
| `Remember me` | `checkbox` | `form.remember` (`name="remember"`) | No | None | `false` | No | `remember` | `src/app/(web)/auth/login/page.tsx` (L404–415) | Yes |
| `Continue with Google (Gmail)` | `button` | N/A (social redirect) | No | N/A | N/A | No | Redirects to `/api/auth/social/google` | `src/app/(web)/auth/login/page.tsx` (L247–254) | Yes |

### Features Checked vs. Actually Present in UI
- **Email and password:** Present.
- **PIN-based login:** `form.pin` state and `LoginCredentials` union exist in `loginService.ts`, **but `loginMethod` is hardcoded to `"password"` (`const loginMethod: "password" | "pin" = "password";` at L75) and no PIN input or method selector is rendered in the UI.**
- **Login method selection:** Not present in UI.
- **Login provider selection:** Not present in UI; hardcoded to `LoginProvider: "email"`.
- **Social authentication:** Google (`google`) button present via `redirectToSocialProvider`.
- **Deslizar challenge:** **Not present as a visible widget.** Hardcoded static string sent instead.
- **Remember-me:** Present (`form.remember`).
- **Password visibility toggle:** Present (`FaEye` / `FaEyeSlash`).
- **Forgot-password flow:** Present (`Link` to `/auth/recovery/password`).

---

## 3. Complete Login Payload Trace

1. **Visible Form Inputs:** `email`, `password`, `remember`.
2. **Hardcoded / Configuration-Derived Properties in `login/page.tsx` (L143–154):**
   - `pin: ""`
   - `loginMethod: "password"`
   - `LoginProvider: "email"` (exact PascalCase capitalization)
   - `loginProviderPayload: "Void"`
   - `dashboardName: "web"`
   - `role: "Learner"`
   - `challenge: "learner.login.skew8lancasto"` (static string; `"custom.login.skew8lancasto"` in `Annex.tsx` when `targetMode` is active)
3. **Internally Generated Properties in `loginService.ts` (L76–86):**
   - `fingerprint`: 64-character random alphanumeric string persisted in cookie `skew_blanc_session_fingerprint`.
   - `ipAddress`: Resolved client-side and cached in cookie.
4. **BFF Route (`src/app/api/auth/login/route.ts`, L40–67):**
   - Forwards JSON body to `POST ${backendBaseUrl}/api/castoline/auth/login` with `Content-Type: application/json` and `getSiteHeaders()` (`x-site-key`, `x-site-domain`, etc.).
   - Extracts `user?.castoBadge` and `user?.castoLine` into `casto_badge` and `casto_line` in the JSON response body.
5. **Session Handling (`loginService.ts` L89–91 & `generateSystemUserSessionCookies.ts` L69–73):**
   - Writes **JavaScript-readable** cookies `skew_blanc_session_badge` and `skew_blanc_session_line` via `document.cookie` (`SameSite=Strict`, `Secure` in prod, **NOT `HttpOnly`**).
   - **Security Note:** NURVIA intentionally does **not** copy this JS-readable cookie pattern and preserves its `HttpOnly` server-owned session cookies.
