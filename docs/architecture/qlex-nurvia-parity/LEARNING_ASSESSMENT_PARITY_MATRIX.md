# 9. LEARNING & ASSESSMENT PARITY MATRIX

## Program Dashboards (6 Nursing Programs)
- Programs: `nclex-rn`, `nclex-pn`, `rn-nursing`, `lpn-nursing`, `ati-teas`, `hesi-a2`.
- Qlex replicates 90 dashboard files x 6 = 540 files + 121 livexams files x 6 = 726 files.
- NURVIA target: Dynamic `[program]` routes (`apps/web/app/dashboards/[program]/...` and `apps/web/app/web/(livexams)/[program]/...`) backed by shared components.

## Exam Engine & Question Types
- Qlex `examService.ts` supports 38 `Action...` answer types (19 standalone + 19 case-based), 5 exam tools, 5 question tools, 5 lifecycle actions, 4 preference actions via `/api/nexus/strata/assessment/exam/upserts`.
- Qlex provides 8 exam themes: `atlas`, `cascade`, `classic`, `generic`, `glacial`, `orbit`, `pulse`, `zen`.
- NURVIA currently has 19 question renderers in `apps/web/components/exam/renderers/` and `/api/exams/diy`, `/api/attempts/history`, `/api/strata/[resource]`, but lacks `/api/exams/upserts` and the 8-theme livexams shell.
