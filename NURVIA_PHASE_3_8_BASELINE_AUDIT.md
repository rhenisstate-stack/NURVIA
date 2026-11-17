# NURVIA Phase 3.8 — Baseline Audit

**Date:** `2026-11-17`  
**Branch:** `feature/phase-3-8-qlex-api-parity` (branched from `phase-3.7-qlex-forensic-migration`)  
**Phase 3.6 Baseline Commit:** `50c58f0ae1b01db3f96423dece16df1b811bdec2`  
**Reference Source:** `C:\Users\gitau\Documents\Qlex\src\app\api` (59 route files)  
**Target:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Established Phase 3.6 & 3.7 Starting State

- **NURVIA Application Identity:** `website 11` (`SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`, `SKEW_LINE_APP_NAME` configured server-side; isolated from Qlex `WEBSITE_1`).
- **Existing NURVIA API Routes:** `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/config-status`, `/api/backend/[...path]`, `/api/strata/[resource]`, `/api/avatar/[storageKey]`.
- **Phase 3.7 Additions Preserved:** Granular backend error classification (`CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, `CHALLENGE_EXPIRED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED`), consistent `VALIDATION_ERROR` codes on `/api/auth/login`, sanitized geo/mobile metadata extraction (`x-vercel-ip-country`/`cf-ipcountry`, `x-vercel-ip-city`, `sec-ch-ua-mobile`), and frontend error distinction on `/sign-in` and `/sign-up`.

## 2. Live Hosted Backend Verification (`https://explicitbackend.com`)

Authorized non-destructive probes on `2026-11-17` confirmed:
- **LIVE:** `/api/castoline/strata/seek/{absolute,distinct,suggest,history}`
- **LIVE:** `/api/castoline/strata/assessment/exams/diy/learning/store`
- **LIVE:** `/api/castoline/auth/account/destroy`
- **LIVE:** `/api/castoline/strata/support/validate`
- **LIVE:** `/api/castoline/strata/*/{list/*,store}`
- **LIVE (Challenge-Gated):** `/api/castoline/auth/register`, `/api/castoline/auth/login`
- **LIVE (Auth-Gated):** `/api/castoline/system/user/list/current?fetchtype=current`
- **NOT LIVE (`302` / HTML Page Not Found):** `/api/castoline/auth/system/user`, `/api/castoline/auth/recovery/password`, `/api/castoline/nexus/dominion/subscription-packages/list/absolute`, `/api/castoline/strata/assessment/results/list/current`, `/api/castoline/strata/assessment/exams/upserts`, `/api/castoline/system/user/session/list/current`.
