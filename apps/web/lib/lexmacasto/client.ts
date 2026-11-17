/**
 * Centralized server-side HTTP client for LexmaCasto backend communication.
 * Enforces HTTPS in production, server-only application identity, required site headers,
 * custom Casto authentication headers, timeouts, SSRF guards, and safe error normalization.
 */

import {
  BackendConfigurationError,
  validateServerConfiguration,
} from '@/lib/api-config.mjs';
import {
  buildCastoAuthHeaders,
  buildSiteHeaders,
  sanitizeHeaderValue,
  type CastoSessionCredentials,
  type OptionalSiteMetadata,
} from './headers';
import type {
  LexmaCastoAuthUserRaw,
  LexmaCastoLoginResponseRaw,
  StrataEnvelope,
  StrataRecord,
} from './contracts';

const DEFAULT_TIMEOUT_MS = 20_000;

export type NormalizedBackendErrorCode =
  | 'CONFIGURATION_ERROR'
  | 'MISSING_APP_IDENTITY'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'SESSION_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'CHALLENGE_REQUIRED'
  | 'CHALLENGE_REJECTED'
  | 'CHALLENGE_EXPIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'BACKEND_ERROR'
  | 'UNEXPECTED_RESPONSE';

export interface LexmaCastoResult<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  message: string;
  errorCode?: NormalizedBackendErrorCode;
  errors?: string[];
}

export interface LexmaCastoRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  session?: CastoSessionCredentials | null;
  siteMeta?: OptionalSiteMetadata;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

/**
 * Prevents SSRF and arbitrary URL forwarding: only relative `/api/...` paths are allowed.
 */
export function assertSafeBackendPath(path: string): string {
  if (!path || typeof path !== 'string') {
    throw new Error('Backend path is required.');
  }
  const trimmed = path.trim();
  if (!trimmed.startsWith('/api/') || trimmed.startsWith('//') || trimmed.includes('..')) {
    throw new Error('Invalid backend API path.');
  }
  if (/[\r\n\0]/.test(trimmed)) {
    throw new Error('Invalid characters in backend API path.');
  }
  return trimmed;
}

function mapStatusToErrorCode(status: number): NormalizedBackendErrorCode {
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'BACKEND_ERROR';
  return 'BACKEND_ERROR';
}

export function classifyBackendErrorCode(
  status: number,
  message: string,
  errors?: string[],
  path?: string
): NormalizedBackendErrorCode {
  const combined = [message, ...(errors ?? [])].filter(Boolean).join(' ');
  if (/challenge.*expir/i.test(combined)) {
    return 'CHALLENGE_EXPIRED';
  }
  if (/the challenge field is required|challenge.*required/i.test(combined)) {
    return 'CHALLENGE_REQUIRED';
  }
  if (/deslizar|ultimatum\s+turmoil|challenge.*(reject|invalid|fail|mismatch|unverified)/i.test(combined)) {
    return 'CHALLENGE_REJECTED';
  }
  if (status === 401) {
    if (path && /\/auth\/login(?:$|\?)/i.test(path)) {
      return 'INVALID_CREDENTIALS';
    }
    if (/missing\s+casto|session.*expir|expired/i.test(combined)) {
      return 'SESSION_EXPIRED';
    }
  }
  return mapStatusToErrorCode(status);
}

const SENSITIVE_BACKEND_MESSAGE_PATTERN =
  /at\s+\S+\s+\(|stack\s*trace|sql\s+exception|connection\s+string|108\.61\.9\.189|explicitbackend\.com|SKEW_LINE_APP_KEY|x-site-key|x-casto-line|x-casto-badge|castoline|castobadge|bearer\s+[A-Za-z0-9._-]+/i;

function sanitizeBackendMessage(rawMessage: unknown, status: number): string {
  if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
    if (status === 401) return 'Authentication is required.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'The backend service is temporarily unavailable.';
    return `Request failed (${status}).`;
  }

  const msg = rawMessage.trim();
  if (msg.startsWith('<')) {
    return sanitizeBackendMessage(undefined, status);
  }
  // Strip potential stack traces or internal infrastructure leakage
  const firstLine = msg.split(/\r?\n/)[0].slice(0, 300).trim();
  if (!firstLine || SENSITIVE_BACKEND_MESSAGE_PATTERN.test(firstLine)) {
    return status >= 500
      ? 'The backend service encountered an internal error.'
      : 'Request could not be completed.';
  }
  return firstLine;
}

