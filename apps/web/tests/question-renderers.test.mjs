import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

console.log('--- NURVIA STAGE 8: 18 CANONICAL QUESTION RENDERERS VERIFICATION SUITE ---');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

const renderersDir = path.join(webRoot, 'components', 'exam', 'renderers');

// 1. All 18 question renderer component files exist on disk
test('1. Verify all 18 question renderer component files exist on disk', () => {
  const expectedFiles = [
    'SingleChoiceRenderer.tsx',
    'MultipleResponseRenderer.tsx',
    'TrueFalseRenderer.tsx',
    'FillInTheBlankRenderer.tsx',
    'NumericCalculationRenderer.tsx',
    'OrderedResponseRenderer.tsx',
    'MatchingRenderer.tsx',
    'MatrixGridRenderer.tsx',
    'CaseStudyRenderer.tsx',
    'BowTieRenderer.tsx',
    'MultipleTrueFalseRenderer.tsx',
    'ImageBasedRenderer.tsx',
    'MultipleImageSelectionRenderer.tsx',
    'DragAndDropRenderer.tsx',
    'ExtendedResponseRenderer.tsx',
    'TabularResponseRenderer.tsx',
    'ShortAnswerRenderer.tsx',
    'QuestionRendererRegistry.tsx',
    'types.ts',
    'index.ts',
  ];

  for (const f of expectedFiles) {
    const fullPath = path.join(renderersDir, f);
    assert(fs.existsSync(fullPath), `Renderer file missing: ${f}`);
  }
});

// 2. Registry contains all 18 canonical question types (integers 1-18)
test('2. QuestionRendererRegistry dispatches all 18 canonical question type integers (1-18)', () => {
  const registryCode = fs.readFileSync(path.join(renderersDir, 'QuestionRendererRegistry.tsx'), 'utf8');
  for (let i = 1; i <= 18; i++) {
    assert(registryCode.includes(`case "${i}":`), `Registry missing integer case "${i}"`);
  }
});

// 3. Registry contains string aliases for all 18 canonical question types
test('3. QuestionRendererRegistry dispatches string aliases for all 18 canonical question types', () => {
  const registryCode = fs.readFileSync(path.join(renderersDir, 'QuestionRendererRegistry.tsx'), 'utf8');
  const expectedAliases = [
    'singlechoice',
    'multipleresponse',
    'truefalse',
    'fillintheblank',
    'numericcalculation',
    'orderedresponse',
    'matching',
    'matrixgrid',
    'clinicalcasestudy',
    'bowtie',
    'multipletruefalse',
    'imagebased',
    'multipleimageselection',
    'draganddrop',
    'extendedresponse',
    'tabularresponse',
    'shortanswer',
  ];

  for (const alias of expectedAliases) {
    assert(registryCode.includes(`case "${alias}":`), `Registry missing string alias case "${alias}"`);
  }
});

// 4. Verification of Rationale and Feedback Support across renderers
test('4. Question renderers support isReview prop and rationale feedback display', () => {
  const singleChoice = fs.readFileSync(path.join(renderersDir, 'SingleChoiceRenderer.tsx'), 'utf8');
  assert(singleChoice.includes('isReview'), 'SingleChoiceRenderer missing isReview prop handling');
  assert(singleChoice.includes('generalRationale'), 'SingleChoiceRenderer missing generalRationale');

  const multipleResponse = fs.readFileSync(path.join(renderersDir, 'MultipleResponseRenderer.tsx'), 'utf8');
  assert(multipleResponse.includes('isReview'), 'MultipleResponseRenderer missing isReview prop handling');
  assert(multipleResponse.includes('generalRationale'), 'MultipleResponseRenderer missing generalRationale');

  const caseStudy = fs.readFileSync(path.join(renderersDir, 'CaseStudyRenderer.tsx'), 'utf8');
  assert(caseStudy.includes('isReview'), 'CaseStudyRenderer missing isReview prop handling');

  const bowTie = fs.readFileSync(path.join(renderersDir, 'BowTieRenderer.tsx'), 'utf8');
  assert(bowTie.includes('isReview'), 'BowTieRenderer missing isReview prop handling');
});

console.log(`\nAll ${totalTests} question renderer test suites PASSED successfully (${passedTests}/${totalTests})!`);
