# NURVIA Phase 3.7 — Route-by-Route API Migration Matrix

| Classification | Meaning |
|---|---|
| **MIGRATE** | Compatible and useful implementation |
| **ADAPT** | Useful implementation requiring NURVIA-specific changes |
| **PRESERVE** | NURVIA implementation is already safer or more appropriate |
| **REJECT** | Insecure, fabricated, obsolete, or incompatible implementation |
| **INVESTIGATE** | Insufficient evidence to determine compatibility |
| **BLOCKED** | Depends on an external backend contract or authorization |

---

## 1. Authentication & Account Routes

| Qlex Source Path | Qlex Behavior | NURVIA Equivalent | Identified Difference | Security Implications | Decision |
|---|---|---|---|---|---|
| `auth/login/route.ts` | Forwards `body` verbatim (incl. hardcoded `challenge`), logs secrets, returns `casto_badge`/`casto_line` to browser JS | `app/api/auth/login/route.ts` | NURVIA uses `HttpOnly` cookies, server-enforced `role: 'Learner'`, CSRF, no hardcoded challenge | Qlex exposes tokens to XSS & logs plaintext passwords | **PRESERVE** (with **ADAPT** on error classification for `CHALLENGE_REJECTED` / `INVALID_CREDENTIALS` / `VALIDATION_ERROR`) |
| `auth/register/route.ts` | Forwards hardcoded `challenge: "register-skew8@lancasto"`, logs plaintext password, trusts client `role` | `app/api/auth/register/route.ts` | NURVIA normalizes phone to E.164, enforces `role: 'Learner'`, omits fabricated challenge | Qlex logs passwords & uses hardcoded `skew8` challenge | **PRESERVE** (Deslizar challenge integration remains **BLOCKED**) |
| `auth/logout/route.ts` | Calls `/logout/sessions/{distinct,relative}`, reads `cookie` + custom headers | `app/api/auth/logout/route.ts` | NURVIA validates CSRF, reads `HttpOnly` cookies server-side, clears cookies | Qlex lacks CSRF check | **PRESERVE** |
| `auth/session/route.ts` | Calls `GET /api/castoline/auth/system/user`, logs `castoLine`/`castoBadge` | `app/api/auth/me/route.ts` | NURVIA calls verified `/api/castoline/system/user/list/current?fetchtype=current` | Qlex endpoint returns Page Not Found on `explicitbackend.com` + logs secrets | **REJECT** (NURVIA **PRESERVE**) |
| `auth/recovery/password/route.ts` | 3-step `request`/`verify`/`reset` via `/api/castoline/auth/recovery/password`, logs passwords | `/api/backend/auth/forgot-password` & `/reset-password` | Different endpoint family; Qlex logs plaintext passwords | Secret logging in Qlex | **INVESTIGATE / BLOCKED** (unverified for NURVIA) |
| `auth/recovery/social/route.ts` | Social recovery proxy | None | Social auth not in NURVIA Phase 3.7 | Secret logging | **REJECT** |
| `auth/account/destroy/route.ts` | Calls `/api/castoline/auth/account/destroy` | None | No CSRF check in Qlex | Account deletion not in Phase 3.7 scope | **BLOCKED** (out of scope) |
| `auth/validate/route.tsx` | Calls `/api/castoline/strata/support/validate` | None | Unallowlisted query params | Not needed in NURVIA | **REJECT** |
| `auth/social/{apple,facebook,github,google,linkedin,microsoft}/route.ts` | OAuth redirect proxy with `challenge` query param | None | Social OAuth not provisioned for `website 11` | Open-redirect / hardcoded challenge risk | **REJECT** |
| `auth/social/onetap/route.ts` | Google One Tap with fallback `challenge: "learner.login.skew8lancasto"` | None | Hardcoded challenge + returns tokens to JS | XSS token exposure | **REJECT** |
| `auth/support/{2fa,account,email,message,password,phone,social}/route.ts` (7 files) | Generic CRUD proxies to `/api/castoline/strata/support/*` | None | No CSRF, logs bodies | Not used by NURVIA | **REJECT** |

## 2. Shared Infrastructure & Utilities

| Qlex Source Path | Qlex Behavior | NURVIA Equivalent | Identified Difference | Security Implications | Decision |
|---|---|---|---|---|---|
| `src/lib/config/siteHeaders.ts` + `src/middleware.ts` | Extracts `x-site-*` headers incl. `x-site-country`, `x-site-location`, `x-site-mobile` from CDN headers | `lib/lexmacasto/headers.ts` + `client.ts` (`extractSiteMetadataFromRequestHeaders`) | NURVIA already builds `x-site-*` headers safely, but doesn't yet extract `country`/`location`/`mobile` from incoming request headers | Safe when sanitized via `sanitizeHeaderValue()` | **ADAPT** (extract `x-vercel-ip-country`/`cf-ipcountry`, `x-vercel-ip-city`, `sec-ch-ua-mobile` in `client.ts`) |
| `src/lib/utils/sessions/generateSystemUserSessionCookies.ts` | Writes auth tokens to `document.cookie` | `lib/lexmacasto/session.ts` | NURVIA uses `HttpOnly` server cookies | Qlex exposes tokens to JS | **REJECT** |
| `src/lib/services/partial/helper/systemSessionHeaders.ts` | Reads auth tokens from `document.cookie` | `getServerCastoSession()` | Server-only in NURVIA | Qlex exposes tokens to JS | **REJECT** |

## 3. Media, Seek, System, User Admin & Nexus/Strata Routes

| Qlex Source Path(s) | Qlex Behavior | NURVIA Equivalent | Security Implications | Decision |
|---|---|---|---|---|
| `media/[...path]/route.ts` | Unvalidated catch-all media proxy | `app/api/avatar/[storageKey]/route.ts` | SSRF / path traversal risk in Qlex | **PRESERVE** NURVIA |
| `seek/route.ts` | Search proxy to `/api/castoline/strata/seek/*` | `app/api/strata/[resource]/route.ts` | No query allowlist / no CSRF on DELETE | **REJECT** |
| `system/backends/route.ts` | Exposes backend URLs unauthenticated | `app/api/auth/config-status/route.ts` | Information disclosure | **REJECT** |
| `system/{license,privilege,role}/route.ts` (3 files) | Unprotected system/role/privilege proxies | `app/api/backend/auth/assign-role` (staff-gated) | Missing server-side RBAC & CSRF | **REJECT** |
| `users/controls/registration/{control,option}/route.ts`, `users/controls/session/route.ts`, `users/seed/route.ts` (4 files) | Unauthenticated registration controls & dev seeding | None | Critical privilege/seeding exposure | **REJECT** |
| `users/user/route.ts` | Proxies `/api/castoline/system/user/*` | `app/api/auth/me/route.ts` | Logs tokens & user data | **PRESERVE** NURVIA |
| `nexus/dominion/subscription/{item,package}/route.ts` (2 files) | Subscription CRUD | `app/api/backend/subscriptions/*` | Unallowlisted | **PRESERVE** NURVIA |
| `nexus/strata/{assessment,institution,learning,main}/**` (22 files) | Individual strata CRUD routes | `app/api/strata/[resource]/route.ts` | NURVIA centralizes all 22 verified strata resources with query/pagination allowlists & `classes` fix | **PRESERVE** NURVIA |
| `nexus/strata/content/{cognition,document}/route.ts` (2 files) | Multipart upload proxies | None (NURVIA rejects unverified multipart) | Out of scope | **REJECT** |
