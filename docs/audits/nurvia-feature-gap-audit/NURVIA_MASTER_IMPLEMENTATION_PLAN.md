# NURVIA — Master Implementation Plan

**Audit Date:** 2026-11-15  
**Rule:** Dependency-aware, incremental, non-duplicative. Preserve Clean Architecture (`Nurvia.Domain`, `Nurvia.Application`, `Nurvia.Infrastructure`, `Nurvia.Api`) and Next.js App Router (`apps/web`).

---

## Workstream Classification

- **Track A — Existing Defects Requiring Correction:** `Phase A1`, `Phase A2`
- **Track B — Incomplete Existing Features Requiring Completion:** `Phase B1`, `Phase B2`
- **Track C — New Features Requiring Implementation:** `Phase C1`, `Phase C2`, `Phase C3`, `Phase C4`
- **Track D — Long-Term Opportunities:** `Phase D1`, `Phase D2`

---

## Track A: Existing Defects Requiring Correction

### Phase A1 — Deployment Contract, TLS & Auth Hardening
- **Objective:** Align `apps/web` with a deployed HTTPS `apps/api` instance and close P0 auth/transport gaps.
- **Scope:** Remote API deployment/URL alignment (`GAP-001`), HTTPS enforcement (`GAP-002`), rate limiting (`GAP-004`), security headers & CORS (`SEC-006`).
- **Reusable Assets:** `apps/web/lib/api-config.mjs`, `apps/api/Nurvia.Api/Program.cs`, `AuthController.cs`.
- **Affected Modules:** `apps/api/Nurvia.Api/Program.cs`, `apps/web/.env.local` (deployment env), `apps/web/next.config.mjs`.
- **Backend Changes:** Add `AddRateLimiter` (sliding window on `/api/auth/login` and `/api/auth/register`), configurable CORS origins from `AllowedOrigins`, security headers middleware.
- **Frontend Changes:** Enable `requireHttps: true` in production build checks; point `SKEW_LINE_DOTNET_BASE_URL` to deployed HTTPS `apps/api`.
- **Database Changes:** None.
- **Security Requirements:** `nurvia_session` cookie `Secure=true` behind HTTPS; brute-force protection returning `429 Too Many Requests`.
- **Testing Requirements:** Integration tests for rate-limit `429` responses; `remote-api-config.test.mjs`; Playwright smoke against deployed HTTPS API.
- **Dependencies:** Provisioned HTTPS hosting for `apps/api` + PostgreSQL 16.
- **Acceptance Criteria:** `/api/health` and `/api/auth/me` return `200`/`401` (never `302 -> /web/restoration/lost`); `429` triggered after threshold failed logins.
- **Completion Evidence:** Passing Playwright E2E suite against HTTPS target + `curl` verification.
- **Rollback:** Revert `SKEW_LINE_DOTNET_BASE_URL` / rate-limit middleware config if false-positive throttling occurs.

### Phase A2 — Navigation Fixes, Calculator Guard & Admin Audit/RBAC Wiring
- **Objective:** Eliminate broken `/exam-session` links, calculator `Infinity`/`NaN`, and wire existing backend endpoints (`/api/audit-logs`, `/api/auth/assign-role`) into Admin UI.
- **Scope:** `GAP-006`, `GAP-007`, `GAP-008` (gating remaining mocks), `GAP-009`, `GAP-015`.
- **Reusable Assets:** `AuditLogsController.cs`, `AuthController.AssignRole`, `nurviaApi.getAuditLogs`, `LearnerShell`, `AdminShell`.
- **Affected Modules:** `apps/web/app/nclex/page.tsx`, `apps/web/app/learner/calculators/page.tsx`, `apps/web/app/admin/audit/page.tsx`, `apps/web/app/admin/rbac/page.tsx`, `apps/web/app/admin/page.tsx`, `apps/api/Nurvia.Api/Controllers/AuthController.cs` (add `GET /api/users` for Admin/Superadmin).
- **Backend Changes:** Add `GET /api/users` (paginated, role-filtered, `Administrator`/`Superadmin` only) and `GET /api/admin/overview` (real counts from `Questions`, `Exams`, `UserAccounts`, `ExamAttempts`).
- **Frontend Changes:** Fix `nclex/page.tsx` CTA to `/exams?track=RN`; guard `timeHours > 0` in `calculators/page.tsx`; replace mock arrays in `/admin`, `/admin/audit`, `/admin/rbac` with real API calls; hide or badge unimplemented mock routes in `learner-shell.tsx` / `admin-shell.tsx`.
- **Database Changes:** None.
- **Security Requirements:** `GET /api/users` must enforce `Administrator`/`Superadmin`; role assignment must continue using `RoleAssignmentPolicy`.
- **Testing Requirements:** Backend auth tests for `GET /api/users`; frontend E2E verifying `/admin/audit` renders persisted `AuditLogs`.
- **Acceptance Criteria:** Zero broken `/exam-session` links; `/admin/audit` and `/admin/rbac` display live DB records; `0` ESLint errors and reduced warnings.
- **Rollback:** Feature-flag or revert UI route changes independently of DB.

