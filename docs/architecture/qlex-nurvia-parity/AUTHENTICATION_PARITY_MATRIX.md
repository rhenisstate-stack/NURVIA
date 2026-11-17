# 8. AUTHENTICATION & SESSION PARITY MATRIX

| Capability | Qlex Implementation | NURVIA Implementation | Security Delta | Disposition |
|---|---|---|---|---|
| Login (Password / PIN) | `/api/auth/login` returns `casto_badge` & `casto_line` in JSON body to client | `/api/auth/login` sets HttpOnly `nurvia_casto_line` & `nurvia_casto_badge` cookies; never returns tokens to JS | NURVIA is strictly more secure | **EXACT EQUIVALENT** |
| Registration | `/api/auth/register` forwards to `/api/castoline/auth/register` | `/api/auth/register` validates email/PIN/phone + CSRF + sets HttpOnly cookies | NURVIA enforces CSRF + server validation | **EXACT EQUIVALENT** |
| Session Validation | `/api/auth/session` + `document.cookie` (`skew_blanc_session_badge/line`) | `/api/auth/me` reads HttpOnly cookies server-side -> `/api/castoline/system/user/list/current` | CRITICAL: Do NOT import Qlex `document.cookie` pattern | **REPLACE (keep NURVIA)** |
| Logout (Distinct / Relative) | `/api/auth/logout` | `/api/auth/logout` + clears all HttpOnly cookies | NURVIA clears cookies cleanly | **EXACT EQUIVALENT** |
| Password Recovery | `/api/auth/recovery/password` | `/api/auth/recovery/password` | CSRF + no-store | **EXACT EQUIVALENT** |
| Account Destroy | `/api/auth/account/destroy` | `/api/auth/account/destroy` | CSRF + HttpOnly cookie clear | **EXACT EQUIVALENT** |
| Support / 2FA / Email / Phone / Password Update | 7 separate routes under `/api/auth/support/*` | Consolidated `/api/auth/support/[resource]` | CSRF + HttpOnly session | **CONSOLIDATE** |
| Email/Account Validation | `/api/auth/validate` | `/api/auth/validate` | Server-side | **EXACT EQUIVALENT** |
| Social OAuth (Google, Apple, FB, GitHub, LinkedIn, MS, OneTap) | 7 routes under `/api/auth/social/*` + `/api/auth/recovery/social` | Not implemented | Requires WEBSITE_11 OAuth client provisioning on LexmaCasto | **BACKEND DEPENDENCY** |
