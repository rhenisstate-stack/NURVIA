# NURVIA — Backend Owner Integration Requirements

**Date:** 2026-11-15  
**Target Remote Backend:** `http://108.61.9.189:8008` / `https://explicitbackend.com`

---

## Purpose

This document specifies the exact contract artifacts and configuration values required from the `LexmaCasto` ("Master Bank") backend owner to unblock NURVIA's live shared-backend integration without guessing routes, headers, or schemas.

---

## Required Deliverables from Backend Owner

1. **OpenAPI Specification (JSON or YAML)**
   - Exported `swagger.json` / `openapi.json` (currently `/swagger/v1/swagger.json` and `/openapi.json` redirect to `/web/restoration/lost` on the deployed host).
2. **Complete Route Inventory**
   - Authoritative list of `/api/castoline/*` endpoints, HTTP methods, and route prefixes.
3. **Site-Header Contract**
   - Exact HTTP header name(s) expected by the middleware that currently returns `400 {"error":"Missing site headers"}` on `POST /api/castoline/auth/login` and `/register`.
   - Whether site headers are required on all `/api/castoline/*` endpoints or auth-only.
4. **Application Registration & Domain Confirmation**
   - Registered `SKEW_LINE_APP_DOMAIN` value for NURVIA.
   - Confirmation of whether `SKEW_LINE_APP_KEY=WEBSITE_1` is NURVIA-exclusive or shared with PrepFord.
   - Confirmation of whether `https://explicitbackend.com` (currently serving a valid Let's Encrypt cert on `108.61.9.189:443` via `nginx/1.28.3`) is the approved production TLS origin for NURVIA.
5. **Authentication Contract**
   - Login, register, logout, refresh, and current-user (`me`) endpoints, request/response DTOs, and whether auth uses HttpOnly cookies (with CSRF requirements) or Bearer JWT.
6. **Academic Discovery Endpoint Documentation**
   - Exact endpoints, query parameters, pagination format, and response DTOs for:
     - Institutions & Schools (`/api/castoline/strata/institution/*`)
     - Academic Years, Classes/Grades, Subjects, Topics (`/api/castoline/strata/learning/*`)
     - Examination Seasons, Exam Types, Examinations, Sections, Questions (`/api/castoline/strata/assessment/*`)
7. **Approved Read-Only Test Credentials**
   - Non-destructive NURVIA learner (and optional staff) test account(s) for live acceptance testing.
