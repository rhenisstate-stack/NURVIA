"use client";

import * as React from "react";
import { heroVideo, type ApprovedHeroVideo } from "@/lib/hero-media";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Responsive background video for the landing hero.
 *
 * One layer, two states:
 * 1. Approved asset present (and motion allowed): the video fills the hero
 *    (`object-cover`, muted, looped, decorative) behind both the hero copy and
 *    the Quick Practice card, under a restrained light scrim that preserves
 *    the rosy reference look and keeps near-black text legible.
 * 2. No approved asset / playback failure / reduced motion: a static,
 *    reference-matched light gradient takes its place so the hero remains
 *    faithful to the approved design without any motion.
 *
 * The video is decorative (aria-hidden) and never intercepts pointer events:
 * every control above it stays directly clickable.
 */
export function HeroBackgroundVideo() {
  const [failed, setFailed] = React.useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const approved = heroVideo.status === "approved" ? heroVideo : null;
  const showVideo = Boolean(approved) && !failed && !reducedMotion;

  if (!showVideo) {
    return (
      <div
        aria-hidden="true"
        data-testid="hero-background-fallback"
        className="absolute inset-0 -z-10 bg-[linear-gradient(150deg,#F4F7F6_0%,#EDF2F0_45%,#E9EFEC_100%)] dark:bg-[linear-gradient(150deg,#0B1220_0%,#0E1B30_55%,#0B1D33_100%)]"
      />
    );
  }

  return videoLayer(approved as ApprovedHeroVideo, () => setFailed(true));
}

function videoLayer(asset: ApprovedHeroVideo, onFailed: () => void) {
  return (
    <div aria-hidden="true" data-testid="hero-background-video" className="absolute inset-0 -z-10">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        poster={asset.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={onFailed}
      >
        {asset.sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} onError={onFailed} />
        ))}
      </video>
      {/* Restrained light scrim: keeps headline/Quick Practice contrast high
          while letting the ambient motion show through — Clinical Precision wash. */}
      <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(244,247,246,0.88)_0%,rgba(237,242,240,0.74)_50%,rgba(233,239,236,0.7)_100%)] dark:bg-[linear-gradient(150deg,rgba(11,18,32,0.88)_0%,rgba(14,27,48,0.8)_50%,rgba(11,29,51,0.78)_100%)]" />
    </div>
  );
}
