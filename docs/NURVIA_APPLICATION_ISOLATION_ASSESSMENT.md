# NURVIA — Application Isolation Assessment (NURVIA vs. PrepFord)

**Date:** 2026-11-15  
**Target Remote Backend:** `http://108.61.9.189:8008` (`https://explicitbackend.com`)

---

## 1. Current Isolation Evidence

- **Backend Enforcement Observed:** `POST /api/castoline/auth/login` and `POST /api/castoline/auth/register` return `HTTP 400 {"error":"Missing site headers"}`, demonstrating that the shared backend enforces site-identification middleware at the API boundary.
- **Configuration State:** NURVIA's supplied config includes `SKEW_LINE_APP_KEY='WEBSITE_1'` and `SKEW_LINE_APP_DOMAIN='<REGISTERED_DOMAIN>'`.

---

## 2. Unverified Isolation Questions

Without the backend OpenAPI spec, site-header contract, and authenticated test accounts, the following cannot yet be verified:
1. **Key Exclusivity:** Whether `WEBSITE_1` is dedicated exclusively to NURVIA or is a shared/default key.
2. **Identity-Bound Scope:** Whether authenticated user sessions/tokens bind the user to NURVIA vs. PrepFord server-side (preventing cross-application access even if headers are modified).
3. **Domain Validation:** Whether `SKEW_LINE_APP_DOMAIN` is validated against the request `Origin`/`Host` or a registered domain allowlist.
4. **Shared Reference vs. App-Specific Content:** Which academic reference entities (Institutions, Schools, Academic Years, Subjects) are globally shared vs. scoped, and how NURVIA-only vs. PrepFord-only examinations/questions are isolated in PostgreSQL.

---

## 3. Frontend Security Posture

- NURVIA does **not** use client-side filtering as an isolation or security boundary.
- `SKEW_LINE_APP_KEY` and `SKEW_LINE_APP_DOMAIN` are kept server-only (never exposed via `NEXT_PUBLIC_`).
- Live cross-application isolation testing will be executed only after approved NURVIA test credentials and the site-header contract are provided.
