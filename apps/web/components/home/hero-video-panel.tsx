"use client";

import * as React from "react";
import { Clapperboard, PlayCircle } from "lucide-react";
import { heroVideo, heroVideoChapters, type ApprovedHeroVideo } from "@/lib/hero-media";

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

function VideoPlaceholder({ variant, poster }: { variant: "pending" | "failed"; poster?: string }) {
  const message = variant === "pending"
    ? "Placeholder: the NURVIA product walkthrough video has not been approved for publication yet."
    : "The NURVIA product walkthrough video could not be played.";
  return (
    <div
      role="img"
      aria-label={message}
      data-testid="hero-video-placeholder"
      data-variant={variant}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden bg-[#0B1D33] p-6 text-center"
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      ) : (
        <>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(13,148,136,0.35),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(20,43,74,0.9),transparent_60%)]" />
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:32px_32px]" />
        </>
      )}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white sm:h-20 sm:w-20">
        <Clapperboard className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
      </div>
      <div className="relative max-w-md space-y-1.5">
        <p className="font-brand text-lg font-bold text-white sm:text-xl">
          {variant === "pending" ? "Product walkthrough coming soon" : "Video unavailable"}
        </p>
        <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
          {variant === "pending"
            ? "A recording of the real NURVIA learner journey will appear here once it is approved."
            : "Please try again later. Every step it covers is listed alongside."}
        </p>
      </div>
      <span className="relative rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200">
        {variant === "pending" ? "Placeholder · approved video pending" : "Playback error"}
      </span>
    </div>
  );
}

function ApprovedVideo({ asset, onFailed }: { asset: ApprovedHeroVideo; onFailed: () => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pausedByViewport = React.useRef(false);
  const userControlled = React.useRef(false);

  // Autoplay (muted) only while the panel is on screen and motion is allowed.
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      if (!userControlled.current) video.pause();
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (userControlled.current) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          pausedByViewport.current = false;
          void video.play().catch(() => undefined);
        } else if (!video.paused) {
          pausedByViewport.current = true;
          video.pause();
        }
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const lastSource = asset.sources.length - 1;

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full bg-[#0B1D33] object-cover"
      poster={asset.poster}
      aria-label={asset.title}
      data-testid="hero-video"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      controls
      muted
      playsInline
      loop={!reducedMotion}
      preload="none"
      onPointerDown={() => { userControlled.current = true; }}
      onKeyDown={() => { userControlled.current = true; }}
      onError={onFailed}
    >
      {asset.sources.map((source, index) => (
        <source
          key={source.src}
          src={source.src}
          type={source.type}
          onError={index === lastSource ? onFailed : undefined}
        />
      ))}
    </video>
  );
}

export function HeroVideoPanel() {
  const [failed, setFailed] = React.useState(false);
  const headingId = React.useId();
  const approved = heroVideo.status === "approved" ? heroVideo : null;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="hero-video-panel"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg dark:border-white/10 dark:bg-[#0B1D33]"
    >
      {/* DOM order (header → video → chapters) is the mobile reading order; on large screens the
          header and chapters share a left column beside the video. */}
      <div className="grid lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <div className="space-y-2 px-6 pb-5 pt-6 sm:px-8 sm:pt-8 lg:col-span-4 lg:row-start-1 lg:pb-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-teal dark:text-teal-300">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Product walkthrough
          </p>
          <h2 id={headingId} className="font-brand text-2xl font-extrabold text-foreground sm:text-[1.75rem]">
            See the learner journey
          </h2>
          <p className="text-sm leading-relaxed text-foreground-secondary">
            From discovering NURVIA to reviewing your results — the walkthrough follows each step of the real learner experience.
          </p>
        </div>

        <div className="px-2 sm:px-3 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:py-3 lg:pl-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0B1D33] ring-1 ring-black/5 dark:ring-white/10">
            {approved && !failed ? (
              <ApprovedVideo asset={approved} onFailed={() => setFailed(true)} />
            ) : (
              <VideoPlaceholder variant={approved ? "failed" : "pending"} poster={approved?.poster} />
            )}
          </div>
        </div>

        <ol
          aria-label="Walkthrough chapters"
          className="grid grid-cols-1 gap-x-4 gap-y-2.5 px-6 pb-6 pt-5 text-sm min-[420px]:grid-cols-2 sm:px-8 sm:pb-8 lg:col-span-4 lg:row-start-2 lg:grid-cols-1 lg:self-end lg:pt-0"
        >
          {heroVideoChapters.map((chapter, index) => (
            <li key={chapter} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 font-mono text-[11px] font-bold text-brand-teal dark:bg-teal-400/10 dark:text-teal-300">
                {index + 1}
              </span>
              <span className="font-medium text-foreground">{chapter}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
