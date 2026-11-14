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
test('1. Study Library View lists only persisted published exams and starts by persisted exam id', () => {
  const libraryFile = fs.readFileSync(path.join(webRoot, 'components', 'study', 'study-library-view.tsx'), 'utf8');
  assert(libraryFile.includes('status: "Published"'), 'Published exam status query missing');
  assert(libraryFile.includes('examId: exam.id'), 'Live examId query parameter missing');
  assert(!libraryFile.includes('initialStudySets'), 'Static study-set fallback must not be presented as live exams');
  assert(libraryFile.includes('setExams'), 'Published exam response is not rendered');
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
  assert(sessionFile.includes('submittedResult.timeLimitMinutes'), 'Allocated timeLimitMinutes display missing');
  assert(sessionFile.includes('submittedResult.startedAtUtc'), 'Attempt startedAtUtc display missing');
  assert(sessionFile.includes('submittedResult.submittedAtUtc'), 'Attempt submittedAtUtc display missing');
  assert(sessionFile.includes('submittedResult.timeSpentSeconds'), 'Elapsed timeSpentSeconds display missing');
});

// 3. Learner Attempt History Wiring
test('3. Learner History page queries getAttemptHistory and links to review/resume modes', () => {
  const historyFile = fs.readFileSync(path.join(webRoot, 'app', 'learner', 'history', 'page.tsx'), 'utf8');
  assert(historyFile.includes('nurviaApi.getAttemptHistory()'), 'getAttemptHistory call missing');
  assert(historyFile.includes('mode=Review'), 'Review mode URL query missing');
  assert(historyFile.includes('mode=Exam'), 'Exam mode URL query missing');
  assert(historyFile.includes('scorePercentage'), 'Score percentage rendering missing');
  assert(historyFile.includes('submittedAtUtc'), 'Submission timestamp handling missing');
  // Backend attempt statuses are InProgress / Submitted / Graded / Expired.
  // The page must not gate review actions on a status value the backend never sends.
  assert(!historyFile.includes('"Completed"'), 'Attempt history must not match the non-existent backend status "Completed"');
  assert(historyFile.includes('a.status === "InProgress"'), 'Active-attempt detection must use the persisted InProgress status');
  assert(historyFile.includes('a.status !== "InProgress"'), 'Review eligibility must use the persisted non-InProgress statuses');
});

// 4. Custom Practice Engine Configuration
test('4. Quick Practice starts only persisted published exams', () => {
  const customFile = fs.readFileSync(path.join(webRoot, 'app', 'learner', 'custom-practice', 'page.tsx'), 'utf8');
  assert(customFile.includes('nurviaApi.getExams'), 'Published exam query missing');
  assert(customFile.includes('status: "Published"'), 'Only published exams should be selectable');
  assert(customFile.includes('examId='), 'Exam session must be started by persisted exam ID');
  assert(!customFile.includes('questionCount'), 'Unsupported custom question counts must not be advertised');
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
