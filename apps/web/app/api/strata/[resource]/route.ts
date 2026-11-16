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
      { status: 404 }
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
      { status: 401 }
    );
  }

  const queryParams: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== 'fetchtype') {
      queryParams[key] = value;
    }
  });

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

  const normalized = normalizeStrataEnvelope(result.data);
  if (!normalized) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected academic strata response format.',
        errorCode: 'UNEXPECTED_RESPONSE',
      },
      { status: 502 }
    );
  }

  return NextResponse.json(normalized);
}
