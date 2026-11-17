# NURVIA Target Inventory

**Target Repository:** `C:\Users\gitau\Documents\NURVIA`
**Frontend Root:** `C:\Users\gitau\Documents\NURVIA\apps\web`
**Backend Root:** `C:\Users\gitau\Documents\NURVIA\apps\api`
**Git Baseline:** Branch `master`, HEAD `3847570` (`feat(nurvia): complete Qlex structural and functional parity`), clean working tree.
**Total `apps/web` Directories:** 236
**Total `apps/web` Files:** 317
**Excluded Generated Directories in `apps/web`:** .next, node_modules
**NURVIA-Only Files in `apps/web`:** 251

## Architectural Path Mapping

- Qlex places Next.js source under `src/` with `@/*` -> `./src/*` in `tsconfig.json`.
- NURVIA `apps/web` places Next.js source directly under `apps/web/` (`app/`, `components/`, `hooks/`, `lib/`, `styles/`, `middleware.ts`) with `@/*` -> `./*` in `apps/web/tsconfig.json`.
- Therefore, every Qlex `src/<path>` maps to `apps/web/<path>`, `public/<path>` maps to `apps/web/public/<path>`, and root config files map to `apps/web/<file>` (reconciled, not blindly overwritten).

## `apps/web` File Count by Top-Level Directory

| Top-Level Path | Files |
|---|---|
| `app` | 118 |
| `components` | 89 |
| `lib` | 48 |
| `tests` | 29 |
| `<root>` | 18 |
| `public` | 6 |
| `styles` | 6 |
| `hooks` | 2 |
| `scripts` | 1 |
