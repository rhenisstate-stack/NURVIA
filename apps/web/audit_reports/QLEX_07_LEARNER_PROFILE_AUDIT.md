# QLEX_07 — LEARNER PROFILE AUDIT

## 1. Profile Retrieval & Display
- **Pages:** `src/app/dashboards/*/auth/account/show/page.tsx` and `src/app/(web)/pages/profile/account/page.tsx`.
- **Source:** `useCurrentSystemUser()` (`src/lib/hooks/users/account/current/useCurrentSystemUser.tsx`) -> `GET /api/users/user?fetchtype=current` -> `GET {backend}/api/castoline/system/user/list/current`.
- **Response Normalization:** `convertBackendKeysToCamel(result)` converts .NET PascalCase keys to camelCase `SystemUser` (`userName`, `email`, `emailConfirmed`, `phoneNumber`, `phoneNumberConfirmed`, `profile`, `accesses`, `roles`, `grants`, `emails`, `phones`, `categories`, `backupCodes`, `badges`).
- **Unauthenticated Behaviour:** Verified live: returns HTTP 401; `show/page.tsx` displays `"You need to be signed in to view this profile."` with a link to `/dashboards/nclex-rn/auth/login`.

## 2. Profile Updates & Persistence
- **Edit Page:** `src/app/dashboards/*/auth/account/edit/page.tsx` (and `src/app/(web)/pages/profile/edit/page.tsx`).
- **Editable Fields:** `gender`, `ethnicity`, `race`, `religion`, `language`, `dateOfBirth`, `bio`, `website`, `about`.
- **Service:** `updateCurrentUserProfile()` (`src/lib/services/auth/supportService.ts`) -> `/api/auth/support/account` -> hosted backend.
- **Data Exposure Note (`P2`):** `SystemUser.profile.credential` interface (`useCurrentSystemUser.tsx` line 46-52) models `passwordHash: string` in the client TypeScript interface. Verify the backend DTO omits `passwordHash` in production responses.
- **Live Persistence Status:** `UNVERIFIED` (blocked by unauthenticated state in live test).
