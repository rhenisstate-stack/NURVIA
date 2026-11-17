import { NextRequest, NextResponse } from 'next/server';
import {
  buildCurrentUserEndpointPath,
  LEXMACASTO_AUTH_ENDPOINTS,
  type LexmaCastoAuthUserRaw,
} from '@/lib/lexmacasto/contracts';
import {
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
  sanitizeAuthUser,
} from '@/lib/lexmacasto/client';
import {
  clearServerCastoSession,
  getServerCastoSession,
  validateSameOriginRequest,
} from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json(
      { success: false, message: csrf.reason, errorCode: 'FORBIDDEN' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const session = await getServerCastoSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Authentication is required.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { success: false, message: 'Unsupported Content-Type. Expected application/json.', errorCode: 'VALIDATION_ERROR' },
      { status: 415, headers: NO_STORE_HEADERS }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body.', errorCode: 'VALIDATION_ERROR' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON request body.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (!reason) {
    return NextResponse.json(
      { success: false, message: 'Account deletion reason is required.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/auth/account/destroy');

  // Verify the authenticated caller's own identity server-side rather than trusting client-supplied guidId/email.
  const currentRes = await lexmaCastoRequest<{
    user?: LexmaCastoAuthUserRaw & { guidId?: string };
    data?: (LexmaCastoAuthUserRaw & { guidId?: string }) | { user?: LexmaCastoAuthUserRaw & { guidId?: string } };
  } & LexmaCastoAuthUserRaw & { guidId?: string }>(buildCurrentUserEndpointPath(), {
    method: 'GET',
    session,
    siteMeta,
  });

  const dataNested =
    currentRes.data?.data && typeof currentRes.data.data === 'object'
      ? ('user' in currentRes.data.data ? currentRes.data.data.user : currentRes.data.data)
      : undefined;
  const rawUser = (currentRes.data?.user ?? dataNested ?? currentRes.data) as
    | (LexmaCastoAuthUserRaw & { guidId?: string })
    | undefined;
  const verifiedUser = sanitizeAuthUser(rawUser);
  const verifiedGuidId =
    (typeof rawUser?.guidId === 'string' && rawUser.guidId.trim()) || verifiedUser?.id || '';

  if (!currentRes.ok || !verifiedUser || !verifiedGuidId) {
    return NextResponse.json(
      { success: false, message: 'Unable to verify authenticated account.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const destroyRes = await lexmaCastoRequest(LEXMACASTO_AUTH_ENDPOINTS.ACCOUNT_DESTROY, {
    method: 'POST',
    body: {
      guidId: verifiedGuidId,
      email: verifiedUser.email,
      reason: reason.slice(0, 500),
    },
    session,
    siteMeta,
  });

  if (!destroyRes.ok) {
    return NextResponse.json(
      {
        success: false,
        message: destroyRes.message,
        errorCode: destroyRes.errorCode,
        errors: destroyRes.errors,
      },
      { status: destroyRes.status, headers: NO_STORE_HEADERS }
    );
  }

  const response = NextResponse.json(
    destroyRes.data ?? { success: true, message: 'Account deleted.' },
    { status: destroyRes.status, headers: NO_STORE_HEADERS }
  );
  clearServerCastoSession(response);
  return response;
}
