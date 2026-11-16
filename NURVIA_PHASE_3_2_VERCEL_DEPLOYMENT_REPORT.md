# NURVIA Phase 3.2 — Vercel Deployment Report

**Date:** 2026-11-16  
**Production URL:** `https://nurvia-black.vercel.app`  
**Expected Commit:** `6ed4ad7` (on `origin/master`)

---

## Deployment & Configuration Status

- **Vercel CLI / Token Access:** **UNAVAILABLE** in this environment (`vercel` CLI not installed; no `VERCEL_*` credentials in environment; no `.vercel/project.json`).
- **Production Environment Variable Verification (G6):** **BLOCKED** (requires Vercel Dashboard or authenticated CLI access to verify `SKEW_LINE_DOTNET_BASE_URL=https://explicitbackend.com`, `SKEW_LINE_APP_KEY`, and `SKEW_LINE_APP_DOMAIN=https://nurvia-black.vercel.app` in Production scope).
- **Live Deployment Status (G9):** **FAIL / BLOCKED** — despite `6ed4ad7` being present on `origin/master`, `https://nurvia-black.vercel.app` still serves the stale pre-Phase-1 build (`Last-Modified: Mon, 16 Nov 2026 10:42:19 GMT`, `404` on `/api/auth/me` and `/api/auth/config-status`).
- **Required Dashboard Action:** In Vercel Project Settings for `nurvia-black`:
  1. Confirm **Root Directory** is `apps/web` and **Production Branch** is `master`.
  2. Confirm Production env vars: `SKEW_LINE_DOTNET_BASE_URL=https://explicitbackend.com`, `SKEW_LINE_APP_KEY` (dedicated NURVIA key), `SKEW_LINE_APP_DOMAIN=https://nurvia-black.vercel.app`, `SKEW_LINE_ACTIVE_BACKEND=dotnet`.
  3. Trigger a fresh Production deployment from `master` (`6ed4ad7`+) and inspect build logs if a previous build failed `next.config.mjs` HTTPS validation.
