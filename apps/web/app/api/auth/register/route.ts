import { NextRequest, NextResponse } from 'next/server';
import type { LexmaCastoLoginResponseRaw, LexmaCastoRegisterPayload } from '@/lib/lexmacasto/contracts';
import { LEXMACASTO_AUTH_ENDPOINTS } from '@/lib/lexmacasto/contracts';
import {
  extractCastoCredentialsFromLogin,
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
  sanitizeAuthUser,
} from '@/lib/lexmacasto/client';
import { setServerCastoSession, validateSameOriginRequest } from '@/lib/lexmacasto/session';
import { getTemporaryChallenge } from '@/lib/auth/temporaryChallenge';
import { DEFAULT_PHONE_COUNTRY, normalizePhoneNumber } from '@/lib/phone';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_PATTERN = /^\d{4,12}$/;

function noStoreJson(body: Record<string, unknown>, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  const csrf = validateSameOriginRequest(request);
  if (!csrf.ok) {
    return noStoreJson({ success: false, message: csrf.reason, errorCode: 'FORBIDDEN' }, 403);
  }

  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return noStoreJson(
      { success: false, message: 'Unsupported Content-Type. Expected application/json.', errorCode: 'VALIDATION_ERROR' },
      415
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return noStoreJson({ success: false, message: 'Invalid JSON request body.', errorCode: 'VALIDATION_ERROR' }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return noStoreJson({ success: false, message: 'Invalid JSON request body.', errorCode: 'VALIDATION_ERROR' }, 400);
  }

  const username =
    (typeof body.username === 'string' && body.username.trim()) ||
    (typeof body.name === 'string' && body.name.trim()) ||
    '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const password = typeof body.password === 'string' ? body.password : undefined;
  const passwordConfirmation =
    typeof body.passwordConfirmation === 'string' ? body.passwordConfirmation : undefined;
  const pin = typeof body.pin === 'string' ? body.pin : undefined;
  const pinConfirmation =
    typeof body.pinConfirmation === 'string' ? body.pinConfirmation : undefined;
  const loginMethod =
    typeof body.loginMethod === 'string' && body.loginMethod.trim()
      ? body.loginMethod.trim()
      : pin
        ? 'pin'
        : 'password';
  const agree = body.agree === true;

  if (!username || username.length < 2) {
    return noStoreJson(
      { success: false, message: 'Full name or username is required (minimum 2 characters).', errorCode: 'VALIDATION_ERROR' },
      400
    );
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return noStoreJson({ success: false, message: 'A valid email address is required.', errorCode: 'VALIDATION_ERROR' }, 400);
  }
  if (!phone) {
    return noStoreJson({ success: false, message: 'Phone number is required.', errorCode: 'VALIDATION_ERROR' }, 400);
  }
  const normalizedPhone = normalizePhoneNumber(phone, DEFAULT_PHONE_COUNTRY, { allowPossible: true });
  if (!normalizedPhone.valid || !normalizedPhone.e164) {
    return noStoreJson(
      { success: false, message: normalizedPhone.error || 'Enter a valid phone number.', errorCode: 'VALIDATION_ERROR' },
      400
    );
  }
  if (!agree) {
    return noStoreJson(
      { success: false, message: 'You must agree to the terms and privacy policy.', errorCode: 'VALIDATION_ERROR' },
      400
    );
  }
  if (loginMethod !== 'password' && loginMethod !== 'pin' && loginMethod !== 'both') {
    return noStoreJson({ success: false, message: 'Unsupported login method.', errorCode: 'VALIDATION_ERROR' }, 400);
  }
  if (loginMethod === 'password' || loginMethod === 'both') {
    if (!password) {
      return noStoreJson({ success: false, message: 'Password is required.', errorCode: 'VALIDATION_ERROR' }, 400);
    }
    if (password.length < 12) {
      return noStoreJson(
        { success: false, message: 'Use at least 12 characters for your password.', errorCode: 'VALIDATION_ERROR' },
        400
      );
    }
    if (password !== passwordConfirmation) {
      return noStoreJson({ success: false, message: 'Passwords do not match.', errorCode: 'VALIDATION_ERROR' }, 400);
    }
  }
  if (loginMethod === 'pin' || loginMethod === 'both') {
    if (!pin || !pin.trim()) {
      return noStoreJson({ success: false, message: 'PIN is required.', errorCode: 'VALIDATION_ERROR' }, 400);
    }
    if (!PIN_PATTERN.test(pin.trim())) {
      return noStoreJson(
        { success: false, message: 'Use a 4 to 12 digit numeric PIN.', errorCode: 'VALIDATION_ERROR' },
        400
      );
    }
    if (pin !== pinConfirmation) {
      return noStoreJson({ success: false, message: 'PINs do not match.', errorCode: 'VALIDATION_ERROR' }, 400);
    }
  }

  const provider =
    typeof body.provider === 'string' && body.provider.trim() ? body.provider.trim() : 'email';
  const providerPayload =
    typeof body.providerPayload === 'string' && body.providerPayload.trim()
      ? body.providerPayload.trim()
      : body.providerPayload && typeof body.providerPayload === 'object' && !Array.isArray(body.providerPayload)
        ? (body.providerPayload as Record<string, unknown>)
        : undefined;

  // Prevent client-side privilege escalation: public registration is always Learner on web.
  const includePassword = loginMethod === 'password' || loginMethod === 'both';
  const includePin = loginMethod === 'pin' || loginMethod === 'both';

  const payload: LexmaCastoRegisterPayload = {
    username,
    email,
    phone: normalizedPhone.e164,
    loginMethod,
    agree: true,
    role: 'Learner',
    dashboardName: 'web',
    provider,
    challenge: getTemporaryChallenge('register'),
    ...(includePassword && password !== undefined ? { password, passwordConfirmation } : {}),
    ...(includePin && pin !== undefined ? { pin: pin.trim(), pinConfirmation: pinConfirmation?.trim() } : {}),
    ...(providerPayload !== undefined ? { providerPayload } : {}),
  };

  const siteMeta = extractSiteMetadataFromRequestHeaders(request.headers, '/api/auth/register');

  const result = await lexmaCastoRequest<LexmaCastoLoginResponseRaw>(LEXMACASTO_AUTH_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: payload,
    siteMeta,
  });

  if (!result.ok) {
    return noStoreJson(
      {
        success: false,
        message: result.message,
        errorCode: result.errorCode,
        errors: result.errors,
      },
      result.status
    );
  }

  const credentials = extractCastoCredentialsFromLogin(result.data);
  const rawUser = result.data?.user ?? result.data?.data?.user;
  const sanitizedUser = sanitizeAuthUser(rawUser);

  const response = noStoreJson(
    {
      success: true,
      message: result.message || 'Registration completed.',
      data: sanitizedUser ?? 'Registration completed.',
    },
    result.status
  );

  if (credentials && sanitizedUser) {
    setServerCastoSession(response, credentials, sanitizedUser.dashboardName || payload.dashboardName);
  }

  return response;
}