---

## Track B: Incomplete Existing Features Requiring Completion

### Phase B1 — Password Recovery, Refresh Tokens & Grading Integrity
- **Objective:** Add self-service password reset, revocable refresh tokens, and eliminate silent `LegacyCredit` 100% grading bypasses (`GAP-003`, `GAP-005`, `GAP-013`).
- **Reusable Assets:** `Pbkdf2PasswordHasher`, `JwtService`, `QuestionResponseGrader.cs`, `QuestionVersion.cs`.
- **Affected Modules:** `Nurvia.Domain/Accounts/`, `Nurvia.Application/Questions/QuestionResponseGrader.cs`, `Nurvia.Domain/Questions/QuestionVersion.cs`, `AuthController.cs`, `apps/web/app/sign-in/page.tsx`.
- **Database Changes:** Add `PasswordResetTokens` and `RefreshTokens` tables; add `GradingStatus` enum (`AutoGraded`, `PendingManualReview`, `ManuallyGraded`) to `AttemptResponse`.
- **API Requirements:** `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/change-password`, `POST /api/auth/refresh`, `POST /api/attempts/{id}/responses/{responseId}/grade` (Instructor/Reviewer/Admin).
- **Security Requirements:** Hash reset/refresh tokens at rest (SHA-256); 15-min reset expiry; single-use; anti-enumeration `202 Accepted` on forgot-password.
- **Testing Requirements:** Unit tests for `QuestionVersion.Validate` rejecting missing `Correct*` keys on `MatrixGrid`/`BowTie`/`DragAndDrop`/`MultipleTrueFalse`; unit tests for `PendingManualReview` scoring; token expiry/revocation tests.
- **Dependencies:** Phase A1 (HTTPS + rate limiting).
- **Acceptance Criteria:** `ExtendedResponse` no longer auto-awards 100%; password reset works end-to-end; revoked refresh tokens fail `401`.
- **Rollback:** Keep `LegacyCredit` behind an explicit legacy-question flag for pre-existing seeded items if needed.

### Phase B2 — NGN Unfolding Case Simulator & Performance Intelligence
- **Objective:** Complete multi-step unfolding NGN case studies, add Highlighting & inline Cloze items, and deliver persisted topic/cognitive-skill analytics (`GAP-010`, `GAP-014`).
- **Reusable Assets:** `QuestionExhibit`, `CognitiveSkill`, `ClientNeedCategory`, `CaseStudyRenderer.tsx`, `learner/performance/page.tsx`, `SavedStudySets`.
- **Affected Modules:** `Nurvia.Domain/Questions/`, `Nurvia.Application/Services/ExamAttemptService.cs`, `apps/web/components/exam/renderers/`, `apps/web/app/learner/performance/page.tsx`, `apps/web/app/learner/saved-questions/page.tsx`.
- **Database Changes:** Add `CaseStudies` & `CaseStudySteps` (linking ordered `Question` items with `ExhibitPhase` progression); add `SavedQuestions` table.
- **API Requirements:** `GET/POST/PUT /api/case-studies/*`, `GET /api/attempts/analytics` (accuracy by `Subject`, `Topic`, `CognitiveSkill`, `ClientNeedCategory`), `GET/POST/DELETE /api/saved-questions/*`.
- **Frontend Changes:** Build `HighlightRenderer.tsx`, multi-step `CaseStudyPlayer`, topic/CJMM breakdown charts on `/learner/performance` (explicitly noting observed accuracy, not uncalibrated pass probability), wire `/learner/saved-questions` and `/admin/cases`.
- **Testing Requirements:** Grader tests for `Highlight`; E2E unfolding case flow; IDOR tests on `SavedQuestions` & analytics.
- **Dependencies:** Phase B1 (`PendingManualReview`).
- **Acceptance Criteria:** 6-step NGN unfolding case runs with progressive EHR exhibits and accurate polytomous scoring; `/learner/performance` displays real persisted breakdowns.
- **Rollback:** Additive tables (`CaseStudies`, `SavedQuestions`) can be disabled via route/API feature flags without impacting existing exams.

---

## Track C: New Features Requiring Implementation

