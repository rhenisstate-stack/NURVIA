# 1. QLEX REPOSITORY INVENTORY

- **Repository:** `C:\Users\gitau\Documents\Qlex` (STRICTLY READ-ONLY)
- **Total Project-Owned Directories:** 1349
- **Total Project-Owned Files:** 1757

## Top-Level Distribution

| Top-Level Item | File Count |
|---|---:|
| `src` | 1674 |
| `public` | 44 |
| `audit_reports` | 26 |
| `.skewblanc` | 2 |
| `.env.local` | 1 |
| `.gitignore` | 1 |
| `README.md` | 1 |
| `eslint.config.mjs` | 1 |
| `next-env.d.ts` | 1 |
| `next.config.ts` | 1 |
| `package-lock.json` | 1 |
| `package.json` | 1 |
| `postcss.config.mjs` | 1 |
| `tsconfig.json` | 1 |
| `tsconfig.tsbuildinfo` | 1 |

## File Counts by Extension

| Extension | Count |
|---|---:|
| `.tsx` | 1511 |
| `.ts` | 100 |
| `.svg` | 62 |
| `.md` | 27 |
| `.jpg` | 15 |
| `.png` | 14 |
| `.webp` | 9 |
| `.css` | 7 |
| `.json` | 3 |
| `.mjs` | 2 |
| `.txt` | 2 |
| `.local` | 1 |
| `.gitignore` | 1 |
| `.tsbuildinfo` | 1 |
| `.avif` | 1 |
| `.ico` | 1 |

## Architectural Subtree Summary

- `src/app/(web)/`: 71 files — public marketing pages, auth pages/modals, program info pages, heed, seek, subscription.
- `src/app/api/`: 61 files — Next.js API route handlers (`/api/auth/*`, `/api/nexus/strata/*`, `/api/nexus/dominion/*`, `/api/system/*`, `/api/users/*`, `/api/seek`, `/api/media/[...path]`).
- `src/app/dashboards/`: 544 files — `shared/` (4) + 6 identical 90-file program dashboards (`nclex-rn`, `nclex-pn`, `rn-nursing`, `lpn-nursing`, `ati-teas`, `hesi-a2`).
- `src/app/web/(livexams)/`: 754 files — `layout.tsx` (1) + `partials/` (27, incl. 21 question types) + 6 identical 121-file program exam engines across 8 exam themes (`atlas`, `cascade`, `classic`, `generic`, `glacial`, `orbit`, `pulse`, `zen`).
- `src/app/web/(nexus)/`: 3 files — public assessment/program overview routes.
- `src/lib/`: 158 files — `hooks/` (115), `services/` (16), `contexts/` (9), `utils/` (7), `types/` (4), `config/` (3), `api/` (2), `constants/` (2).
- `src/components/`: 14 files, `src/styles/`: 6 files, `src/assets/`: 59 files, `public/`: 44 files, `audit_reports/`: 26 files, `.skewblanc/`: 2 files.
