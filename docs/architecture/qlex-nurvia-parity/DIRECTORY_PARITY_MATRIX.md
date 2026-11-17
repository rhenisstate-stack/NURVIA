# 3. DIRECTORY PARITY MATRIX

| Qlex Directory | Purpose | NURVIA Counterpart | Disposition | Notes |
|---|---|---|---|---|
| `src/app/(web)` | Public marketing, auth, and informational pages | `apps/web/app/(web) (missing group; currently flat under apps/web/app/)` | **RELOCATE / ADAPT** | Organize public pages into (web) route group while preserving existing routes/redirects |
| `src/app/api` | Next.js BFF API route handlers (61 routes) | `apps/web/app/api (19 routes)` | **ADAPT / CREATE** | Keep parameterized consolidation (/api/strata/[resource], /api/auth/support/[resource]); add /api/exams/upserts and /api/media/[...path] |
| `src/app/dashboards` | Program dashboards (6 programs x 90 files + shared) | `apps/web/app/learner (flat learner dashboard)` | **CREATE / CONSOLIDATE** | Create dynamic apps/web/app/dashboards/[program]/... + shared/ replacing 6x90 duplication |
| `src/app/web/(livexams)` | Live exam engine & 8 themes (6 programs x 121 + partials) | `apps/web/app/exam-session + apps/web/components/exam` | **CREATE / CONSOLIDATE** | Create dynamic apps/web/app/web/(livexams)/[program]/... + partials/ unified with 19+ renderers |
| `src/app/web/(nexus)` | Public nexus assessment/program overviews | `None` | **CREATE** | Create apps/web/app/web/(nexus)/... |
| `src/components` | Shared UI, editors, access-gate modals, calculator | `apps/web/components (70 files) + root components/ (9 files)` | **ADAPT / RELOCATE** | Relocate root components/ into apps/web/components/ and add missing editor/SeekModal/gate components |
| `src/lib/api` | Frontend fetch wrapper | `apps/web/lib/lexmacasto/client.ts + lib/api-client.ts` | **ADAPT** | Keep NURVIA server-side BFF pattern; never allow direct browser-to-backend calls |
| `src/lib/config` | App config, siteHeaders, siteLinks | `apps/web/lib/api-config.mjs + lexmacasto/headers.ts` | **ADAPT** | Keep APP_KEY server-only; add siteLinks equivalent |
| `src/lib/constants` | Quotes & dynamic form enums | `None` | **CREATE** | Create apps/web/lib/constants/ |
| `src/lib/contexts` | Panel & Exam React contexts (9 files) | `apps/web/components/auth/auth-provider.tsx` | **CREATE** | Create apps/web/lib/contexts/ for panel & exam themes/sidebars/live exam state |
| `src/lib/hooks` | Data-fetching & UI hooks (115 files) | `apps/web/hooks/ (2 files) + root hooks/ (2 files)` | **CREATE / RELOCATE** | Relocate root hooks/; create parameterized strata/subscription/heed/account hooks |
| `src/lib/services` | Domain API service clients (16 files) | `apps/web/lib/lexmacasto/* + lib/content/*` | **ADAPT / CREATE** | Create typed BFF service wrappers; replace insecure systemSessionHeaders.ts |
| `src/lib/types` | Shared TypeScript types | `apps/web/lib/api-types.ts` | **ADAPT** | Consolidate & expand shared types |
| `src/lib/utils` | Formatters, search/pagination helpers, session utils | `apps/web/lib/utils/* + root lib/*` | **ADAPT / REPLACE** | Relocate root lib/; replace client cookie session utils with server HttpOnly helpers |
| `src/styles` | Modular CSS for editors, forms, sidebars, web | `apps/web/app/globals.css` | **CREATE** | Create apps/web/styles/ |
| `src/assets` | Template SVGs/images (59 files) | `apps/web/public/brand/` | **EXCLUDE** | Replace with NURVIA clinical/nursing brand assets |
| `public` | Static public assets | `apps/web/public/` | **ADAPT** | Maintain NURVIA brand assets |
| `audit_reports & .skewblanc` | Qlex internal audit reports & CLI | `docs/ & root reports` | **EXCLUDE** | Reference only |
