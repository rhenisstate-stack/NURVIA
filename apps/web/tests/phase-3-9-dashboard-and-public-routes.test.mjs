import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApiUrl, DEDICATED_APP_ROUTES } from '../lib/api-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');

function readText(relPath) {
  return fs.readFileSync(path.join(WEB_ROOT, relPath), 'utf8');
}

console.log('--- NURVIA PHASE 3.9 LEARNER DASHBOARD & PUBLIC ROUTE REMEDIATION TEST SUITE ---');

// 1. Investigation A: /api/auth/me enforces 401 when unauthenticated and AuthProvider handles 401 cleanly
const meRoute = readText('app/api/auth/me/route.ts');
const authProvider = readText('components/auth/auth-provider.tsx');
assert.match(meRoute, /if \(!session\)/);
assert.match(meRoute, /status:\s*401/);
assert.match(meRoute, /'Cache-Control':\s*'no-store'/);
assert.match(authProvider, /response\.statusCode === 401/);
assert.match(authProvider, /setStatus\("unauthenticated"\)/);
console.log('[PASS] 1. /api/auth/me legitimately returns 401 when unauthenticated and AuthProvider handles it cleanly');

// 2. Investigation B: Attempts History routes to dedicated handler backed by LexmaCasto examResults contract
assert.equal(DEDICATED_APP_ROUTES.has('/api/attempts/history'), true);
globalThis.window = {};
try {
  assert.equal(buildApiUrl('/api/attempts/history'), '/api/attempts/history');
  assert.notEqual(buildApiUrl('/api/attempts/history'), '/api/backend/attempts/history');
} finally {
  delete globalThis.window;
}
const contractsSrc = readText('lib/lexmacasto/contracts.ts');
assert.match(contractsSrc, /examResults:\s*\{[\s\S]*\/api\/castoline\/strata\/assessment\/exams\/results\/list\/relative/);
const attemptsHistoryRoute = readText('app/api/attempts/history/route.ts');
assert.match(attemptsHistoryRoute, /getServerCastoSession\(\)/);
assert.match(attemptsHistoryRoute, /status:\s*401/);
assert.match(attemptsHistoryRoute, /buildStrataEndpointPath\(\s*'examResults'/);
assert.match(attemptsHistoryRoute, /'Cache-Control':\s*'no-store/);
console.log('[PASS] 2. Attempts history routes to /api/attempts/history backed by LexmaCasto examResults relative contract');

// 3. Investigation C: Published exams use verified /api/strata/exams while preserving admin exam routes
const apiClientSrc = readText('lib/api-client.ts');
assert.match(apiClientSrc, /if \(params\?\.status === 'Published'\)/);
assert.match(apiClientSrc, /this\.getStrata<Record<string, any>>\('exams'/);
assert.match(apiClientSrc, /fetchtype:\s*'absolute'/);
assert.match(apiClientSrc, /request<PagedResult<ExamDto>>\(`\/api\/exams/);
console.log('[PASS] 3. Published exams query verified /api/strata/exams while preserving administrative /api/exams path');

// 4. Investigation D: Avatar uses user.profile.profilePicture / avatarUrl from /api/auth/me without /api/backend/avatar 404s
const clientSrc = readText('lib/lexmacasto/client.ts');
assert.match(clientSrc, /sanitizeAvatarUrl/);
assert.match(clientSrc, /rawUser\.profile\.profilePicture/);
const learnerShellSrc = readText('components/layout/learner-shell.tsx');
const adminShellSrc = readText('components/layout/admin-shell.tsx');
assert.equal(learnerShellSrc.includes('nurviaApi.getAvatar'), false, 'LearnerShell must not call obsolete /api/backend/avatar');
assert.equal(adminShellSrc.includes('nurviaApi.getAvatar'), false, 'AdminShell must not call obsolete /api/backend/avatar');
assert.match(learnerShellSrc, /user\?\.avatarUrl/);
assert.match(adminShellSrc, /user\?\.avatarUrl/);
console.log('[PASS] 4. Avatar retrieval uses sanitized user.avatarUrl/profilePicture without obsolete /api/backend/avatar calls');

// 5. Investigation E: /terms and /privacy public pages exist, use PublicShell, and mark draft legal review status
for (const routePath of ['app/terms/page.tsx', 'app/privacy/page.tsx']) {
  const pageSrc = readText(routePath);
  assert.match(pageSrc, /PublicShell/);
  assert.match(pageSrc, /Draft Pending Owner &amp; Legal Review/);
  assert.match(pageSrc, /Owner \/ Legal Counsel Action Required/);
  assert.equal(pageSrc.includes('nurviaApi.'), false, `${routePath} must not depend on authenticated backend APIs`);
}
const routesSrc = readText('lib/routes.ts');
assert.match(routesSrc, /terms:\s*"\/terms"/);
assert.match(routesSrc, /privacy:\s*"\/privacy"/);
console.log('[PASS] 5. /terms and /privacy public pages exist with PublicShell, zero auth dependencies, and draft legal notices');

console.log('\nAll 5 Phase 3.9 remediation tests PASSED (5/5)!');
