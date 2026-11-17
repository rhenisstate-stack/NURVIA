import { NextRequest, NextResponse } from 'next/server';
import {
  buildCurrentUserEndpointPath,
  buildStrataEndpointPath,
  buildStrataMutationPath,
  isStrataResourceKey,
  LEXMACASTO_STRATA_ENDPOINTS,
  type LexmaCastoAuthUserRaw,
  type StrataFetchType,
  type StrataMutationAction,
} from '@/lib/lexmacasto/contracts';
import {
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
  normalizeStrataEnvelope,
  sanitizeAuthUser,
} from '@/lib/lexmacasto/client';
import { STAFF_ROLES } from '@/lib/lexmacasto/proxy-allowlist';
import { getServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';

const ALLOWED_STRATA_QUERY_PARAMS = new Set([
  'page',
  'skewPage',
  'perPage',
  'skewPerPage',
  'limit',
  'search',
  'q',
  'domainId',
  'categoryId',
  'subCategoryId',
  'programId',
  'courseId',
  'subjectId',
  'unitId',
  'lessonId',
  'topicId',
  'conceptId',
  'assessmentId',
  'examId',
  'sectionId',
  'institutionId',
  'schoolId',
  'departmentId',
  'divisionId',
  'cohortId',
  'classId',
]);

const ALLOWED_FETCH_TYPES = new Set<StrataFetchType>([
  'absolute',
  'distinct',
  'relative',
  'current',
  'live',
]);

const PAGINATION_PAGE_KEYS = new Set(['page', 'skewPage']);
const PAGINATION_SIZE_KEYS = new Set(['perPage', 'skewPerPage', 'limit']);
const MAX_MUTATION_BODY_BYTES = 1_048_576;
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  if (!isStrataResourceKey(resource)) {
    return NextResponse.json(
      {
        success: false,
        message: `Unknown academic strata resource: "${resource}".`,
        errorCode: 'NOT_FOUND',
      },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  const endpointDef = LEXMACASTO_STRATA_ENDPOINTS[resource];
  const requestedFetchType = request.nextUrl.searchParams.get('fetchtype')?.trim().toLowerCase();
  let resolvedFetchType: StrataFetchType = endpointDef.fetchtype;

  if (requestedFetchType) {
    if (!ALLOWED_FETCH_TYPES.has(requestedFetchType as StrataFetchType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported strata fetchtype: "${requestedFetchType}".`,
          errorCode: 'VALIDATION_ERROR',
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    resolvedFetchType = requestedFetchType as StrataFetchType;
  }

  const requiresAuth = endpointDef.requiresAuth || resolvedFetchType !== 'absolute';
  const session = await getServerCastoSession();

  if (requiresAuth && !session) {
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication is required to access this academic strata resource.',
        errorCode: 'UNAUTHORIZED',
      },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const queryParams: Record<string, string> = {};
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key === 'fetchtype') continue;
    if (!ALLOWED_STRATA_QUERY_PARAMS.has(key)) {
      return NextResponse.json(
        { success: false, message: `Unsupported query parameter: "${key}".`, errorCode: 'VALIDATION_ERROR' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (PAGINATION_PAGE_KEYS.has(key)) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 10_000) {
        return NextResponse.json(
          { success: false, message: `Invalid pagination page value for "${key}".`, errorCode: 'VALIDATION_ERROR' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }
    if (PAGINATION_SIZE_KEYS.has(key)) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        return NextResponse.json(
          { success: false, message: `Invalid pagination size for "${key}" (expected 1..100).`, errorCode: 'VALIDATION_ERROR' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }
    queryParams[key] = value.slice(0, 200);
  }

  const backendPath = buildStrataEndpointPath(resource, queryParams, resolvedFetchType);
  const siteMeta = extractSiteMetadataFromRequestHeaders(
    request.headers,
    `/api/strata/${resource}`
  );

  const result = await lexmaCastoRequest(backendPath, {
    method: 'GET',
    session,
    siteMeta,
  });

  const cacheHeader = requiresAuth ? 'no-store' : 'private, no-store';

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        message: result.message,
        errorCode: result.errorCode,
        errors: result.errors,
      },
      { status: result.status, headers: { 'Cache-Control': cacheHeader } }
    );
  }

  const normalized = normalizeStrataEnvelope(result.data);
  if (!normalized) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected academic strata response format.',
        errorCode: 'UNEXPECTED_RESPONSE',
      },
      { status: 502, headers: { 'Cache-Control': cacheHeader } }
    );
  }

  return NextResponse.json(normalized, {
    headers: { 'Cache-Control': cacheHeader },
  });
}

async function handleStrataMutation(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
  method: 'POST' | 'PUT' | 'DELETE',
  action: StrataMutationAction
) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json(
      { success: false, message: csrf.reason, errorCode: 'FORBIDDEN' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const { resource } = await context.params;
  if (!isStrataResourceKey(resource)) {
    return NextResponse.json(
      { success: false, message: `Unknown academic strata resource: "${resource}".`, errorCode: 'NOT_FOUND' },
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

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, `/api/strata/${resource}`);

  // Enforce server-verified staff role for all strata authoring/administrative mutations.
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
      { success: false, message: 'Insufficient permissions for strata modification.', errorCode: 'FORBIDDEN' },
      { status: 403, headers: NO_STORE_HEADERS }
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
  if (Buffer.byteLength(text, 'utf8') > MAX_MUTATION_BODY_BYTES) {
    return NextResponse.json(
      { success: false, message: 'Request body exceeds maximum allowed size.', errorCode: 'VALIDATION_ERROR' },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  let body: Record<string, unknown>;
  try {
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

  const backendPath = buildStrataMutationPath(resource, action);
  const result = await lexmaCastoRequest(backendPath, {
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
    status: result.status,
    headers: NO_STORE_HEADERS,
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return handleStrataMutation(request, context, 'POST', 'store');
}

export async function PUT(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return handleStrataMutation(request, context, 'PUT', 'update');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return handleStrataMutation(request, context, 'DELETE', 'delete');
}
