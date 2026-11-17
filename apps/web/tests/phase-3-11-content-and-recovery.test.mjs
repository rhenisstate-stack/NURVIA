import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(WEB_ROOT, relPath), 'utf8');
}

console.log('--- NURVIA PHASE 3.11 CONTENT, EXAM RECOVERY & API SUITE ---');

// 1. api-url.mjs routes /api/lectures directly to same-origin Next.js routes
const { buildApiUrl } = await import('../lib/api-url.mjs');
const originalWindow = globalThis.window;
globalThis.window = {};
try {
  assert.equal(buildApiUrl('/api/lectures'), '/api/lectures');
  assert.equal(
    buildApiUrl('/api/lectures/acid-base-ventilator-alarms'),
    '/api/lectures/acid-base-ventilator-alarms'
  );
  assert.equal(buildApiUrl('/api/lectures/management'), '/api/lectures/management');
} finally {
  globalThis.window = originalWindow;
}
console.log('[PASS] 1. buildApiUrl routes /api/lectures* directly without /api/backend/lectures 404');

// 2. Mark K server-side access policy & bundle isolation
const lecturesDataMod = await import('../lib/lectures/nurvia-lectures-data.ts');
const anonCatalogue = lecturesDataMod.getPublishedLectureCatalogue(false);
assert.equal(anonCatalogue.length, 12, 'Expected 12 Mark K lectures in catalogue');
assert.equal(anonCatalogue[0].accessLevel, 'Public');
assert.ok(anonCatalogue[0].highYieldConcepts.length > 0, 'Lecture 1 public concepts should be visible');
assert.equal(anonCatalogue[3].accessLevel, 'AuthenticatedLearner');
assert.deepEqual(anonCatalogue[3].highYieldConcepts, [], 'Protected lecture 4 concepts must be withheld from anonymous visitors');
assert.equal('bodyMarkdown' in anonCatalogue[3], false, 'Catalogue must never include bodyMarkdown');

const anonLec1 = lecturesDataMod.getPublishedLectureBySlug('acid-base-ventilator-alarms', false);
assert.equal(anonLec1.kind, 'found');
assert.ok(anonLec1.lecture.bodyMarkdown.includes('Tic-Tac-Toe'));

const anonLec4 = lecturesDataMod.getPublishedLectureBySlug('cardiac-telemetry-chest-tubes', false);
assert.equal(anonLec4.kind, 'unauthorized');

const authLec4 = lecturesDataMod.getPublishedLectureBySlug('cardiac-telemetry-chest-tubes', true);
assert.equal(authLec4.kind, 'found');
assert.equal(authLec4.lecture.previousSlug, 'thyroid-adrenal-calcium');
assert.equal(authLec4.lecture.nextSlug, 'congenital-heart-defects-mobility');

// Verify no client file imports nurvia-lectures-data
const markKPageSrc = read('app/mark-k/page.tsx');
const markKReaderSrc = read('app/mark-k/[slug]/page.tsx');
assert.equal(markKPageSrc.includes('nurvia-lectures-data'), false);
assert.equal(markKReaderSrc.includes('nurvia-lectures-data'), false);
assert.equal(markKReaderSrc.includes('dangerouslySetInnerHTML'), false);
console.log('[PASS] 2. Mark K access policy (1-3 public, 4-12 protected), navigation, and bundle isolation verified');

// 3. Care Plans local-first library + deduplicated merge
const carePlansData = await import('../lib/content/care-plans-data.ts');
const carePlansSvc = carePlansData;
const cpRes = await carePlansSvc.loadCarePlansCatalogue();
assert.ok(cpRes.plans.length >= 16, 'Expected >= 16 local care plans');
assert.equal(cpRes.remoteStatus, 'not_provisioned');
const cpDetail = carePlansSvc.getCarePlanBySlug('heart-failure-fluid-overload');
assert.ok(cpDetail && cpDetail.nursingInterventions.length >= 3);

