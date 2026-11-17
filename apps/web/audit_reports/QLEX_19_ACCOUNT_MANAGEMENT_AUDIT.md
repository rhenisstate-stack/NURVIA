# QLEX_19 — ACCOUNT MANAGEMENT AUDIT

## 1. Implemented Account & Settings Routes
- **Profile View & Edit:** `dashboards/*/auth/account/show/page.tsx`, `edit/page.tsx`, `(web)/pages/profile/{account,edit}/page.tsx`.
- **Security Settings:** `dashboards/*/auth/account/security/{2fa,password,profile}/page.tsx` and `(web)/auth/update/{2fa,password}/page.tsx`.
- **Verification:** `dashboards/*/auth/account/verify/{email,phone}/page.tsx` and `(web)/auth/validate/...`.
- **Account Deletion:** `POST /api/auth/account/destroy` -> `POST {backend}/api/castoline/auth/account/destroy` (requires `guidId`, `email`, optional `reason`, plus `x-casto-line`/`x-casto-badge`).
- **Logout:** `dashboards/*/auth/logout/page.tsx` and `(web)/auth/logout/page.tsx` -> `dynamicLogoutService()` -> `POST /api/auth/logout` (`distinct` or `relative`) + clears client cookies.
- **Live Status:** `UNVERIFIED` (blocked by unauthenticated state; destructive account operations intentionally not executed).
