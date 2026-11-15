# NURVIA — Backend Gap Analysis

**Date:** 2026-11-15  
**Target Remote Backend:** `http://108.61.9.189:8008`

---

## 1. Gap Classification Summary

| Gap Category | Finding | Impact on NURVIA |
|---|---|---|
| **API Documentation Unavailable** | Swagger/OpenAPI (`/swagger/v1/swagger.json`, `/openapi.json`, `/api-docs`) returns `302 -> /web/restoration/lost` | Blocks automated discovery of exact `/api/castoline/*` routes, query parameters, and DTO schemas |
| **Undocumented Site-Header Contract** | `POST /api/castoline/auth/login` and `/register` return `400 {"error":"Missing site headers"}` | Blocks authentication and application-scoped requests until exact header names and `SKEW_LINE_APP_DOMAIN` are supplied |
| **Route Contract Mismatch** | NURVIA frontend (`api-client.ts`) targets `/api/auth/*`, `/api/study-library*`, `/api/exams*`, `/api/questions*`, `/api/lectures*`, `/api/attempts*`, whereas `108.61.9.189:8008` exposes `/api/castoline/*` | Direct BFF forwarding of `/api/backend/*` to `108.61.9.189:8008/api/*` hits `302 -> /web/restoration/lost` for NURVIA routes |
| **Academic Reference & Discovery Endpoints Unverified** | Institutions, Schools, Academic Years, Classes, Seasons, Exam Types, Sections, Topics under `/api/castoline/strata/*` could not be verified | Prevents wiring new academic discovery filters without fabricating endpoints or DTOs |
| **HTTP-Only Transport** | `http://108.61.9.189:8008` is plain HTTP without TLS | Unsafe for production authentication cookies and credentials; requires HTTPS reverse proxy |
| **No CORS Headers for Browser Origins** | `OPTIONS /api/castoline/auth/login` returns `405 Method Not Allowed` with no `Access-Control-Allow-Origin` | Direct browser calls are blocked; Next.js BFF/rewrite proxy must remain in place |

---

## 2. Backend Implementation / Documentation Recommendations

1. **Expose OpenAPI Contract (Staging/Private):** Publish `/swagger/v1/swagger.json` (or supply the exported `openapi.json` artifact) for the `LexmaCasto` shared backend so exact routes, query parameters, pagination, and DTOs for `strata/institution/*`, `strata/learning/*`, `strata/assessment/*`, and `castoline/auth/*` can be integrated without guesswork.
2. **Document Site-Header & Application Isolation Contract:** Specify the exact HTTP header name(s) expected by the site-header middleware (e.g., how `SKEW_LINE_APP_KEY=WEBSITE_1` and `SKEW_LINE_APP_DOMAIN` are transmitted) and confirm how NURVIA vs. PrepFord data isolation is enforced server-side.
3. **Provide Approved Test Credentials:** Supply a non-destructive NURVIA test account (learner + staff/admin if applicable) and registered `SKEW_LINE_APP_DOMAIN` for live acceptance verification.
4. **Confirm Production HTTPS Origin:** Confirm whether `https://explicitbackend.com` (currently live on `108.61.9.189:443` via `nginx/1.28.3` with a valid Let's Encrypt certificate) is the approved TLS endpoint for NURVIA.

---

## 3. Phase 7 — Frontend Module Integration Map (Contract-Ready)

| Domain Module | Existing NURVIA Frontend Surface | Current API Integration | Remote Shared Backend Target (Unverified) |
|---|---|---|---|
| Institutions & Schools | `apps/web/components/study/StudyLibraryAdvancedFilters.tsx` (`schools`) | `/api/study-library/filters` | `/api/castoline/strata/institution/*` |
| Academic Years & Classes/Grades | `StudyLibraryAdvancedFilters.tsx` (`academicYears`), `apps/web/app/admin/taxonomy/page.tsx` | `/api/study-library/filters` (classes/grades absent) | `/api/castoline/strata/learning/*` |
| Subjects & Topics | `StudyLibraryAdvancedFilters.tsx` (`subjects`, `topics`), `apps/web/app/admin/taxonomy/page.tsx` | `/api/study-library/filters` | `/api/castoline/strata/learning/{subjects,topics}/*` |
| Examination Seasons & Types | `StudyLibraryAdvancedFilters.tsx` (`seasons`, `categories`) | `/api/study-library/filters` | `/api/castoline/strata/assessment/*` |
| Examinations & Sections | `apps/web/app/exams/page.tsx`, `apps/web/app/exams/[id]/page.tsx`, `apps/web/components/study/study-library-view.tsx`, `apps/web/app/admin/exams/page.tsx` | `/api/study-library*`, `/api/exams*` | `/api/castoline/strata/assessment/{assessments,exams,sections}/*` |
| Question Bank | `apps/web/app/admin/questions/*`, `apps/web/app/exam-session/page.tsx`, `apps/web/components/exam/renderers/QuestionRendererRegistry.tsx` | `/api/questions*`, `/api/attempts*` | `/api/castoline/strata/assessment/questions/*` |
