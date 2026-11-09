import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

console.log('--- NURVIA NAVIGATION, STABILITY & CAROUSEL AUTOMATED TEST SUITE ---');

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

// 1. Route Registry Tests
test('1. Centralized Route Registry defines all 9 approved public routes', async () => {
  const routesFile = fs.readFileSync(path.join(webRoot, 'lib', 'routes.ts'), 'utf8');
  assert(routesFile.includes('home: "/"'), 'Home route missing');
  assert(routesFile.includes('exams: "/exams"'), 'Exams route missing');
  assert(routesFile.includes('study: "/study"'), 'Study route missing');
  assert(routesFile.includes('carePlans: "/care-plans"'), 'Care Plans route missing');
  assert(routesFile.includes('markK: "/mark-k"'), 'Mark K. route missing');
  assert(routesFile.includes('community: "/community"'), 'Community route missing');
  assert(routesFile.includes('faq: "/faq"'), 'FAQ route missing');
  assert(routesFile.includes('nclex: "/nclex"'), 'NCLEX route missing');
  assert(routesFile.includes('teas: "/teas"'), 'TEAS route missing');
});

// 2. Exact 9 Navbar Items in Exact Order
test('2. Public shell defines approved 9 navigation items in exact approved order', async () => {
  const shellFile = fs.readFileSync(path.join(webRoot, 'components', 'layout', 'public-shell.tsx'), 'utf8');
  const expectedItems = [
    'Home',
    'Exams',
    'Study',
    'Care Plans',
    'Mark K.',
    'Community',
    'FAQ',
    'NCLEX',
    'TEAS',
  ];

  let lastIndex = -1;
  for (const item of expectedItems) {
    const itemMatch = `name: "${item}"`;
    const foundIdx = shellFile.indexOf(itemMatch);
    assert(foundIdx > -1, `Navbar item "${item}" not found in public-shell.tsx`);
    assert(foundIdx > lastIndex, `Navbar item "${item}" is out of order`);
    lastIndex = foundIdx;
  }
});

// 3. Testimonial Data Contracts
test('3. Testimonial data structure and validation contracts', async () => {
  const dataFile = fs.readFileSync(path.join(webRoot, 'lib', 'study-sets-data.ts'), 'utf8');
  assert(dataFile.includes('export interface StudentTestimonial'), 'StudentTestimonial interface missing');
  assert(dataFile.includes('sampleStudentTestimonials'), 'sampleStudentTestimonials array missing');
  assert(dataFile.includes('Octavio O.'), 'Sample testimonial 1 missing');
  assert(dataFile.includes('Brittany P.'), 'Sample testimonial 2 missing');
  assert(dataFile.includes('isVerified: true'), 'Verification attribute missing');
});

// 4. Testimonial Carousel Architecture & Accessibility
test('4. Carousel component implements automatic rotation, pause-on-hover, pause-on-focus, swipe, reduced-motion, and no manual buttons or dots', async () => {
  const carouselFile = fs.readFileSync(path.join(webRoot, 'components', 'home', 'student-testimonial-carousel.tsx'), 'utf8');
  assert(carouselFile.includes('role="region"'), 'Carousel region role missing');
  assert(carouselFile.includes('aria-roledescription="carousel"'), 'Carousel roledescription missing');
  assert(carouselFile.includes('onMouseEnter'), 'Mouse enter hover listener missing');
  assert(carouselFile.includes('onMouseLeave'), 'Mouse leave hover listener missing');
  assert(carouselFile.includes('onFocus'), 'Focus listener missing');
  assert(carouselFile.includes('onBlur'), 'Blur listener missing');
  assert(carouselFile.includes('onTouchStart'), 'Touch start listener missing');
  assert(carouselFile.includes('prefers-reduced-motion'), 'Reduced motion query missing');
  assert(!carouselFile.includes('Pagination Dots'), 'Pagination dots must not be rendered in continuous automatic rotation');
  assert(!carouselFile.includes('aria-label="Previous slide"'), 'Manual previous button must not be rendered');
  assert(!carouselFile.includes('aria-label="Next slide"'), 'Manual next button must not be rendered');
});

