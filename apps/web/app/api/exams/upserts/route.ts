import { NextRequest, NextResponse } from 'next/server';
import {
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
} from '@/lib/lexmacasto/client';
import { getServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
};

const ACTION_GROUP_TO_SEGMENT: Record<string, string> = {
  ExamAnswers: 'user/answers',
  ExamActions: 'actions',
  QuestionActions: 'question/actions',
  ExamLifecycle: 'lifecycle',
  ExamPreferences: 'preferences',
};

const BASE_ROUTE = '/api/castoline/strata/assessment/exams';

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
      {
        success: false,
        message: 'Unsupported Content-Type. Expected application/json.',
        errorCode: 'VALIDATION_ERROR',
      },
      { status: 415, headers: NO_STORE_HEADERS }
    );
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, 'utf8') > 524_288) {
      return NextResponse.json(
        { success: false, message: 'Request body exceeds maximum allowed size.' },
        { status: 413, headers: NO_STORE_HEADERS }
      );
    }
    const parsed = text ? (JSON.parse(text) as unknown) : {};
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

  const actionGroup = typeof body.actionGroup === 'string' ? body.actionGroup : '';
  const segment = ACTION_GROUP_TO_SEGMENT[actionGroup];
  if (!segment) {
    return NextResponse.json(
      { success: false, message: `Unknown actionGroup: ${actionGroup || '(missing)'}` },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const isDiy = body.isDiy === true;
  if (isDiy && actionGroup === 'ExamPreferences') {
    return NextResponse.json(
      { success: true, message: 'DIY preferences acknowledged.' },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }

  const backendPath = isDiy
    ? `${BASE_ROUTE}/upsert/diy/${segment}`
    : `${BASE_ROUTE}/upsert/${segment}`;

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/exams/upserts');
  const result = await lexmaCastoRequest(backendPath, {
    method: 'POST',
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
    status: result.status,
    headers: NO_STORE_HEADERS,
  });
}
