# NURVIA Phase 3 — Remediation Register

| ID | Severity | Root Cause | Affected Files | Remediation | Test Evidence | Final Status |
|---|---|---|---|---|---|---|
| P3-ID-01 | **P0** | `resolveApplicationIdentity` used `/[\r\n\s]/.test(appKey)`, which rejected keys containing internal spaces | `apps/web/lib/api-config.mjs` | Updated regex to `/[\r\n\0\x01-\x1F\x7F]/` for `appKey` (preserving internal spaces while blocking CRLF/control chars), keeping `/[\r\n\s\0\x01-\x1F\x7F]/` for `appDomain` | `lexmacasto-integration.test.mjs` (#1) + live `200`/`401` responses from `explicitbackend.com` | **FIXED AND VERIFIED** |
| P3-STRATA-01 | **P2** | `fetchStrataFilterOptions` did not query `sections`, which live schema inspection showed carries `year` and `season` fields | `apps/web/lib/lexmacasto/strata-filters.ts` | Added `nurviaApi.getStrata('sections')` and included `sectionItems` in `year`/`season` metadata extraction | `tsc --noEmit`, `npm test`, `npm run build` | **FIXED AND VERIFIED** |
