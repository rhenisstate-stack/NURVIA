import { NextRequest, NextResponse } from 'next/server';
import {
  buildSupportEndpointPath,
  isSupportResourceKey,
  type StrataFetchType,
} from '@/lib/lexmacasto/contracts';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { getServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
};

const VALID_FETCHTYPES = new Set(['absolute', 'distinct', 'relative', 'current', 'discrete', 'nominal', 'live']);

async function handleSupportProxy(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
  action: 'list' | 'store' | 'update' | 'delete',
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
) {
  if (method !== 'GET') {
    const csrf = validateSameOriginRequest(request);
    if (!csrf.ok) {
      return NextResponse.json({ success: false, message: csrf.reason }, { status: 403, headers: NO_STORE_HEADERS });
    }
  }

  const { resource } = await context.params;
  if (!isSupportResourceKey(resource)) {
    return NextResponse.json(
      { success: false, message: `Unsupported support resource "${resource}".`, errorCode: 'NOT_FOUND' },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  const session = await getServerCastoSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Authentication is required.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const rawFetchType = request.nextUrl.searchParams.get('fetchtype') || 'relative';
  const fetchtype = (VALID_FETCHTYPES.has(rawFetchType) ? rawFetchType : 'relative') as StrataFetchType | 'discrete' | 'nominal';

  const queryParams: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== 'fetchtype') {
      queryParams[key] = value;
    }
  });

  let body: unknown = undefined;
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    const text = await request.text();
    if (text) {
      if (Buffer.byteLength(text, 'utf8') > 131_072) {
        return NextResponse.json(
          { success: false, message: 'Request body exceeds maximum allowed size.' },
          { status: 413, headers: NO_STORE_HEADERS }
        );
      }
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { success: false, message: 'Invalid JSON request body.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }
  }

  const targetPath = buildSupportEndpointPath(resource, action, fetchtype, queryParams);
  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, `/api/auth/support/${resource}`);

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

  return NextResponse.json(
    {
      success: true,
      message: result.message || 'Support request completed.',
      data: result.data,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return handleSupportProxy(request, context, 'list', 'GET');
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return handleSupportProxy(request, context, 'store', 'POST');
}

export async function PUT(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return handleSupportProxy(request, context, 'update', 'PUT');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return handleSupportProxy(request, context, 'delete', 'DELETE');
}
