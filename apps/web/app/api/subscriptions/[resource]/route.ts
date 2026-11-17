import { NextRequest, NextResponse } from 'next/server';
import { buildSubscriptionEndpointPath } from '@/lib/lexmacasto/contracts';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { getServerCastoSession } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
};

const VALID_FETCHTYPES = new Set(['absolute', 'distinct', 'relative', 'discrete']);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  if (resource !== 'packages' && resource !== 'items') {
    return NextResponse.json(
      { success: false, message: `Unsupported subscription resource "${resource}".`, errorCode: 'NOT_FOUND' },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  const session = await getServerCastoSession();
  const rawFetchType = request.nextUrl.searchParams.get('fetchtype') || (resource === 'packages' ? 'discrete' : 'relative');
  const fetchtype = (VALID_FETCHTYPES.has(rawFetchType) ? rawFetchType : 'discrete') as
    | 'absolute'
    | 'distinct'
    | 'relative'
    | 'discrete';

  if (fetchtype === 'relative' && !session) {
    return NextResponse.json(
      { success: false, message: 'Authentication is required.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const targetPath = buildSubscriptionEndpointPath(resource, fetchtype);
  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, `/api/subscriptions/${resource}`);
  const result = await lexmaCastoRequest(targetPath, {
    method: 'GET',
    session: session ?? undefined,
    siteMeta,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        message: result.message,
        errorCode: result.errorCode,
      },
      { status: result.status, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: result.message || 'Subscription records retrieved.',
      data: result.data,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
