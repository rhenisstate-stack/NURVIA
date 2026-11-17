# QLEX_15 — ANSWER REVIEW AUDIT

## 1. Two Review Mechanisms Implemented
1. **Results Summary (`results/distinct/page.tsx` & `reports/distinct/page.tsx`):**
   - `results/distinct/page.tsx` only shows a summary count of missed questions (`Questions to Review`).
   - `reports/distinct/page.tsx` renders `WrongQuestionCard` for `exam.wrongQuestionRefs[]`, displaying `sectionName`, `scoreWeight`, `questionText` (via `html-react-parser`), and `userAnswerData`.
   - **Gap (`P2`):** `WrongQuestionCard` only lists **incorrect** questions and does **not** display the correct answer, explanation, or clinical rationale inline.
2. **Full Attempt Review Mode (`AttemptRow` -> `GenericExamPage` with `mode=review&attempt=...`):**
   - Clicking `Open Attempt` on `reports/distinct/page.tsx` opens `/web/{track}/vista/exam/generic?identifier={examGuidId}&mode=review&attempt={attemptNumber}`.
   - `useLiveStrataExam` passes `dynamicExamMode: "Review"` and `dynamicAttemptNumber` to `list/live`, and question components (`singleChoice.tsx` etc.) enable `showFeedback = true` using `q.questionCorrectAnswers` and `q.savedUserAnswer`.
- **Live Verification Status:** `UNVERIFIED` (no completed attempts available in hosted backend).
