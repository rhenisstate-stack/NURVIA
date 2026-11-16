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

export async function POST(request: NextRequest) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json({ success: false, message: csrf.reason }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request body.' }, { status: 400 });
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
    return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
  }
  if (loginMethod === 'password' && !password) {
    return NextResponse.json({ success: false, message: 'Password is required.' }, { status: 400 });
  }
  if (loginMethod === 'pin' && !pin) {
    return NextResponse.json({ success: false, message: 'PIN is required.' }, { status: 400 });
  }

  const payload: LexmaCastoLoginPayload = {
    email,
    loginMethod,
    ...(password !== undefined ? { password } : {}),
    ...(pin !== undefined ? { pin } : {}),
    ...(typeof body.LoginProvider === 'string' && body.LoginProvider ? { LoginProvider: body.LoginProvider } : {}),
    ...(typeof body.challenge === 'string' && body.challenge ? { challenge: body.challenge } : {}),
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
    return NextResponse.json(
      {
        success: false,
        message: result.message,
        errorCode: result.errorCode,
        errors: result.errors,
      },
      { status: result.status }
    );
  }

  const credentials = extractCastoCredentialsFromLogin(result.data);
  const rawUser = result.data.user ?? result.data.data?.user;
  const sanitizedUser = sanitizeAuthUser(rawUser);

  if (!credentials || !sanitizedUser) {
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication response was incomplete.',
        errorCode: 'UNEXPECTED_RESPONSE',
      },
      { status: 502 }
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
