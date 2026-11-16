import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, '..');

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err);
    process.exitCode = 1;
  }
}

console.log('--- NURVIA PHASE 2 ADVERSARIAL SECURITY & CONTRACT AUDIT SUITE ---');

test('1. Proxy allowlist module defines explicit routes, methods, auth levels, and body size limits', () => {
  const allowlistSrc = fs.readFileSync(path.join(webDir, 'lib/lexmacasto/proxy-allowlist.ts'), 'utf8');
  assert.equal(allowlistSrc.includes('PROXY_ROUTE_RULES'), true);
  assert.equal(allowlistSrc.includes('matchProxyRoute'), true);
  assert.equal(allowlistSrc.includes('STAFF_ROLES'), true);
  assert.equal(allowlistSrc.includes("auth: 'public'"), true);
  assert.equal(allowlistSrc.includes("auth: 'authenticated'"), true);
  assert.equal(allowlistSrc.includes("auth: 'staff'"), true);
  assert.equal(allowlistSrc.includes('maxBodyBytes'), true);
});

test('2. Proxy route handler enforces allowlist, role checks, body size limits, content-type, and no-store', () => {
  const proxySrc = fs.readFileSync(path.join(webDir, 'app/api/backend/[...path]/route.ts'), 'utf8');
  assert.equal(proxySrc.includes('matchProxyRoute(method, path)'), true);
  assert.equal(proxySrc.includes("rule.auth === 'staff'"), true);
  assert.equal(proxySrc.includes('STAFF_ROLES.has('), true);
  assert.equal(proxySrc.includes('status: 413'), true);
  assert.equal(proxySrc.includes('status: 415'), true);
  assert.equal(proxySrc.includes('NO_STORE_HEADERS'), true);
  assert.equal(proxySrc.includes("'Cache-Control': 'no-store"), true);
});

test('3. next.config.mjs has no open rewrites and avatar route validates storageKey safely', () => {
  const nextConfigSrc = fs.readFileSync(path.join(webDir, 'next.config.mjs'), 'utf8');
  const avatarRouteSrc = fs.readFileSync(path.join(webDir, 'app/api/avatar/[storageKey]/route.ts'), 'utf8');
  assert.equal(nextConfigSrc.includes('rewrites('), false, 'next.config.mjs must not have blind rewrites');
  assert.equal(avatarRouteSrc.includes('SAFE_STORAGE_KEY_REGEX'), true);
  assert.equal(avatarRouteSrc.includes("storageKey.includes('..')"), true);
});

test('4. api-client.ts routes only dedicated auth endpoints directly and sends other /api/auth/* through allowlisted proxy', () => {
  const apiClientSrc = fs.readFileSync(path.join(webDir, 'lib/api-client.ts'), 'utf8');
  assert.equal(apiClientSrc.includes('DEDICATED_AUTH_ROUTES'), true);
  assert.equal(apiClientSrc.includes("'/api/auth/login'"), true);
  assert.equal(apiClientSrc.includes("'/api/auth/me'"), true);
  assert.equal(apiClientSrc.includes("'/api/auth/logout'"), true);
  assert.equal(apiClientSrc.includes("endpoint.startsWith('/api/auth/')"), false, 'Must not bypass proxy for /api/auth/users etc.');
});

test('5. validateSameOriginRequest does not trust x-forwarded-host and rejects missing Origin/Referer on mutations', () => {
  const sessionSrc = fs.readFileSync(path.join(webDir, 'lib/lexmacasto/session.ts'), 'utf8');
  assert.equal(sessionSrc.includes('x-forwarded-host'), false, 'Must not trust arbitrary X-Forwarded-Host');
  assert.equal(sessionSrc.includes('Missing Origin or Referer header'), true);
  assert.equal(sessionSrc.includes("secFetchSite === 'cross-site'"), true);
});

test('6. lexmaCastoRequest enforces server-owned siteHeaders and authHeaders over caller headers', () => {
  const clientSrc = fs.readFileSync(path.join(webDir, 'lib/lexmacasto/client.ts'), 'utf8');
  const headersIdx = clientSrc.indexOf('const headers: Record<string, string>');
  const snippet = clientSrc.slice(headersIdx, headersIdx + 260);
  const callerIdx = snippet.indexOf('...(options.headers || {})');
  const siteIdx = snippet.indexOf('...siteHeaders');
  const authIdx = snippet.indexOf('...authHeaders');
  assert.equal(callerIdx !== -1 && siteIdx > callerIdx && authIdx > callerIdx, true);
});

test('7. Strata route handler enforces query parameter allowlist, pagination bounds, and no-store cache headers', () => {
  const strataSrc = fs.readFileSync(path.join(webDir, 'app/api/strata/[resource]/route.ts'), 'utf8');
  assert.equal(strataSrc.includes('ALLOWED_STRATA_QUERY_PARAMS'), true);
  assert.equal(strataSrc.includes('PAGINATION_SIZE_KEYS'), true);
  assert.equal(strataSrc.includes('n > 100'), true);
  assert.equal(strataSrc.includes("'Cache-Control': cacheHeader"), true);
});

test('8. Auth login and me routes set Cache-Control: no-store', () => {
  const loginSrc = fs.readFileSync(path.join(webDir, 'app/api/auth/login/route.ts'), 'utf8');
  const meSrc = fs.readFileSync(path.join(webDir, 'app/api/auth/me/route.ts'), 'utf8');
  assert.equal(loginSrc.includes("'Cache-Control': 'no-store'"), true);
  assert.equal(meSrc.includes("'Cache-Control': 'no-store'"), true);
});
