# NURVIA Phase 3.5.1 — External Dependency Register

**Date:** 2026-11-16  
**Gate:** J — External Dependency and Authenticated E2E Status  
**Authenticated Backend Status:** `NOT VERIFIED — EXTERNAL DEPENDENCIES OUTSTANDING`

---

## 1. Open External Dependencies

| ID | Dependency | Status | Required Evidence / Provisioning |
|---|---|---|---|
| **EXT-3.5-01** | **LexmaCasto Deslizar challenge specification & NURVIA provisioning** | **OPEN** | Official challenge specification, issuance mechanism/endpoint/SDK, validation contract, expiration and replay rules, expected request field and response behavior, and authorized integration guidance for `https://nurvia-black.vercel.app`. |
| **EXT-3.5-02** | **Authorized NURVIA Learner test account** | **OPEN** | Authorized NURVIA test identity, explicit permission to test registration/login, approved test environment, and safe account cleanup/deactivation process. |

---

## 2. Granular Status Distinction

| Stage | Status |
|---|---|
| 1. Local implementation | **PASS** |
| 2. Production deployment (`https://nurvia-black.vercel.app`) | **VERIFIED VIA LIVE BEHAVIOR** (exact Vercel commit SHA metadata requires Vercel CLI/dashboard) |
| 3. Production unauthenticated & negative-validation smoke tests | **PASS** (10/10 checks) |
| 4. Real backend registration | **NOT VERIFIED — EXTERNAL DEPENDENCIES OUTSTANDING** (`EXT-3.5-01`) |
| 5. Real backend login and session issuance | **NOT VERIFIED — EXTERNAL DEPENDENCIES OUTSTANDING** (`EXT-3.5-01`, `EXT-3.5-02`) |
| 6. Current-user authentication (`GET /api/auth/me` with session) | **NOT VERIFIED — EXTERNAL DEPENDENCIES OUTSTANDING** (`EXT-3.5-02`) |
| 7. Protected resource access | **NOT VERIFIED — EXTERNAL DEPENDENCIES OUTSTANDING** (`EXT-3.5-02`) |
| 8. Backend logout/revocation | **NOT VERIFIED — EXTERNAL DEPENDENCIES OUTSTANDING** (`EXT-3.5-02`) |
