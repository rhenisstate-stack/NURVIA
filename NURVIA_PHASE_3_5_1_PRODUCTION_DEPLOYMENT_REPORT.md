# NURVIA Phase 3.5.1 — Production Deployment Verification Report

**Date:** 2026-11-16  
**Gate:** H — Vercel Production Deployment Verification  
**Target URL:** `https://nurvia-black.vercel.app`  
**Status:** PARTIALLY VERIFIED (Live Phase 3.5 behavior confirmed; Vercel deployment SHA metadata inaccessible without Vercel CLI/token)

---

## 1. Deployment Verification Findings

| Property | Observed Status | Evidence |
|---|---|---|
| **Production URL** | `https://nurvia-black.vercel.app` | Reachable over HTTPS with `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` and `x-vercel-id: cpt1::iad1::...` |
| **Production Branch & Remote** | `master` (`origin/master` at `56428ae9ba01138189ae088f9b263f6aea4c6941`) | Verified via `git ls-remote origin refs/heads/master` (`0` ahead, `0` behind) |
| **Phase 3.5 Code Live on Production** | **Confirmed via live behavior** | `GET /sign-up` returns `200` with `Sign-in method` (`Password`/`PIN`/`Both`, added in `14e4e1e`); `POST /api/auth/login` and `POST /api/auth/register` enforce `415` `Content-Type` and `PIN_PATTERN` (`Use a 4 to 12 digit numeric PIN.`, added in `963eb64`). |
| **Production Environment Configuration** | **Configured** | `GET /api/auth/config-status` returns `200` with `appName: "Nurvia"`, `appDomainConfigured: true`, `appKeyConfigured: true`, `activeBackend: "dotnet"`, `isHttps: true`. |
| **Exact Deployed Commit SHA** | **Not directly inspectable** | `vercel` CLI and `gh` CLI are not installed in this environment, and `https://api.github.com/repos/rhenisstate-stack/NURVIA/deployments` returned empty. |

---

## 2. Gate H Assessment

- Phase 3.5 commits (`963eb64`, `14e4e1e`, `1360765`, `119e66d`, `9af94b1`, `56428ae`) are pushed to `origin/master`.
- Live production behavior on `https://nurvia-black.vercel.app` matches the Phase 3.5 implementation.
- Exact Vercel deployment ID, build timestamp, and commit SHA (`56428ae9ba01138189ae088f9b263f6aea4c6941`) cannot be directly read without authenticated Vercel dashboard/CLI access.
