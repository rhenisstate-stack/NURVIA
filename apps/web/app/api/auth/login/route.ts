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
    return noStoreJson({ success: false, message: csrf.reason }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return noStoreJson({ success: false, message: 'Invalid JSON request body.' }, 400);
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
    return noStoreJson({ success: false, message: 'Email is required.' }, 400);
  }
  if (loginMethod !== 'password' && loginMethod !== 'pin') {
    return noStoreJson({ success: false, message: 'Unsupported login method.' }, 400);
  }
  if (loginMethod === 'password' && !password) {
    return noStoreJson({ success: false, message: 'Password is required.' }, 400);
  }
  if (loginMethod === 'pin' && !pin) {
    return noStoreJson({ success: false, message: 'PIN is required.' }, 400);
  }

  const loginProvider =
    typeof body.LoginProvider === 'string' && body.LoginProvider.trim()
      ? body.LoginProvider.trim()
      : 'email';

  const payload: LexmaCastoLoginPayload = {
    email,
    loginMethod,
    LoginProvider: loginProvider,
    ...(password !== undefined ? { password } : {}),
    ...(pin !== undefined ? { pin } : {}),
    ...(typeof body.challenge === 'string' && body.challenge.trim() ? { challenge: body.challenge.trim() } : {}),
    ...(typeof body.fingerprint === 'string' && body.fingerprint ? { fingerprint: body.fingerprint } : {}),
    ...(typeof body.dashboardName === 'string' && body.dashboardName ? { dashboardName: body.dashboardName } : {}),
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

  const response = NextResponse.json(
    {
      success: true,
      message: result.message,
      data: sanitizedUser,
      redirect_url: redirectUrl,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  setServerCastoSession(response, credentials, sanitizedUser.dashboardName || payload.dashboardName);
  return response;
}
