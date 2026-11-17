import { NextRequest, NextResponse } from 'next/server';
import { LEXMACASTO_AUTH_ENDPOINTS } from '@/lib/lexmacasto/contracts';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { getServerCastoSession } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function GET(request: NextRequest) {
  const token = (request.nextUrl.searchParams.get('token') || '').trim();
  const context = (request.nextUrl.searchParams.get('context') || '').trim();

  if (!token || !context) {
    return NextResponse.json(
      { success: false, message: 'Both token and context query parameters are required.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const params = new URLSearchParams({
    token: token.slice(0, 512),
    context: context.slice(0, 128),
  });

  const session = await getServerCastoSession();
  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/auth/validate');

  const result = await lexmaCastoRequest(`${LEXMACASTO_AUTH_ENDPOINTS.SUPPORT_VALIDATE}?${params.toString()}`, {
    method: 'GET',
    session,
    siteMeta,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        message: result.message,
        errorCode: result.errorCode,
        errors: result.errors,
      },
      { status: result.status, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(result.data ?? { success: true, message: result.message }, {
    headers: NO_STORE_HEADERS,
  });
}
