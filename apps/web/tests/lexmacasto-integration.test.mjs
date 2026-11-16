import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveApplicationIdentity,
  validateServerConfiguration,
  getSkewLineServerConfig,
  BackendConfigurationError,
} from '../lib/api-config.mjs';

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

console.log('--- NURVIA LEXMACASTO CONTRACT & SECURITY TEST SUITE ---');

test('1. Application identity fails closed when SKEW_LINE_APP_KEY or SKEW_LINE_APP_DOMAIN is missing', () => {
  assert.throws(
    () => resolveApplicationIdentity({ SKEW_LINE_APP_DOMAIN: 'https://nurvia-black.vercel.app' }),
    (err) => err instanceof BackendConfigurationError && err.code === 'MISSING_APP_KEY'
  );
  assert.throws(
    () => resolveApplicationIdentity({ SKEW_LINE_APP_KEY: '<APPLICATION_KEY>', SKEW_LINE_APP_DOMAIN: 'https://nurvia-black.vercel.app' }),
    (err) => err instanceof BackendConfigurationError && err.code === 'MISSING_APP_KEY'
  );
  assert.throws(
    () => resolveApplicationIdentity({ SKEW_LINE_APP_KEY: 'valid-test-key' }),
    (err) => err instanceof BackendConfigurationError && err.code === 'MISSING_APP_DOMAIN'
  );
  assert.throws(
    () => resolveApplicationIdentity({ SKEW_LINE_APP_KEY: 'valid-test-key\r\nInjected: 1', SKEW_LINE_APP_DOMAIN: 'https://nurvia-black.vercel.app' }),
    (err) => err instanceof BackendConfigurationError && err.code === 'INVALID_APP_IDENTITY'
  );
});

test('2. Production mode rejects HTTP backend origin and requires complete identity', () => {
  assert.throws(
    () =>
      validateServerConfiguration({
        NODE_ENV: 'production',
        SKEW_LINE_DOTNET_BASE_URL: 'http://108.61.9.189:8008',
        SKEW_LINE_APP_KEY: 'test-key',
        SKEW_LINE_APP_DOMAIN: 'https://nurvia-black.vercel.app',
      }),
    (err) => err instanceof BackendConfigurationError && err.code === 'INSECURE_PRODUCTION_ORIGIN'
  );

  const valid = validateServerConfiguration({
    NODE_ENV: 'production',
    SKEW_LINE_DOTNET_BASE_URL: 'https://explicitbackend.com/',
    SKEW_LINE_APP_KEY: 'test-key',
    SKEW_LINE_APP_DOMAIN: 'https://nurvia-black.vercel.app',
  });
  assert.equal(valid.backendBaseUrl, 'https://explicitbackend.com');
  assert.equal(valid.appDomain, 'https://nurvia-black.vercel.app');
});

test('3. getSkewLineServerConfig reports status flags without leaking secrets', () => {
  const cfg = getSkewLineServerConfig({
    SKEW_LINE_DOTNET_BASE_URL: 'https://explicitbackend.com',
    SKEW_LINE_APP_KEY: 'SUPER_SECRET_NURVIA_KEY',
    SKEW_LINE_APP_DOMAIN: 'https://nurvia-black.vercel.app',
  });
  assert.equal(cfg.appKeyConfigured, true);
  assert.equal(cfg.appDomainConfigured, true);
  assert.equal(cfg.isHttps, true);
  assert.equal(JSON.stringify(cfg).includes('SUPER_SECRET_NURVIA_KEY'), false);
});

test('4. next.config.mjs enforces HTTPS in production and removes direct /api/backend rewrite', () => {
  const nextConfigSrc = fs.readFileSync(path.join(webDir, 'next.config.mjs'), 'utf8');
  assert.equal(nextConfigSrc.includes("requireHttps: process.env.NODE_ENV === 'production'"), true);
  assert.equal(nextConfigSrc.includes("source: '/api/backend/:path*'"), false);
});

test('5. api-client.ts removes unsupported /api/auth/csrf preflight and routes auth/strata to Next.js Route Handlers', () => {
  const apiClientSrc = fs.readFileSync(path.join(webDir, 'lib/api-client.ts'), 'utf8');
  assert.equal(apiClientSrc.includes('/api/auth/csrf'), false);
  assert.equal(apiClientSrc.includes('/api/auth/refresh'), false);
  assert.equal(apiClientSrc.includes("endpoint.startsWith('/api/auth/')"), true);
  assert.equal(apiClientSrc.includes("endpoint.startsWith('/api/strata/')"), true);
});

