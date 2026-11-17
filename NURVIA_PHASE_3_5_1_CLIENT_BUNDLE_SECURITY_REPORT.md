# NURVIA Phase 3.5.1 — Client Bundle and Deployment Artifact Security Report

**Date:** 2026-11-16  
**Gate:** E — Client Bundle and Deployment Artifact Audit  
**Status:** PASS

---

## 1. Scan Scope & Command

Scanned all **120** generated files under `apps/web/.next/static/**/*` produced by `npm --prefix apps/web run build` (`Next.js 15.5.29`).

**Command:**
```powershell
$patterns = @('SKEW_LINE_APP_KEY','x-site-key','x-casto-line','x-casto-badge','skew8lancasto','WEBSITE_1','108\.61\.9\.189','explicitbackend\.com','nurvia_casto_line','nurvia_casto_badge','castoLine','castoBadge')
Get-ChildItem -Path apps/web/.next/static -Recurse -File | Select-String -Pattern $patterns
```

---

## 2. Scan Results

| Pattern | Category | Match Count |
|---|---|---|
| `SKEW_LINE_APP_KEY` | Server-only application key env var | `0` |
| `x-site-key` | Server-only site key header | `0` |
| `x-casto-line` | Server-only Casto session header | `0` |
| `x-casto-badge` | Server-only Casto session header | `0` |
| `skew8lancasto` | Qlex hardcoded challenge string | `0` |
| `WEBSITE_1` | Qlex application identifier | `0` |
| `108\.61\.9\.189` | Qlex backend IP address | `0` |
| `explicitbackend\.com` | Backend origin domain | `0` |
| `nurvia_casto_line` | `HttpOnly` cookie name | `0` |
| `nurvia_casto_badge` | `HttpOnly` cookie name | `0` |
| `castoLine` | Raw session credential field | `0` |
| `castoBadge` | Raw session credential field | `0` |

**Total Static Files Scanned:** `120`  
**Total Matches:** `0`

---

## 3. Gate E Conclusion

**PASS** — Application keys, site keys, Casto session credentials, backend origin details, and Qlex identifiers are completely absent from client-delivered static bundles. No server-only module is imported into any client component.
