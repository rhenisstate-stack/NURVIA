import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseApiResponse } from '../lib/api-response.ts';
import { buildApiUrl, DEDICATED_AUTH_ROUTES } from '../lib/api-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err);
    failed++;
    process.exitCode = 1;
  }
}

console.log('--- NURVIA PHASE 3.1 AUTH ROUTE & RESPONSE PARSER UNIT TESTS ---');

await test('1. buildApiUrl routes dedicated auth endpoints to same-origin /api/auth/* in browser', () => {
  const prevWindow = globalThis.window;
  globalThis.window = {};
  try {
    assert.equal(buildApiUrl('/api/auth/me'), '/api/auth/me');
    assert.equal(buildApiUrl('/api/auth/login'), '/api/auth/login');
    assert.equal(buildApiUrl('/api/auth/register'), '/api/auth/register');
    assert.equal(buildApiUrl('/api/auth/logout'), '/api/auth/logout');
    assert.equal(buildApiUrl('/api/auth/config-status'), '/api/auth/config-status');
    assert.equal(buildApiUrl('/api/strata/categories?page=1'), '/api/strata/categories?page=1');
    assert.equal(buildApiUrl('/api/exams'), '/api/backend/exams');
    assert.notEqual(buildApiUrl('/api/auth/me'), '/api/backend/auth/me');
  } finally {
    if (prevWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = prevWindow;
    }
  }
});

await test('2. parseApiResponse handles valid JSON 200 and error normalization', async () => {
  const okRes = new Response(
    JSON.stringify({ success: true, message: 'OK', data: { id: 'u1', email: 'nurse@example.com' } }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
  const okParsed = await parseApiResponse(okRes);
  assert.equal(okParsed.success, true);
  assert.equal(okParsed.statusCode, 200);
  assert.equal(okParsed.data.email, 'nurse@example.com');

  const errRes = new Response(
    JSON.stringify({ success: false, message: 'Operation failed', errors: ['Invalid credentials'] }),
    { status: 401, headers: { 'content-type': 'application/json' } }
  );
  const errParsed = await parseApiResponse(errRes);
  assert.equal(errParsed.success, false);
  assert.equal(errParsed.statusCode, 401);
  assert.equal(errParsed.message, 'Invalid credentials');
});

await test('3. parseApiResponse safely handles Vercel plain-text 404 without JSON crash or secret/diagnostic leak', async () => {
  const vercel404 = new Response(
    'The page could not be found\n\nDNS_HOSTNAME_RESOLVED_PRIVATE\n\nbom1::abc123',
    { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } }
  );
  const parsed = await parseApiResponse(vercel404);
  assert.equal(parsed.success, false);
  assert.equal(parsed.statusCode, 404);
  assert.equal(parsed.message, 'The requested service endpoint was not found.');
  assert.equal(parsed.message.includes('DNS_HOSTNAME_RESOLVED_PRIVATE'), false);
  assert.equal(parsed.message.includes('Unexpected token'), false);
});

await test('4. parseApiResponse handles HTML error pages, empty bodies, malformed JSON, and null JSON safely', async () => {
  const html404 = new Response('<!DOCTYPE html><html><body>404</body></html>', {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
  const parsedHtml = await parseApiResponse(html404);
  assert.equal(parsedHtml.success, false);
  assert.equal(parsedHtml.statusCode, 404);

  const empty204 = new Response(null, { status: 204 });
  const parsed204 = await parseApiResponse(empty204);
  assert.equal(parsed204.success, true);
  assert.equal(parsed204.statusCode, 204);

  const empty500 = new Response('', { status: 500 });
  const parsed500 = await parseApiResponse(empty500);
  assert.equal(parsed500.success, false);
  assert.equal(parsed500.statusCode, 500);

  const malformed200 = new Response('{bad json', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
  const parsedMalformed = await parseApiResponse(malformed200);
  assert.equal(parsedMalformed.success, false);
  assert.equal(parsedMalformed.statusCode, 200);

  const nullJson200 = new Response('null', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
  const parsedNull = await parseApiResponse(nullJson200);
  assert.equal(parsedNull.success, false);
  assert.equal(parsedNull.statusCode, 200);
});

await test('5. parseApiResponse redacts sensitive stack traces and keys from plain-text errors', async () => {
  const leaky500 = new Response(
    'Unhandled exception at Server.Auth (108.61.9.189) SKEW_LINE_APP_KEY=secret',
    { status: 500, headers: { 'content-type': 'text/plain' } }
  );
  const parsed = await parseApiResponse(leaky500);
  assert.equal(parsed.success, false);
  assert.equal(parsed.statusCode, 500);
  assert.equal(parsed.message.includes('108.61.9.189'), false);
  assert.equal(parsed.message.includes('SKEW_LINE_APP_KEY'), false);
});

await test('6. DEDICATED_AUTH_ROUTES covers all 5 NURVIA auth routes and excludes /api/auth/csrf', () => {
  assert.equal(DEDICATED_AUTH_ROUTES.has('/api/auth/login'), true);
  assert.equal(DEDICATED_AUTH_ROUTES.has('/api/auth/register'), true);
  assert.equal(DEDICATED_AUTH_ROUTES.has('/api/auth/me'), true);
  assert.equal(DEDICATED_AUTH_ROUTES.has('/api/auth/logout'), true);
  assert.equal(DEDICATED_AUTH_ROUTES.has('/api/auth/config-status'), true);
  assert.equal(DEDICATED_AUTH_ROUTES.has('/api/auth/csrf'), false);
});

await test('7. Frontend auth provider and api-client never construct /api/backend/auth/me or /api/backend/auth/csrf', () => {
  const apiClientSrc = fs.readFileSync(path.join(webDir, 'lib/api-client.ts'), 'utf8');
  const authProviderSrc = fs.readFileSync(path.join(webDir, 'components/auth/auth-provider.tsx'), 'utf8');
  assert.equal(apiClientSrc.includes('/api/backend/auth/me'), false);
  assert.equal(apiClientSrc.includes('/api/backend/auth/csrf'), false);
  assert.equal(apiClientSrc.includes('/api/auth/csrf'), false);
  assert.equal(authProviderSrc.includes('nurviaApi.getCurrentUser'), true);
  assert.equal(authProviderSrc.includes('/api/backend/auth/'), false);
});

console.log(`\nAuth Route Remediation Unit Tests: ${passed} passed, ${failed} failed.`);
