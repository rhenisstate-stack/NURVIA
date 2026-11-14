# NURVIA — Phase 5 Playwright E2E Verification Report

**Environment:**
- Frontend: Next.js 15.5.29 production server (`next start -p 3001`, `http://localhost:3001`)
- Backend: `Nurvia.Api` (`http://localhost:5055`) connected to isolated PostgreSQL `nurvia_test` with `Lectures__PublishSeededCatalogue=true` and `BootstrapAdmin` (`owner.e2e@nurvia.test`)
- Runner: `@playwright/test` `1.65.0`, Chromium (`--trace=off`)

---

## 1. Execution Summary

| Spec File | Passed | Failed | Skipped | Notes |
|---|---:|---:|---:|---|
| `apps/web/tests/e2e/learner-journey.spec.ts` | 11 | 0 | 0 | Steps 1–11 end-to-end learner journey |
| `apps/web/tests/e2e/rbac-security.spec.ts` | 7 | 0 | 0 | Auth, CSRF, RBAC, ownership, answer-key redaction |
| `apps/web/tests/e2e/superadmin-navigation.spec.ts` | 7 | 0 | 0 | Superadmin role assignment & dashboard switching |
| `apps/web/tests/e2e/lectures-and-admin.spec.ts` | 2 | 0 | 0 | Mark K. catalogue, protected reader gate, staff RBAC |
| **Total** | **27** | **0** | **0** | **All 4 specs verified passing** |

*(Note: `apps/web/tests/e2e/study-library-three-modes.spec.ts` belongs to the pre-existing parallel StudyLibrary feature and was preserved untouched.)*

---

## 2. Remediations Applied & Verified

1. **`SuperadminSwitcher` UI wiring (`apps/web/components/layout/admin-shell.tsx`, `learner-shell.tsx`, `superadmin-switcher.tsx`):**
   - Mounted `<SuperadminSwitcher />` in both `AdminShell` and `LearnerShell` headers so Superadmins can switch seamlessly between `/admin` and `/learner`.
   - Refactored `SuperadminSwitcher` to render styled `<Link>` elements directly (avoiding nested `<Link><Button>` markup) so accessible `getByRole('link', { name: 'Learner Dashboard' })` / `'Admin Console'` queries resolve cleanly.
2. **`learner-journey.spec.ts` alignment with current UI routes & flows:**
   - Updated hero heading matcher (`/Turn Practice Into ATI\s*and HESI Readiness/`), `hero-background-fallback` attachment check, Step 1c `networkidle` wait, and Windows screenshot lock handling.
   - Scoped `StudySetCard` card locator, handled the `Choose your navigation layout` modal (`Sequential`) in exam sessions, updated Step 10 profile persistence to target `/learner/profile` (`#firstName`, `#lastName`, `#displayName`, `Save Changes`), and opened `Open account menu` before clicking `Sign Out` in Step 11.
3. **`rbac-security.spec.ts` fixes:**
   - Verified `o.isCorrect` is falsy during active exam mode and supplied required `firstName`/`lastName`/`displayName` fields in `PUT /api/auth/profile`.
4. **`lectures-and-admin.spec.ts` added:**
   - Verified public `/mark-k` catalogue rendering (12+ lectures), Lecture 1 public reader + disclaimer + Prev/Next navigation, unauthenticated `401` + `bodyMarkdown` omission on Lecture 4 API, browser sign-in gate on Lecture 4, authenticated Learner unlock of Lecture 4, Learner `403` / `/access-denied` on `/admin/lectures`, and role-gated Author/Reviewer/Publisher UI controls and API guardrails.
