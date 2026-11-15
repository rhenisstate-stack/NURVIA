# NURVIA — Site Header Contract

**Date:** 2026-11-15  
**Target Remote Backend:** `http://108.61.9.189:8008` (`https://explicitbackend.com` via nginx/1.28.3)

---

## 1. Repository Audit Findings

A full-repository search (`git grep -inE "SKEW_LINE|WEBSITE_1|site-header|site_header|X-Site|X-App|castoline|LexmaCasto"`) confirmed:
- Prior to Phase 2.0 (`2b8df3c`), the NURVIA codebase contained **no** `SKEW_LINE_*` references, **no** `WEBSITE_1` references, and **no** unused site-header interceptor in `apps/web/lib/api-client.ts` or `apps/web/next.config.mjs`.
- `apps/web/lib/api-client.ts` currently sends only `Content-Type`, `X-CSRF-TOKEN` (for mutating requests), and `credentials: 'include'`.

---

## 2. Remote Backend Evidence

| Endpoint | Request | Observed Response | Evidence |
|---|---|---|---|
| `POST /api/castoline/auth/login` | `Content-Type: application/json`, body `{}` | `HTTP 400 Bad Request` — `{"error":"Missing site headers"}` | Proves backend middleware/filter enforces site headers on `/api/castoline/auth/*` |
| `POST /api/castoline/auth/register` | `Content-Type: application/json`, body `{}` | `HTTP 400 Bad Request` — `{"error":"Missing site headers"}` | Proves registration is also gated by the same site-header check |

---

## 3. Contract Matrix (Current Verification Status)

| Field | Status / Value |
|---|---|
| **Header Name(s)** | **UNVERIFIED** — Not exposed in HTTP responses, `OPTIONS`, or HTML. Must be supplied by backend owner. |
| **Purpose** | Application/site identification and multi-tenant routing between shared applications (NURVIA vs. PrepFord). |
| **Source of Value** | Server-side environment variables (`SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`, `SKEW_LINE_APP_NAME`). |
| **Public vs. Confidential** | `SKEW_LINE_APP_KEY` and `SKEW_LINE_APP_DOMAIN` must remain server-side (injected via Next.js BFF/rewrite or Route Handlers), never exposed via `NEXT_PUBLIC_`. |
| **Required for Authentication** | **YES** (verified via `400 {"error":"Missing site headers"}` on `/api/castoline/auth/login` and `/register`). |
| **Required for All API Requests** | **UNVERIFIED** — Unknown whether `strata/*` and `nexus/*` endpoints also require site headers or derive site context from the auth session. |
| **Validated by Backend** | **YES** (presence check verified; value validation rules unverified). |

---

## 4. Missing Backend-Owner Information

1. Exact HTTP header name(s) expected by the `LexmaCasto` site-header middleware (e.g., mapping for `SKEW_LINE_APP_KEY` and `SKEW_LINE_APP_DOMAIN`).
2. Confirmation of the registered `SKEW_LINE_APP_DOMAIN` for NURVIA.
3. Confirmation of whether `SKEW_LINE_APP_KEY=WEBSITE_1` is NURVIA's dedicated key or a shared identifier.
4. Whether site headers must be forwarded on all `/api/castoline/*` requests or only `/api/castoline/auth/*`.
