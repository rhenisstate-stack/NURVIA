# NURVIA — Shared Backend Route Inventory

**Target Host:** `http://108.61.9.189:8008`  
**Server Banner:** `Kestrel` (`LexmaCasto` / "Master Bank")  
**Audit Date:** 2026-11-15

---

## 1. OpenAPI / Swagger Discovery Results

All standard OpenAPI/Swagger endpoints returned `HTTP 302 Found` redirecting to `/web/restoration/lost?path=...` (which renders `Page Not Found - Master Bank`):

| Candidate Path | HTTP Status | Location / Result |
|---|---|---|
| `/swagger` | `302 Found` | `/web/restoration/lost?path=%2Fswagger` |
| `/swagger/index.html` | `302 Found` | `/web/restoration/lost?path=%2Fswagger%2Findex.html` |
| `/swagger/v1/swagger.json` | `302 Found` | `/web/restoration/lost?path=%2Fswagger%2Fv1%2Fswagger.json` |
| `/swagger/v2/swagger.json` | `302 Found` | `/web/restoration/lost?path=%2Fswagger%2Fv2%2Fswagger.json` |
| `/openapi.json` | `302 Found` | `/web/restoration/lost?path=%2Fopenapi.json` |
| `/openapi/v1.json` | `302 Found` | `/web/restoration/lost?path=%2Fopenapi%2Fv1.json` |
| `/api-docs` | `302 Found` | `/web/restoration/lost?path=%2Fapi-docs` |
| `/robots.txt` | `302 Found` | `/web/restoration/lost?path=%2Frobots.txt` |

Because Swagger/OpenAPI is disabled on the deployed host, the reported ~803-route inventory could **not** be independently enumerated from an OpenAPI document.

---

## 2. Verified Live Routes on `http://108.61.9.189:8008`

| Group | Method | Exact Route | Status | Response Summary |
|---|---|---|---|---|
| Infrastructure | `GET` | `/health` | `200 OK` | `"healthy"` (`application/json`) |
| Castoline Auth | `POST` | `/api/castoline/auth/login` | `400 Bad Request` | `{"error":"Missing site headers"}` |
| Castoline Auth | `POST` | `/api/castoline/auth/register` | `400 Bad Request` | `{"error":"Missing site headers"}` |
| Castoline Auth | `OPTIONS` | `/api/castoline/auth/login` | `405 Method Not Allowed` | `Allow: POST` (no CORS headers) |
| Razor Web Shell | `GET` | `/` | `200 OK` | HTML (`Home - Master Bank`) |
| Razor Web Auth | `GET` | `/web/auth/absolute/login` | `200 OK` | HTML (`Login - Master Bank`) |
| Razor Web Auth | `GET` | `/web/auth/absolute/register` | `200 OK` | HTML (`Register - Master Bank`) |
| Razor Web Admin | `GET` | `/web/pages/entrance` | `200 OK` | HTML (`Admin Dashboard - Master Bank`) |

---

## 3. Referenced Navigation Links Found in `/` HTML (Unverified / Redirecting)

The `/` HTML references the following Razor/panel routes, which redirected to `/web/restoration/lost` when probed unauthenticated:
- `/exams/question-bank`
- `/dashboards/admin/panel/index`
- `/dashboards/admin/panel/nexus/strata/assessment/{assessments,exams,questions,sections}/absolute`
- `/dashboards/admin/panel/nexus/strata/learning/{concepts,courses,facts,lessons,programs,subjects,topics,units}/absolute`

---

## 4. Probed `/api/castoline/*` & `/api/*` Routes Returning `302 -> /web/restoration/lost`

Across 228 `GET`/`POST` probes (`""`, `/index`, `/list`, `/all`, `/search`, `/summary`, `/me`, `/profile`, `/get`, `/absolute`, `/public`) and 156 additional `POST` probes (`/list`, `/all`, `/search`, `/query`, `/get`, `/index`, `/absolute`, `/filter`, `/details`, `/create`, `/me`, `/profile`) on:
- `/api/castoline/system/user`
- `/api/castoline/nexus/contents`, `/api/castoline/nexus/subscription`
- `/api/castoline/strata/assessment/{assessments,exams,questions,sections}`
- `/api/castoline/strata/institution/{schools,institutions}`
- `/api/castoline/strata/learning/{subjects,courses,lessons,topics,programs,units}`
- `/api/castoline/strata/{academic-years,classes,seasons}`
- `/api/auth/{csrf,me,login}`, `/api/study-library`, `/api/study-library/filters`, `/api/exams`, `/api/questions`

All returned `302 Found -> /web/restoration/lost?path=...`. Exact controller/action names and required site-header names cannot be determined without OpenAPI/Swagger or backend documentation.
