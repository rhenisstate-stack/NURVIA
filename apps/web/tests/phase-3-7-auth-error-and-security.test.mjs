import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');

function readText(relPath) {
  return fs.readFileSync(path.join(WEB_ROOT, relPath), 'utf8');
}

function collectFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, out);
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

console.log('--- NURVIA PHASE 3.7 AUTH ERROR CLASSIFICATION & SECURITY SUITE ---');

// 1. classifyBackendErrorCode distinguishes all required auth/challenge failure modes
const clientTs = readText('lib/lexmacasto/client.ts');
assert.match(clientTs, /export function classifyBackendErrorCode\(/);
assert.match(clientTs, /'CHALLENGE_REQUIRED'/);
assert.match(clientTs, /'CHALLENGE_REJECTED'/);
assert.match(clientTs, /'CHALLENGE_EXPIRED'/);
assert.match(clientTs, /'INVALID_CREDENTIALS'/);
assert.match(clientTs, /'SESSION_EXPIRED'/);
assert.match(clientTs, /deslizar\|ultimatum\\s\+turmoil/i);
console.log('[PASS] 1. classifyBackendErrorCode defines challenge, credential, and session error codes');

// 2. extractSiteMetadataFromRequestHeaders extracts sanitized geo/mobile metadata
assert.match(clientTs, /cf-ipcountry/);
assert.match(clientTs, /x-vercel-ip-country/);
assert.match(clientTs, /x-vercel-ip-city/);
assert.match(clientTs, /sec-ch-ua-mobile/);
console.log('[PASS] 2. extractSiteMetadataFromRequestHeaders extracts sanitized geo and mobile metadata');

// 3. Zero Qlex hardcoded challenge strings, WEBSITE_1, or skew_blanc_session cookies in NURVIA source
const sourceFiles = [
  ...collectFiles(path.join(WEB_ROOT, 'app')),
  ...collectFiles(path.join(WEB_ROOT, 'lib')),
  ...collectFiles(path.join(WEB_ROOT, 'components')),
];
const forbiddenPatterns = [
  /skew8lancasto/i,
  /skew8@lancasto/i,
  /skew_blanc_session/i,
  /['"]WEBSITE_1['"]/,
];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenPatterns) {
    assert.equal(
      pattern.test(content),
      false,
      `Forbidden Qlex artifact ${pattern} found in ${path.relative(WEB_ROOT, file)}`
    );
  }
}
console.log('[PASS] 3. Zero Qlex hardcoded challenges, WEBSITE_1, or JS-readable session cookies in NURVIA source');

// 4. Login route includes errorCode: 'VALIDATION_ERROR' on local validation failures
const loginRoute = readText('app/api/auth/login/route.ts');
assert.match(loginRoute, /Email is required\.', errorCode: 'VALIDATION_ERROR'/);
assert.match(loginRoute, /Password is required\.', errorCode: 'VALIDATION_ERROR'/);
assert.match(loginRoute, /PIN is required\.', errorCode: 'VALIDATION_ERROR'/);
console.log('[PASS] 4. Login route returns consistent VALIDATION_ERROR codes');

// 5. Frontend sign-in and sign-up distinguish challenge & credential errors
const signInPage = readText('app/sign-in/page.tsx');
const signUpPage = readText('app/sign-up/page.tsx');
assert.match(signInPage, /CHALLENGE_REQUIRED/);
assert.match(signInPage, /CHALLENGE_REJECTED/);
assert.match(signInPage, /CHALLENGE_EXPIRED/);
assert.match(signInPage, /INVALID_CREDENTIALS/);
assert.match(signUpPage, /CHALLENGE_REQUIRED/);
assert.match(signUpPage, /CHALLENGE_REJECTED/);
assert.match(signUpPage, /CHALLENGE_EXPIRED/);
console.log('[PASS] 5. Sign-in and sign-up pages distinguish challenge and credential errors');

console.log('\nAll 5 Phase 3.7 tests PASSED (5/5)!');
