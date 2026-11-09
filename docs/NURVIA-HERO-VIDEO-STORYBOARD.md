# NURVIA Hero Video — Production Storyboard

**Status:** Awaiting an approved video asset. No approved hero video existed in the repository at
final acceptance closure, so the hero ships with the approved branded static treatment. This
storyboard is the production-ready specification for the asset so that the video requirement can be
closed as soon as it is produced and approved.

**Product slogan:** Your Path to Nursing Confidence.

---

## 1. What the video must show

The hero video demonstrates the real NURVIA learner journey. Every screen shown must be the actual
application UI — the same registration form, dashboard, exam session, and result pages that ship.
No simulated or fictional product interface is acceptable.

| # | Beat | Visual | Duration |
|---|------|--------|----------|
| 1 | Discovery | A nursing student on a laptop in a well-lit study space discovers NURVIA; the public landing page is visible in frame. | 4–5 s |
| 2 | Access | Close-up as the student clicks **Sign Up** in the navbar; the dedicated Sign Up page loads. | 2–3 s |
| 3 | Account creation | The student completes the real registration form; success panel appears. | 4–5 s |
| 4 | Sign in | The student signs in through the real Sign In page. | 2–3 s |
| 5 | Dashboard | The learner dashboard appears with persisted stats and the published exam library. | 3–4 s |
| 6 | Open an exam | The student starts a published exam; the exam session loads question 1. | 2–3 s |
| 7 | Answering | The student answers items (single choice, select-all-that-apply) with the autosave "Saved" indicator appearing. | 5–6 s |
| 8 | Submission | "Finish Exam" → "Confirm & Submit"; the browser navigates to the result page. | 2–3 s |
| 9 | Results & insight | The result summary, outcome distribution bars, and released answer key with rationales. | 5–6 s |

Total runtime: **30–40 seconds**, looping silently.

## 2. Production notes

- **Interface capture:** record the actual running application at 2× DPR, 2560×1440 source, 30 fps
  minimum; use a scripted cursor overlay or subtle cursor highlight for click moments.
- **Narrative footage:** the discovery beat may open with professional footage of a nursing student
  in clinical attire studying; licensed footage with documented usage rights only.
- **Motion:** restrained crossfades (300–400 ms) and one ease-out zoom per beat maximum. No
  whirls, no 3D perspective spins, no stock-lifestyle montage.
- **Color:** grade toward the NURVIA palette — Midnight Navy `#142B4A` backgrounds, Intelligent
  Teal `#0D9488` accents, Deep Teal `#0F766E` highlights, white interface surfaces. No competing
  color casts.
- **Typography in frame:** Plus Jakarta Sans headings, Inter UI text — both are already the
  application fonts, so correct screen recordings preserve them automatically.
- **No audio track** (the hero plays muted).

## 3. Delivery format

| Item | Requirement |
|------|-------------|
| Primary file | `apps/web/public/brand/hero/learner-journey.mp4` (H.264/AVC or H.265, ≤ 8 Mbps, ≤ 12 MB) |
| Optional alt | `apps/web/public/brand/hero/learner-journey.webm` (VP9) for efficient Chromium delivery |
| Poster | `apps/web/public/brand/hero/learner-journey-poster.webp` (the result-page beat, ≥ 1600 px wide) |
| Approval record | Written approval of the final cut from the product owner, stored with the asset |

## 4. Playback contract (for implementation)

When an approved asset is delivered, the hero must:

1. Render the video in a responsive container that never causes layout shift.
2. Use `autoplay muted playsInline loop`, `preload="metadata"`, and the approved poster.
3. Layer the existing navy gradient overlay so the heading, supporting text, Quick Practice, and
   both CTAs remain readable above the video at all times.
4. Fall back to the current branded static treatment when playback fails or the asset is missing.
5. Respect `prefers-reduced-motion`: show the static poster treatment instead of playing.
6. Never intercept pointer events over the CTA layer.

## 5. Acceptance status

- [ ] Approved video asset exists — **open**
- [ ] Video demonstrates the actual NURVIA learner journey — **open (blocked on asset)**
- [x] Storyboard for production review delivered — **this document**
- [x] Hero remains fully functional and on-brand without the video (current static treatment)
