import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const webRoot = path.resolve(path.dirname(__filename), '..');
const read = (...segments) => fs.readFileSync(path.join(webRoot, ...segments), 'utf8');

console.log('--- NURVIA HERO REFERENCE REDESIGN TEST SUITE ---');

let passed = 0;
let total = 0;
function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

const page = read('app', 'page.tsx');
const heroStart = page.indexOf('aria-labelledby="hero-heading"');
const heroEnd = page.indexOf('<StudentTestimonialCarousel');
const hero = page.slice(heroStart, heroEnd);
const quickPractice = read('components', 'home', 'practice-question-preview.tsx');
const backgroundVideo = read('components', 'home', 'hero-background-video.tsx');
const media = read('lib', 'hero-media.ts');
const questionsData = read('lib', 'study-sets-data.ts');

test('1. Hero reproduces the approved reference copy and hierarchy', () => {
  assert(heroStart > -1 && heroEnd > heroStart, 'Hero section not found before the testimonial carousel');
  for (const copy of [
    'Built for nursing school exam days',
    'Turn Practice Into',
    'and <span className="text-brand-teal">HESI</span> Readiness',
    'Work through ATI, HESI, and exit-exam practice at your own pace. Learn from clear rationales, build comfort with NGN formats, and choose the study mode that fits today.',
    'Try a Practice Set',
    'Explore the Exam Library',
    '4.9/5',
    'shared by 2,000+ students',
  ]) assert(hero.includes(copy), `Missing hero copy: ${copy}`);
  const h1 = hero.indexOf('<h1');
  const qp = hero.indexOf('<PracticeQuestionPreview');
  assert(h1 > -1 && qp > h1, 'DOM order must be messaging → Quick Practice');
  assert(/lg:grid-cols-12/.test(hero) && /lg:col-span-7/.test(hero) && /lg:col-span-5/.test(hero), 'Reference two-column split (7/5) missing');
});

test('2. One hero, one background video: video behind copy and Quick Practice', () => {
  const videoBeforeCopy = hero.indexOf('<HeroBackgroundVideo');
  assert(videoBeforeCopy > -1 && videoBeforeCopy < h1Safe(), 'Background video layer must be the first element inside the hero section');
  assert(!page.includes('components/home/hero-video-panel') && !fs.existsSync(path.join(webRoot, 'components', 'home', 'hero-video-panel.tsx')), 'Separate video panel must not exist (video belongs to the hero itself)');
  assert(/relative z-10/.test(hero), 'Foreground content must be layered above the video');
  function h1Safe() { return hero.indexOf('<h1'); }
});

test('3. Background video layer: decorative, muted, responsive, gated, reduced-motion aware', () => {
  assert(backgroundVideo.includes('data-testid="hero-background-video"') && backgroundVideo.includes('data-testid="hero-background-fallback"'), 'Video + fallback test hooks missing');
  assert(backgroundVideo.includes('object-cover') && backgroundVideo.includes('playsInline'), 'Responsive object-cover + playsInline missing');
  assert(backgroundVideo.includes('autoPlay') && backgroundVideo.includes('muted') && backgroundVideo.includes('loop'), 'Muted looping autoplay missing');
  assert(backgroundVideo.includes('prefers-reduced-motion'), 'Reduced-motion preference not respected');
  assert(/aria-hidden="true"/.test(backgroundVideo) && backgroundVideo.includes('-z-10'), 'Video must stay decorative and behind content');
  assert(backgroundVideo.includes('bg-[linear-gradient(150deg'), 'Reference-matched static fallback missing');
  const manifestStatus = media.match(/export const heroVideo: HeroVideoConfig = \{\s*status: "(\w+)"/)?.[1];
  assert(['pending', 'approved'].includes(manifestStatus), `heroVideo manifest status not found or unknown: ${manifestStatus}`);
  assert(backgroundVideo.includes('onError'), 'Playback failure fallback missing');
  if (manifestStatus === 'approved') {
    assert(fs.existsSync(path.join(webRoot, 'public', 'brand', 'hero')), 'Approved manifest requires assets under public/brand/hero');
  }
});

test('4. Hero CTAs: Deep Sea Teal primary + outlined secondary pill over real routes', () => {
  assert(hero.includes('href={startHref}'), 'Try a Practice Set must use the auth-aware start route');
  assert(hero.includes('href={ROUTES.exams}'), 'Explore the Exam Library must link to /exams');
  assert(hero.includes('bg-primary') && hero.includes('hover:bg-primary-hover'), 'Primary CTA must use the Deep Sea Teal brand action');
  assert(/rounded-full/.test(hero), 'Reference pill-shaped CTAs missing');
  assert(!/<Link[^>]*>\s*<Button/.test(hero), 'Hero CTAs must not nest <button> inside <a>');
});

test('5. Quick Practice card matches the reference and stays functional', () => {
  assert(quickPractice.includes('QUICK PRACTICE') && quickPractice.includes('Question {currentIndex + 1} of {heroPracticeQuestions.length}'), 'Reference card header missing');
  assert(quickPractice.includes('heroPracticeQuestions'), 'Card must render the real sample-question data');
  assert(questionsData.includes('A nurse is caring for a client who has been prescribed warfarin'), 'Reference default question (warfarin pharmacology) missing');
  assert(questionsData.includes('Learn-as-you-go mode') && questionsData.includes('PHARMACOLOGY') || questionsData.includes('topic: "PHARMACOLOGY"'), 'Reference chips missing');
  assert(quickPractice.includes('from-brand-teal from-45%'), 'Reference top accent strip missing');
  assert(quickPractice.includes('Keep Going'), 'Reference Keep Going action missing');
  assert(quickPractice.includes('role="radiogroup"') && quickPractice.includes('aria-checked'), 'Accessible option selection missing');
  // Answers/rationales must only be revealed after a selection (learn-as-you-go)
  const rationale = quickPractice.indexOf('showRationale');
  assert(/hasSelected && showRationale/.test(quickPractice), 'Rationale must be gated behind a selection');
  assert(/tagName === "INPUT"/.test(quickPractice), 'Keyboard shortcuts must not hijack typing in page inputs');
  assert(quickPractice.includes('href="/exam-session"'), 'Preview must link into the real exam-session route');
});

test('6. Legacy video-panel, pathway-picker and old hero copy are fully retired', () => {
  assert(!fs.existsSync(path.join(webRoot, 'components', 'home', 'hero-quick-practice.tsx')), 'Old pathway-picker component must be removed');
  assert(!fs.existsSync(path.join(webRoot, 'components', 'home', 'hero-video-panel.tsx')), 'Old separate video-panel component must be removed');
  assert(!page.includes('Your Path to Nursing Confidence.'), 'Old hero headline must not remain on the landing page');
  assert(!hero.includes('Start Practicing'), 'Old hero CTA label must not remain in the hero');
  assert(!page.includes('heroVideoChapters'), 'Walkthrough chapters list belongs to the retired panel');
});

console.log(`\nAll ${total} hero test suites PASSED (${passed}/${total})!`);