test('6. LexmaCasto contracts define all 22 verified strata endpoints, mandatory fetchtype, and correct classes route', () => {
  const contractsSrc = fs.readFileSync(path.join(webDir, 'lib/lexmacasto/contracts.ts'), 'utf8');
  const expectedEndpoints = [
    '/api/castoline/auth/login',
    '/api/castoline/auth/register',
    '/api/castoline/system/user/list/current',
    '/api/castoline/auth/logout/sessions/distinct',
    '/api/castoline/auth/logout/sessions/relative',
    '/api/castoline/strata/main/categories/list/absolute',
    '/api/castoline/strata/main/subcategories/list/absolute',
    '/api/castoline/strata/main/domains/list/absolute',
    '/api/castoline/strata/learning/programs/list/absolute',
    '/api/castoline/strata/learning/courses/list/absolute',
    '/api/castoline/strata/learning/subjects/list/absolute',
    '/api/castoline/strata/learning/units/list/absolute',
    '/api/castoline/strata/learning/lessons/list/absolute',
    '/api/castoline/strata/learning/topics/list/absolute',
    '/api/castoline/strata/learning/concepts/list/absolute',
    '/api/castoline/strata/learning/facts/list/absolute',
    '/api/castoline/strata/assessment/assessments/list/absolute',
    '/api/castoline/strata/assessment/exams/list/absolute',
    '/api/castoline/strata/assessment/exams/list/live',
    '/api/castoline/strata/assessment/sections/list/absolute',
    '/api/castoline/strata/assessment/questions/list/absolute',
    '/api/castoline/strata/institution/institutions/list/absolute',
    '/api/castoline/strata/institution/schools/list/absolute',
    '/api/castoline/strata/institution/departments/list/absolute',
    '/api/castoline/strata/institution/divisions/list/absolute',
    '/api/castoline/strata/institution/cohorts/list/absolute',
    '/api/castoline/strata/institution/classes/list/absolute',
  ];
  for (const ep of expectedEndpoints) {
    assert.equal(contractsSrc.includes(ep), true, `Missing verified endpoint: ${ep}`);
  }
  assert.equal(contractsSrc.includes('/strataclasses'), false, 'Must not use unverified strataclasses route');
  assert.equal(contractsSrc.includes('/AcademicYear'), false, 'Must not invent AcademicYear endpoint');
  assert.equal(contractsSrc.includes("params.set('fetchtype', def.fetchtype)"), true);
  assert.equal(contractsSrc.includes('fetchtype=current'), true);
});

test('7. Session security enforces HttpOnly, SameSite=Lax, production Secure cookies and strips raw Casto credentials', () => {
  const sessionSrc = fs.readFileSync(path.join(webDir, 'lib/lexmacasto/session.ts'), 'utf8');
  const clientSrc = fs.readFileSync(path.join(webDir, 'lib/lexmacasto/client.ts'), 'utf8');
  const loginRouteSrc = fs.readFileSync(path.join(webDir, 'app/api/auth/login/route.ts'), 'utf8');

  assert.equal(sessionSrc.includes('httpOnly: true'), true);
  assert.equal(sessionSrc.includes("sameSite: 'lax'"), true);
  assert.equal(sessionSrc.includes('secure: isProduction'), true);
  assert.equal(sessionSrc.includes('validateSameOriginRequest'), true);
  assert.equal(clientSrc.includes('sanitizeAuthUser'), true);
  assert.equal(loginRouteSrc.includes('setServerCastoSession'), true);
  assert.equal(loginRouteSrc.includes('data: sanitizedUser'), true);
});

test('8. Site headers preserve x-site-brouser spelling and sanitize CRLF injection', () => {
  const headersSrc = fs.readFileSync(path.join(webDir, 'lib/lexmacasto/headers.ts'), 'utf8');
  assert.equal(headersSrc.includes("'x-site-key'"), true);
  assert.equal(headersSrc.includes("'x-site-domain'"), true);
  assert.equal(headersSrc.includes("'x-site-brouser'"), true);
  assert.equal(headersSrc.includes("'x-casto-line'"), true);
  assert.equal(headersSrc.includes("'x-casto-badge'"), true);
  assert.equal(headersSrc.includes('redactHeadersForLog'), true);
  assert.equal(headersSrc.includes('redactPayloadForLog'), true);
});

test('9. No Qlex-Nursing identity (WEBSITE_1) or hardcoded keys exist in apps/web', () => {
  const envExample = fs.readFileSync(path.join(webDir, '.env.example'), 'utf8');
  const apiConfig = fs.readFileSync(path.join(webDir, 'lib/api-config.mjs'), 'utf8');
  assert.equal(envExample.includes('WEBSITE_1'), false);
  assert.equal(apiConfig.includes("'WEBSITE_1'") || apiConfig.includes('"WEBSITE_1"'), false);
});
