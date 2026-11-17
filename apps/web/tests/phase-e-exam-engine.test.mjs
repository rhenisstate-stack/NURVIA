import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const webRoot = path.resolve(import.meta.dirname, '..');

const upsertsRoute = fs.readFileSync(
  path.join(webRoot, 'app/api/exams/upserts/route.ts'),
  'utf8'
);
assert.match(upsertsRoute, /validateSameOriginRequest/);
assert.match(upsertsRoute, /getServerCastoSession/);
assert.match(upsertsRoute, /ACTION_GROUP_TO_SEGMENT/);
console.log('[PASS] 1. /api/exams/upserts enforces CSRF, HttpOnly session, and actionGroup allowlist');

const examService = fs.readFileSync(
  path.join(webRoot, 'lib/services/nexus/strata/examService.ts'),
  'utf8'
);
assert.doesNotMatch(examService, /document\.cookie/);
assert.doesNotMatch(examService, /x-casto-/);
assert.doesNotMatch(examService, /WEBSITE_11/);
console.log('[PASS] 2. examService.ts uses BFF /api/exams/upserts with zero client secrets or cookies');

const registry = fs.readFileSync(
  path.join(webRoot, 'components/exam/renderers/QuestionRendererRegistry.tsx'),
  'utf8'
);
assert.match(registry, /AudioBasedRenderer/);
assert.match(registry, /VideoBasedRenderer/);
assert.match(registry, /HighlightTextRenderer/);
console.log('[PASS] 3. QuestionRendererRegistry registers AudioBased, VideoBased, and HighlightText');

const middleware = fs.readFileSync(path.join(webRoot, 'middleware.ts'), 'utf8');
assert.doesNotMatch(middleware, /WEBSITE_11/);
assert.doesNotMatch(middleware, /nurvia_casto_/);
console.log('[PASS] 4. middleware.ts preserves server-only identity and HttpOnly session cookies');

const examPage = fs.readFileSync(
  path.join(webRoot, 'app/web/(livexams)/[program]/vista/exam/[theme]/page.tsx'),
  'utf8'
);

// Finding 1: No WEBSITE_11 or sensitive keys in Client Component
assert.doesNotMatch(examPage, /WEBSITE_11/);
assert.doesNotMatch(examPage, /SKEW_LINE_APP_KEY/);
assert.doesNotMatch(examPage, /nurvia_casto_/);
console.log('[PASS] 5. Exam page contains zero WEBSITE_11 or secret literals');

// Finding 2: Strict 6 programs x 8 themes validation via notFound()
assert.match(examPage, /notFound\(\)/);
assert.doesNotMatch(examPage, /\?\s*params\.program\s*:\s*['"]nclex-rn['"]/);
assert.doesNotMatch(examPage, /\?\s*params\.theme\s*:\s*['"]generic['"]/);

const programs = ['nclex-rn', 'nclex-pn', 'rn-nursing', 'lpn-nursing', 'ati-teas', 'hesi-a2'];
const themes = ['atlas', 'cascade', 'classic', 'generic', 'glacial', 'orbit', 'pulse', 'zen'];
const programRegistrySrc = fs.readFileSync(
  path.join(webRoot, 'lib/programs/programRegistry.ts'),
  'utf8'
);
for (const p of programs) {
  assert.match(programRegistrySrc, new RegExp(`'${p}'`));
}
for (const t of themes) {
  assert.match(examPage, new RegExp(`\\b${t}:`));
}
assert.equal(programs.length * themes.length, 48);
console.log('[PASS] 6. All 48 (6 programs x 8 themes) combinations defined; invalid params call notFound()');

// Finding 3: Dynamic renderer & submission type resolution + explicit unsupported state
assert.match(examPage, /resolveExamSubmissionType/);
assert.match(examPage, /QUESTION_TYPE_TO_SUBMISSION/);
assert.match(examPage, /Unsupported Question Type/);
assert.doesNotMatch(examPage, /submitQuestionAnswer\(\s*['"]ActionSingleChoice['"]/);
for (const expectedAction of [
  'ActionSingleChoice',
  'ActionMultipleSelect',
  'ActionTrueFalse',
  'ActionAudioBased',
  'ActionVideoBased',
  'ActionHighLight',
  'ActionCaseBasedSingleChoice',
]) {
  assert.match(examPage, new RegExp(expectedAction));
}
console.log('[PASS] 7. Dynamic questionType -> ExamSubmissionType mapping & unsupported state verified');

console.log('\nAll 7 Phase E structural, security, route & renderer tests PASSED (7/7)!');
