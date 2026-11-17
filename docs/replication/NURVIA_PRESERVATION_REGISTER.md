# NURVIA Preservation Register

This register lists all NURVIA-specific features, routes, security controls, and assets that MUST be preserved during Qlex replication.

| Item | Location(s) | Preservation Rule |
|---|---|---|
| NURVIA Homepage | `apps/web/app/page.tsx`, `apps/web/lib/hero-media.ts`, `apps/web/public/hero-image.jpeg` | Preserve NURVIA's existing homepage design and `/` route; do not overwrite with `Qlex/src/app/(web)/page.tsx`. |
| NURVIA Navbar & Header | `apps/web/components/layout/public-shell.tsx`, `apps/web/components/layout/user-account-menu.tsx`, `apps/web/components/brand/logo.tsx` | Preserve NURVIA's navbar presentation and branding; integrate missing Qlex navigation/auth/role behaviors into it. |
| Mark K Resources / Lecture Notes | `apps/web/app/mark-k/**`, `apps/web/app/api/lectures/**`, `apps/web/lib/lectures/nurvia-lectures-data.ts`, `apps/web/app/admin/lectures/page.tsx` | Preserve NURVIA-local lecture implementation, provenance, authorship, and access controls. |
| Nursing Care Plans | `apps/web/app/care-plans/**`, `apps/web/app/learner/care-plans/page.tsx`, `apps/web/app/admin/plans/page.tsx`, `apps/web/lib/content/care-plans-*` | Preserve NURVIA-local care-plan implementation, clinical review lifecycle, and publishing controls. |
| NURVIA Auth, Security & Cookies | `apps/web/middleware.ts`, `apps/web/lib/lexmacasto/*`, `apps/web/app/api/auth/*`, `apps/web/app/api/media/[...path]/route.ts` | Preserve `WEBSITE_11`, server-only `SKEW_LINE_APP_KEY`, `nurvia_casto_line`, `nurvia_casto_badge`, `nurvia_casto_dashboard`, HttpOnly/SameSite/Secure cookies, CSRF/origin checks, and strict proxy allowlists. |
| NURVIA Learner & Admin Modules | `apps/web/app/learner/**`, `apps/web/app/admin/**`, `apps/web/components/layout/*` | Preserve existing NURVIA learner/admin pages and RBAC controls; integrate with replicated Qlex modules without deleting working features. |
| NURVIA Branding Assets | `apps/web/public/brand/*`, `apps/web/public/hero-image.jpeg` | Never overwrite NURVIA logos, favicon, or hero graphics with Qlex branding. |
| NURVIA .NET Backend (`apps/api`) | `apps/api/**` | Preserve existing .NET solution and tests; do not modify shared LexmaCasto production infrastructure. |
