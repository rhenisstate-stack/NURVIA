import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.\w+$/.test(specifier)) {
      for (const ext of ['.ts', '.mjs', '.js']) {
        try {
          return nextResolve(`${specifier}${ext}`, context);
        } catch {
          // try next extension
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.ts')) {
      const source = fs.readFileSync(fileURLToPath(url), 'utf8');
      const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
        fileName: fileURLToPath(url),
      });
      return { format: 'module', shortCircuit: true, source: outputText };
    }
    return nextLoad(url, context);
  },
});

const { nurviaApi } = await import('../lib/api-client.ts');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');

function readText(relPath) {
  return fs.readFileSync(path.join(WEB_ROOT, relPath), 'utf8');
}

console.log('--- NURVIA PHASE 3.10 / 3.10.1 LEARNER FILTERS, STUDY LIBRARY & ACCOUNT MENU TEST SUITE ---');

const apiClientSrc = readText('lib/api-client.ts');
const strataFiltersSrc = readText('lib/lexmacasto/strata-filters.ts');
const studyViewSrc = readText('components/study/study-library-view.tsx');
const advFiltersSrc = readText('components/study/StudyLibraryAdvancedFilters.tsx');
const accountMenuSrc = readText('components/layout/user-account-menu.tsx');
const publicCarePlansSrc = readText('app/care-plans/page.tsx');
const publicCommunitySrc = readText('app/community/page.tsx');

// 1. Behavioral test: Study Library empty catalogue returns genuine empty PagedResult without fabricating cards
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async (url) => {
    const u = String(url);
    assert.match(u, /\/api\/strata\/exams\?/);
    assert.match(u, /fetchtype=absolute/);
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Absolute Exams Fetched Successfully',
        data: { items: [], skewPage: 1, skewPerPage: 12, skewTotal: 0, skewTotalPages: 0 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const emptyRes = await nurviaApi.getStudyLibrary({ pathway: 'RN', pageNumber: 1, pageSize: 12 });
  assert.equal(emptyRes.success, true);
  assert.equal(emptyRes.data?.items.length, 0);
  assert.equal(emptyRes.data?.totalCount, 0);
  assert.equal(emptyRes.data?.totalPages, 1);
  console.log('[PASS] 1. Behavioral: Study Library empty backend catalogue returns genuine empty state without fabricated cards');

  // 2. Behavioral test: Study Library filters out Draft/Archived records and updates totalCount when local filters apply
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: true,
        message: 'OK',
        data: {
          items: [
            { guidId: 'ex-1', title: 'RN ATI Med-Surg', pathway: 'RN', category: 'ATI', status: 'Published', questionsCount: 50, duration: 60 },
            { guidId: 'ex-2', title: 'PN Exit Predictor', pathway: 'PN_Exit', category: 'ExitPredictor', status: 'Published', questionsCount: 85, duration: 90 },
            { guidId: 'ex-3', title: 'Unpublished Draft', pathway: 'RN', category: 'ATI', status: 'Draft', questionsCount: 20, duration: 30 },
          ],
          skewPage: 1,
          skewPerPage: 12,
          skewTotal: 3,
          skewTotalPages: 1,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  const filteredRes = await nurviaApi.getStudyLibrary({ pathway: 'RN', category: 'ATI', pageNumber: 1, pageSize: 12 });
  assert.equal(filteredRes.success, true);
  assert.equal(filteredRes.data?.items.length, 1);
  assert.equal(filteredRes.data?.items[0].id, 'ex-1');
  assert.equal(filteredRes.data?.totalCount, 1);
  console.log('[PASS] 2. Behavioral: Study Library excludes Draft records, filters by pathway/category, and adjusts filtered totalCount');

  // 3. Behavioral test: All 8 unprovisioned modules fail closed with 501 NOT_PROVISIONED without calling fetch
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error('fetch should not be called for unprovisioned modules');
  };

  const unprovisionedResults = await Promise.all([
    nurviaApi.getSavedStudySets(),
    nurviaApi.getStudyLibrary({ savedOnly: true }),
    nurviaApi.getStudyGuides(),
    nurviaApi.getFlashcards({ dueOnly: false }),
    nurviaApi.getCarePlans(),
    nurviaApi.getTutorSessions(),
    nurviaApi.getSavedQuestions(),
    nurviaApi.getCommunityPosts(),
    nurviaApi.getMySubscription(),
  ]);
  assert.equal(fetchCalled, false, 'Unprovisioned modules must not issue guaranteed-404 network requests');
  for (const res of unprovisionedResults) {
    assert.equal(res.success, false);
    assert.equal(res.statusCode, 501);
    assert.equal(res.errorCode, 'NOT_PROVISIONED');
  }
  console.log('[PASS] 3. Behavioral: All unprovisioned modules return 501 NOT_PROVISIONED with zero 404 network calls');
} finally {
  globalThis.fetch = originalFetch;
}

// 4. Contract & UI checks: public Care Plans / Community render role="alert" on 501; Study Library handles stale requests and resets
assert.equal(apiClientSrc.includes("request(`/api/study-library"), false);
assert.equal(apiClientSrc.includes("request('/api/study-library/filters')"), false);
assert.equal(apiClientSrc.includes("request('/api/study-library/summary')"), false);
assert.match(publicCarePlansSrc, /unavailableError/);
assert.match(publicCarePlansSrc, /role="alert"/);
assert.match(publicCommunitySrc, /unavailableError/);
assert.match(publicCommunitySrc, /role="alert"/);
assert.match(strataFiltersSrc, /difficulties:\s*Array\.from\(difficultySet\)/);
assert.match(studyViewSrc, /let active = true/);
assert.match(studyViewSrc, /filtersLoading/);
assert.match(studyViewSrc, /if \(category === "ExitPredictor" && next !== "All" && next !== "RN_Exit" && next !== "PN_Exit"\)/);
assert.match(advFiltersSrc, /filteredExams/);
assert.match(advFiltersSrc, /disabled=\{filtersLoading \|\| filteredExams\.length === 0\}/);
console.log('[PASS] 4. Study Library stale-request guards, dependent filter resets, and public 501 alert states verified');

// 5. Avatar Account Menu ARIA & keyboard lifecycle
assert.match(accountMenuSrc, /aria-expanded=\{open\}/);
assert.match(accountMenuSrc, /aria-haspopup="menu"/);
assert.match(accountMenuSrc, /aria-controls=\{open \? menuId : undefined\}/);
assert.match(accountMenuSrc, /role="menu"/);
assert.match(accountMenuSrc, /role="menuitem"/);
assert.match(accountMenuSrc, /event\.key === "Escape"/);
assert.match(accountMenuSrc, /event\.key === "ArrowDown"/);
assert.match(accountMenuSrc, /event\.key === "ArrowUp"/);
assert.match(accountMenuSrc, /setOpen\(false\);\s*router\.replace\("\/"\);/);
console.log('[PASS] 5. UserAccountMenu ARIA menu semantics, aria-controls, keyboard navigation, and sign-out verified');

console.log('\nAll 5 Phase 3.10.1 behavioral & contract tests PASSED (5/5)!');
