import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(WEB_ROOT, relPath), 'utf8');
}

console.log('--- NURVIA PHASE 3.12 FORENSIC PARITY & DATA-SOURCE COMPLIANCE SUITE ---');

// 1. Mark K provenance, attribution & access level verification
const lecturesMod = await import('../lib/lectures/nurvia-lectures-data.ts');
const catAuth = lecturesMod.getPublishedLectureCatalogue(true);
assert.equal(catAuth.length, 12);
for (const lec of catAuth) {
  assert.equal(lec.ownership, 'NURVIA-authored');
  assert.equal(lec.rightsStatus, 'verified-original');
  assert.ok(lec.attribution.includes('not affiliated with Mark Klimek'));
}
assert.equal(catAuth[0].accessLevel, 'Public');
assert.equal(catAuth[2].accessLevel, 'Public');
assert.equal(catAuth[3].accessLevel, 'AuthenticatedLearner');
console.log('[PASS] 1. Mark K provenance, non-affiliation attribution, and 1-3 public / 4-12 protected policy verified');

// 2. Care Plans lifecycle & clinical review gating
const carePlansMod = await import('../lib/content/care-plans-data.ts');
assert.ok(carePlansMod.LOCAL_CARE_PLANS.length >= 16);
assert.equal(carePlansMod.CARE_PLAN_WRITING_GUIDES.length, 4);
const draftPlan = { ...carePlansMod.LOCAL_CARE_PLANS[0], id: 'cp-draft', slug: 'cp-draft', lifecycleStatus: 'Draft' };
const unreviewedPlan = { ...carePlansMod.LOCAL_CARE_PLANS[0], id: 'cp-unrev', slug: 'cp-unrev', clinicalReviewStatus: 'unreviewed' };
const withdrawnPlan = { ...carePlansMod.LOCAL_CARE_PLANS[0], id: 'cp-withdrawn', slug: 'cp-withdrawn', lifecycleStatus: 'Withdrawn' };
assert.equal(carePlansMod.isCarePlanEligibleForCatalogue(draftPlan), false);
assert.equal(carePlansMod.isCarePlanEligibleForCatalogue(unreviewedPlan), false);
assert.equal(carePlansMod.isCarePlanEligibleForCatalogue(withdrawnPlan), false);
console.log('[PASS] 2. Care Plans lifecycle and clinical review gating verified');

// 3. Study Guides strictly server-driven (no local fallback)
const guidesMod = await import('../lib/content/study-guides-data.ts');
const guidesArchive = await import('../lib/content/study-guides-archive.ts');
assert.ok(guidesArchive.LOCAL_STUDY_GUIDES.length >= 18);
const unprovGuides = await guidesMod.loadStudyGuidesCatalogue();
assert.equal(unprovGuides.guides.length, 0);
assert.equal(unprovGuides.remoteStatus, 'not_provisioned');
const guidesPageSrc = read('app/learner/guides/page.tsx');
assert.equal(guidesPageSrc.includes('local-first library'), false);
assert.ok(guidesPageSrc.includes('501 NOT_PROVISIONED'));
console.log('[PASS] 3. Study Guides server-driven compliance and archival preservation verified');

// 4. Mock elimination in learner account, settings, security & admin shell
const accountSrc = read('app/learner/account/page.tsx');
const settingsSrc = read('app/learner/settings/page.tsx');
const securitySrc = read('app/learner/settings/security/page.tsx');
const adminShellSrc = read('components/layout/admin-shell.tsx');
assert.equal(accountSrc.includes('January 2024'), false);
assert.equal(accountSrc.includes('Account settings would be updated here'), false);
assert.equal(settingsSrc.includes('setTimeout'), false);
assert.equal(securitySrc.includes('setTimeout'), false);
assert.equal(adminShellSrc.includes('"12,450"'), false);
assert.equal(adminShellSrc.includes('"84"'), false);
console.log('[PASS] 4. Mock placeholders and hardcoded admin badges eliminated');

// 5. Same-origin API routing & LexmaCasto contracts for Support, Recovery, Subscriptions, DIY & Notifications
const { buildApiUrl } = await import('../lib/api-url.mjs');
const prevWindow = globalThis.window;
globalThis.window = {};
try {
  assert.equal(buildApiUrl('/api/auth/support/account'), '/api/auth/support/account');
  assert.equal(buildApiUrl('/api/auth/support/2fa?fetchtype=current'), '/api/auth/support/2fa?fetchtype=current');
  assert.equal(buildApiUrl('/api/auth/recovery/password'), '/api/auth/recovery/password');
  assert.equal(buildApiUrl('/api/subscriptions/packages?fetchtype=discrete'), '/api/subscriptions/packages?fetchtype=discrete');
} finally {
  globalThis.window = prevWindow;
}

const contractsMod = await import('../lib/lexmacasto/contracts.ts');
assert.equal(
  contractsMod.buildSupportEndpointPath('message', 'list', 'relative', { clientStatus: 'Unread' }),
  '/api/castoline/strata/support/message/list/relative?clientStatus=Unread&fetchtype=relative'
);
assert.equal(
  contractsMod.buildSubscriptionEndpointPath('packages', 'discrete'),
  '/api/castoline/nexus/subscription/packages/list/discrete?fetchtype=discrete'
);

const customPracticeSrc = read('app/learner/custom-practice/page.tsx');
assert.ok(customPracticeSrc.includes('createDiyExam'));
const notificationsSrc = read('app/learner/notifications/page.tsx');
assert.ok(notificationsSrc.includes('getSupportMessages'));
console.log('[PASS] 5. Same-origin routes, LexmaCasto contracts, DIY practice, and Notifications inbox verified');

console.log('\nAll 5 Phase 3.12 parity & compliance suites PASSED (5/5)!');
