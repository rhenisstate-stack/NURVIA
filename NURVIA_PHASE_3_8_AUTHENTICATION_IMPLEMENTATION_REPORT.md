# NURVIA Phase 3.8 — Authentication Implementation Report

- **Login (`apps/web/app/api/auth/login/route.ts`):** Supports `password` and `pin` login methods, validates inputs with `VALIDATION_ERROR`, enforces `role: 'Learner'` and `dashboardName: 'web'`, attaches `getTemporaryChallenge('standard_login')` server-side, extracts `castoLine` and `castoBadge` server-side into `HttpOnly` cookies, and strips raw credentials from the JSON response.
- **Registration (`apps/web/app/api/auth/register/route.ts`):** Preserves Phase 3.6 E.164 phone normalization, password/PIN validation, consent check, server-enforced `role: 'Learner'`, and attaches `getTemporaryChallenge('register')` server-side.
- **Current User (`apps/web/app/api/auth/me/route.ts`):** Calls `GET /api/castoline/system/user/list/current?fetchtype=current` using `HttpOnly` cookies; clears cookies on `401`.
- **Logout (`apps/web/app/api/auth/logout/route.ts`):** Supports `distinct` and `relative` session revocation; always clears local `HttpOnly` cookies.
- **Account Destruction (`apps/web/app/api/auth/account/destroy/route.ts`):** Verifies caller `guidId`/`email` server-side via `/api/auth/me` contract before calling `POST /api/castoline/auth/account/destroy`, then clears `HttpOnly` cookies.
- **Support Validation (`apps/web/app/api/auth/validate/route.ts`):** Proxies `GET /api/castoline/strata/support/validate` with `token` and `context`.
