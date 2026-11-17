import { NextRequest, NextResponse } from 'next/server';
import { LEXMACASTO_EXTRA_ENDPOINTS } from '@/lib/lexmacasto/contracts';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { getServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

const FETCHTYPE_TO_SEGMENT: Record<string, string> = {
  absolute: 'absolute',
  distinct: 'distinct',
  suggest: 'suggest',
  history: 'history',
};

const ALLOWED_SEEK_QUERY_PARAMS = new Set([
  'query',
  'q',
  'scope',
  'mode',
  'sort',
  'page',
  'skewPage',
  'perPage',
  'skewPerPage',
  'limit',
  'domainId',
  'categoryId',
  'subCategoryId',
  'programId',
  'courseId',
  'subjectId',
]);

export async function GET(request: NextRequest) {
  const fetchtype = (request.nextUrl.searchParams.get('fetchtype') || 'absolute').trim().toLowerCase();
  const segment = FETCHTYPE_TO_SEGMENT[fetchtype];
  if (!segment) {
    return NextResponse.json(
      { success: false, message: `Unsupported seek fetchtype: "${fetchtype}".`, errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const session = await getServerCastoSession();
  // Live probes confirmed /seek/suggest requires authentication; /seek/history is user-scoped.
  if ((segment === 'suggest' || segment === 'history') && !session) {
    return NextResponse.json(
      { success: false, message: 'Authentication is required.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const params = new URLSearchParams();
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key === 'fetchtype') continue;
    if (!ALLOWED_SEEK_QUERY_PARAMS.has(key)) {
      return NextResponse.json(
        { success: false, message: `Unsupported seek parameter: "${key}".`, errorCode: 'VALIDATION_ERROR' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    // Backend /seek/absolute and /seek/distinct expect `query` (also accept `q` alias from callers).
    if (key === 'q' && !request.nextUrl.searchParams.has('query')) {
      params.set('query', value.slice(0, 200));
    } else {
      params.set(key, value.slice(0, 200));
    }
  }

  if ((segment === 'absolute' || segment === 'distinct') && !params.get('query')?.trim()) {
    return NextResponse.json(
      { success: false, message: 'Search query is required.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const qs = params.toString();
  const backendPath = `${LEXMACASTO_EXTRA_ENDPOINTS.SEEK_BASE}/${segment}${qs ? `?${qs}` : ''}`;
  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/seek');

  const result = await lexmaCastoRequest(backendPath, {
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

  return NextResponse.json(result.data ?? { success: true, data: [] }, {
    headers: NO_STORE_HEADERS,
  });
}

export async function DELETE(request: NextRequest) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json({ success: false, message: csrf.reason, errorCode: 'FORBIDDEN' }, { status: 403, headers: NO_STORE_HEADERS });
  }

  const session = await getServerCastoSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Authentication is required.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const fetchtype = (request.nextUrl.searchParams.get('fetchtype') || 'history').trim().toLowerCase();
  if (fetchtype !== 'history') {
    return NextResponse.json(
      { success: false, message: 'Only seek history deletion is supported.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/seek');
  const result = await lexmaCastoRequest(`${LEXMACASTO_EXTRA_ENDPOINTS.SEEK_BASE}/history`, {
    method: 'DELETE',
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

  return NextResponse.json(result.data ?? { success: true, message: 'Search history cleared.' }, {
    headers: NO_STORE_HEADERS,
  });
}
