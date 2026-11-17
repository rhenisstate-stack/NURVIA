# NURVIA Phase 3.7 — Hosted Backend Contract Report

**Hosted Backend:** `https://explicitbackend.com` (`SKEW_LINE_DOTNET_BASE_URL`)  
**NURVIA Application Identity:** `website 11` (`SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`, `SKEW_LINE_APP_NAME` — server-only, redacted)

---

## 1. Authorized Non-Destructive Live Observations

All probes were executed on `2026-11-17` using NURVIA's server-side `website 11` identity headers (`x-site-key`, `x-site-domain`, `x-site-name`) with redacted test data, without creating users or attempting brute-force authentication.

### Observation 1 — Registration Validation Contract
- **Timestamp:** `2026-11-17T05:38:19.197Z`
- **Endpoint:** `POST /api/castoline/auth/register`
- **Sanitized Request:** `{}` (empty JSON)
- **HTTP Status:** `400`
- **Sanitized Response:**
  ```json
  {
    "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": { "Challenge": ["The Challenge field is required."] }
  }
  ```
- **Status:** **CONFIRMED** — `Challenge` is `[Required]` at ASP.NET Core DTO model-binding level.

### Observation 2 — Login Validation Contract (Empty Body)
- **Timestamp:** `2026-11-17T05:38:19.641Z`
- **Endpoint:** `POST /api/castoline/auth/login`
- **Sanitized Request:** `{}` (empty JSON)
- **HTTP Status:** `400`
- **Sanitized Response:**
  ```json
  {
    "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": {
      "Email": ["The Email field is required."],
      "Password": ["The Password field is required."]
    }
  }
  ```
- **Status:** **CONFIRMED** — `Email` and `Password` are model-bound required fields when `Challenge` is not checked at model-binding time.

### Observation 3 — Login Challenge Enforcement (Valid Shape, No Challenge)
- **Timestamp:** `2026-11-17T05:38:35.936Z`
- **Endpoint:** `POST /api/castoline/auth/login`
- **Sanitized Request:** `{"email":"probe-redacted@invalid.example","password":"[REDACTED]","loginMethod":"password","LoginProvider":"email","dashboardName":"web","role":"Learner"}`
- **HTTP Status:** `401`
- **Sanitized Response:** `{"error":"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"}`
- **Status:** **CONFIRMED** — The backend login handler enforces Deslizar challenge validation after DTO binding and rejects missing/unrecognized challenges with `401` and that exact message.

### Observation 4 — Current-User Endpoint (NURVIA Verified)
- **Timestamp:** `2026-11-17T05:38:19.871Z`
- **Endpoint:** `GET /api/castoline/system/user/list/current?fetchtype=current`
- **Sanitized Request:** No Casto session headers
- **HTTP Status:** `401`
- **Sanitized Response:** `{"error":"Missing Casto authentication headers"}`
- **Status:** **CONFIRMED** — Active, requires `x-casto-line` and `x-casto-badge`.

### Observation 5 — Qlex Legacy Session Endpoint (Obsolete)
- **Timestamp:** `2026-11-17T05:38:20.609Z`
- **Endpoint:** `GET /api/castoline/auth/system/user` (used by Qlex `src/app/api/auth/session/route.ts`)
- **HTTP Status:** `200` (HTML fallback)
- **Sanitized Response:** `<!DOCTYPE html>...<title>Page Not Found - Master Bank</title>...`
- **Status:** **CONFIRMED** — Qlex's `/api/auth/session` route points to a non-existent backend path.

---

## 2. Header Contract Comparison

| Header | Mandatory? | Qlex Source | NURVIA Source |
|---|---|---|---|
| `x-site-key` | **Yes** | `siteHeaders.ts` (`APP_KEY`, fallback `WEBSITE_1`) | `headers.ts` (`SKEW_LINE_APP_KEY`, fail-closed) |
| `x-site-domain` | **Yes** | `siteHeaders.ts` (`APP_DOMAIN`) | `headers.ts` (`SKEW_LINE_APP_DOMAIN`, fail-closed) |
| `x-casto-line` | **Yes (auth routes)** | Browser `document.cookie` | Server `HttpOnly` cookie `nurvia_casto_line` |
| `x-casto-badge` | **Yes (auth routes)** | Browser `document.cookie` | Server `HttpOnly` cookie `nurvia_casto_badge` |
| `x-site-name`, `x-site-path`, `x-site-ip-address`, `x-site-brouser`, `x-site-time`, `x-site-referrer`, `x-site-request-id` | Optional | `siteHeaders.ts` + `middleware.ts` | `headers.ts` + `client.ts` |
| `x-site-location`, `x-site-country`, `x-site-mobile`, `x-site-session-id` | Optional | `siteHeaders.ts` + `middleware.ts` | `headers.ts` supports them; `extractSiteMetadataFromRequestHeaders()` can safely extract `country`/`location`/`mobile` from CDN headers |
