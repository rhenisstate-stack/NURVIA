# NURVIA Phase 3.8 — Frontend Integration Report

- **`apps/web/lib/api-url.mjs`:** Added `DEDICATED_APP_ROUTES` (`/api/seek`, `/api/exams/diy`, `/api/auth/account/destroy`, `/api/auth/validate`) so browser calls route directly to same-origin Next.js Route Handlers instead of `/api/backend/*`, while keeping `DEDICATED_AUTH_ROUTES` intact.
- **`apps/web/lib/api-client.ts`:** Added typed `nurviaApi` methods: `seek()`, `seekSuggest()`, `getSeekHistory()`, `clearSeekHistory()`, `createDiyExam()`, `destroyAccount()`, `validateSupportToken()`, `createStrataRecord()`, `updateStrataRecord()`, `deleteStrataRecord()`.
- **`apps/web/app/sign-in/page.tsx` & `apps/web/app/sign-up/page.tsx`:** Preserved Phase 3.6 UI and Phase 3.7 error-code distinction (`CHALLENGE_REQUIRED`, `CHALLENGE_REJECTED`, `CHALLENGE_EXPIRED`, `INVALID_CREDENTIALS`, `BACKEND_ERROR`).
- **UI Note:** Existing `custom-practice/page.tsx` lists published exams safely without exposing unprovisioned DIY exam UI until `EXT-01` auth is unblocked; `createDiyExam()` is ready for direct consumption.
