# NURVIA — Hero Reference-Image-Led Redesign Report

**Date:** 2026-11-10
**Scope:** Landing-page hero only (`apps/web`). No auth, RBAC, exam, or backend logic touched.

---

## 1. Reference image

| Item | Value |
|---|---|
| Exact filename | `hero-image.jpeg` |
| Path | `C:\Users\gitau\Documents\NURVIA\apps\web\public\hero-image.jpeg` |
| Dimensions | 1280 × 960 px |
| Aspect ratio | 4:3 (whole file); the usable design crop occupies the upper ~1280 × 635 band |
| Extensions searched | glob over `apps/web/public/hero-image*` resolved to `.jpeg` only |

The image is a photograph of a laptop screen showing the intended landing-page hero design. It was opened and visually inspected in full at original size, then re-inspected via zoomed crops (`card-top-strip`, `hero-ctas`, `hero-headline`, `card-options`, `hero-rating`, `card-header`) before any code was written. The image was **not** modified, renamed, moved, deleted, or used as the final video asset.

## 2. Reference-image design specification (extracted)

- **Single hero**: left = messaging column, right = white Quick Practice card. Both sit over a soft, light rosy-white background — the video background must therefore be treated with a **light scrim**, never a dark cinematic overlay.
- **Eyebrow:** `— BUILT FOR NURSING SCHOOL EXAM DAYS —` — crimson letterspaced uppercase with thin rules left and right.
- **H1 (two lines at desktop):** `Turn Practice Into ATI` / `and HESI Readiness` — very heavy, dark, tight leading; **ATI** and **HESI** in crimson.
- **Supporting copy:** “Work through ATI, HESI, and exit-exam practice at your own pace. Learn from clear rationales, build comfort with NGN formats, and choose the study mode that fits today.”
- **CTAs:** pill-shaped; filled magenta-berry “Try a Practice Set →”; white outlined “Explore the Exam Library”.
- **Rating row:** ★★★★★ (amber) · **4.9/5** · “shared by 2,000+ students”.
- **Quick Practice card:** white, ~10–14 px radius, subtle border/shadow; magenta gradient strip hugging the top-left edge; filled magenta rounded icon tile with a white heart glyph; header “QUICK PRACTICE / Question 1 of 3”; timer chip reading `0:18`; light-blue “Learn-as-you-go mode” chip + gray “PHARMACOLOGY” chip; warfarin pharmacology stem; four options with outlined letter circles A–D; footer with “← Back”, elongated active progress dot, and filled magenta pill “Keep Going →”.

Pixel sampling of glare-washed strokes converged on a crimson accent ≈ `#9D174D`–`#BE185D` (Tailwind pink-800/700).

## 3. Existing-implementation findings (pre-change audit)

- `app/page.tsx` hero used the **previous** iteration’s copy (“Your Path to Nursing Confidence.”), a teal CTA pair (“Start Practicing” / “Explore Exams”), a pathway-picker `HeroQuickPractice`, and a **separate** video section `HeroVideoPanel` below the columns.
- `tests/hero-redesign.test.mjs` (and `tests/e2e/learner-journey.spec.ts` step 1/1b/1c) encoded that previous design — including a rule **forbidding** a background video. Those tests conflicted with the new reference and were rewritten.
- `components/home/practice-question-preview.tsx` existed, unused-but-functional, rendering `heroPracticeQuestions` from `lib/study-sets-data.ts` — whose first question is **exactly** the reference’s warfarin / “Learn-as-you-go mode” / PHARMACOLOGY / Question 1 of 3 card. It was therefore the right real-functional component to power the reference card.
- `lib/hero-media.ts` gates video playback behind an explicit product-owner approval (`status: "pending"`). **No approved hero video asset exists**; nothing valid under `public/brand/hero/`.

## 4. Files changed

| File | Change |
|---|---|
| `apps/web/app/page.tsx` | Hero section rewritten: reference copy, two CTAs, rating row, 7/5 split, `HeroBackgroundVideo` layer behind everything, `PracticeQuestionPreview` in the right column. Separate video panel and old hero copy removed. |
| `apps/web/components/home/hero-background-video.tsx` | **New.** Decorative responsive background video layer with approved-asset gate, light scrim, reference-matched static fallback, reduced-motion handling, `onError` fallback. |
| `apps/web/components/home/practice-question-preview.tsx` | Restyled to the reference (accent strip, magenta icon/Keep Going/dots, blue mode chip, rounded-lg options, `m:ss` timer, keyboard guard against text inputs). |
| `apps/web/lib/hero-media.ts` | Repurposed as the hero **background** video manifest (same pending/approved gate; instructions for the approved asset retained). |
| `apps/web/app/globals.css` | Added alpha-capable accent tokens (light + dark). |
| `apps/web/tailwind.config.ts` | Mapped `accent` / `accent-hover` / `accent-highlight` with `<alpha-value>` support. |
| `apps/web/components/home/hero-quick-practice.tsx` | **Deleted** (superseded by the reference’s question card; recovery point exists in git history). |
| `apps/web/components/home/hero-video-panel.tsx` | **Deleted** (task forbids a separate video section). |
| `apps/web/tests/hero-redesign.test.mjs` | Rewritten for the new design (6 suites, all passing). |
| `apps/web/tests/e2e/learner-journey.spec.ts` | Steps 1 / 1b / 1c rewritten for the new hero & Quick Practice interactions (steps 2+ untouched). |
| `docs/evidence/hero-reference-redesign/*.png` | Browser screenshots (see §14). |
| `docs/NURVIA-HERO-REFERENCE-REDESIGN-REPORT.md` | This report. |

