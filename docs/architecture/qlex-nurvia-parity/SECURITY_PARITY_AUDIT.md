# 13. SECURITY PARITY AUDIT

## Critical Security Controls to Preserve in NURVIA (Do NOT Regress to Qlex)
1. **HttpOnly Session Cookies** (`nurvia_casto_line`, `nurvia_casto_badge`): Qlex stores `skew_blanc_session_badge/line` in `document.cookie` and sends `x-casto-*` from browser JS (`systemSessionHeaders.ts`). NURVIA MUST NEVER adopt this.
2. **Server-Only Application Identity** (`x-site-key = WEBSITE_11`): Qlex exposes `APP_KEY` in `config.ts`. NURVIA keeps `APP_KEY` strictly server-side in `lib/lexmacasto/headers.ts`.
3. **Same-Origin CSRF Guard**: `validateSameOriginRequest` enforced on all state-changing BFF routes.
4. **Strict Proxy Allowlist**: `apps/web/lib/lexmacasto/proxy-allowlist.ts` blocks path traversal, double-encoding, disallowed HTTP methods, and enforces `STAFF_ROLES` server-side.
5. **Lecture Access Boundary**: `nurvia-lectures-data.ts` is server-only; Lectures 4–12 gated on verified server session.
