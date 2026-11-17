"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
// import { useRelativeStrataAssessments } from "@/lib/hooks/nexus/strata/assessment/assessments/relative/useRelativeStrataAssessments";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { useDistinctStrataCourses } from "@/lib/hooks/nexus/strata/learning/courses/distinct/useDistinctStrataCourses";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { APP_TITLE } from "@/lib/config/config";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { useRelativeStrataAssessmentResults } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import {
  useDiscreteDominionSubscriptionPackages,
  DiscreteSubscriptionPackage,
  UserSubscriptionPackage,
} from "@/lib/hooks/nexus/subscription/packages/dicreate/useDiscreteDominionSubscriptionPackages";
import {
  Sun,
  Sunset,
  Moon,
  PlayCircle,
  GraduationCap,
  // ClipboardList,
  CreditCard,
  LogIn,
  UserPlus,
  ArrowRight,
  Clock,
  // BookOpen,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  AlertCircle,
  // ListChecks,
  TrendingUp,
  TrendingDown,
  Sparkles,
  // ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import ImpelModal from "@/app/(web)/auth/modals/Impel";
import LoginModal from "@/app/(web)/auth/modals/Login";
import RegisterModal from "@/app/(web)/auth/modals/Register";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const TARGET_NAME = "Rn Nursing";
const TARGET_PANEL = "rn-nursing";
const TARGET_SEGMENT = "RN_NURSING";
const REPORTS_ROUTE = `/dashboards/${TARGET_PANEL}/vista/assessment/exams/reports/relative`;
const PROGRESS_ROUTE = `/dashboards/${TARGET_PANEL}/vista/assessment/exams/progress/absolute`;

// const SEGMENT_DASHBOARD_MAP: Record<string, string> = {
//   ATI_TEAS: 'ati-teas',
//   HESI_A2: 'hesi-a2',
//   PRE_NURSING: 'pre-nursing',
//   RN_NURSING: 'rn-nursing',
//   LPN_NURSING: 'lpn-nursing',
//   NCLEX_RN: 'nclex-rn',
//   NCLEX_PN: 'nclex-pn',
//   CERTIFICATION: 'certification',
// };

const funcTruncateHelper = (text: string | undefined, max = 60) => {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

const getFlagUrl = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return "";
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
};

const formatShortDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Renders a single program's courses as flat row items (no wrapper div),
// so multiple of these can sit inside the same ScrollStrip flex row.
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function ProgramCoursesRow({
  parentIdentifier,
  dashboardSlug,
}: {
  parentIdentifier: string;
  dashboardSlug: string;
}) {
  const { filteredCourses } = useDistinctStrataCourses({
    parentIdentifier,
    page: 1,
    perPage: 50,
    sortColumn: null,
    sortDirection: "asc",
  });

  // Order ascending (1 first). Non-numeric or missing order goes last,
  // ties fall back to the name so the list is always stable.
  const sortedCourses = useMemo(() => {
    const orderOf = (value: unknown) => {
      const n = parseInt(String(value ?? "").trim(), 10);
      return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
    };

    return [...(filteredCourses ?? [])].sort(
      (a, b) =>
        orderOf(a.order) - orderOf(b.order) ||
        (a.name ?? "").localeCompare(b.name ?? "", undefined, { numeric: true, sensitivity: "base" })
    );
  }, [filteredCourses]);

  return (
    <>
      {sortedCourses.map((course) => {
        const courseIdentifier = course.guidId ?? course.id;

        return (
          <Link
            key={courseIdentifier}
            href={`/dashboards/${dashboardSlug}/vista/learning/subjects/distinct/overview?identifier=${courseIdentifier}`}
            className="group shrink-0 snap-start w-full md:w-52 overflow-hidden rounded-xl border border-[var(--text-color)]/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-3 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-400/60 hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-[0_8px_25px_-8px_rgba(34,211,238,0.6)]"
          >
            <h3 className="font-bold text-md text-[var(--text-color)] truncate group-hover:text-cyan-400">
              {course.name}
            </h3>

            <p className="text-[8px] opacity-60 mt-0.5 text-[var(--text-color)] line-clamp-2 leading-relaxed">
              {funcTruncateHelper(course.description, 60)}
            </p>

            <div className="flex items-center justify-between my-3">
              <span className="text-[9px] uppercase font-bold opacity-50 tracking-wide text-[var(--text-color)]">
                {course.subjectsCount ?? 0} Subjects
              </span>
            </div>

            <span className="flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[var(--text-color)]/10 border border-[var(--text-color)]/20 text-[10px] font-bold uppercase text-[var(--text-color)] opacity-70 group-hover:opacity-100 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 transition-all">
              Continue Studying
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        );
      })}
    </>
  );
}

function RnNursingCourseScroller({
  programs,
  dashboardSlug,
}: {
  programs: { guidId: string }[];
  dashboardSlug: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frame: number;

    const tick = () => {
      if (!pausedRef.current) {
        if (window.innerWidth >= 768) {
          el.scrollLeft += 0.5;
          if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const move = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;

    if (window.innerWidth < 768) return;
    el.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  return (
    <div onMouseEnter={() => (pausedRef.current = true)} onMouseLeave={() => (pausedRef.current = false)}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <GraduationCap className="w-4 h-4 text-[var(--text-color)] opacity-70 shrink-0" />
          <h2 className="text-base md:text-lg font-bold text-[var(--text-color)] truncate">
            Your {TARGET_NAME} Courses
          </h2>
        </div>

        <div className="flex gap-1.5 shrink-0">
          <button type="button" onClick={() => move(-1)} aria-label="Previous courses" className="w-8 h-8 flex items-center justify-center text-black rounded-lg border border-blue-200 bg-green-100 hover:bg-yellow-500 hover:text-black transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => move(1)} aria-label="Next courses" className="w-8 h-8 flex items-center justify-center text-black rounded-lg border border-blue-200 bg-green-100 hover:bg-yellow-500 hover:text-black transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col md:flex-row gap-3 p-2 md:p-3 md:overflow-y-hidden md:overflow-x-auto md:snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {programs.map((program) => (
          <ProgramCoursesRow key={`a-${program.guidId}`} parentIdentifier={program.guidId} dashboardSlug={dashboardSlug} />
        ))}

      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Overall GPA — circular donut gauge, hover shows attempts / exams covered
// ───────────────────────────────────────────────────────────────────────────
function CircularGauge({
  score,
  attempts,
  examsCovered,
  subjectsCovered,
  subjectBreakdown,
  progressHref,
}: {
  score: number;
  attempts: number;
  examsCovered: number;
  subjectsCovered: number;
  subjectBreakdown: { name: string; score: number; attempts: number }[];
  progressHref: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const size = 96;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const [isHovered, setIsHovered] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const openPanel = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const panelWidth = 288;
    let left = rect.left + rect.width / 2 - panelWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));

    setPanelPos({ top: rect.bottom + 10, left });
    setIsHovered(true);
  };

  const closePanel = () => setIsHovered(false);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        ref={triggerRef}
        className="relative"
        onMouseEnter={openPanel}
        onMouseLeave={closePanel}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-yellow-50"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#circularGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="circularGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#babbff" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-black text-green-100">{clamped}%</span>
          <span className="text-[8px] font-semibold uppercase text-white">GPA</span>
        </div>
      </div>

      <Link
        href={progressHref}
        className="text-[10px] font-semibold opacity-70 hover:opacity-100 flex items-center gap-1 text-[var(--text-color)] transition-opacity"
      >
        View My Progress <ArrowRight className="w-2.5 h-2.5" />
      </Link>

      {isHovered && panelPos && typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseEnter={openPanel}
            onMouseLeave={closePanel}
            style={{ top: panelPos.top, left: panelPos.left, width: 288 }}
            className="fixed z-[100] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-800 to-yellow-800 text-center text-white">
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">Aggregate : Grade Point Average [ GPA ]</p>
              <p className="text-2xl font-black">{clamped}%</p>
            </div>

            <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-slate-100">
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-slate-800">{attempts}</span>
                <span className="text-[9px] font-semibold uppercase opacity-60 text-slate-500 text-center">Attempts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-slate-800">{examsCovered}</span>
                <span className="text-[9px] font-semibold uppercase opacity-60 text-slate-500 text-center">Exams</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-slate-800">{subjectsCovered}</span>
                <span className="text-[9px] font-semibold uppercase opacity-60 text-slate-500 text-center">Subjects</span>
              </div>
            </div>

            {subjectBreakdown.length > 0 && (
              <div className="px-4 py-3 max-h-56 overflow-y-auto space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                  By Subject
                </p>
                {subjectBreakdown.map((s) => (
                  <div key={s.name} className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-700 truncate">{s.name}</span>
                      <span className="text-[11px] font-black text-slate-800 shrink-0">{s.score}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
                        style={{ width: `${Math.max(0, Math.min(100, s.score))}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400">{s.attempts} attempt{s.attempts === 1 ? "" : "s"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────
// My Subscription — active-subscription banner for the current user
// ─────────────────────────────────────────────────────────────────────────
function MySubscriptionBanner({
  pkg,
  sub,
  activeCount,
}: {
  pkg: DiscreteSubscriptionPackage;
  sub: UserSubscriptionPackage;
  activeCount: number;
}) {
  const isActive = sub.subscriptionStatus === "Active";
  const isPaid = sub.subscriptionHasPaid === "Yes";
  const isFullyVerified = isActive && isPaid;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500 bg-gradient-to-br from-emerald-700 via-black to-teal-700 backdrop-blur-md px-4 py-3 shadow-[0_0_24px_-6px_rgba(16,185,129,0.5)]">
      {/* subtle glow ring */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-emerald-300/30" />

      <div className="flex items-center gap-3">
        {/* Big trust tick */}
        <div className="relative shrink-0">
          <div
            className={`flex items-center justify-center w-22 h-22 rounded-full ring-2 ${isActive ? "bg-green-800 ring-red-300" : "ring-blue-100"
              }`}
          >
            <div
              className={`flex items-center justify-center w-20 h-20 rounded-full shadow-lg ${isActive
                ? "bg-gradient-to-br from-emerald-400 via-indigo-400 to-cyan-500"
                : "bg-gradient-to-br from-yellow-500 via-blue-500 to-red-600"
                }`}
            >
              {isActive ? (
                <CheckCircle2 className="w-18 h-18 text-white" strokeWidth={1.5} />
              ) : (
                <XCircle className="w-18 h-18 text-red-500" strokeWidth={1.5} />
              )}
            </div>
          </div>

          {isFullyVerified && (
            <span className="absolute -top-1 -right-1 flex h- w-3.5">
              {/* Soft pulsing glow */}
              <span
                className="
                  absolute inset-0 rounded-full
                  bg-emerald-400
                  animate-ping
                "
              />

              {/* Pulsing verification dot */}
              <span
                className="
                  relative inline-flex h-3.5 w-3.5 rounded-full
                  ring-2 ring-white
                  bg-black
                  shadow-[0_0_8px_rgba(52,211,153,0.8)]
                  animate-pulse
                  transition-colors
                "
              />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm md:text-base font-normal text-white leading-tight">
            You&apos;ve Got{" "}
            <span className="font-black">{activeCount}</span>{" "}
            Active Subscription{activeCount === 1 ? "" : "s"} ✔️
          </p>

          <p className="text-[11px] md:text-xs font-semibold text-emerald-200 truncate text-center">
            {pkg.name}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-400 text-yellow-950" : "bg-red-500 text-black"
                }`}
            >
              {isActive ? (
                <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={3} />
              ) : (
                <XCircle className="w-2.5 h-2.5" strokeWidth={3} />
              )}
              Validation : {sub.subscriptionStatus ?? "—"}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isPaid ? "bg-emerald-400 text-blue-950" : "bg-red-500 text-black"
                }`}
            >
              {isPaid ? (
                <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={3} />
              ) : (
                <XCircle className="w-2.5 h-2.5" strokeWidth={3} />
              )}
              Paid : {sub.subscriptionHasPaid ?? "—"}
            </span>
          </div>

          <p className="text-[10px] md:text-[11px] text-white/80 mt-1.5">
            Full Access From <strong className="text-white">{formatShortDate(sub.validFrom)}</strong> to {" "}
            <strong className="text-white">{formatShortDate(sub.validUntil)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main Component
export default function AtiTeasHomePage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { toggle: toggleLeftSidebar } = useLeftSidebar();

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Current user (same hook the navbar dropdown uses)
  const { user, loading: isUserLoading } = useCurrentSystemUser();
  const firstName = user?.userName?.trim()?.split(" ")[0] || "";

  const [authModalStep, setAuthModalStep] = useState<"closed" | "impel" | "login" | "register">("closed");
  const [loginPrefill, setLoginPrefill] = useState<{ email: string; message: string } | undefined>(undefined);

  // ─────────────────────────────────────────────────────────────────────────
  // Country flag — derived from browser locale, shown as a light trust cue
  const [countryCode, setCountryCode] = useState<string>("");

  useEffect(() => {
    const browserLocale = navigator.language || "en-US";
    const code = browserLocale.split("-")[1]?.toUpperCase();
    if (code) setCountryCode(code);
  }, []);

  const countryFlagUrl = useMemo(() => getFlagUrl(countryCode), [countryCode]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Greeting based on time of day
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { greeting } = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return { greeting: "Good morning", GreetingIcon: Sun };
    if (hour < 18) return { greeting: "Good afternoon", GreetingIcon: Sunset };
    return { greeting: "Good evening", GreetingIcon: Moon };
  }, [now]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Active / in-progress exam
  // ⚠️ ASSUMPTION: parentIdentifier="" fetches across all parents for this panel;
  // confirm your backend NominalFetch treats an empty identifier as "no parent filter".
  const { filteredExams: allExams } = useNominalStrataExams({
    parentIdentifier: "",
    page: 1,
    perPage: 50,
  });

  const activeExamMatch = useMemo(() => {
    for (const exam of allExams) {
      const action = exam.examActions?.find((a) => a.status === "InProgress");
      if (action) return { exam, action };
    }
    return null;
  }, [allExams]);

  const activeExam = activeExamMatch?.exam ?? null;

  // Reports & Progress — any exam with an in-progress or pending action
  // ⚠️ Confirm these status strings match your backend's actual enum values.
  const pendingOrIncompleteExams = useMemo(() => {
    const items: { exam: (typeof allExams)[number]; status: string }[] = [];
    for (const exam of allExams) {
      const action = exam.examActions?.find(
        (a) => a.status === "InProgress" || a.status === "Pending" || a.status === "NotStarted"
      );
      if (action?.status) items.push({ exam, status: action.status });
    }
    return items;
  }, [allExams]);

  const { filteredExamResults: allResults } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const totalExamsDone = useMemo(() => {
    const ids = new Set(
      allResults.map((r) => r.examGuidId ?? r.assessmentGuidId).filter(Boolean)
    );
    return ids.size;
  }, [allResults]);

  const totalSubjectsDone = useMemo(() => {
    const ids = new Set(allResults.map((r) => r.subjectGuidId).filter(Boolean));
    return ids.size;
  }, [allResults]);

  const overallAverageScore = useMemo(() => {
    if (allResults.length === 0) return 0;
    return Math.round(
      allResults.reduce((sum, r) => sum + (r.percentageScore ?? 0), 0) / allResults.length
    );
  }, [allResults]);

  const { programs } = useRelativeStrataPrograms();

  const currentPrograms = programs.filter((p) => p.segment === TARGET_SEGMENT);
  // const otherPrograms = programs.filter((p) => p.segment !== TARGET_SEGMENT);

  // ───────────────────────────────────────────────────────────────────────
  // My active subscription — backend already scopes filteredSubscriptionPackages
  // to the resolved current user, so no user-matching needed here. We only
  // validate that the package's terminalClusterGuidId points at an RN_NURSING
  // program (currentPrograms, defined below via TARGET_SEGMENT).
  const { filteredSubscriptionPackages: mySubscriptionPackages } = useDiscreteDominionSubscriptionPackages({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const rnNursingProgramGuidIds = useMemo(
    () => new Set(currentPrograms.map((p) => p.guidId)),
    [currentPrograms]
  );

  const myActiveSubscription = useMemo(() => {
    type MatchedSub = { pkg: DiscreteSubscriptionPackage; sub: UserSubscriptionPackage };
    const mine: MatchedSub[] = [];

    type PackageWithCluster = DiscreteSubscriptionPackage & {
      terminalClusterTableName?: string;
      terminalClusterGuidId?: string;
    };

    mySubscriptionPackages.forEach((pkg) => {
      const pkgWithCluster = pkg as PackageWithCluster;
      const isRnNursing =
        pkgWithCluster.terminalClusterTableName === "strata_programs" &&
        !!pkgWithCluster.terminalClusterGuidId &&
        rnNursingProgramGuidIds.has(pkgWithCluster.terminalClusterGuidId);

      if (!isRnNursing) return;

      pkg.userSubscriptions?.forEach((sub) => {
        mine.push({ pkg, sub });
      });
    });

    if (mine.length === 0) return null;

    const activeOnes = mine.filter((m) => m.sub.subscriptionStatus === "Active");
    const activeCount = activeOnes.length;

    const best =
      activeOnes[0] ??
      mine.sort((a, b) => {
        const aDate = a.sub.createdAt ? new Date(a.sub.createdAt).getTime() : 0;
        const bDate = b.sub.createdAt ? new Date(b.sub.createdAt).getTime() : 0;
        return bDate - aDate;
      })[0];

    return { pkg: best.pkg, sub: best.sub, activeCount };
  }, [mySubscriptionPackages, rnNursingProgramGuidIds]);

  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    allResults.forEach((r) => {
      if (!r.subjectGuidId || !r.subjectName) return;
      const entry = map.get(r.subjectGuidId) ?? { name: r.subjectName, total: 0, count: 0 };
      entry.total += r.percentageScore ?? 0;
      entry.count += 1;
      map.set(r.subjectGuidId, entry);
    });
    return Array.from(map.values())
      .map((e) => ({ name: e.name, score: Math.round(e.total / e.count), attempts: e.count }))
      .sort((a, b) => b.score - a.score);
  }, [allResults]);

  // ⚠️ ASSUMPTION: results may carry a completedAt/attemptedAt/createdAt date.
  // If none is present, falls back to a non-comparative consistency nudge.
  const performanceInsight = useMemo(() => {
    if (allResults.length === 0) return null;

    type ResultWithDates = (typeof allResults)[number] & {
      completedAt?: string | null;
      attemptedAt?: string | null;
      createdAt?: string | null;
    };

    const getResultDate = (r: (typeof allResults)[number]) => {
      const result = r as ResultWithDates;
      return result.completedAt ?? result.attemptedAt ?? result.createdAt ?? null;
    };

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthResults: typeof allResults = [];
    const lastMonthResults: typeof allResults = [];
    let hasDates = false;

    allResults.forEach((r) => {
      const raw = getResultDate(r);
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      hasDates = true;
      if (d >= startOfThisMonth) thisMonthResults.push(r);
      else if (d >= startOfLastMonth && d < startOfThisMonth) lastMonthResults.push(r);
    });

    const avg = (arr: typeof allResults) =>
      arr.length === 0 ? null : arr.reduce((s, r) => s + (r.percentageScore ?? 0), 0) / arr.length;

    const weakestSubject = subjectBreakdown.length > 0
      ? subjectBreakdown[subjectBreakdown.length - 1]
      : null;

    if (hasDates) {
      const thisAvg = avg(thisMonthResults);
      const lastAvg = avg(lastMonthResults);

      if (thisAvg != null && lastAvg != null) {
        const delta = Math.round(thisAvg - lastAvg);

        if (delta > 0) {
          return {
            trend: "up" as const,
            headline: "Your performance is improving",
            detail: `You are ${delta}% above last month.${weakestSubject ? ` Keep building consistency in ${weakestSubject.name}.` : ""}`,
          };
        }
        if (delta < 0) {
          return {
            trend: "down" as const,
            headline: "Your performance dipped a bit",
            detail: `You are ${Math.abs(delta)}% below last month.${weakestSubject ? ` Focus a little more on ${weakestSubject.name}.` : ""}`,
          };
        }
        return {
          trend: "steady" as const,
          headline: "You're holding steady",
          detail: weakestSubject
            ? `Keep building consistency in ${weakestSubject.name}.`
            : "Keep up the practice to push your average higher.",
        };
      }
    }

    return {
      trend: "steady" as const,
      headline: "Keep the streak going",
      detail: weakestSubject
        ? `Keep building consistency in ${weakestSubject.name}.`
        : "Take a few more exams to unlock personalized insights.",
    };
  }, [allResults, subjectBreakdown]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Assessments ({TARGET_NAME} specific)
  // const { filteredAssessments, isLoading: isAssessmentsLoading } = useRelativeStrataAssessments();

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Random Quote
  const randomQuote = useMemo(() => {
    return VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];
  }, []);

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
      <div className="p-3 md:p-4 space-y-5 w-full max-w-[100rem] mx-auto">

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Hero / Greeting — compact */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--text-color)] bg-gradient-to-br from-[#112b51] via-[#164c78] to-blue-500 backdrop-blur-xl px-5 py-4 md:px-7 md:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1">
            <div className="flex items-center gap-3 min-w-0">

              <CircularGauge
                score={overallAverageScore}
                attempts={allResults.length}
                examsCovered={totalExamsDone}
                subjectsCovered={totalSubjectsDone}
                subjectBreakdown={subjectBreakdown}
                progressHref={PROGRESS_ROUTE}
              />

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">

                  {/* Left: Greeting */}
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold text-white truncate">
                      {greeting}
                      {!isUserLoading && firstName ? `, ${firstName}` : ""} !
                    </h1>
                  </div>

                  {/* Right: Time + Flag */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm md:text-lg font-semibold text-white">
                      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>

                    {countryFlagUrl && (
                      <Image
                        src={countryFlagUrl}
                        alt={countryCode}
                        title="Your region"
                        width={28}
                        height={20}
                        unoptimized
                        className="w-6 h-4 md:w-7 md:h-5 rounded-sm shadow-sm object-cover shrink-0"
                      />
                    )}
                  </div>

                </div>

                <p className="text-xs md:text-sm opacity-70 text-white truncate">
                  {APP_TITLE} {TARGET_NAME} Dashboard — let&apos;s Keep the Momentum Going. ⚓
                </p>

                {performanceInsight ? (
                  <div
                    className={`hidden md:flex mt-2 max-w-xl items-start gap-2 rounded-lg border px-3 py-1.5 text-[11px] md:text-xs ${performanceInsight.trend === "up"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                      : performanceInsight.trend === "down"
                        ? "border-amber-200 bg-amber-500 text-amber-600"
                        : "border-white  bg-white text-white "
                      }`}
                  >
                    {performanceInsight.trend === "up" && <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                    {performanceInsight.trend === "down" && <TrendingDown className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                    {performanceInsight.trend === "steady" && <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                    <p>
                      <span className="font-semibold">{performanceInsight.headline}</span>{" "}
                      <span className="opacity-80">{performanceInsight.detail}</span>
                    </p>
                  </div>
                ) : (
                  <div className="hidden md:flex mt-2 max-w-xl items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-300 px-3 py-1.5 text-[11px] md:text-xs text-black">
                    <span>No exams taken yet — take a free test to see where you stand!</span>
                    <Link href={`/pages/exams/${TARGET_PANEL}`} className="font-semibold underline shrink-0">
                      Take a Free Test
                    </Link>
                  </div>
                )}

                <div className="hidden md:block mt-2 max-w-xl rounded-lg border border-[var(--text-color)] bg-blue-100 px-3 py-1.5 text-[11px] md:text-xs text-black">
                  <span className="font-semibold">{randomQuote.quoteTitle}</span>{" "}
                  <span className="opacity-70">— {randomQuote.quoteDescription}</span>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">

                {/* Active Subscription - below buttons */}
                {myActiveSubscription ? (
                  <MySubscriptionBanner
                    pkg={myActiveSubscription.pkg}
                    sub={myActiveSubscription.sub}
                    activeCount={myActiveSubscription.activeCount}
                  />
                ) : (
                  <Link
                    href={`/dashboards/${TARGET_PANEL}/vista/subscriptions/items`}
                    className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-gradient-to-r from-amber-800 via-orange-800 to-yellow-800 text-white shadow-lg  hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <CreditCard className="w-4 h-4" />
                    No Active Plan
                    <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                )}

                {/* Get Started: phone only, toggles the left sidebar */}
                <button
                  type="button"
                  onClick={toggleLeftSidebar}
                  className="group relative md:hidden w-full overflow-hidden inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-700 via-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all duration-300 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                >
                  {/* Shiny sweep */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />

                  {/* Soft glow */}
                  <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />

                  <span className="relative">Get Started</span>
                  <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                {/* Buttons: hidden on phones */}
                <div className="hidden md:flex flex-wrap items-center gap-3">
                  <Link
                    href={`/dashboards/${TARGET_PANEL}/vista/subscriptions/items`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-green-100 font-semibold text-xs md:text-sm bg-gradient-to-r from-indigo-700 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <CreditCard className="w-4 h-4" />
                    View Subscription Packages
                  </Link>

                  <Link
                    href={`/dashboards/${TARGET_PANEL}/vista/subscriptions/packages`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm border border-indigo-200 bg-indigo-200 text-[var(--text-color)] backdrop-blur-sm hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <BookMarked className="w-4 h-4" />
                    My Subscriptions
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Continue Exam — only shows if an exam is currently in progress */}
        {activeExam && (
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-xl px-5 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 shrink-0">
                  <PlayCircle className="w-5 h-5 text-emerald-500" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                    Exam In Progress
                  </p>
                  <h3 className="text-sm font-bold text-[var(--text-color)] truncate">
                    {activeExam.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] opacity-70 text-[var(--text-color)]">
                    <Clock className="w-3 h-3" />
                    {activeExamMatch?.action.residualDuration != null
                      ? `${Math.round(activeExamMatch.action.residualDuration)} min remaining`
                      : "In progress"}
                  </div>
                </div>
              </div>

              <Link
                href={`/web/${TARGET_PANEL}/vista/exam/generic?mode=Exam&identifier=${activeExam.guidId ?? activeExam.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-xs md:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform duration-200 shrink-0"
              >
                Continue Exam
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Quick Auth Actions — hidden once logged in */}
        {!isUserLoading && !user && (
          <div className="hidden sm:grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAuthModalStep("login")}
              className="group relative overflow-hidden rounded-xl border border-[var(--text-color)]/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 px-4 py-3 flex items-center justify-between hover:border-[var(--text-color)]/50 transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-md text-[var(--text-color)]">Log In Now</p>
                  <p className="text-[10px] opacity-60 text-[var(--text-color)]">You have an Account ! Access your account ?</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-[var(--text-color)]" />
            </button>

            <button
              type="button"
              onClick={() => setAuthModalStep("register")}
              className="group relative overflow-hidden rounded-xl border border-[var(--text-color)]/20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 px-4 py-3 flex items-center justify-between hover:border-[var(--text-color)]/50 transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <p className="font-bold text-md text-[var(--text-color)]">Register Now</p>
                  <p className="text-[10px] opacity-60 text-[var(--text-color)]">Do not have an Account ! Create a new account ?</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-[var(--text-color)]" />
            </button>
          </div>
        )}

        {/* Your RN Nursing Courses */}
        {currentPrograms.length > 0 && (
          <RnNursingCourseScroller
            programs={currentPrograms}
            dashboardSlug={TARGET_PANEL}
          />
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Reports & Progress / Programs / Performance Index — 3 equal-size cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-3 items-stretch">

          {/* Reports & Progress */}
          <div className="h-full flex flex-col rounded-2xl border border-[var(--text-color)] bg-[var(--content-bg)] p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--text-color)] opacity-70" />
                <h2 className="text-sm md:text-base font-bold text-[var(--text-color)]">
                  Reports &amp; Progress
                </h2>
              </div>
              <Link
                href={REPORTS_ROUTE}
                className="text-md font-semibold opacity-60 hover:opacity-100 flex items-center gap-1 text-[var(--text-color)] transition-opacity shrink-0"
              >
                View All Reports <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--text-color)]/10 py-3">
                <span className="text-lg font-black text-[var(--text-color)]">{totalExamsDone}</span>
                <span className="text-[9px] font-semibold uppercase opacity-60 text-[var(--text-color)] text-center">Exams Done</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--text-color)]/10 py-3">
                <span className="text-lg font-black text-[var(--text-color)]">{totalSubjectsDone}</span>
                <span className="text-[9px] font-semibold uppercase opacity-60 text-[var(--text-color)] text-center">Subjects Covered</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--text-color)]/10 py-3">
                <span className="text-lg font-black text-[var(--text-color)]">{pendingOrIncompleteExams.length}</span>
                <span className="text-[9px] font-semibold uppercase opacity-60 text-[var(--text-color)] text-center">Incomplete</span>
              </div>
            </div>

            {pendingOrIncompleteExams.length > 0 && (
              <div className="mt-3 space-y-2">
                {pendingOrIncompleteExams.slice(0, 3).map(({ exam, status }) => (
                  <Link
                    key={exam.guidId ?? exam.id}
                    href={`/web/${TARGET_PANEL}/vista/exam/generic?mode=Exam&identifier=${exam.guidId ?? exam.id}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[var(--text-color)]/10 hover:border-[var(--text-color)]/40 hover:bg-[var(--text-color)]/5 transition-all duration-200"
                  >
                    <span className="text-xs font-semibold text-[var(--text-color)] truncate">
                      {exam.title}
                    </span>
                    <span
                      className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${status === "InProgress"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-amber-500/20 text-amber-500"
                        }`}
                    >
                      {status === "InProgress" ? "In Progress" : "Pending"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Dynamic Vista Quote */}
        <div className="w-full flex justify-center items-center py-1">
          <div
            className="
              max-w-5xl w-full
              text-center
              px-5 py-3
              rounded-xl
              border
              backdrop-blur-xl
              bg-gradient-to-r
              from-purple-500/10
              via-pink-500/10
              to-cyan-500/10
              shadow-md
              transition-all duration-500
            "
          >
            <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs md:text-sm">
              <span className="font-bold tracking-wide text-[var(--text-color)]">
                {randomQuote.quoteTitle}
              </span>
              <span className="opacity-70 text-[var(--text-color)]">
                — {randomQuote.quoteDescription}
              </span>
            </div>
          </div>
        </div>

      </div>

      <ImpelModal
        isOpen={authModalStep === "impel"}
        onClose={() => setAuthModalStep("closed")}
        onChooseLogin={() => setAuthModalStep("login")}
        onChooseRegister={() => setAuthModalStep("register")}
      />

      <LoginModal
        isOpen={authModalStep === "login"}
        onClose={() => setAuthModalStep("closed")}
        onSwitchToRegister={() => setAuthModalStep("register")}
        initialEmail={loginPrefill?.email}
        initialMessage={loginPrefill?.message}
        redirectPath={`/dashboards/${TARGET_PANEL}`}
      />

      <RegisterModal
        isOpen={authModalStep === "register"}
        onClose={() => setAuthModalStep("closed")}
        onSwitchToLogin={(email, message) => {
          setLoginPrefill({ email, message });
          setAuthModalStep("login");
        }}
      />

    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────