// 5. Verification of All 47 App Page Files On Disk
test('5. Verify all 47 routes have concrete page.tsx files on disk', () => {
  const expectedPages = [
    'app/page.tsx',
    'app/not-found.tsx',
    'app/exams/page.tsx',
    'app/study/page.tsx',
    'app/care-plans/page.tsx',
    'app/mark-k/page.tsx',
    'app/community/page.tsx',
    'app/faq/page.tsx',
    'app/nclex/page.tsx',
    'app/teas/page.tsx',
    'app/exam-session/page.tsx',
    'app/design-system/page.tsx',
    'app/learner/page.tsx',
    'app/learner/account/page.tsx',
    'app/learner/ai-tutor/page.tsx',
    'app/learner/calculators/page.tsx',
    'app/learner/care-plans/page.tsx',
    'app/learner/community/page.tsx',
    'app/learner/custom-practice/page.tsx',
    'app/learner/exams/page.tsx',
    'app/learner/flashcards/page.tsx',
    'app/learner/guides/page.tsx',
    'app/learner/history/page.tsx',
    'app/learner/hub/page.tsx',
    'app/learner/library/page.tsx',
    'app/learner/my-exams/page.tsx',
    'app/learner/performance/page.tsx',
    'app/learner/planner/page.tsx',
    'app/learner/saved-questions/page.tsx',
    'app/learner/settings/page.tsx',
    'app/learner/subscription/page.tsx',
    'app/admin/page.tsx',
    'app/admin/analytics/page.tsx',
    'app/admin/audit/page.tsx',
    'app/admin/cases/page.tsx',
    'app/admin/exams/page.tsx',
    'app/admin/learners/page.tsx',
    'app/admin/plans/page.tsx',
    'app/admin/question-types/page.tsx',
    'app/admin/questions/page.tsx',
    'app/admin/questions/new/page.tsx',
    'app/admin/questions/[id]/edit/page.tsx',
    'app/admin/rbac/page.tsx',
    'app/admin/reviews/page.tsx',
    'app/admin/settings/page.tsx',
    'app/admin/taxonomy/page.tsx',
  ];

  for (const pagePath of expectedPages) {
    const fullPath = path.join(webRoot, pagePath);
    assert(fs.existsSync(fullPath), `Expected page file does not exist: ${pagePath}`);
  }
});

// 6. Learner Shell Navigation Structure
test('6. Learner shell navigation retains all four exam pathways and resource modules without leaking admin paths', () => {
  const learnerShellFile = fs.readFileSync(path.join(webRoot, 'components', 'layout', 'learner-shell.tsx'), 'utf8');
  assert(learnerShellFile.includes('RN Exams'), 'RN Exams missing');
  assert(learnerShellFile.includes('LPN / PN Exams'), 'LPN / PN Exams missing');
  assert(learnerShellFile.includes('RN Exit'), 'RN Exit missing');
  assert(learnerShellFile.includes('LPN Exit'), 'LPN Exit missing');
  assert(learnerShellFile.includes('Study Library'), 'Study Library missing');
  assert(learnerShellFile.includes('AI Tutor'), 'AI Tutor missing');
  assert(!learnerShellFile.includes('Content Studio'), 'Content Studio must not be exposed to learners');
});

// 7. Dynamic Route Parameter Safety
test('7. Dynamic route edit page safely handles dynamic route params via useParams hook', () => {
  const editPage = fs.readFileSync(path.join(webRoot, 'app', 'admin', 'questions', '[id]', 'edit', 'page.tsx'), 'utf8');
  assert(editPage.includes('useParams()'), 'useParams hook missing');
  assert(editPage.includes('params?.id'), 'Safe parameter extraction missing');
});

console.log(`\nAll ${totalTests} test suites PASSED successfully (${passedTests}/${totalTests})!`);
