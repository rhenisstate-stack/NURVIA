# NURVIA Hero, Authentication, RBAC, and Profile Reconciliation

## Release status

**Not ready — blocking acceptance gaps remain.** The application now has persisted authentication and learner exam flows, but this pass did not supply an approved hero video or complete browser evidence for the entire registration-to-exam-result journey.

## Baseline and changes

The starting implementation lacked persisted learner accounts and relied on demo identity/data in authentication and learner-facing screens. Exam and attempt persistence already existed in the API.

The current implementation:

- Persists accounts with salted PBKDF2-SHA256 password hashes. Public registration always creates a `Learner`; elevated roles are server-assigned.
- Uses an HttpOnly, SameSite session cookie, CSRF tokens for unsafe API requests, and database-backed identity/role claims.
- Supports profile-name updates and sign-out, and protects learner and staff workspaces by role.
- Provides a one-time Superadmin bootstrap using `BootstrapAdmin:Name`, `BootstrapAdmin:Email`, and `BootstrapAdmin:Password` configuration. The password must be at least 12 characters. Configure these values securely at deployment; do not put credentials in source control. The bootstrap does not overwrite an existing account or create another Superadmin once one exists.
- Uses published exams and persisted attempts/results for learner discovery, practice, history, performance, and review instead of synthesizing exam outcomes.
- Removes the unused hardcoded question set from the exam session page.

## Verification completed

| Check | Result |
|---|---|
| `dotnet test apps\\api\\Nurvia.slnx --no-restore` | Passed: 56, failed: 0 |
| `dotnet build apps\\api\\Nurvia.Api\\Nurvia.Api.csproj --no-restore` | Passed: 0 warnings, 0 errors |
| `Set-Location apps\\web; npm test` | Passed: all 16 reported frontend checks |
| `Set-Location apps\\web; npx tsc --noEmit` | Passed |
| `Set-Location apps\\web; npm run build` | Passed; Next.js generated all 50 pages |
| Local API/browser smoke checks | Health `200`; CSRF token `200`; unauthenticated `/me` `401`; login without CSRF `400`; invalid credentials with CSRF `401`. Public home and sign-up pages rendered. |

PostgreSQL integration tests cover learner registration, hashed-password persistence, duplicate registration, profile updates, and one-time Superadmin bootstrap. The browser check did not exercise a successful registration or authenticated learner journey.

## Remaining gaps and deployment notes

- No approved video asset was present in the repository. The hero remains a branded static treatment; video acceptance is not met.
- A complete browser-driven registration, sign-in, profile edit, published-exam attempt, submission, and result-review journey remains unverified. Confirm that at least one suitable published exam is available, then exercise that journey in the target environment.
- No email verification, password recovery/change, or account-deactivation flow was added. These require explicit product and operational requirements before account lifecycle acceptance.
- Review availability is not governed by a configurable release policy; completed attempts can be reviewed.
- Production must provide `JwtSettings:Secret`, apply the `PersistedUserAccounts` migration, and provision a Superadmin using the bootstrap settings or another controlled deployment procedure before staff administration is needed.
- The home experience still includes static marketing/study-set content; validate any quantitative claims and testimonials against approved sources before release.

## Recommendation

Do not treat this reconciliation as a release sign-off. Approve/provide the hero media, verify marketing claims, and complete the authenticated browser journey against the intended deployment and published exam data before declaring acceptance.
