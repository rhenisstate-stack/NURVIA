# NURVIA — Security and RBAC Audit

**Audit Date:** 2026-11-15  
**Scope:** Authentication, JWT & Cookie handling, CSRF, RBAC, Privilege Escalation, IDOR/Resource Isolation, Input/Upload Validation, Transport Security.

---

## 1. Security Findings Summary

| Finding ID | Severity | Area | Finding & Evidence | Remediation |
|---|---|---|---|---|
| **SEC-001** | **P0** | Transport Security | `apps/web/.env.local` configures `SKEW_LINE_DOTNET_BASE_URL=http://108.61.9.189:8008` (plaintext HTTP). `AuthController.Login` sets `CookieOptions.Secure = Request.IsHttps`, meaning auth cookies are sent over unencrypted HTTP if deployed without TLS termination. | Enforce `https://` reverse proxy for backend and enable `resolveBackendBaseUrl(..., { requireHttps: true })` in production builds. |
| **SEC-002** | **P0** | Rate Limiting | No rate limiting or account lockout on `POST /api/auth/login` or `POST /api/auth/register` (`Program.cs`, `AuthController.cs`). Enables credential stuffing and brute-force attacks. | Configure ASP.NET Core `AddRateLimiter` with fixed/sliding window policies on auth and AI endpoints. |
| **SEC-003** | **P0** | Password Recovery | No self-service password reset or authenticated password change flow (`AuthController.cs`, `sign-in/page.tsx`). | Implement time-limited, single-use hashed `PasswordResetToken` flow and authenticated password change. |
| **SEC-004** | **P1** | Session Revocation | `AuthController.Logout` clears the `nurvia_session` cookie client-side, but JWTs remain valid until `ExpiryMinutes` (60 min) if captured (`JwtBearerAuthenticationHandler.cs`). | Introduce short-lived access tokens (10–15 min) + revocable `RefreshToken` table or token `jti` denylist on logout/deactivation. |
| **SEC-005** | **P1** | Admin RBAC & Audit UI | `/admin/rbac` and `/admin/audit` are hardcoded mocks (`admin/rbac/page.tsx`, `admin/audit/page.tsx`) disconnected from `/api/auth/assign-role` and `/api/audit-logs`, leaving admins without live user/role/audit visibility. | Wire `/admin/audit` to `GET /api/audit-logs` and `/admin/rbac` to `POST /api/auth/assign-role` + a new `GET /api/users` endpoint. |
| **SEC-006** | **P2** | Security Headers & CORS | `Program.cs` has no explicit security headers middleware (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `CSP`). CORS `AllowFrontend` hardcodes `localhost:3000` only (`Program.cs:L99`). | Add security headers middleware and configure allowed production origins via `appsettings` / environment variables. |
| **SEC-007** | **P2** | In-Exam Grading Bypass | `QuestionResponseGrader.Evaluate` grants 100% credit (`LegacyCredit`) for any non-empty JSON on `ClinicalCaseStudy`, `ExtendedResponse`, and complex types missing `Correct*` keys. | Require `Correct*` keys at `QuestionVersion.Validate()` and route ungradable types to `PendingManualReview`. |

---

## 2. Verified Security Controls (Local `apps/api`)

1. **Superadmin Privilege Escalation Protection:**
   - `RoleAssignmentPolicy.CanAssign(callerRole, requestedRole)` (`RoleAssignmentPolicy.cs:L24-L48`) explicitly rejects `Administrator` attempts to assign `Superadmin` (case-insensitive). Only `Superadmin` can assign `Superadmin`.
   - `CurrentUser.HasRole` (`CurrentUser.cs:L11-L28`) blocks `Administrator` from passing `Superadmin`-only checks.
   - `AuthService.AssignRoleAsync` (`AuthService.cs:L91`) enforces `RoleAssignmentPolicy` at the service layer independent of controllers.
2. **JWT & Cookie Hardening:**
   - `JwtBearerAuthenticationHandler.cs:L53-L71` re-queries `UserAccounts` on every request, verifying `user.IsActive` and refreshing role claims from the DB (so deactivated users are immediately rejected even with a valid JWT).
   - `nurvia_session` cookie is `HttpOnly = true`, `SameSite = SameSiteMode.Strict`.
   - `Program.cs:L19-L26` fails closed in non-Development if `JwtSettings:Secret` is missing.
3. **CSRF Protection:** `AutoValidateAntiforgeryTokenAttribute` applied globally (`Program.cs:L51`), paired with `GET /api/auth/csrf` and `X-CSRF-TOKEN` header in `api-client.ts:L126`.
4. **Password Hashing & Registration Enumeration:** `Pbkdf2PasswordHasher` used; `AuthController.Register` returns `202 Accepted` with a generic message even on duplicate email (`PostgresErrorCodes.UniqueViolation`), preventing account enumeration.
5. **Bootstrap Superadmin Guard:** `BootstrapConfigurationValidator` blocks weak or non-Development bootstrap configurations (`Program.cs:L173-L184`).
6. **File Upload Security:** `AvatarController` + `SkiaAvatarImageValidator` validates and re-encodes uploaded images; `FileStorageService` stores by generated `storageKey` outside webroot.
7. **Resource Isolation (IDOR):** `ExamAttemptsController` and `ExamAttemptService` enforce learner ownership on attempts, responses, reviews, and tutor endpoints.

---

## 3. Role & Permission Matrix (Backend Enforced)

| Operation | Learner | Author | Reviewer | Publisher | Administrator | Superadmin |
|---|---|---|---|---|---|---|
| Public Catalog / Study Library / Lectures | Allow | Allow | Allow | Allow | Allow | Allow |
| Start / Save / Submit / Review Own Attempt | Allow | Deny (403) | Deny (403) | Deny (403) | Deny (403) | Allow (own) |
| Create / Edit Question & Exam Drafts | Deny (403) | Allow | Deny (403) | Deny (403) | Allow | Allow |
| Review / Approve Questions & Exams | Deny (403) | Deny (403) | Allow | Deny (403) | Allow | Allow |
| Publish / Archive Questions, Exams, Lectures | Deny (403) | Deny (403) | Deny (403) | Allow | Allow | Allow |
| Preview Unpublished Exam (`GET /exams/{id}/preview`) | Deny (403) | Deny (403) | Deny (403) | Deny (403) | Allow | Allow |
| View Audit Logs (`GET /api/audit-logs`) | Deny (403) | Deny (403) | Deny (403) | Deny (403) | Allow | Allow |
| Assign Non-Superadmin Roles | Deny (403) | Deny (403) | Deny (403) | Deny (403) | Allow | Allow |
| Assign `Superadmin` Role | Deny (403) | Deny (403) | Deny (403) | Deny (403) | **Deny (403)** | **Allow** |
