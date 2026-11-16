# NURVIA Phase 3.4 — First Account Acceptance Report

**Date:** 2026-11-16  
**Production URL:** `https://nurvia-black.vercel.app`  
**Backend Origin:** `https://explicitbackend.com`

---

## Acceptance Workflow Status

| Step | Workflow Step | Status | Evidence / Blocker |
|---|---|---|---|
| 1–6 | Production registration & account creation | **BLOCKED (External)** | Blocked by `EXT-3.4-01` (LexmaCasto Deslizar `Challenge` specification/provisioning for NURVIA) and `EXT-3.4-02` (authorized NURVIA test identity). |
| 7 | Registration session behavior | **Verified in code & mock integration** | `/api/auth/register` sets `HttpOnly` session cookies only if LexmaCasto returns valid `castoLine`/`castoBadge` + user; otherwise `sign-up/page.tsx` directs user to `/sign-in`. |
| 8–12 | Login, `/api/auth/me`, reload persistence, `/learner` access | **BLOCKED (External)** | Blocked by `EXT-3.4-02` (no provisioned NURVIA Learner test credentials). Verified locally against mock backend (`auth-handlers-integration.test.mjs`) and unauthenticated production `/api/auth/me` (`401`). |
| 13–15 | Logout, backend revocation, post-logout denial | **BLOCKED (External)** | Blocked by `EXT-3.4-02`; verified locally against mock backend (`auth-handlers-integration.test.mjs` test 8). |

- **Result:** First production account creation and live authenticated session acceptance remain **BLOCKED by external dependencies `EXT-3.4-01` and `EXT-3.4-02`**. No fabricated challenge or synthetic account claim is made.
