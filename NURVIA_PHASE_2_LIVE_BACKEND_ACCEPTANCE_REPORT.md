# NURVIA Phase 2 — Live Backend Acceptance Report

**Target Backend Origin:** `https://explicitbackend.com`  
**Configured NURVIA Domain:** `https://nurvia-black.vercel.app`  
**Dedicated NURVIA `SKEW_LINE_APP_KEY`:** Not yet provisioned (`apps/web/.env.local` key length = 0)

---

## 1. Non-Mutating Live Verification Observed

| Endpoint | Method | Headers | HTTP Status | Observed Body | Result |
|---|---|---|---|---|---|
| `/api/castoline/system/user/list/current?fetchtype=current` | `GET` | None | `400` | `{"error":"Missing site headers"}` | **PASS** (TLS & site-header gate active) |
| `/api/castoline/strata/main/categories/list/absolute?fetchtype=absolute` | `GET` | None | `400` | `{"error":"Missing site headers"}` | **PASS** (TLS & site-header gate active) |
| `/api/castoline/strata/assessment/exams/list/live?fetchtype=live` | `GET` | None | `400` | `{"error":"Missing site headers"}` | **PASS** (TLS & site-header gate active) |
| `/api/castoline/auth/login` | `POST` | `Content-Type: application/json` | `400` | `{"error":"Missing site headers"}` | **PASS** (TLS & site-header gate active) |

## 2. Blocked Live Acceptance Gates

- **G11 (NURVIA Application Identity Accepted):** `BLOCKED — EXTERNAL DEPENDENCY` — `SKEW_LINE_APP_KEY` is unprovisioned; NURVIA fails closed with `MISSING_APP_KEY` (`HTTP 503`) and never borrows Qlex-Nursing's `WEBSITE_1` identity.
- **G18 (Live Authenticated Backend Workflows — Login, Current User, Registration, Logout, Authenticated Academic Data):** `BLOCKED — EXTERNAL DEPENDENCY` — Requires provisioned `SKEW_LINE_APP_KEY`, confirmed domain registration, and an authorized NURVIA test account.
