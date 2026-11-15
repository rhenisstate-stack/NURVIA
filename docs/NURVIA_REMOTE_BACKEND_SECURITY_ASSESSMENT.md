# NURVIA — Remote Backend Security Assessment

**Date:** 2026-11-15  
**Target Remote Backend:** `http://108.61.9.189:8008`

---

## 1. Transport Security (HTTP vs. HTTPS)

- **Finding:** The supplied remote backend (`http://108.61.9.189:8008`) operates over plain **HTTP** on port `8008`.
- **Risk:** Transmitting authentication credentials, session cookies, CSRF tokens, or learner assessment data over unencrypted HTTP exposes traffic to interception and prevents browsers from honoring `Secure` cookie attributes.
- **Mitigation Implemented in Frontend:** `apps/web/lib/api-config.mjs` provides `isHttpsBackendUrl()` and `resolveBackendBaseUrl(env, { requireHttps: true })`, and `apps/web/next.config.mjs` emits an explicit security warning during production builds when an `http://` backend URL is configured.
- **Requirement:** Place the remote .NET backend behind an HTTPS reverse proxy before production deployment.

---

## 2. Cookie Security & BFF Proxy

- **Architecture:** Browser traffic routes through Next.js rewrites (`/api/backend/:path*` -> `${apiBase}/api/:path*`) with `credentials: 'include'` and `X-CSRF-TOKEN` on mutating requests.
- **HTTP Cookie Limitation:** On an IP-based HTTP endpoint (`http://108.61.9.189:8008`), `Secure` cookies cannot be set/forwarded over HTTPS, and `SameSite=None` requires `Secure`. Keeping traffic same-origin via the Next.js `/api/backend` BFF avoids cross-origin cookie issues in development, but HTTPS is mandatory for production.

---

## 3. CORS

- **Finding:** `OPTIONS /api/castoline/auth/login` with `Origin: http://localhost:3000` returned `405 Method Not Allowed` (`Allow: POST`) with no `Access-Control-Allow-Origin` header.
- **Assessment:** Direct browser-to-backend CORS is not enabled (and should not be opened with wildcard `*`). Routing browser calls through the Next.js BFF (`/api/backend/*`) is the correct, secure pattern.

---

## 4. Application Identity & Isolation (NURVIA vs. PrepFord)

- **Finding:** `POST /api/castoline/auth/login` and `/register` returned `HTTP 400 {"error":"Missing site headers"}`, confirming the shared backend enforces site/application identification middleware.
- **Unverified Contract:** Neither the exact header names nor confirmation that `SKEW_LINE_APP_KEY=WEBSITE_1` maps exclusively to NURVIA (rather than PrepFord or a shared default) is documented in public responses.
- **Boundary Rule:** NURVIA never trusts client-side filtering as an isolation boundary and never fabricates application headers. Application isolation must be enforced server-side by the shared backend.

---

## 5. Environment & Secret Handling

- **Verified Controls:**
  - `apps/web/.env.local` is excluded from Git via `.gitignore`.
  - `SKEW_LINE_DOTNET_BASE_URL`, `SKEW_LINE_APP_KEY`, and `SKEW_LINE_APP_DOMAIN` are kept server-side (not prefixed with `NEXT_PUBLIC_`).
  - `apps/web/.env.example` and `apps/web/.env.local.example` contain only safe placeholders.
  - Silent `http://localhost:5055` fallbacks were removed from `next.config.mjs` and `api-client.ts` in favor of fail-closed validation in `apps/web/lib/api-config.mjs`.
