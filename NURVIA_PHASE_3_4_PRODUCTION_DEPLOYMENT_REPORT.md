# NURVIA Phase 3.4 — Production Deployment Report

**Date:** 2026-11-16  
**Project:** `nurvia-black` (`apps/web`, production branch `master`)  
**Production URL:** `https://nurvia-black.vercel.app`  
**Verified Commit:** `4e846bc` (`origin/master`)

---

## 1. Pre-Deployment Verification
- `git status` confirmed only NURVIA files were modified (`Qlex-Nursing` and `https://explicitbackend.com` untouched).
- `npx tsc --noEmit`, `npm run lint`, `npm test`, `node tests/auth-handlers-integration.test.mjs`, `npm run build`, and client bundle secret scan all passed prior to push.
- Commit `4e846bc` pushed to `origin/master`.

---

## 2. Live Production Endpoint Verification (`https://nurvia-black.vercel.app`)

| Endpoint | Request | Observed Status | `Cache-Control` | Observed Response |
|---|---|---|---|---|
| `GET /api/auth/config-status` | Unauthenticated | `200 OK` | `no-store` | `{"success":true,"data":{"appName":"Nurvia","appTitle":"Nurvia","appDomainConfigured":true,"appKeyConfigured":true,"activeBackend":"dotnet","isHttps":true}}` |
| `GET /api/auth/me` | Unauthenticated | `401 Unauthorized` | `no-store` | `{"success":false,"message":"Not authenticated.","errorCode":"UNAUTHORIZED"}` |
| `POST /api/auth/register` | Same-origin `loginMethod: "invalid"` | `400 Bad Request` | `no-store` | `{"success":false,"message":"Unsupported login method.","errorCode":"VALIDATION_ERROR"}` |
| `POST /api/auth/login` | Same-origin `loginMethod: "invalid"` | `400 Bad Request` | `no-store` | `{"success":false,"message":"Unsupported login method."}` |

- The `"Unsupported login method."` responses on both `/api/auth/register` and `/api/auth/login` confirm that commit `4e846bc` is actively deployed and serving on `https://nurvia-black.vercel.app`.
- No secrets, private keys, or unexpected HTML/404 responses were observed.
