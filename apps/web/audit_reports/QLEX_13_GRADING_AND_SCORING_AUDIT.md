# QLEX_13 — GRADING AND SCORING AUDIT

## 1. Authoritative Grading Architecture
- **Where Grading Happens:** Authoritative grading is performed **server-side** on the hosted .NET backend (`108.61.9.189:8008`) when `ActionExamSubmit` is processed.
- **Frontend Role:** The frontend does **not** calculate or mutate official attempt scores. It reads persisted result fields (`score`, `percentageScore`, `grade`, `passed`, `totalAnswered`, `totalCorrect`, `totalWrong`, `answers[].isCorrect`, `answers[].scoreWeight`) from `GET /api/nexus/strata/assessment/result`.
- **Scoring Metadata Modeled in DTOs (`useLiveStrataExamsHook.tsx` & `useDistinctStrataAssessmentResults.tsx`):**
  - `exam.passMark`, `exam.totalMarks`, `exam.scoringType`
  - Per-answer/question: `allowPartialCredit`, `scoreWeight`, `caseSensitive`, `validationRules`.
- **Client-Side Instant Feedback (Tutor/Review Modes Only):** In `singleChoice.tsx` (lines 36-41, 108-111), `showFeedback` (`mode === "review" || mode === "tutor"`) highlights green/red locally using `q.questionCorrectAnswers` for immediate learning feedback; official scores remain backend-owned.
- **Live Verification Status:** `UNVERIFIED` (backend grading logic is external and no live exam attempt could be submitted).
