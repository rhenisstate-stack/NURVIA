import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const webRoot = path.resolve(path.dirname(__filename), '..');
const read = (...segments) => fs.readFileSync(path.join(webRoot, ...segments), 'utf8');

console.log('--- NURVIA HERO REDESIGN TEST SUITE ---');

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
const quickPractice = read('components', 'home', 'hero-quick-practice.tsx');
const videoPanel = read('components', 'home', 'hero-video-panel.tsx');
const media = read('lib', 'hero-media.ts');
const customPractice = read('app', 'learner', 'custom-practice', 'page.tsx');

test('1. Hero renders approved copy, messaging first, then Quick Practice, then the video panel', () => {
  assert(heroStart > -1 && heroEnd > heroStart, 'Hero section not found before the testimonial carousel');
  for (const copy of [
    'Nursing exam preparation, reimagined',
    'Your Path to Nursing Confidence.',
    'Build clinical confidence through focused practice, realistic nursing assessments, and meaningful performance insights designed to help you prepare with purpose.',
    'Start Practicing',
    'Explore Exams',
  ]) assert(hero.includes(copy), `Missing hero copy: ${copy}`);
  const h1 = hero.indexOf('<h1');
  const qp = hero.indexOf('<HeroQuickPractice');
  const video = hero.indexOf('<HeroVideoPanel');
  assert(h1 > -1 && qp > h1 && video > qp, 'DOM order must be messaging → Quick Practice → video');
  assert(/md:grid-cols-2/.test(hero) && /lg:col-span-7/.test(hero) && /lg:col-span-5/.test(hero), 'Two-column grid missing');
});

test('2. Hero no longer layers content over a background video', () => {
  assert(!/<video/.test(hero), 'Hero markup must not render a background <video>');
  assert(!hero.includes('absolute inset-0 bg-[radial-gradient(ellipse_at_75%'), 'Legacy full-bleed overlay must be removed');
});

test('3. CTAs: teal primary, stroked secondary, real routes, no nested interactive elements', () => {
  assert(hero.includes('href={startHref}'), 'Start Practicing must use the auth-aware start route');
  assert(hero.includes('href={ROUTES.exams}'), 'Explore Exams must link to /exams');
  assert(hero.includes('bg-brand-teal') && hero.includes('hover:bg-brand-tealDark'), 'Primary CTA must use Intelligent Teal with Deep Teal hover');
  assert(/border-2 border-brand-navy/.test(hero), 'Secondary CTA must have a visible stroke at rest');
  assert(!/<Link[^>]*>\s*<Button/.test(hero), 'Hero CTAs must not nest <button> inside <a>');
});

test('4. Quick Practice offers supported pathways with validation and real routing', () => {
  assert(quickPractice.includes('label: "NCLEX-RN"') && quickPractice.includes('id: "RN"'), 'NCLEX-RN → RN mapping missing');
  assert(quickPractice.includes('label: "NCLEX-PN"') && quickPractice.includes('id: "PN_LPN"'), 'NCLEX-PN → PN_LPN mapping missing');
  assert(read('lib', 'api-types.ts').includes("'PN_LPN'"), 'PN_LPN must be a supported NursingPathway');
  assert(quickPractice.includes('Begin Quick Practice'), 'Begin Quick Practice action missing');
  assert(quickPractice.includes('type="radio"') && quickPractice.includes('<fieldset') && quickPractice.includes('<legend'), 'Accessible radio group missing');
  assert(quickPractice.includes('role="alert"') && quickPractice.includes('aria-invalid'), 'Validation feedback missing');
  assert(quickPractice.includes('ROUTES.learner.customPractice') && quickPractice.includes('?pathway='), 'Must route into the existing Quick Practice page with the pathway');
  assert(quickPractice.includes('ROUTES.signIn') && quickPractice.includes('returnTo='), 'Unauthenticated users must be sent to sign in with a return path');
  assert(quickPractice.includes('ROUTES.accessDenied'), 'Non-learner accounts must be sent to access denied');
});

test('5. Learner Quick Practice page honours the requested pathway', () => {
  assert(customPractice.includes('get("pathway")'), 'custom-practice must read ?pathway=');
  assert(customPractice.includes('isPracticePathway'), 'Requested pathway must be validated');
  assert(customPractice.includes('nurviaApi.getExams({ status: "Published", pathway'), 'Must keep loading real published exams');
});

test('6. Video panel: approved-asset gate, explicit placeholder, fallback, reduced motion, efficient loading', () => {
  assert(videoPanel.includes('hero-video-placeholder') && videoPanel.includes('approved video pending'), 'Explicit placeholder missing');
  assert(videoPanel.includes('prefers-reduced-motion'), 'Reduced-motion handling missing');
  assert(videoPanel.includes('preload="none"') && videoPanel.includes('IntersectionObserver'), 'Lazy loading / in-view playback missing');
  assert(videoPanel.includes('controls') && videoPanel.includes('muted') && videoPanel.includes('playsInline'), 'Video playback attributes missing');
  assert(videoPanel.includes('aspect-video') && videoPanel.includes('rounded-2xl'), 'Aspect ratio / rounded design-system container missing');
  assert(/onError=\{onFailed\}/.test(videoPanel) && videoPanel.includes('variant={approved ? "failed" : "pending"}'), 'Playback failure fallback missing');
  const manifestStatus = media.match(/export const heroVideo: HeroVideoConfig = \{\s*status: "(\w+)"/)?.[1];
  assert(['pending', 'approved'].includes(manifestStatus), `heroVideo manifest status not found or unknown: ${manifestStatus}`);
  if (manifestStatus === 'approved') {
    assert(fs.existsSync(path.join(webRoot, 'public', 'brand', 'hero')), 'Approved manifest requires assets under public/brand/hero');
  }
});

console.log(`\nAll ${total} hero test suites PASSED (${passed}/${total})!`);
