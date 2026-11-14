# NURVIA — Phase 6 Frontend Quality & ESLint Report

**Scope:** `apps/web` TypeScript, ESLint (`npm run lint`), unit tests (`npm test`), and Next.js production build (`npm run build`).

---

## 1. ESLint Summary

- **Full-repo `npm run lint` (`eslint .`):** `0 errors`, `362 warnings` (down to `361` after removing the unused `browser` parameter in `tests/e2e/learner-journey.spec.ts`).
- **Files authored/modified in this pass:**
  - `apps/web/components/layout/superadmin-switcher.tsx`: **0 errors, 0 warnings**
  - `apps/web/tests/e2e/learner-journey.spec.ts`: **0 errors, 0 warnings** (removed unused `browser` fixture)
  - `apps/web/tests/e2e/rbac-security.spec.ts`: **0 errors, 0 warnings**
  - `apps/web/tests/e2e/superadmin-navigation.spec.ts`: **0 errors, 0 warnings**
  - `apps/web/tests/e2e/lectures-and-admin.spec.ts`: **0 errors, 0 warnings**
  - `apps/web/components/layout/admin-shell.tsx`: **0 errors, 4 pre-existing warnings** (`X`, `Search`, `Bell` unused imports; `staffRoles` `react-hooks/exhaustive-deps` at line 131 — unrelated to `<SuperadminSwitcher />` wiring)
  - `apps/web/components/layout/learner-shell.tsx`: **0 errors, 7 pre-existing warnings** (`Badge`, `Bell`, `Flame`, `ExternalLink`, `Sparkles`, `ShieldAlert` unused imports; `user` `react-hooks/exhaustive-deps` at line 213 — unrelated to `<SuperadminSwitcher />` wiring)

## 2. Legacy Warning Triage (Non-Blocking for Staging)

All 361 remaining warnings across `apps/web` are pre-existing legacy warnings concentrated in:
1. `@typescript-eslint/no-unused-vars` — unused `lucide-react` / `Card*` imports on placeholder/admin pages.
2. `@typescript-eslint/no-explicit-any` — typed API response/payload shims in `lib/api-client.ts` and legacy admin builders.
3. `@next/next/no-img-element` — `UserAvatar.tsx` using `<img>` for dynamic user avatar URLs.
4. `react-hooks/exhaustive-deps` — pre-existing hook dependency arrays in `admin-shell.tsx` and `learner-shell.tsx`.

No ESLint errors exist anywhere in `apps/web`.
