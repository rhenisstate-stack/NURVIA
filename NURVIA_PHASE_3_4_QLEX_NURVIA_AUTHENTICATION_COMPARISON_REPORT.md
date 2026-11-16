# NURVIA Phase 3.4 — Qlex-Nursing vs. NURVIA Authentication Comparison Report

**Date:** 2026-11-16  
**References:** Qlex-Nursing (`C:\Users\gitau\Documents\Qlex-Nursing`), LexmaCasto Contract (`apps/web/lib/lexmacasto/contracts.ts`), NURVIA (`apps/web`).

---

## Side-by-Side Comparison

| Dimension | Qlex-Nursing (Observed Source) | NURVIA (Current Implementation) | Classification / Required Outcome |
|---|---|---|---|
| **Login visible fields** | Email, Password (with eye toggle), Remember me, Google OAuth button | Email, Password (with eye toggle), Forgot password link | **Aligned** for email/password; social OAuth not in NURVIA Phase 3.4 scope |
| **Registration visible fields** | Username, Email, Phone (`PhoneInput`), Password (`Generate` + eye toggle), Confirm Password, Terms checkbox, Google OAuth | Full name (`username`), Email, Phone, Password (with eye toggle), Confirm password, Terms & Privacy checkbox | **Aligned** (NURVIA uses native `tel` input + explicit consent checkbox) |
| **Password validation** | `>= 6` chars (`register/page.tsx`) or `>= 8` + complexity (`RegisterModal.tsx`), `maxLength=24` | `>= 12` chars + confirmation match (`sign-up/page.tsx` & `/api/auth/register`) | **NURVIA stronger** — retain 12-char minimum |
| **PIN support** | State/DTO types exist, **no PIN UI rendered** (`loginMethod` fixed to `"password"`) | DTO & `/api/auth/register` + `/api/auth/login` support `pin` / `pinConfirmation` / `both` | **Aligned** at BFF/DTO layer; email/password is active UI method |
| **Login method** | Hardcoded `"password"` in UI; `"password" \| "pin" \| "both"` in register DTO | Defaults to `"password"`; BFF now strictly validates allowed methods (`password`/`pin` on login, `password`/`pin`/`both` on register) | **Remediated** in Phase 3.4 |
| **Provider selection** | Hardcoded `LoginProvider: "email"` (login) and `provider: "email"` (register) | `/api/auth/login` now defaults `LoginProvider: "email"`; `/api/auth/register` now defaults `provider: "email"` | **Remediated** in Phase 3.4 |
| **Consent (`agree`)** | Checkbox validated via `alert()` in UI; forwarded as `agree` | Required checkbox in UI; server-enforced `agree === true` in `/api/auth/register` | **NURVIA stronger** — retained |
| **Phone validation** | `PhoneInput` in UI; optional in `register/page.tsx`, required in `ati-teas` variant | Required in UI (`sign-up/page.tsx`) and server-enforced in `/api/auth/register` | **Aligned** with LexmaCasto (`"Phone Number is Required ⚓"`) |
| **Challenge widget** | **None** (hardcodes `skew8lancasto` strings) | **None** (awaits genuine LexmaCasto Deslizar spec/provisioning — `EXT-3.4-01`) | **External dependency open** — no fabrication |
| **Challenge token** | Hardcoded `"learner.login.skew8lancasto"` / `"register-skew8@lancasto"` | Forwarded if supplied; never hardcoded or fabricated | **Compliant** |
| **Request payload** | CamelCase `pinConfirmation`, `passwordConfirmation`, `LoginProvider` | Exact match (`pinConfirmation`, `passwordConfirmation`, `LoginProvider`, server-enforced `role: "Learner"`) | **Aligned** |
| **Error handling** | Parses ASP.NET `errors` dictionary in `loginService.ts`; `alert()` in register | `lexmaCastoRequest` parses `ValidationProblemDetails` (`title`, `detail`, `errors` dict) & redacts sensitive strings | **NURVIA stronger** |
| **Session creation** | **Insecure JS-readable** cookies via `document.cookie` | **HttpOnly, SameSite=Lax, Secure (prod)** server-set cookies | **NURVIA stronger** — preserved |
| **Logout** | Calls `/api/auth/logout` + clears JS cookies | Calls `POST /api/castoline/auth/logout/sessions/distinct` or `relative` + clears HttpOnly cookies | **NURVIA stronger** — preserved |
