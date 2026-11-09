# NURVIA — Complete Application Route Inventory
**Date:** November 9, 2026  
**Auditor:** Principal Full-Stack Engineer & Next.js Architect  
**Project:** NURVIA — Your Path to Nursing Confidence  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Total Routes Inventoried:** 47  

---

## 1. Inventory Summary Table

| Area | Route | Navigation Source | Expected Destination | Build Status | Verification Status | Action Taken |
|---|---|---|---|---|---|---|
| **Public** | `/` | Navbar "Home" | Public Homepage with Carousel & CTAs | Static Prerendered | Verified (HTTP 200) | Preserved & Carousel Integrated |
| **Public** | `/exams` | Navbar "Exams" | Examination Catalogue & Filter | Static Prerendered | Verified (HTTP 200) | Preserved & Sub-filters Linked |
| **Public** | `/study` | Navbar "Study" | Study Hub Learning Directory | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Public** | `/care-plans` | Navbar "Care Plans" | Nursing Care Plan Library | Static Prerendered | Verified (HTTP 200) | Implemented & Specialty Filters |
| **Public** | `/mark-k` | Navbar "Mark K." | Mark Klimek 12-Lecture Index | Static Prerendered | Verified (HTTP 200) | Implemented with Legal Disclaimer |
| **Public** | `/community` | Navbar "Community" | Student Discussion Hub & Guidelines | Static Prerendered | Verified (HTTP 200) | Implemented with Auth Gating |
| **Public** | `/faq` | Navbar "FAQ" | Frequently Asked Questions | Static Prerendered | Verified (HTTP 200) | Implemented with Search & Accordion |
| **Public** | `/nclex` | Navbar "NCLEX" | NCLEX-RN & PN Preparation Hub | Static Prerendered | Verified (HTTP 200) | Implemented with NGN CJMM Model |
| **Public** | `/teas` | Navbar "TEAS" | Pre-Nursing TEAS Preparation Hub | Static Prerendered | Verified (HTTP 200) | Implemented with 4 Subject Categories |
| **Public** | `/exam-session` | Practice / Exam CTAs | Interactive Examination Shell | Static Prerendered | Verified (HTTP 200) | Preserved & Session Parameters Mapped |
| **Public** | `/design-system` | Footer Link | Brand Design Tokens & UI Showcase | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Public** | `/_not-found` | Global Fallback | 404 Resource Not Found Page | Static Prerendered | Verified (HTTP 404) | Reconciled App Router Fallback |
| **Learner** | `/learner` | Sidebar "Dashboard" | Learner Overview & Readiness | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/performance` | Sidebar "Performance" | Visual Accuracy & NGN Heatmap | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/planner` | Sidebar "Study Planner" | Revision Calendar & Milestones | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/exams` | Sidebar "RN / PN Exams" | Track-filtered Exam Repository | Static Prerendered | Verified (HTTP 200) | Reconciled Query Parameter Matching |
| **Learner** | `/learner/library` | Sidebar "Study Library" | Searchable Question Collections | Static Prerendered | Verified (HTTP 200) | Preserved & Filter Props Added |
| **Learner** | `/learner/my-exams` | Sidebar "My Library" | Enrolled & Bookmarked Exams | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/custom-practice` | Sidebar "Custom Practice" | Quiz Builder by Cognitive Skill | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/history` | Sidebar "Attempt History" | Past Examination Attempts Log | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/hub` | Sidebar "Study Hub" | Learner Resource Aggregator | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/guides` | Sidebar "Study Guides" | Specialty Clinical Cheat Sheets | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/flashcards` | Sidebar "Flashcards" | Spaced Repetition Decks | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/care-plans` | Sidebar "Care Plans" | Clinical Diagnosis Interventions | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/calculators` | Sidebar "Calculators" | Dosage & IV Flow Rate Math | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/ai-tutor` | Sidebar "AI Tutor" | Socratic Clinical Reasoning Chat | Static Prerendered | Verified (HTTP 200) | Preserved & Chunk Resolvability Restored |
| **Learner** | `/learner/saved-questions` | Sidebar "Saved Questions" | Bookmarked Question Repository | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/community` | Sidebar "Community" | Learner Cohort Discussions | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/account` | Sidebar "My Account" | Student Profile & Credentials | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/settings` | Sidebar "Settings" | Display & Study Preferences | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Learner** | `/learner/subscription` | Sidebar "Subscription" | Plan Tier & Billing Cycle | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Admin** | `/admin` | Admin Shell "Overview" | Administrative Content Studio | Static Prerendered | Verified (HTTP 200) | Preserved & Recovered |
| **Admin** | `/admin/analytics` | Admin Shell "Analytics" | Psychometric Performance Stats | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/audit` | Admin Shell "Audit Trail" | Security & Editorial Log Table | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/questions` | Admin Shell "Question Bank"| Question Item Management Table | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Admin** | `/admin/questions/new` | Admin "Author Question" | Multi-step Item Authoring Form | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Admin** | `/admin/questions/[id]/edit` | Admin "Edit Question" | Dynamic Question Editor | Dynamic Server Rendered | Verified (HTTP 200) | Preserved & Async Params Verified |
| **Admin** | `/admin/question-types` | Admin "Question Types" | NGN Item Schema Registry | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/exams` | Admin "Exam Builder" | Examination Blueprint Studio | Static Prerendered | Verified (HTTP 200) | Preserved |
| **Admin** | `/admin/reviews` | Admin "Review Queue" | Peer Editorial Approval Queue | Static Prerendered | Verified (HTTP 200) | Linked in Admin Navigation |
| **Admin** | `/admin/taxonomy` | Admin "Taxonomy" | Client Needs Curriculum Tree | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/cases` | Admin "Case Studies" | Unfolding Case Study Studio | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/learners` | Admin "Learner Directory"| Student Roster & Readiness Log | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/rbac` | Admin "Roles & RBAC" | Authorization Policies & Claims | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/plans` | Admin "Plans" | Subscription Tiers & Gating | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |
| **Admin** | `/admin/settings` | Admin "System Settings" | Persistence & Engine Settings | Static Prerendered | Verified (HTTP 200) | Implemented & Linked |

---

## 2. Dynamic Segment & Query Parameter Mapping

1. `/admin/questions/[id]/edit`
   - Identifier Parameter: `id` (e.g. `Q-8902`)
   - Resolves through Next.js App Router dynamic route handler.
   - Verified that client component cleanly accesses `useParams().id`.
2. `/exams?track=RN`, `/exams?track=PN_LPN`, `/exams?category=ATI`, `/exams?category=HESI`
   - Resolves to filtered catalogues in `apps/web/app/exams/page.tsx`.
3. `/learner/exams?track=RN_Exit&category=ExitPredictor`
   - Resolves to exit predictor assessment modules.
4. `/exam-session?track=RN&category=NCLEX`
   - Initializes adaptive practice mode.
