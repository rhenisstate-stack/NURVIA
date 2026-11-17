# QLEX_04 — REGISTRATION AUDIT

## 1. Implementation Overview
- **Pages & Modals:** `src/app/(web)/auth/register/page.tsx`, `src/app/(web)/auth/modals/Register.tsx`, and per-dashboard `src/app/dashboards/*/auth/register/page.tsx`.
- **Service:** `registerUser()` (`src/lib/services/auth/registerService.ts`) -> `POST /api/auth/register` -> `POST {backend}/api/castoline/auth/register`.
- **Fields:** `username`, `email`, `phone` (`react-phone-number-input` with `CountryCode`, default `"US"`), `password`, `confirmPassword`, optional `pin` / `pin_confirmation`, `loginMethod` (`"password" | "pin" | "both"`), `agree` (Terms checkbox), hidden `role: "Learner"`, `dashboardName: "web"`, `provider: "email"`, `challenge: "register-skew8@lancasto"`.

## 2. Verified Defects & Risks
1. **PIN Confirmation Dropped (`P1`):** `registerService.ts` (line 43) sends `pin_confirmation`, but `src/app/api/auth/register/route.ts` (line 55) reads `body.pinConfirmation`, forwarding `undefined` to the backend.
2. **`providerPayload` Dropped (`P2`):** `registerService.ts` sends `providerPayload`, which `register/route.ts` omits when constructing the backend payload.
3. **Plaintext Credential Logging (`P1`):** `registerService.ts` (line 31) logs the full `data` object (including password/PIN) to the browser console; `api/auth/register/route.ts` (line 39) logs the full request body to the server console.
4. **Browser Test Status (`BLOCKED / UNVERIFIED`):** During live browser testing on `/auth/register`, SSR HTML included the form (`StatusCode: 200`, `HasForm: True`), but client hydration hit `/api/auth/session` HTTP 500 and the form did not become interactive in the browser session. End-to-end backend account creation could not be verified.
