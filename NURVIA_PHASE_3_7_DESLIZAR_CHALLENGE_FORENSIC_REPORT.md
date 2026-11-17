# NURVIA Phase 3.7 — Deslizar Challenge Forensic Report

**Investigation Target:** Complete `C:\Users\gitau\Documents\Qlex\src` codebase and hosted LexmaCasto backend (`https://explicitbackend.com`).  
**Primary Question:** *Does Qlex genuinely implement Deslizar, or does it merely submit a predetermined value that happens to reach a particular backend response?*

---

## Executive Conclusion

**Qlex does NOT implement Deslizar.**

A complete recursive search of `C:\Users\gitau\Documents\Qlex\src` found:
- **0 occurrences** of `Deslizar`, `Ultimatum`, `Turmoil`, or any challenge-issuance/verification endpoint.
- **0 external CAPTCHA/slider SDKs** in `C:\Users\gitau\Documents\Qlex\package.json`.
- **0 challenge UI components, iframes, hooks, or verification routes**.
- **100% hardcoded static strings** in every Qlex registration, login, social redirect, and One Tap flow.

---

## C1. Challenge Initialization

- **Finding:** Qlex calls **no** challenge initialization endpoint before registration or login.
- **Evidence:** All 59 files in `src/app/api` and all services in `src/lib/services/auth/*` were inspected. No challenge-fetch or challenge-init route exists.

## C2. Challenge Rendering

- **Finding:** No challenge UI is rendered anywhere in Qlex.
- All `slider` matches in Qlex (`StatSlider` in `src/app/dashboards/*/vista/assessment/**`) are assessment statistic progress bars, unrelated to authentication.

## C3. Challenge Completion

- **Finding:** There is no user interaction, no signed provider token, and no verification step.

## C4. Authentication Integration

In Qlex, `challenge` is passed as a JSON body field (or query parameter on social OAuth redirects) directly from the client:
- **Registration (`registerService.ts` → `/api/auth/register` → `/api/castoline/auth/register`):** forwards `challenge: body.challenge`.
- **Login (`loginService.ts` → `/api/auth/login` → `/api/castoline/auth/login`):** `login/route.ts` forwards `JSON.stringify(body)` verbatim, which includes `challenge` from the client component.
- **Google One Tap (`socialService.ts` → `/api/auth/social/onetap`):** forwards `challenge: body.challenge ?? "learner.login.skew8lancasto"`.

## C5. Hardcoded Values Found in Qlex (Unsuitable for Migration)

| Context | Hardcoded String | Locations in Qlex |
|---|---|---|
| Registration | `"register-skew8@lancasto"` | `src/app/(web)/auth/register/page.tsx:212`, `src/app/(web)/auth/page.tsx:230`, `src/app/(web)/auth/modals/Register.tsx:161`, `src/app/(web)\auth\modals\auth.tsx:245`, `src/app/dashboards/*/auth/register/page.tsx:238`, `src/lib/services/auth/socialService.ts:63,135` |
| Standard Login | `"learner.login.skew8lancasto"` | `src/app/(web)/auth/login/page.tsx:152,165`, `src/app/(web)/auth/page.tsx:131`, `src/app/(web)/auth/modals/Login.tsx:108,120`, `src/app/(web)/auth/modals/auth.tsx:145`, `src/app/(web)/auth/modals/Annex.tsx:14`, `src/app/dashboards/*/auth/login/page.tsx:157,170`, `src/app/api/auth/social/onetap/route.ts:54`, `src/lib/services/auth/socialService.ts:62,134` |
| Custom Login | `"custom.login.skew8lancasto"` | `src/app/(web)/auth/modals/Annex.tsx:15` |

Notice the strings embed Qlex's own legacy identifier (`skew8lancasto` / `skew8@lancasto`). They are **not** official Deslizar tokens and must **never** be copied into NURVIA.

## C6. Classification & Impact on NURVIA (`website 11`)

- **Hosted Backend Behavior (`2026-11-17T05:38:19Z`–`05:38:35Z`):**
  - `POST /api/castoline/auth/register` without `challenge` → `400` `{"errors":{"Challenge":["The Challenge field is required."]}}`.
  - `POST /api/castoline/auth/login` with valid credentials shape and without `challenge` → `401` `{"error":"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"}`.
- **Classification:** **BLOCKED (External Backend Dependency)**. Because neither Qlex nor public LexmaCasto documentation provides a genuine Deslizar challenge issuance/verification contract for `website 11`, NURVIA **must not** fabricate or hardcode challenge values. NURVIA's Deslizar integration remains explicitly **BLOCKED** pending backend owner provisioning/documentation.
