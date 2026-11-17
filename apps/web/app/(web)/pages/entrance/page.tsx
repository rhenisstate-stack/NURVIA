
"use client";

import Link from "next/link";
import {
    ClipboardList,
    Stethoscope,
    HeartPulse,
    GraduationCap,
    Award,
    BookOpen,
    Syringe,
    School,
    ArrowRight,
    Layers,
    LucideIcon,
} from "lucide-react";

import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";

// ─────────────────────────────────────────────────────────────────────────────
// Segment presentation
// ─────────────────────────────────────────────────────────────────────────────

interface SegmentPresentation {
    icon: LucideIcon;
    accent: string;
    ring: string;
}

const SEGMENT_PRESENTATION: Record<string, SegmentPresentation> = {
    ATI_TEAS: {
        icon: ClipboardList,
        accent: "from-indigo-500 to-indigo-700",
        ring: "hover:ring-indigo-400",
    },
    HESI_A2: {
        icon: Stethoscope,
        accent: "from-sky-500 to-sky-700",
        ring: "hover:ring-sky-400",
    },
    RN_NURSING: {
        icon: HeartPulse,
        accent: "from-rose-500 to-rose-700",
        ring: "hover:ring-rose-400",
    },
    LPN_NURSING: {
        icon: Syringe,
        accent: "from-emerald-500 to-emerald-700",
        ring: "hover:ring-emerald-400",
    },
    PRE_NURSING: {
        icon: School,
        accent: "from-amber-500 to-amber-700",
        ring: "hover:ring-amber-400",
    },
    CERTIFICATION: {
        icon: Award,
        accent: "from-purple-500 to-purple-700",
        ring: "hover:ring-purple-400",
    },
    GED: {
        icon: GraduationCap,
        accent: "from-teal-500 to-teal-700",
        ring: "hover:ring-teal-400",
    },
    CNA: {
        icon: BookOpen,
        accent: "from-orange-500 to-orange-700",
        ring: "hover:ring-orange-400",
    },
};

