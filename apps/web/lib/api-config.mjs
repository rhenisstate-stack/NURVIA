/**
 * Fail-closed environment and backend URL resolution for NURVIA.
 * Shared by next.config.mjs, server-side API client, and Node unit tests.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Resolves and validates the remote .NET backend base URL from SKEW_LINE or legacy env vars.
 * Throws explicitly if missing, malformed, or using an unsupported protocol/backend.
 *
 * @param {Record<string, string | undefined>} [env]
 * @param {{ requireHttps?: boolean }} [options]
 * @returns {string}
 */
export function resolveBackendBaseUrl(env = process.env, options = {}) {
  const activeBackend = (env.SKEW_LINE_ACTIVE_BACKEND || '').trim();
  const legacyUrl = (env.NEXT_PUBLIC_API_URL || '').trim();
  const skewLineUrl = (env.SKEW_LINE_DOTNET_BASE_URL || '').trim();

  if (activeBackend && activeBackend !== 'dotnet' && !legacyUrl) {
    throw new Error(
      `Unsupported SKEW_LINE_ACTIVE_BACKEND="${activeBackend}". Expected "dotnet" for remote .NET backend integration.`
    );
  }

  const rawUrl = skewLineUrl || legacyUrl;
  if (!rawUrl || rawUrl.startsWith('<')) {
    throw new Error(
      'NURVIA backend URL is not configured. Set SKEW_LINE_DOTNET_BASE_URL in apps/web/.env.local (or deployment environment variables).'
    );
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      `Invalid NURVIA backend URL format: "${rawUrl}". Expected a valid http:// or https:// URL.`
    );
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(
      `Unsupported NURVIA backend protocol "${parsed.protocol}". Only http: and https: are permitted.`
    );
  }

  if (options.requireHttps && parsed.protocol !== 'https:') {
    throw new Error(
      'HTTPS is required for production authentication-bearing traffic. Configure an https:// reverse proxy for SKEW_LINE_DOTNET_BASE_URL.'
    );
  }

  return parsed.toString().replace(/\/+$/, '');
}

/**
 * Checks whether the configured backend URL uses HTTPS (required for production auth cookies).
 *
 * @param {string} baseUrl
 * @returns {boolean}
 */
export function isHttpsBackendUrl(baseUrl) {
  try {
    return new URL(baseUrl).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns non-secret SKEW_LINE application metadata for server-side diagnostics.
 * Never exposes private keys or credentials to client bundles.
 *
 * @param {Record<string, string | undefined>} [env]
 */
export function getSkewLineServerConfig(env = process.env) {
  return {
    appName: (env.SKEW_LINE_APP_NAME || 'Nurvia').trim(),
    appTitle: (env.SKEW_LINE_APP_TITLE || 'Nurvia').trim(),
    appDomain: (env.SKEW_LINE_APP_DOMAIN || '').trim(),
    appKeyConfigured: Boolean((env.SKEW_LINE_APP_KEY || '').trim()),
    activeBackend: (env.SKEW_LINE_ACTIVE_BACKEND || 'dotnet').trim(),
    backendBaseUrl: resolveBackendBaseUrl(env),
  };
}
