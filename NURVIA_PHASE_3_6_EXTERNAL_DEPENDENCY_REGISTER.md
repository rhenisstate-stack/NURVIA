# NURVIA Phase 3.6 — External Dependency Register

**Date:** 2026-11-16  
**Authenticated Backend Status:** `NOT VERIFIED — EXTERNAL DEPENDENCIES OUTSTANDING`

---

## 1. Open External Dependencies

| ID | Dependency | Status | Impact | Required Action from Backend Owner |
|---|---|---|---|---|
| **EXT-3.6-01** | **LexmaCasto `Challenge` Requirement on `POST /api/castoline/auth/register`** | **OPEN** | Live LexmaCasto backend previously returned HTTP `400` (`errors.Challenge = ["The Challenge field is required."]`) when `Challenge` was omitted, and `401` for arbitrary values. NURVIA's UI and routes no longer accept or fabricate a nonexistent challenge. | Either remove the `Challenge` requirement for NURVIA (`website 11`) on LexmaCasto, or provide an official challenge issuance/verification specification and provisioning for `https://nurvia-black.vercel.app`. |
| **EXT-3.6-02** | **Authorized NURVIA Learner Test Identity** | **OPEN** | Prevents live end-to-end Playwright verification of login, `/api/auth/me`, session persistence, and logout against `https://explicitbackend.com`. | Provision or authorize a NURVIA Learner test account in the approved test environment. |
