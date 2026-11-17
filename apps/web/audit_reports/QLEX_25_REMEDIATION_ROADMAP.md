# QLEX_25 — REMEDIATION ROADMAP

> **Approval Gate:** Per audit governance, NO code modifications have been made. Implement only after explicit owner approval.

---

## P0 — Critical

| ID | Feature | Root Cause & Evidence | Backend Dependency | Proposed Correction |
|---|---|---|---|---|
| **P0-1** | Session Security & XSS | `generateSystemUserSessionCookies.ts` writes `skew_blanc_session_line`/`badge` via `document.cookie` (non-`HttpOnly`), while question components (`singleChoice.tsx` L127) use unsanitized `dangerouslySetInnerHTML`. | Optional (`Set-Cookie` HttpOnly from BFF `/api/auth/login` works purely in Next.js) | Move `skew_blanc_session_*` into `HttpOnly`, `Secure`, `SameSite=Lax` cookies set by `/api/auth/login` and read server-side by BFF routes; sanitize all rendered HTML with DOMPurify. |
| **P0-2** | Exam Answer Key Exposure | `StrataSessionQuestionFull` (`useLiveStrataExamsHook.tsx`) models `questionCorrectAnswers` and `isCorrect` on live exam payloads. | **Yes (Hosted .NET Backend)** | Backend must omit `questionCorrectAnswers` and `isCorrect` when `dynamicExamMode` is `"Exam"` or `"Test"` (only send in `"Tutor"`/`"Review"` after submission). |
| **P0-3** | Cross-Learner Result Exposure | `reports/absolute/page.tsx` calls `result?fetchtype=absolute` (`othersAttempts`) to compute peer comparison client-side. | **Yes (Hosted .NET Backend)** | Replace raw peer `StrataExamResultItem[]` endpoint for learners with an anonymized aggregate statistics endpoint (`average`, `median`, `percentile`, `count` only). |

---

## P1 — High

| ID | Feature | Root Cause & Evidence | Backend Dependency | Proposed Correction |
|---|---|---|---|---|
| **P1-1** | Credential & Token Logging | `api/auth/login/route.ts` L48, `register/route.ts` L39, `session/route.ts` L14-17, `users/user/route.ts` L56-59, `registerService.ts` L31 log passwords, PINs, and session tokens. | No | Remove all `console.log` statements that print request bodies, credentials, or `x-casto-*` headers. |
| **P1-2** | Registration `pinConfirmation` Mismatch | `registerService.ts` sends `pin_confirmation`; `api/auth/register/route.ts` reads `body.pinConfirmation` and drops `providerPayload`. | No | Align both to `pinConfirmation` and forward `providerPayload`. |
| **P1-3** | `/api/auth/session` & `/result` 500s | Unauthenticated calls to `/api/auth/session` and `/api/nexus/strata/assessment/result?fetchtype=relative` return HTTP 500. | Partial (Backend returns 500/non-JSON) | In BFF `session/route.ts`, return `200 { logged_in: false }` when `x-casto-line`/`badge` are absent; in `result/route.ts`, return `401` when session headers are absent. |
| **P1-4** | Broken `useExamAccessGuard` | Checks `emailVerified` instead of `SystemUser.emailConfirmed` and links to non-existent `/auth/verify-email`. | No | Check `user.emailConfirmed` and link to `/dashboards/${slug}/auth/account/verify/email` (or `/auth/validate`). |
| **P1-5** | Unflushed Autosave on Submit & `beforeunload` | `generic/page.tsx` `handleConfirmedSubmit()` does not flush 800ms debounced `submitAnswer` timers; `UpperStickyNavBar.tsx` `beforeunload` uses regular `fetch`. | No | Add `flushPendingAnswers()` before `submitExam()`, and use `navigator.sendBeacon` / `fetch(..., { keepalive: true })` for `beforeunload`. |
| **P1-6** | Hosted Backend Seed Data & Auth Form Mount | Hosted backend (`108.61.9.189:8008`) returned `items: []` for exams and `data: []` for programs (`QlexNursing`); `/auth/login` & `/auth/register` forms failed to mount interactively in browser test. | **Yes (Seed Data)** | Seed `QlexNursing` programs/exams on hosted backend; debug client hydration error caused by `/api/auth/session` 500 on auth pages. |

---

## P2 — Medium & P3 — Low

| ID | Severity | Feature | Proposed Correction |
|---|---|---|---|
| **P2-1** | Medium | `sessionService.ts` calls `/api/users/session` | Update path to `/api/users/controls/session`. |
| **P2-2** | Medium | Dashboard empty `identifier=` 400 | Guard `useNominalStrataExams` from fetching when `identifier` is empty. |
| **P2-3** | Medium | 6x Dashboard & 7x Exam Layout duplication | Consolidate shared dashboard/exam layout logic into parameterized shared components. |
| **P2-4** | Medium | `WrongQuestionCard` lacks correct answer/rationale | Surface explanation/correct answer in `WrongQuestionCard` when `allowReview` is true. |
| **P2-5** | Medium | `media/[...path]/route.ts` open proxy | Validate path prefix/allowlist and restrict `Cache-Control` for protected assets. |
| **P3-1** | Low | Duplicate `useEffect` in `Login.tsx` L56-63 & L75-82 | Remove duplicate block; add `role="slider"` + keyboard support to `QuestionHeader`. |
