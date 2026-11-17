# NURVIA Phase 3.8 — External Dependency Register

| ID | Dependency | Status | Evidence |
|---|---|---|---|
| **EXT-3.8-01** | Temporary challenge compatibility (`register-skew8@lancasto`, `learner.login.skew8lancasto`) | **CONFIRMED ACCEPTED (Temporary)** | Live probes on `2026-11-17T06:00:42Z` passed challenge checks on `explicitbackend.com` for `website 11`. |
| **EXT-3.8-02** | Official Deslizar challenge issuance & verification contract | **OPEN (External)** | Backend owner must eventually provide official Deslizar endpoints/SDK to replace `temporaryChallenge.ts`. |
| **EXT-3.8-03** | Authorized NURVIA learner & staff test accounts | **OPEN (External)** | Required for live authenticated E2E testing without creating unauthorized production users. |
| **EXT-3.8-04** | Unsupported backend endpoints (`302` on `explicitbackend.com`) | **BLOCKED (Backend)** | `/api/castoline/auth/recovery/password`, `/api/castoline/nexus/dominion/subscription-packages/*`, `/api/castoline/strata/assessment/results/*`, `/api/castoline/strata/assessment/exams/upserts`, `/api/castoline/system/user/session/list/current`, `/api/castoline/system/user/list/absolute`. |
