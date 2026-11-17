"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronDown,
    ChevronRight,
    GraduationCap,
    BookOpen,
    FileText,
    Sparkles,
    Settings2,
    Loader2,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
import { useDistinctStrataCourses } from "@/lib/hooks/nexus/strata/learning/courses/distinct/useDistinctStrataCourses";
import { useDistinctStrataSubjects } from "@/lib/hooks/nexus/strata/learning/subjects/distinct/useDistinctStrataSubjects";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { strataService } from "@/lib/services/nexus/strata/strataService"; // ← adjust to your real path

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TARGET_NAME = "Ati Teas";
const TARGET_SEGMENT = "ATI_TEAS";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Raw = {
    guidId?: string | null;
    id?: number | string;
    name?: string;
    title?: string;
    order?: unknown;
    questionsCount?: number | null;
    subjectsCount?: number | null;
};

interface CourseNode { guid: string; name: string; order: number }
interface SubjectNode { guid: string; name: string; order: number }
interface ExamNode { guid: string; title: string; questions: number }

type Registry<T> = Record<string, T[]>;
type CheckState = "all" | "some" | "none";

interface Selection {
    courses: Set<string>;
    subjects: Set<string>;
    exams: Set<string>;
    exclSubjects: Set<string>; // unchecked while an ancestor is checked
    exclExams: Set<string>;
}

const emptySelection = (): Selection => ({
    courses: new Set(),
    subjects: new Set(),
    exams: new Set(),
    exclSubjects: new Set(),
    exclExams: new Set(),
});

const cloneSel = (s: Selection): Selection => ({
    courses: new Set(s.courses),
    subjects: new Set(s.subjects),
    exams: new Set(s.exams),
    exclSubjects: new Set(s.exclSubjects),
    exclExams: new Set(s.exclExams),
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const orderOf = (v: unknown) => {
    const n = parseInt(String(v ?? "").trim(), 10);
    return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
};

const byOrderThenName = <T extends { order: number; name: string }>(a: T, b: T) =>
    a.order - b.order || a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });

const toNum = (v: string): number | undefined => {
    const n = Number(v);
    return v.trim() !== "" && Number.isFinite(n) ? n : undefined;
};

const MINUTES_PER_QUESTION = 2;   // 30 questions -> 60 minutes
const MAX_AUTO_DURATION = 240;    // cap so 1805 questions doesn't give 3610 min

const seasonOf = (d: Date) => {
    const m = d.getMonth();
    return m <= 4 ? "Spring" : m <= 7 ? "Summer" : "Fall";
};

const EXAM_MODES = ["Practice", "Tutor", "Review", "Exam", "Test"] as const;
type ExamMode = (typeof EXAM_MODES)[number];
const TARGET_PANEL = "ati-teas";

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
    "ATI_TEAS", "HESI_A2", "PRE_NURSING", "RN_NURSING",
    "LPN_NURSING", "GED", "CNA", "CERTIFICATION",
];

// 12-char uppercase alphanumeric code
const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    return Array.from(arr, (n) => chars[n % chars.length]).join("");
};

// Inherited subject selection: its course (or itself) is checked and it isn't excluded
const subjInherited = (sel: Selection, c: string, s: string) =>
    (sel.courses.has(c) || sel.subjects.has(s)) && !sel.exclSubjects.has(s);

const examEffective = (sel: Selection, c: string, s: string, e: string) =>
    (subjInherited(sel, c, s) || sel.exams.has(e)) && !sel.exclExams.has(e);

