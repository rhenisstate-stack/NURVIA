# NURVIA Phase 2 — External Dependency Register

| ID | Dependency | Responsible Party | Required Action | Why Needed | Evidence Required | Status | Blocked Gate(s) |
|---|---|---|---|---|---|---|---|
| EXT-01 | Dedicated NURVIA `SKEW_LINE_APP_KEY` | LexmaCasto Backend Owner | Provision a dedicated application key for NURVIA (`SKEW_LINE_APP_KEY`) in server-side env | Required for `x-site-key` header acceptance on `https://explicitbackend.com` | Non-400 response from `explicitbackend.com` using NURVIA key | **OPEN** | G11, G18 |
| EXT-02 | Confirmed NURVIA `SKEW_LINE_APP_DOMAIN` | LexmaCasto Backend Owner | Confirm registration of `https://nurvia-black.vercel.app` (and any preview domain) | Required for `x-site-domain` header validation | Backend-owner confirmation + live header acceptance | **OPEN** | G11, G18 |
| EXT-03 | Authorized NURVIA Test Account | LexmaCasto Backend Owner / QA | Provide a non-production NURVIA test account (email + password/PIN) | Required to verify live login, `castoLine`/`castoBadge` issuance, current-user, and logout revocation | Sanitized HTTP 200 login, `/api/auth/me`, and `/api/auth/logout` evidence | **OPEN** | G18 |
| EXT-04 | Approved Registration Test Identity | LexmaCasto Backend Owner / QA | Approve a controlled test identity for live `POST /api/castoline/auth/register` verification | Required to verify live registration without creating unauthorized accounts | Sanitized registration response & role check | **OPEN** | G18 |
| EXT-05 | Authenticated Academic Strata Access | LexmaCasto Backend Owner | Verify live `strata` responses (and confirm whether `academicYear`/`season` fields exist on records) | Required to verify live `exams/list/live` and parent-child IDs | Sanitized live strata JSON sample | **OPEN** | G18 |
