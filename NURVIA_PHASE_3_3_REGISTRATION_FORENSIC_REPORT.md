# NURVIA Phase 3.3 — Registration Forensic Report

**Date:** 2026-11-16  
**Scope:** `C:\Users\gitau\Documents\NURVIA` (`apps/web`)  
**Backend Origin:** `https://explicitbackend.com` (`dotnet`)  
**Production URL:** `https://nurvia-black.vercel.app`

---

## 1. End-to-End Registration Request Trace (Pre-Remediation)

1. **Sign-Up Page & Form State (`apps/web/app/sign-up/page.tsx`):**
   - Form fields collected: `name` (Full name), `email`, `password`, `confirmation`.
   - Client-side validation: `password !== confirmation` and `password.length < 12`, plus HTML5 `required` / `minLength` / `type="email"`.
   - **Omissions identified:** No `phone` input field; no explicit `agree` consent checkbox (hardcoded `agree: true`); no `challenge` field or widget.
   - Dispatched: `nurviaApi.register({ username: name.trim(), email: email.trim(), password, passwordConfirmation: confirmation, loginMethod: "password", agree: true })`.

2. **API Client (`apps/web/lib/api-client.ts`):**
   - `nurviaApi.register(payload)` sends `POST /api/auth/register` with `Content-Type: application/json`, `credentials: 'include'`, `cache: 'no-store'`.
   - `buildApiUrl('/api/auth/register')` routes directly to the same-origin Next.js Route Handler.

3. **Route Handler (`apps/web/app/api/auth/register/route.ts`):**
   - Enforced `validateSameOriginRequest(request)` (CSRF) and parsed JSON.
   - Mapped `username` (`body.username || body.name`), `email`, optional `phone`, `password`, `passwordConfirmation` (defaulted to `password` if omitted), `loginMethod` (`'password'` or `'pin'`), `agree` (defaulted to `true` if `undefined`), and hardcoded `role: 'Learner'` (preventing privilege escalation).
   - **Gaps identified:** Did not enforce `agree === true` when `false` was sent; did not enforce `password.length >= 12` or email format; did not require `phone`; did not set `Cache-Control: no-store` on responses.
   - Forwarded JSON payload to `lexmaCastoRequest('/api/castoline/auth/register', { method: 'POST', body: payload, siteMeta })`.

4. **Exact JSON Body Sent to LexmaCasto (Pre-Remediation):**
   ```json
   {
     "username": "<trimmed name>",
     "email": "<trimmed email>",
     "loginMethod": "password",
     "agree": true,
     "role": "Learner",
     "password": "<submitted password>",
     "passwordConfirmation": "<submitted confirmation>"
   }
   ```
   - **Sent:** `username`, `email`, `loginMethod`, `agree`, `role`, `password`, `passwordConfirmation`.
   - **Omitted:** `phone`, `challenge`, `dashboardName`, `pin`, `pinConfirmation`, `provider`, `providerPayload`.

5. **Centralized LexmaCasto Client (`apps/web/lib/lexmacasto/client.ts`):**
   - Attached server-owned `x-site-key`, `x-site-domain`, and `x-site-*` headers.
   - **Error-parsing defect identified:** `lexmaCastoRequest` only read `record.message ?? record.error` and `Array.isArray(record.errors)`. When LexmaCasto returned ASP.NET Core `ValidationProblemDetails` (`application/problem+json`) with `title` and dictionary-shaped `errors: { Challenge: ["The Challenge field is required."] }`, both `rawMsg` and `errors` evaluated to `undefined`, causing `sanitizeBackendMessage(undefined, 400)` to return `"Request failed (400)."`.

---

## 2. Classification of Findings

| Finding | Classification | Status |
|---|---|---|
| `lexmaCastoRequest` discarded `ValidationProblemDetails` (`title`, `detail`, `errors` dictionary) and safe non-JSON error text | **NURVIA-owned defect (Locally verified)** | **FIXED** |
| `sign-up/page.tsx` omitted `phone` (required by LexmaCasto) and explicit `agree` consent checkbox | **NURVIA-owned defect (Locally verified)** | **FIXED** |
| `/api/auth/register` lacked `Cache-Control: no-store`, strict `agree === true`, email format, `password.length >= 12`, and `phone` validation | **NURVIA-owned defect (Locally verified)** | **FIXED** |
| LexmaCasto `/api/castoline/auth/register` requires a valid server-verified `Challenge` ("Deslizar") token | **External dependency (Live backend verified)** | **OPEN — EXTERNAL** |
