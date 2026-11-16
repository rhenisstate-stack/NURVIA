# NURVIA Phase 3 — Application Identity Acceptance Report

**Project:** NURVIA (`apps/web`)  
**Backend Origin:** `https://explicitbackend.com`  
**Confirmed Domain:** `https://nurvia-black.vercel.app`  
**Provisioning Model:** Automatic provisioning by LexmaCasto  
**Application Key Status:** Configured server-side in `apps/web/.env.local` (`appKeyConfigured: true`, `appKeyLength: 10`; value redacted)

---

## 1. Root-Cause Defect Found & Fixed During Phase 3 Identity Verification

- **P3-ID-01 (`apps/web/lib/api-config.mjs`):** `resolveApplicationIdentity` previously checked `/[\r\n\s]/.test(appKey)` which rejected keys containing internal spaces. Updated to reject only control/CRLF/NUL characters (`/[\r\n\0\x01-\x1F\x7F]/`) in `appKey` while preserving strict whitespace rejection in `appDomain`.
- Verified via `lexmacasto-integration.test.mjs` (#1) and live server configuration check (`{ appKeyConfigured: true, appKeyLength: 10, appDomain: 'https://nurvia-black.vercel.app', backendBaseUrl: 'https://explicitbackend.com', isHttps: true }`).

## 2. Live Backend Identity Acceptance Evidence (`https://explicitbackend.com`)

| Endpoint | Method | Site Headers Sent | HTTP Status | Observed Response | Identity Conclusion |
|---|---|---|---|---|---|
| `/api/castoline/system/user/list/current?fetchtype=current` | `GET` | `x-site-key`, `x-site-domain` | `401` | `{"error":"Missing Casto authentication headers"}` | **ACCEPTED** — Progressed past `400 Missing site headers` to Casto auth check |
| `/api/castoline/strata/main/categories/list/absolute?fetchtype=absolute` | `GET` | `x-site-key`, `x-site-domain` | `200` | `{"success":true,"message":"Categories Fetched Successfully ⚓",...}` | **ACCEPTED** |
| `/api/castoline/strata/assessment/sections/list/absolute?fetchtype=absolute` | `GET` | `x-site-key`, `x-site-domain` | `200` | `{"success":true,"message":"Absolute Sections Fetched Successfully ⚓","data":{"items":[...7 items],...}}` | **ACCEPTED** |
| `/api/castoline/strata/assessment/questions/list/absolute?fetchtype=absolute` | `GET` | `x-site-key`, `x-site-domain` | `200` | `{"success":true,"message":"Absolute Questions Fetched Successfully ⚓","data":{"items":[...20 items],"skewTotal":114349,...}}` | **ACCEPTED** |
| `/api/castoline/auth/login` | `POST` | `x-site-key`, `x-site-domain` | `401` | `{"error":"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"}` | **ACCEPTED** — Reached credential validation |

## 3. Gate Status

- **G2 (Correct application key configured):** **PASS**
- **G3 (Correct NURVIA domain configured):** **PASS**
- **G4 (Required headers generated server-side):** **PASS**
- **G5 (LexmaCasto accepts NURVIA application identity):** **PASS**
- **G6 (All backend request paths use the correct identity):** **PASS**
