# 10. ADMINISTRATION & SYSTEM PARITY MATRIX

- Qlex exposes API routes for `/api/system/{backends,license,privilege,role}` and `/api/users/{controls/registration/control,controls/registration/option,controls/session,seed,user}`, plus staff strata mutations.
- NURVIA already has a full staff/admin UI under `apps/web/app/admin/*` (15 pages: analytics, audit, cases, exams, learners, lectures, plans, question-types, questions, rbac, reviews, settings, taxonomy) + `.NET 10` backend controllers (`AdminController`, `AuditLogsController`, `StaffInvitationsController`).
- **Disposition:** Preserve NURVIA's RBAC-protected `/admin/*` UI and `/api/strata/[resource]` staff role enforcement; mark Qlex `/api/system/*` and `/api/users/controls/*` as `BACKEND DEPENDENCY` pending LexmaCasto `WEBSITE_11` admin contract verification.
