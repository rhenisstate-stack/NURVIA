# NURVIA Phase 3 — External Dependency Register

| ID | Dependency | Responsible Party | Required Action | Evidence Required | Status | Blocked Gate(s) |
|---|---|---|---|---|---|---|
| P3-EXT-01 | Authorized NURVIA Test Account | LexmaCasto Backend Owner / QA | Provide a non-production NURVIA test account (`email` + `password` or `pin`) for live login, current-user, session persistence, and logout revocation testing | Sanitized HTTP 200 login, `/api/auth/me`, and `/api/auth/logout` evidence | **OPEN** | G7, G9, G10, G12, G13, G14 |
| P3-EXT-02 | Approved Registration Test Identity | LexmaCasto Backend Owner / QA | Approve a controlled test email/username if live `POST /api/castoline/auth/register` testing is required | Sanitized registration response | **OPEN** | G11 |
