# NURVIA Phase 3.2 — Defect Closure Register

**Date:** 2026-11-16

| Defect ID | Severity | Source | Root Cause | Fix & Regression Test | Prod Verification | Status |
|---|---|---|---|---|---|---|
| `DEF-3.1-01` | P1 | `api-client.ts` | Missing `Content-Type` check, `null`/primitive JSON guard, and shared parser. | `api-response.ts`, `api-url.mjs`; `auth-route-remediation.test.mjs` (7/7 PASS), local Playwright (PASS). | Stale prod still fails (`Unexpected token 'T'`). | **FIXED — NOT YET VERIFIED (Prod)** |
| `DEF-3.1-02` | P1 | `/api/auth/me`, `logout`, `config-status` | Missing `Cache-Control: no-store` on `401`/error responses. | Added `no-store` to all branches; `auth-handlers-integration.test.mjs` (9/9 PASS). | Prod `/api/auth/me` returns `404` (stale build). | **FIXED — NOT YET VERIFIED (Prod)** |
| `DEF-3.1-03` | P2 | Test coverage | Missing runtime auth handler & Playwright E2E tests. | Added `auth-handlers-integration.test.mjs` & `auth-route-remediation.spec.ts`. | Executed against local & live prod. | **CLOSED** |
| `DEF-3.2-01` | P0 | `https://nurvia-black.vercel.app` | Production still serves pre-Phase-1 build (`Last-Modified: 10:42:19Z`) despite `6ed4ad7` on `origin/master`. | No local Vercel CLI/token; requires Vercel Dashboard build/env check & Production redeploy from `master`. | Live probes return `404` / `DNS_HOSTNAME_RESOLVED_PRIVATE`. | **BLOCKED BY EXTERNAL DEPENDENCY (Vercel Access)** |
