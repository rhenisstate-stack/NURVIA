"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, History, X, Loader2, AlertTriangle, Star, ChevronLeft, ChevronRight, Copy, Check, ExternalLink, Share2, Sparkles, FileText, HelpCircle } from "lucide-react";

import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import {
    seekService,
    SEEK_GROUPS,
    type SeekItem,
    type SeekMode,
    type SeekResponse,
    type SeekScope,
    type SeekHistoryEntry,
    type SeekSuggestion,
} from "@/lib/services/seek/seekService";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const DEBOUNCE_MS = 250;
const SUGGEST_DEBOUNCE_MS = 120;
const PER_PAGE_DISTINCT = 20;
const MIN_RECORD_LENGTH = 3;
const LATEST_SENTINEL = "__latest__";           // tells the backend: newest first, no text match

const LATEST_WORDS = new Set([
    "new", "newest", "latest", "recent", "recents", "current", "newly", "fresh",
    "new exam", "new exams", "new question", "new questions",
    "latest exam", "latest exams", "latest question", "latest questions",
    "recent exam", "recent exams", "recent question", "recent questions",
    "newest exam", "newest exams", "newest question", "newest questions",
    "whats new", "what's new", "most recent", "just added", "recently added",
]);

// Fill in where each result should open. Scopes left out render as plain cards.
// e.g. course: (guid) => `/web/ati-teas/vista/course?identifier=${guid}`
const DEFAULT_DASHBOARD = "ati-teas"; // used for every non-program result
const EXAM_MODES = ["Tutor", "Practice", "Exam", "Test", "Adaptive"] as const;

const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const buildHref = (scope: SeekScope, item: SeekItem, mode: string): string | undefined => {
    const id = encodeURIComponent(item.guidId);
    const dash = DEFAULT_DASHBOARD;
    switch (scope) {
        case "program":
            return `/dashboards/${slugify(item.name) || dash}`;
        case "course":
            return `/dashboards/${dash}/vista/learning/subjects/distinct/overview?identifier=${id}`;
        case "subject":
            return `/dashboards/${dash}/vista/assessment/exams/distinct/overview?level=subject&identifier=${id}`;
        case "exam":
            return `/web/${dash}/vista/exam/generic?mode=${encodeURIComponent(mode)}&identifier=${id}`;
        case "question":
            return item.examGuidId
                ? `/web/${dash}/vista/exam/generic?mode=${encodeURIComponent(mode)}&identifier=${encodeURIComponent(item.examGuidId)}&target=${id}`
                : undefined;
        default:
            return undefined;
    }
};

const VALID_SCOPES = SEEK_GROUPS.map((g) => g.scope);
const scopeLabel = (s?: string | null) => SEEK_GROUPS.find((g) => g.scope === s)?.label ?? s ?? "";

