# QLEX_17 — PERFORMANCE ANALYTICS AUDIT

## 1. Implementation Overview
- **Pages:**
  - `src/app/dashboards/*/vista/assessment/exams/progress/absolute/page.tsx` (Recharts `LineChart` score progression, `BarChart` subject/exam breakdown, `SemiGauge` pass rate/accuracy/GPA).
  - `src/app/dashboards/*/vista/assessment/exams/reports/absolute/page.tsx` + `summary/Comparison.tsx` (peer comparison & percentile ranking).
- **Calculation Method:**
  - Raw attempt records (`StrataExamResultItem[]`) are fetched from `/api/nexus/strata/assessment/result?fetchtype=relative` (for learner's own progress) and `fetchtype=absolute` (for peer comparison).
  - Aggregations (GPA, highest/lowest score, pass rate, percentile, rank, median) are **computed client-side** in React `useMemo` hooks from the paginated/fetched result list (meaning if `perPage` is smaller than total attempts, client-side aggregates only reflect the fetched page!).
- **Critical Privacy / Data Isolation Risk (`P0`):** `reports/absolute/page.tsx` (`useAbsoluteStrataAssessmentResults` -> `fetchtype=absolute`) passes `othersAttempts` into `computeExamComparison()` (`peers = othersAttempts.filter(...)`), displaying peer scores/rows in a modal. If the backend returns other learners' `StrataExamResultItem` records (including `userId` or `answers`) to any learner, this is an **unauthorized cross-learner data exposure**.
