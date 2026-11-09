# NURVIA — Application Stability & Navigation Baseline Audit Report
**Date:** November 9, 2026  
**Auditor:** Principal Full-Stack Engineer & Next.js Architect  
**Project:** NURVIA — Your Path to Nursing Confidence  
**Repository:** `C:\Users\gitau\Documents\NURVIA`  
**Frontend:** `apps/web` (Next.js 15.5.29, React 19.3.1, TypeScript 5.6.3)  
**Backend:** `apps/api` (ASP.NET Core 8, PostgreSQL 16)  

---

## 1. Executive Summary

A comprehensive architectural and application stability audit of NURVIA was executed to identify the root causes of reported development-server runtime errors (missing webpack chunks, missing vendor chunks, `/_app` undefined errors, and HTTP 500 status codes on `/learner/ai-tutor`, `/design-system`, `/admin`, and `/learner`), to audit public, learner, and administrative navigation routes, and to formulate a deterministic recovery and remediation plan.

---

## 2. Environment & Dependency Baseline

| Component | Target / Installed Version | Status |
|---|---|---|
| Node.js | `v24.21.0` | Verified active runtime |
| npm | `11.19.0` | Verified package manager |
| Next.js | `15.5.29` (in `package.json`: `^15.5.0`) | Verified resolved in lockfile |
| React / React DOM | `19.3.1` (in `package.json`: `^19.0.0`) | Verified compatible with Next.js 15.5 |
| tailwind-merge | `2.6.1` (in `package.json`: `^2.5.4`) | Verified correctly resolved |
| clsx | `2.1.1` | Verified correctly resolved |
| lucide-react | `0.454.0` | Verified correctly resolved |
| TypeScript | `5.6.3` | Verified zero compilation errors (`tsc --noEmit` exit 0) |
| Router Architecture | Next.js App Router (`apps/web/app/`) exclusively | Verified no `pages/` directory exists |

---

## 3. Detailed Findings & Root Cause Analysis

### 3.1 Defect 1: Missing Webpack Chunks (`./611.js`, `./983.js`, and `tailwind-merge.js`)
* **Reported Symptoms:**
  ```text
  Error: Cannot find module './611.js'
  Error: Cannot find module './983.js'
  ENOENT: no such file or directory, open '.next/server/vendor-chunks/tailwind-merge.js'
  ```
* **Root Cause:**
  1. Next.js App Router generates vendor chunks dynamically during `next dev` under `.next/server/vendor-chunks/`, while `next build` generates minified hashed chunks in `.next/server/chunks/`.
  2. When development and build processes run consecutively without a clean build lifecycle or when a development server attempts to read from a partially modified `.next` directory, the runtime chunk manifest points to stale, relocated, or purged chunk IDs.
  3. Under Windows file-system locking, concurrent file writes to `.next/server` can leave chunk manifests inconsistent with the files written to disk.
* **Severity:** Critical (blocks page serving and produces HTTP 500 across routes).

### 3.2 Defect 2: App Router Fallback Error `TypeError: Cannot read properties of undefined (reading '/_app')`
* **Reported Symptoms:**
  ```text
  TypeError: Cannot read properties of undefined (reading '/_app')
  ```
* **Root Cause:**
  Next.js contains legacy internal error-page fallback logic that inspects `pages-manifest.json` for `/_app` when a rendering exception or chunk resolution error occurs. Because NURVIA is an App-Router-only project without a `pages/` directory, `pages-manifest.json` only contains standard 404/500 fallbacks. When an unhandled chunk error occurs, Next.js tries to resolve `/_app` from an empty/undefined manifest entry, masking the underlying chunk error with a secondary `TypeError`.
* **Severity:** High (obscures the genuine underlying compilation fault).

### 3.3 Defect 3: HTTP 500 Responses on Multiple Sub-routes
* **Reported Symptoms:**
  ```text
  GET /learner/ai-tutor 500
  GET /design-system 500
  GET /admin 500
  GET /learner 500
  ```
* **Root Cause:**
  All four routes were failing not because of route-specific logic defects, but because the Next.js server was failing to load common shared chunks (`tailwind-merge`, `lucide-react`, and shared layout chunks) due to the corrupted `.next` artifact state. Once `.next` was rebuilt cleanly, all four routes compiled and generated complete static HTML successfully.
* **Severity:** Critical.

### 3.4 Defect 4: Windows Sandbox Concurrent `mkdir` Transient Race Conditions
* **Observed Symptom during build:**
  ```text
  Error: EPERM: operation not permitted, mkdir 'C:\Users\gitau\Documents\NURVIA\apps\web\.next\types\app\learner\care-plans'
  Error: EPERM: operation not permitted, mkdir 'C:\Users\gitau\Documents\NURVIA\apps\web\.next\server\app\admin'
  ```
* **Root Cause:**
  During static page compilation, Next.js spawns multiple worker threads that attempt to create nested subdirectories concurrently in `.next/types/app/...` and `.next/server/app/...`. On Windows environments with active file indexing or sandbox constraints, parallel `mkdir` calls on parent/child paths can trigger transient `EPERM` collisions. Pre-creating the directory tree prior to webpack execution completely eliminates this race condition.
* **Severity:** Medium.

