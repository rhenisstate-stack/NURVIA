# QLEX_11 — EXAMINATION ENGINE AUDIT

## 1. Supported Question Types (38 Total)
`src/app/web/(livexams)/partials/dispatcher/QuestionTypes.tsx` dispatches 19 standalone types + 19 `CaseBased*` variants (via `CaseBasedDynamics.tsx` + `stencil/caseBased.tsx`):
1. `singleChoice` | 2. `multipleSelect` | 3. `trueFalse` | 4. `numericResponse` | 5. `matching` | 6. `orderingNumber` | 7. `orderingItem` | 8. `orderingDragDrop` | 9. `dynamicImage` | 10. `multipleImage` | 11. `blankSelect` | 12. `blankFill` | 13. `hotspot` | 14. `openEnded` | 15. `highLight` | 16. `audioBased` | 17. `videoBased` | 18. `matrixSingleChoice` | 19. `matrixMultipleSelect` (+ `CaseBased*` for all 19).

## 2. State, Navigation & Autosave
- **State Store:** `LiveExamActionProvider` (`src/lib/contexts/web/assessment/live/useLiveExamActionContext.tsx`) maintains an in-memory `useReducer` (`answers` keyed by `questionId` with `dirty`, `saving`, `savedAt`, `error`, `retryCount`).
- **Debounced Autosave:** `submitAnswer()` sets `dirty: true` immediately and debounces `syncToBackend()` by **800ms** (`DEBOUNCE_MS = 800`), calling `POST /api/nexus/strata/assessment/exam/upserts` (`actionGroup: "ExamAnswers"`). On failure, retries up to **8 times** every **3000ms**.
- **Navigation:** `QuestionHeader` progress bar (click/drag jump), Previous/Next buttons, and `QuestionActionNavigator` (flag, bookmark, star, pin, feedback via `ActionQuestion*`). Current question index is saved in `sessionStorage` (`dynamic_live_exam_current_question_position_{examGuidId}`).

## 3. Timer & Integrity
- **Countdown (`UpperStickyNavBar.tsx`):** Initializes `secondsLeft` from `latestAction.residualDuration * 60` or `exam.duration * 60` (resetting on fresh attempt). Ticks every 1000ms, freezes on `exam:paused` / `isCancelled`.
- **Duration Persistence:** Calls `saveResidualDuration` (`ActionExamDuration`) every **2 minutes**, 300ms after `visibilitychange` (`hidden`), and on `beforeunload`.
- **Defects Identified:**
  1. **Answer Key Exposure Risk (`P0`):** `StrataSessionQuestionFull` models `questionCorrectAnswers` and `questionMatrices.cells[].isCorrect` on the live session payload (`singleChoice.tsx` reads `q.questionCorrectAnswers`). Unless stripped by the backend in `Exam`/`Test` modes, learners can inspect correct answers in network responses.
  2. **XSS Risk (`P1`):** Question components (e.g., `singleChoice.tsx` line 127) render `q.questionText` and `q.metaQuestionText` with `dangerouslySetInnerHTML` without DOMPurify sanitization.
  3. **Unsafe `beforeunload` Sync (`P1`):** `UpperStickyNavBar.tsx` uses standard `fetch()` in `beforeunload` rather than `navigator.sendBeacon` or `keepalive: true`, so final timer sync may be aborted on tab close.
  4. **Auto-submit Inconsistency (`P2`):** On `timeUp` in strict modes (`exam`/`test`), `UpperStickyNavBar.tsx` calls `submitExam({ examId, examGuidId, reason })` without `status: "Completed"` and without opening `SubmitResultModal`.
