# QLEX_24 — DATA PERSISTENCE RECONCILIATION

| Data Entity | Authoritative Source | Retrieval Endpoint | Update Endpoint | Client Cache / Storage | Verification |
|---|---|---|---|---|---|
| **User Identity** | Hosted .NET Backend | `GET /api/users/user?fetchtype=current` | — | React state (`useCurrentSystemUser`) | Verified 401 unauth |
| **Session** | Hosted .NET Backend + Client Cookies | `GET /api/auth/session` | `POST /api/auth/login`, `/logout` | `document.cookie` (`skew_blanc_session_badge`, `skew_blanc_session_line`) | Verified 500 unauth |
| **Learner Profile** | Hosted .NET Backend | `GET /api/users/user?fetchtype=current` | `POST/PUT /api/auth/support/account` | React state | Unverified live |
| **Examinations** | Hosted .NET Backend | `GET /api/nexus/strata/assessment/exam?fetchtype={absolute\|nominal\|live}` | `POST/PUT/DELETE` | React state | Verified 200 (`items: []`) |
| **Questions** | Hosted .NET Backend | Included in `exam?fetchtype=live` | `POST/PUT/DELETE /api/nexus/strata/assessment/question` | React state | Unverified live |
| **Attempt & Timer** | Hosted .NET Backend | `examSession.examActions` (`list/live`) | `POST /api/nexus/strata/assessment/exam/upserts` (`ExamLifecycle`) | `sessionStorage` (`exam_attempt_mode_*`, `exam_attempt_count_*`) | Unverified live |
| **Answers** | Hosted .NET Backend | `savedUserAnswer` (`list/live`) | `POST /api/nexus/strata/assessment/exam/upserts` (`ExamAnswers`) | `useReducer` (`LiveExamActionProvider`) | Unverified live |
| **Results & History** | Hosted .NET Backend | `GET /api/nexus/strata/assessment/result?fetchtype={distinct\|relative\|absolute}` | Created on `ActionExamSubmit` | React state | Verified 500 unauth (`relative`) |
| **Analytics** | Client-aggregated from Backend Results | `GET /api/nexus/strata/assessment/result` | — | `useMemo` in `progress/absolute`, `reports/absolute` | Unverified live |
| **Study / Programs** | Hosted .NET Backend | `GET /api/nexus/strata/learning/{program\|course\|subject}` | — | React state | Verified 200 (`data: []`) |
