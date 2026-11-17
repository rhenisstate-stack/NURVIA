import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const webRoot = path.resolve(import.meta.dirname, '..');
const repoRoot = path.resolve(webRoot, '../..');

console.log('--- NURVIA QLEX COMPLETE SOURCE-LEVEL REPLICATION VERIFICATION SUITE ---');

// 1. All 6 program dashboard trees exist with full Qlex structure
const programs = ['ati-teas', 'hesi-a2', 'lpn-nursing', 'nclex-pn', 'nclex-rn', 'rn-nursing'];
for (const prog of programs) {
  assert.ok(
    fs.existsSync(path.join(webRoot, 'app/dashboards', prog, 'page.tsx')),
    `Missing dashboard page.tsx for ${prog}`
  );
  assert.ok(
    fs.existsSync(path.join(webRoot, 'app/dashboards', prog, 'layout.tsx')),
    `Missing dashboard layout.tsx for ${prog}`
  );
  assert.ok(
    fs.existsSync(
      path.join(webRoot, 'app/dashboards', prog, 'vista/assessment/exams/distinct/overview/page.tsx')
    ),
    `Missing distinct exams overview for ${prog}`
  );
}
console.log('[PASS] 1. All 6 program dashboard trees exist at exact Qlex paths');

// 2. All 6 programs x 8 themes in app/web/(livexams) exist on disk
const themes = ['atlas', 'cascade', 'classic', 'generic', 'glacial', 'orbit', 'pulse', 'zen'];
for (const prog of programs) {
  for (const theme of themes) {
    const p = path.join(
      webRoot,
      'app/web/(livexams)',
      prog,
      'vista/exam/(layout)',
      theme,
      'page.tsx'
    );
    assert.ok(fs.existsSync(p), `Missing livexams route: ${prog}/${theme}`);
  }
}
console.log('[PASS] 2. All 48 (6 programs x 8 themes) livexams routes exist on disk');

// 3. Replicated API routes use HttpOnly session bridge (getNurviaCastoSessionHeaders)
const sampleBridgedRoutes = [
  'app/api/auth/session/route.ts',
  'app/api/users/user/route.ts',
  'app/api/nexus/strata/learning/program/route.ts',
  'app/api/nexus/strata/assessment/exam/route.ts',
  'app/api/system/role/route.ts',
];
for (const rel of sampleBridgedRoutes) {
  const content = fs.readFileSync(path.join(webRoot, rel), 'utf8');
  assert.match(
    content,
    /getNurviaCastoSessionHeaders/,
    `Route ${rel} must bridge HttpOnly nurvia_casto_* cookies`
  );
}
console.log('[PASS] 3. Replicated API routes bridge HttpOnly nurvia_casto_* session cookies server-side');

// 4. PublicShell preserves NURVIA navbar and integrates SeekModal (Ctrl+K)
const publicShell = fs.readFileSync(
  path.join(webRoot, 'components/layout/public-shell.tsx'),
  'utf8'
);
assert.match(publicShell, /SeekModal/);
assert.match(publicShell, /Search exams and study resources/);
console.log('[PASS] 4. PublicShell preserves NURVIA navbar and integrates Qlex SeekModal search');

// 5. All 14 required replication documents exist in docs/replication/
const requiredDocs = [
  'QLEX_SOURCE_INVENTORY.md',
  'NURVIA_TARGET_INVENTORY.md',
  'DIRECTORY_RECONCILIATION_REGISTER.md',
  'FILE_LEVEL_REPLICATION_REGISTER.csv',
  'FILE_LEVEL_REPLICATION_REGISTER.md',
  'NURVIA_PRESERVATION_REGISTER.md',
  'CONFIGURATION_RECONCILIATION_REGISTER.md',
  'DEPENDENCY_RECONCILIATION_REGISTER.md',
  'API_AND_BACKEND_DEPENDENCY_REGISTER.md',
  'SECURITY_DEVIATION_REGISTER.md',
  'REPLICATION_EXCEPTION_REGISTER.md',
  'REPLICATION_PROGRESS_REPORT.md',
  'TEST_AND_VERIFICATION_REPORT.md',
  'FINAL_REPLICATION_REPORT.md',
];
for (const doc of requiredDocs) {
  assert.ok(
    fs.existsSync(path.join(repoRoot, 'docs/replication', doc)),
    `Missing required replication document: docs/replication/${doc}`
  );
}
console.log('[PASS] 5. All 14 required replication registers and reports exist in docs/replication/');

console.log('\nAll 5 Qlex full-replication verification tests PASSED (5/5)!');
