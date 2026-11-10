/**
 * Hero product-video manifest.
 *
 * The landing-page video panel only plays media that has been explicitly
 * approved by the product owner. Until an approved recording of the real
 * learner journey is delivered (see docs/NURVIA-HERO-VIDEO-STORYBOARD.md),
 * the status stays "pending" and the panel renders an explicit placeholder.
 *
 * To publish an approved asset, place the files under
 * `apps/web/public/brand/hero/` and replace `heroVideo` with an
 * `ApprovedHeroVideo` entry, for example:
 *
 *   export const heroVideo: HeroVideoConfig = {
 *     status: "approved",
 *     title: "NURVIA learner journey walkthrough",
 *     poster: "/brand/hero/learner-journey-poster.webp",
 *     sources: [
 *       { src: "/brand/hero/learner-journey.webm", type: "video/webm" },
 *       { src: "/brand/hero/learner-journey.mp4", type: "video/mp4" },
 *     ],
 *   };
 */

export interface HeroVideoSource {
  src: string;
  type: "video/mp4" | "video/webm";
}

export interface ApprovedHeroVideo {
  status: "approved";
  title: string;
  poster: string;
  sources: HeroVideoSource[];
}

export interface PendingHeroVideo {
  status: "pending";
  reason: string;
}

export type HeroVideoConfig = ApprovedHeroVideo | PendingHeroVideo;

export const heroVideo: HeroVideoConfig = {
  status: "pending",
  reason: "No approved NURVIA learner-journey recording has been delivered yet.",
};

/** The learner journey the approved walkthrough must demonstrate, in order. */
export const heroVideoChapters = [
  "Platform discovery",
  "Account registration",
  "Sign in",
  "Learner dashboard",
  "Exam access",
  "Answering questions",
  "Exam submission",
  "Performance results & charts",
] as const;
