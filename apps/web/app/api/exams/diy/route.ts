import { NextRequest, NextResponse } from 'next/server';
import { LEXMACASTO_EXTRA_ENDPOINTS } from '@/lib/lexmacasto/contracts';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { getServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const MAX_DIY_BODY_BYTES = 65_536;

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
      { success: false, message: 'Authentication is required to create a custom practice exam.', errorCode: 'UNAUTHORIZED' },
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

  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_DIY_BODY_BYTES) {
    return NextResponse.json(
      { success: false, message: 'Request body exceeds maximum allowed size.', errorCode: 'VALIDATION_ERROR' },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(text) as unknown;
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

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const totalQuestions = Number(body.totalQuestions);
  if (!title) {
    return NextResponse.json(
      { success: false, message: 'Exam title is required.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 500) {
    return NextResponse.json(
      { success: false, message: 'TotalQuestions must be an integer between 1 and 500.', errorCode: 'VALIDATION_ERROR' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/exams/diy');
  const result = await lexmaCastoRequest(LEXMACASTO_EXTRA_ENDPOINTS.DIY_EXAM_STORE, {
    method: 'POST',
    body: {
      ...body,
      title,
      totalQuestions,
    },
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
    status: result.status,
    headers: NO_STORE_HEADERS,
  });
}
