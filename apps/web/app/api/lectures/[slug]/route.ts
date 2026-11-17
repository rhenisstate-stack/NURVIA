import { NextRequest, NextResponse } from 'next/server';
import { getServerCastoSession } from '@/lib/lexmacasto/session';
import { getPublishedLectureBySlug } from '@/lib/lectures/nurvia-lectures-data';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!slug || !/^[a-zA-Z0-9._-]+$/.test(slug)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid lecture slug.',
        errorCode: 'VALIDATION_ERROR',
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const session = await getServerCastoSession();
  const result = getPublishedLectureBySlug(slug, Boolean(session));

  if (result.kind === 'not_found') {
    return NextResponse.json(
      {
        success: false,
        message: `Published lecture '${slug}' was not found.`,
        errorCode: 'NOT_FOUND',
      },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  if (result.kind === 'unauthorized') {
    return NextResponse.json(
      {
        success: false,
        message: 'Sign in with a NURVIA learner account to access Lectures 4–12.',
        errorCode: 'UNAUTHORIZED',
      },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Lecture retrieved successfully.',
      data: result.lecture,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
