# NURVIA Phase 3.1 — Deployment Verification Report

**Date:** 2026-11-16  
**Production URL:** `https://nurvia-black.vercel.app`  
**Local HEAD Commit:** `b3b7c0a` (with uncommitted Phase 2, Phase 3, and Phase 3.1 changes)

---

## 1. Local Production Build (`next build`)

- `npx tsc --noEmit` -> Exit 0
- `npm run lint` -> Exit 0 (warnings only, 0 errors)
- `npm run build` -> Exit 0; route manifest confirms `/api/auth/config-status`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/register`, `/api/backend/[...path]`, `/api/strata/[resource]`.

## 2. Live Production Deployment Status (`https://nurvia-black.vercel.app`)

| Route | Expected | Observed Live | Status |
|---|---|---|---|
| `/api/auth/config-status` | `200 OK` JSON (no secrets) | `404 Not Found` (Next.js `/404` HTML) | **FAIL (Stale Deployment)** |
| `/api/auth/me` | `401 Unauthorized` JSON (`no-store`) | `404 Not Found` (Next.js `/404` HTML) | **FAIL (Stale Deployment)** |
| `/api/backend/auth/me` | Not requested by frontend; `404` JSON from proxy | `404` `text/plain` `X-Vercel-Error: DNS_HOSTNAME_RESOLVED_PRIVATE` | **FAIL (Stale Deployment)** |
| `/api/backend/auth/csrf` | Not requested by frontend | `404` `text/plain` `X-Vercel-Error: DNS_HOSTNAME_RESOLVED_PRIVATE` | **FAIL (Stale Deployment)** |

**Blocker:** No Vercel CLI authentication (`VERCEL_TOKEN`) is available in this environment, and Phase 2/3/3.1 changes are uncommitted locally. Deployment to Vercel must be triggered from the updated repository with `SKEW_LINE_DOTNET_BASE_URL=https://explicitbackend.com`, `SKEW_LINE_APP_KEY`, and `SKEW_LINE_APP_DOMAIN=https://nurvia-black.vercel.app`.
