import type { ApiResponse } from './api-types';

const SENSITIVE_OR_INTERNAL_PATTERN =
  /at\s+\S+\s+\(|stack\s*trace|sql\s+exception|connection\s+string|108\.61\.9\.189|skew_line_|x-(?:site|casto)-|DNS_HOSTNAME_RESOLVED_PRIVATE|X-Vercel-Error/i;

function formatHttpErrorMessage(status: number, kind?: 'html' | 'text' | 'malformed'): string {
  if (status === 401) return 'Authentication is required.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested service endpoint was not found.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The server encountered an error. Please try again later.';
  if (kind === 'malformed' || kind === 'html') {
    return status >= 200 && status < 300
      ? 'Received an unexpected response from the server.'
      : `Request failed (${status}).`;
  }
  return `Request failed (${status}).`;
}

function sanitizePlainTextMessage(raw: string, status: number): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('<') || SENSITIVE_OR_INTERNAL_PATTERN.test(trimmed)) {
    return formatHttpErrorMessage(status, 'text');
  }
  const firstLine = trimmed.split(/\r?\n/)[0].slice(0, 240).trim();
  if (!firstLine || /^the page could not be found$/i.test(firstLine)) {
    return formatHttpErrorMessage(status, 'text');
  }
  return firstLine;
}

/**
 * Safely parses an HTTP Response into an ApiResponse<T> without assuming every response is JSON.
 * Handles empty bodies, HTML/plain-text framework errors, malformed JSON, and non-object payloads.
 */
export async function parseApiResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const raw = await res.text();
  const trimmed = raw.trim();

  if (!trimmed) {
    if (res.ok) {
      return { success: true, message: '', statusCode: res.status } as ApiResponse<T>;
    }
    return {
      success: false,
      message: formatHttpErrorMessage(res.status),
      statusCode: res.status,
    };
  }

  const isHtml = contentType.includes('text/html') || trimmed.startsWith('<');
  if (isHtml) {
    return {
      success: false,
      message: formatHttpErrorMessage(res.status, 'html'),
      statusCode: res.status,
    };
  }

  const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  const isPlainText = contentType.includes('text/plain') && !looksLikeJson;
  if (isPlainText) {
    return {
      success: false,
      message: res.ok
        ? 'Received an unexpected plain-text response from the server.'
        : sanitizePlainTextMessage(trimmed, res.status),
      statusCode: res.status,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      success: false,
      message: formatHttpErrorMessage(res.status, 'malformed'),
      statusCode: res.status,
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      success: false,
      message: formatHttpErrorMessage(res.status, 'malformed'),
      statusCode: res.status,
    };
  }

  const json = parsed as ApiResponse<T>;
  if (!res.ok && json.success) {
    return {
      success: false,
      message: formatHttpErrorMessage(res.status),
      statusCode: res.status,
    };
  }

  const effectiveSuccess = res.ok ? json.success !== false : false;
  const normalizedMessage =
    !effectiveSuccess &&
    (!json.message || json.message === 'Operation failed') &&
    Array.isArray(json.errors) &&
    json.errors.length > 0
      ? json.errors[0]
      : json.message;

  return {
    ...json,
    success: effectiveSuccess,
    message: normalizedMessage,
    statusCode: res.status,
  };
}
