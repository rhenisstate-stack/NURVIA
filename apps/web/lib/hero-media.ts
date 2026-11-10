/**
 * Hero background-video manifest.
 *
 * The landing-page hero renders its messaging and the Quick Practice card
 * over a single responsive background video. Just like the previous
 * video-panel manifest, only media that has been explicitly approved by the
 * product owner may be published. Until an approved hero background video is
 * delivered, `status` stays "pending" and the hero renders the
 * reference-matched static gradient fallback instead (see
 * `components/home/hero-background-video.tsx`).
 *
 * To publish an approved asset, place the files under
 * `apps/web/public/brand/hero/` and replace `heroVideo` with an
 * `ApprovedHeroVideo` entry, for example:
 *
 *   export const heroVideo: HeroVideoConfig = {
 *     status: "approved",
 *     title: "NURVIA hero background",
 *     poster: "/brand/hero/hero-background-poster.webp",
 *     sources: [
 *       { src: "/brand/hero/hero-background.webm", type: "video/webm" },
 *       { src: "/brand/hero/hero-background.mp4", type: "video/mp4" },
 *     ],
 *   };
 *
 * The approved video must be a soft, light-toned ambient loop: the hero keeps
 * near-black headline text on a rosy light wash (per the approved reference)
 * and the component only adds a restrained light scrim over the video.
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
  reason: "No approved NURVIA hero background video has been delivered yet.",
};
