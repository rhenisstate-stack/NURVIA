import { NextResponse } from 'next/server';
import { getServerCastoSession } from '@/lib/lexmacasto/session';
import { getPublishedLectureCatalogue } from '@/lib/lectures/nurvia-lectures-data';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function GET() {
  const session = await getServerCastoSession();
  const isAuthenticated = Boolean(session);
  const catalogue = getPublishedLectureCatalogue(isAuthenticated);

  return NextResponse.json(
    {
      success: true,
      message: 'Published lecture catalogue retrieved successfully.',
      data: catalogue,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
