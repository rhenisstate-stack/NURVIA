import { NextRequest, NextResponse } from 'next/server';
import { LEXMACASTO_AUTH_ENDPOINTS, type LexmaCastoLogoutPayload } from '@/lib/lexmacasto/contracts';
import { extractSiteMetadataFromRequestHeaders, lexmaCastoRequest } from '@/lib/lexmacasto/client';
import {
  clearServerCastoSession,
  getServerCastoSession,
  getServerDashboardHint,
  validateSameOriginRequest,
} from '@/lib/lexmacasto/session';

export async function POST(request: NextRequest) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return NextResponse.json({ success: false, message: csrf.reason }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request body.' }, { status: 400 });
  }

  const scope = body.scope === 'relative' ? 'relative' : 'distinct';
  const endpoint =
    scope === 'relative'
      ? LEXMACASTO_AUTH_ENDPOINTS.LOGOUT_RELATIVE
      : LEXMACASTO_AUTH_ENDPOINTS.LOGOUT_DISTINCT;

  const session = await getServerCastoSession();
  const dashboardHint = await getServerDashboardHint();
  const targetDashboard =
    (typeof body.target_dashboard === 'string' && body.target_dashboard.trim()) ||
    dashboardHint ||
    'learner';

  if (!session) {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out locally.',
      data: 'Signed out locally.',
    });
    clearServerCastoSession(response);
    return response;
  }

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/auth/logout');
  const payload: LexmaCastoLogoutPayload = {
    target_dashboard: targetDashboard,
  };

  const result = await lexmaCastoRequest(endpoint, {
    method: 'POST',
    body: payload,
    session,
    siteMeta,
  });

  if (!result.ok) {
    // Always clear local HttpOnly cookies so the browser cannot reuse them,
    // but do NOT disguise a failed backend revocation as a successful logout.
    const response = NextResponse.json(
      {
        success: false,
        message: result.message || 'Backend session revocation failed.',
        errorCode: result.errorCode,
      },
      { status: result.status >= 400 ? result.status : 502 }
    );
    clearServerCastoSession(response);
    return response;
  }

  const response = NextResponse.json({
    success: true,
    message: result.message || 'Signed out.',
    data: 'Signed out.',
  });
  clearServerCastoSession(response);
  return response;
}
