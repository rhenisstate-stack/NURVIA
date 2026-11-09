"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentTestimonialCarousel } from "@/components/home/student-testimonial-carousel";
import { StudySetPreviewModal } from "@/components/home/study-set-preview-modal";
import { FloatingStudyChat } from "@/components/home/floating-study-chat";
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
  GraduationCap,
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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [previewingSet, setPreviewingSet] = React.useState<StudySetItem | null>(null);
  const { status, user } = useAuth();
  const practiceHref = status === "authenticated"
    ? "/learner/custom-practice"
    : "/sign-in?returnTo=%2Flearner%2Fcustom-practice";
  const startHref = status === "authenticated"
    ? "/learner/exams"
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
      <section className="relative isolate overflow-hidden bg-[#0B1D33] text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(13,148,136,0.30),transparent_48%),linear-gradient(110deg,#0B1D33_8%,#142B4A_72%,#0B1D33)]" />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[54%] border-l border-white/10 bg-white/[0.025] lg:block" />
        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-12 lg:px-8">
          <div className="space-y-6 lg:col-span-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              Nursing exam preparation, reimagined
            </p>
            <h1 className="max-w-2xl font-brand text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your Path to Nursing Confidence.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Build clinical confidence through focused practice, realistic nursing assessments, and meaningful performance insights designed to help you prepare with purpose.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Link href={startHref}>
                <Button size="lg" className="h-12 w-full gap-2 bg-brand-teal px-7 text-white hover:bg-brand-tealDark sm:w-auto">
                  Start Practicing <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/exams">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full border-2 border-white/80 bg-white/5 px-7 text-white hover:border-white hover:bg-white/15 hover:text-white focus-visible:ring-white sm:w-auto"
                >
                  Explore Exams
                </Button>
              </Link>
            </div>
            <Link
              href={practiceHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-teal-200/50 bg-teal-300/10 px-4 py-2 text-sm font-semibold text-teal-100 transition-colors hover:bg-teal-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1D33]"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Quick Practice
              {status === "authenticated" && user?.role === "Learner" && <span className="sr-only">, open custom practice</span>}
            </Link>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/15 bg-slate-950/45 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">The learner journey</p>
                  <p className="mt-1 text-sm text-slate-300">A focused path from practice to insight</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/15 text-teal-200">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <ol className="mt-5 space-y-3">
                {[
                  ["01", "Choose an exam", "Find a published assessment for your pathway."],
                  ["02", "Practice with purpose", "Work through a persisted attempt at your pace."],
                  ["03", "Review your result", "Use your submitted performance to plan next steps."],
                ].map(([step, title, description]) => (
                  <li key={step} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <span className="font-mono text-sm font-bold text-teal-300">{step}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[11px] text-slate-400">
                Product journey overview · interactive exam data is available after sign-in.
              </p>
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
                    • 40,000+ questions
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
                    • 20,000+ questions
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

                  {/* Metadata Row 1: Rating, Reviews, Views */}
                  <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium">
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {set.rating} ({set.reviewsCount.toLocaleString()})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-foreground-muted" />
                      {set.viewsCount}
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
                  {/* Top Button: Preview the set */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewingSet(set)}
                    className="w-full text-xs h-9 font-semibold gap-1.5 bg-rose-50/60 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100/70 dark:hover:bg-rose-950/40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preview the set</span>
                  </Button>

                  {/* Bottom Button: Open [Exam Name] */}
                  <Link
                    href={`/exam-session?track=${set.pathway}&category=${set.examTrack}`}
                    className="w-full block"
                  >
                    <Button
                      size="sm"
                      className="w-full text-xs h-9 font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark justify-center gap-1"
                    >
                      <span className="truncate">Open {set.title}</span>
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
            <Link href="/learner">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark">
                Enter Learner Dashboard
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

      {/* Preview Modal for Study Sets */}
      <StudySetPreviewModal
        studySet={previewingSet}
        onClose={() => setPreviewingSet(null)}
      />

      {/* Floating Clinical Study Chat Assistant */}
      <FloatingStudyChat />
    </PublicShell>
  );
}
