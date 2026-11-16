# NURVIA — Integration Verification and Release Acceptance Report

**Project:** NURVIA (`apps/web`)  
**Target Backend:** `https://explicitbackend.com`  
**Final Acceptance Decision:** **ACCEPTED WITH EXTERNAL DEPENDENCIES**

---

## 1. Automated Test & Static Analysis Results

| Check | Command | Scope / Type | Result |
|---|---|---|---|
| TypeScript Check | `npx tsc --noEmit` | Full `apps/web` typecheck | **PASS** (0 errors) |
| ESLint | `npm run lint` | Full `apps/web` lint | **PASS** (0 errors) |
| Navigation & Carousel Suite | `node tests/navigation-and-carousel.test.mjs` | Unit / Static (9 tests) | **PASS** (9/9) |
| Learning Integration Suite | `node tests/learning-integration.test.mjs` | Unit / Static (8 tests) | **PASS** (8/8) |
| Question Renderers Suite | `node tests/question-renderers.test.mjs` | Unit / Static (7 tests) | **PASS** (7/7) |
| Hero Redesign Suite | `node tests/hero-redesign.test.mjs` | Unit / Static (6 tests) | **PASS** (6/6) |
| Remote API Config Suite | `node tests/remote-api-config.test.mjs` | Unit (8 tests) | **PASS** (8/8) |
| Clinical Calculators Suite | `node tests/calculators.test.mjs` | Unit (9 tests) | **PASS** (9/9) |
| LexmaCasto Contract & Security Suite | `node tests/lexmacasto-integration.test.mjs` | Unit / Contract / Security (9 tests) | **PASS** (9/9) |
| Production Build | `npm run build` | Next.js 15.5 production build | **PASS** (exit 0) |

## 2. Production Client Bundle Security Scan

- **Command:** Scanned `apps/web/.next/static/**/*.js` for `SKEW_LINE_APP_KEY`, `x-site-key`, `x-casto-line`, `x-casto-badge`, `explicitbackend.com`, and `108.61.9.189`.
- **Result:** `CLEAN: 0 secret/internal matches in .next/static`.

## 3. Live Backend Verification (`https://explicitbackend.com`)

| Endpoint | Method | Headers Sent | HTTP Status | Observed Response | Mode | Result |
|---|---|---|---|---|---|---|
| `/api/castoline/system/user/list/current?fetchtype=current` | `GET` | None | `400` | `{"error":"Missing site headers"}` | Live | **PASS** (TLS & header enforcement confirmed) |
| `/api/castoline/strata/main/categories/list/absolute?fetchtype=absolute` | `GET` | None | `400` | `{"error":"Missing site headers"}` | Live | **PASS** (TLS & header enforcement confirmed) |
| `/api/castoline/strata/assessment/exams/list/live?fetchtype=live` | `GET` | None | `400` | `{"error":"Missing site headers"}` | Live | **PASS** (TLS & header enforcement confirmed) |
| `/api/castoline/auth/login` | `POST` | `Content-Type: application/json` | `400` | `{"error":"Missing site headers"}` | Live | **PASS** (TLS & header enforcement confirmed) |
| Authenticated Login / Me / Logout / Strata Data | `POST` / `GET` | `x-site-key`, `x-site-domain`, `x-casto-*` | N/A | Not executed | Live | **BLOCKED — EXTERNAL DEPENDENCY** (`SKEW_LINE_APP_KEY` unprovisioned) |

## 4. Non-Negotiable Acceptance Gate Matrix

| Gate | Requirement | Status | Evidence / Notes |
|---|---|---|---|
| G0 | Scope compliance | **PASS** | Only `apps/web` and NURVIA root report files modified |
| G1 | Backend origin | **PASS** | `https://explicitbackend.com` validated; HTTP rejected in production |
| G2 | Application identity | **BLOCKED — EXTERNAL DEPENDENCY** | Fail-closed resolver implemented; `SKEW_LINE_APP_KEY` empty in `.env.local` awaiting backend owner provisioning |
| G3 | Site headers | **PASS** | `buildSiteHeaders` implemented; live `400 Missing site headers` enforcement verified |
| G4 | Login | **BLOCKED — EXTERNAL DEPENDENCY** | Route handler & DTO alignment complete; live login requires `SKEW_LINE_APP_KEY` and test account |
| G5 | Registration | **BLOCKED — EXTERNAL DEPENDENCY** | Route handler & DTO alignment complete; live registration requires `SKEW_LINE_APP_KEY` |
| G6 | Current user | **BLOCKED — EXTERNAL DEPENDENCY** | `/api/castoline/system/user/list/current?fetchtype=current` wired; live check requires `SKEW_LINE_APP_KEY` & session |
| G7 | Logout | **BLOCKED — EXTERNAL DEPENDENCY** | Distinct & relative logout endpoints wired; live revocation check requires `SKEW_LINE_APP_KEY` & session |
| G8 | Session security | **PASS** | HttpOnly, `SameSite=Lax`, production `Secure` cookies, CSRF origin guard, raw credentials stripped |
| G9 | Academic strata | **PASS** | All 22 verified endpoints, `classes` route, and mandatory `fetchtype` implemented and unit-tested |
| G10 | Academic filters | **PASS** | Hierarchical filter reset implemented; no invented `AcademicYear`/`Season` endpoints |
| G11 | RBAC | **PASS** | Public registration constrained to `Learner`; `examsLive` auth-gated |
| G12 | Error handling | **PASS** | Normalized error codes, timeouts, non-JSON/302 handling, and log/error redaction |
| G13 | Test coverage | **PASS** | 7/7 test suites, `tsc --noEmit`, and `eslint` pass |
| G14 | Regression | **PASS** | All 6 pre-existing NURVIA test suites continue to pass |
| G15 | Production build | **PASS** | `npm run build` passes cleanly |
| G16 | Secret protection | **PASS** | `.next/static` scan returned 0 secret/internal matches |
| G17 | Scope integrity | **PASS** | Zero changes to Qlex-Nursing or LexmaCasto backend |

## 5. Final Acceptance Decision

**ACCEPTED WITH EXTERNAL DEPENDENCIES**

All internally remediable implementation, security, and build gates pass. Live authenticated verification (G2, G4, G5, G6, G7) awaits provisioning of NURVIA's dedicated `SKEW_LINE_APP_KEY`, domain confirmation (`https://nurvia-black.vercel.app`), and an authorized NURVIA test account from the LexmaCasto backend owner.
