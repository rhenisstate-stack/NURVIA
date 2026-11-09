"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { initialStudySets, StudySetItem } from "@/lib/study-sets-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Clock,
  Sparkles,
  Star,
  MoreVertical,
  Play,
  Eye,
  Bot,
  Bookmark,
  Share2,
  CheckCircle2,
  Copy,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nurviaApi } from "@/lib/api-client";

interface StudyLibraryViewProps {
  isPublic?: boolean;
  initialTrack?: string;
  initialCategory?: string;
}

export function StudyLibraryView({
  isPublic = false,
  initialTrack,
  initialCategory: propCategory,
}: StudyLibraryViewProps) {
  const searchParams = useSearchParams();
  const paramTrack = initialTrack || searchParams?.get("track") || "";
  const paramCategory = propCategory || searchParams?.get("category") || "";

  // Compute default filter chip based on track
  const defaultFilter = React.useMemo(() => {
    if (paramTrack === "PN_LPN" || paramTrack === "PN_Exit") return "LPN Exams";
    if (paramTrack === "RN" || paramTrack === "RN_Exit") return "RN Exams";
    if (paramCategory === "NCLEX") return "NCLEX";
    return "All";
  }, [paramTrack, paramCategory]);

  const [searchQuery, setSearchQuery] = React.useState(searchParams?.get("q") || "");
  const [activeFilter, setActiveFilter] = React.useState(defaultFilter);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [savedSets, setSavedSets] = React.useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [studySets, setStudySets] = React.useState<StudySetItem[]>(initialStudySets);

  React.useEffect(() => {
    setActiveFilter(defaultFilter);
  }, [defaultFilter]);

  React.useEffect(() => {
    async function fetchPublishedExams() {
      try {
        const res = await nurviaApi.getExams({ status: 5 }); // 5 = ExamStatus.Published
        if (res.success && res.data && res.data.items && res.data.items.length > 0) {
          const apiSets: StudySetItem[] = res.data.items.map((exam) => ({
            id: exam.id,
            title: exam.title,
            slug: exam.code ? exam.code.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `exam-${exam.id.slice(0, 8)}`,
            category: "EXIT EXAM" as const,
            badge: "Proctored" as const,
            viewsCount: "1.2k",
            hasRationales: true,
            hasNgnFormat: true,
            questionCount: exam.totalQuestions || 50,
            rating: 4.9,
            reviewsCount: 128,
            description: exam.description || "",
            examTrack: exam.category === "ExitPredictor" ? "NCLEX" : "ATI",
            pathway: exam.pathway || "RN",
            studentQuote: exam.currentVersion?.instructions || exam.description || "Official board-aligned examination module.",
          }));
          setStudySets([...apiSets, ...initialStudySets.filter((s) => !apiSets.some((a) => a.id === s.id))]);
        }
      } catch {
        // Fallback maintained
      }
    }

    fetchPublishedExams();
  }, []);

  const filterChips = [
    { label: "All", value: "All" },
    { label: "RN Exams", value: "RN Exams" },
    { label: "LPN Exams", value: "LPN Exams" },
    { label: "NCLEX", value: "NCLEX" },
    { label: "Dosage Calculations", value: "Dosage Calculations" },
  ];

  // Filter study sets
  const filteredSets = React.useMemo(() => {
    return studySets.filter((set) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        set.title.toLowerCase().includes(q) ||
        set.description.toLowerCase().includes(q) ||
        set.category.toLowerCase().includes(q) ||
        set.examTrack.toLowerCase().includes(q);

      // Specific track/category matching when provided via URL params
      if (paramCategory) {
        const cat = paramCategory.toLowerCase();
        const matchesSpecificCat =
          set.examTrack.toLowerCase().includes(cat) ||
          set.category.toLowerCase().includes(cat) ||
          (cat === "exitpredictor" && (set.category === "EXIT EXAM" || set.title.toLowerCase().includes("predictor")));
        if (!matchesSpecificCat) return false;
      }

      // Filter chip matching
      let matchesFilter = true;
      if (activeFilter === "RN Exams") {
        matchesFilter = set.pathway === "RN" || set.pathway === "RN_Exit";
      } else if (activeFilter === "LPN Exams") {
        matchesFilter = set.pathway === "PN_LPN" || set.pathway === "PN_Exit";
      } else if (activeFilter === "NCLEX") {
        matchesFilter = set.examTrack === "NCLEX" || set.category === "EXIT EXAM" || set.category === "NCLEX RN";
      } else if (activeFilter === "Dosage Calculations") {
        matchesFilter = set.category === "NURSING MATH" || set.title.toLowerCase().includes("dosage");
      }

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, paramCategory]);

  const toggleSave = (id: string) => {
    setSavedSets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setActiveMenuId(null);
  };

  const copySetLink = (id: string) => {
    navigator.clipboard?.writeText(window.location.origin + `/exam-session?setId=${id}`);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      setActiveMenuId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats Header matching screenshot */}
      <div className="space-y-1">
        <h1 className="font-brand text-2xl sm:text-3xl font-extrabold text-foreground">
          Study Library
        </h1>
        <p className="text-xs sm:text-sm text-foreground-secondary font-medium">
          <strong className="text-foreground">1,209 study sets</strong> •{" "}
          <strong className="text-foreground">73,366 questions</strong> available with evidence-based rationales
        </p>
      </div>

      {/* Full-width Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study sets, topics, or keywords..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal shadow-xs"
        />
      </div>

      {/* Filter Chips matching screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => setActiveFilter(chip.value)}
              className={cn(
                "px-4 py-1.5 rounded-full border transition-all whitespace-nowrap",
                isActive
                  ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal shadow-xs"
                  : "bg-surface text-foreground-secondary border-border hover:border-brand-teal/50 hover:text-foreground"
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Results Count Line */}
      <div className="flex items-center justify-between text-xs text-foreground-muted pt-1">
        <span>
          Showing <strong className="text-foreground">{filteredSets.length}</strong> of{" "}
          <strong className="text-foreground">656</strong> active study sets
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-brand-teal hover:underline text-xs font-medium"
          >
            Clear search
          </button>
        )}
      </div>

      {/* 3-Column Grid of Study Sets matching media_1794209744175_4438dfcc.jpg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSets.map((set) => {
          const isMenuOpen = activeMenuId === set.id;
          const isSaved = savedSets[set.id];

          return (
            <div
              key={set.id}
              className="relative rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-brand-teal/50 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Header: Tag pill and Overflow Menu button */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                    {set.category}
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(isMenuOpen ? null : set.id)}
                      className="p-1 rounded-lg hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Overflow dropdown menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-7 z-20 w-44 rounded-xl border border-border bg-surface text-foreground shadow-xl p-1 space-y-0.5 text-xs animate-in fade-in"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSave(set.id)}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2"
                        >
                          <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-brand-teal text-brand-teal")} />
                          <span>{isSaved ? "Remove from Library" : "Save to My Library"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copySetLink(set.id)}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedId === set.id ? "Link Copied!" : "Copy Study Link"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Study-Set Title */}
                <h3 className="font-brand text-base sm:text-lg font-bold text-foreground leading-snug">
                  {set.title}
                </h3>

                {/* Question count */}
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                  <span>{set.questionCount} questions</span>
                </div>

                {/* Rating and review count */}
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                  </div>
                  <span className="font-bold text-foreground">{set.rating}</span>
                  <span>({set.reviewsCount.toLocaleString()} reviews)</span>
                </div>

                {/* Student Quote snippet */}
                {set.studentQuote && (
                  <p className="text-xs text-foreground-secondary italic bg-surface-muted/50 p-2.5 rounded-xl border border-border/50">
                    &ldquo;{set.studentQuote}&rdquo;
                  </p>
                )}
              </div>

              {/* 3 Action Buttons matching screenshot */}
              {(() => {
                const isRealExam = set.id.length > 20 && set.id.includes("-");
                const queryParam = isRealExam ? `examId=${set.id}` : `setId=${set.id}`;

                return (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60">
                    {/* 1. Exam action */}
                    <Link
                      href={`/exam-session?${queryParam}&mode=Exam`}
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        className="w-full text-xs h-8 px-2 font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark gap-1 justify-center shadow-2xs"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Exam</span>
                      </Button>
                    </Link>

                    {/* 2. Review action */}
                    <Link
                      href={`/exam-session?${queryParam}&mode=Review`}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 px-2 font-semibold gap-1 justify-center hover:bg-surface-muted"
                      >
                        <Eye className="w-3 h-3 text-foreground-muted" />
                        <span>Review</span>
                      </Button>
                    </Link>

                    {/* 3. Tutor action */}
                    <Link
                      href={`/exam-session?${queryParam}&mode=Tutor`}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 px-2 font-semibold gap-1 justify-center hover:bg-surface-muted"
                      >
                        <Bot className="w-3 h-3 text-foreground-muted" />
                        <span>Tutor</span>
                      </Button>
                    </Link>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {filteredSets.length === 0 && (
        <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border">
          <BookOpen className="w-10 h-10 text-foreground-muted mx-auto" />
          <div className="font-semibold text-foreground">No study sets found</div>
          <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
            Try choosing &quot;All&quot; or clearing your search term to see the complete curriculum.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("All");
            }}
          >
            Show All Sets
          </Button>
        </div>
      )}
    </div>
  );
}
