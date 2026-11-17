# NURVIA — Phase 3.12 Engineering Report

## A. Qlex Forensic Report (`C:\Users\gitau\Documents\Qlex`, Read-Only)

### Architecture & Configuration
- **Framework**: Next.js `^15.5.19` App Router, React `^18.3.1`, TypeScript `^5`, Tailwind CSS `^4`.
- **BFF Proxy Pattern**: `src/app/api/*` (59 route handlers) proxies to `SKEW_LINE_DOTNET_BASE_URL` (`/api/castoline/...`), attaching `getSiteHeaders()` (`x-site-key`, `x-site-domain`, `x-site-name`, telemetry) and Casto auth headers (`x-casto-line`, `x-casto-badge`).
- **Middleware (`src/middleware.ts`)**: Enriches telemetry headers and sets `x-site-session`; performs **no** server-side RBAC or auth redirects.
- **Session Storage**: Client-side cookies (`skew_blanc_session_badge`, `skew_blanc_session_line`, `skew_blanc_session_fingerprint`, `skew_blanc_session_address`).

### Route & Module Inventory (496 route/layout/API files)
- **Public `(web)`**: `/`, `/explore`, 13 static info/legal pages (`/pages/(more)/*`), `/pages/actions`, `/pages/contact-us`, `/pages/create`, `/pages/entrance`, `/pages/notes`, `/pages/resources`, `/pages/seek`, `/pages/shop`, `/pages/subscription/package`, `/pages/heed/{current,relative}`, `/pages/exams/{ati-teas,hesi-a2,lpn-nursing,nclex-pn,nclex-rn,rn-nursing}`.
- **Auth `(web)/auth/*`**: `/auth`, `/auth/{login,register,logout,onetap,social/complete,recovery/password,recovery/social,support,update/2fa,update/password,validate,validate/[reason]/[userGuid]/[token]}`.
- **Program Dashboards (`src/app/dashboards/<program>/*`)**: 6 identical panels (`ati-teas`, `hesi-a2`, `lpn-nursing`, `nclex-pn`, `nclex-rn`, `rn-nursing`), 46 files each:
  - Dashboard home, `auth/account/{show,edit,recovery/*,security/{2fa,password,profile},support,verify/{email,phone}}`
  - `vista/learning/{programs,courses,subjects}/{absolute,distinct}/{outline,overview}`
  - `vista/assessment/{assessments,exams}/{absolute,distinct}/{outline,overview}`, `exams/{progress/absolute,reports/{absolute,relative,distinct},results/distinct}`
  - `vista/subscriptions/{packages,items}`
- **Live Exam Engine (`src/app/web/(livexams)/<program>/vista/exam/<theme>`)**: 6 programs × 8 themes (`atlas`, `cascade`, `classic`, `generic`, `glacial`, `orbit`, `pulse`, `zen`), backed by `/api/castoline/strata/assessment/exams/{upsert,upsert/diy}/{user/answers,actions,question/actions,lifecycle,preferences}`.
- **Not Implemented in Qlex**: Flashcards / Spaced Repetition, Study Planner, Community / Discussions, Mark K. Lectures, Nursing Care Plans, Dedicated Admin UI (`/dashboards/admin` does not exist; only BFF CRUD routes under `/api/system/*`, `/api/users/*`, `/api/nexus/strata/*`).

---

## B. NURVIA Forensic Report (`C:\Users\gitau\Documents\NURVIA`)

