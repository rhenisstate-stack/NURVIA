"use client";

import { useState, useEffect } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import SearchBar from "@/lib/utils/data/SearchBar";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { useMemo } from "react";   // For Random Quote Memoization
import { Lock, X } from "lucide-react";
import { compareExams } from "@/lib/utils/exams/compareExams";

import { useExamAccessGuard } from "@/components/common/dashboards/modals/useExamAccessGuard";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export type LearningStrata =
  | "program"
  | "course"
  | "subject"
  | "unit"
  | "lesson"
  | "topic"
  | "concept"
  | "fact";

const VISTA_STRATA_PANEL = "ati-teas";
const VISTA_STRATA_LEVEL = "Exams";
// const VISTA_STRATA_NAME = "Exam";
const VISTA_STRATA_GROUP = "assessment";
const VISTA_CHILD_LEVEL = "Exam";  // For Live Child Redirection
const VISTA_DEFAULT_PERPAGE_LIST = 96;
const SEASON_ORDER: Record<string, number> = { fall: 0, spring: 1, summer: 2 };
const VISTA_STRATA = VISTA_STRATA_LEVEL.toLocaleLowerCase();
const VISTA_CHILD_STRATA = VISTA_CHILD_LEVEL.toLocaleLowerCase();
const BASE_CHILD_ROUTE = `/web/${VISTA_STRATA_PANEL}/vista/${VISTA_CHILD_STRATA}`;
const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_STRATA}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const NEW_EXAM_DAYS = 14;
const isNewExam = (createdAt?: string | null) => {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= NEW_EXAM_DAYS * 24 * 60 * 60 * 1000;
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const getVisiblePages = (current: number, total: number, windowSize = 2) => {
  const pages: (number | "ellipsis")[] = [];
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);

  pages.push(1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  if (total > 1) pages.push(total);

  return pages;
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main Component
export default function StrataExamsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  const [perPage] = useState(VISTA_DEFAULT_PERPAGE_LIST); // Default Per PAge
  const [currentPage, setCurrentPage] = useState(1);

  type SortDirection = "asc" | "desc";

  const [sortColumn, setSortColumn] = useState<keyof StrataItem | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [showLearningBar] = useState(false);
  const [showSortBar] = useState(false);
  const [activeYear, setActiveYear] = useState<string>("all");
  const [activeSeason, setActiveSeason] = useState<string>("all");

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Router for Edit Redirection
  const router = useRouter();

  const packagesHref = `/dashboards/${VISTA_STRATA_PANEL}/vista/subscriptions/items`;
  const { guard, modal: accessModal } = useExamAccessGuard(VISTA_STRATA_PANEL, "Ati Teas");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [navigatingPackages, setNavigatingPackages] = useState(false);

  useEffect(() => {
    if (showSubscribeModal) router.prefetch(packagesHref);
  }, [showSubscribeModal, packagesHref, router]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Extract Parent ParentIdentifier from URL Search Params
  const searchParams = useSearchParams();
  const examStrataIdentifier = searchParams.get("identifier");
  const safeExamStrataIdentifier = examStrataIdentifier ?? "";
  const isMissingExamStrataIdentifier = !examStrataIdentifier;

  // Sort / Filter Exams based on Learning — initialized synchronously from the URL
  // so the very first fetch already carries the correct level (no stale first request)
  const [dynamicLearningStrataName, setDynamicLearningStrataName] = useState<
    "program" | "course" | "subject" | "unit" | "lesson" | "topic" | "concept" | "fact" | null
  >(() => {
    const initialLevel = searchParams.get("level") as
      | "program" | "course" | "subject" | "unit" | "lesson" | "topic" | "concept" | "fact"
      | null;
    return initialLevel ?? null;
  });
  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  type ExamLayout = "generic" | "glacial" | "pulse" | "cascade" | "classic" | "atlas" | "orbit" | "zen";
  const [layout, setLayout] = useState<ExamLayout>("generic");

  const urlLayout = searchParams.get("layout") as ExamLayout | null;

  useEffect(() => {
    if (urlLayout) {
      setLayout(urlLayout);
    }
  }, [urlLayout]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Pull Data From the Hook !
  const {
    filteredExams,
    skewTotal,
    // skewTotalPages,
    examSearch,
    setExamSearch,
  } = useNominalStrataExams({
    parentIdentifier: safeExamStrataIdentifier, // REQUIRED EXAM STRATA IDENTIFIER
    page: currentPage,
    perPage,
    sortColumn,
    sortDirection,
    dynamicLearningStrataName, //Learning Strata Level
  });

  const availableYears = useMemo(() => {
    return Array.from(new Set(filteredExams.map((e) => e.year).filter((y): y is number => y != null)))
      .sort((a, b) => b - a);
  }, [filteredExams]);

  const availableSeasons = useMemo(() => {
    return Array.from(new Set(filteredExams.map((e) => e.season).filter((s): s is string => !!s)))
      .sort((a, b) => (SEASON_ORDER[a.toLowerCase()] ?? 99) - (SEASON_ORDER[b.toLowerCase()] ?? 99));
  }, [filteredExams]);

  const visibleExams = useMemo(() => {
    return filteredExams
      .filter((e) => {
        const matchYear = activeYear === "all" || String(e.year) === activeYear;
        const matchSeason = activeSeason === "all" || e.season === activeSeason;
        return matchYear && matchSeason;
      })
      .sort((a, b) => {
        const oa = Number(a.order ?? 0) || 0;
        const ob = Number(b.order ?? 0) || 0;

        // Both have a real order value: sort by it (ascending), tie falls back to year/season logic
        if (oa !== 0 && ob !== 0) return oa !== ob ? oa - ob : compareExams(a, b);

        // Only one has an order value: the ordered exam goes first
        if (oa !== 0) return -1;
        if (ob !== 0) return 1;

        // Both are 0 / empty: ignore order, use the existing year / season logic
        return compareExams(a, b);
      });
  }, [filteredExams, activeYear, activeSeason]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil((Number(skewTotal) || 0) / perPage));

  const handlePageChange = (p: number) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Random Quote Selection (Memoized for Performance)
  const randomQuote = useMemo(() => {
    return VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Sorting Helper Function
  const handleSort = (column: keyof StrataItem) => {
    let newDirection: SortDirection = "asc";

    if (sortColumn === column) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
    } else {
      setSortColumn(column);
      setSortDirection("asc");
      newDirection = "asc";
    }

    setSortColumn(column);
    setCurrentPage(1);

    // 🔥 SUCCESS TOAST MESSAGE
    showToast(
      `Successfully Sorted By "${String(column)}" In ${newDirection === "asc" ? "Ascending ▲" : "Descending ▼"
      } Order.`,
      "success"
    );
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const CARD_START_MODES = ["Practice", "Review", "Exam"] as const;

  const [openModeDropdownId, setOpenModeDropdownId] = useState<number | null>(null);

  // Close any open mode section when clicking outside its card's toggle group
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-mode-toggle-group]")) return;
      setOpenModeDropdownId(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Start Exam → Redirect Directly With Selected Mode
  const startExam = (row: StrataItem, mode: string) => {
    setOpenModeDropdownId(null);
    guard(row.accessType !== "Free", () => {
      const identifier = row.guidId ?? row.id;
      router.push(
        `${BASE_CHILD_ROUTE}/${layout}?mode=${encodeURIComponent(mode)}&identifier=${identifier}`
      );
    });
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Toast State
  type ToastType = "success" | "error" | "info";

  interface Toast {
    id: number;
    message: string;
    type: ToastType;
  }

  const [toasts, setToasts] = useState<Toast[]>([]); // for timed toasts
  const [staticToasts, setStaticToasts] = useState<Toast[]>([]); // for persistent toasts

  // Show toast (both timed and static)
  const showToast = (
    message: string,
    type: ToastType = "success",
    duration = 3000
  ) => {
    const id = Date.now();

    const updatedToast: Toast = { id, message, type };

    setToasts([updatedToast]);
    setStaticToasts([updatedToast]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return () => clearTimeout(timeout);
  };

  const removeStaticToast = (id: number) => {
    setStaticToasts((prev) => prev.filter((toast) => toast.id !== id));
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Render 
  return (
    <main
      className="pt-16 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        color: "var(--content-text)",
      }}
    >
      <div className="p-5 space-y-1 w-full bg-[#ecfaff]">

        {/* Header */}
        <div className="relative border border-yellow-200 rounded-2xl bg-[var(--content-bg)] text-[var(--text-color)] px-3 sm:px-4 py-2">
          {/* Centered Title */}
          {filteredExams[0] && (() => {
            const strataPath = [
              filteredExams[0].programName,
              filteredExams[0].courseName,
              filteredExams[0].subjectName,
            ].filter(Boolean).join(" / ");

            const totalQuestions = filteredExams.reduce(
              (sum, e) => sum + (e.questionsCount ?? 0), 0
            );

            const totalAttempted = filteredExams.reduce(
              (sum, e) => sum + (e.examActions?.[0]?.attemptCount ?? 0), 0
            );

            return (
              <div className="w-full flex flex-col items-center justify-center gap-1 text-black">

                {/* Responsive Strata Path */}
                <div className="w-full flex justify-center px-1 sm:px-2">
                  <div className="text-center text-sm sm:text-base md:text-lg font-bold tracking-wide leading-snug break-words">
                    {strataPath}
                  </div>
                </div>

                {/* Statistics */}
                <div className="w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] sm:text-xs font-semibold opacity-70 text-center">
                  <span>Total Exams {skewTotal}</span>
                  <span>Total Questions {totalQuestions}</span>
                  <span>Exams Attempted {totalAttempted}</span>
                </div>

              </div>
            );
          })()}

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Timed Toast Container - Top Center */}
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
            {toasts.map((toastType) => (
              <div
                key={toastType.id}
                className={`
                    px-5 py-2 rounded-xl shadow-2xl text-black font-semibold
                    transition-all duration-300 flex items-center justify-between gap-3
                    bg-gradient-to-r ${toastType.type === "success" ? "from-green-300 via-pink-300 to-indigo-300 " : ""
                  } ${toastType.type === "error" ? "from-red-500 to-red-700" : ""} ${toastType.type === "info" ? "from-blue-500 to-blue-700" : ""
                  }
                  `}
              >
                <span>{toastType.message}</span>
                <button
                  onClick={() => removeStaticToast(toastType.id)}
                  className="ml-3 px-2 py-1 text-sm font-bold bg-yellow-300 border border-cyan-500 text-black rounded-lg hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Static Toast Container - Bottom Center */}
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
            {staticToasts.map((toastType) => (
              <div
                key={toastType.id}
                className={`
                    px-5 py-2 rounded-xl shadow-2xl text-black font-semibold
                    transition-all duration-300 flex items-center justify-between gap-3
                    bg-gradient-to-r ${toastType.type === "success" ? "from-green-300 via-pink-300 to-indigo-300 " : ""
                  } ${toastType.type === "error" ? "from-red-500 to-red-700" : ""} ${toastType.type === "info" ? "from-blue-500 to-blue-700" : ""
                  }
                  `}
              >
                <span>{toastType.message}</span>
                <button
                  onClick={() => removeStaticToast(toastType.id)}
                  className="ml-3 px-2 py-1 text-sm font-bold bg-yellow-300 border border-cyan-500 text-black rounded-lg hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Layout + Filter Toggle Actions */}
          {/* <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">

              <button
                type="button"
                onClick={() => setShowSortBar((prev) => !prev)}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  text-sm
                  font-bold
                  border border-[var(--text-color)] rounded-lg
                  text-[var(--text-color)]
                  hover:bg-gradient-to-r
                  hover:from-purple-500
                  hover:via-pink-500
                  hover:to-red-500
                  hover:text-white
                  transition-all duration-200
                "
              >
                <ArrowDownUp className="w-4 h-4" />
                Sort / Filter
              </button>

            </div> */}

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="flex w-full justify-center">
          <div className="w-full px-2 py-3 max-w-4xl">
            <SearchBar
              value={examSearch}
              onChange={(v) => {
                setExamSearch(v);
                setCurrentPage(1);
              }}
              placeholder={`Type & Search ${VISTA_STRATA_LEVEL} . . . 🏌️‍♂️`}
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Year + Season filters: two equal columns on one row, each packed to its own left */}
        <div className="flex w-full">
          <div className="w-full max-w-7xl mx-auto py-1 px-2">
            <div className="grid grid-cols-2 gap-4 items-center">

              {/* LEFT column: All + years, aligned left */}
              <div className="flex items-center justify-start gap-2 overflow-x-auto min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveYear("all")}
                  className="shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md border transition-all"
                  style={
                    activeYear === "all"
                      ? { background: "#ff914d", color: "#0000ff", borderColor: "#ff914d" }
                      : { borderColor: "var(--text-color)", color: "var(--text-color)" }
                  }
                >
                  All
                </button>

                {availableYears.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setActiveYear(String(y))}
                    className="shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md border transition-all"
                    style={
                      activeYear === String(y)
                        ? { background: "#ff914d", color: "#0000ff", borderColor: "#ff914d" }
                        : { borderColor: "var(--text-color)", color: "var(--text-color)" }
                    }
                  >
                    {y}
                  </button>
                ))}
              </div>

              {/* RIGHT column: All + seasons (+ Clear), aligned left */}
              <div className="flex items-center justify-start gap-2 overflow-x-auto min-w-0 border-l border-[var(--text-color)]/20 pl-4">
                <button
                  type="button"
                  onClick={() => setActiveSeason("all")}
                  className="shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md border transition-all"
                  style={
                    activeSeason === "all"
                      ? { background: "#cb6ce6", color: "#fff", borderColor: "#cb6ce6" }
                      : { borderColor: "var(--text-color)", color: "var(--text-color)" }
                  }
                >
                  All
                </button>

                {availableSeasons.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveSeason(s)}
                    className="shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md border transition-all"
                    style={
                      activeSeason === s
                        ? { background: "#cb6ce6", color: "#fff", borderColor: "#cb6ce6" }
                        : { borderColor: "var(--text-color)", color: "var(--text-color)" }
                    }
                  >
                    {s}
                  </button>
                ))}

                {(activeYear !== "all" || activeSeason !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveYear("all");
                      setActiveSeason("all");
                    }}
                    className="shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md bg-gradient-to-r from-gray-500 to-gray-700 text-white"
                  >
                    Clear ❌
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Cards Grid */}
        <div className="w-full">
          {visibleExams.length === 0 && (
            <div className="w-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent rounded-xl border bg-[var(--content-bg)] text-[var(--text-color)]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="px-4 py-10 text-center opacity-70">
                No {VISTA_STRATA_LEVEL} Found ⚓
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* 🔹 Dynamic Learning Strata Row */}
          {showLearningBar && (
            <div className="mb-1 rounded-2xl border bg-[var(--content-bg)] text-[var(--text-color)] px-4 py-3 flex items-center gap-3">

              {/* Left Label */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs uppercase font-bold tracking-wide">
                  Learning Level
                </span>

                {dynamicLearningStrataName ? (
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-400">
                    {dynamicLearningStrataName.toUpperCase()}
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full text-xs bg-gray-300 text-gray-700">
                    None
                  </div>
                )}
              </div>

              {/* Center Buttons */}
              <div className="flex-1 overflow-x-auto px-4">
                <div className="flex gap-2">

                  {(
                    [
                      "program",
                      "course",
                      "subject",
                      "unit",
                      "lesson",
                      "topic",
                      "concept",
                      "fact",
                    ] as const
                  ).map((level) => {
                    const isActive = dynamicLearningStrataName === level;

                    return (
                      <button
                        key={level}
                        onClick={() => {
                          setDynamicLearningStrataName(level); //  properly typed
                          setCurrentPage(1);

                          showToast(
                            `Learning Strata Set To "${level.toUpperCase()}"`,
                            "success"
                          );
                        }}
                        className={`
                            px-4 py-1.5 text-xs rounded-full border transition-all
                            ${isActive
                            ? "bg-[var(--text-color)] text-[var(--content-bg)] shadow-md"
                            : "hover:bg-[var(--text-color)] hover:text-[var(--content-bg)]"
                          }
                        `}
                      >
                        {level}
                      </button>
                    );
                  })}

                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

              {/* Right Clear */}
              {dynamicLearningStrataName && (
                <button
                  onClick={() => {
                    setDynamicLearningStrataName(null);
                    setCurrentPage(1);
                    showToast("Learning Strata Cleared ⚓");
                  }}
                  className="ml-3 px-4 py-1.5 text-xs rounded-full bg-gradient-to-r from-gray-500 to-gray-700 text-white"
                >
                  Clear ✕
                </button>
              )}
            </div>
          )}

          {/* Sorting Row – Modern Fixed Ends with Scrollable Buttons */}
          {showSortBar && (
            <div className="mb-1 rounded-2xl border bg-[var(--content-bg)] text-[var(--text-color)] backdrop-blur-xl shadow-sm px-4 py-1 flex items-center gap-3">

              {/* Left: Sorted By (fixed) */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs uppercase font-bold tracking-wide">Sorted By</span>
                {sortColumn ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-300 via-pink-500 to-cyan-300 text-[var(--text-color)] text-xs font-semibold shadow-md">
                    {String(sortColumn).toUpperCase()}
                    <span className="text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-semibold">
                    None
                  </div>
                )}
              </div>

              {/* Center: Scrollable Sort Buttons */}
              <div className="flex-1 overflow-x-auto dynamic-vista-sort-scroll px-4">
                <div className="flex gap-3">
                  {[
                    { key: "name", label: "Name" },
                    { key: "description", label: "Description" },
                    { key: "isFeatured", label: "Featured" },
                    { key: "year", label: "Year" },
                    { key: "difficulty", label: "Difficulty" },
                    { key: "season", label: "Season" },
                    { key: "rating", label: "Ratings" },
                  ].map((col) => {
                    const isActive = sortColumn === col.key;

                    return (
                      <button
                        key={col.key}
                        onClick={() => handleSort(col.key as keyof StrataItem)}
                        className={`
                          shrink-0
                          px-4 py-1.5
                          text-xs font-medium
                          rounded-full
                          border
                          transition-all duration-200
                          backdrop-blur-md
                          ${isActive
                            ? "bg-[var(--text-color)] text-[var(--content-bg)] border-[var(--text-color)] shadow-lg"
                            : "hover:text-[var(--content-bg)] hover:bg-[var(--text-color)]"
                          }
                      `}
                      >
                        {col.label}
                        {isActive && (
                          <span className="ml-1 text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Clear Button (fixed) */}
              {sortColumn && (
                <button
                  onClick={() => {
                    setSortColumn(null);
                    setSortDirection("asc");
                    setCurrentPage(1);

                    showToast("Sorting Has Been Reset Successfully 🏌️‍♀️");
                  }}

                  className="
                  shrink-0 ml-4
                  px-4 py-1.5
                  text-xs font-semibold
                  rounded-full
                  bg-gradient-to-r from-gray-500 via-fuchsia-700 to-gray-700
                  text-white
                  hover:scale-105
                  transition-all duration-200
                "
                >
                  Clear ✕
                </button>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          <hr className="my-2 h-px border-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Crads Grid Display Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-8 px-1.5 sm:px-3">
            {visibleExams.map((strataName) => {

              return (
                <div
                  key={strataName.id}
                  className="rounded-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: "#e2edff" }}
                >
                  <div
                    className="relative px-2 sm:px-3 pt-1"
                    style={{ borderTop: "1px solid #9b8d8d", borderLeft: "1px solid #9b8d8d", borderRight: "1px solid #9b8d8d", borderRadius: "8px" }}
                  >
                    {/* Top Row — Featured, Status, Activity all on one line */}
                    <div className="flex items-center justify-between min-h-[10px] gap-1.5">

                      {/* Featured */}
                      <div className="min-w-[90px] flex items-center gap-1">
                        {isNewExam(strataName.createdAt) && (
                          <span className="inline-flex items-center text-xs font-bold px-2 py-0 rounded-full bg-red-800 text-white shadow-md animate-pulse">
                            💫 New
                          </span>
                        )}
                        {strataName.isFeatured && (
                          <span className="inline-flex items-center text-xs font-bold px-2 py-0 rounded-full bg-yellow-500 text-black shadow-md">
                            ★ FEATURED
                          </span>
                        )}
                      </div>

                      {/* Session Status Badge */}
                      <div className="flex-1 flex justify-center">
                        {strataName.examActions && strataName.examActions.length > 0 && (() => {
                          const s = strataName.examActions[0].status ?? "";
                          const statusColors: Record<string, string> = {
                            Completed: "bg-green-800 text-white",
                            InProgress: "bg-blue-800 text-white",
                            Cancelled: "bg-red-800 text-white",
                            Paused: "bg-yellow-800 text-black",
                            Resumed: "bg-cyan-800 text-white",
                            Suspended: "bg-orange-800 text-white",
                            Archived: "bg-gray-800 text-white",
                            Pending: "bg-purple-400 text-white",
                            Scheduled: "bg-indigo-800 text-white",
                            UnderReview: "bg-pink-800 text-white",
                            Destroyed: "bg-black text-white",
                          };
                          return (
                            <span
                              className={`inline-flex items-center justify-center min-w-[110px] px-2 py-0.5 rounded-full text-[10px] font-bold shadow text-center ${statusColors[s] ?? "bg-gray-400 text-white"
                                }`}
                            >
                              {s}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Activity */}
                      <div className="flex items-center gap-1.5 min-w-[40px] justify-end">
                        {strataName.examActions?.length ? (
                          <>
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                            </span>

                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60 [animation-delay:0.3s]" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
                            </span>
                          </>
                        ) : null}
                      </div>

                    </div>

                    {/* Header */}
                    <div
                      className="my-1 text-center"
                    // title={`${strataName.title ?? ""}${strataName.description ? "\n" + strataName.description : ""}`}
                    >
                      <h3 className="text-sm sm:text-lg font-bold text-gray-800 line-clamp-2 break-words leading-tight">
                        {strataName.title ?? "—"}
                      </h3>
                    </div>

                    {/* Divider Line */}
                    <div className="my-3 h-px w-full bg-gray-400/40" />

                    {/* Body */}
                    <div className="text-[11px] sm:text-sm my-3 px-1 sm:px-0 text-gray-800">
                      <div className="flex flex-nowrap items-center justify-between gap-1 sm:gap-3">

                        {/* Questions */}
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <span className="text-green-800 font-bold">
                            <span className="sm:hidden">Quiz : {strataName.questionsCount ?? 0}</span>
                            <span className="hidden sm:inline px-2 py-0.5 rounded-md border border-green-300 bg-green-700 text-white">
                              Total Questions : {strataName.questionsCount ?? 0}
                            </span>
                          </span>
                        </div>

                        {/* Season */}
                        <div className="flex items-center gap-1 whitespace-nowrap min-w-0">
                          <span className="font-medium truncate">
                            {strataName.season ?? "—"}
                          </span>
                        </div>

                        {/* Year */}
                        <div className="flex items-center rounded-md px-2 border border-green-300 bg-green-700 text-white gap-1 whitespace-nowrap">
                          Year :
                          <span className="font-medium">
                            {strataName.year ?? "—"}
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Start Exam button — toggles inline mode section below (like the Laravel accordion) */}
                  <div data-mode-toggle-group>
                    <div className="flex justify-center" style={{ borderRadius: "8px", border: "1px solid #9b8d8d" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenModeDropdownId((prev) => (prev === strataName.id ? null : strataName.id));
                        }}
                        className={`w-full py-2 text-md font-semibold rounded border border-blue-600 transition-all duration-300 ease-in-out hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95 ${openModeDropdownId === strataName.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-transparent text-blue-600"
                          }`}
                        style={{ margin: "6px" }}
                      >
                        Start Exam
                      </button>
                    </div>

                    <div
                      className="grid transition-all duration-500 ease-in-out"
                      style={{
                        gridTemplateRows: openModeDropdownId === strataName.id ? "1fr" : "0fr",
                        opacity: openModeDropdownId === strataName.id ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-nowrap sm:flex-wrap justify-center gap-2 p-2 w-full">
                          {CARD_START_MODES.map((mode, i) => {
                            const isOpenCard = openModeDropdownId === strataName.id;
                            const modeStyles: Record<string, string> = {
                              Practice: "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/40",
                              Review: "bg-green-600 hover:bg-green-700 hover:shadow-green-500/40",
                              Exam: "bg-red-700 hover:bg-red-800 hover:shadow-red-500/40",
                            };
                            return (
                              <button
                                key={mode}
                                type="button"
                                tabIndex={isOpenCard ? 0 : -1}
                                onClick={() => startExam(strataName, mode)}
                                style={{
                                  transitionDelay: isOpenCard ? `${i * 90}ms` : "0ms",
                                  transform: isOpenCard ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.9)",
                                  opacity: isOpenCard ? 1 : 0,
                                }}
                                className={`flex-1 sm:flex-none min-w-0 px-2 sm:px-3 py-1.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded text-white text-center whitespace-nowrap shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg active:scale-95 ${modeStyles[mode] ?? "bg-gray-500"}`}
                              >
                                <span className="sm:hidden">{mode}</span>
                                <span className="hidden sm:inline">{mode} Mode</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              );
            })}
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Bottom Controls — shown only when there are more exams than one page holds */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 text-[var(--text-color)]">
            <span className="text-xs font-bold">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              {" "}· <strong>{skewTotal}</strong> Exams
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--content-bg)] text-[var(--text-color)]"
              >
                Prior
              </button>

              {getVisiblePages(currentPage, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-sm opacity-60 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 rounded-md border text-sm font-semibold ${p === currentPage
                      ? "bg-blue-400 border-red-500 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--content-bg)] text-[var(--text-color)]"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      <hr className="my-4 mt-24 h-px border-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent" />

      {isMissingExamStrataIdentifier && (
        <div className="
                  max-w-xl mx-auto
                  rounded-2xl
                  border
                  shadow-2xl
                  backdrop-blur-xl
                  px-8 py-10
                  text-center
                  text-[var(--text-color)]
                  bg-gradient-to-r
                  from-blue-300
                  via-yellow-700
                  to-indigo-300
                ">
          <div className="text-3xl font-bold mb-3">
            Missing Parent Identifier ⚓
          </div>

          <p className="opacity-70 text-sm mb-6 text-[var(--text-color)]">
            This Exams view Requires a Valid Parent Reference
            Kindly Navigate Using a Valid Strata Source or Return To The Parent Strata Overview To Select A Exam Strata To Explore.
          </p>

          <Link
            href={`${BASE_TOGGLE_ROUTE}/absolute/overview`}
            className="
                    inline-flex items-center gap-2
                    px-6 py-2
                    rounded-lg
                    font-semibold
                    border
                    transition-all duration-300
                    bg-green-900
                    text-yellow-100
                    hover:bg-[var(--text-color)]
                    hover:text-[var(--content-bg)]
                  "
          >
            ← Return To All Exams
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* Dynamic Vista Quote */}

      <div className="w-full flex justify-center items-center mt-24">
        <div className="
              max-w-5xl w-full
              text-center
              px-6 py-4
              rounded-2xl
              border
              backdrop-blur-xl
              bg-gradient-to-r
              from-purple-500/10
              via-pink-500/10
              to-cyan-500/10
              shadow-lg
              transition-all duration-500
            "
        >
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm md:text-base">

            <span className="font-bold tracking-wide text-[var(--text-color)]">
              {randomQuote.quoteTitle}
            </span>

            <span className="opacity-70 text-[var(--text-color)]">
              — {randomQuote.quoteDescription}
            </span>

          </div>
        </div>
      </div>

      <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-[var(--text-color)] to-transparent" />

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {showSubscribeModal && (
        <div
          className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowSubscribeModal(false);
              setNavigatingPackages(false);
            }
          }}
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setShowSubscribeModal(false);
                setNavigatingPackages(false);
              }}
              aria-label="Close"
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6b35]/15 text-[#ea580c]">
              <Lock size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Subscribe to Unlock Full Access
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              You need an active subscription to start this exam.
            </p>
            <button
              type="button"
              disabled={navigatingPackages}
              onClick={() => {
                setNavigatingPackages(true);
                router.push(packagesHref);
              }}
              className="inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-[#ff6b35] hover:bg-[#ea580c] text-white transition disabled:opacity-70 cursor-pointer"
            >
              {navigatingPackages ? "Opening . . ." : "View Packages"}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {accessModal}
    </main >
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
