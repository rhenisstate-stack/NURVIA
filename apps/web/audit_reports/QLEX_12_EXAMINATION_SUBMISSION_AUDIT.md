# QLEX_12 — EXAMINATION SUBMISSION AUDIT

## 1. Submission Lifecycle (`generic/page.tsx` & `useLiveExamActionContext.tsx`)
1. User clicks Submit (or `window` dispatches `exam:submit`), opening `SubmitConfirmModal` showing `answeredCount` vs `flatTotal`.
2. On confirm, `handleConfirmedSubmit()` removes the `sessionStorage` question position key and calls `submitExam({ examId, examGuidId, reason: "User Submitted Exam ⚓", status: "Completed" })`.
3. `examService.submitExam()` sends `POST /api/nexus/strata/assessment/exam/upserts` with `submissionType: "ActionExamSubmit"`, `actionGroup: "ExamLifecycle"`, and `isDiy` flag -> `POST {backend}/api/castoline/strata/assessment/exams/upsert/{diy/}lifecycle`.
4. `runLifecycle()` checks `result?.success === false || result?.error`; on success sets `lifecycleStatus = "submitted"` and opens `SubmitResultModal` with a button to navigate to `/dashboards/{track}/vista/assessment/exams/results/distinct?identifier={examGuidId}`.

## 2. Verified Defects & Risks
1. **Unflushed Debounced Answers (`P1`):** `handleConfirmedSubmit()` does **not** flush pending 800ms debounced `submitAnswer` timers in `LiveExamActionProvider` before calling `submitExam()`. An answer selected right before clicking Submit may be omitted from grading or arrive after finalization.
2. **Duplicate / Replay Protection:** Relies entirely on the hosted backend finalizing the attempt on `ActionExamSubmit`; `SubmitConfirmModal` closes before `submitExam` resolves, and `lifecycleStatus` is not used to disable re-triggering if `exam:submit` is dispatched again while `"submitting"`.
3. **Live Verification Status:** `UNVERIFIED` (0 exams available in hosted backend).