### Frontend (`apps/web`)
- **App Router**: Public pages (`/`, `/exams`, `/exams/[id]`, `/exam-session`, `/study`, `/care-plans`, `/care-plans/[slug]`, `/mark-k`, `/mark-k/[slug]`, `/community`, `/nclex`, `/teas`, `/faq`, `/privacy`, `/terms`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/accept-invitation`, `/access-denied`, `/redirect`), 24 Learner routes (`/learner/*`), 16 Admin routes (`/admin/*`), and Next.js API Route Handlers (`/api/*`).
- **Security Architecture Preserved**: HttpOnly session cookies (`nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`), same-origin CSRF validation (`validateSameOriginRequest`), strict `/api/backend/[...path]` allowlist (`proxy-allowlist.ts`), `WEBSITE_11` identity kept server-side (`SKEW_LINE_APP_KEY`).
- **Gaps Identified & Remediated in Phase 3.12**:
  1. **Study Guides** (`app/learner/guides/page.tsx`, `lib/content/study-guides-data.ts`): Previously served 18 local study guides as a local-first fallback when `501 NOT_PROVISIONED` was returned. **Remediated**: Archived 18 guides to `study-guides-archive.ts` and converted Study Guides to strictly server-driven.
  2. **Mocked Learner Pages**: `app/learner/account/page.tsx` (`"January 2024"`, `"Account settings would be updated here"`), `app/learner/settings/page.tsx` (`setTimeout(500)`), and `app/learner/settings/security/page.tsx` (`setTimeout(500)`) were mocked placeholders. **Remediated**: Wired to LexmaCasto `/api/castoline/strata/support/{account,2fa}` and `/api/castoline/auth/logout/sessions/relative`.
  3. **Password Recovery Routing**: `nurviaApi.forgotPassword` targeted `/api/backend/auth/forgot-password` instead of LexmaCasto's verified `/api/castoline/auth/recovery/password`. **Remediated**: Added `/api/auth/recovery/password/route.ts`.
  4. **Missing Notifications / Support Inbox & DIY Practice Wiring**: Added `/learner/notifications` backed by `/api/auth/support/message`, wired `/learner/custom-practice` to `nurviaApi.createDiyExam` (`/api/exams/diy`), and added `/api/subscriptions/[resource]` for LexmaCasto `nexus/subscription/{packages,items}`.
  5. **Admin Shell Fake Badges**: Removed hardcoded `"12,450"` and `"84"` counts from `components/layout/admin-shell.tsx`.

### Backend (`apps/api`)
- `.NET 10.0` solution (`Nurvia.slnx`) with 18 controllers, EF Core PostgreSQL, `LectureSeeder.cs` (12 original NURVIA-authored lectures; 1–3 `Public`, 4–12 `AuthenticatedLearner`), `ProductModulesSeeder.cs`, and 247 xUnit tests (225 in-memory unit tests pass without PostgreSQL; 22 PostgreSQL integration tests require `DOTNET_ENVIRONMENT=Test` + `TEST_CONNECTION_STRING`).

---

## C. Feature Parity Matrix

| Module | Qlex Functionality | NURVIA Implementation | Backend Contract | Status |
|---|---|---|---|---|
| **Auth & Session** | Login, Register, Logout (`distinct`/`relative`), Destroy, Validate, Recovery | HttpOnly session cookies, `/api/auth/*`, `/api/auth/recovery/password` | `/api/castoline/auth/*`, `/api/castoline/strata/support/validate` | **COMPLETE** (with temporary Deslizar challenge compatibility) |
| **Account, Profile, Security & 2FA** | Support `account`, `2fa`, `email`, `phone`, `password` | `/learner/account`, `/learner/profile`, `/learner/settings`, `/learner/settings/security`, `/api/auth/support/[resource]` | `/api/castoline/strata/support/{account,2fa,email,phone,password}` | **COMPLETE** (avatar multipart upload on LexmaCasto remains unverified) |
| **Notifications / Support Inbox** | Heed bell & inbox (`/pages/heed/*`) | `/learner/notifications`, `/api/auth/support/message` | `/api/castoline/strata/support/message` | **COMPLETE** |
| **Global Search (Seek)** | `/pages/seek`, `SeekModal` | `/api/seek` + `nurviaApi.seek*` | `/api/castoline/strata/seek/*` | **PARTIALLY IMPLEMENTED** (API wired; dedicated global modal optional) |
| **Exams, Attempts & DIY Practice** | Strata exams, DIY store, live upserts, results | `/exams`, `/learner/exams`, `/learner/library`, `/learner/custom-practice` (`createDiyExam`), `/exam-session`, `/learner/history` | `/api/castoline/strata/assessment/*` | **PARTIALLY IMPLEMENTED** (`WEBSITE_11` has 0 published exams provisioned on LexmaCasto; live attempt `/api/backend/attempts/*` vs `/castoline/strata/assessment/exams/upsert/*`) |
| **Study Guides** | Modeled via Strata `learning/*` & `document` | Server-driven `/learner/guides` + archived 18 guides in `study-guides-archive.ts` | Not provisioned as dedicated Study Guides (`501 NOT_PROVISIONED`) | **NOT SUPPORTED BY BACKEND** |
| **Mark K. / Lecture Notes** | Not in Qlex | Local-first exception: 12 NURVIA-authored lectures (`1–3` Public, `4–12` Auth) + provenance register | Local server-only catalogue (`nurvia-lectures-data.ts`) | **COMPLETE** (local-content exception) |
| **Nursing Care Plans** | Not in Qlex | Local-first exception: 16 Care Plans + 4 Writing Guides + lifecycle & clinical review gating | Local clinical library (`care-plans-data.ts`) | **COMPLETE** (local-content exception) |
| **Flashcards & Spaced Repetition** | Not in Qlex | Explicit `501 NOT_PROVISIONED` | Not provisioned on LexmaCasto | **NOT SUPPORTED BY BACKEND** |
| **Study Planner** | Not in Qlex | Explicit `501 NOT_PROVISIONED` | Not provisioned on LexmaCasto | **NOT SUPPORTED BY BACKEND** |
| **Saved Questions** | QuestionActions bookmark/flag/star | Explicit `501 NOT_PROVISIONED` | `/api/castoline/strata/assessment/exams/upsert/question/actions` | **PARTIALLY IMPLEMENTED** |
| **Community** | Static page only | Explicit `501 NOT_PROVISIONED` | Not provisioned on LexmaCasto | **NOT SUPPORTED BY BACKEND** |
| **Subscriptions & Entitlements** | `dominion/subscription/{items,packages}` | `/api/subscriptions/[resource]` added; `/learner/subscription` fail-closed (`501 NOT_PROVISIONED` for checkout) | `/api/castoline/nexus/subscription/{items,packages}` | **PARTIALLY IMPLEMENTED** (fail-closed payment safety preserved) |
| **Admin & Staff Workflows** | No UI panels; BFF CRUD only | 16 `/admin/*` pages, `AdminShell`, `SuperadminSwitcher` | `/api/strata/[resource]`, `/api/backend/admin/*` | **PARTIALLY IMPLEMENTED** (depends on LexmaCasto provisioning `/api/admin/*`) |

---

## D. Data-Source Compliance Report
- **Mark K. Resources**: Local-content exception preserved (`nurvia-lectures-data.ts`), with explicit `NURVIA-authored` ownership, `verified-original` rights status, non-affiliation attribution, and `1–3` Public / `4–12` AuthenticatedLearner gating.
- **Nursing Care Plans**: Local-content exception preserved (`care-plans-data.ts`), 16 care plans + 4 writing guides, controlled lifecycle (`Draft`, `Review`, `Approved`, `Published`, `Updated`, `Archived`, `Withdrawn`) and `clinicalReviewStatus === 'reviewed'` gating.
- **Study Guides**: Strictly server-driven. 18 Phase 3.11 guides safely archived in `lib/content/study-guides-archive.ts`. `loadStudyGuidesCatalogue()` returns `501 NOT_PROVISIONED` with zero local fallback.
- **All Other Modules**: Server-driven via LexmaCasto or honest `501 NOT_PROVISIONED` (no `localStorage` persistence or mock fallbacks).

---

## E. Backend Dependency Report (`WEBSITE_11` on LexmaCasto)
1. **Published Exams for `WEBSITE_11` (Phase K)**: `GET /api/castoline/strata/assessment/exams/list/absolute` currently returns `0` eligible records for `WEBSITE_11` (records are targeted to `WEBSITE_1`–`WEBSITE_9`). Backend owner must include `"WEBSITE_11"` in target arrays for eligible RN/PN exams.
2. **Study Guides**: Needs dedicated server endpoint (e.g., `GET /api/study-guides` or LexmaCasto Strata `study-guides` resource) before Study Guides can be populated.
3. **Flashcards, Study Planner, Community, AI Tutor**: Not provisioned in LexmaCasto or Qlex (`501 NOT_PROVISIONED` retained).
4. **Multipart Avatar Upload**: `POST /api/backend/avatar` rejects `multipart/form-data` with `415` until LexmaCasto multipart avatar contract is verified.

---

## F. Implementation Report (NURVIA `apps/web`)
- **Added**:
  - `apps/web/lib/content/study-guides-archive.ts`
  - `apps/web/app/api/auth/support/[resource]/route.ts`
  - `apps/web/app/api/auth/recovery/password/route.ts`
  - `apps/web/app/api/subscriptions/[resource]/route.ts`
  - `apps/web/app/learner/notifications/page.tsx`
  - `apps/web/tests/phase-3-12-parity-and-compliance.test.mjs`
- **Modified**:
  - `apps/web/lib/content/study-guides-data.ts` & `study-guides-service.ts`
  - `apps/web/app/learner/guides/page.tsx`
  - `apps/web/lib/lectures/nurvia-lectures-data.ts`
  - `apps/web/lib/content/care-plans-data.ts`
  - `apps/web/lib/lexmacasto/contracts.ts`
  - `apps/web/lib/api-url.mjs` & `apps/web/lib/api-client.ts`
  - `apps/web/app/learner/account/page.tsx`, `settings/page.tsx`, `settings/security/page.tsx`, `custom-practice/page.tsx`
  - `apps/web/components/layout/admin-shell.tsx` & `learner-shell.tsx`
  - `apps/web/tests/phase-3-11-content-and-recovery.test.mjs` & `apps/web/package.json`

---

## G. Testing Report
- **`npx tsc --noEmit`**: Passed (`0` errors).
- **`npm test`**: All **16/16** Node test suites passed (including `phase-3-12-parity-and-compliance.test.mjs` 5/5).
- **`npm run lint`**: Passed (`0` errors, 259 pre-existing warnings).
- **`npm run build`**: Passed (`next build` compiled all pages and API routes cleanly with `SKEW_LINE_DOTNET_BASE_URL=https://explicitbackend.com`).
- **`dotnet test` (`apps/api`, pre-existing baseline)**: 225/247 passed; 22 PostgreSQL integration tests failed due to unset `DOTNET_ENVIRONMENT=Test` / `TEST_CONNECTION_STRING` in this local environment.

---

## H. Release-Readiness Report
- **Conditionally Complete / Ready for Owner Review**: All code changes are local to `apps/web`, TypeScript, lint, unit tests, and production build pass. No commits, pushes, or production deployments were performed.
- **Blocked by External Backend (`LexmaCasto`)**: `WEBSITE_11` exam target provisioning, Study Guides endpoint, and unprovisioned learner modules (Flashcards, Planner, Community, AI Tutor).
