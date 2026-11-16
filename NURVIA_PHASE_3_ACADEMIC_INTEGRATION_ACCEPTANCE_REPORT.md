# NURVIA Phase 3 — Academic Integration Acceptance Report

**Project:** NURVIA (`apps/web`)  
**Backend Origin:** `https://explicitbackend.com`

---

## 1. Live Verification Results Across All 22 Verified Academic Strata Endpoints

Executed against `https://explicitbackend.com` with NURVIA's server-side `x-site-key` and `x-site-domain`:

| Group | Resource | HTTP Status | `success` | `items` Returned | Notes |
|---|---|---|---|---|---|
| Main | `categories` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Main | `subcategories` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Main | `domains` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `programs` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `courses` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `subjects` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `units` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `lessons` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `topics` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `concepts` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Learning | `facts` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Assessment | `assessments` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Assessment | `exams` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Assessment | `examsLive` | `401` | `false` | `N/A` | `Access Denied, Kindly Log In ⚓` (`fetchtype=live` requires auth) |
| Assessment | `sections` | `200` | `true` | `7` | `skewTotal=7`, `skewTotalPages=1`; includes `year` and `season` fields |
| Assessment | `questions` | `200` | `true` | `20` | `skewTotal=114349`, `skewTotalPages=5718`; includes full hierarchy IDs (`programId`, `courseId`, `subjectId`, `unitId`, `lessonId`, `topicId`, `conceptId`, `factId`, `assessmentId`, `examId`, `sectionId`, `year`) |
| Institution | `institutions` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Institution | `schools` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Institution | `departments` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Institution | `divisions` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Institution | `cohorts` | `200` | `true` | `0` | `fetchtype=absolute` enforced |
| Institution | `classes` | `200` | `true` | `0` | Verified `classes` route (`fetchtype=absolute`) |

## 2. Filters, Year/Season & Remediation

- **P3-STRATA-01 Fixed:** Updated `apps/web/lib/lexmacasto/strata-filters.ts` to also query `sections` after live schema inspection confirmed `sections` carries `year` and `season` fields.
- **No Invented Endpoints:** No `AcademicYear` or `Season` endpoints are called or fabricated; when `schools`, `subjects`, `exams`, or `year`/`season` return 0 NURVIA-scoped items, `StudyLibraryAdvancedFilters` cleanly disables empty selects (`No data available`).
