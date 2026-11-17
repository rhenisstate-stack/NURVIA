import { NextResponse, type NextRequest } from 'next/server';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    '';

  const country =
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    '';
  const city = safeDecode(req.headers.get('x-vercel-ip-city') || '');
  const location = [city, country].filter(Boolean).join(', ');

  const mobileRaw = req.headers.get('sec-ch-ua-mobile');
  const mobile = mobileRaw === '?1' ? 'true' : mobileRaw === '?0' ? 'false' : '';

  const isApiCall = req.nextUrl.pathname.startsWith('/api');
  const pageReferer = req.headers.get('referer') || '';
  const appOrigin = (
    process.env.NURVIA_APP_DOMAIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    req.nextUrl.origin
  ).replace(/\/+$/, '');
  const currentUrl =
    isApiCall && pageReferer
      ? pageReferer
      : `${appOrigin}${req.nextUrl.pathname}${req.nextUrl.search}`;

  headers.set('x-current-path', currentUrl);
  headers.set('x-current-ip', ip);
  headers.set('x-current-location', encodeURIComponent(location));
  headers.set('x-current-country', country);
  headers.set('x-current-ua', req.headers.get('user-agent') || '');
  headers.set('x-current-referrer', pageReferer);
  headers.set('x-current-mobile', mobile);
  headers.set('x-current-request-id', crypto.randomUUID());

  let sid = req.cookies.get('x-site-session')?.value;
  const isNew = !sid;
  if (!sid) {
    sid = crypto.randomUUID();
  }
  headers.set('x-current-session-id', sid);

  const res = NextResponse.next({ request: { headers } });
  if (isNew) {
    res.cookies.set('x-site-session', sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
