import { NextRequest, NextResponse } from 'next/server';
import {
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
  sanitizeAuthUser,
} from '@/lib/lexmacasto/client';
import { buildCurrentUserEndpointPath, type LexmaCastoAuthUserRaw } from '@/lib/lexmacasto/contracts';
import { STAFF_ROLES } from '@/lib/lexmacasto/proxy-allowlist';
import { getServerCastoSession } from '@/lib/lexmacasto/session';
import { getManagementLecturesList } from '@/lib/lectures/nurvia-lectures-data';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function GET(request: NextRequest) {
  const session = await getServerCastoSession();
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication is required to access lecture management.',
        errorCode: 'UNAUTHORIZED',
      },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/lectures/management');
  const meResult = await lexmaCastoRequest<{ user?: LexmaCastoAuthUserRaw; data?: LexmaCastoAuthUserRaw }>(
    buildCurrentUserEndpointPath(),
    { method: 'GET', session, siteMeta }
  );

  const rawUser = meResult.data?.user ?? meResult.data?.data ?? (meResult.data as LexmaCastoAuthUserRaw | undefined);
  const currentUser = sanitizeAuthUser(rawUser);

  if (!meResult.ok || !currentUser) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to verify your staff role for lecture management.',
        errorCode: 'UNAUTHORIZED',
      },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  if (!STAFF_ROLES.has(currentUser.role.toLowerCase())) {
    return NextResponse.json(
      {
        success: false,
        message: 'You do not have permission to manage lecture content.',
        errorCode: 'FORBIDDEN',
      },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Lecture management records retrieved successfully.',
      data: getManagementLecturesList(),
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
