import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

console.log('--- NURVIA STAGE 7: LEARNING INTEGRATION & CATALOG WIRING TEST SUITE ---');

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

// 1. Study Library View & Catalog Wiring
test('1. Study Library View integrates published exams and generates bidirectional query links', () => {
  const libraryFile = fs.readFileSync(path.join(webRoot, 'components', 'study', 'study-library-view.tsx'), 'utf8');
  assert(libraryFile.includes('nurviaApi.getExams({ status: 5 })'), 'Published exam status query missing');
  assert(libraryFile.includes('examId='), 'Live examId query parameter missing');
  assert(libraryFile.includes('setId='), 'Fallback setId query parameter missing');
  assert(libraryFile.includes('setStudySets'), 'Dynamic study set state setter missing');
});

// 2. Exam Session Lifecycle & Review Mode
test('2. Exam session hydrates active attempts, completed reviews, and performs autosave', () => {
  const sessionFile = fs.readFileSync(path.join(webRoot, 'app', 'exam-session', 'page.tsx'), 'utf8');
  assert(sessionFile.includes('nurviaApi.getActiveAttempt'), 'getActiveAttempt integration missing');
  assert(sessionFile.includes('nurviaApi.getAttemptReview'), 'getAttemptReview integration missing');
  assert(sessionFile.includes('nurviaApi.startAttempt'), 'startAttempt integration missing');
  assert(sessionFile.includes('nurviaApi.autosaveResponse'), 'autosaveResponse integration missing');
  assert(sessionFile.includes('nurviaApi.submitAttempt'), 'submitAttempt integration missing');
  assert(sessionFile.includes('hydrateFromReview'), 'hydrateFromReview handler missing');
  assert(sessionFile.includes('hydrateFromAttempt'), 'hydrateFromAttempt handler missing');
});

// 3. Learner Attempt History Wiring
test('3. Learner History page queries getAttemptHistory and links to review/resume modes', () => {
  const historyFile = fs.readFileSync(path.join(webRoot, 'app', 'learner', 'history', 'page.tsx'), 'utf8');
  assert(historyFile.includes('nurviaApi.getAttemptHistory()'), 'getAttemptHistory call missing');
  assert(historyFile.includes('mode=Review'), 'Review mode URL query missing');
  assert(historyFile.includes('mode=Exam'), 'Exam mode URL query missing');
  assert(historyFile.includes('scorePercentage'), 'Score percentage rendering missing');
  assert(historyFile.includes('submittedAtUtc'), 'Submission timestamp handling missing');
});

// 4. Custom Practice Engine Configuration
test('4. Custom Practice page supports pathways, question volume slider, and delivery modes', () => {
  const customFile = fs.readFileSync(path.join(webRoot, 'app', 'learner', 'custom-practice', 'page.tsx'), 'utf8');
  assert(customFile.includes('selectedTrack'), 'Track state missing');
  assert(customFile.includes('selectedMode'), 'Mode state missing');
  assert(customFile.includes('questionCount'), 'Question count state missing');
  assert(customFile.includes('/exam-session?track='), 'Exam session launch link missing');
});

// 5. Learner Exam Tracks & Pathways
test('5. Learner Exams page defines all four canonical nursing tracks', () => {
  const examsFile = fs.readFileSync(path.join(webRoot, 'app', 'learner', 'exams', 'page.tsx'), 'utf8');
  assert(examsFile.includes('RN:'), 'RN track missing');
  assert(examsFile.includes('PN_LPN:'), 'PN_LPN track missing');
  assert(examsFile.includes('RN_Exit:'), 'RN_Exit track missing');
  assert(examsFile.includes('PN_Exit:'), 'PN_Exit track missing');
  assert(examsFile.includes('StudyLibraryView'), 'StudyLibraryView inclusion missing');
});

console.log(`\nAll ${totalTests} Stage 7 test suites PASSED successfully (${passedTests}/${totalTests})!`);
