/**
 * Fail-closed environment, backend URL, and application identity resolution for NURVIA.
 * Shared by next.config.mjs, server-side API client, and Node unit tests.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export class BackendConfigurationError extends Error {
  /**
   * @param {string} message
   * @param {string} code
   */
  constructor(message, code = 'CONFIGURATION_ERROR') {
    super(message);
    this.name = 'BackendConfigurationError';
    this.code = code;
  }
}

/**
 * Resolves and validates the remote .NET / LexmaCasto backend base URL from SKEW_LINE or legacy env vars.
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
    throw new BackendConfigurationError(
      `Unsupported SKEW_LINE_ACTIVE_BACKEND="${activeBackend}". Expected "dotnet" for remote .NET backend integration.`,
      'UNSUPPORTED_BACKEND'
    );
  }

  const rawUrl = skewLineUrl || legacyUrl;
  if (!rawUrl || rawUrl.startsWith('<')) {
    throw new BackendConfigurationError(
      'NURVIA backend URL is not configured. Set SKEW_LINE_DOTNET_BASE_URL in apps/web/.env.local (or deployment environment variables).',
      'MISSING_BACKEND_URL'
    );
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new BackendConfigurationError(
      `Invalid NURVIA backend URL format: "${rawUrl}". Expected a valid http:// or https:// URL.`,
      'INVALID_BACKEND_URL'
    );
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new BackendConfigurationError(
      `Unsupported NURVIA backend protocol "${parsed.protocol}". Only http: and https: are permitted.`,
      'INVALID_BACKEND_PROTOCOL'
    );
  }

  const isProduction = env.NODE_ENV === 'production';
  const requireHttps = options.requireHttps ?? isProduction;

  if (requireHttps && parsed.protocol !== 'https:') {
    throw new BackendConfigurationError(
      'HTTPS is required for production authentication-bearing traffic. Configure an https:// reverse proxy for SKEW_LINE_DOTNET_BASE_URL.',
      'INSECURE_PRODUCTION_ORIGIN'
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
 * Resolves and validates NURVIA's dedicated server-side application identity.
 * Never falls back to another application's key or domain (e.g., Qlex-Nursing / WEBSITE_1).
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {{ appKey: string; appDomain: string; appName: string; appTitle: string }}
 */
export function resolveApplicationIdentity(env = process.env) {
  const appKey = (env.SKEW_LINE_APP_KEY || '').trim();
  const appDomain = (env.SKEW_LINE_APP_DOMAIN || '').trim();
  const appName = (env.SKEW_LINE_APP_NAME || 'Nurvia').trim();
  const appTitle = (env.SKEW_LINE_APP_TITLE || 'Nurvia').trim();

  if (!appKey || appKey.startsWith('<')) {
    throw new BackendConfigurationError(
      'NURVIA application key (SKEW_LINE_APP_KEY) is not provisioned. Configure a dedicated NURVIA application key from the backend owner.',
      'MISSING_APP_KEY'
    );
  }

  if (!appDomain || appDomain.startsWith('<')) {
    throw new BackendConfigurationError(
      'NURVIA application domain (SKEW_LINE_APP_DOMAIN) is not configured. Configure the officially provisioned NURVIA domain.',
      'MISSING_APP_DOMAIN'
    );
  }

  // Reject control chars / CRLF (header injection) in appKey while preserving internal spaces;
  // reject any whitespace or control chars in appDomain.
  if (/[\r\n\0\x01-\x1F\x7F]/.test(appKey) || /[\r\n\s\0\x01-\x1F\x7F]/.test(appDomain)) {
    throw new BackendConfigurationError(
      'Invalid characters in NURVIA application identity configuration.',
      'INVALID_APP_IDENTITY'
    );
  }

  try {
    if (appDomain.includes('://')) {
      const parsed = new URL(appDomain);
      if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
    }
  } catch {
    throw new BackendConfigurationError(
      `Invalid SKEW_LINE_APP_DOMAIN format: "${appDomain}".`,
      'INVALID_APP_DOMAIN'
    );
  }

  return {
    appKey,
    appDomain,
    appName,
    appTitle,
  };
}

/**
 * Validates complete server-side backend configuration (origin + application identity).
 *
 * @param {Record<string, string | undefined>} [env]
 * @param {{ requireHttps?: boolean }} [options]
 */
export function validateServerConfiguration(env = process.env, options = {}) {
  const backendBaseUrl = resolveBackendBaseUrl(env, options);
  const identity = resolveApplicationIdentity(env);
  return {
    backendBaseUrl,
    ...identity,
  };
}

/**
 * Returns non-secret SKEW_LINE application metadata for server-side diagnostics.
 * Never exposes private keys or credentials to client bundles.
 *
 * @param {Record<string, string | undefined>} [env]
 */
export function getSkewLineServerConfig(env = process.env) {
  const backendBaseUrl = resolveBackendBaseUrl(env);
  const appDomain = (env.SKEW_LINE_APP_DOMAIN || '').trim();
  const appKey = (env.SKEW_LINE_APP_KEY || '').trim();
  return {
    appName: (env.SKEW_LINE_APP_NAME || 'Nurvia').trim(),
    appTitle: (env.SKEW_LINE_APP_TITLE || 'Nurvia').trim(),
    appDomain,
    appDomainConfigured: Boolean(appDomain && !appDomain.startsWith('<')),
    appKeyConfigured: Boolean(appKey && !appKey.startsWith('<')),
    activeBackend: (env.SKEW_LINE_ACTIVE_BACKEND || 'dotnet').trim(),
    backendBaseUrl,
    isHttps: isHttpsBackendUrl(backendBaseUrl),
  };
}