### Phase C1 — Question of the Day (QOTD) & Spaced Repetition Flashcards
- **Objective:** Launch daily RN/PN engagement loop (`/qotd`) and persisted SM-2 SRS Flashcards (`/learner/flashcards`).
- **Reusable Assets:** `QuestionRendererRegistry`, `QuestionResponseGrader`, `NursingPathway`.
- **Database Changes:** `DailyQuestionSchedules`, `DailyQuestionAttempts`, `FlashcardDecks`, `Flashcards`, `FlashcardProgress`.
- **API Requirements:** `GET /api/qotd/today`, `POST /api/qotd/{id}/answer`, `GET /api/qotd/streak`, `GET/POST /api/flashcards/*`, `POST /api/admin/qotd`.
- **Frontend Changes:** Public/learner QOTD widget & `/qotd` page (rationale gated on auth or submission), interactive SRS rating UI (`Again`/`Hard`/`Good`/`Easy`) on `/learner/flashcards`.
- **Testing Requirements:** Streak calculation unit tests (UTC boundary edge cases); SM-2 interval calculation tests; E2E QOTD + Flashcard review.
- **Dependencies:** Phase A1.
- **Acceptance Criteria:** Separate RN/PN daily questions publish on schedule, record attempts/streaks, and SRS flashcards persist due dates.

### Phase C2 — Clinical Learning Studio (Care Plans & Study Guides)
- **Objective:** Replace `/care-plans`, `/learner/care-plans`, and `/learner/guides` mocks with a real clinical resource & interactive care plan module.
- **Reusable Assets:** `Lecture` editorial workflow (`Author -> Reviewer -> Publisher`), `FileStorageService`, `Skia`/PDF storage patterns.
- **Database Changes:** `CarePlans` (NANDA-I diagnosis, system, acuity, subjective/objective cues, NOC outcomes, NIC interventions, status), `StudyGuides` (metadata + file storage key).
- **API Requirements:** `GET/POST/PUT /api/care-plans/*`, `GET/POST/PUT /api/study-guides/*`, `GET /api/study-guides/{id}/download`.
- **Frontend Changes:** Filterable Care Plan Library (body system, NANDA type, acuity) + interactive learner Care Plan Builder; real PDF download on `/learner/guides`.
- **Testing Requirements:** Authorization tests ensuring only `Published` resources are public; file-download path-traversal tests.
- **Dependencies:** Phase A1.
- **Acceptance Criteria:** Learners can filter/study/build care plans and download verified study guides.

### Phase C3 — Grounded AI Clinical Tutor & Exam Catalogue Expansion
- **Objective:** Implement a real `IAiTutorProvider` grounded in NURVIA content (`GAP-012`) and expand `ExamCategory` (`TEAS`, `NCK`, `NMC_CBT`) + `Country`/`Curriculum` (`GAP-011`).
- **Reusable Assets:** `IAiTutorProvider`, `TutorService.cs`, `Exam.cs`, `StudyLibraryController.cs`.
- **Database Changes:** `TutorConversations`, `TutorMessages`, `AiUsageLogs`; add `Country`, `Curriculum` to `Exams`.
- **API Requirements:** `POST/GET /api/tutor/conversations/*`, update `GET /api/study-library/filters` with `Country` and `Curriculum`.
- **Security & Safety Requirements:** Per-user daily token/request rate limits, prompt-injection sanitization, non-medical-advice educational disclaimer, secret-free server-side LLM API key management.
- **Testing Requirements:** Mocked LLM provider tests verifying grounded context injection and rate-limit enforcement.
- **Dependencies:** Phase A1, Phase B1.
- **Acceptance Criteria:** `/learner/ai-tutor` persists conversations and uses grounded NURVIA rationales; `/teas` links to real `ExamCategory.TEAS` exams.

### Phase C4 — Community Forum, Study Groups & Subscription Billing
- **Objective:** Replace `/community` & `/learner/community` mocks with a moderated forum + study groups, and wire `/learner/subscription` & `/admin/plans`.
- **Reusable Assets:** `ExamReview` moderation pattern, `UserProfile`, `AuditLogs`.
- **Database Changes:** `CommunityPosts`, `CommunityReplies`, `CommunityReactions`, `ContentReports`, `StudyGroups`, `StudyGroupMembers`, `SubscriptionPlans`, `UserSubscriptions`.
- **API Requirements:** `/api/community/*`, `/api/study-groups/*`, `/api/plans`, `/api/subscriptions/*` (with payment provider webhook verification).
- **Security Requirements:** XSS sanitization, PII/PHI & exam-integrity reporting queue, moderator role enforcement, signed webhook verification.
- **Dependencies:** Phase A1, Phase A2.
- **Acceptance Criteria:** Authenticated learners can post, join study groups, report content, and manage active subscriptions.

---

## Track D: Long-Term Opportunities

### Phase D1 — Pharmacology Intelligence & Dosage Suite
- **Objective:** Versioned Drug Monographs + pediatric weight-based & continuous titration calculators.
- **Clinical & Legal Guardrail:** Requires clinical pharmacist/educator review, authoritative reference citations, version stamps, and prominent non-clinical-use disclaimers.

### Phase D2 — Nursing Mentorship, Career Centre & Anonymized Insights
- **Objective:** Verified nurse mentorship (`/mentors`), CV/interview/licensing pathways, and anonymized cohort insights (`/insights`).
- **Legal & Privacy Guardrail:** Requires license verification workflow, scheduling/safeguarding policies, explicit user consent, and k-anonymity aggregation before launch.
