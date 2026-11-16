import { NextRequest, NextResponse } from 'next/server';
import {
  buildStrataEndpointPath,
  isStrataResourceKey,
  LEXMACASTO_STRATA_ENDPOINTS,
} from '@/lib/lexmacasto/contracts';
import {
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
  normalizeStrataEnvelope,
} from '@/lib/lexmacasto/client';
import { getServerCastoSession } from '@/lib/lexmacasto/session';

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

const PAGINATION_PAGE_KEYS = new Set(['page', 'skewPage']);
const PAGINATION_SIZE_KEYS = new Set(['perPage', 'skewPerPage', 'limit']);

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
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const endpointDef = LEXMACASTO_STRATA_ENDPOINTS[resource];
  const session = await getServerCastoSession();

  if (endpointDef.requiresAuth && !session) {
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication is required to access live examinations.',
        errorCode: 'UNAUTHORIZED',
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const queryParams: Record<string, string> = {};
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key === 'fetchtype') continue;
    if (!ALLOWED_STRATA_QUERY_PARAMS.has(key)) {
      return NextResponse.json(
        { success: false, message: `Unsupported query parameter: "${key}".`, errorCode: 'VALIDATION_ERROR' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    if (PAGINATION_PAGE_KEYS.has(key)) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 10_000) {
        return NextResponse.json(
          { success: false, message: `Invalid pagination page value for "${key}".`, errorCode: 'VALIDATION_ERROR' },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }
    if (PAGINATION_SIZE_KEYS.has(key)) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        return NextResponse.json(
          { success: false, message: `Invalid pagination size for "${key}" (expected 1..100).`, errorCode: 'VALIDATION_ERROR' },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }
    queryParams[key] = value.slice(0, 200);
  }

  const backendPath = buildStrataEndpointPath(resource, queryParams);
  const siteMeta = extractSiteMetadataFromRequestHeaders(
    request.headers,
    `/api/strata/${resource}`
  );

  const result = await lexmaCastoRequest(backendPath, {
    method: 'GET',
    session,
    siteMeta,
  });

  const cacheHeader = endpointDef.requiresAuth ? 'no-store' : 'private, no-store';

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
