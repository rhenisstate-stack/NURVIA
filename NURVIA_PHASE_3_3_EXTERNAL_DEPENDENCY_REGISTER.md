# NURVIA Phase 3.3 — External Dependency Register

**Date:** 2026-11-16  
**Project:** NURVIA (`apps/web`)

| ID | Dependency | Responsible Party | Evidence Observed | Required Action | Status | Blocked Gates |
|---|---|---|---|---|---|---|
| **EXT-3.3-01** | **LexmaCasto Deslizar `Challenge` Specification & Issuance Contract** | LexmaCasto Backend Owner | `POST /api/castoline/auth/register` returns `400` (`"The Challenge field is required."`) when omitted and `401` (`"Ultimatum Turmoil, That Must be Deslizar 🏌️‍♂️"`) when an arbitrary string is supplied. | Document or provide the authorized challenge issuance endpoint / widget contract (or test-environment configuration) for `Challenge`. | **OPEN** | G10 |
| **EXT-3.3-02** | **Authorized NURVIA Test Account / Registration Identity** | LexmaCasto Backend Owner / QA | No authorized non-production NURVIA test credentials or registration bypass token available in environment. | Provision an authorized NURVIA Learner test account (and/or controlled registration test identity) for live acceptance. | **OPEN** | G10, G11, G12, G13 |
| **EXT-3.3-03** | **Vercel Production Deployment of Phase 3.3 Fixes** | Repository / Deployment Maintainer | Phase 3.3 changes are verified locally in `apps/web`; production `https://nurvia-black.vercel.app` has not yet been redeployed with these commits. | Commit, push, and deploy Phase 3.3 changes to Vercel Production once `EXT-3.3-01` is resolved. | **OPEN** | G10–G13 |