const DEFAULT_PRESENTATION: SegmentPresentation = {
    icon: Layers,
    accent: "from-slate-500 to-slate-700",
    ring: "hover:ring-slate-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard routing
// ─────────────────────────────────────────────────────────────────────────────

const SEGMENT_DASHBOARD_MAP: Record<string, string> = {
    ATI_TEAS: "ati-teas",
    HESI_A2: "hesi-a2",
    PRE_NURSING: "pre-nursing",
    RN_NURSING: "rn-nursing",
    LPN_NURSING: "lpn-nursing",
    NCLEX_RN: "nclex-rn",
    NCLEX_PN: "nclex-pn",
    CERTIFICATION: "certification",
};

const SEGMENT_ORDER = [
    "ATI_TEAS",
    "HESI_A2",
    "PRE_NURSING",
    "RN_NURSING",
    "LPN_NURSING",
    "GED",
    "CNA",
    "CERTIFICATION",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Entrance Page
// ─────────────────────────────────────────────────────────────────────────────

export default function EntrancePage() {
    const { programs, isLoading } = useRelativeStrataPrograms();

    const orderedPrograms = [...programs].sort((a, b) => {
        const aIndex = SEGMENT_ORDER.indexOf(
            (a.segment ?? "") as (typeof SEGMENT_ORDER)[number]
        );

        const bIndex = SEGMENT_ORDER.indexOf(
            (b.segment ?? "") as (typeof SEGMENT_ORDER)[number]
        );

        return (
            (aIndex === -1 ? SEGMENT_ORDER.length : aIndex) -
            (bIndex === -1 ? SEGMENT_ORDER.length : bIndex)
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-2 py-5 sm:px-6 sm:py-10 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* Page heading */}
                <div className="mb-5 text-center sm:mb-9">

                    <h1 className="text-xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl">
                        Where would you like to start?
                    </h1>

                    <p className="mx-auto mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-500 sm:mt-3 sm:text-sm">
                        Pick a track below to jump into practice exams, study
                        resources, and progress tracking built for that path.
                    </p>

                </div>

                {/* Loading */}
                {isLoading && (
                    <p className="py-8 text-center text-sm text-slate-400">
                        Loading Programs…
                    </p>
                )}

                {/* Empty state */}
                {!isLoading && orderedPrograms.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-400">
                        No Programs Found ⚓
                    </p>
                )}

                {/* Responsive cards */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">

                    {orderedPrograms.map((program) => {
                        const segment = program.segment ?? "";

                        const presentation =
                            SEGMENT_PRESENTATION[segment] ??
                            DEFAULT_PRESENTATION;

                        const Icon = presentation.icon;

                        const dashboardSlug = SEGMENT_DASHBOARD_MAP[segment];

                        if (!dashboardSlug) return null;

                        const accessHref = `/dashboards/${dashboardSlug}`;
                        const subscriptionsHref = `/pages/exams/${dashboardSlug}`;

                        return (
                            <div
                                key={program.guidId}
                                className={`
                                    group relative flex min-w-0 flex-col
                                    overflow-hidden rounded-xl border
                                    border-slate-200 bg-white
                                    p-2.5 shadow-sm ring-1 ring-transparent
                                    transition-all duration-300
                                    hover:-translate-y-1 hover:shadow-lg
                                    sm:rounded-2xl sm:p-5 sm:ring-2
                                    lg:p-6
                                    ${presentation.ring}
                                `}
                            >

                                {/* Featured badge */}
                                {program.isFeatured && (
                                    <div className="
                                        absolute right-1.5 top-1.5 z-10
                                        rounded-full bg-amber-400
                                        px-1.5 py-0.5
                                        text-[7px] font-extrabold
                                        uppercase tracking-wide text-amber-950
                                        shadow-sm
                                        sm:right-3 sm:top-3
                                        sm:px-2.5 sm:py-1 sm:text-[10px]
                                    ">
                                        ⭐ Featured
                                    </div>
                                )}

                                {/* Card content */}
                                <div className="min-w-0">

                                    {/* Icon and title */}
                                    <div className="
                                        mb-2 flex min-w-0 items-center gap-2
                                        pr-0
                                        sm:mb-3 sm:gap-3
                                    ">

                                        <div
                                            className={`
                                                flex h-8 w-8 shrink-0
                                                items-center justify-center
                                                rounded-lg bg-gradient-to-br
                                                ${presentation.accent}
                                                text-white shadow-sm
                                                transition-transform duration-300
                                                group-hover:scale-105
                                                sm:h-11 sm:w-11 sm:rounded-xl
                                            `}
                                        >
                                            <Icon
                                                size={17}
                                                className="sm:hidden"
                                            />

                                            <Icon
                                                size={23}
                                                className="hidden sm:block"
                                            />
                                        </div>

                                        <h2 className="
                                            min-w-0 break-words
                                            text-[11px] font-extrabold
                                            leading-tight text-slate-900
                                            sm:text-base
                                            lg:text-lg
                                        ">
                                            {program.name}
                                        </h2>

                                    </div>

                                    {/* Description */}
                                    {program.description && (
                                        <p className="
                                            line-clamp-2
                                            text-[9px] leading-snug
                                            text-slate-500
                                            sm:line-clamp-3
                                            sm:text-xs sm:leading-relaxed
                                        ">
                                            {program.description}
                                        </p>
                                    )}

                                    {/* Metadata */}
                                    <div className="
                                        mt-2 flex flex-wrap items-center
                                        gap-1
                                        sm:mt-3 sm:gap-1.5
                                    ">

                                        {typeof program.coursesCount === "number" && (
                                            <span className="
                                                rounded-full bg-slate-100
                                                px-1.5 py-0.5
                                                text-[8px] font-semibold
                                                text-slate-600
                                                sm:px-2.5 sm:py-1 sm:text-[10px]
                                            ">
                                                {program.coursesCount} Course
                                                {program.coursesCount !== 1 ? "s" : ""}
                                            </span>
                                        )}

                                        {program.level && (
                                            <span className="
                                                max-w-full truncate
                                                rounded-full bg-slate-100
                                                px-1.5 py-0.5
                                                text-[8px] font-semibold
                                                text-slate-600
                                                sm:px-2.5 sm:py-1 sm:text-[10px]
                                            ">
                                                {program.level}
                                            </span>
                                        )}

                                        {program.difficulty && (
                                            <span className="
                                                max-w-full truncate
                                                rounded-full bg-slate-100
                                                px-1.5 py-0.5
                                                text-[8px] font-semibold
                                                text-slate-600
                                                sm:px-2.5 sm:py-1 sm:text-[10px]
                                            ">
                                                {program.difficulty}
                                            </span>
                                        )}

                                    </div>

                                </div>

                                {/* Action buttons */}
                                <div className="
                                    mt-2 grid grid-cols-1 gap-1
                                    sm:mt-5 sm:grid-cols-2 sm:gap-2
                                ">

                                    <Link
                                        href={subscriptionsHref}
                                        className="
                                            flex min-h-7 items-center
                                            justify-center rounded-md
                                            border border-slate-300
                                            bg-green-100 px-1.5 py-1
                                            text-center text-[9px]
                                            font-bold leading-tight
                                            text-slate-700
                                            transition-colors
                                            hover:bg-yellow-300
                                            sm:min-h-9 sm:rounded-lg
                                            sm:px-2 sm:text-xs
                                        "
                                    >
                                        View Plans
                                    </Link>

                                    <Link
                                        href={accessHref}
                                        className={`
                                            flex min-h-7 items-center
                                            justify-center gap-1 rounded-md
                                            bg-gradient-to-br
                                            ${presentation.accent}
                                            px-1.5 py-1 text-center
                                            text-[9px] font-bold
                                            leading-tight text-white
                                            shadow-sm transition-opacity
                                            hover:opacity-90
                                            sm:min-h-9 sm:rounded-lg
                                            sm:px-2 sm:text-xs
                                        `}
                                    >
                                        <span>Start Practice</span>

                                        <ArrowRight
                                            size={11}
                                            className="
                                                hidden sm:block shrink-0
                                                transition-transform
                                                group-hover:translate-x-1
                                            "
                                        />
                                    </Link>

                                </div>

                                {/* Decorative hover glow */}
                                <div
                                    className={`
                                        pointer-events-none absolute
                                        -right-10 -top-10 h-24 w-24
                                        rounded-full bg-gradient-to-br
                                        ${presentation.accent}
                                        opacity-0 blur-2xl
                                        transition-opacity duration-300
                                        group-hover:opacity-20
                                    `}
                                />

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ; Skewblanc - The Winds Chase Us ⚓
// ─────────────────────────────────────────────────────────────────────────────
