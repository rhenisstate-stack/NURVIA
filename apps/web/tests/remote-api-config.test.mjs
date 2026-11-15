import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveBackendBaseUrl,
  isHttpsBackendUrl,
  getSkewLineServerConfig,
} from '../lib/api-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webDir, '../..');

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err);
    process.exitCode = 1;
  }
}

console.log('--- NURVIA REMOTE API & ENVIRONMENT CONFIGURATION TEST SUITE ---');

test('1. Resolves SKEW_LINE_DOTNET_BASE_URL and strips trailing slashes', () => {
  const url = resolveBackendBaseUrl({
    SKEW_LINE_ACTIVE_BACKEND: 'dotnet',
    SKEW_LINE_DOTNET_BASE_URL: 'http://108.61.9.189:8008///',
  });
  assert.equal(url, 'http://108.61.9.189:8008');
});

test('2. Falls back to legacy NEXT_PUBLIC_API_URL when SKEW_LINE_DOTNET_BASE_URL is unset', () => {
  const url = resolveBackendBaseUrl({
    NEXT_PUBLIC_API_URL: 'https://api.nurvia.example/',
  });
  assert.equal(url, 'https://api.nurvia.example');
});

test('3. Fails closed when no backend URL is configured (no silent localhost fallback)', () => {
  assert.throws(
    () => resolveBackendBaseUrl({}),
    /NURVIA backend URL is not configured/
  );
});

test('4. Rejects unreplaced placeholder URLs and malformed URLs', () => {
  assert.throws(
    () => resolveBackendBaseUrl({ SKEW_LINE_DOTNET_BASE_URL: '<VERIFIED_DOTNET_BASE_URL>' }),
    /not configured/
  );
  assert.throws(
    () => resolveBackendBaseUrl({ SKEW_LINE_DOTNET_BASE_URL: 'not-a-valid-url' }),
    /Invalid NURVIA backend URL format/
  );
});

test('5. Rejects non-HTTP/HTTPS protocols and unsupported active backend', () => {
  assert.throws(
    () => resolveBackendBaseUrl({ SKEW_LINE_DOTNET_BASE_URL: 'ftp://108.61.9.189:8008' }),
    /Unsupported NURVIA backend protocol/
  );
  assert.throws(
    () => resolveBackendBaseUrl({ SKEW_LINE_ACTIVE_BACKEND: 'unknown', SKEW_LINE_DOTNET_BASE_URL: 'http://108.61.9.189:8008' }),
    /Unsupported SKEW_LINE_ACTIVE_BACKEND/
  );
});

test('6. Enforces HTTPS when requireHttps option is enabled', () => {
  assert.throws(
    () =>
      resolveBackendBaseUrl(
        { SKEW_LINE_DOTNET_BASE_URL: 'http://108.61.9.189:8008' },
        { requireHttps: true }
      ),
    /HTTPS is required/
  );
  assert.equal(
    resolveBackendBaseUrl(
      { SKEW_LINE_DOTNET_BASE_URL: 'https://api.nurvia.example' },
      { requireHttps: true }
    ),
    'https://api.nurvia.example'
  );
  assert.equal(isHttpsBackendUrl('https://api.nurvia.example'), true);
  assert.equal(isHttpsBackendUrl('http://108.61.9.189:8008'), false);
});

test('7. getSkewLineServerConfig exposes boolean appKeyConfigured without leaking raw key', () => {
  const cfg = getSkewLineServerConfig({
    SKEW_LINE_APP_NAME: 'Nurvia',
    SKEW_LINE_APP_KEY: 'SECRET_KEY_VALUE',
    SKEW_LINE_DOTNET_BASE_URL: 'http://108.61.9.189:8008',
  });
  assert.equal(cfg.appKeyConfigured, true);
  assert.equal(JSON.stringify(cfg).includes('SECRET_KEY_VALUE'), false);
});

test('8. Environment templates use safe placeholders and .gitignore excludes .env.local', () => {
  const envExample = fs.readFileSync(path.join(webDir, '.env.example'), 'utf8');
  const envLocalExample = fs.readFileSync(path.join(webDir, '.env.local.example'), 'utf8');
  const gitignore = fs.readFileSync(path.join(repoRoot, '.gitignore'), 'utf8');

  assert.equal(envExample.includes('108.61.9.189'), false);
  assert.equal(envLocalExample.includes('108.61.9.189'), false);
  assert.equal(envExample.includes('<VERIFIED_DOTNET_BASE_URL>'), true);
  assert.equal(gitignore.includes('.env.local'), true);
});
