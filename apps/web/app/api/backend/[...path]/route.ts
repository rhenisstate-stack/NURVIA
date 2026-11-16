import { NextRequest, NextResponse } from 'next/server';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { getServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json({ success: false, message: csrf.reason }, { status: 403 });
  }

  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json({ success: false, message: 'Invalid backend path.' }, { status: 400 });
  }

  // Reject path traversal or unsupported auth/csrf/refresh assumptions
  const joined = path.join('/');
  if (joined.includes('..') || /^auth\/(csrf|refresh)$/i.test(joined)) {
    return NextResponse.json(
      { success: false, message: 'Unsupported backend endpoint.' },
      { status: 404 }
    );
  }

  const search = request.nextUrl.search || '';
  const targetPath = `/api/${joined}${search}`;
  const session = await getServerCastoSession();
  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, `/api/backend/${joined}`);

  let body: unknown = undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const text = await request.text();
        if (text) {
          body = JSON.parse(text);
        }
      } catch {
        return NextResponse.json({ success: false, message: 'Invalid JSON request body.' }, { status: 400 });
      }
    }
  }

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
      { status: result.status }
    );
  }

  return NextResponse.json(result.data ?? { success: true, message: result.message });
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
