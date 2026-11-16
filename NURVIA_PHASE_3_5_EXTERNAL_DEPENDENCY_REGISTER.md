# NURVIA Phase 3.5 — External Dependency Register

**Date:** 2026-11-16  
**Scope:** External LexmaCasto backend and provisioning dependencies blocking Gate F (real end-to-end authenticated verification).

---

## 1. Open External Dependencies

| ID | Dependency | Current Status | Evidence | Required from Backend Owner |
|---|---|---|---|---|
| **EXT-3.5-01** | **LexmaCasto Deslizar `Challenge` Specification & NURVIA Provisioning** | **OPEN** | `Qlex-Nursing/src` contains zero `deslizar` SDKs or challenge-issuance endpoints and hardcodes `WEBSITE_1` (`skew8lancasto`) strings. Live LexmaCasto `POST /api/castoline/auth/register` returns `400` (`The Challenge field is required.`) when omitted and `401` (`Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️`) for arbitrary values. | Provide authoritative technical specification for: (1) challenge issuance endpoint or frontend SDK/script, (2) challenge verification contract, (3) public/private key responsibilities, (4) domain authorization for `https://nurvia-black.vercel.app`, (5) token format, expiration, and single-use semantics, and (6) whether registration and login require distinct challenges. |
| **EXT-3.5-02** | **Authorized NURVIA Learner Test Identity** | **OPEN** | No provisioned `E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` (or PIN) exists for NURVIA's application identity. | Provision or authorize a NURVIA Learner test account (or resolve `EXT-3.5-01` so a real NURVIA Learner account can be registered) to verify live login, `/api/auth/me`, session persistence, and logout. |

---

## 2. Boundary Compliance Statement

- NURVIA does **not** copy Qlex-Nursing's `WEBSITE_1` identity, `SKEW_LINE_APP_KEY`, or hardcoded `skew8lancasto` challenge strings.
- NURVIA does **not** fabricate synthetic challenge tokens or bypass `Challenge` validation.
