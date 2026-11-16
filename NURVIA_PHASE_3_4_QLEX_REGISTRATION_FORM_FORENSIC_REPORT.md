# NURVIA Phase 3.4 — Qlex-Nursing Registration Form Forensic Report

**Date:** 2026-11-16  
**Reference Repository (READ-ONLY):** `C:\Users\gitau\Documents\Qlex-Nursing`  
**Inspection Method:** Direct read-only source inspection of registration pages, modals, services, and BFF route handlers.

---

## 1. Located Registration Implementation Files

| Layer | File Path | Directly Verified |
|---|---|---|
| Primary Web Registration Page | `src/app/(web)/auth/register/page.tsx` | Yes |
| Registration Modal Component | `src/app/(web)/auth/modals/Register.tsx` | Yes |
| Tabbed Auth Page | `src/app/(web)/auth/page.tsx` | Yes |
| Dashboard Registration Example | `src/app/dashboards/ati-teas/auth/register/page.tsx` | Yes |
| Client Registration Service | `src/lib/services/auth/registerService.ts` | Yes |
| Next.js BFF Registration Route | `src/app/api/auth/register/route.ts` | Yes |

---

## 2. Exact Visible Registration Field Inventory (`src/app/(web)/auth/register/page.tsx`)

| Visible Label | Input Type | Form State / Name | Required | Validation / Constraints | Default | Conditional | Backend Mapping | Source File | Directly Verified |
|---|---|---|---|---|---|---|---|---|---|
| `Enter Username` | `text` | `form.username` (`name="username"`) | Yes (`required`) | HTML5 `required` | `""` | No | `username` | `src/app/(web)/auth/register/page.tsx` (L382–391) | Yes |
| `Enter Your Email` | `email` | `form.email` (`name="email"`) | Yes (`required`) | HTML5 `type="email"` + `required` | `""` | No | `email` | `src/app/(web)/auth/register/page.tsx` (L395–403) | Yes |
| `Enter Phone` | `PhoneInput` (`react-phone-number-input`, international) | `form.phone` (`name="phone"`) | Not enforced in `register/page.tsx` (enforced >=10 digits in `ati-teas` variant) | International format via `PhoneInput` | `""` (`defaultCountry="US"`) | No | `phone` | `src/app/(web)/auth/register/page.tsx` (L407–417) | Yes |
| `Enter Your Password` | `password` / `text` (eye toggle + `Generate` button) | `form.password` (`name="password"`) | Yes when password method active | `maxLength={24}`; `register/page.tsx` checks `length >= 6` (note: `RegisterModal.tsx` displays `At Least 8 Characters` and checks all 4 criteria) | `""` | Shown when `loginMethod` is `"password"` or `"both"` (default `"password"`) | `password` | `src/app/(web)/auth/register/page.tsx` (L441–516) | Yes |
| `Confirm Password` | `password` / `text` (eye toggle) | `form.confirmPassword` (`name="confirmPassword"`) | Yes when shown | Must match `form.password`; `maxLength={24}` | `""` | Shown only when `passwordRequirements.length` is true | `passwordConfirmation` | `src/app/(web)/auth/register/page.tsx` (L520–562) | Yes |
| `I agree to the Terms and Conditions` | `checkbox` | `form.agree` (`name="agree"`) | Yes (checked in `handleRegister`) | `if (!form.agree) alert(...)` | `false` | No | `agree` | `src/app/(web)/auth/register/page.tsx` (L566–580) | Yes |
| `Continue with Google (Gmail)` | `button` | N/A | No | N/A | N/A | No | Redirects to `/api/auth/social/google?context=register` | `src/app/(web)/auth/register/page.tsx` (L277–284) | Yes |

### Fields Not Rendered in UI
- **PIN / Confirm PIN:** `form.pin` and `form.pin_confirmation` exist in component state, but no PIN inputs or `loginMethod` selector are rendered in `register/page.tsx` or `RegisterModal.tsx`.
- **Provider Selection:** Hardcoded to `provider: 'email'` and `providerPayload: 'Void'`.
- **Deslizar Challenge:** No visible widget; hardcoded static string sent instead.

---

## 3. Registration Payload & Session Behavior Trace

1. **Client Service Mapping (`src/lib/services/auth/registerService.ts`, L35–50):**
   - Maps `pin_confirmation` -> `pinConfirmation` (camelCase) for the backend.
   - Sends `username`, `email`, `phone`, `password`, `passwordConfirmation`, `pin`, `pinConfirmation`, `loginMethod`, `agree`, `challenge`, `role` (`"Learner"` from page, fallback `"user"`), `dashboardName` (`"web"`), `provider` (`"email"`), `providerPayload` (`"Void"`).
2. **BFF Route (`src/app/api/auth/register/route.ts`, L45–60):**
   - Forwards payload to `POST ${backendBaseUrl}/api/castoline/auth/register` with `getSiteHeaders()`.
   - Returns backend JSON response directly.
3. **Challenge Value Sent by Qlex-Nursing:**
   - `challenge: "register-skew8@lancasto"` (hardcoded in `register/page.tsx` L212, `modals/Register.tsx` L161, `auth/page.tsx` L230, `modals/auth.tsx` L245, `socialService.ts` L63/135, `dashboards/*/auth/register/page.tsx`).
4. **Session Establishment:**
   - Verified directly: Qlex-Nursing registration does **not** establish a session. On success, `register/page.tsx` (L219) redirects to `/auth/login?registered=true&email=...` so the user logs in separately.