function extractBackendErrors(rawErrors: unknown, status: number): string[] | undefined {
  if (Array.isArray(rawErrors)) {
    const list = rawErrors
      .filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
      .map((e) => sanitizeBackendMessage(e, status));
    return list.length > 0 ? list : undefined;
  }

  if (rawErrors && typeof rawErrors === 'object') {
    const collected: string[] = [];
    for (const [field, value] of Object.entries(rawErrors as Record<string, unknown>)) {
      const messages = Array.isArray(value)
        ? value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        : typeof value === 'string' && value.trim().length > 0
          ? [value]
          : [];
      for (const msg of messages) {
        const sanitized = sanitizeBackendMessage(msg, status);
        const safeField = field.replace(/[^\w.\-\s]/g, '').trim();
        if (safeField && !sanitized.toLowerCase().includes(safeField.toLowerCase())) {
          collected.push(`${safeField}: ${sanitized}`);
        } else {
          collected.push(sanitized);
        }
      }
    }
    return collected.length > 0 ? collected : undefined;
  }

  return undefined;
}

export function extractSiteMetadataFromRequestHeaders(
  incomingHeaders: Headers,
  pathname?: string
): OptionalSiteMetadata {
  const forwardedFor = incomingHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = incomingHeaders.get('x-real-ip')?.trim();
  const userAgent = incomingHeaders.get('user-agent')?.trim();
  const referer = incomingHeaders.get('referer')?.trim();
  const requestId = incomingHeaders.get('x-request-id')?.trim() || crypto.randomUUID();
  const country = (incomingHeaders.get('cf-ipcountry') || incomingHeaders.get('x-vercel-ip-country'))?.trim();
  const rawCity = incomingHeaders.get('x-vercel-ip-city')?.trim();
  let city = rawCity;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  const location = [city, country].filter(Boolean).join(', ');
  const mobileRaw = incomingHeaders.get('sec-ch-ua-mobile')?.trim();
  const mobile = mobileRaw === '?1' ? 'true' : mobileRaw === '?0' ? 'false' : undefined;

  return {
    sitePath: sanitizeHeaderValue(pathname, 256),
    siteIpAddress: sanitizeHeaderValue(forwardedFor || realIp, 64),
    siteLocation: sanitizeHeaderValue(location || undefined, 128),
    siteCountry: sanitizeHeaderValue(country, 16),
    siteBrowser: sanitizeHeaderValue(userAgent, 256),
    siteReferrer: sanitizeHeaderValue(referer, 256),
    siteMobile: mobile,
    siteTime: new Date().toISOString(),
    siteRequestId: sanitizeHeaderValue(requestId, 64),
  };
}

/**
 * Executes an authenticated or public server-to-server request to the LexmaCasto backend.
 */
