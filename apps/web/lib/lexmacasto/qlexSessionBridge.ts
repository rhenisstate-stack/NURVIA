import "server-only";
import { cookies } from "next/headers";

export const NURVIA_COOKIE_LINE = "nurvia_casto_line";
export const NURVIA_COOKIE_BADGE = "nurvia_casto_badge";
export const NURVIA_COOKIE_DASHBOARD = "nurvia_casto_dashboard";

/**
 * Reads NURVIA's HttpOnly session cookies server-side and returns
 * the upstream x-casto-line / x-casto-badge headers for LexmaCasto calls.
 */
export async function getNurviaCastoSessionHeaders(): Promise<Record<string, string>> {
  const store = await cookies();
  const line = store.get(NURVIA_COOKIE_LINE)?.value?.trim();
  const badge = store.get(NURVIA_COOKIE_BADGE)?.value?.trim();
  const headers: Record<string, string> = {};
  if (line) headers["x-casto-line"] = line;
  if (badge) headers["x-casto-badge"] = badge;
  return headers;
}
