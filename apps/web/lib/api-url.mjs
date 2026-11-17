/**
 * Authoritative same-origin URL builder for NURVIA's frontend API client.
 * Routes dedicated application-owned auth endpoints directly to Next.js Route Handlers
 * and never constructs stale /api/backend/auth/me or /api/backend/auth/csrf paths.
 */

export const DEDICATED_AUTH_ROUTES = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/auth/config-status',
]);

export const DEDICATED_APP_ROUTES = new Set([
  '/api/seek',
  '/api/exams/diy',
  '/api/attempts/history',
  '/api/auth/account/destroy',
  '/api/auth/validate',
]);

export function getApiBase() {
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }
  const serverBase = (process.env.SKEW_LINE_DOTNET_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '')
    .trim()
    .replace(/\/+$/, '');
  return serverBase || '/api/backend';
}

export function buildApiUrl(endpoint) {
  const apiBase = getApiBase();
  if (apiBase === '/api/backend') {
    const pathname = endpoint.split('?')[0];
    if (
      DEDICATED_AUTH_ROUTES.has(pathname) ||
      DEDICATED_APP_ROUTES.has(pathname) ||
      endpoint.startsWith('/api/auth/support/') ||
      endpoint.startsWith('/api/auth/recovery/') ||
      endpoint.startsWith('/api/subscriptions/') ||
      endpoint.startsWith('/api/strata/') ||
      endpoint.startsWith('/api/lectures')
    ) {
      return endpoint;
    }
    return `${apiBase}${endpoint.replace(/^\/api(?=\/)/, '')}`;
  }

  return `${apiBase}${endpoint}`;
}
