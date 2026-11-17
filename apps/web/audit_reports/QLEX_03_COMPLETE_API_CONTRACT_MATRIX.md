# QLEX_03 — COMPLETE API CONTRACT MATRIX

All local routes live under `src/app/api/**` and forward to `http://108.61.9.189:8008/api/castoline/*` with `getSiteHeaders()` + `x-casto-line` / `x-casto-badge` (where applicable).

| Feature | Local Endpoint | Hosted Backend Path | Method | Auth | Status | Evidence |
|---|---|---|---|---|---|---|
| **Login** | `/api/auth/login` | `/api/castoline/auth/login` | POST | Public | Discovered (Untested live) | `src/app/api/auth/login/route.ts` |
| **Register** | `/api/auth/register` | `/api/castoline/auth/register` | POST | Public | Discovered (Has `pinConfirmation` bug) | `src/app/api/auth/register/route.ts` |
| **Session Check** | `/api/auth/session` | `/api/castoline/auth/system/user` | GET | Session | Verified failing (500 unauth) | Live probe + `src/app/api/auth/session/route.ts` |
| **Logout** | `/api/auth/logout` | `/api/castoline/auth/logout/sessions/{distinct\|relative}` | POST | Session | Discovered (Untested live) | `src/app/api/auth/logout/route.ts` |
| **Destroy Account** | `/api/auth/account/destroy` | `/api/castoline/auth/account/destroy` | POST | Session | Discovered (Untested live) | `src/app/api/auth/account/destroy/route.ts` |
| **Validate Token** | `/api/auth/validate` | `/api/castoline/strata/support/validate` | GET | Public/Token | Discovered | `src/app/api/auth/validate/route.tsx` |
| **Social OAuth** | `/api/auth/social/{google\|apple\|facebook\|github\|linkedin\|microsoft\|onetap}` | `/api/castoline/auth/social/*` | GET/POST | Public | Discovered | `src/app/api/auth/social/*/route.ts` |
| **Password/Social Recovery** | `/api/auth/recovery/{password\|social}` | `/api/castoline/auth/recovery/*` | POST | Public | Discovered | `src/app/api/auth/recovery/*/route.ts` |
| **Account Support** | `/api/auth/support/{2fa\|account\|email\|message\|password\|phone\|social}` | `/api/castoline/auth/support/*` | POST/PUT | Session | Discovered | `src/app/api/auth/support/*/route.ts` |
| **Current / List Users** | `/api/users/user` | `/api/castoline/system/user/{store\|update\|delete\|list/{current\|absolute\|distinct\|relative}}` | GET/POST/PUT/DELETE | Session | Verified 401 unauth | Live probe + `src/app/api/users/user/route.ts` |
| **Session Controls** | `/api/users/controls/session` | `/api/castoline/users/controls/session/*` | GET/POST | Admin | Disconnected (`sessionService.ts` calls `/api/users/session`) | `src/lib/services/users/session/sessionService.ts` |
| **Exams List/CRUD** | `/api/nexus/strata/assessment/exam` | `/api/castoline/strata/assessment/exams/{store\|update\|delete\|list/{absolute\|distinct\|relative\|nominal\|live\|diy/live}}` | GET/POST/PUT/DELETE | Mixed | Verified 200 (`items: []`) / 400 (`nominal` w/o id) | Live probe + `src/app/api/nexus/strata/assessment/exam/route.ts` |
| **Exam Upserts (Answers, Tools, Lifecycle, Prefs)** | `/api/nexus/strata/assessment/exam/upserts` | `/api/castoline/strata/assessment/exams/upsert/{diy/}{user/answers\|actions\|question/actions\|lifecycle\|preferences}` | POST | Session | Discovered (Untested live) | `src/app/api/nexus/strata/assessment/exam/upserts/route.ts` |
| **DIY Exam Store** | `/api/nexus/strata/assessment/exam/diy` | `/api/castoline/strata/assessment/exams/diy/learning/store` | POST | Session | Discovered | `src/app/api/nexus/strata/assessment/exam/diy/route.ts` |
| **Exam Results** | `/api/nexus/strata/assessment/result` | `/api/castoline/strata/assessment/exams/results/{delete\|list/{diy/}{absolute\|relative\|current\|distinct}\|list/nominal}` | GET/DELETE | Session | Verified failing (500 unauth) | Live probe + `src/app/api/nexus/strata/assessment/result/route.ts` |
| **Assessments / Questions / Sections** | `/api/nexus/strata/assessment/{assessment\|question\|section}` | `/api/castoline/strata/assessment/{assessments\|questions\|sections}/*` | GET/POST/PUT/DELETE | Mixed | Discovered | `src/app/api/nexus/strata/assessment/*/route.ts` |
| **Learning Hierarchy** | `/api/nexus/strata/learning/{program\|course\|subject\|unit\|lesson\|topic\|concept\|fact}` | `/api/castoline/strata/learning/*` | GET/POST/PUT/DELETE | Mixed | Verified 200 (`program` `data: []`) | Live probe + `src/app/api/nexus/strata/learning/*/route.ts` |
| **Subscriptions** | `/api/nexus/dominion/subscription/{item\|package}` | `/api/castoline/dominion/subscription/*` | GET/POST | Mixed | Discovered | `src/app/api/nexus/dominion/subscription/*/route.ts` |
| **Media Proxy** | `/api/media/[...path]` | `/{path}` | GET | Public | Discovered (No path validation) | `src/app/api/media/[...path]/route.ts` |
| **Search (Seek)** | `/api/seek` | `/api/castoline/seek/*` | GET/POST | Mixed | Discovered | `src/app/api/seek/route.ts` |
