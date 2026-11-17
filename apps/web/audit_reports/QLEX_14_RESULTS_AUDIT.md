# QLEX_14 — RESULTS AUDIT

## 1. Results Retrieval & Rendering
- **Pages:**
  - `src/app/dashboards/*/vista/assessment/exams/results/distinct/page.tsx`
  - `src/app/dashboards/*/vista/assessment/exams/reports/distinct/page.tsx`
- **Hook & Endpoint:** `useDistinctStrataAssessmentResults` -> `GET /api/nexus/strata/assessment/result?fetchtype=distinct&identifier={examGuidId}` (supports `isDiy=true` -> `list/diy/distinct`).
- **Displayed Fields (from `StrataExamResultItem`):** `percentageScore` (`ScoreRing`), `passed`, `passMark`, `score`, `grade`, `totalQuestions`, `totalAnswered`, `totalCorrect`, `totalWrong`, `timeTaken`, `attemptedAt`, `attemptNumber`, `attemptsAllowed`, plus client-computed GPA/highest/lowest/passed/failed across `historyExams`.
- **Observed Live Defect (`P1`):** `GET /api/nexus/strata/assessment/result?fetchtype=relative...` returned **HTTP 500** (`"Failed to Parse Backend Response ⚓"`) when unauthenticated.
- **Live Persistence Status:** `UNVERIFIED` (0 exams / attempts available).
