# 14. IMPLEMENTATION ROADMAP (DEPENDENCY-AWARE)

## Phase A — Repository Hygiene & Foundations
- Relocate root `components/`, `hooks/`, `lib/` into `apps/web/`; add `apps/web/middleware.ts`, `apps/web/styles/`, `apps/web/lib/constants/`, `apps/web/lib/contexts/`.

## Phase B — Shared Components & Design System
- Port missing Qlex shared components (`SeekModal`, `DashboardsAccessGate`, `DashboardPreloader`, `Dropdown`, `SidebarTooltip`, `CustomMiniCalculator`) using NURVIA `#142B4A`/`#0D9488` palette.

## Phase C — Public Website & Auth Route Structure
- Organize public pages under `(web)` route group, add 6 program overview pages (`/pages/exams/{nclex-rn,...}`), and preserve existing NURVIA route aliases/redirects.

## Phase D — Program Dashboards (`dashboards/[program]`) & Hooks/Services
- Implement dynamic `[program]` dashboard architecture + `dashboards/shared/` + parameterized `lib/hooks/nexus/*` & `lib/services/*` wired to `/api/strata/[resource]`.

## Phase E — Live Exam Engine (`web/(livexams)/[program]`) & 8 Themes
- Implement `/api/exams/upserts`, 8 exam themes (`atlas`..`zen`), and merge missing Qlex question renderers (`audio`, `video`, `highlight`, `hotspot`, `blankSelect`, `ordering`) into `QuestionRendererRegistry.tsx`.

## Phase F — Backend-Dependent & Social Auth Modules
- Gate Social OAuth, `/api/system/*`, `/api/users/controls/*`, Study Guides, Flashcards, Planner, AI Tutor behind honest `501 NOT_PROVISIONED` / `BACKEND DEPENDENCY` boundaries until LexmaCasto `WEBSITE_11` provisioning is confirmed.

## Phase G — Testing & Security Verification
- Run `tsc --noEmit`, `npm test`, `npm run lint`, `npm run build`, Playwright E2E, `.NET` unit tests, and structural parity checks.


## Phase A — Detailed Execution Blueprint (Pending Owner Approval)

### 1. Root-Level File Disposition (16 Orphaned Files)
Zero files in \pps/web/\ import from repository root (\components/\, \hooks/\, \lib/\); all active imports use \@/*\ resolving to \pps/web/*\ per \pps/web/tsconfig.json\.
- **11 Superseded Duplicates** (newer versions already active in \pps/web/\): \components/shared/feedback/{ApiErrorHandler,AuthErrorBoundary,index,InlineLoader,PageLoader,SectionLoader}\, \lib/{auth-utils,error-utils,navigation-utils,request-utils,retry-utils}\ -> Archive/remove root copies after diff check; do NOT overwrite \pps/web/\ files.
- **5 Unreferenced Root-Only Files**: \components/shared/feedback/{ErrorBoundary.tsx,SkeletonLoader.tsx,use-skeleton.ts}\, \hooks/{use-loading-state.ts,use-network-error.ts}\ -> Diff against \pps/web/\ equivalents (\AuthErrorBoundary\, \DashboardSkeleton\, \useLoadingState\, \useNetworkError\) and archive/remove if redundant.

### 2. Middleware Placement Verification
- \pps/web/tsconfig.json\ maps \@/*\ to \./*\ and App Router lives at \pps/web/app/\ (no \src/\ folder).
- No \middleware.ts\ exists anywhere in NURVIA.
- Therefore, the new Next.js middleware MUST be placed at \pps/web/middleware.ts\ (NOT \pps/web/src/middleware.ts\).
- It will only attach safe \x-current-*\ request headers and a non-auth \x-site-session\ request correlation cookie, preserving \
urvia_casto_line\ / \
urvia_casto_badge\ HttpOnly cookies and server-only \WEBSITE_11\ identity.

### 3. Phase A Sequence, Tests & Rollback
1. Verify clean git state on \master\.
2. Diff & remove/archive the 16 orphaned root-level code files (zero \pps/web\ import changes required).
3. Create \pps/web/middleware.ts\, \pps/web/styles/\ (modular CSS), \pps/web/lib/constants/\, \pps/web/lib/contexts/\.
4. **Tests:** \
pm run lint\, \
px tsc --noEmit\, \
pm test\, \
pm run build\ inside \pps/web/\.
5. **Rollback:** Single \git checkout -- .\ / \git clean -fd\ on Phase A files (or \git revert\ if committed), with zero impact on \pps/api/\, database migrations, or \lib/lexmacasto/\.
