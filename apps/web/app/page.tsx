"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentTestimonialCarousel } from "@/components/home/student-testimonial-carousel";
import { FloatingStudyChat } from "@/components/home/floating-study-chat";
import { PracticeQuestionPreview } from "@/components/home/practice-question-preview";
import { HeroBackgroundVideo } from "@/components/home/hero-background-video";
import { ROUTES } from "@/lib/routes";
import {
  initialStudySets,
  StudySetItem,
} from "@/lib/study-sets-data";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  HeartPulse,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  Eye,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

function getExamBrowseHref(set: StudySetItem) {
  const params = new URLSearchParams();
  if (set.pathway !== "All") params.set("track", set.pathway);
  const category = set.examTrack === "Regular"
    ? "RegularCourse"
    : set.examTrack === "NCLEX"
      ? "ExitPredictor"
      : set.examTrack;
  params.set("category", category);
  return `/exams?${params.toString()}`;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const { status, user } = useAuth();
  const startHref = status === "authenticated" && user?.role === "Learner"
    ? "/learner/exams"
    : status === "authenticated"
      ? "/access-denied"
    : "/sign-up?returnTo=%2Flearner%2Fexams";

  const categories = [
    "All",
    "FUNDAMENTALS",
    "CORE SERIES",
    "SPECIALTIES",
    "NURSING MATH",
    "EXIT EXAM",
  ];

  // Filter study sets based on search query & category filter chips
  const filteredSets = React.useMemo(() => {
    return initialStudySets.filter((set) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "All" || set.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const learningModes = [
    {
      mode: "Review Mode",
      badge: "Deep Learning",
      icon: BookOpen,
      desc: "Immediate rationale feedback with clinical judgment breakdowns after every question. Understand why options are right and wrong.",
    },
    {
      mode: "Exam Mode",
      badge: "Simulation",
      icon: Clock,
      desc: "Timed, proctored environment mirroring actual ATI, HESI, and NCLEX interface rules. Deferred results for true readiness testing.",
    },
    {
      mode: "Tutor Mode",
      badge: "AI Assisted",
      icon: BrainCircuit,
      desc: "Guided hints, concept summaries, and Socratic clinical judgment questioning without giving away answers prematurely.",
    },
  ];

  return (
    <PublicShell>
      {/* 1. HERO — reference-matched split composition: messaging + Quick Practice,
          both layered over a single responsive background video. The product video
          was deliberately NOT placed in a separate section below the hero. */}
      <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden border-b border-border/70">
        <HeroBackgroundVideo />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 md:gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 space-y-7 lg:col-span-7">
              <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.22em] text-brand-teal">
                <span aria-hidden="true" className="h-px w-10 bg-brand-teal/70" />
                Built for nursing school exam days
                <span aria-hidden="true" className="h-px w-5 bg-brand-teal/30" />
              </p>
              <h1
                id="hero-heading"
                className="font-brand text-[2.75rem] font-extrabold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem]"
              >
                <span className="block">
                  Turn Practice Into <span className="text-brand-teal">ATI</span>
                </span>
                <span className="block">
                  and <span className="text-brand-teal">HESI</span> Readiness
                </span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-foreground-secondary sm:text-lg">
                Work through ATI, HESI, and exit-exam practice at your own pace. Learn from clear rationales, build comfort with NGN formats, and choose the study mode that fits today.
              </p>
              <div className="flex flex-col gap-3 pt-1 min-[480px]:flex-row md:flex-col lg:flex-row">
                <Link
                  href={startHref}
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "h-14 w-full gap-2 rounded-full bg-accent px-8 text-[1.0625rem] font-bold text-white shadow-md hover:bg-accent-hover focus-visible:ring-offset-background min-[480px]:w-auto md:w-full lg:w-auto lg:min-w-[230px]",
                  })}
                >
                  Try a Practice Set <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href={ROUTES.exams}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "h-14 w-full rounded-full border-border bg-surface px-8 text-[1.0625rem] font-bold text-foreground hover:border-accent/60 hover:text-accent-highlight focus-visible:ring-offset-background min-[480px]:w-auto md:w-full lg:w-auto lg:min-w-[230px]",
                  })}
                >
                  Explore the Exam Library
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1" aria-label="Rated 4.9 out of 5 by more than 2,000 students">
                <span className="flex items-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-amber-500 text-amber-500"
                    />
                  ))}
                </span>
                <span className="text-sm font-bold text-foreground">4.9/5</span>
                <span className="text-sm text-foreground-secondary">shared by 2,000+ students</span>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-5">
              <PracticeQuestionPreview />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHARED BY STUDENTS AFTER EXAM DAY (Automatic Rotating Testimonial Carousel) */}
      <StudentTestimonialCarousel />

      {/* 3. FIND YOUR NEXT STUDY SET (Featured Cards matching media_1794209744015_1f706ca1.jpg) */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-teal dark:text-teal-400">
              FIND YOUR NEXT STUDY SET
            </span>
            <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
              Start with the exam in front of you
            </h2>
            <p className="text-sm sm:text-base text-foreground-secondary">
              Pick a track, answer a few questions, and let your results guide what you review next.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Featured Card: ATI Exams */}
            <div className="rounded-2xl border border-border/80 bg-surface p-7 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-brand-teal/50 transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-brand text-2xl font-bold text-foreground">
                      ATI Exams
                    </h3>
                    <p className="text-xs font-semibold text-brand-teal">
                      From Fundamentals to Predictor
                    </p>
                  </div>
                </div>

                <p className="text-sm text-foreground-secondary leading-relaxed">
                  Follow your ATI course sequence, sharpen clinical judgment, and use each rationale to understand the decision behind the answer.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-3 py-1 rounded-full bg-surface-muted text-foreground-secondary font-medium">
                    • Course-aligned practice
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-muted text-foreground-secondary font-medium">
                    • NGN included
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-muted text-foreground-secondary font-medium">
                    • Full rationales
                  </span>
                </div>
              </div>

              <Link href="/exams?category=ATI" className="w-full block pt-2">
                <Button className="w-full h-11 text-sm font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark justify-center gap-1.5">
                  <span>Open ATI Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Right Featured Card: HESI & Exit Exams */}
            <div className="rounded-2xl border border-border/80 bg-surface p-7 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-brand-teal/50 transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-brand text-2xl font-bold text-foreground">
                      HESI & Exit Exams
                    </h3>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      Specialty and exit-exam practice
                    </p>
                  </div>
                </div>

                <p className="text-sm text-foreground-secondary leading-relaxed">
                  Prepare by specialty or rehearse the full exit-exam experience, then review the reasoning behind every answer you submit.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-3 py-1 rounded-full bg-surface-muted text-foreground-secondary font-medium">
                    • Specialty practice
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-muted text-foreground-secondary font-medium">
                    • Exit exam banks
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-muted text-foreground-secondary font-medium">
                    • Review • Exam • Tutor
                  </span>
                </div>
              </div>

              <Link href="/exams?category=HESI" className="w-full block pt-2">
                <Button className="w-full h-11 text-sm font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark justify-center gap-1.5">
                  <span>Open HESI Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHOOSE A STUDY SET (Study Sets Catalog Grid matching media_1794209744006_31b2734c.jpg & media_1794209743998_1452e0de.jpg) */}
      <section id="study-sets" className="py-16 sm:py-20 border-t border-border/80 bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Row: Title on Left, Search Bar on Right */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal dark:text-teal-400">
                CHOOSE A STUDY SET
              </span>
              <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
                Find the exam you need today
              </h2>
              <p className="text-sm text-foreground-secondary">
                Browse by course, practice at your pace, and review the reasoning behind every answer.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="w-full lg:w-96 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find Pharmacology, Pediatrics, and more..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal shadow-xs"
              />
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 text-xs font-medium">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal font-semibold shadow-xs"
                    : "bg-surface text-foreground-secondary border-border hover:border-brand-teal/50 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Result Count */}
          <div className="flex items-center justify-between text-xs text-foreground-muted pt-1">
            <span>
              Showing {filteredSets.length} study set{filteredSets.length !== 1 ? "s" : ""}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-brand-teal hover:underline"
              >
                Clear search filter
              </button>
            )}
          </div>

          {/* 4-Column Grid of Study Sets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredSets.map((set) => (
              <div
                key={set.id}
                className="rounded-2xl border border-border/80 bg-surface p-5 flex flex-col justify-between space-y-4 hover:border-brand-teal/50 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Card Header: Category pill & Free badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                      {set.category}
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      ★ {set.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-brand text-lg font-bold text-foreground leading-snug group-hover:text-brand-teal transition-colors">
                    {set.title}
                  </h3>

                  {/* Metadata Row 1: Track and pathway */}
                  <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium">
                    <span className="flex items-center gap-1 font-semibold text-foreground-secondary">
                      {set.examTrack} · {set.pathway}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                      NGN-ready format
                    </span>
                  </div>

                  {/* Metadata Row 2: Answer reasoning included */}
                  <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                    <FileText className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                    <span>Answer reasoning included</span>
                  </div>

                  {/* Metadata Row 3: Current NGN formats */}
                  <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Current NGN formats</span>
                  </div>

                  {/* Card Description */}
                  <p className="text-xs text-foreground-secondary leading-relaxed pt-1 line-clamp-3">
                    {set.description}
                  </p>
                </div>

                {/* 2 Buttons matching screenshot */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Link href={getExamBrowseHref(set)} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs h-9 font-semibold gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Browse matching exams</span>
                    </Button>
                  </Link>

                  <Link
                    href={getExamBrowseHref(set)}
                    className="w-full block"
                  >
                    <Button
                      size="sm"
                      className="w-full text-xs h-9 font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark justify-center gap-1"
                    >
                      <span className="truncate">Find an exam</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredSets.length === 0 && (
            <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border">
              <Search className="w-10 h-10 text-foreground-muted mx-auto" />
              <div className="font-semibold text-foreground">No study sets match your query</div>
              <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                Try searching for general terms like &quot;Pharmacology&quot;, &quot;Fundamentals&quot;, or select &quot;All&quot; categories.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Reset Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 5. THE 3 CORE LEARNING MODES */}
      <section className="py-16 sm:py-20 border-t border-border/80 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-teal dark:text-teal-400">
              PURPOSE-BUILT STUDY ENGINE
            </span>
            <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
              Built for How Nursing Students Truly Learn
            </h2>
            <p className="text-sm sm:text-base text-foreground-secondary">
              Unlike static quiz dumps, NURVIA adapts to your immediate study goal—whether you are dissecting a complex case or taking a proctored simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningModes.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.mode}
                  className="relative overflow-hidden hover:border-brand-teal/50 transition-all p-2 flex flex-col justify-between"
                >
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal dark:text-teal-300 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="teal">{m.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg">{m.mode}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed pt-1">
                      {m.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <Link href={`/exam-session?mode=${m.mode.replace(" Mode", "")}`}>
                      <Button variant="link" className="text-xs font-semibold p-0 text-brand-teal hover:underline">
                        Launch practice in {m.mode} →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CLINICAL JUDGMENT MEASUREMENT MODEL (NGN) */}
      <section className="py-16 sm:py-20 bg-surface/50 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <Badge variant="teal">Clinical Judgment Measurement Model</Badge>
              <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
                Next Generation NCLEX (NGN) Formats Fully Supported
              </h2>
              <p className="text-foreground-secondary leading-relaxed text-sm">
                Modern nursing assessments demand more than rote memorization. NURVIA’s question engine evaluates the six clinical judgment cognitive skills:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium">
                {[
                  { num: "1", title: "Recognize Cues" },
                  { num: "2", title: "Analyze Cues" },
                  { num: "3", title: "Prioritize Hypotheses" },
                  { num: "4", title: "Generate Solutions" },
                  { num: "5", title: "Take Actions" },
                  { num: "6", title: "Evaluate Outcomes" },
                ].map((s) => (
                  <div key={s.num} className="p-3 rounded-xl border border-border bg-background flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold text-xs shrink-0">
                      {s.num}
                    </span>
                    <span className="font-semibold text-foreground">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold text-foreground">Interactive Clinical Vignette</span>
                <Badge variant="success">Unfolding Case Study</Badge>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="font-semibold text-foreground">
                  Patient: M.K., 58yo Male · Post-Op Day 1 Total Knee Arthroplasty
                </div>
                <p className="text-foreground-secondary leading-relaxed bg-surface p-3.5 rounded-xl border border-border/60">
                  Patient presents with sudden-onset sharp pleuritic chest pain, tachypnea, and SpO2 88% on room air. Heart rate is 118 bpm, regular. Diminished breath sounds at right base.
                </p>
                <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-900 dark:text-teal-100">
                  <strong className="block mb-1 text-brand-teal font-bold">Clinical Rationale Preview:</strong>
                  Recognize sudden dyspnea, tachycardia, and pleuritic pain in an orthopedic surgical patient as high suspicion for acute Pulmonary Embolism (PE). Immediate priority: apply high-flow oxygen, elevate head of bed, and notify surgical/rapid response team.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRIMARY CTA SECTION */}
      <section className="py-20 text-center bg-background border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
            Begin Your Structured Nursing Preparation Today
          </h2>
          <p className="text-foreground-secondary text-sm sm:text-base max-w-2xl mx-auto">
            Experience our independent learning ecosystem, built from the ground up for nursing clarity, academic excellence, and clinical confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href={startHref}>
              <Button size="lg" className="h-12 px-8 text-sm font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark">
                Start Practicing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/exams">
              <Button variant="outline" size="lg" className="h-12 px-8 text-sm font-semibold">
                Browse All Exam Tracks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Clinical Study Chat Assistant */}
      <FloatingStudyChat />
    </PublicShell>
  );
}
