# NURVIA Phase 3.8 — Backend Contract Report

**Hosted Backend:** `https://explicitbackend.com` (`SKEW_LINE_DOTNET_BASE_URL`)  
**Application Identity:** `website 11` (`SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`, `SKEW_LINE_APP_NAME`)

---

## 1. Centralized Backend Client (`apps/web/lib/lexmacasto/client.ts`)

- Resolves backend origin fail-closed via `lib/api-config.mjs` (enforces HTTPS in production).
- Enforces server-owned `x-site-key`, `x-site-domain`, `x-site-name`, `x-site-brouser`, `x-site-ip-address`, `x-site-location`, `x-site-country`, `x-site-mobile`, `x-site-path`, `x-site-time`, `x-site-referrer`, `x-site-request-id`.
- Enforces server-owned `x-casto-line` and `x-casto-badge` from `HttpOnly` cookies.
- Enforces `assertSafeBackendPath()`, `20s` timeout, `redirect: 'manual'` (treats `3xx` as unavailable), safe HTML/JSON/plain-text parsing, `Cache-Control: no-store`, and `classifyBackendErrorCode()`.

## 2. Live Non-Destructive Contract Verification (`2026-11-17`)

- `POST /api/castoline/auth/login` (with `challenge: "learner.login.skew8lancasto"`, redacted non-existent email) → `401` `{"error":"Your Account Does not Exist in our System  ⚓"}` (**challenge accepted**).
- `POST /api/castoline/auth/register` (with `challenge: "register-skew8@lancasto"`, no `agree`) → `401` `{"error":"You Must Agree to the Terms and Conditions ⚓"}` (**challenge accepted**).
- `GET /api/castoline/system/user/list/current?fetchtype=current` (no session) → `401` `{"error":"Missing Casto authentication headers"}`.
- `GET /api/castoline/strata/seek/{absolute,distinct,suggest,history}` → **LIVE** (`400`/`401`/`200`).
- `POST /api/castoline/strata/assessment/exams/diy/learning/store` → **LIVE** (`400` validation).
- `POST /api/castoline/auth/account/destroy` → **LIVE** (`400` validation).
- `GET /api/castoline/strata/support/validate` → **LIVE** (`400` validation).
- `GET /api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute` → **LIVE** (`200`).
- `POST /api/castoline/strata/learning/courses/store` → **LIVE** (`400` validation).