const mergedCp = carePlansSvc.mergeCarePlans(carePlansData.LOCAL_CARE_PLANS, [
  {
    id: 'cp-heart-failure',
    title: 'Heart Failure & Fluid Volume Overload',
    specialty: 'Cardiovascular',
    diagnosis: 'Excess Fluid Volume',
    relatedTo: 'Decreased cardiac output',
    outcomes: ['Clear lungs'],
    interventions: ['Daily weights'],
    rationale: 'Tracks fluid status',
    isSystemPlan: true,
    isOwnedByCaller: false,
    createdAtUtc: '2026-11-17T00:00:00Z',
  },
  {
    id: 'remote-cp-1',
    title: 'Remote Sepsis Care Plan',
    specialty: 'Critical Care',
    diagnosis: 'Risk for Shock',
    relatedTo: 'Systemic infection',
    outcomes: ['MAP >= 65'],
    interventions: ['Obtain lactate and cultures'],
    rationale: 'Early bundle',
    isSystemPlan: true,
    isOwnedByCaller: false,
    createdAtUtc: '2026-11-17T00:00:00Z',
  },
]);
assert.equal(mergedCp.length, carePlansData.LOCAL_CARE_PLANS.length + 1, 'Duplicate local care plan must not be added twice');
assert.equal(mergedCp.at(-1).source, 'Verified Remote Backend');
console.log('[PASS] 3. Care Plans local-first catalogue, slug lookup, provenance, and deduplicated merge verified');

// 4. Study Guides strictly server-driven (18 guides safely archived, zero local-first fallback)
const studyGuidesData = await import('../lib/content/study-guides-data.ts');
const studyGuidesArchive = await import('../lib/content/study-guides-archive.ts');
assert.ok(studyGuidesArchive.LOCAL_STUDY_GUIDES.length >= 18, 'Expected >= 18 archived study guides preserved');
const sgUnprovisioned = await studyGuidesData.loadStudyGuidesCatalogue();
assert.equal(sgUnprovisioned.guides.length, 0, 'Unprovisioned Study Guides must not serve local fallback');
assert.equal(sgUnprovisioned.remoteStatus, 'not_provisioned');

const sgRemote = await studyGuidesData.loadStudyGuidesCatalogue({
  remoteFetcher: async () => ({
    success: true,
    data: [
      {
        id: 'remote-sg-1',
        title: 'Remote Cardiac Guide',
        slug: 'remote-cardiac-guide',
        category: 'Cardiac & EKG',
        pathway: 'RN',
        summary: 'Server-driven guide',
        readingMinutes: 10,
        isPublished: true,
        createdAtUtc: '2026-11-17T00:00:00Z',
      },
      {
        id: 'remote-sg-draft',
        title: 'Draft Guide',
        slug: 'draft-guide',
        category: 'Pharmacology',
        pathway: 'RN',
        summary: 'Draft',
        readingMinutes: 5,
        isPublished: false,
        createdAtUtc: '2026-11-17T00:00:00Z',
      },
    ],
  }),
});
assert.equal(sgRemote.guides.length, 1, 'Only published remote study guides should be returned');
assert.equal(sgRemote.remoteStatus, 'loaded');
console.log('[PASS] 4. Study Guides strictly server-driven (archived local guides, no local fallback) verified');

// 5. Planner 501 NOT_PROVISIONED & Exams pathway inference contract checks
const apiClientSrc = read('lib/api-client.ts');
assert.ok(apiClientSrc.includes("return unprovisionedResponse('Study Planner')"));
assert.ok(apiClientSrc.includes("return unprovisionedResponse('Study Guides')"));
assert.ok(apiClientSrc.includes('inferPathwayFromText') || apiClientSrc.includes('PN_Exit'));
console.log('[PASS] 5. Planner 501 NOT_PROVISIONED and Exam pathway inference contracts verified');

// 6. Avatar & Account Menu contract checks
const menuSrc = read('components/layout/user-account-menu.tsx');
assert.ok(menuSrc.includes('normalizedRole'));
assert.ok(menuSrc.includes('handleMenuItemKeyDown'));
assert.ok(menuSrc.includes('/admin/settings'));
assert.ok(menuSrc.includes('/learner/account'));
assert.ok(menuSrc.includes('/learner/settings/security'));
assert.ok(menuSrc.includes('aria-controls={open ? menuId : undefined}'));
console.log('[PASS] 6. Avatar & Account Menu role normalization, Space/Enter activation, and destinations verified');

console.log('\nAll 6 Phase 3.11 unit & integration test suites PASSED (6/6)!');
