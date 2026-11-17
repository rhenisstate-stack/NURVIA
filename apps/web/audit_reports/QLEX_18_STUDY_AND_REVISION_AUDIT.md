# QLEX_18 — STUDY AND REVISION AUDIT

## 1. Implemented Learning Modules
- **Dashboard Learning Hierarchy (`src/app/dashboards/*/vista/learning/`):**
  - `programs/{absolute,distinct}/{outline,overview}/page.tsx`
  - `courses/{absolute,distinct}/{outline,overview}/page.tsx`
  - `subjects/{absolute,distinct}/{outline,overview}/page.tsx`
  - Backed by `strataService` -> `/api/nexus/strata/learning/{program|course|subject|unit|lesson|topic|concept|fact}`.
- **DIY Custom Exam Builder (`src/app/dashboards/shared/modal/diyExamCreation.tsx` & `diyExamQuestionCreation.tsx`):**
  - Allows learners to compose custom practice exams via `POST /api/nexus/strata/assessment/exam/diy`.
- **Web Study Pages:**
  - `src/app/(web)/pages/notes/page.tsx` (actually renders `EntrancePage` program selector — misnamed/repurposed route!).
  - `src/app/(web)/pages/resources/page.tsx`, `src/app/(web)/pages/heed/{current,relative}/page.tsx` (messaging/notifications), `src/app/(web)/pages/seek/page.tsx` (global search via `/api/seek`).
- **Not Implemented:** Dedicated spaced-repetition flashcards (`Anki`-style SM-2) and standalone interactive flashcard decks do not exist in the codebase.
- **Live Status:** `useRelativeStrataPrograms` returned `200 OK` with `data: []` (0 programs seeded on hosted backend).