const timeAgo = (iso: string) => {
    const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD COLORS — soft, stable per-card palette (picked from the item's guidId)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_TONES = [
    { bg: "bg-rose-50", border: "border-rose-200", hover: "hover:border-rose-400", activeBg: "bg-rose-100", ring: "ring-rose-300", trail: "text-rose-700", chev: "text-rose-300" },
    { bg: "bg-sky-50", border: "border-sky-200", hover: "hover:border-sky-400", activeBg: "bg-sky-100", ring: "ring-sky-300", trail: "text-sky-700", chev: "text-sky-300" },
    { bg: "bg-emerald-50", border: "border-emerald-200", hover: "hover:border-emerald-400", activeBg: "bg-emerald-100", ring: "ring-emerald-300", trail: "text-emerald-700", chev: "text-emerald-300" },
    { bg: "bg-amber-50", border: "border-amber-200", hover: "hover:border-amber-400", activeBg: "bg-amber-100", ring: "ring-amber-300", trail: "text-amber-700", chev: "text-amber-300" },
    { bg: "bg-violet-50", border: "border-violet-200", hover: "hover:border-violet-400", activeBg: "bg-violet-100", ring: "ring-violet-300", trail: "text-violet-700", chev: "text-violet-300" },
    { bg: "bg-teal-50", border: "border-teal-200", hover: "hover:border-teal-400", activeBg: "bg-teal-100", ring: "ring-teal-300", trail: "text-teal-700", chev: "text-teal-300" },
    { bg: "bg-fuchsia-50", border: "border-fuchsia-200", hover: "hover:border-fuchsia-400", activeBg: "bg-fuchsia-100", ring: "ring-fuchsia-300", trail: "text-fuchsia-700", chev: "text-fuchsia-300" },
    { bg: "bg-orange-50", border: "border-orange-200", hover: "hover:border-orange-400", activeBg: "bg-orange-100", ring: "ring-orange-300", trail: "text-orange-700", chev: "text-orange-300" },
    { bg: "bg-cyan-50", border: "border-cyan-200", hover: "hover:border-cyan-400", activeBg: "bg-cyan-100", ring: "ring-cyan-300", trail: "text-cyan-700", chev: "text-cyan-300" },
    { bg: "bg-lime-50", border: "border-lime-200", hover: "hover:border-lime-400", activeBg: "bg-lime-100", ring: "ring-lime-300", trail: "text-lime-700", chev: "text-lime-300" },
] as const;

const toneFor = (key: string) => {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return CARD_TONES[h % CARD_TONES.length];
};

// ─────────────────────────────────────────────────────────────────────────────
// RESULT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ item, scope, active, onActivate }: { item: SeekItem; scope: SeekScope; active?: boolean; onActivate?: () => void }) {
    const router = useRouter();
    const [mode, setMode] = useState<string>("Practice");
    const [copied, setCopied] = useState(false);
    const isExam = scope === "exam";
    const isQuestion = scope === "question";
    const hasMode = isExam || isQuestion;
    const href = buildHref(scope, item, mode);

    const isNew = isExam && !!item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 14 * 86400000;
    const trailParts = [item.programName, item.courseName, item.subjectName, isQuestion ? item.examTitle : null]
        .filter((v): v is string => !!v && v.trim() !== "");

    const tone = toneFor(item.guidId);
    const rawChips: (string | number | null | undefined)[] = isExam
        ? [item.season, item.year, item.totalQuestions != null ? `${item.totalQuestions} Questions` : null]
        : isQuestion
            ? [item.difficulty]
            : [item.status, item.difficulty, item.segment, item.fragment, item.season, item.year];
    const chips = rawChips.filter((v) => v !== null && v !== undefined && v !== "").map(String);
    const countChip = isExam && item.totalQuestions != null ? `${item.totalQuestions} Questions` : null;
    const metaChips = isExam ? chips.filter((c) => c !== countChip) : chips;

    const fullUrl = () => (href ? `${window.location.origin}${href}` : item.name);
    const go = () => { onActivate?.(); if (href) router.push(href); };

    const copyText = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { /* clipboard blocked */ }
    };
    const copy = async (e: { stopPropagation: () => void }) => { e.stopPropagation(); onActivate?.(); await copyText(); };
    const share = async (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onActivate?.();
        if (href && typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({ title: item.name.slice(0, 80), url: fullUrl() });
                return;
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
            }
        }
        await copyText();
    };

    return (
        <div
            role={href ? "link" : undefined}
            tabIndex={href ? 0 : undefined}
            onClick={go}
            onKeyDown={(e) => { if (e.key === "Enter") go(); }}
            onMouseEnter={() => { if (href) router.prefetch(href); }}
            className={`group block rounded-xl border p-3 transition hover:shadow-md ${active
                ? `${tone.activeBg} ${tone.border} ring-1 ${tone.ring}`
                : `${tone.bg} ${tone.border} ${tone.hover}`} ${href ? "cursor-pointer" : ""}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className={`flex min-w-0 items-start gap-1 text-sm font-semibold text-slate-800 ${isExam ? "md:text-base" : ""}`}>
                    {item.isFeatured && <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />}
                    <span className={isQuestion ? "truncate font-medium" : "break-words"}>{item.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    {isNew && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">New</span>}

                    {countChip && (
                        <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {countChip}
                        </span>
                    )}
                </div>
            </div>

            {hasMode && trailParts.length > 0 && (
                <div
                    className="mt-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p
                        className={`flex w-max items-center gap-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide md:text-[11px] ${tone.trail}`}
                    >
                        {trailParts.map((part, i) => (
                            <span key={i} className="flex shrink-0 items-center gap-1">
                                {i > 0 && <ChevronRight className={`h-3 w-3 shrink-0 ${tone.chev}`} />}
                                <span>{part}</span>
                            </span>
                        ))}
                    </p>
                </div>
            )}

            {!hasMode && item.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>}

            {!hasMode && chips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {chips.map((c, i) => (
                        <span key={i} className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {c}
                        </span>
                    ))}
                </div>
            )}

            <div
                className="mt-2 flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <div className="flex min-w-0 flex-wrap items-center gap-1">
                    {hasMode && metaChips.map((c, i) => (
                        <span key={i} className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {c}
                        </span>
                    ))}
                    {hasMode && href && (
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Exam mode"
                            className="hidden rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 md:block"
                        >
                            {EXAM_MODES.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {href && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); go(); }}
                            className="inline-flex items-center gap-1 rounded-md border border-indigo-600 bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                            <ExternalLink className="h-3 w-3" /> Open
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={share}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50"
                    >
                        <Share2 className="h-3 w-3" /> Share
                    </button>
                    <button
                        type="button"
                        onClick={copy}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50"
                    >
                        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE CONTENT
// ─────────────────────────────────────────────────────────────────────────────
function SearchContent() {
    const { user, loading: userLoading } = useCurrentSystemUser();
    const router = useRouter();
    const params = useSearchParams();

    // initial state comes from the URL so searches are shareable / refresh-safe
    const initScope = params.get("scope") as SeekScope | null;
    const [query, setQuery] = useState(params.get("q") ?? "");
    const initMode = params.get("mode");
    const [mode, setMode] = useState<SeekMode>(initMode === "distinct" ? "distinct" : initMode === "absolute" ? "absolute" : "core");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [scope, setScope] = useState<SeekScope>(initScope && VALID_SCOPES.includes(initScope) ? initScope : "program");
    const [page, setPage] = useState(1);
    const [advanced, setAdvanced] = useState(false);

    const [latest, setLatest] = useState<"exam" | "question" | null>(null);
    const [newDismissed, setNewDismissed] = useState(false);
    const isNewQuery = LATEST_WORDS.has(query.trim().toLowerCase().replace(/\s+/g, " "));
    const showNewModal = isNewQuery && !latest && !newDismissed;

    const [data, setData] = useState<SeekResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [history, setHistory] = useState<SeekHistoryEntry[]>([]);

    const reqId = useRef(0);          // ignore stale responses
    const lastKey = useRef("");       // skip duplicate runs

    // ── History ───────────────────────────────────────────────────────────────
    const loadHistory = useCallback(async () => {
        const res = await seekService.history();
        setHistory(Array.isArray(res.data) ? res.data : []);
    }, []);

    const clearHistory = async () => {
        await seekService.clearHistory();
        setHistory([]);
    };

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // ── Search ────────────────────────────────────────────────────────────────
    const run = useCallback(
        async (q: string, m: SeekMode, sc: SeekScope, pg: number, record: boolean) => {
            const id = ++reqId.current;
            lastKey.current = `${q}|${m}|${sc}|${pg}`;
            setLoading(true);
            setError(null);

            const res = await seekService.search({
                query: q,
                mode: m,
                scope: sc,
                page: pg,
                perPage: m === "distinct" ? PER_PAGE_DISTINCT : m === "core" ? 10 : 20,
                record,
            });

            if (id !== reqId.current) return; // a newer request took over

            if (res.error || !res.data) {
                setData(null);
                setError(res.error ?? "Search failed ⚓");
            } else {
                setData(res.data);
                if (record) loadHistory();
            }
            setLoading(false);
        },
        [loadHistory]
    );

    // debounced auto-search
    useEffect(() => {
        const q = query.trim();

        // keep the URL in sync
        const next = new URLSearchParams();
        if (q) next.set("q", q);
        if (mode !== "core") next.set("mode", mode);
        if (mode === "distinct") next.set("scope", scope);
        router.replace(`?${next.toString()}`, { scroll: false });

        if (!q) {
            reqId.current++;
            lastKey.current = "";
            setData(null);
            setError(null);
            setLoading(false);
            return;
        }

        // "new" → wait for the modal answer instead of searching the word "new"
        if (showNewModal) {
            reqId.current++;
            lastKey.current = "";
            setData(null);
            setError(null);
            setLoading(false);
            return;
        }

        const effective = latest ? LATEST_SENTINEL : q;
        if (lastKey.current === `${effective}|${mode}|${scope}|${page}`) return;

        const t = setTimeout(
            () => run(effective, mode, scope, page, !latest && q.length >= MIN_RECORD_LENGTH),
            DEBOUNCE_MS
        );
        return () => clearTimeout(t);
    }, [query, mode, scope, page, latest, showNewModal, run, router]);

    // Esc closes the "new" modal
    useEffect(() => {
        if (!showNewModal) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setNewDismissed(true); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showNewModal]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const [suggestions, setSuggestions] = useState<SeekSuggestion[]>([]);
    const [showSuggest, setShowSuggest] = useState(false);
    const suggestReq = useRef(0);

    useEffect(() => {
        const q = query.trim();
        if (!q || !showSuggest) { setSuggestions([]); return; }
        const t = setTimeout(async () => {
            const id = ++suggestReq.current;
            const res = await seekService.suggest(q, 8);
            if (id !== suggestReq.current) return;
            setSuggestions(res.data?.suggestions ?? []);
        }, SUGGEST_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [query, showSuggest]);

    const resetToDefault = () => {
        setMode("core");              // 📝 Exams & Questions
        setScope("program");
        setLatest(null);
        setNewDismissed(false);
        setPage(1);
    };

    const pickSuggestion = (s: SeekSuggestion) => {
        setShowSuggest(false);
        setSuggestions([]);
        setLatest(null);
        setNewDismissed(false);
        if (s.scope && VALID_SCOPES.includes(s.scope as SeekScope)) {
            setMode("distinct");
            setScope(s.scope as SeekScope);
        }
        setPage(1);
        setQuery(s.text);
    };

    const changeMode = (m: SeekMode) => { setLatest(null); setMode(m); setPage(1); };
    const changeScope = (s: SeekScope) => { setLatest(null); setScope(s); setPage(1); };

    const changeQuery = (v: string) => {
        setQuery(v);
        setPage(1);
        const t = v.trim().toLowerCase().replace(/\s+/g, " ");

        if (!t) {                       // cleared / closed → back to the default search mode
            resetToDefault();
            setShowSuggest(false);
            setSuggestions([]);
            return;
        }

        setShowSuggest(true);
        if (!LATEST_WORDS.has(t)) {
            if (latest) { setMode("core"); setScope("program"); }   // left the "latest" view
            setLatest(null);
            setNewDismissed(false);
        }
    };

    const chooseLatest = (kind: "exam" | "question") => {
        setShowSuggest(false);
        setSuggestions([]);
        setLatest(kind);
        setMode("distinct");
        setScope(kind);
        setPage(1);
    };

    const submitNow = () => {
        const q = query.trim();
        if (!q || showNewModal) return;
        setShowSuggest(false);
        setSuggestions([]);
        run(latest ? LATEST_SENTINEL : q, mode, scope, page, !latest);
    };

    const refine = (s: SeekScope) => { setLatest(null); setMode("distinct"); setScope(s); setPage(1); };

    const pickHistory = (h: SeekHistoryEntry) => {
        setLatest(null);
        setNewDismissed(false);
        setMode(h.seekType === "distinct" ? "distinct" : "core");
        setScope(h.scope && VALID_SCOPES.includes(h.scope) ? h.scope : "program");
        setPage(1);
        setQuery(h.query);
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const totals = data?.totals ?? {};
    const groups = SEEK_GROUPS
        .filter((g) => g.key !== null)
        .map((g) => ({
            ...g,
            rows: (data?.[g.key as keyof SeekResponse] as SeekItem[] | undefined) ?? [],
        }))
        .filter((g) => g.rows.length > 0);

    const hasQuery = query.trim().length > 0;
    const totalPages =
        mode === "distinct" && data?.skewTotal ? Math.max(1, Math.ceil(data.skewTotal / PER_PAGE_DISTINCT)) : 1;

    // ───────────────────────────────────────────────────────────────────────────
    // RENDER
    // ───────────────────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto w-full max-w-5xl px-3 py-6 md:px-6">
                <header className="relative mb-5">
                    <button
                        type="button"
                        onClick={() => setAdvanced((a) => !a)}
                        aria-expanded={advanced}
                        className="absolute right-0 top-0 select-none px-1 py-0.5 text-[9px] font-medium text-slate-400 transition hover:text-slate-600"
                    >
                        advanced
                    </button>
                    <h1 className="text-xl font-bold md:text-2xl">Advanced Search</h1>
                    <p className="text-sm text-slate-600">
                        Get Easy Access to All the Resources ⚓
                    </p>
                </header>

                {!userLoading && !user && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        Kindly Sign In for Better Experience.
                    </div>
                )}

                {showNewModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
                        onClick={() => setNewDismissed(true)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Show the latest items"
                    >
                        <style>{`@keyframes newpop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}`}</style>
                        <div
                            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
                            style={{ animation: "newpop .18s ease-out" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <Sparkles className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Looking For What&apos;s New ?</h3>
                                        <p className="text-xs text-slate-500">Pick One and I&apos;ll show the Latest First.</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setNewDismissed(true)} aria-label="Close" className="text-slate-400 hover:text-slate-700">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={() => chooseLatest("exam")}
                                    className="group flex flex-col items-start gap-1 rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md"
                                >
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                    <span className="text-sm font-semibold text-slate-800">New Exams</span>
                                    <span className="text-[11px] text-slate-500">Newest First</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => chooseLatest("question")}
                                    className="group flex flex-col items-start gap-1 rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md"
                                >
                                    <HelpCircle className="h-5 w-5 text-indigo-600" />
                                    <span className="text-sm font-semibold text-slate-800">New Questions</span>
                                    <span className="text-[11px] text-slate-500">Newest First</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setNewDismissed(true)}
                                className="mt-3 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98]"
                            >
                                No, Just Search For “{query.trim()}”
                            </button>
                        </div>
                    </div>
                )}

                {/* Search box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-1 items-center rounded-xl border border-slate-300 px-3 py-2 focus-within:border-indigo-500">
                            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => changeQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitNow(); } }}
                                placeholder="Type & Search . . . 🏌️‍♂️"
                                className="w-full bg-transparent text-sm outline-none"
                            />
                            {query && (
                                <button type="button" onClick={() => changeQuery("")} aria-label="Clear">
                                    <X className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => changeQuery("")}
                            title="Search history"
                            className="rounded-xl border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-100"
                        >
                            <History className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Suggestions */}
                    {showSuggest && suggestions.length > 0 && (
                        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            {suggestions.map((s, i) => (
                                <button
                                    key={`${s.text}-${i}`}
                                    type="button"
                                    onClick={() => pickSuggestion(s)}
                                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-indigo-50"
                                >
                                    <span className="truncate text-slate-800">
                                        {s.kind === "popular" ? "🔥" : "🔎"} {s.text}
                                    </span>
                                    {s.scope && (
                                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                            {scopeLabel(s.scope)}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Mode */}
                    {/* <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => changeMode("absolute")}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${mode === "absolute"
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                }`}
                        >
                            🌐 Everywhere
                        </button>
                        <button
                            type="button"
                            onClick={() => changeMode(mode === "distinct" ? "absolute" : "distinct")}
                            title="Specific item"
                            aria-label="Specific item search"
                            className={`rounded p-1 transition ${mode === "distinct" ? "text-indigo-500" : "text-slate-300 hover:text-slate-500"}`}
                        >
                            <Crosshair className="h-3 w-3" />
                        </button>
                    </div> */}

                    {advanced && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {([
                                ["core", "📝 Exams & Questions"],
                                ["absolute", "🌐 Everywhere"],
                                ["distinct", "🎯 Specific item"],
                            ] as const).map(([m, label]) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => changeMode(m)}
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${mode === m
                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Scope */}
                    {advanced && mode === "distinct" && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {SEEK_GROUPS.map((g) => (
                                <button
                                    key={g.scope}
                                    type="button"
                                    onClick={() => changeScope(g.scope)}
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${scope === g.scope
                                        ? "border-indigo-600 bg-indigo-100 text-indigo-900"
                                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    {g.icon} {g.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {data && hasQuery && (
                        <p className="mt-3 text-[11px] text-slate-500">
                            {data.skewTotal ?? 0} result(s) · {data.tookMs ?? 0} ms ·{" "}
                            {latest ? `latest ${scopeLabel(scope).toLowerCase()}` : mode === "distinct" ? scopeLabel(scope) : mode === "core" ? "exams & questions" : "everywhere"}
                        </p>
                    )}
                </div>

                {/* Body */}
                <div className="mt-5 space-y-6">
                    {/* History (empty query) */}
                    {!hasQuery && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-700">🕘 Recent searches</h2>
                                {history.length > 0 && (
                                    <button type="button" onClick={clearHistory} className="text-xs font-semibold text-red-500 hover:underline">
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {history.length === 0 ? (
                                <p className="py-6 text-center text-sm text-slate-500">No searches yet ⚓</p>
                            ) : (
                                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                                    {history.map((h, i) => (
                                        <button
                                            key={`${h.query}-${i}`}
                                            type="button"
                                            onClick={() => pickHistory(h)}
                                            className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left hover:bg-slate-50"
                                        >
                                            <span className="truncate text-sm text-slate-800">🕘 {h.query}</span>
                                            <span className="whitespace-nowrap text-[11px] text-slate-500">
                                                {h.seekType === "distinct" ? `🎯 ${scopeLabel(h.scope ?? "program")}` : "🌐 Everywhere"} · {timeAgo(h.at)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {hasQuery && loading && (
                        <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Searching . . . 🏌️‍♂️
                        </p>
                    )}

                    {hasQuery && !loading && error && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Results */}
                    {hasQuery && !loading && !error && data && groups.map((g) => {
                        const total = totals[g.scope] ?? g.rows.length;
                        return (
                            <section key={g.scope}>
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-700">
                                        {g.icon} {g.label}{" "}
                                        <span className="ml-1 rounded-md bg-slate-200 px-2 py-0.5 text-[11px]">{total}</span>
                                    </h2>
                                    {data.seekType === "absolute" && total > g.rows.length && (
                                        <button
                                            type="button"
                                            onClick={() => refine(g.scope)}
                                            className="text-xs font-semibold text-blue-600 hover:underline"
                                        >
                                            Show all in {g.label} →
                                        </button>
                                    )}
                                </div>
                                <div className={`grid gap-2 ${g.scope === "question" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                                    {g.rows.map((it) => (
                                        <ResultCard
                                            key={it.guidId}
                                            item={it}
                                            scope={g.scope}
                                            active={activeId === it.guidId}
                                            onActivate={() => setActiveId(it.guidId)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {/* Empty */}
                    {hasQuery && !loading && !error && data && groups.length === 0 && (
                        <div className="py-10 text-center">
                            <p className="text-sm text-slate-500">No Matches Found , Try Another Word ⚓</p>
                            {data.didYouMean && data.didYouMean.length > 0 && (
                                <p className="mt-2 text-xs text-slate-500">
                                    Did you mean:{" "}
                                    {data.didYouMean.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => changeQuery(s)}
                                            className="mx-1 rounded-full border border-slate-300 px-2 py-0.5 hover:bg-indigo-50"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Pagination (specific-item mode) */}
                    {hasQuery && !loading && !error && mode === "distinct" && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Prev
                            </button>
                            <span className="text-xs text-slate-600">Page {page} of {totalPages}</span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

// useSearchParams needs a Suspense boundary for production builds
export default function SearchPage() {
    return (
        <Suspense fallback={null}>
            <SearchContent />
        </Suspense>
    );
}