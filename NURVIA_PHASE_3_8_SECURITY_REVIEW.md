# NURVIA Phase 3.8 — Security Review

- **Identity Isolation:** `website 11` (`SKEW_LINE_APP_KEY`, `SKEW_LINE_APP_DOMAIN`) remains server-only; zero `WEBSITE_1` literals exist in NURVIA.
- **Temporary Challenge Isolation:** `register-skew8@lancasto`, `learner.login.skew8lancasto`, and `custom.login.skew8lancasto` exist **only** in `apps/web/lib/auth/temporaryChallenge.ts`, verified by automated test to never appear in any `'use client'` file or other source module.
- **CSRF & Authorization:** `validateSameOriginRequest()` is enforced on all mutations; `/api/strata/[resource]` mutations require `STAFF_ROLES`; `/api/auth/account/destroy` verifies caller identity server-side; `/api/seek` requires auth on `suggest` and `history`.
- **Excluded Unsafe Qlex Routes:** `system/backends`, `users/seed`, unguarded `system/*`, unguarded `auth/support/*`, `auth/session`, and `media/[...path]`.
