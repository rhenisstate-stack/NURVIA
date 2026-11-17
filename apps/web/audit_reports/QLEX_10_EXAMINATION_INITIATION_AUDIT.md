# QLEX_10 — EXAMINATION INITIATION AUDIT

## 1. Initiation & Session Retrieval
- **Live Exam Entry Routes:** `src/app/web/(livexams)/{track}/vista/exam/(layout)/{atlas|cascade|generic|glacial|orbit|pulse|zen}/page.tsx`.
- **Provider & Hook:** `LiveStrataExamProvider` (`src/lib/contexts/panel/assessment/LiveStrataExamContext.tsx`) -> `useLiveStrataExam()` (`src/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook.tsx`).
- **Backend Call:** `strataService("Exam", isDiy ? "DiyLiveFetch" : "LiveFetch", { identifier: examIdentifier, dynamicExamLayout, dynamicExamMode, dynamicAttemptNumber? })` -> `GET /api/nexus/strata/assessment/exam?fetchtype=live` (or `fetchtype=diy`) -> `GET {backend}/api/castoline/strata/assessment/exams/list/live`.

## 2. Attempt Ownership, Resume & Limits
- **Attempt Tracking:** Driven by `examSession.examActions` (`attemptCount`, `residualDuration`, `status`) and `savedUserAnswer` per question (`attemptNumber`).
- **Fresh vs Prior Attempt:** Tracked client-side via `sessionStorage` keys `exam_attempt_mode_{examGuidId}` (`"fresh"` | `"prior"`) and `exam_attempt_count_{examGuidId}`, plus custom window events `exam:attempt:fresh` and `exam:attempt:prior`.
- **Attempt Limit Check (`generic/page.tsx` lines 1146-1157):** Reads `examSession.exam.attemptsAllowed` and compares against `attemptCount` on the `"Pause"` `examAction` row; if `attemptCount >= attemptsAllowed`, opens `AttemptsExceededModal`.
- **Question Ordering (`generic/page.tsx` lines 143-190):** Questions within each section are sorted client-side by numeric `order` (ascending), preserving relative order for unordered questions.
- **Live Verification Status:** `UNVERIFIED` (0 exams available in hosted backend).
