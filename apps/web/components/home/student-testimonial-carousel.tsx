"use client";

import * as React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  Quote,
} from "lucide-react";
import { StudentTestimonial, sampleStudentTestimonials } from "@/lib/study-sets-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudentTestimonialCarouselProps {
  testimonials?: StudentTestimonial[];
  autoPlayIntervalMs?: number;
  className?: string;
}

export function StudentTestimonialCarousel({
  testimonials = sampleStudentTestimonials,
  autoPlayIntervalMs = 5500,
  className,
}: StudentTestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isPausedManually, setIsPausedManually] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(3);

  // Touch gesture state
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);
  const resumeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Detect screen size for responsive cards-per-view
  React.useEffect(() => {
    function updateLayout() {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    }

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Detect user preference for reduced motion
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const totalItems = testimonials.length;
  const maxIndex = Math.max(0, totalItems - visibleCount);

  // Automatic advancement
  React.useEffect(() => {
    if (totalItems <= visibleCount) return;
    if (prefersReducedMotion || isHovered || isFocused || isPausedManually) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoPlayIntervalMs);

    return () => clearInterval(interval);
  }, [totalItems, visibleCount, prefersReducedMotion, isHovered, isFocused, isPausedManually, maxIndex, autoPlayIntervalMs]);

  // Handle manual interaction pause with auto-resume after 8 seconds
  const registerManualInteraction = React.useCallback(() => {
    setIsPausedManually(true);
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsPausedManually(false);
    }, 8000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const handlePrev = () => {
    registerManualInteraction();
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    registerManualInteraction();
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="w-full border-y border-border/80 bg-surface/60 py-8 text-center">
        <p className="text-xs text-foreground-muted">
          Verified student exam outcome reports are temporarily updating. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Student exam outcomes and testimonials"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "w-full border-y border-border/80 bg-surface/50 py-8 sm:py-10 transition-colors relative overflow-hidden",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold tracking-widest uppercase text-foreground">
                  SHARED BY STUDENTS AFTER EXAM DAY
                </h2>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal font-semibold">
                  <Sparkles className="w-3 h-3" /> Live Carousel
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted">
                Student-submitted licensure & exit exam outcomes Â· Updated continuously
              </p>
            </div>
          </div>

          {/* Automatic Rotation Status Indicator */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-foreground-muted font-medium flex items-center gap-1.5">
              <span className={cn(
                "w-2 h-2 rounded-full",
                isHovered || isFocused ? "bg-amber-500" : "bg-brand-teal animate-pulse"
              )} />
              <span>{isHovered || isFocused ? "Paused on Hover" : "Auto Rotating"}</span>
              <span className="text-border mx-1">â€¢</span>
              <span>{currentIndex + 1} of {totalItems}</span>
            </span>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={cn(
              "flex gap-4",
              prefersReducedMotion
                ? "transition-none"
                : "transition-transform duration-500 ease-in-out"
            )}
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {testimonials.map((item) => {
              const initials = item.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "shrink-0 rounded-2xl border border-border/90 bg-background/95 p-5 shadow-xs hover:border-brand-teal/50 hover:shadow-md transition-all flex flex-col justify-between",
                    visibleCount === 1 && "w-full",
                    visibleCount === 2 && "w-[calc(50%-0.5rem)]",
                    visibleCount === 3 && "w-[calc(33.333%-0.67rem)]"
                  )}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Track Badge, Status Badge & Score */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-brand font-bold text-xs px-2.5 py-0.5 rounded-md bg-brand-navy/10 dark:bg-brand-teal/15 text-brand-navy dark:text-teal-300 border border-brand-navy/20 dark:border-brand-teal/30">
                          {item.examTrack}
                        </span>
                        {item.scoreOrLevel && (
                          <span className="text-[11px] font-semibold text-foreground-secondary">
                            {item.scoreOrLevel}
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {item.resultStatus.toUpperCase()}
                      </span>
                    </div>

                    {/* Testimonial Quote */}
                    <div className="relative pt-1">
                      <p className="text-xs sm:text-[13px] text-foreground leading-relaxed italic line-clamp-3">
                        &ldquo;{item.testimonial}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Student Info & Verification */}
                  <div className="pt-4 mt-3 border-t border-border/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-navy to-brand-teal text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        {initials}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-foreground block leading-tight">
                          {item.displayName}
                        </span>
                        {item.examDate && (
                          <span className="text-[10px] text-foreground-muted font-mono block">
                            Exam: {item.examDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
