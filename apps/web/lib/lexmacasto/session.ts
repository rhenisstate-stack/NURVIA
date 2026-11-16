/**
 * Server-managed HttpOnly cookie session & same-origin CSRF guard for NURVIA.
 * Backend session credentials (`x-casto-line`, `x-casto-badge`) are stored ONLY in
 * HttpOnly cookies and never exposed to browser JavaScript.
 */

import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import type { CastoSessionCredentials } from './headers';

export const CASTO_LINE_COOKIE = 'nurvia_casto_line';
export const CASTO_BADGE_COOKIE = 'nurvia_casto_badge';
export const CASTO_DASHBOARD_COOKIE = 'nurvia_casto_dashboard';

const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function getSessionCookieOptions(isProduction = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DEFAULT_SESSION_MAX_AGE_SECONDS,
  };
}

export function getClearedCookieOptions(isProduction = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  };
}

/**
 * Reads server-managed HttpOnly Casto session credentials from the incoming request cookies.
 */
export async function getServerCastoSession(): Promise<CastoSessionCredentials | null> {
  const cookieStore = await cookies();
  const castoLine = cookieStore.get(CASTO_LINE_COOKIE)?.value?.trim();
  const castoBadge = cookieStore.get(CASTO_BADGE_COOKIE)?.value?.trim();

  if (!castoLine || !castoBadge) {
    return null;
  }

  return { castoLine, castoBadge };
}

export async function getServerDashboardHint(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CASTO_DASHBOARD_COOKIE)?.value?.trim();
  return value || undefined;
}

/**
 * Attaches HttpOnly Casto session cookies to a NextResponse.
 */
export function setServerCastoSession(
  response: NextResponse,
  credentials: CastoSessionCredentials,
  dashboardName?: string,
  isProduction = process.env.NODE_ENV === 'production'
): void {
  const opts = getSessionCookieOptions(isProduction);
  response.cookies.set(CASTO_LINE_COOKIE, credentials.castoLine, opts);
  response.cookies.set(CASTO_BADGE_COOKIE, credentials.castoBadge, opts);
  if (dashboardName) {
    response.cookies.set(CASTO_DASHBOARD_COOKIE, dashboardName, opts);
  }
}

/**
 * Expires/clears all Casto session cookies on a NextResponse.
 */
export function clearServerCastoSession(
  response: NextResponse,
  isProduction = process.env.NODE_ENV === 'production'
): void {
  const opts = getClearedCookieOptions(isProduction);
  response.cookies.set(CASTO_LINE_COOKIE, '', opts);
  response.cookies.set(CASTO_BADGE_COOKIE, '', opts);
  response.cookies.set(CASTO_DASHBOARD_COOKIE, '', opts);
}

/**
 * Validates same-origin CSRF protection for cookie-authenticated state-changing requests.
 * Rejects cross-site browser requests without requiring a backend /csrf endpoint.
 */
export function validateSameOriginRequest(request: NextRequest): { ok: true } | { ok: false; reason: string } {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { ok: true };
  }

  const secFetchSite = request.headers.get('sec-fetch-site')?.toLowerCase();
  if (secFetchSite === 'cross-site') {
    return { ok: false, reason: 'Cross-site state-changing request rejected.' };
  }

  const expectedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== expectedHost) {
        return { ok: false, reason: 'Request origin mismatch.' };
      }
    } catch {
      return { ok: false, reason: 'Invalid request origin header.' };
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== expectedHost) {
        return { ok: false, reason: 'Request referer mismatch.' };
      }
    } catch {
      return { ok: false, reason: 'Invalid request referer header.' };
    }
  }

  return { ok: true };
}
