# NURVIA Phase 3.8 — Starting-Point Audit

**Date:** `2026-11-17`  
**Branch:** `feature/phase-3-8-qlex-api-parity`  
**Reference Source:** `C:\Users\gitau\Documents\Qlex\src\app\api` (59 route files)  
**Target:** `C:\Users\gitau\Documents\NURVIA\apps\web`

---

## 1. Established Baseline

- **NURVIA Application Identity:** `website 11` (`SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`, `SKEW_LINE_APP_NAME` server-only).
- **Preserved Auth & API Routes:** `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/config-status`, `/api/backend/[...path]`, `/api/strata/[resource]`, `/api/avatar/[storageKey]`.
- **Preserved Security Controls:** `HttpOnly`, `SameSite=Lax`, production `Secure` cookies, same-origin CSRF (`validateSameOriginRequest`), strict proxy allowlists, `Cache-Control: no-store`, E.164 phone normalization, structured backend error classification.

## 2. Gaps Identified for Phase 3.8

1. **Temporary Challenge Compatibility:** `POST /api/castoline/auth/register` and `POST /api/castoline/auth/login` require a `challenge` field on `https://explicitbackend.com`; Qlex's temporary hardcoded challenge strings needed to be centralized server-side in `apps/web/lib/auth/temporaryChallenge.ts` and verified live.
2. **Missing Qlex Functional Parity Routes:** `/api/seek` (search/suggest/history), `/api/exams/diy` (custom DIY exam creation), `/api/auth/account/destroy` (authenticated self-account deletion), `/api/auth/validate` (support token validation), and full `fetchtype` + staff CRUD parity on `/api/strata/[resource]`.
