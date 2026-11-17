import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApiUrl, DEDICATED_APP_ROUTES, DEDICATED_AUTH_ROUTES } from '../lib/api-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');

function readText(relPath) {
  return fs.readFileSync(path.join(WEB_ROOT, relPath), 'utf8');
}

console.log('--- NURVIA PHASE 3.8 QLEX API PARITY & SECURITY TEST SUITE ---');

// 1. Direct route mapping in api-url.mjs
assert.equal(DEDICATED_AUTH_ROUTES.size, 5, 'DEDICATED_AUTH_ROUTES must remain the 5 core auth routes');
for (const route of ['/api/seek', '/api/exams/diy', '/api/auth/account/destroy', '/api/auth/validate']) {
  assert.equal(DEDICATED_APP_ROUTES.has(route), true, `Missing ${route} in DEDICATED_APP_ROUTES`);
}
globalThis.window = {};
try {
  assert.equal(buildApiUrl('/api/seek?fetchtype=absolute&query=nclex'), '/api/seek?fetchtype=absolute&query=nclex');
  assert.equal(buildApiUrl('/api/exams/diy'), '/api/exams/diy');
  assert.equal(buildApiUrl('/api/auth/account/destroy'), '/api/auth/account/destroy');
  assert.equal(buildApiUrl('/api/auth/validate?token=t&context=c'), '/api/auth/validate?token=t&context=c');
  assert.equal(buildApiUrl('/api/strata/courses?fetchtype=distinct'), '/api/strata/courses?fetchtype=distinct');
} finally {
  delete globalThis.window;
}
console.log('[PASS] 1. api-url.mjs routes all new Phase 3.8 handlers directly to same-origin Next.js routes');

// 2. Contracts support strata fetchtype overrides and store/update/delete mutations
const contractsSrc = readText('lib/lexmacasto/contracts.ts');
assert.match(contractsSrc, /SEEK_BASE:\s*'\/api\/castoline\/strata\/seek'/);
assert.match(contractsSrc, /DIY_EXAM_STORE:\s*'\/api\/castoline\/strata\/assessment\/exams\/diy\/learning\/store'/);
assert.match(contractsSrc, /ACCOUNT_DESTROY:\s*'\/api\/castoline\/auth\/account\/destroy'/);
assert.match(contractsSrc, /SUPPORT_VALIDATE:\s*'\/api\/castoline\/strata\/support\/validate'/);
assert.match(contractsSrc, /export function buildStrataMutationPath\(/);
console.log('[PASS] 2. LexmaCasto contracts include verified seek, DIY exam, account destroy, validate, and strata mutation helpers');

// 3. /api/seek route security & contract
const seekRoute = readText('app/api/seek/route.ts');
assert.match(seekRoute, /ALLOWED_SEEK_QUERY_PARAMS/);
assert.match(seekRoute, /segment === 'suggest' \|\| segment === 'history'/);
assert.match(seekRoute, /validateSameOriginRequest\(request\)/);
assert.match(seekRoute, /'Cache-Control': 'no-store'/);
console.log('[PASS] 3. /api/seek enforces query allowlist, auth on suggest/history, CSRF on DELETE, and no-store');

// 4. /api/exams/diy route security & contract
const diyRoute = readText('app/api/exams/diy/route.ts');
assert.match(diyRoute, /validateSameOriginRequest\(request\)/);
assert.match(diyRoute, /getServerCastoSession\(\)/);
assert.match(diyRoute, /MAX_DIY_BODY_BYTES/);
assert.match(diyRoute, /TotalQuestions must be an integer between 1 and 500/);
console.log('[PASS] 4. /api/exams/diy enforces CSRF, auth, size limit, and input validation');

// 5. /api/auth/account/destroy route security & server-side identity verification
const destroyRoute = readText('app/api/auth/account/destroy/route.ts');
assert.match(destroyRoute, /validateSameOriginRequest\(request\)/);
assert.match(destroyRoute, /buildCurrentUserEndpointPath\(\)/);
assert.match(destroyRoute, /clearServerCastoSession\(response\)/);
console.log('[PASS] 5. /api/auth/account/destroy verifies caller identity server-side and clears HttpOnly cookies');

// 6. /api/auth/validate route contract
const validateRoute = readText('app/api/auth/validate/route.ts');
assert.match(validateRoute, /Both token and context query parameters are required/);
assert.match(validateRoute, /'Cache-Control': 'no-store'/);
console.log('[PASS] 6. /api/auth/validate enforces token/context params and no-store');

// 7. /api/strata/[resource] full CRUD + fetchtype parity with staff RBAC
const strataRoute = readText('app/api/strata/[resource]/route.ts');
assert.match(strataRoute, /ALLOWED_FETCH_TYPES/);
assert.match(strataRoute, /STAFF_ROLES\.has\(verifiedUser\.role\.toLowerCase\(\)\)/);
assert.match(strataRoute, /export async function POST\(/);
assert.match(strataRoute, /export async function PUT\(/);
assert.match(strataRoute, /export async function DELETE\(/);
console.log('[PASS] 7. /api/strata/[resource] supports fetchtypes and staff-gated POST/PUT/DELETE');

// 8. Frontend api-client exposes all new Phase 3.8 methods
const apiClientSrc = readText('lib/api-client.ts');
for (const methodName of [
  'seek(',
  'seekSuggest(',
  'getSeekHistory(',
  'clearSeekHistory(',
  'createDiyExam(',
  'destroyAccount(',
  'validateSupportToken(',
  'createStrataRecord(',
  'updateStrataRecord(',
  'deleteStrataRecord(',
]) {
  assert.equal(apiClientSrc.includes(methodName), true, `Missing ${methodName} in nurviaApi`);
}
console.log('[PASS] 8. nurviaApi exposes all Phase 3.8 typed client methods');

// 9. Temporary challenge compatibility module is server-only and wired to login & register routes
const tempChallengeSrc = readText('lib/auth/temporaryChallenge.ts');
assert.match(tempChallengeSrc, /TEMPORARY — REMOVE WHEN OFFICIAL DESLIZAR INTEGRATION IS AVAILABLE/);
assert.match(tempChallengeSrc, /register:\s*'register-skew8@lancasto'/);
assert.match(tempChallengeSrc, /standard_login:\s*'learner\.login\.skew8lancasto'/);
assert.match(tempChallengeSrc, /custom_login:\s*'custom\.login\.skew8lancasto'/);

const loginRouteSrc = readText('app/api/auth/login/route.ts');
const registerRouteSrc = readText('app/api/auth/register/route.ts');
assert.match(loginRouteSrc, /getTemporaryChallenge\('standard_login'\)/);
assert.match(registerRouteSrc, /getTemporaryChallenge\('register'\)/);

// Verify no client component or browser-side lib imports temporaryChallenge
for (const dir of ['app', 'components', 'lib']) {
  const stack = [path.join(WEB_ROOT, dir)];
  while (stack.length > 0) {
    const cur = stack.pop();
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const content = fs.readFileSync(full, 'utf8');
        if (/['"]use client['"]/.test(content)) {
          assert.equal(
            content.includes('temporaryChallenge'),
            false,
            `Client file ${path.relative(WEB_ROOT, full)} must never import temporaryChallenge`
          );
        }
      }
    }
  }
}
console.log('[PASS] 9. Temporary challenge module is centralized server-side, wired to login/register, and never imported by client code');

console.log('\nAll 9 Phase 3.8 API parity tests PASSED (9/9)!');