function IndeterminateCheckbox({
    state,
    onChange,
    label,
}: {
    state: CheckState;
    onChange: (checked: boolean) => void;
    label: string;
}) {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = state === "some";
    }, [state]);

    return (
        <input
            ref={ref}
            type="checkbox"
            aria-label={label}
            checked={state === "all"}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 shrink-0 cursor-pointer accent-indigo-600"
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADLESS LOADERS — each one just runs a hook and reports into the registry
// ─────────────────────────────────────────────────────────────────────────────
function ProgramCoursesLoader({
    programGuid,
    onLoaded,
}: {
    programGuid: string;
    onLoaded: (key: string, list: CourseNode[]) => void;
}) {
    const { filteredCourses } = useDistinctStrataCourses({
        parentIdentifier: programGuid,
        page: 1,
        perPage: 50,
        sortColumn: null,
        sortDirection: "asc",
    });

    useEffect(() => {
        const list = ((filteredCourses ?? []) as unknown as Raw[])
            .map((c) => ({
                guid: String(c.guidId ?? c.id ?? ""),
                name: c.name ?? "Untitled Course",
                order: orderOf(c.order),
            }))
            .filter((c) => c.guid)
            .sort(byOrderThenName);
        onLoaded(programGuid, list);
    }, [filteredCourses, programGuid, onLoaded]);

    return null;
}

function CourseSubjectsLoader({
    courseGuid,
    onLoaded,
}: {
    courseGuid: string;
    onLoaded: (key: string, list: SubjectNode[]) => void;
}) {
    const { filteredSubjects } = useDistinctStrataSubjects({
        parentIdentifier: courseGuid,
        page: 1,
        perPage: 96,
        sortColumn: null,
        sortDirection: "asc",
    });

    useEffect(() => {
        const list = ((filteredSubjects ?? []) as unknown as Raw[])
            .map((s) => ({
                guid: String(s.guidId ?? s.id ?? ""),
                name: s.name ?? "Untitled Subject",
                order: orderOf(s.order),
            }))
            .filter((s) => s.guid)
            .sort(byOrderThenName);
        onLoaded(courseGuid, list);
    }, [filteredSubjects, courseGuid, onLoaded]);

    return null;
}

function SubjectExamsLoader({
    subjectGuid,
    onLoaded,
}: {
    subjectGuid: string;
    onLoaded: (key: string, list: ExamNode[]) => void;
}) {
    const { filteredExams } = useNominalStrataExams({
        parentIdentifier: subjectGuid,
        page: 1,
        perPage: 96,
        sortColumn: null,
        sortDirection: "asc",
        dynamicLearningStrataName: "subject",
    });

    useEffect(() => {
        const list = ((filteredExams ?? []) as unknown as Raw[])
            .map((e) => ({
                guid: String(e.guidId ?? e.id ?? ""),
                title: e.title ?? "Untitled Exam",
                questions: e.questionsCount ?? 0,
            }))
            .filter((e) => e.guid);
        onLoaded(subjectGuid, list);
    }, [filteredExams, subjectGuid, onLoaded]);

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateDiyExamPage() {
    const { user, loading: userLoading } = useCurrentSystemUser();
    const router = useRouter();
    const { programs } = useRelativeStrataPrograms();

    const currentPrograms = useMemo(() => {
        const rank = (seg?: string) => {
            const i = SEGMENT_ORDER.indexOf(seg ?? "");
            return i === -1 ? SEGMENT_ORDER.length : i;
        };
        return [...(programs ?? [])].sort((a, b) => rank(a.segment) - rank(b.segment));
    }, [programs]);

    // Program selection
    const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(new Set());

    const toggleProgram = (guid: string) =>
        setSelectedPrograms((prev) => {
            const next = new Set(prev);
            if (next.has(guid)) next.delete(guid);
            else next.add(guid);
            return next;
        });

    // Only one program available → pre-select it
    useEffect(() => {
        if (currentPrograms.length === 1) {
            setSelectedPrograms(new Set([currentPrograms[0].guidId]));
        }
    }, [currentPrograms]);

    const activePrograms = useMemo(
        () => currentPrograms.filter((p) => selectedPrograms.has(p.guidId)),
        [currentPrograms, selectedPrograms]
    );

    // Segment is taken from the selected program(s); mixed segments fall back to the first
    const activeSegment = activePrograms[0]?.segment ?? TARGET_SEGMENT;
    const activePanel = SEGMENT_DASHBOARD_MAP[activeSegment] ?? TARGET_PANEL;
    const activeName = activePrograms[0]?.name ?? TARGET_NAME;

    // Registries (filled by the headless loaders)
    const [coursesByProgram, setCoursesByProgram] = useState<Registry<CourseNode>>({});
    const [subjectsByCourse, setSubjectsByCourse] = useState<Registry<SubjectNode>>({});
    const [examsBySubject, setExamsBySubject] = useState<Registry<ExamNode>>({});

    // Stable reporters that skip no-op updates (prevents render loops)
    const makeReporter = <T,>(setter: React.Dispatch<React.SetStateAction<Registry<T>>>) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useCallback(
            (key: string, list: T[]) =>
                setter((prev) =>
                    JSON.stringify(prev[key]) === JSON.stringify(list) ? prev : { ...prev, [key]: list }
                ),
            [setter]
        );
    const reportCourses = makeReporter(setCoursesByProgram);
    const reportSubjects = makeReporter(setSubjectsByCourse);
    const reportExams = makeReporter(setExamsBySubject);

    const courses = useMemo(
        () => activePrograms.flatMap((p) => coursesByProgram[p.guidId] ?? []),
        [activePrograms, coursesByProgram]
    );

    // Selection + expansion
    const [sel, setSel] = useState<Selection>(emptySelection);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggleExpand = (key: string) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    // ── Check state derivation ────────────────────────────────────────────────
    const subjectState = useCallback(
        (c: string, s: string): CheckState => {
            const exams = examsBySubject[s];
            if (exams && exams.length > 0) {
                const n = exams.filter((e) => examEffective(sel, c, s, e.guid)).length;
                return n === 0 ? "none" : n === exams.length ? "all" : "some";
            }
            return subjInherited(sel, c, s) ? "all" : "none";
        },
        [examsBySubject, sel]
    );

    const courseState = useCallback(
        (c: string): CheckState => {
            const subs = subjectsByCourse[c];
            if (subs && subs.length > 0) {
                const states = subs.map((s) => subjectState(c, s.guid));
                if (states.every((x) => x === "all")) return "all";
                if (states.every((x) => x === "none")) return "none";
                return "some";
            }
            return sel.courses.has(c) ? "all" : "none";
        },
        [subjectsByCourse, subjectState, sel.courses]
    );

    // ── Toggles (cascade down) ────────────────────────────────────────────────
    const clearSubjectDescendants = (next: Selection, s: string) => {
        next.exclSubjects.delete(s);
        for (const e of examsBySubject[s] ?? []) {
            next.exams.delete(e.guid);
            next.exclExams.delete(e.guid);
        }
    };

    const toggleCourse = (c: string, checked: boolean) =>
        setSel((prev) => {
            const next = cloneSel(prev);
            if (checked) next.courses.add(c);
            else next.courses.delete(c);
            for (const s of subjectsByCourse[c] ?? []) {
                next.subjects.delete(s.guid);
                clearSubjectDescendants(next, s.guid);
            }
            return next;
        });

    const toggleSubject = (c: string, s: string, checked: boolean) =>
        setSel((prev) => {
            const next = cloneSel(prev);
            clearSubjectDescendants(next, s);
            if (checked) {
                next.subjects.add(s);
            } else {
                next.subjects.delete(s);
                if (next.courses.has(c)) next.exclSubjects.add(s); // course still checked → exclude this one
            }
            return next;
        });

    const toggleExam = (c: string, s: string, e: string, checked: boolean) =>
        setSel((prev) => {
            const next = cloneSel(prev);
            if (checked) {
                next.exams.add(e);
                next.exclExams.delete(e);
            } else {
                next.exams.delete(e);
                if (subjInherited(next, c, s)) next.exclExams.add(e);
            }
            return next;
        });

    const clearAll = () => setSel(emptySelection());

    // Load every subject's exams up front so counts appear immediately
    const subjectsToLoad = useMemo(
        () =>
            Array.from(
                new Set(
                    courses.flatMap((c) => (subjectsByCourse[c.guid] ?? []).map((s) => s.guid))
                )
            ),
        [courses, subjectsByCourse]
    );

    // ── Totals ────────────────────────────────────────────────────────────────
    const { selectedExams, selectedSubjectNames, pendingSubjects } = useMemo(() => {
        const exams = new Map<string, ExamNode>();
        const names: string[] = [];
        let pending = 0;

        for (const course of courses) {
            const c = course.guid;
            const subs = subjectsByCourse[c] ?? [];
            for (const s of subs) {
                const list = examsBySubject[s.guid];
                if (!list) {
                    if (subjInherited(sel, c, s.guid)) pending += 1;
                    continue;
                }
                let any = false;
                for (const e of list) {
                    if (examEffective(sel, c, s.guid, e.guid)) {
                        exams.set(e.guid, e);
                        any = true;
                    }
                }
                if (any) names.push(s.name);
            }
        }
        return {
            selectedExams: Array.from(exams.values()),
            selectedSubjectNames: Array.from(new Set(names)),
            pendingSubjects: pending,
        };
    }, [sel, courses, subjectsByCourse, examsBySubject]);

    const availableQuestions = useMemo(
        () => selectedExams.reduce((sum, e) => sum + e.questions, 0),
        [selectedExams]
    );

    // ── Form state ────────────────────────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [drawAll, setDrawAll] = useState(true);
    const [drawCount, setDrawCount] = useState("20");

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [description, setDescription] = useState<string | null>(null); // null = auto text
    const [difficulty, setDifficulty] = useState("");
    const [duration, setDuration] = useState<string | null>(null); // null = auto value
    const [passMark, setPassMark] = useState("70");
    const [attemptsAllowed, setAttemptsAllowed] = useState("80");
    const [timeLimitPerQuestion, setTimeLimitPerQuestion] = useState("");
    const [instructions, setInstructions] = useState("");
    const [isTimed, setIsTimed] = useState(false);
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [showResultsImmediately, setShowResultsImmediately] = useState(false);
    const [allowReview, setAllowReview] = useState(true);
    const [mode, setMode] = useState<ExamMode>("Practice");

    const totalQuestions = drawAll
        ? availableQuestions
        : Math.min(Math.max(1, Number(drawCount) || 1), Math.max(availableQuestions, 1));

    const autoDuration = Math.min(totalQuestions * MINUTES_PER_QUESTION, MAX_AUTO_DURATION);
    const effectiveDuration = duration ?? String(autoDuration);

    const autoDescription = useMemo(() => {
        const subjects =
            selectedSubjectNames.length === 0
                ? "selected topics"
                : selectedSubjectNames.length <= 3
                    ? selectedSubjectNames.join(", ")
                    : `${selectedSubjectNames.slice(0, 3).join(", ")} and ${selectedSubjectNames.length - 3} more`;
        return `Custom ${TARGET_NAME} examination with ${totalQuestions} questions drawn from ${selectedExams.length} exam${selectedExams.length === 1 ? "" : "s"} covering ${subjects}.`;
    }, [selectedSubjectNames, selectedExams.length, totalQuestions]);

    const autoInstructions = `Answer all ${totalQuestions} questions within ${effectiveDuration || autoDuration} minutes. Unanswered questions are marked incorrect.`;

    const generateTitle = useCallback(() => {
        const subjects =
            selectedSubjectNames.length === 0
                ? "Custom"
                : selectedSubjectNames.length <= 2
                    ? selectedSubjectNames.join(" & ")
                    : `${selectedSubjectNames[0]} +${selectedSubjectNames.length - 1} more`;
        const stamp = new Date().toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        return `${TARGET_NAME} ${subjects} Practice — ${totalQuestions || 0} Qs — ${stamp}`;
    }, [selectedSubjectNames, totalQuestions]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{
        ok: boolean;
        message: string;
        warnings: string[];
    } | null>(null);

    const canSubmit =
        !submitting &&
        !!user &&
        pendingSubjects === 0 &&
        selectedExams.length > 0 &&
        totalQuestions > 0 &&
        availableQuestions > 0;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setResult(null);

        const now = new Date();

        const payload = {
            // identity
            Title: (title.trim() || generateTitle()).trim(),
            Description: (description ?? autoDescription).trim(),
            Type: "Examination",
            AccessType: "Restricted",
            AccessGroup: "Unlimited",
            AccessValue: 0,
            Code: generateCode(),
            Status: "Active",
            Segment: activeSegment,
            Series: activeName,
            Module: "DIY",
            Tag: "DIY-EXAM",
            Version: "8.0.8",
            Year: now.getFullYear(),
            Season: seasonOf(now),
            Level: difficulty || "Intermediate",
            Difficulty: difficulty || "Medium",
            ValidFrom: now.toISOString(),
            PublishedAt: now.toISOString(),

            // rules
            TotalQuestions: totalQuestions,
            TotalMarks: totalQuestions,
            Duration: toNum(effectiveDuration) ?? autoDuration,
            PassMark: toNum(passMark) ?? 70,
            AttemptsAllowed: toNum(attemptsAllowed) ?? 80,

            // details
            IsTimed: isTimed,
            TimeLimitPerQuestion: toNum(timeLimitPerQuestion),
            ShuffleQuestions: shuffleQuestions,
            ShowResultsImmediately: showResultsImmediately,
            AllowReview: allowReview,
            HasCertificate: false,
            Price: 0,
            Discount: 0,
            Currency: "USD",
            WaitlistEnabled: false,
            IsFeatured: false,
            Instructions: instructions.trim() || autoInstructions,
            Objectives: `Practice and assess knowledge across ${selectedSubjectNames.length || "the selected"} subject${selectedSubjectNames.length === 1 ? "" : "s"}.`,
            Prerequisites: "None",
            Resources: "Course material",

            // pool (Target is added on the server)
            ExamIds: selectedExams.map((e) => e.guid),
        };

        try {
            const res = (await strataService("Exam", "DiyStore", payload)) as {
                success?: boolean;
                message?: string;
                error?: string;
                warnings?: string[];
                guidId?: string;
                data?: { guidId?: string };
            };

            const failed = !!res.error || res.success === false;
            const newGuid = res.guidId ?? res.data?.guidId;

            setResult({
                ok: !failed,
                message: res.error ?? res.message ?? (failed ? "Failed to create DIY Exam ⚓" : "DIY Exam created ⚓"),
                warnings: res.warnings ?? [],
            });

            if (!failed && newGuid) {
                router.push(
                    `/web/${activePanel}/vista/exam/generic?mode=${encodeURIComponent(mode)}&diyidentifier=${newGuid}`
                );
                return; // keep the button disabled until the page changes
            }
        } catch (err) {
            setResult({
                ok: false,
                message: err instanceof Error ? err.message : "Unexpected error ⚓",
                warnings: [],
            });
        }
        setSubmitting(false);
    };

    const resetAll = () => {
        setSel(emptySelection());
        setTitle("");
        setDescription(null);
        setDuration(null);
        setResult(null);
    };

    // ───────────────────────────────────────────────────────────────────────────
    // RENDER
    // ───────────────────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            {/* Headless loaders */}
            {activePrograms.map((p) => (
                <ProgramCoursesLoader key={p.guidId} programGuid={p.guidId} onLoaded={reportCourses} />
            ))}
            {courses.map((c) => (
                <CourseSubjectsLoader key={c.guid} courseGuid={c.guid} onLoaded={reportSubjects} />
            ))}
            {subjectsToLoad.map((s) => (
                <SubjectExamsLoader key={s} subjectGuid={s} onLoaded={reportExams} />
            ))}

            <div className="mx-auto w-full max-w-7xl px-3 py-6 md:px-6">
                <header className="mb-5">
                    <h1 className="text-xl font-bold md:text-2xl">Build Your Own Exam</h1>
                    <p className="text-sm text-slate-600">
                        Tick courses, subjects or individual exams. Ticking a parent selects everything inside it.
                    </p>
                </header>

                {!userLoading && !user && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        You need to be logged in to create a DIY exam.
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                    {/* ───────────── LEFT: TREE ───────────── */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-slate-600" />
                                <h2 className="text-base font-bold">Your {TARGET_NAME} Courses</h2>
                            </div>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                            >
                                Clear selection
                            </button>
                        </div>

                        {/* Program picker */}
                        <div className="mb-4">
                            <p className="mb-1.5 text-xs font-semibold text-slate-600">
                                1. Choose program(s)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {currentPrograms.length === 0 && (
                                    <span className="text-xs text-slate-500">Loading programs . . . ⚓</span>
                                )}
                                {currentPrograms.map((p) => {
                                    const on = selectedPrograms.has(p.guidId);
                                    return (
                                        <button
                                            key={p.guidId}
                                            type="button"
                                            onClick={() => toggleProgram(p.guidId)}
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${on
                                                ? "border-indigo-600 bg-indigo-600 text-white"
                                                : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                                }`}
                                        >
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {activePrograms.length === 0 && currentPrograms.length > 0 && (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Select a program above to see its courses.
                            </p>
                        )}

                        {activePrograms.length > 0 && courses.length === 0 && (
                            <p className="py-8 text-center text-sm text-slate-500">Loading courses . . . ⚓</p>
                        )}

                        <ul className="space-y-2">
                            {courses.map((course) => {
                                const cKey = `c:${course.guid}`;
                                const isOpen = expanded.has(cKey);
                                const subs = subjectsByCourse[course.guid] ?? [];

                                // counts (only from loaded data)
                                let examCount = 0;
                                let questionCount = 0;
                                let fullyLoaded = subs.length > 0;
                                for (const s of subs) {
                                    const list = examsBySubject[s.guid];
                                    if (!list) {
                                        fullyLoaded = false;
                                        continue;
                                    }
                                    examCount += list.length;
                                    questionCount += list.reduce((a, e) => a + e.questions, 0);
                                }

                                return (
                                    <li key={course.guid} className="rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-2 px-3 py-2">
                                            <IndeterminateCheckbox
                                                label={`Select ${course.name}`}
                                                state={courseState(course.guid)}
                                                onChange={(v) => toggleCourse(course.guid, v)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(cKey)}
                                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                            >
                                                {isOpen ? (
                                                    <ChevronDown className="h-4 w-4 shrink-0" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 shrink-0" />
                                                )}
                                                <span className="truncate font-semibold">{course.name}</span>
                                            </button>
                                            <div className="flex shrink-0 flex-wrap justify-end gap-1 text-[10px] font-bold uppercase">
                                                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-indigo-800">
                                                    {subs.length} subjects
                                                </span>
                                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">
                                                    {fullyLoaded ? examCount : "…"} exams
                                                </span>
                                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                                                    {fullyLoaded ? questionCount : "…"} Qs
                                                </span>
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <ul className="space-y-1 border-t border-slate-100 bg-slate-50/60 px-3 py-2">
                                                {subs.length === 0 && (
                                                    <li className="py-2 pl-6 text-xs text-slate-500">No subjects found.</li>
                                                )}

                                                {subs.map((subject) => {
                                                    const sKey = `s:${subject.guid}`;
                                                    const sOpen = expanded.has(sKey);
                                                    const exams = examsBySubject[subject.guid];
                                                    const qCount = exams?.reduce((a, e) => a + e.questions, 0);

                                                    return (
                                                        <li key={subject.guid} className="rounded-lg border border-slate-200 bg-white">
                                                            <div className="flex items-center gap-2 px-2 py-1.5">
                                                                <IndeterminateCheckbox
                                                                    label={`Select ${subject.name}`}
                                                                    state={subjectState(course.guid, subject.guid)}
                                                                    onChange={(v) => toggleSubject(course.guid, subject.guid, v)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleExpand(sKey)}
                                                                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                                                >
                                                                    {sOpen ? (
                                                                        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                                                                    ) : (
                                                                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                                                    )}
                                                                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                                                                    <span className="truncate text-sm font-medium">{subject.name}</span>
                                                                </button>
                                                                <div className="flex shrink-0 gap-1 text-[10px] font-bold uppercase">
                                                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">
                                                                        {exams ? exams.length : "…"} exams
                                                                    </span>
                                                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                                                                        {qCount ?? "…"} Qs
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {sOpen && (
                                                                <ul className="space-y-0.5 border-t border-slate-100 px-2 py-1.5">
                                                                    {!exams && (
                                                                        <li className="flex items-center gap-2 py-1 pl-6 text-xs text-slate-500">
                                                                            <Loader2 className="h-3 w-3 animate-spin" /> Loading exams . . .
                                                                        </li>
                                                                    )}
                                                                    {exams?.length === 0 && (
                                                                        <li className="py-1 pl-6 text-xs text-slate-500">No exams in this subject.</li>
                                                                    )}
                                                                    {exams?.map((exam) => (
                                                                        <li key={exam.guid} className="flex items-center gap-2 py-1 pl-6">
                                                                            <input
                                                                                type="checkbox"
                                                                                aria-label={`Select ${exam.title}`}
                                                                                checked={examEffective(sel, course.guid, subject.guid, exam.guid)}
                                                                                onChange={(e) =>
                                                                                    toggleExam(course.guid, subject.guid, exam.guid, e.target.checked)
                                                                                }
                                                                                className="h-4 w-4 shrink-0 cursor-pointer accent-indigo-600"
                                                                            />
                                                                            <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                                            <span className="min-w-0 flex-1 truncate text-sm">{exam.title}</span>
                                                                            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                                                                {exam.questions} Qs
                                                                            </span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* ───────────── RIGHT: FORM ───────────── */}
                    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <h2 className="mb-3 text-base font-bold">Exam Details</h2>

                            {/* Summary */}
                            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-lg border border-slate-200 py-2">
                                    <div className="text-lg font-black">{selectedExams.length}</div>
                                    <div className="text-[9px] font-semibold uppercase text-slate-500">Exams</div>
                                </div>
                                <div className="rounded-lg border border-slate-200 py-2">
                                    <div className="text-lg font-black">{selectedSubjectNames.length}</div>
                                    <div className="text-[9px] font-semibold uppercase text-slate-500">Subjects</div>
                                </div>
                                <div className="rounded-lg border border-slate-200 py-2">
                                    <div className="text-lg font-black">{availableQuestions}</div>
                                    <div className="text-[9px] font-semibold uppercase text-slate-500">Questions</div>
                                </div>
                            </div>

                            {/* Title */}
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Exam title</label>
                            <div className="mb-4 flex gap-2">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Leave empty to auto-generate"
                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setTitle(generateTitle())}
                                    title="Auto-generate a title"
                                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
                                >
                                    <Sparkles className="h-3.5 w-3.5" /> Auto
                                </button>
                            </div>

                            {/* Question count */}
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Number of questions</label>
                            <div className="mb-1 flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-sm">
                                    <input
                                        type="radio"
                                        checked={drawAll}
                                        onChange={() => setDrawAll(true)}
                                        className="accent-indigo-600"
                                    />
                                    All ({availableQuestions})
                                </label>
                                <label className="flex items-center gap-1.5 text-sm">
                                    <input
                                        type="radio"
                                        checked={!drawAll}
                                        onChange={() => setDrawAll(false)}
                                        className="accent-indigo-600"
                                    />
                                    Random
                                </label>
                                {!drawAll && (
                                    <input
                                        type="number"
                                        min={1}
                                        max={Math.max(availableQuestions, 1)}
                                        value={drawCount}
                                        onChange={(e) => setDrawCount(e.target.value)}
                                        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                                    />
                                )}
                            </div>
                            <p className="mb-4 text-[11px] text-slate-500">
                                Random picks that many unique questions from the selected pool.
                            </p>
                            <div className="mb-4 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                                        Duration (min)
                                        {duration !== null && (
                                            <button type="button" onClick={() => setDuration(null)} className="text-[10px] text-indigo-600">
                                                Reset to auto
                                            </button>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={effectiveDuration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                    />
                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                        Auto: {MINUTES_PER_QUESTION} min per question (max {MAX_AUTO_DURATION})
                                    </p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">Pass mark (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={passMark}
                                        onChange={(e) => setPassMark(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Open in mode */}
                            <div className="mb-4">
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Open in mode</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {EXAM_MODES.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setMode(m)}
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${mode === m
                                                ? "border-indigo-600 bg-indigo-600 text-white"
                                                : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Advanced */}
                            <button
                                type="button"
                                onClick={() => setShowAdvanced((v) => !v)}
                                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                            >
                                <Settings2 className="h-3.5 w-3.5" />
                                Advanced options
                                {showAdvanced ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>

                            {showAdvanced && (
                                <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                    <textarea
                                        value={description ?? autoDescription}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                        >
                                            <option value="">Difficulty: any</option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>

                                        <input
                                            type="number"
                                            min={0}
                                            value={attemptsAllowed}
                                            onChange={(e) => setAttemptsAllowed(e.target.value)}
                                            placeholder="Attempts (0 = ∞)"
                                            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                        />
                                    </div>

                                    <textarea
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        placeholder="Instructions shown to the student (optional)"
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />

                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} className="accent-indigo-600" />
                                            Shuffle questions
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={allowReview} onChange={(e) => setAllowReview(e.target.checked)} className="accent-indigo-600" />
                                            Allow review
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={showResultsImmediately} onChange={(e) => setShowResultsImmediately(e.target.checked)} className="accent-indigo-600" />
                                            Show results now
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={isTimed} onChange={(e) => setIsTimed(e.target.checked)} className="accent-indigo-600" />
                                            Timed per question
                                        </label>
                                    </div>

                                    {isTimed && (
                                        <input
                                            type="number"
                                            min={1}
                                            value={timeLimitPerQuestion}
                                            onChange={(e) => setTimeLimitPerQuestion(e.target.value)}
                                            placeholder="Seconds per question"
                                            className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                        />
                                    )}
                                </div>
                            )}

                            {pendingSubjects > 0 && (
                                <p className="mb-2 flex items-center gap-2 text-xs text-slate-600">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Loading exams for {pendingSubjects} selected subject{pendingSubjects === 1 ? "" : "s"} . . .
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? "Creating . . ." : `Create Exam (${totalQuestions} Qs)`}
                            </button>
                        </div>

                        {/* Result */}
                        {result && (
                            <div
                                className={`rounded-2xl border p-4 text-sm ${result.ok
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                    : "border-red-300 bg-red-50 text-red-900"
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    {result.ok ? (
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                    ) : (
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    )}
                                    <p className="font-semibold">{result.message}</p>
                                </div>

                                {result.warnings.length > 0 && (
                                    <ul className="mt-2 list-disc space-y-1 pl-6 text-xs">
                                        {result.warnings.map((w, i) => (
                                            <li key={i}>{w}</li>
                                        ))}
                                    </ul>
                                )}

                                {result.ok && (
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={resetAll}
                                            className="rounded-lg border border-emerald-400 bg-white px-3 py-1.5 text-xs font-semibold"
                                        >
                                            Create another
                                        </button>
                                        <Link
                                            href="/"
                                            className="rounded-lg border border-emerald-400 bg-white px-3 py-1.5 text-xs font-semibold"
                                        >
                                            Back home
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}