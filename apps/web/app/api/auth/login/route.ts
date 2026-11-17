import { NextRequest, NextResponse } from 'next/server';
import type { LexmaCastoLoginPayload, LexmaCastoLoginResponseRaw } from '@/lib/lexmacasto/contracts';
import { LEXMACASTO_AUTH_ENDPOINTS } from '@/lib/lexmacasto/contracts';
import {
  extractCastoCredentialsFromLogin,
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
  sanitizeAuthUser,
} from '@/lib/lexmacasto/client';
import { setServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

function noStoreJson(body: Record<string, unknown>, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return noStoreJson({ success: false, message: csrf.reason, errorCode: 'FORBIDDEN' }, 403);
  }

  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return noStoreJson(
      { success: false, message: 'Unsupported Content-Type. Expected application/json.', errorCode: 'VALIDATION_ERROR' },
      415
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return noStoreJson({ success: false, message: 'Invalid JSON request body.', errorCode: 'VALIDATION_ERROR' }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return noStoreJson({ success: false, message: 'Invalid JSON request body.', errorCode: 'VALIDATION_ERROR' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : undefined;
  const pin = typeof body.pin === 'string' ? body.pin : undefined;
  const loginMethod = typeof body.loginMethod === 'string' && body.loginMethod.trim()
    ? body.loginMethod.trim()
    : pin
      ? 'pin'
      : 'password';

  if (!email) {
    return noStoreJson({ success: false, message: 'Email is required.', errorCode: 'VALIDATION_ERROR' }, 400);
  }
  if (loginMethod !== 'password' && loginMethod !== 'pin') {
    return noStoreJson({ success: false, message: 'Unsupported login method.', errorCode: 'VALIDATION_ERROR' }, 400);
  }
  if (loginMethod === 'password' && !password) {
    return noStoreJson({ success: false, message: 'Password is required.', errorCode: 'VALIDATION_ERROR' }, 400);
  }
  if (loginMethod === 'pin' && (!pin || !pin.trim())) {
    return noStoreJson({ success: false, message: 'PIN is required.', errorCode: 'VALIDATION_ERROR' }, 400);
  }

  const loginProvider =
    typeof body.LoginProvider === 'string' && body.LoginProvider.trim()
      ? body.LoginProvider.trim()
      : 'email';
  const rememberMe = body.rememberMe !== false;

  // Server controls role and dashboardName rather than trusting client-supplied values.
  const payload: LexmaCastoLoginPayload = {
    email,
    loginMethod,
    LoginProvider: loginProvider,
    dashboardName: 'web',
    role: 'Learner',
    ...(loginMethod === 'password' && password !== undefined ? { password } : {}),
    ...(loginMethod === 'pin' && pin !== undefined ? { pin: pin.trim() } : {}),
    ...(typeof body.fingerprint === 'string' && body.fingerprint.trim()
      ? { fingerprint: body.fingerprint.trim().slice(0, 128) }
      : {}),
  };

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/auth/login');
  if (siteMeta.siteIpAddress) {
    payload.ipAddress = siteMeta.siteIpAddress;
  }

  const result = await lexmaCastoRequest<LexmaCastoLoginResponseRaw>(LEXMACASTO_AUTH_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: payload,
    siteMeta,
  });

  if (!result.ok || !result.data) {
    return noStoreJson(
      {
        success: false,
        message: result.message,
        errorCode: result.errorCode,
        errors: result.errors,
      },
      result.status
    );
  }

  const credentials = extractCastoCredentialsFromLogin(result.data);
  const rawUser = result.data.user ?? result.data.data?.user;
  const sanitizedUser = sanitizeAuthUser(rawUser);

  if (!credentials || !sanitizedUser) {
    return noStoreJson(
      {
        success: false,
        message: 'Authentication response was incomplete.',
        errorCode: 'UNEXPECTED_RESPONSE',
      },
      502
    );
  }

  const redirectUrl =
    (typeof result.data.redirect_url === 'string' && result.data.redirect_url) ||
    (typeof result.data.data?.redirect_url === 'string' && result.data.data.redirect_url) ||
    undefined;

  const response = noStoreJson(
    {
      success: true,
      message: result.message,
      data: sanitizedUser,
      redirect_url: redirectUrl,
    },
    result.status
  );

  setServerCastoSession(
    response,
    credentials,
    sanitizedUser.dashboardName || payload.dashboardName,
    process.env.NODE_ENV === 'production',
    rememberMe
  );
  return response;
}
