# NURVIA Phase 3.8 — Blocked Functionality Register

| ID | Functionality | Qlex Source | Backend Endpoint | Blocker Reason |
|---|---|---|---|---|
| **BLK-01** | **Deslizar Challenge Issuance & Verification** | Hardcoded `skew8lancasto` strings | `POST /api/castoline/auth/register`, `/login` | Backend requires Deslizar challenge for `website 11`; Qlex has no genuine Deslizar SDK/endpoint. |
| **BLK-02** | **Password Recovery (`auth/recovery/password`)** | `auth/recovery/password/route.ts` | `/api/castoline/auth/recovery/password` | Live probe returned `302` redirect on `explicitbackend.com`. |
| **BLK-03** | **Dominion Subscriptions** | `nexus/dominion/subscription/*` | `/api/castoline/nexus/dominion/subscription-packages/list/absolute` | Live probe returned `302` redirect on `explicitbackend.com`. |
| **BLK-04** | **Assessment Results & Exam Upserts** | `nexus/strata/assessment/{result,exam/upserts}` | `/api/castoline/strata/assessment/{results/list/current,exams/upserts}` | Live probe returned `302` redirect on `explicitbackend.com`. |
| **BLK-05** | **User Session Listing & Absolute User List** | `users/controls/session`, `users/user?fetchtype=absolute` | `/api/castoline/system/user/session/list/current`, `/list/absolute` | Live probe returned `302` redirect on `explicitbackend.com`. |
| **BLK-06** | **Live E2E Authenticated Workflows** | All authenticated flows | `https://explicitbackend.com` | Dependent on `BLK-01` + authorized test accounts. |