## 5. Final hero composition

```
<section aria-labelledby="hero-heading">            ← one hero, isolate, overflow-hidden
  <HeroBackgroundVideo/>  (-z-10, video OR reference gradient) 
  <div relative z-10 max-w-7xl grid lg:grid-cols-12>
    <col-span-7>  eyebrow · H1 (ATI/HESI crimson) · copy · two pill CTAs · ★ 4.9/5 row
    <col-span-5>  Quick Practice question card
```

Exact wording preserved from the reference (all copy in §2 is reproduced verbatim, including punctuation and line breaks).

## 6. Background video implementation details

- `HeroBackgroundVideo` renders (client component, ~1 kB):
  - **Approved asset present** → `<video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster onError>` behind a restrained light scrim (`rgba(250,243,246,0.88→0.74→0.7)` gradient; deep-navy equivalents in dark mode). No horizontal overflow, no distortion, no pointer interception, decorative (`aria-hidden`, `-z-10`).
  - **No approved asset / playback error / reduced motion** → static, reference-matched rosy gradient (`data-testid="hero-background-fallback"`) which is precisely what renders today.
- The manifest stays `status: "pending"`; dropping an approved asset into `public/brand/hero/` and flipping the manifest activates the video path with no further code changes. **No video URL was guessed; no stock video was introduced.**

## 7. Quick Practice behavior (real, not fabricated)

- Interactive question card driven by real sample data (`heroPracticeQuestions`; first item matches the reference exactly).
- Options select via click, keyboard (A–D / 1–4, guarded so typing in page inputs is never hijacked), and a real ARIA `radiogroup`.
- “Learn-as-you-go” ground truth: rationale only revealed **after** a selection (verified 0 → 1 in browser); progress dots / Back / Keep Going navigation (verified Q1 → Q2 → Q1 in browser); pausable real timer (`0:14`-style `m:ss`).
- Completed preview links into the existing `/exam-session` route. No learner results are fabricated, nothing is invented by the redesign.

## 8. Responsive behavior

- Desktop (1440×900): reference composition reproduced incl. forced H1 two-line break, 7/5 split.
- Tablet (834×1112): single-column, centered CTA pills, full-width card — usable, shared background preserved.
- Mobile (390×844): full-width pills, hero grows vertically, video gradient still behind all content, no horizontal overflow, no clipped controls.

## 9. Accessibility & reduced motion

- Semantic `<section aria-labelledby>`, `radiogroup` with `aria-checked`, visible focus rings (`focus:ring-accent/70`), meaningful labels, decorative video (`aria-hidden`, no controls, muted).
- `prefers-reduced-motion` skips the video entirely (verified: fallback only under reduced-motion emulation).
- Dark mode verified via the app’s own theme toggle; accent tokens lifted for dark surfaces.

## 10. Performance

- No new dependencies. Fallback path ships **zero video bytes**; the video path only activates with an approved asset and uses muted autoplay + poster; page continues in reduced-bundle budget (home first-load JS 141 kB in the earlier build; essentially unchanged).

## 11. Automated verification (all executed)

- `npx tsc --noEmit` → **pass**.
- `npm test` → **24/24 suites pass** (navigation 7, learning-integration 5, question-renderers 4, hero-redesign reference-suite 6).
- `npm run build` → **pass** (clean run after removing the dev-server/process race; all 50 pages generated).
- Browser console: no new errors; the only logged item is the pre-existing expected `401` from `/api/auth/me` while the API backend is not running.

## 12. Browser verification (Playwright, real Chromium)

- Desktop / tablet / mobile screenshots captured against the production build; compared against `hero-image` — composition, copy, colors, CTAs, card anatomy and progress controls match; no clipping, no horizontal overflow at any viewport.
- Interaction script verified: rationale gating, option selection, Keep Going/Back, timer format, keyboard guard while typing in the study-set search input, CTA hrefs (`/sign-up?returnTo=%2Flearner%2Fexams`, `/exams`), dark mode toggle.

## 13. Screenshot locations

`docs/evidence/hero-reference-redesign/`:
- `desktop.png` (1440×900)
- `tablet.png` (834×1112)
- `mobile.png` (390×844)
- `desktop-selected.png` (option B selected + rationale revealed)
- `desktop-dark.png` (dark-mode hero)

## 14. Missing assets / unresolved requirements

- **Approved hero background video is still pending** (unchanged from the previous iteration). The hero currently renders the approved-reference static fallback; publishing the video requires placing assets in `public/brand/hero/` and flipping `lib/hero-media.ts` to `approved`. Until then, status is **Implemented — Asset Pending**.
- The actual *motion* of the video layer is unreachable until that asset is provided; the code path is implemented and gated but not exercisable in a browser screenshot (honestly noted, not claimed as verified with real footage).

## 15. Environmental notes / known limitations

- The workspace sits under a OneDrive-synced `Documents` folder; transient `.next` corruption (missing `BUILD_ID`) and one failed build raced with the dev server during verification. Both were resolved by a clean rebuild and the production server smoke test (page 200, CSS 200).
- The reference photo shows “NursGuru” brand navigation; per instructions the existing NURVIA navigation was left untouched — only hero-region elements followed the reference.

## 16. Final status

**Implemented — Asset Pending** — the reference-matched hero, functional Quick Practice, full responsive behavior, accessibility, tests, and build pass; the only missing piece is the product-approved background video asset, for which the layer is staged and waiting.
