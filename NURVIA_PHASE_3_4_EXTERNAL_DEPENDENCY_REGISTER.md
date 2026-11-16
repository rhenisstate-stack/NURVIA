# NURVIA Phase 3.4 — External Dependency Register

**Date:** 2026-11-16  
**Project:** NURVIA (`apps/web`)  
**Backend Origin:** `https://explicitbackend.com`

---

| ID | Dependency | Responsible Party | Evidence Observed | Required Action | Status | Blocked Gates |
|---|---|---|---|---|---|---|
| **EXT-3.4-01** | **LexmaCasto Deslizar `Challenge` Specification & NURVIA Provisioning** | LexmaCasto Backend Owner | Qlex-Nursing has no Deslizar widget/SDK; it hardcodes `skew8lancasto` strings (`"register-skew8@lancasto"`, `"learner.login.skew8lancasto"`). Live `POST /api/castoline/auth/register` with NURVIA headers returns `400` (`"The Challenge field is required."`) when omitted and `401` (`"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"`) for arbitrary values. | Provide the genuine Deslizar challenge issuance endpoint / widget contract or NURVIA-registered challenge configuration for `https://nurvia-black.vercel.app`. | **OPEN** | G8, G17 |
| **EXT-3.4-02** | **Authorized NURVIA Learner Test Identity** | LexmaCasto Backend Owner / QA | No authorized NURVIA test credentials (`E2E_AUTH_EMAIL`, `E2E_AUTH_PASSWORD`) or authorized registration test identity are provisioned in the environment. | Provision an authorized NURVIA test identity (or resolve `EXT-3.4-01` for controlled registration) to execute live account acceptance. | **OPEN** | G17, G18, G19, G20 |