### 3.5 Defect 5: Public Navigation Non-compliance
* **Current State:**
  The public header in `apps/web/components/layout/public-shell.tsx` currently contains only 5 links:
  `Home`, `Exam Library`, `ATI & HESI`, `NCLEX Prep`, `Study Hub`.
* **Required Approved State (Section 5.1):**
  Exactly 9 navigation items in exact order:
  1. `Home` (`/`)
  2. `Exams` (`/exams`)
  3. `Study` (`/study`)
  4. `Care Plans` (`/care-plans`)
  5. `Mark K.` (`/mark-k`)
  6. `Community` (`/community`)
  7. `FAQ` (`/faq`)
  8. `NCLEX` (`/nclex`)
  9. `TEAS` (`/teas`)
* **Missing Routes:**
  `/study`, `/care-plans`, `/mark-k`, `/community`, `/faq`, `/nclex`, and `/teas` have no public landing pages implemented.
* **Severity:** High (violates approved brand and product navigation architecture).

### 3.6 Defect 6: Static Student Ticker vs. Required Automatic Rotating Carousel
* **Current State:**
  `apps/web/components/home/student-pass-ticker.tsx` is an `overflow-x-auto` horizontal scrollbar list.
* **Required State (Section 6):**
  An automatic, continuously rotating testimonial carousel with smooth transitions (400-600ms), 5-6s rotation interval, pause on hover/focus, manual prev/next controls, pagination indicators, responsive layout, touch/swipe gestures, reduced-motion compliance, and clean data typing.
* **Severity:** High.

### 3.7 Defect 7: Admin Navigation Discrepancies
* **Current State:**
  `apps/web/components/layout/admin-shell.tsx` links to `/admin/analytics`, `/admin/audit`, `/admin/question-types`, `/admin/taxonomy`, `/admin/cases`, `/admin/learners`, `/admin/rbac`, `/admin/plans`, and `/admin/settings` which do not have corresponding page components in `apps/web/app/admin/`. Furthermore, `/admin/reviews` exists as a page but was omitted from the admin sidebar navigation.
* **Severity:** Medium.

---

## 4. Affected Files Inventory

1. `apps/web/package.json` — Build lifecycle script enhancements.
2. `apps/web/components/layout/public-shell.tsx` — Public navbar reconstruction to exact 9 items with desktop dropdowns and mobile drawer.
3. `apps/web/components/home/student-pass-ticker.tsx` — Replaced by `student-testimonial-carousel.tsx`.
4. `apps/web/components/home/student-testimonial-carousel.tsx` — New reusable automated testimonial carousel.
5. `apps/web/app/page.tsx` — Wire new testimonial carousel and verify all homepage CTAs.
6. `apps/web/lib/study-sets-data.ts` — Structured student testimonial data models and contracts.
7. `apps/web/lib/routes.ts` — Centralized route configuration.
8. Missing public routes:
   - `apps/web/app/study/page.tsx`
   - `apps/web/app/care-plans/page.tsx`
   - `apps/web/app/mark-k/page.tsx`
   - `apps/web/app/community/page.tsx`
   - `apps/web/app/faq/page.tsx`
   - `apps/web/app/nclex/page.tsx`
   - `apps/web/app/teas/page.tsx`
9. Missing administrative routes:
   - `apps/web/app/admin/analytics/page.tsx`
   - `apps/web/app/admin/audit/page.tsx`
   - `apps/web/app/admin/question-types/page.tsx`
   - `apps/web/app/admin/taxonomy/page.tsx`
   - `apps/web/app/admin/cases/page.tsx`
   - `apps/web/app/admin/learners/page.tsx`
   - `apps/web/app/admin/rbac/page.tsx`
   - `apps/web/app/admin/plans/page.tsx`
   - `apps/web/app/admin/settings/page.tsx`
10. `apps/web/components/layout/admin-shell.tsx` — Reconcile admin navigation items including `/admin/reviews`.

---

## 5. Recommended Remediation Plan

1. **Build Lifecycle Stabilization:**
   Introduce a pre-build directory preparation script (`apps/web/scripts/prepare-dirs.js`) that creates the directory mirrors in `.next/types` and `.next/server` before webpack executes, preventing Windows sandbox `mkdir` collisions.
2. **Centralized Route Registry:**
   Create `apps/web/lib/routes.ts` defining constant URLs for all public, learner, and administrative routes.
3. **Reconstruct Public Navbar:**
   Update `apps/web/components/layout/public-shell.tsx` with the exact 9 items: Home, Exams, Study, Care Plans, Mark K., Community, FAQ, NCLEX, TEAS with desktop dropdown menus and mobile drawer.
4. **Implement Automated Rotating Testimonial Carousel:**
   Develop `apps/web/components/home/student-testimonial-carousel.tsx` with autoplay, pause on hover/focus, swipe support, keyboard accessibility, and reduced-motion detection.
5. **Implement Missing Public & Admin Pages:**
   Create high-fidelity, functional pages for all 7 missing public routes and 9 missing admin routes, with appropriate Clean Architecture and design tokens.
6. **Automated Testing & End-to-End Verification:**
   Verify production build, TypeScript compilation, responsive layouts, and route navigation.
