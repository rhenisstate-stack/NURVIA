# NURVIA Phase 3.3 — Backend Contract Validation Report

**Date:** 2026-11-16  
**Backend Origin:** `https://explicitbackend.com`  
**Endpoint:** `POST /api/castoline/auth/register`  
**Verification Type:** Authorized, non-mutating HTTP validation probes using configured server site headers (`x-site-key`, `x-site-domain`, `x-site-name`) and invalid email (`not-an-email`).

---

## 1. Observed Live Backend Validation Responses

### Probe 1 — Exact NURVIA Pre-Remediation Payload (No `challenge`, no `phone`)
- **HTTP Status:** `400 Bad Request`
- **Content-Type:** `application/problem+json; charset=utf-8`
- **Response Body:**
  ```json
  {
    "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": {
      "Challenge": ["The Challenge field is required."]
    }
  }
  ```
- **Conclusion:** Confirms the exact root cause of NURVIA's production `400` (`"Request failed (400)."`). ASP.NET Core model validation rejects requests missing `Challenge` before reaching application-level registration logic.

### Probe 2 — Payload With Non-Empty `challenge`, Without `phone`
- **HTTP Status:** `401 Unauthorized`
- **Content-Type:** `application/json; charset=utf-8`
- **Response Body:**
  ```json
  { "error": "Phone Number is Required ⚓" }
  ```
- **Conclusion:** Once `Challenge` passes DTO model-binding, LexmaCasto explicitly requires `phone`.

### Probe 3 — Payload With Arbitrary `challenge` + `phone`
- **HTTP Status:** `401 Unauthorized`
- **Content-Type:** `application/json; charset=utf-8`
- **Response Body:**
  ```json
  { "error": "Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️" }
  ```
- **Conclusion:** `Challenge` is not an arbitrary client string; LexmaCasto validates it as a server-issued/verified Deslizar (slider/anti-bot) challenge token. No challenge-issuance endpoint or widget specification exists in NURVIA's documented contract (`NURVIA_LEXMACASTO_INTEGRATION_CONTRACT.md`).

---

## 2. Production NURVIA Health Check
- **Live Check (`GET https://nurvia-black.vercel.app/api/auth/config-status`):**
  - **HTTP Status:** `200 OK`
  - **Result:** `appDomainConfigured: true`, `appKeyConfigured: true`, `activeBackend: "dotnet"`, `isHttps: true`.
