# NURVIA vs. NursingPlex Benchmark Analysis

**Benchmark Target:** `https://nursingplex.com/`  
**Inspection Method:** Live browser navigation of publicly accessible pages (no account creation or authentication bypass).  
**Host-Verified Origin:** `https://nursingplex.com` (`blocked_origins: none`).

---

## 1. NursingPlex Publicly Observable Feature Catalogue

| Feature | Public URL | Observable Description | Evidence Limitations |
|---|---|---|---|
| **NCLEX RN & PN Study Suite** | `https://nursingplex.com/nclex/study` | RN/PN switcher, Review/Exam/Tutor modes, Client Needs progress bars, NGN practice cases, readiness overview. | Guest-mode UI observable; long-term persistence requires sign-in. |
| **NGN Case Studies** | `https://nursingplex.com/nclex/study/case-studies` | Unfolding clinical judgment scenarios with matrix, drag-and-drop, and highlight item types. | Full scoring algorithm not inspectable without account/submission. |
| **Practice Tests Generator** | `https://nursingplex.com/nclex/study/tests` | Custom practice test builder by question count, mode, and topic category. | Question bank depth not verifiable without authenticated session. |
| **Performance & Readiness** | `https://nursingplex.com/nclex/study/performance`, `/readiness` | Category breakdowns, strengths/weaknesses, readiness score algorithm. | Statistical calibration of readiness score unverified. |
| **Study Plan** | `https://nursingplex.com/nclex/study/study-plan` | Day-by-day and weekly study schedules. | Persistence gated behind account. |
| **Mark Klimek Notes** | `https://nursingplex.com/mark-k` | Complete notes for all 12 Mark Klimek lectures; 100% publicly readable. | Static/publicly readable. |
| **Ultimate Nursing Bundle** | `https://nursingplex.com/study-guide` | Advertised as "99 short study topics, from EKG to dosage math." | **Broken/Blank:** Renders empty client-side DOM container. |
| **Nursing Care Plans** | `https://nursingplex.com/care-plans`, `/templates`, `/guides/nursing-care-plan-guide` | 100+ care plans filterable by body system, NANDA type (Problem/Risk/Health Promotion), and acuity (Acute/Chronic). | Publicly readable. |
| **Question of the Day (QOTD)** | `https://nursingplex.com/qotd` | Daily NCLEX-style clinical question. | Answering & rationale gated behind `/auth` ("Sign in to answer and reveal the rationale"). |
| **Community Forum & Categories** | `https://nursingplex.com/forum`, `/categories`, `/new`, `/search` | Structured categories: Pre-Nursing (TEAS, HESI A2, Kaplan), Nursing School, Exit Exams (HESI/ATI), NCLEX-RN/PN, International Nurses (CGFNS, NCK, NMC CBT/OSCE), New Grads. | Reading public; posting requires `/auth`. |
| **Study Groups** | `https://nursingplex.com/groups` | Group directory with virtual meetups, filtered by NCLEX-RN/PN, HESI, ATI, TEAS, NCK, NMC CBT/OSCE. | Creating/joining requires `/auth`. |
| **Nurse Mentorship** | `https://nursingplex.com/mentors`, `/mentorship` | Specialty mentor directory & request flow. | Currently displays placeholder "No mentors here yet." |
| **Exam Results Insights** | `https://nursingplex.com/insights` | Self-reported exam pass/fail distribution curves and resource usage stats. | Self-reported community data. |
| **Pricing / Flashcards** | `/pricing`, `/flashcards` | Both redirect to `https://nursingplex.com/` ("Free to start, no credit card"). | No standalone flashcards or paid paywall currently live. |

---

## 2. Benchmark Comparison Matrix (NursingPlex vs. NURVIA)

