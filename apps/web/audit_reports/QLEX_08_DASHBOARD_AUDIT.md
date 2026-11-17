# QLEX_08 — DASHBOARD AUDIT

## 1. Implementation Overview
- **Routes:** `src/app/dashboards/{ati-teas,hesi-a2,lpn-nursing,nclex-pn,nclex-rn,rn-nursing}/page.tsx` (6 track-specific dashboards).
- **Data Sources (All Backend-Driven, No Mocked Statistics):**
  - **User Identity:** `useCurrentSystemUser()` -> `/api/users/user?fetchtype=current`.
  - **Programs:** `useRelativeStrataPrograms()` -> `/api/nexus/strata/learning/program?fetchtype=relative`.
  - **Exams:** `useNominalStrataExams()` -> `/api/nexus/strata/assessment/exam?fetchtype=nominal&identifier=...`.
  - **Learner Results / Activity:** `useRelativeStrataAssessmentResults()` -> `/api/nexus/strata/assessment/result?fetchtype=relative`.
  - **Subscriptions:** `useDiscreteDominionSubscriptionPackages()` -> `/api/nexus/dominion/subscription/package?fetchtype=discrete`.
  - **Quotes:** Static motivational constants in `src/lib/constants/dashboards/nexus/vista/quotes.ts` (intentional UI copy).

## 2. Verified Live Dashboard Behaviour (`http://localhost:3000/dashboards/nclex-rn`)
- Renders `"Welcome, Guest"` and sidebar navigation cleanly.
- **Observed API Failures on Guest Load:**
  1. `GET /api/nexus/strata/learning/program?fetchtype=relative&limit=20` returned `200 OK` with `data: []`.
  2. Because `programs` was empty, `useNominalStrataExams` fired `GET /api/nexus/strata/assessment/exam?fetchtype=nominal&identifier=` with an empty `identifier`, producing **HTTP 400 Bad Request** (`"Parent Identifier is Required ⚓"`).
  3. `GET /api/nexus/strata/assessment/result?fetchtype=relative...` returned **HTTP 500 Internal Server Error** (`"Failed to Parse Backend Response ⚓"`).
  4. `GET /api/users/user?fetchtype=current` returned **HTTP 401 Unauthorized**.

## 3. Architectural Observation
All 6 dashboard directories duplicate nearly identical page and component trees (`nclex-rn`, `nclex-pn`, `ati-teas`, `hesi-a2`, `lpn-nursing`, `rn-nursing`), increasing maintenance and regression surface (`P2`).
