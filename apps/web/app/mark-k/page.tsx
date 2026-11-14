"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import { LectureCatalogueItemDto } from "@/lib/api-types";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Lock,
  BookOpen,
  RefreshCw,
} from "lucide-react";

export default function MarkKIndexPage() {
  const { status } = useAuth();
  const [lectures, setLectures] = React.useState<LectureCatalogueItemDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const loadCatalogue = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await nurviaApi.getLectureCatalogue();
      if (response.success && response.data) {
        setLectures(response.data);
      } else {
        setLoadError(response.message || "Unable to load the lecture catalogue.");
      }
    } catch {
      setLoadError("Unable to reach the lecture service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (status === "loading") return;
    void loadCatalogue();
  }, [status, loadCatalogue]);

  const categories = React.useMemo(() => {
    const distinct = Array.from(new Set(lectures.map((l) => l.category).filter(Boolean)));
    return ["All", ...distinct];
  }, [lectures]);

  const filteredLectures = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return lectures.filter((lec) => {
      const matchesSearch =
        query === "" ||
        lec.title.toLowerCase().includes(query) ||
        lec.summary.toLowerCase().includes(query) ||
        lec.category.toLowerCase().includes(query) ||
        lec.highYieldConcepts.some((c) => c.toLowerCase().includes(query));
      const matchesCat = selectedCategory === "All" || lec.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [lectures, search, selectedCategory]);

  const isAuthenticated = status === "authenticated";

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Header Hero */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 to-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>NCLEX High-Yield Framework</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Mark K. NCLEX Lecture Notes Index
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore the 12 core clinical review lectures—with free public access to Lectures 1–3 and full 12-lecture access for signed-in NURVIA learners.
            </p>

            {/* Independence & Educational Disclaimer */}
            <div className="max-w-3xl mx-auto p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Educational Reference &amp; Independence Notice</span>
                <p className="text-amber-800 dark:text-amber-300">
                  NURVIA is independent and is not affiliated with, endorsed by, or officially connected to Mark Klimek or Klimek Reviews. All lecture notes, clinical summaries, practice questions, and rationales provided in NURVIA are original educational materials developed by NURVIA.
                </p>
              </div>
            </div>

            {/* Quick Search */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
                <input
                  type="search"
                  aria-label="Search lecture topics"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics (e.g. Ventilator, Lithium, VEAL CHOP)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filter and Lecture Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal"
                      : "bg-surface text-foreground-secondary border-border hover:border-brand-teal/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Loading / Error / Lecture Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-surface p-6 space-y-4">
                    <div className="h-5 w-24 rounded bg-surface-muted animate-pulse" />
                    <div className="h-6 w-3/4 rounded bg-surface-muted animate-pulse" />
                    <div className="h-16 w-full rounded bg-surface-muted animate-pulse" />
                    <div className="h-9 w-full rounded bg-surface-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border px-4">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-sm font-semibold text-foreground">{loadError}</p>
                <Button variant="outline" size="sm" onClick={() => void loadCatalogue()} className="text-xs">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLectures.map((lec) => {
                    const isPublic = lec.accessLevel === "Public";
                    const isLockedForVisitor = !isPublic && !isAuthenticated;
                    const readerHref = `/mark-k/${lec.slug}`;
                    const ctaHref = isLockedForVisitor
                      ? `/sign-in?returnTo=${encodeURIComponent(readerHref)}`
                      : readerHref;

                    return (
                      <div
                        key={lec.id}
                        className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between space-y-4 hover:border-brand-teal/50 hover:shadow-md transition-all group"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-brand font-bold text-xs px-2.5 py-1 rounded-md bg-brand-teal/10 text-brand-teal">
                              Lecture {lec.number}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isPublic ? (
                                <Badge variant="teal" className="text-[10px]">Free Preview</Badge>
                              ) : isLockedForVisitor ? (
                                <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-500/40">
                                  <Lock className="w-3 h-3" />
                                  Learner Access
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">Unlocked</Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-medium text-foreground-muted">{lec.category}</span>
                            <h3 className="font-brand text-lg font-bold text-foreground leading-snug group-hover:text-brand-teal transition-colors">
                              {lec.title}
                            </h3>
                          </div>

                          <p className="text-xs text-foreground-secondary leading-relaxed">
                            {lec.summary}
                          </p>

                          {lec.highYieldConcepts.length > 0 ? (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                                High-Yield Takeaways:
                              </span>
                              <ul className="space-y-1 text-xs text-foreground-secondary">
                                {lec.highYieldConcepts.slice(0, 3).map((c, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : isLockedForVisitor ? (
                            <div className="p-3 rounded-xl bg-surface-muted/70 border border-border/70 text-[11px] text-foreground-muted flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                              <span>Sign in with a NURVIA learner account to unlock full notes and high-yield takeaways.</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="pt-3 border-t border-border">
                          <Link href={ctaHref} className="block w-full">
                            <Button
                              size="sm"
                              variant={isLockedForVisitor ? "outline" : "primary"}
                              className={
                                isLockedForVisitor
                                  ? "w-full text-xs font-semibold h-9 justify-between"
                                  : "w-full text-xs font-semibold h-9 justify-between bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal"
                              }
                            >
                              <span className="flex items-center gap-1.5">
                                {isLockedForVisitor ? <Lock className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                {isLockedForVisitor ? "Sign In to Read Notes" : "Read Full Lecture Notes"}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredLectures.length === 0 && (
                  <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border">
                    <AlertCircle className="w-8 h-8 text-foreground-muted mx-auto" />
                    <p className="text-sm font-semibold text-foreground">
                      {lectures.length === 0 ? "No published lectures available yet" : "No lectures matching your query"}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      Try searching for terms like &quot;Ventilator&quot;, &quot;Lithium&quot;, or &quot;VEAL CHOP&quot;.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Master Prioritization CTA */}
        <section className="border-t border-border bg-surface/50 py-16 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="font-brand text-3xl font-bold text-foreground">
              Put Clinical Lecture Rules Into Practice
            </h2>
            <p className="text-sm text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
              Reinforce your lecture review with NURVIA’s original NCLEX practice examinations and clinical rationales.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/learner/exams">
                <Button size="lg" className="h-11 px-6 text-xs font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Explore Practice Examinations
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/nclex">
                <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-semibold">
                  Explore NCLEX Hub
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
