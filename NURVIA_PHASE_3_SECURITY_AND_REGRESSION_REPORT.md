# NURVIA Phase 3 — Security and Regression Report

**Project:** NURVIA (`apps/web`)  
**Verification Date:** 2026-11-16

---

## 1. Automated Verification Results

| Check | Command | Scope | Result |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | Full `apps/web` | **PASS** (0 errors) |
| ESLint | `npm run lint` | Full `apps/web` | **PASS** (0 errors) |
| Unit, Contract & Security Suites (8 suites) | `npm test` | `navigation-and-carousel`, `learning-integration`, `question-renderers`, `hero-redesign`, `remote-api-config`, `calculators`, `lexmacasto-integration` (10/10), `lexmacasto-phase2-security` (8/8) | **PASS** (all 8 suites) |
| Production Build | `npm run build` | Next.js 15.5 | **PASS** (exit 0) |
| Client Bundle Secret Scan | `.next/static/**/*.js` scan | Checked for `SKEW_LINE_APP_KEY`, `x-site-key`, `x-casto-line`, `x-casto-badge`, `explicitbackend.com`, `108.61.9.189`, and configured key | **PASS** (`CLEAN: 0 secret/internal matches in .next/static`) |

## 2. Security Controls Confirmed

- **Proxy Allowlist (`proxy-allowlist.ts`, `app/api/backend/[...path]/route.ts`):** Explicit route/method matrix, traversal/encoding rejection, `401`/`403` staff verification, `413` body limit, `415` content-type check, `Cache-Control: no-store`.
- **No Open Rewrites (`next.config.mjs`):** All `rewrites()` removed; `/api/avatar/[storageKey]` validated via `SAFE_STORAGE_KEY_REGEX`.
- **Header Ownership & Redaction (`client.ts`, `headers.ts`):** Server-owned `siteHeaders` and `authHeaders` override caller headers; sensitive headers/bodies redacted.
- **CSRF & Cookies (`session.ts`):** `HttpOnly`, `SameSite=Lax`, production `Secure` cookies; `validateSameOriginRequest` without `X-Forwarded-Host` trust.
