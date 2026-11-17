# NURVIA Phase 3.5.1 — Live Production Smoke Test Report

**Date:** 2026-11-16  
**Gate:** I — Live Production Smoke Tests  
**Target:** `https://nurvia-black.vercel.app`  
**Status:** PASS (Safe unauthenticated & negative-validation checks only)

---

## 1. Smoke Test Results

| Check | Request | Expected | Observed Status | Observed Headers | Observed Body (Sanitized) | Outcome |
|---|---|---|---|---|---|---|
| **I1. Config Status** | `GET /api/auth/config-status` | `200`, `no-store`, NURVIA config flags, no secrets | `200` | `Cache-Control: no-store`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | `{"success":true,"data":{"appName":"Nurvia","appTitle":"Nurvia","appDomainConfigured":true,"appKeyConfigured":true,"activeBackend":"dotnet","isHttps":true}}` | **PASS** |
| **I2. Unauthenticated `/me`** | `GET /api/auth/me` | `401`, `no-store`, no user/cookies | `401` | `Cache-Control: no-store`, no `Set-Cookie` | `{"success":false,"message":"Not authenticated.","errorCode":"UNAUTHORIZED"}` | **PASS** |
| **I3.1. Login CSRF** | `POST /api/auth/login` (no `Origin`/`Referer`) | `403`, `FORBIDDEN`, `no-store` | `403` | `Cache-Control: no-store`, `Content-Type: application/json` | `{"success":false,"message":"Missing Origin or Referer header on state-changing request.","errorCode":"FORBIDDEN"}` | **PASS** |
| **I3.2. Login Content-Type** | `POST /api/auth/login` (`Content-Type: text/plain`) | `415`, `no-store` | `415` | `Cache-Control: no-store`, `Content-Type: application/json` | `{"success":false,"message":"Unsupported Content-Type. Expected application/json.","errorCode":"VALIDATION_ERROR"}` | **PASS** |
| **I3.3. Login Malformed JSON** | `POST /api/auth/login` (`not-json`) | `400`, `no-store` | `400` | `Cache-Control: no-store`, `Content-Type: application/json` | `{"success":false,"message":"Invalid JSON request body.","errorCode":"VALIDATION_ERROR"}` | **PASS** |
| **I3.4. Login Unsupported Method** | `POST /api/auth/login` (`loginMethod: "magic"`) | `400`, `no-store` | `400` | `Cache-Control: no-store`, `Content-Type: application/json`, no `Set-Cookie` | `{"success":false,"message":"Unsupported login method."}` | **PASS** |
| **I3.5. Register Content-Type** | `POST /api/auth/register` (`Content-Type: text/plain`) | `415`, `no-store` | `415` | `Cache-Control: no-store`, `Content-Type: application/json` | `{"success":false,"message":"Unsupported Content-Type. Expected application/json.","errorCode":"VALIDATION_ERROR"}` | **PASS** |
| **I3.6. Register Invalid PIN** | `POST /api/auth/register` (`loginMethod: "pin"`, `pin: "12ab"`) | `400`, `no-store` | `400` | `Cache-Control: no-store`, `Content-Type: application/json`, no `Set-Cookie` | `{"success":false,"message":"Use a 4 to 12 digit numeric PIN.","errorCode":"VALIDATION_ERROR"}` | **PASS** |
| **I3.7. Register Missing Consent** | `POST /api/auth/register` (`agree: false`) | `400`, `no-store` | `400` | `Cache-Control: no-store`, `Content-Type: application/json`, no `Set-Cookie` | `{"success":false,"message":"You must agree to the terms and privacy policy.","errorCode":"VALIDATION_ERROR"}` | **PASS** |
| **I3.8. Register CSRF** | `POST /api/auth/register` (no `Origin`/`Referer`) | `403`, `FORBIDDEN`, `no-store` | `403` | `Cache-Control: no-store`, `Content-Type: application/json`, no `Set-Cookie` | `{"success":false,"message":"Missing Origin or Referer header on state-changing request.","errorCode":"FORBIDDEN"}` | **PASS** |

---

## 2. Safety & Scope Notes

- No production accounts were created, modified, or accessed.
- No real passwords, PINs, or synthetic Deslizar challenge strings were submitted.
- None of the above negative/unauthenticated requests issued a `Set-Cookie` header; authenticated `HttpOnly`/`Secure`/`SameSite=Lax` cookie issuance on live production remains unverified until `EXT-3.5-01` and `EXT-3.5-02` are resolved.
