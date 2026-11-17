import { NextRequest, NextResponse } from 'next/server';
import { LEXMACASTO_EXTRA_ENDPOINTS } from '@/lib/lexmacasto/contracts';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { validateSameOriginRequest } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
};

export async function POST(request: NextRequest) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json({ success: false, message: csrf.reason }, { status: 403, headers: NO_STORE_HEADERS });
  }

  let body: { email?: string; recoveryMethod?: string; channel?: string } | null = null;
  try {
    body = (await request.json()) as { email?: string; recoveryMethod?: string; channel?: string };
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request body.' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const email = (body?.email || '').trim();
  if (!email) {
    return NextResponse.json(
      { success: false, message: 'Email address is required.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/auth/recovery/password');
  const result = await lexmaCastoRequest(LEXMACASTO_EXTRA_ENDPOINTS.RECOVERY_PASSWORD, {
    method: 'POST',
    body: {
      email,
      recoveryMethod: body?.recoveryMethod || 'email',
      channel: body?.channel || 'password',
    },
    siteMeta,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        message: result.message || 'Unable to process password recovery request.',
        errorCode: result.errorCode,
        errors: result.errors,
      },
      { status: result.status, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: result.message || 'If an account matches that email, recovery instructions have been sent.',
      data: result.data,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
