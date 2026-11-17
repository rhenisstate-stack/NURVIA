"use client";

/**
 * Security deviation (SEC-008): NURVIA auth cookies (nurvia_casto_line, nurvia_casto_badge,
 * nurvia_casto_dashboard) are HttpOnly and cleared server-side by POST /api/auth/logout.
 * Client-side JS only clears non-secret device metadata if needed.
 */
export function clearSystemUserSessionCookies() {
  // No-op for HttpOnly auth cookies; handled server-side by /api/auth/logout.
}
