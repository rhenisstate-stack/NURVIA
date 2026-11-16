# NURVIA Phase 3.2 — Production Route Acceptance Report

**Date:** 2026-11-16  
**Target:** `https://nurvia-black.vercel.app`

---

## Live Production Probes (2026-11-16T11:14:46Z)

| Route | Expected | Observed Live | Status |
|---|---|---|---|
| `GET /api/auth/config-status` | `200 OK` JSON (`no-store`, no secrets) | `404 Not Found` (`text/html`, `X-Matched-Path: /404`) | **FAIL** |
| `GET /api/auth/me` | `401 Unauthorized` JSON (`no-store`) | `404 Not Found` (`text/html`, `X-Matched-Path: /404`) | **FAIL** |
| `GET /api/backend/auth/me` | Not requested by frontend; `404` JSON from proxy | `404 Not Found` (`text/plain`, 99 bytes, `X-Vercel-Error: DNS_HOSTNAME_RESOLVED_PRIVATE`) | **FAIL** |
| `GET /api/backend/auth/csrf` | Not requested by frontend | `404 Not Found` (`text/plain`, 99 bytes, `X-Vercel-Error: DNS_HOSTNAME_RESOLVED_PRIVATE`) | **FAIL** |

**Vercel Private-Hostname Finding (Gate G):** `DNS_HOSTNAME_RESOLVED_PRIVATE` on `/api/backend/auth/me` and `/api/backend/auth/csrf` is caused by the stale pre-Phase-1 deployment's `next.config.mjs` rewrite (`/api/backend/:path*` -> private/localhost `apiBase`). In the local `6ed4ad7` build, `next.config.mjs` has no `rewrites()` and enforces HTTPS in production.
