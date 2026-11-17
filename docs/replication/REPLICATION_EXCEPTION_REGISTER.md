# Replication Exception Register

| ID | Qlex Path | Exception / Conflict | Proposed Resolution |
|---|---|---|---|
| EXC-001 | `src/` root layout | Qlex uses `src/` (`@/*` -> `./src/*`); NURVIA `apps/web` has no `src/` (`@/*` -> `./*`). | Map `Qlex/src/<path>` to `NURVIA/apps/web/<path>` and preserve `@/*` import alias compatibility. |
| EXC-002 | `src/app/(web)/page.tsx` | Collides with NURVIA's preserved homepage `apps/web/app/page.tsx` at route `/`. | Preserve NURVIA's `app/page.tsx`; do not overwrite `/` with Qlex homepage. |
| EXC-003 | `src/app/(web)/includes/Navbar.tsx`, `src/app/(web)/Common/Navbar.tsx` | NURVIA's navbar design and branding must be preserved. | Integrate missing Qlex navbar behaviors into NURVIA's existing navbar/header. |
| EXC-004 | `src/app/api/auth/*`, `src/middleware.ts` | Qlex may use different cookie names, client-exposed keys, or unvalidated proxy paths. | Preserve NURVIA's `WEBSITE_11`, server-only `SKEW_LINE_APP_KEY`, `nurvia_casto_*` cookies, CSRF, and strict proxy allowlists. |
| EXC-005 | `package.json` (React 18 vs 19, Tailwind v4 vs v3) | Qlex uses React 18.3.1 & Tailwind v4; NURVIA uses React 19 & Tailwind v3.4.15. | Reconcile carefully in Batch 2 without breaking NURVIA's existing UI or tests. |
| EXC-006 | `audit_reports/*`, `.skewblanc/*` | Qlex internal audit reports and hidden `.skewblanc` metadata. | Inspect in Batch 1/2; classify whether applicable to NURVIA or excluded. |
