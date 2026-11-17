# QLEX_16 — EXAMINATION HISTORY AUDIT

## 1. Implementation Overview
- **Pages:**
  - `src/app/dashboards/*/vista/assessment/exams/reports/relative/page.tsx` (learner's own attempts across all exams).
  - `src/app/dashboards/*/vista/assessment/exams/reports/distinct/page.tsx` (`Explore Attempt History` section for a specific exam).
- **Data Source:** `useRelativeStrataAssessmentResults()` -> `GET /api/nexus/strata/assessment/result?fetchtype=relative` -> `GET {backend}/api/castoline/strata/assessment/exams/results/list/relative`.
- **Features:** Search (`SearchBar`), per-page pagination (`PerPageSelect`), sorting (`attemptedAt`, `attemptNumber`, `percentageScore`, `grade`, `passed`, `timeTaken`), CSV export (`exportToCsv` in `reports/relative/page.tsx`), and `Open Attempt` / `Retake` actions.
- **Live Verification Status:** `FAIL / UNVERIFIED` — `GET /api/nexus/strata/assessment/result?fetchtype=relative...` returned **HTTP 500** when unauthenticated; authenticated history could not be tested.
