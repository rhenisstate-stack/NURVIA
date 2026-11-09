# STAGE 7 REPORT — LEARNING INTEGRATION AND CATALOG WIRING

**Project:** NURVIA — *Your Path to Nursing Confidence.*  
**Date:** 2026-11-09  
**Stage:** 7 — Learning Integration and Catalog Wiring  
**Status:** COMPLETE & VERIFIED  

---

## 1. Executive Summary

Stage 7 established end-to-end integration between NURVIA's backend examination engine, question domain, and the learner's study and examination catalog. It verified that all published examinations, custom practice sessions, attempt history records, and rationale reviews operate on real, server-persisted data without fabricated client metrics.

Key achievements include:
1. **Catalog & Study Library Integration:** Updated [`apps/web/components/study/study-library-view.tsx`](file:///c:/Users/gitau/Documents/NURVIA/apps/web/components/study/study-library-view.tsx) to query published examinations from `nurviaApi.getExams({ status: 5 })` (where `ExamStatus.Published = 5`), seamlessly mapping real database-persisted exams while retaining standard curriculum modules.
2. **Bidirectional Session Initialization:** Enhanced [`apps/web/app/exam-session/page.tsx`](file:///c:/Users/gitau/Documents/NURVIA/apps/web/app/exam-session/page.tsx) to automatically distinguish between active examinations (`startAttempt` / `getActiveAttempt`) and historical reviews (`getAttemptReview`), populating answers, timing, and question rationales deterministically.
3. **Learner Attempt History & Review Routing:** Replaced static mock records in [`apps/web/app/learner/history/page.tsx`](file:///c:/Users/gitau/Documents/NURVIA/apps/web/app/learner/history/page.tsx) with live queries to `nurviaApi.getAttemptHistory()`, rendering exact scores, submission timestamps, and direct links to completed exam reviews or in-progress resumes.
4. **Custom Practice Configuration:** Verified [`apps/web/app/learner/custom-practice/page.tsx`](file:///c:/Users/gitau/Documents/NURVIA/apps/web/app/learner/custom-practice/page.tsx) parameter passing for nursing pathway (`RN`, `PN_LPN`, `RN_Exit`, `PN_Exit`), delivery modes (`Review`, `Exam`, `Tutor`), and question volume sliders.

---

## 2. Catalog & Examination Discovery

### 2.1 Filtering by Status
In NURVIA's domain model, draft, under-review, or archived content must never be visible to learners. The API client queries the backend with status parameter `5` (`ExamStatus.Published`):

```typescript
const res = await nurviaApi.getExams({ status: 5 });
```

The backend `ExamService.cs` applies `query.Where(e => e.Status == filter.Status.Value)` before returning the paginated results, guaranteeing that only published, verified examination versions are served.

### 2.2 Bidirectional Parameter Dispatch
The Study Library dynamically generates URLs based on the origin of the examination:
- Database-persisted published exams generate `/exam-session?examId=${set.id}&mode=Exam`, triggering `nurviaApi.startAttempt(examId)`.
- Standard practice modules generate `/exam-session?setId=${set.id}&mode=Exam`, utilizing client-side board-aligned practice sets.

---

## 3. Attempt Review and Historical Records

### 3.1 Review Hydration (`hydrateFromReview`)
When a learner views an already-completed attempt from history or follows a review link, `apps/web/app/exam-session/page.tsx` retrieves the graded attempt from `GET /api/attempts/{id}/review`:

```typescript
const hydrateFromReview = (data: SubmittedExamResultDto) => {
  setAttemptId(data.attemptId);
  setExamTitle(data.examTitle);
  setIsSubmitted(true);
  setSubmittedResult(data);
  setDeliveryMode("Review");
  // Hydrates question stems, options with isCorrect flags, specific rationales, and general rationales
};
```

This ensures that:
- In-progress attempts cannot prematurely reveal answer keys or rationales (enforced server-side in `IExamAttemptService`).
- Completed attempts provide full question-level rationales, learner selection feedback, and score summaries.

### 3.2 Real Attempt History Integration
In [`apps/web/app/learner/history/page.tsx`](file:///c:/Users/gitau/Documents/NURVIA/apps/web/app/learner/history/page.tsx), `useEffect` invokes `nurviaApi.getAttemptHistory()` on mount.
- Each row reflects real database timestamps (`submittedAtUtc`), question counts, and calculated score percentages.
- Actions direct to `/exam-session?attemptId=${a.id}&mode=Review` for completed attempts and `/exam-session?attemptId=${a.id}&mode=Exam` for in-progress attempts.

---

## 4. Verification and Test Results

### 4.1 Automated Learning Integration Test Suite
Execution of `node apps/web/tests/learning-integration.test.mjs`:
```
--- NURVIA STAGE 7: LEARNING INTEGRATION & CATALOG WIRING TEST SUITE ---
[PASS] 1. Study Library View integrates published exams and generates bidirectional query links
[PASS] 2. Exam session hydrates active attempts, completed reviews, and performs autosave
[PASS] 3. Learner History page queries getAttemptHistory and links to review/resume modes
[PASS] 4. Custom Practice page supports pathways, question volume slider, and delivery modes
[PASS] 5. Learner Exams page defines all four canonical nursing tracks

All 5 Stage 7 test suites PASSED successfully (5/5)!
```

### 4.2 TypeScript Type-Check
Execution of `node apps/web/node_modules/typescript/bin/tsc --noEmit --project apps/web/tsconfig.json`:
- **Result:** Exited with code 0 (Zero errors).