| Benchmark Category | NursingPlex Status | NURVIA Actual Status | Comparison Notes & Gap Assessment |
|---|---|---|---|
| **1. NCLEX Preparation (RN/PN)** | Publicly accessible (`/nclex/study`) | **IMPLEMENTED** (local API) / **UNSUPPORTED** (remote `108.61.9.189:8008`) | NURVIA has RN, PN_LPN, RN_Exit, PN_Exit tracks, `Review`/`Exam`/`Tutor` modes, and `AllInOne`/`Sequential` layouts. |
| **2. ATI Preparation** | Forum categories & group filters (`/categories`, `/groups`) | **IMPLEMENTED** (local API) | NURVIA's `ExamCategory.ATI` is a first-class filterable exam category in Study Library and Learner Exams. |
| **3. HESI Preparation** | Forum categories & group filters (`/categories`, `/groups`) | **IMPLEMENTED** (local API) | NURVIA's `ExamCategory.HESI` and `ExitPredictor` are first-class exam categories. |
| **4. TEAS Preparation** | Forum category & group filter (`/categories`, `/groups`) | **PARTIALLY IMPLEMENTED** | NURVIA has `/teas` informational page, but `ExamCategory` enum lacks `TEAS` (maps `/teas` links to `/exams?category=ATI`). |
| **5. NGN Question Formats** | Matrix, drag-and-drop, highlight (`/nclex/study/case-studies`) | **PARTIALLY IMPLEMENTED** | NURVIA has 18 renderers (incl. `BowTie`, `MatrixGrid`, `DragAndDrop`, `OrderedResponse`, `TabularResponse`), but lacks **Highlighting** and **ExtendedResponse/CaseStudy** automated/manual grading. |
| **6. Clinical Judgment Scenarios** | Unfolding case studies (`/nclex/study/case-studies`) | **PARTIALLY IMPLEMENTED** | NURVIA has `CognitiveSkill` (1–6) and `QuestionExhibits`, but lacks linked multi-question unfolding case progression; `ClinicalCaseStudy` uses `LegacyCredit`. |
| **7. Study Guides** | `/study-guide` (currently blank DOM) | **PRESENTATION ONLY** | NURVIA's `/learner/guides` is hardcoded mock data with non-functional Download PDF buttons. |
| **8. Flashcards** | Redirects to `/` (not live) | **PRESENTATION ONLY** | NURVIA's `/learner/flashcards` is a hardcoded 3-card mock with no SRS backend. |
| **9. Lectures (Mark K.)** | 12 lectures publicly readable (`/mark-k`) | **IMPLEMENTED** | **NURVIA strength:** Full DB-backed `Lectures` + editorial workflow (`Author -> Reviewer -> Publisher`) + `LectureSeeder`. |
| **10. Care Plans** | 100+ filterable care plans + templates (`/care-plans`) | **PRESENTATION ONLY** | **Genuine Gap:** NURVIA's `/care-plans` and `/learner/care-plans` only show 2 hardcoded cards. |
| **11. Daily Questions (QOTD)** | `/qotd` (rationale login-gated) | **NOT IMPLEMENTED** | **Genuine Gap:** No QOTD entity, scheduler, streak tracking, or UI in NURVIA. |
| **12. Study Groups** | `/groups` with exam/international filters | **NOT IMPLEMENTED** | **Genuine Gap:** No study group entities, membership, or UI in NURVIA. |
| **13. Mentorship** | `/mentors`, `/mentorship` (empty placeholder) | **NOT IMPLEMENTED** | **Candidate Opportunity:** Requires professional verification, privacy, and booking design before launch. |
| **14. Performance Tracking** | `/nclex/study/performance` | **PARTIALLY IMPLEMENTED** | NURVIA `/learner/performance` shows real submitted exam count & average, but lacks subject/topic/cognitive-skill breakdowns. |
| **15. Community Features** | `/forum`, `/categories`, `/new`, `/search`, `/insights` | **PRESENTATION ONLY** | **Genuine Gap:** NURVIA's `/community` and `/learner/community` are 2-item hardcoded mocks. |
| **16. Examination Readiness** | `/nclex/study/readiness` | **NOT IMPLEMENTED** | NURVIA intentionally omits uncalibrated readiness estimates on `/learner/performance`. |

---

## 3. NURVIA Competitive Strengths & Differentiation Opportunities

- **Existing NURVIA Strengths:**
  1. **18-Type Renderer & Grader Architecture:** Far richer item-type taxonomy than typical community platforms, with server-authoritative grading and version snapshotting on attempts.
  2. **Editorial Governance Workflow:** Full `Draft -> PendingReview -> Approved -> Published -> Archived` lifecycle for Questions, Exams, and Mark K. Lectures, plus `ReviewReleasePolicy` (`Immediate` vs `ManualRelease`).
  3. **Academic Discovery Metadata:** `Exam` already models `School`, `AcademicYear`, `Season`, `Subject`, `Topic`, `Difficulty`, and `LearningObjectives`.
  4. **6-Stage Progressive Tutor Engine:** Server-persisted `TutorStageReached` with strict anti-leakage (stages 2–3 never reveal answer keys).
- **High-Value Differentiation Opportunities:**
  1. **Complete NGN Unfolding Case Engine** (multi-item linked cases + dynamic EHR timeline + rubric/manual grading).
  2. **Grounded AI Clinical Tutor** (connect `IAiTutorProvider` to an actual LLM grounded in NURVIA's `QuestionVersion` rationales & `Lecture` content).
  3. **Clinical Learning Studio** (interactive NANDA-I/NIC/NOC care plan builder + pharmacology drug cards + expanded dosage calculators).
