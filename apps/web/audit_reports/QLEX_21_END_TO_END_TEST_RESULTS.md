# QLEX_21 — END-TO-END TEST RESULTS

**Target URL:** `http://localhost:3000` (proxying to hosted backend `http://108.61.9.189:8008`)  
**Host-Verified Origin:** `http://localhost:3000` (via `BROWSER_HOST_FACTS`)  
**Execution Date:** 2026-11-16

| Scenario | Description | Status | Observed Evidence |
|---|---|---|---|
| **A** | New learner registration | **BLOCKED / UNVERIFIED** | `/auth/register` returned HTTP 200 (SSR HTML contains form), but `/api/auth/session` returned HTTP 500 on mount and form did not mount interactively in browser session. |
| **B** | Existing learner login | **BLOCKED / UNVERIFIED** | `/auth/login` returned HTTP 200; login form did not mount interactively in browser session; no test account could be created. |
| **C** | Learner profile | **UNVERIFIED** | `/dashboards/nclex-rn/auth/account/show` returned HTTP 200 (unauthenticated state); `/api/users/user?fetchtype=current` returned HTTP 401. |
| **D** | Examination discovery | **FAIL (Empty Backend Data)** | `/dashboards/nclex-rn/vista/assessment/exams/absolute/overview` rendered empty; `GET /api/nexus/strata/assessment/exam?fetchtype=absolute` returned HTTP 200 with `items: [], skewTotal: 0`. |
| **E** | Examination execution | **BLOCKED / UNVERIFIED** | 0 exams exist in hosted backend (`skewTotal: 0`). |
| **F** | Submission | **BLOCKED / UNVERIFIED** | Dependent on Scenario E. |
| **G** | Results | **FAIL (Unauth 500) / UNVERIFIED** | `GET /api/nexus/strata/assessment/result?fetchtype=relative...` returned HTTP 500 (`Failed to Parse Backend Response ⚓`). |
| **H** | Answer review | **BLOCKED / UNVERIFIED** | Dependent on Scenario F. |
| **I** | Performance & history | **BLOCKED / UNVERIFIED** | Dependent on Scenario F; dashboard triggered HTTP 400 on `exam?fetchtype=nominal&identifier=` due to empty `programs`. |
| **J** | Logout & return | **UNVERIFIED** | `/dashboards/nclex-rn/auth/logout` returned HTTP 200 (no active session cookies to clear). |
