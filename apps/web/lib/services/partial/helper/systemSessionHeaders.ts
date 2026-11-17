// ==================================================
// System Session Header Helpers (NURVIA Secure Adapter)
// ==================================================

/**
 * Security deviation (SEC-007): NURVIA stores session credentials exclusively in
 * HttpOnly server-side cookies (nurvia_casto_line, nurvia_casto_badge, nurvia_casto_dashboard).
 * Client-side JS never reads or injects x-casto-line / x-casto-badge headers; Next.js API
 * route handlers attach auth headers server-side via lexmaCastoRequest.
 */
export const renderSystemSessionHeaders = (): Record<string, string> => ({});