export async function lexmaCastoRequest<T = unknown>(
  path: string,
  options: LexmaCastoRequestOptions = {}
): Promise<LexmaCastoResult<T>> {
  let config;
  try {
    config = validateServerConfiguration(process.env);
  } catch (err) {
    if (err instanceof BackendConfigurationError) {
      const isIdentity =
        err.code === 'MISSING_APP_KEY' ||
        err.code === 'MISSING_APP_DOMAIN' ||
        err.code === 'INVALID_APP_IDENTITY' ||
        err.code === 'INVALID_APP_DOMAIN';
      return {
        ok: false,
        status: 503,
        message: err.message,
        errorCode: isIdentity ? 'MISSING_APP_IDENTITY' : 'CONFIGURATION_ERROR',
      };
    }
    return {
      ok: false,
      status: 503,
      message: 'Backend configuration is invalid.',
      errorCode: 'CONFIGURATION_ERROR',
    };
  }

  let safePath: string;
  try {
    safePath = assertSafeBackendPath(path);
  } catch (err) {
    return {
      ok: false,
      status: 400,
      message: err instanceof Error ? err.message : 'Invalid API path.',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  const targetUrl = `${config.backendBaseUrl}${safePath}`;
  const method = options.method || 'GET';
  const siteHeaders = buildSiteHeaders(config, options.siteMeta);
  const authHeaders = buildCastoAuthHeaders(options.session);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers || {}),
    // Server-owned privileged headers ALWAYS override any caller-supplied headers
    ...siteHeaders,
    ...authHeaders,
  };

  let bodyString: string | undefined;
  if (options.body !== undefined && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    bodyString = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(new Error('Backend request timed out')), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body: bodyString,
      signal: controller.signal,
      redirect: 'manual',
      cache: 'no-store',
    });

    // Treat 3xx redirects (e.g. /web/restoration/lost for unsupported routes) as non-200 failure
    if (response.status >= 300 && response.status < 400) {
      return {
        ok: false,
        status: response.status === 302 ? 404 : response.status,
        message: 'The requested backend endpoint is unavailable or redirected.',
        errorCode: 'NOT_FOUND',
      };
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const rawText = await response.text();
    const trimmed = rawText.trim();
    if (!trimmed) {
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          message: 'OK',
        };
      }
      return {
        ok: false,
        status: response.status,
        message: sanitizeBackendMessage(undefined, response.status),
        errorCode: mapStatusToErrorCode(response.status),
      };
    }

    const isHtml = contentType.includes('text/html') || trimmed.startsWith('<');
    if (isHtml) {
      return {
        ok: false,
        status: response.ok ? 502 : response.status,
        message: response.ok
          ? 'Unexpected non-JSON response from backend.'
          : sanitizeBackendMessage(undefined, response.status),
        errorCode: response.ok ? 'UNEXPECTED_RESPONSE' : mapStatusToErrorCode(response.status),
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');
      return {
        ok: false,
        status: response.ok ? 502 : response.status,
        message: response.ok
          ? 'Unexpected non-JSON response from backend.'
          : looksLikeJson
            ? sanitizeBackendMessage(undefined, response.status)
            : sanitizeBackendMessage(trimmed, response.status),
        errorCode: response.ok ? 'UNEXPECTED_RESPONSE' : mapStatusToErrorCode(response.status),
      };
    }

    const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
    const nestedData =
      record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : undefined;
    const rawMsg =
      record.message ??
      record.Message ??
      record.error ??
      record.Error ??
      record.detail ??
      record.title ??
      nestedData?.message ??
      nestedData?.error;

    if (!response.ok || record.success === false) {
      const errors = extractBackendErrors(record.errors ?? record.Errors, response.status);
      const isGenericProblemTitle =
        typeof rawMsg === 'string' && /^one or more validation errors occurred\.?$/i.test(rawMsg.trim());
      const resolvedMessage =
        errors && errors.length > 0 && (!rawMsg || isGenericProblemTitle)
          ? errors[0]
          : sanitizeBackendMessage(rawMsg, response.status);

      const resolvedStatus = response.ok ? 400 : response.status;
      return {
        ok: false,
        status: resolvedStatus,
        message: resolvedMessage,
        errorCode: classifyBackendErrorCode(resolvedStatus, resolvedMessage, errors, safePath),
        errors,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsed as T,
      message: typeof rawMsg === 'string' ? rawMsg : 'OK',
    };
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === 'AbortError' || /timed out/i.test(err.message));
    return {
      ok: false,
      status: isTimeout ? 504 : 502,
      message: isTimeout
        ? 'The backend service took too long to respond.'
        : 'Unable to reach the backend service.',
      errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extracts `castoLine` and `castoBadge` from LexmaCasto login response without exposing them to callers.
 */
export function extractCastoCredentialsFromLogin(
  payload: LexmaCastoLoginResponseRaw | undefined
): CastoSessionCredentials | null {
  if (!payload || typeof payload !== 'object') return null;
  const userObj = payload.user ?? payload.data?.user;
  const rawLine =
    (typeof userObj?.castoLine === 'string' && userObj.castoLine.trim()) ||
    (typeof payload.data?.castoLine === 'string' && payload.data.castoLine.trim()) ||
    (typeof payload.castoLine === 'string' && payload.castoLine.trim()) ||
    '';
  const rawBadge =
    (typeof userObj?.castoBadge === 'string' && userObj.castoBadge.trim()) ||
    (typeof payload.data?.castoBadge === 'string' && payload.data.castoBadge.trim()) ||
    (typeof payload.castoBadge === 'string' && payload.castoBadge.trim()) ||
    '';

  if (/[\r\n\0\x01-\x1F\x7F]/.test(rawLine) || /[\r\n\0\x01-\x1F\x7F]/.test(rawBadge)) {
    return null;
  }

  const castoLine = sanitizeHeaderValue(rawLine, 2048);
  const castoBadge = sanitizeHeaderValue(rawBadge, 2048);

  if (!castoLine || !castoBadge) return null;
  return { castoLine, castoBadge };
}

function sanitizeAvatarUrl(rawUrl: unknown): string | undefined {
  if (typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Reject malformed or unsafe URL schemes (e.g. javascript:, data:)
  }
  return undefined;
}

/**
 * Maps a raw LexmaCasto user object to NURVIA's sanitized `AuthUserDto` (stripping castoLine/castoBadge).
 */
export function sanitizeAuthUser(rawUser: LexmaCastoAuthUserRaw | undefined | null) {
  if (!rawUser || typeof rawUser !== 'object') return null;

  const id = String(rawUser.id ?? rawUser.userId ?? rawUser.email ?? '');
  const email = typeof rawUser.email === 'string' ? rawUser.email : '';
  const name =
    (typeof rawUser.name === 'string' && rawUser.name) ||
    (typeof rawUser.fullName === 'string' && rawUser.fullName) ||
    (typeof rawUser.username === 'string' && rawUser.username) ||
    email;
  const role =
    (typeof rawUser.role === 'string' && rawUser.role) ||
    (Array.isArray(rawUser.roles) && typeof rawUser.roles[0] === 'string' && rawUser.roles[0]) ||
    'Learner';

  if (!email && !id) return null;

  const profilePicture =
    rawUser.profile && typeof rawUser.profile === 'object'
      ? rawUser.profile.profilePicture
      : undefined;

  return {
    id,
    name,
    email,
    role,
    dashboardName: typeof rawUser.dashboardName === 'string' ? rawUser.dashboardName : undefined,
    avatarUrl: sanitizeAvatarUrl(rawUser.avatarUrl ?? profilePicture ?? rawUser.profilePicture),
  };
}

/**
 * Normalizes a LexmaCasto Academic Strata envelope (`{ success, message, data: { items, skewPage, ... } }`).
 */
export function normalizeStrataEnvelope<T extends StrataRecord = StrataRecord>(
  raw: unknown
): StrataEnvelope<T> | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const dataObj = (obj.data && typeof obj.data === 'object' ? obj.data : obj) as Record<string, unknown>;

  const items = Array.isArray(dataObj.items) ? (dataObj.items as T[]) : [];
  const skewPage = typeof dataObj.skewPage === 'number' ? dataObj.skewPage : 1;
  const skewPerPage = typeof dataObj.skewPerPage === 'number' ? dataObj.skewPerPage : items.length || 20;
  const skewTotal = typeof dataObj.skewTotal === 'number' ? dataObj.skewTotal : items.length;
  const skewTotalPages = typeof dataObj.skewTotalPages === 'number' ? dataObj.skewTotalPages : 1;

  return {
    success: obj.success !== false,
    message: typeof obj.message === 'string' ? obj.message : undefined,
    data: {
      items,
      skewPage,
      skewPerPage,
      skewTotal,
      skewTotalPages,
    },
  };
}
