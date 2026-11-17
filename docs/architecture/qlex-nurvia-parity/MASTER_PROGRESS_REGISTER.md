# 15. MASTER PROGRESS REGISTER

| Workstream | Total Qlex Files | Mapped | Excluded | Blocked (Backend Dep) | Status |
|---|---:|---:|---:|---:|---|
| API - Auth | 7 | 7 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| API - Auth Support | 7 | 7 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| API - Content Strata | 2 | 0 | 0 | 2 | BLOCKED |
| API - DIY Exam | 1 | 1 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| API - Exam Engine | 1 | 1 | 0 | 0 | VERIFIED (Phase E: /api/exams/upserts with CSRF, HttpOnly session, actionGroup allowlist) |
| API - Media | 1 | 1 | 0 | 0 | VERIFIED (Phase F: /api/media/[...path] with prefix allowlist, traversal guard, and nosniff) |
| API - Seek | 1 | 1 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| API - Social Auth | 8 | 0 | 0 | 8 | BLOCKED |
| API - Strata | 22 | 22 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| API - Subscriptions | 2 | 2 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| API - System & Users | 9 | 0 | 0 | 9 | BLOCKED |
| App Root | 3 | 3 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| Dashboard Shared | 4 | 4 | 0 | 0 | VERIFIED (Phase D: DistinctSubjects, ActiveSubscriptionPackage, diyExamCreation built & verified) |
| Exam Question Types | 21 | 21 | 0 | 0 | VERIFIED (Phase E: 20 renderers in QuestionRendererRegistry incl. AudioBased, VideoBased, HighlightText) |
| Lib - API Client | 2 | 2 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| Lib - Config | 3 | 3 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| Lib - Contexts | 9 | 9 | 0 | 0 | VERIFIED (Phase A + Phase E: all 9 layout, theme, font, and live-exam contexts built & verified) |
| Lib - Hooks | 115 | 115 | 0 | 0 | VERIFIED (Phase D: consolidated into useStrataResource + useSubscriptionPackages) |
| Lib - Security/Session | 1 | 1 | 0 | 0 | VERIFIED (Preserved HttpOnly session.ts) |
| Lib - Services | 15 | 15 | 0 | 0 | VERIFIED (Phase D: strataService, dominionService via BFF; examService deferred to Phase E) |
| Lib - Session Utils | 2 | 2 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| Lib - Shared | 11 | 11 | 0 | 0 | IN_PROGRESS (Phase A: constants/strata & vista quotes VERIFIED; utils/types in Phase B/D) |
| Live Exam (ati-teas) | 121 | 121 | 0 | 0 | VERIFIED (Phase E: consolidated into web/(livexams)/[program]/vista/exam/[theme]/) |
| Live Exam (hesi-a2) | 121 | 121 | 0 | 0 | VERIFIED (Phase E: consolidated into web/(livexams)/[program]/vista/exam/[theme]/) |
| Live Exam (lpn-nursing) | 121 | 121 | 0 | 0 | VERIFIED (Phase E: consolidated into web/(livexams)/[program]/vista/exam/[theme]/) |
| Live Exam (nclex-pn) | 121 | 121 | 0 | 0 | VERIFIED (Phase E: consolidated into web/(livexams)/[program]/vista/exam/[theme]/) |
| Live Exam (nclex-rn) | 121 | 121 | 0 | 0 | VERIFIED (Phase E: consolidated into web/(livexams)/[program]/vista/exam/[theme]/) |
| Live Exam (rn-nursing) | 121 | 121 | 0 | 0 | VERIFIED (Phase E: consolidated into web/(livexams)/[program]/vista/exam/[theme]/) |
| Live Exam Partials | 6 | 6 | 0 | 0 | VERIFIED (Phase E: QuestionToolbar, QuestionActionNavigator, ImageViewer, QuestionTypesDispatcher) |
| Live Exam Shell | 1 | 1 | 0 | 0 | VERIFIED (Phase E: web/(livexams)/layout.tsx) |
| Middleware | 1 | 1 | 0 | 0 | VERIFIED (Phase A: apps/web/middleware.ts built & verified) |
| Program Dashboard (ati-teas) | 90 | 90 | 0 | 0 | VERIFIED (Phase D: consolidated into dashboards/[program]/) |
| Program Dashboard (hesi-a2) | 90 | 90 | 0 | 0 | VERIFIED (Phase D: consolidated into dashboards/[program]/) |
| Program Dashboard (lpn-nursing) | 90 | 90 | 0 | 0 | VERIFIED (Phase D: consolidated into dashboards/[program]/) |
| Program Dashboard (nclex-pn) | 90 | 90 | 0 | 0 | VERIFIED (Phase D: consolidated into dashboards/[program]/) |
| Program Dashboard (nclex-rn) | 90 | 90 | 0 | 0 | VERIFIED (Phase D: consolidated into dashboards/[program]/) |
| Program Dashboard (rn-nursing) | 90 | 90 | 0 | 0 | VERIFIED (Phase D: consolidated into dashboards/[program]/) |
| Public Auth Pages | 19 | 19 | 0 | 0 | VERIFIED (Phase C: /auth/{login,register,recovery/password,logout} parity aliases built & verified) |
| Public Info Pages | 13 | 13 | 0 | 0 | VERIFIED (Phase C: /pages/{about-us,contact-us,faqs,terms-of-service,privacy-policy,seek,subscription/package} built & verified) |
| Public Program Pages | 12 | 12 | 0 | 0 | VERIFIED (Phase C: /pages/exams/[program] SSG for all 6 nursing programs built & verified) |
| Public Web | 27 | 27 | 0 | 0 | VERIFIED (Phase C: PublicShell & existing NURVIA public pages preserved) |
| Root Config | 7 | 7 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| Root Config / Generated | 4 | 0 | 4 | 0 | EXCLUDED |
| Shared Components | 14 | 14 | 0 | 0 | VERIFIED (Phase B: 13 NURVIA-adapted shared components & editor adapters built & verified) |
| Src Assets | 59 | 0 | 59 | 0 | EXCLUDED |
| Static Public Assets | 44 | 44 | 0 | 0 | READY_FOR_IMPLEMENTATION |
| Styles | 6 | 6 | 0 | 0 | VERIFIED (Phase A: 6 NURVIA modular CSS files created in apps/web/styles/) |
| Tooling / Audit Docs | 28 | 0 | 28 | 0 | EXCLUDED |
| Web Nexus Overview | 3 | 3 | 0 | 0 | VERIFIED (Phase C: /web/programs/absolute/overview & /web/assessments/absolute/overview built & verified) |

**Grand Total Qlex Files Tracked:** 1757
