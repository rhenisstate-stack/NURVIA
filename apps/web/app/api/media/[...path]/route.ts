import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendBaseUrl, resolveApplicationIdentity } from '@/lib/api-config';
import { buildSiteHeaders } from '@/lib/lexmacasto/headers';
import { extractSiteMetadataFromRequestHeaders } from '@/lib/lexmacasto/client';

const ALLOWED_MEDIA_PREFIXES = new Set([
  'storage',
  'media',
  'uploads',
  'images',
  'audio',
  'video',
]);

const SAFE_CONTENT_TYPE_PREFIXES = ['image/', 'audio/', 'video/', 'application/pdf'];

function validateMediaSegments(segments: string[]): string | null {
  if (!Array.isArray(segments) || segments.length < 2) return null;

  const cleaned: string[] = [];
  for (const seg of segments) {
    if (!seg || /%2e|%2f|%5c|%25|\\\\|\\|[\r\n\0]/i.test(seg)) {
      return null;
    }
    let decoded: string;
    try {
      decoded = decodeURIComponent(seg);
    } catch {
      return null;
    }
    if (
      !decoded ||
      decoded === '.' ||
      decoded === '..' ||
      decoded.includes('..') ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      /[\r\n\0]/.test(decoded)
    ) {
      return null;
    }
    cleaned.push(decoded);
  }

  if (!ALLOWED_MEDIA_PREFIXES.has(cleaned[0].toLowerCase())) {
    return null;
  }

  return cleaned.join('/');
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const safePath = validateMediaSegments(path);
  if (!safePath) {
    return NextResponse.json(
      { success: false, message: 'Invalid or disallowed media path.' },
      { status: 400 }
    );
  }

  const baseUrl = resolveBackendBaseUrl(process.env, {
    requireHttps: process.env.NODE_ENV === 'production',
  });
  const identity = resolveApplicationIdentity(process.env);
  const siteMeta = extractSiteMetadataFromRequestHeaders(
    request.headers,
    `/api/media/${safePath}`
  );

  const upstream = await fetch(`${baseUrl}/${safePath}`, {
    method: 'GET',
    headers: buildSiteHeaders(identity, siteMeta),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { success: false, message: 'Media asset not found.' },
      { status: upstream.status === 404 ? 404 : 502 }
    );
  }

  const rawType = (upstream.headers.get('content-type') || 'application/octet-stream').toLowerCase();
  const isSafeType = SAFE_CONTENT_TYPE_PREFIXES.some((p) => rawType.startsWith(p));
  if (!isSafeType) {
    return NextResponse.json(
      { success: false, message: 'Unsupported media content type.' },
      { status: 415 }
    );
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': rawType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
