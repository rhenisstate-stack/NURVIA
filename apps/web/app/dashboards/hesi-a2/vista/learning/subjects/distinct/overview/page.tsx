"use client";

import { useState } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useDistinctStrataSubjects } from "@/lib/hooks/nexus/strata/learning/subjects/distinct/useDistinctStrataSubjects";
import type { StrataItem } from "@/lib/hooks/nexus/strata/learning/subjects/distinct/useDistinctStrataSubjects";
import SearchBar from "@/lib/utils/data/SearchBar";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_TITLE } from "@/lib/config/config";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { useRelativeStrataAssessmentResults } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import { useMemo } from "react";   // For Random Quote Memoization

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const VISTA_STRATA_PANEL = "hesi-a2";
const VISTA_STRATA_LEVEL = "Subjects";
// const VISTA_STRATA_NAME = "Subject";
const VISTA_STRATA_GROUP = "learning";
const VISTA_CHILD_LEVEL = "Exams";  // For Distinct Child Redirection
const VISTA_DEFAULT_PERPAGE_LIST = 96;
const VISTA_STRATA = VISTA_STRATA_LEVEL.toLocaleLowerCase();
const VISTA_CHILD_STRATA = VISTA_CHILD_LEVEL.toLocaleLowerCase();
const BASE_CHILD_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/assessment/${VISTA_CHILD_STRATA}`;
const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_STRATA}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main Component
export default function StrataSubjectsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  const [perPage] = useState(VISTA_DEFAULT_PERPAGE_LIST); // Default Per PAge
  const [currentPage, setCurrentPage] = useState(1);

  type SortDirection = "asc" | "desc";

  const [sortColumn] = useState<keyof StrataItem | null>(null);
  const [sortDirection] = useState<SortDirection>("asc");

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Router for Edit Redirection
  const router = useRouter();

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Extract Parent ParentIdentifier from URL Search Params
  const searchParams = useSearchParams();
  const parentStrataIdentifier = searchParams.get("identifier");
  const safeParentStrataIdentifier = parentStrataIdentifier ?? "";
  const isMissingParentStrataIdentifier = !parentStrataIdentifier;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Pull Data From the Hook !
  const {
    filteredSubjects,
    // skewTotal,
    // skewTotalPages,
    subjectSearch,
    setSubjectSearch,
  } = useDistinctStrataSubjects({
    parentIdentifier: safeParentStrataIdentifier, // REQUIRED PARENT STRATA IDENTIFIER
    page: currentPage,
    perPage,
    sortColumn,
    sortDirection,
  });

  const { filteredExamResults: allResults } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const subjectProgressMap = useMemo(() => {
    const map = new Map<string, { total: number; count: number; passedCount: number; attempted: boolean }>();
    allResults.forEach((r) => {
      if (!r.subjectGuidId) return;
      if (!map.has(r.subjectGuidId)) {
        map.set(r.subjectGuidId, { total: 0, count: 0, passedCount: 0, attempted: false });
      }
      const entry = map.get(r.subjectGuidId)!;
      entry.total += r.percentageScore ?? 0;
      entry.count += 1;
      entry.attempted = true;
      if (r.passed) entry.passedCount += 1;
    });
    return map;
  }, [allResults]);

  // Featured subjects surface first, then everything is ordered by `order` ascending (1 first).
  // Non-numeric or missing order goes last; ties fall back to the name so the list is stable.
  const sortedSubjects = useMemo(() => {
    const orderOf = (value: unknown) => {
      const n = parseInt(String(value ?? "").trim(), 10);
      return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
    };

    const byOrder = (a: StrataItem, b: StrataItem) =>
      orderOf(a.order) - orderOf(b.order) ||
      (a.name ?? "").localeCompare(b.name ?? "", undefined, { numeric: true, sensitivity: "base" });

    const featured = filteredSubjects.filter((s) => s.isFeatured).sort(byOrder);
    const rest = filteredSubjects.filter((s) => !s.isFeatured).sort(byOrder);
    return [...featured, ...rest];
  }, [filteredSubjects]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Random Quote Selection (Memoized for Performance)
  const randomQuote = useMemo(() => {
    return VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Card Click → Redirect to Overview
  const handleCardClick = (row: StrataItem) => {
    const identifier = row.guidId ?? row.id;

    router.push(
      `${BASE_CHILD_ROUTE}/distinct/overview?level=subject&identifier=${identifier}`
    );
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
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-1 space-y-1 w-full">
        {/* Header */}
        <div className="relative border border-yellow-100 rounded-2xl bg-[var(--content-bg)] text-[var(--text-color)] px-4 py-0">

          {/* Centered Title */}
          {filteredSubjects[0]?.courseName && (
            <div className="w-full flex justify-center px-3 sm:px-4">
              <div className="text-center text-base sm:text-lg md:text-2xl font-bold tracking-wide leading-snug break-words">
                <span>
                  {VISTA_STRATA_PANEL} / {filteredSubjects[0].courseName}
                </span>
              </div>
            </div>
          )}

          <div className="text-center">
            <h1 className="text-sm md:text-sm font-bold opacity-60">{APP_TITLE}</h1>
          </div>

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

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="flex w-full justify-center">
          <div className="w-full max-w-5xl">
            <SearchBar
              value={subjectSearch}
              onChange={(v) => {
                setSubjectSearch(v);
                setCurrentPage(1);
              }}
              placeholder={`Type & Search ${VISTA_STRATA_LEVEL} . . . 🏌️‍♂️`}
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <hr className="my-1 h-px border-0 bg-gradient-to-r from-green-100 via-gray-200 to-blue-100" />

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Cards Grid */}
        <div className="w-full">
          {filteredSubjects.length === 0 && (
            <div className="w-full bg-gradient-to-r from-transparent via-yellow-200 to-transparent rounded-xl border bg-[var(--content-bg)] text-[var(--text-color)]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="px-4 py-10 text-center opacity-70">
                No {VISTA_STRATA_LEVEL} Found ⚓
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 p-8 rounded-xl">

            {/* Build Your Own Exam — only shown when subjects exist */}
            {sortedSubjects.length > 0 && (
              <div
                className="rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "#e2edff" }}
              >
                <div
                  className="px-3 pb-3"
                  style={{ borderTop: "1px solid #9b8d8d", borderLeft: "1px solid #9b8d8d", borderRight: "1px solid #9b8d8d", borderRadius: "8px" }}
                >
                  <div className="flex items-center gap-2 pt-2">
                    <PlusCircle className="w-4 h-4 shrink-0 text-gray-800" />
                    <h3 className="text-base font-semibold text-gray-800 truncate">Build Your Own Exam</h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ background: "#198754" }}>
                      Custom Selection
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ background: "#198754" }}>
                      Choose Subjects &amp; Exams
                    </span>
                  </div>
                </div>

                {/* ASSUMPTION: adjust this href to your real custom-exam-builder route */}
                <div className="flex justify-center" style={{ borderRadius: "8px", border: "1px solid #9b8d8d" }}>
                  <Link
                    href="#"
                    className="block w-full py-2 text-center text-sm font-semibold rounded"
                    style={{ border: "1px solid #0d6efd", color: "#0d6efd", margin: "6px" }}
                  >
                    Create Custom Exam
                  </Link>
                </div>
              </div>
            )}

            {sortedSubjects.map((strataName) => {
              const subjectKey = strataName.guidId ?? String(strataName.id);
              const progress = subjectProgressMap.get(subjectKey);
              const cardPct = progress ? Math.round(progress.total / progress.count) : 0;
              const cardStatus = progress
                ? progress.passedCount > 0
                  ? "In Progress"
                  : "Attempted"
                : "Not Started";

              const statusBg =
                cardStatus === "In Progress" ? "#5e4700"
                  : cardStatus === "Attempted" ? "#0dcaf0" : "#7100ce";
              const statusColor =
                cardStatus === "Not Started" ? "#fff" : "#000";

              return (
                <div
                  key={strataName.id}
                  className="rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: "#e2edff" }}
                >
                  <div
                    className="relative px-3 pb-3"
                    style={{ borderTop: "1px solid #9b8d8d", borderLeft: "1px solid #9b8d8d", borderRight: "1px solid #9b8d8d", borderRadius: "8px" }}
                  >
                    {strataName.isFeatured && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-black shadow-md">
                        FEATURED
                      </span>
                    )}

                    <h3 className="text-sm font-semibold text-gray-800 pr-16 pt-2 break-words">
                      {strataName.name}
                    </h3>

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ background: statusBg, color: statusColor }}
                      >
                        {cardStatus}
                      </span>
                      <span className="px-2 py-1 border rounded text-xs font-bold text-black" style={{ background: "#dfff80" }}>
                        {cardPct}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center" style={{ borderRadius: "8px", border: "1px solid #9b8d8d" }}>
                    <button
                      type="button"
                      onClick={() => handleCardClick(strataName)}
                      className="
                        w-full py-2 text-sm font-semibold rounded
                        border border-blue-600
                        text-blue-600
                        bg-transparent
                        transition-all duration-300 ease-in-out
                        hover:bg-blue-600
                        hover:text-white
                        hover:shadow-md
                      "
                      style={{ margin: "6px" }}
                    >
                      View Exams
                    </button>
                  </div>
                </div>
              );
            })}

          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      <hr className="my-4 mt-24 h-px border-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent" />

      {isMissingParentStrataIdentifier && (
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
            This SubCategories view Requires a Valid Parent Reference
            Kindly Navigate Using a Valid Strata Source or Return To The Parent Strata Overview To Select A SubCategory Strata To Explore.
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
                  hover:bg-[var(--text-color)]
                  hover:text-[var(--content-bg)]
                "
          >
            ← Return To Parent Strata
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* Dynamic Vista Quote */}
      <div className="w-full flex justify-center items-center pt-24">
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

      <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
