# NURVIA — Product Expansion Roadmap

**Audit Date:** 2026-11-15  
**Strategy:** Preserve Clean Architecture (`Nurvia.Domain`, `Nurvia.Application`, `Nurvia.Infrastructure`, `Nurvia.Api`) and Next.js App Router (`apps/web`). Extend existing modules rather than creating duplicate systems.

---

## 1. Product Opportunity Evaluation & Integration Strategy

| Opportunity | Existing Reusable Assets | Integration Decision | Priority | Key Dependencies & Risks |
|---|---|---|---|---|
| **1. NGN Clinical Simulator** | `QuestionExhibit` (Notes, Vitals, Labs, Orders, Radiology), `CognitiveSkill` (1–6), `QuestionResponseGrader`, `CaseStudyRenderer.tsx` | **Extend Examination Engine** (add `CaseStudy` aggregate linking 6 `QuestionVersion` steps + evolving `ExhibitPhase`s) | **P1** | Must eliminate `LegacyCredit` 100% fallback on `ClinicalCaseStudy` & `ExtendedResponse`; add Highlighting & inline Cloze. |
| **2. Question of the Day (QOTD)** | `Question`, `QuestionVersion`, `QuestionResponseGrader`, `UserAccount` | **New Lightweight Module** (`DailyQuestionSchedule`, `DailyQuestionAttempt`) reusing `QuestionRendererRegistry` | **P1** | Separate RN & PN schedules, timezone-safe UTC day boundaries, streak calculation, rationale gating. |
| **3. Performance Intelligence** | `ExamAttempt`, `AttemptResponse`, `Question.Subject`, `Question.Topic`, `QuestionVersion.CognitiveSkill`, `ClientNeedCategory` | **Extend `ExamAttemptService` & `/learner/performance`** | **P1** | **Scientific Limitation:** Do not display predictive NCLEX pass probability without calibrated IRT/CAT psychometric data and empirical validation; display observed accuracy by subject, topic, and CJMM cognitive skill only. |
| **4. Clinical Learning Studio (Care Plans & Study Guides)** | `Lecture` editorial workflow (`Author -> Reviewer -> Publisher`), `FileStorageService` | **New `ClinicalResource` / `CarePlan` Module** replacing hardcoded `/learner/care-plans` and `/learner/guides` | **P1** | Clinical accuracy review required; NANDA-I/NIC/NOC taxonomy alignment. |
| **5. Grounded AI Tutor & SRS Flashcards** | `ITutorService`, `IAiTutorProvider`, `TutorService.cs`, `QuestionVersion` rationales, `Lecture` content | **Implement `IAiTutorProvider`** + add `TutorConversation`/`TutorMessage` and `FlashcardDeck`/`FlashcardReview` (SM-2 SRS) | **P2** | Token/cost rate limits, prompt injection guards, mandatory educational/non-medical-advice disclaimers. |
| **6. Community & Structured Study Groups** | `ExamReview` moderation pattern, `UserAccount`, `AuditLog` | **New `Community` Module** replacing `/community` & `/learner/community` mocks; build `StudyGroup` inside same module | **P2** | Moderation queue, report/abuse workflow, PII/PHI stripping ("never share patient identifiers or real exam questions"). |
| **7. Expanded Examination Catalogue** | `Exam` (`School`, `AcademicYear`, `Season`, `Subject`, `Topic`, `Difficulty`), `ExamCategory` | **Extend `Exam` & `ExamCategory`** (add `TEAS`, `NCK`, `NMC_CBT`, `Country`, `Curriculum`) | **P2** | Avoid hardcoded exam-specific branches; drive blueprints and passing rules via `ExamBlueprint`. |
| **8. Pharmacology Intelligence** | `Question` (`Subject = Pharmacology`), `CalculatorsPage` | **New `DrugMonograph` Module + Expanded Calculators** | **P3** | **Clinical Safety:** Requires authoritative drug reference sourcing, versioned monographs, and clinical disclaimers. |
| **9. Nursing Mentorship & Career Centre** | `UserProfile` (`ProfessionalTitle`, `Organization`, `Country`) | **Defer to Long-Term Phase** | **P3** | **Legal & Operational:** Requires license/credential verification workflow, safeguarding/privacy policies, scheduling, and dispute handling. |
| **10. Community Intelligence (Insights)** | `ExamAttempt`, `Community` posts | **Extend Analytics (Opt-in & Anonymized)** | **P3** | Must enforce k-anonymity / opt-in consent and never expose individual learner PII/FERPA-protected scores. |

---

## 2. Recommended Delivery Sequence

1. **Phase A — Stabilization, Deployment & Security (P0/P1):** Resolve remote backend contract/TLS (`GAP-001`, `GAP-002`), fix `QuestionResponseGrader` `LegacyCredit` bypass (`GAP-003`), add auth rate limiting & password recovery (`GAP-004`, `GAP-005`), fix broken `/exam-session` links (`GAP-006`), wire `/admin/audit`, `/admin/rbac`, `/admin` overview (`GAP-007`), and gate/clean mock pages (`GAP-008`).
2. **Phase B — NGN Clinical Simulator & Grading Integrity (P1):** Multi-step unfolding case study aggregate, Highlighting & inline Cloze types, manual/rubric grading queue for `ExtendedResponse`.
3. **Phase C — Daily Learning & Retention (P1/P2):** Question of the Day (RN/PN + streaks) + persisted SRS Flashcards + Cross-attempt Saved Questions.
4. **Phase D — Performance Intelligence & Expanded Catalogue (P1/P2):** Subject/Topic/CJMM Cognitive Skill analytics, CSV/PDF reports, `TEAS`/`NCK`/`NMC_CBT` + `Country`/`Curriculum` metadata.
5. **Phase E — Clinical Learning Studio & Grounded AI Tutor (P2):** Interactive Care Plan Library/Builder, downloadable Study Guides, real `IAiTutorProvider` with conversation persistence & rate limits.
6. **Phase F — Community, Study Groups & Subscription Billing (P2):** Real Forum, Study Groups, Moderation, and Stripe/entitlement enforcement.
7. **Phase G — Pharmacology Intelligence, Mentorship & Career Centre (P3):** Verified Drug Monographs, Mentor Verification/Booking, Career/Licensing Pathways, Anonymized Community Insights.
