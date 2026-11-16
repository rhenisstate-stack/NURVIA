# NURVIA Phase 3.1 — Production Route Forensic Report

**Date:** 2026-11-16  
**Repository:** `C:\Users\gitau\Documents\NURVIA` (`master` @ `b3b7c0a`, with uncommitted Phase 2/3/3.1 remediation changes)  
**Production URL:** `https://nurvia-black.vercel.app`  
**Verified Backend Origin:** `https://explicitbackend.com`

---

## 1. Live Production Reproduction

Direct HTTP probes against `https://nurvia-black.vercel.app` reproduced both reported production failures:

| Probe | HTTP Status | Server / Error Header | Content-Type | Body / Observation |
|---|---|---|---|---|
| `GET /api/backend/auth/me` | `404 Not Found` | `Server: Vercel`, `X-Vercel-Error: DNS_HOSTNAME_RESOLVED_PRIVATE` | `text/plain; charset=utf-8` | `The page could not be found\n\nDNS_HOSTNAME_RESOLVED_PRIVATE\n\n...` (99 bytes) |
| `GET /api/backend/auth/csrf` | `404 Not Found` | `Server: Vercel`, `X-Vercel-Error: DNS_HOSTNAME_RESOLVED_PRIVATE` | `text/plain; charset=utf-8` | `The page could not be found\n\nDNS_HOSTNAME_RESOLVED_PRIVATE\n\n...` (99 bytes) |
| `GET /api/auth/me` | `404 Not Found` | `Server: Vercel`, `X-Matched-Path: /404` | `text/html; charset=utf-8` | Next.js App Router `NotFoundPage` HTML (10,324 bytes) |
| `GET /api/auth/config-status` | `404 Not Found` | `Server: Vercel`, `X-Matched-Path: /404` | `text/html; charset=utf-8` | Next.js App Router `NotFoundPage` HTML (10,324 bytes) |

---

## 2. Root-Cause Findings

1. **Stale Pre-Phase-1 Production Deployment:**  
   The live deployment at `https://nurvia-black.vercel.app` does not contain the Phase 1–3 `/api/auth/*` Next.js Route Handlers (`/api/auth/me`, `/api/auth/config-status` return Next.js `/404` HTML). Instead, it is serving a pre-Phase-1 build (equivalent to `2a47fbe` or earlier, before `b3ab0b7`).
2. **Source of `/api/backend/auth/me` and `/api/backend/auth/csrf`:**  
   In `2a47fbe:apps/web/lib/api-client.ts`, `getApiBase()` returned `/api/backend` in the browser, `buildApiUrl('/api/auth/me')` produced `/api/backend/auth/me`, and `getCsrfToken()` called `buildApiUrl('/api/auth/csrf')` -> `/api/backend/auth/csrf`.
3. **Source of `X-Vercel-Error: DNS_HOSTNAME_RESOLVED_PRIVATE`:**  
   In `2a47fbe:apps/web/next.config.mjs`, `rewrites()` mapped `/api/backend/:path*` to `${apiBase}/api/:path*`. When the deployed Vercel environment's backend URL resolved to a private/internal IP or localhost hostname, Vercel's edge router aborted the rewrite with `404` and `DNS_HOSTNAME_RESOLVED_PRIVATE`.
4. **Source of `Unexpected token 'T', "The page c"... is not valid JSON`:**  
   Pre-Phase-1 `api-client.ts` called `response.json()` blindly on Vercel's 99-byte `text/plain` 404 body. Even in the uncommitted Phase 2/3 `api-client.ts`, `request()` lacked `Content-Type` inspection, a shared `parseApiResponse()` helper, and null/primitive JSON guards.
5. **Local Working Tree & Build Verification:**  
   In the current local repository, `apps/web/next.config.mjs` has no `rewrites()`, enforces `requireHttps: process.env.NODE_ENV === 'production'`, and `next build` registers all 5 dedicated auth routes (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/config-status`).

---

## 3. Route-Reference Inventory (Current Local Codebase)

| File & Line | Generated URL | Method | Caller | Destination | Execution Context | Status |
|---|---|---|---|---|---|---|
| `apps/web/lib/api-url.mjs:29-31` & `apps/web/lib/api-client.ts:212` | `/api/auth/me` | `GET` | `AuthProvider.refresh()` | Next.js `/api/auth/me` -> `GET /api/castoline/system/user/list/current?fetchtype=current` | Browser -> Server | Current |
| `apps/web/lib/api-client.ts:206` | `/api/auth/login` | `POST` | `AuthProvider.signIn()` | Next.js `/api/auth/login` -> `POST /api/castoline/auth/login` | Browser -> Server | Current |
| `apps/web/lib/api-client.ts:190` | `/api/auth/register` | `POST` | `SignUpPage.handleSubmit()` | Next.js `/api/auth/register` -> `POST /api/castoline/auth/register` | Browser -> Server | Current |
| `apps/web/lib/api-client.ts:217` | `/api/auth/logout` | `POST` | `AuthProvider.signOut()` | Next.js `/api/auth/logout` -> `POST /api/castoline/auth/logout/sessions/distinct` | Browser -> Server | Current |
| `apps/web/app/api/auth/config-status/route.ts:4` | `/api/auth/config-status` | `GET` | Diagnostics / Health | Next.js server config check (no secrets) | Server | Current |
| `apps/web/lib/api-client.ts` (all auth) | None | N/A | N/A | `/api/backend/auth/csrf` & `/api/auth/csrf` removed | N/A | Removed |
