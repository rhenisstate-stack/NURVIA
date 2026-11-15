# NURVIA — Remote API Capability Audit

**Audit Date:** 2026-11-15  
**Target Remote Backend:** `http://108.61.9.189:8008` (ASP.NET Core / Kestrel — `LexmaCasto` / "Master Bank")  
**Discovery Method:** Live non-destructive HTTP `GET`, `POST` (empty `{}`), `HEAD`, and `OPTIONS` probes against the deployed host.

---

## 1. Classification Key

- **VERIFIED:** Actual endpoint and behavior confirmed via live HTTP response.
- **AUTHENTICATION BLOCKED:** Route exists, but valid credentials/session are required.
- **AUTHORIZATION BLOCKED:** Authenticated identity lacks permission.
- **PARTIALLY VERIFIED:** Route exists and responds, but full schema/contract cannot be verified without OpenAPI or site-header contract.
- **UNSUPPORTED:** Endpoint is confirmed absent (redirects to `/web/restoration/lost` 404 handler) or does not support the required capability.
- **UNVERIFIED:** Insufficient evidence (e.g., Swagger disabled; exact sub-route names unknown).

---

## 2. Remote Backend Capability Matrix

| Module | HTTP Method | Endpoint | Authentication | Authorization | Application Scope | Query Parameters | Request DTO | Response DTO | Pagination | Status | Frontend Integration |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Health / Liveness (HTTP) | `GET` | `/health` (`http://108.61.9.189:8008/health`) | Public | None | Global | None | None | `"healthy"` (`application/json`) | N/A | **VERIFIED** | Available for server-side health checks |
| Health / Liveness (HTTPS) | `GET` | `/health` (`https://explicitbackend.com/health`) | Public | None | Global | None | None | `"healthy"` (`application/json`, `nginx/1.28.3`, Let's Encrypt TLS) | N/A | **VERIFIED** | Pending backend-owner confirmation as NURVIA TLS origin |
| Web Shell / Landing | `GET` | `/` | Public | None | Shared (`LexmaCasto`) | None | None | HTML (`Home - Master Bank`) | N/A | **VERIFIED** | N/A (Backend Razor shell) |
| Web Auth UI | `GET` | `/web/auth/absolute/login` | Public | None | Shared | None | None | HTML (`Login - Master Bank`) | N/A | **VERIFIED** | N/A (Backend Razor UI) |
| Web Auth UI | `GET` | `/web/auth/absolute/register` | Public | None | Shared | None | None | HTML (`Register - Master Bank`) | N/A | **VERIFIED** | N/A (Backend Razor UI) |
| Web Entrance | `GET` | `/web/pages/entrance` | Public | None | Shared | None | None | HTML (`Admin Dashboard - Master Bank`) | N/A | **VERIFIED** | N/A (Backend Razor UI) |
| Castoline Auth | `POST` | `/api/castoline/auth/login` | Public (site-header gated) | Site header required | Shared (`SKEW_LINE_APP_KEY`) | None | Unverified (requires site headers) | `400 {"error":"Missing site headers"}` | N/A | **PARTIALLY VERIFIED** | Blocked on site-header contract; NURVIA uses `/api/auth/login` |
| Castoline Auth | `POST` | `/api/castoline/auth/register` | Public (site-header gated) | Site header required | Shared (`SKEW_LINE_APP_KEY`) | None | Unverified (requires site headers) | `400 {"error":"Missing site headers"}` | N/A | **PARTIALLY VERIFIED** | Blocked on site-header contract; NURVIA uses `/api/auth/register` |
| OpenAPI / Swagger | `GET` | `/swagger/v1/swagger.json`, `/swagger`, `/openapi.json`, `/api-docs` | N/A | N/A | Global | None | None | `302 -> /web/restoration/lost` (404) | N/A | **UNSUPPORTED** | Not exposed on deployed host |
| NURVIA Legacy Auth | `GET` | `/api/auth/csrf`, `/api/auth/me` | Required | Cookie + CSRF | NURVIA | None | None | `302 -> /web/restoration/lost` on `108.61.9.189:8008` | N/A | **UNSUPPORTED** on `108.61.9.189:8008` | Integrated in `api-client.ts` (targeting NURVIA API contract) |
| NURVIA Legacy Exams & Study | `GET` | `/api/exams`, `/api/questions`, `/api/study-library`, `/api/study-library/filters` | Public / Auth | Role-based | NURVIA | `pageNumber`, `pageSize`, filters | None | `302 -> /web/restoration/lost` on `108.61.9.189:8008` | `PagedResult<T>` | **UNSUPPORTED** on `108.61.9.189:8008` | Integrated in `api-client.ts` & `study-library-view.tsx` |
| Castoline System User | `GET`/`POST` | `/api/castoline/system/user/*` | Unknown | Unknown | Shared | Unknown | Unknown | `302 -> /web/restoration/lost` across probed suffixes | Unknown | **UNVERIFIED** | Missing (blocked by missing OpenAPI & action names) |
| Castoline Nexus | `GET`/`POST` | `/api/castoline/nexus/contents/*`, `/api/castoline/nexus/subscription/*` | Unknown | Unknown | Shared | Unknown | Unknown | `302 -> /web/restoration/lost` across probed suffixes | Unknown | **UNVERIFIED** | Missing |
| Castoline Strata Assessment | `GET`/`POST` | `/api/castoline/strata/assessment/{assessments,exams,questions,sections}/*` | Unknown | Unknown | Shared | Unknown | Unknown | `302 -> /web/restoration/lost` across probed suffixes | Unknown | **UNVERIFIED** | Missing (blocked by missing OpenAPI & site-header contract) |
| Castoline Strata Institution | `GET`/`POST` | `/api/castoline/strata/institution/{schools,institutions}/*` | Unknown | Unknown | Shared | Unknown | Unknown | `302 -> /web/restoration/lost` across probed suffixes | Unknown | **UNVERIFIED** | Missing |
| Castoline Strata Learning | `GET`/`POST` | `/api/castoline/strata/learning/{subjects,courses,lessons,topics,programs,units}/*` | Unknown | Unknown | Shared | Unknown | Unknown | `302 -> /web/restoration/lost` across probed suffixes | Unknown | **UNVERIFIED** | Missing |
