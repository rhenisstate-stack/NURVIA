# 2. NURVIA REPOSITORY INVENTORY

- **Repository:** `C:\Users\gitau\Documents\NURVIA`
- **Git Branch:** `master` | **HEAD:** `16d86e5a16a018fa8cacb68f06199f7ef8f2c671` | **Working Tree:** Clean
- **Total Project-Owned Directories:** 183
- **Total Project-Owned Files:** 706

## Top-Level Distribution

| Top-Level Item | File Count |
|---|---:|
| `apps` | 433 |
| `docs` | 115 |
| `components` | 9 |
| `backend-migration-backup` | 7 |
| `lib` | 5 |
| `test-results` | 4 |
| `hooks` | 2 |
| `.gitignore` | 1 |
| `NURVIA_CHALLENGE_LIFECYCLE_AUDIT.md` | 1 |
| `NURVIA_INTEGRATION_REMEDIATION_INVENTORY.md` | 1 |
| `NURVIA_INTEGRATION_VERIFICATION_AND_RELEASE_ACCEPTANCE_REPORT.md` | 1 |
| `NURVIA_LEXMACASTO_COMPLETE_INTEGRATION_ALIGNMENT_REPORT.md` | 1 |
| `NURVIA_LEXMACASTO_INTEGRATION_CONTRACT.md` | 1 |
| `NURVIA_PHASE_2_EXTERNAL_DEPENDENCY_REGISTER.md` | 1 |
| `NURVIA_PHASE_2_INTEGRATION_SECURITY_AUDIT_REPORT.md` | 1 |
| `NURVIA_PHASE_2_LIVE_BACKEND_ACCEPTANCE_REPORT.md` | 1 |
| `NURVIA_PHASE_2_REMEDIATION_REPORT.md` | 1 |
| `NURVIA_PHASE_2_TEST_AND_RELEASE_ACCEPTANCE_REPORT.md` | 1 |
| `NURVIA_PHASE_3_1_AUTHENTICATION_ACCEPTANCE_REPORT.md` | 1 |
| `NURVIA_PHASE_3_1_BROWSER_E2E_REPORT.md` | 1 |

## File Counts by Extension

| Extension | Count |
|---|---:|
| `.md` | 190 |
| `.cs` | 180 |
| `.tsx` | 139 |
| `.ts` | 74 |
| `.png` | 49 |
| `.mjs` | 25 |
| `.csproj` | 10 |
| `.json` | 10 |
| `.log` | 6 |
| `.svg` | 5 |
| `.props` | 2 |
| `.slnx` | 2 |
| `.example` | 2 |
| `.js` | 2 |
| `.gitignore` | 1 |
| `.binlog` | 1 |
| `.yml` | 1 |
| `.http` | 1 |
| `.jpg` | 1 |
| `.bak` | 1 |
| `.local` | 1 |
| `.tsbuildinfo` | 1 |
| `.css` | 1 |
| `.jpeg` | 1 |

## Key Architectural Observations

- `apps/web/`: 239 files — Next.js 15.5 App Router frontend with hardened server-side LexmaCasto BFF (`lib/lexmacasto/*`), HttpOnly session cookies, CSRF origin validation, strict proxy allowlist, 19 question renderers, and Playwright + Node test suites.
- `apps/api/`: 194 files — .NET 10 Clean Architecture backend (`Nurvia.Api` 18 controllers, `Nurvia.Application`, `Nurvia.Domain`, `Nurvia.Infrastructure` with 13 EF Core migrations, `Nurvia.Tests` 30 test files).
- **Root-level Drift:** 16 code files sit at repository root (`components/shared/feedback/*`, `hooks/*`, `lib/*`) outside `apps/web/`, alongside ~130 historical phase report `.md` and `.log` files.
