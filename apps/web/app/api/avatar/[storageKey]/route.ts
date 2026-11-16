import { NextRequest, NextResponse } from 'next/server';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import { getServerCastoSession } from '@/lib/lexmacasto/session';

const SAFE_STORAGE_KEY_REGEX = /^[a-zA-Z0-9._-]{1,128}$/;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storageKey: string }> }
) {
  const { storageKey } = await context.params;
  if (!storageKey || !SAFE_STORAGE_KEY_REGEX.test(storageKey) || storageKey.includes('..')) {
    return NextResponse.json({ success: false, message: 'Invalid avatar storage key.' }, { status: 400 });
  }

  const session = await getServerCastoSession();
  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, `/api/avatar/${storageKey}`);

  const result = await lexmaCastoRequest(`/api/avatar/${storageKey}`, {
    method: 'GET',
    session,
    siteMeta,
  });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message, errorCode: result.errorCode },
      { status: result.status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(result.data ?? { success: true }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
