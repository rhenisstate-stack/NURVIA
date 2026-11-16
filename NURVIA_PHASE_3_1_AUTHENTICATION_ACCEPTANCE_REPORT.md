# NURVIA Phase 3.1 — Authentication Acceptance Report

**Date:** 2026-11-16  
**Local Build Verified:** `apps/web` (`next start -p 4197`) against `https://explicitbackend.com` and local mock backend  
**Live Production URL:** `https://nurvia-black.vercel.app`

---

## 1. Local & Integration Verification (Mock + Live Backend Non-Mutating)

- **Config Status (`GET /api/auth/config-status`):** Returned `200 OK`, `Cache-Control: no-store`, `appKeyConfigured: true`, `appDomainConfigured: true`, `isHttps: true`, with zero secret leakage.
- **Unauthenticated Current User (`GET /api/auth/me`):** Returned `401 Unauthorized`, `Cache-Control: no-store`, `{"success":false,"message":"Not authenticated.","errorCode":"UNAUTHORIZED"}`.
- **Login Contract (`POST /api/auth/login` -> `https://explicitbackend.com/api/castoline/auth/login`):** With same-origin `Origin`, server-side `x-site-key` and `x-site-domain`, and synthetic invalid credentials, returned `401` from LexmaCasto with `Set-Cookie: null`.
- **Integration Suite (`tests/auth-handlers-integration.test.mjs`):** 9/9 PASS covering `HttpOnly` + `SameSite=Lax` cookie issuance, `castoLine`/`castoBadge` stripping, `GET /api/auth/me` forwarding with `x-casto-line`/`x-casto-badge`, `POST /api/auth/register` (`role: 'Learner'`), `POST /api/auth/logout` (`{ target_dashboard }` + cookie clearing), CSRF rejections, and negative backend responses (`401`, `403`, `429`, `500`, plain-text, invalid JSON).

## 2. Live Production & Authenticated Account Gates

- **Live Production Routes (`https://nurvia-black.vercel.app`):** Currently **FAIL / BLOCKED** because production still serves the pre-Phase-1 deployment.
- **Authenticated Login, Current-User, Session Persistence, Backend Logout Revocation, and Live Registration:** **BLOCKED** — no authorized NURVIA test account credentials are available in this environment, and the updated build has not yet been deployed to Vercel.
