# API and Backend Dependency Register (Final)

- **External Shared Backend:** `https://explicitbackend.com` (LexmaCasto — strictly read-only/unmodified).
- **Application Identity:** `WEBSITE_11` (via server-only `SKEW_LINE_APP_KEY`).
- **Session Transport:** Server-side `HttpOnly`, `SameSite=Lax`, production `Secure` cookies (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`) bridged to upstream `x-casto-line` and `x-casto-badge` via `getNurviaCastoSessionHeaders()`.

## Endpoint Verification Classification

| Route Group / Endpoint | Upstream LexmaCasto Target | Local Implementation | Local Test Status | Upstream / Live Status |
|---|---|---|---|---|
| `POST /api/auth/login` | `/api/castoline/auth/system/login` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `POST /api/auth/register` | `/api/castoline/auth/system/register` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `POST /api/auth/logout` | `/api/castoline/auth/system/logout` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `POST /api/auth/recovery/password` | `/api/castoline/auth/system/recovery/password` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `POST /api/auth/recovery/social` | `/api/castoline/auth/system/recovery/social` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `BLOCKED_EXTERNAL_DEPENDENCY` |
| `POST /api/auth/account/destroy` | `/api/castoline/auth/system/destroy` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET /api/auth/session` | `/api/castoline/auth/system/user` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET /api/auth/validate` | `/api/castoline/strata/support/validate` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET/POST /api/auth/social/*` (7 routes) | `/api/castoline/auth/social/*` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `BLOCKED_EXTERNAL_DEPENDENCY` (OAuth provider credentials / callback registration on LexmaCasto) |
| `POST /api/auth/support/*` (7 routes) | `/api/castoline/auth/support/*` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET/DELETE /api/seek` | `/api/castoline/strata/seek/*` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET /api/media/[...path]` | `/media/*` (allowlisted prefixes) | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `BLOCKED_EXTERNAL_DEPENDENCY` (Upstream media bucket provisioning) |
| `POST /api/exams/upserts` | `/api/castoline/strata/assessment/exam/upserts` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `BLOCKED_EXTERNAL_DEPENDENCY` (Live exam session provisioning on LexmaCasto) |
| `GET/POST/PUT/DELETE /api/nexus/strata/*` (26 routes) | `/api/castoline/strata/*` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET/POST/PUT/DELETE /api/nexus/dominion/subscription/*` (2 routes) | `/api/castoline/dominion/subscription/*` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET/POST/PUT/DELETE /api/system/*` (4 routes) | `/api/castoline/system/*` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
| `GET/POST/PUT/DELETE /api/users/*` (5 routes) | `/api/castoline/system/user*` | `LOCAL_IMPLEMENTATION_VERIFIED` | `LOCAL_TEST_VERIFIED` | `UPSTREAM_CONTRACT_VERIFIED` |
