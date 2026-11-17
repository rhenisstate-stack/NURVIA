# NURVIA Phase 3.8 — Qlex API Inventory

**Reference Source:** `C:\Users\gitau\Documents\Qlex\src\app\api` (**59 route files**)  
**Shared Utilities Inspected:** `src/lib/api/api/api.ts`, `src/lib/config/siteHeaders.ts`, `src/lib/config/config.ts`, `src/middleware.ts`, `src/lib/utils/sessions/generateSystemUserSessionCookies.ts`, `src/lib/services/partial/helper/systemSessionHeaders.ts`.

---

## Route Groups (59 Files Total)

- **Authentication & Account (`src/app/api/auth/**`, 22 files):**
  - `auth/login/route.ts`, `auth/register/route.ts`, `auth/logout/route.ts`, `auth/session/route.ts`, `auth/account/destroy/route.ts`, `auth/validate/route.tsx`, `auth/recovery/{password,social}/route.ts`, `auth/social/{apple,facebook,github,google,linkedin,microsoft,onetap}/route.ts` (7 files), `auth/support/{2fa,account,email,message,password,phone,social}/route.ts` (7 files).
- **Media (`src/app/api/media/[...path]/route.ts`, 1 file):** Catch-all media proxy.
- **Seek (`src/app/api/seek/route.ts`, 1 file):** Search (`absolute`, `distinct`, `suggest`, `history`).
- **System (`src/app/api/system/**`, 4 files):** `backends/route.ts`, `license/route.ts`, `privilege/route.ts`, `role/route.ts`.
- **Users (`src/app/api/users/**`, 5 files):** `user/route.ts`, `seed/route.ts`, `controls/session/route.ts`, `controls/registration/{control,option}/route.ts`.
- **Nexus Dominion & Strata (`src/app/api/nexus/**`, 26 files):**
  - Dominion subscriptions: `subscription/{item,package}/route.ts` (2 files).
  - Assessment: `assessment`, `exam`, `exam/diy`, `exam/upserts`, `question`, `result`, `section` (7 files).
  - Content: `cognition`, `document` (2 files).
  - Institution: `cohort`, `department`, `division`, `institution`, `school`, `strataclass` (6 files).
  - Learning: `concept`, `course`, `fact`, `lesson`, `program`, `subject`, `topic`, `unit` (8 files).
  - Main: `category`, `domain`, `subcategory` (3 files).

Full per-file contract details are also preserved in `NURVIA_PHASE_3_7_QLEX_API_INVENTORY.md` and `NURVIA_PHASE_3_8_API_MIGRATION_MATRIX.md`.
