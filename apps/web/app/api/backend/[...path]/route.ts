import { NextRequest, NextResponse } from 'next/server';
import {
  buildCurrentUserEndpointPath,
  type LexmaCastoAuthUserRaw,
} from '@/lib/lexmacasto/contracts';
import {
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
  sanitizeAuthUser,
} from '@/lib/lexmacasto/client';
import {
  matchProxyRoute,
  STAFF_ROLES,
  type HttpMethod,
} from '@/lib/lexmacasto/proxy-allowlist';
import { getServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
};

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  method: HttpMethod
) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json({ success: false, message: csrf.reason }, { status: 403, headers: NO_STORE_HEADERS });
  }

  const { path } = await context.params;
  const match = matchProxyRoute(method, path);
  if (!match.allowed) {
    return NextResponse.json(
      { success: false, message: match.reason },
      { status: match.status, headers: NO_STORE_HEADERS }
    );
  }

  const { rule, normalizedPath } = match;
  const session = await getServerCastoSession();

  if ((rule.auth === 'authenticated' || rule.auth === 'staff') && !session) {
    return NextResponse.json(
      { success: false, message: 'Authentication is required.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, `/api/backend/${normalizedPath}`);

  if (rule.auth === 'staff' && session) {
    const userRes = await lexmaCastoRequest<{
      user?: LexmaCastoAuthUserRaw;
      data?: LexmaCastoAuthUserRaw | { user?: LexmaCastoAuthUserRaw };
    } & LexmaCastoAuthUserRaw>(buildCurrentUserEndpointPath(), {
      method: 'GET',
      session,
      siteMeta,
    });
    const rawUser =
      userRes.data?.user ??
      (userRes.data?.data && typeof userRes.data.data === 'object'
        ? ('user' in userRes.data.data ? userRes.data.data.user : (userRes.data.data as LexmaCastoAuthUserRaw))
        : undefined) ??
      userRes.data;
    const verifiedUser = sanitizeAuthUser(rawUser as LexmaCastoAuthUserRaw);
    if (!userRes.ok || !verifiedUser) {
      return NextResponse.json(
        { success: false, message: 'Unable to verify staff session.', errorCode: 'UNAUTHORIZED' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }
    if (!STAFF_ROLES.has(verifiedUser.role.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions for this operation.', errorCode: 'FORBIDDEN' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }
  }

  let body: unknown = undefined;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const declaredLength = Number(request.headers.get('content-length') || '0');
    if (Number.isFinite(declaredLength) && declaredLength > rule.maxBodyBytes) {
      return NextResponse.json(
        { success: false, message: 'Request body exceeds maximum allowed size.' },
        { status: 413, headers: NO_STORE_HEADERS }
      );
    }

    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('application/json')) {
      const text = await request.text();
      if (Buffer.byteLength(text, 'utf8') > rule.maxBodyBytes) {
        return NextResponse.json(
          { success: false, message: 'Request body exceeds maximum allowed size.' },
          { status: 413, headers: NO_STORE_HEADERS }
        );
      }
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          return NextResponse.json(
            { success: false, message: 'Invalid JSON request body.' },
            { status: 400, headers: NO_STORE_HEADERS }
          );
        }
      }
    } else if (rule.allowMultipart && contentType.includes('multipart/form-data')) {
      // Multipart avatar upload is not JSON-serializable through lexmaCastoRequest JSON path;
      // reject until backend multipart contract is verified.
      return NextResponse.json(
        { success: false, message: 'Multipart upload is not supported on this backend contract.' },
        { status: 415, headers: NO_STORE_HEADERS }
      );
    } else if (declaredLength > 0) {
      return NextResponse.json(
        { success: false, message: 'Unsupported Content-Type. Expected application/json.' },
        { status: 415, headers: NO_STORE_HEADERS }
      );
    }
  }

  const search = request.nextUrl.search || '';
  const targetPath = `/api/${normalizedPath}${search}`;

  const result = await lexmaCastoRequest(targetPath, {
    method,
    body,
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

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context, 'GET');
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context, 'POST');
}
export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context, 'PUT');
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context, 'PATCH');
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context, 'DELETE');
}
