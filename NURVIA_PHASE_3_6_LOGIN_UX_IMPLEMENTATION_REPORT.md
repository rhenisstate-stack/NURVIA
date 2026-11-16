# NURVIA Phase 3.6 — Login UX Implementation Report

**Date:** 2026-11-16  
**Phase:** F — Login Page UX Redesign  
**Files:** `apps/web/app/sign-in/page.tsx`, `apps/web/components/auth/auth-shell.tsx`

---

## 1. Implemented UX Improvements

- **Visual Parity with Registration:** Uses `<AuthShell mode="sign-in">` with NURVIA `<Logo />`, Clinical Precision surfaces, consistent `h-11` inputs, and clear focus rings.
- **Credential Method Selector:** Accessible `Password | PIN` segmented `radiogroup` (`aria-checked`), conditional password (with real `/forgot-password` link) or numeric PIN input (`4–12` digits), visibility toggles (`Show/Hide password`, `Show/Hide PIN`), and `Keep me signed in on this device` (`rememberMe`) checkbox.
- **Response & Session Safety:** Protects against duplicate submissions (`submitting` guard), surfaces safe inline alert errors with `AlertCircle` icon, preserves safe `returnTo` origin checks, and never creates local authenticated state without valid backend credentials.
- **Zero Challenge UI:** No challenge fields or fabricated tokens exist.
