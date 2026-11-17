"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FileText, Loader2, X, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { strataService } from "@/lib/services/nexus/strata/strataService"; // ← same path as diyExamCreation

type Raw = {
  guidId?: string | null;
  id?: number | string;
  title?: string;
  questionsCount?: number | null;
};

interface ExamNode {
  guid: string;
  title: string;
  questions: number;
}

const EXAM_MODES = ["Practice", "Tutor", "Review", "Exam", "Test"] as const;
type ExamMode = (typeof EXAM_MODES)[number];

const MINUTES_PER_QUESTION = 2;
const MAX_AUTO_DURATION = 240;

const seasonOf = (d: Date) => {
  const m = d.getMonth();
  return m <= 4 ? "Spring" : m <= 7 ? "Summer" : "Fall";
};

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
};

const toNum = (v: string): number | undefined => {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) ? n : undefined;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subjectGuid: string;
  subjectName: string;
  courseName?: string;
  targetName: string;
  targetPanel: string;
  targetSegment: string;
}

// Outer shell: the data hook only runs while the modal is open.
export default function DiyExamQuestionCreation(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !props.isOpen) return null;
  return createPortal(<ModalBody {...props} />, document.body);
}

function ModalBody({
  onClose,
  subjectGuid,
  subjectName,
  courseName,
  targetName,
  targetPanel,
  targetSegment,
}: Props) {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentSystemUser();

  const { filteredExams, } = useNominalStrataExams({
    parentIdentifier: subjectGuid,
    page: 1,
    perPage: 96,
    sortColumn: null,
    sortDirection: "asc",
    dynamicLearningStrataName: "subject",
  });

  const exams: ExamNode[] = useMemo(
    () =>
      ((filteredExams ?? []) as unknown as Raw[])
        .map((e) => ({
          guid: String(e.guidId ?? e.id ?? ""),
          title: e.title ?? "Untitled Exam",
          questions: e.questionsCount ?? 0,
        }))
        .filter((e) => e.guid),
    [filteredExams]
  );

  // Tick every exam the first time they load
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current || exams.length === 0) return;
    initialised.current = true;
    setPicked(new Set(exams.map((e) => e.guid)));
  }, [exams]);

  const toggle = (guid: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });

  const allPicked = exams.length > 0 && picked.size === exams.length;
  const toggleAll = () => setPicked(allPicked ? new Set() : new Set(exams.map((e) => e.guid)));

  const selectedExams = exams.filter((e) => picked.has(e.guid));
  const availableQuestions = selectedExams.reduce((s, e) => s + e.questions, 0);

  // form
  const [title, setTitle] = useState("");
  const [drawAll, setDrawAll] = useState(true);
  const [drawCount, setDrawCount] = useState("20");
  const [duration, setDuration] = useState<string | null>(null);
  const [passMark, setPassMark] = useState("70");
  const [mode, setMode] = useState<ExamMode>("Practice");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; warnings: string[] } | null>(null);

  const totalQuestions = drawAll
    ? availableQuestions
    : Math.min(Math.max(1, Number(drawCount) || 1), Math.max(availableQuestions, 1));

  const autoDuration = Math.min(totalQuestions * MINUTES_PER_QUESTION, MAX_AUTO_DURATION);
  const effectiveDuration = duration ?? String(autoDuration);

  const generateTitle = useCallback(() => {
    const stamp = new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${targetName} ${subjectName} Practice — ${totalQuestions || 0} Qs — ${stamp}`;
  }, [targetName, subjectName, totalQuestions]);

  // scroll lock + Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const canSubmit = !submitting && !!user && selectedExams.length > 0 && totalQuestions > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    const now = new Date();

    const payload = {
      Title: (title.trim() || generateTitle()).trim(),
      Description: `Custom ${targetName} examination with ${totalQuestions} questions drawn from ${selectedExams.length} exam${selectedExams.length === 1 ? "" : "s"} in ${subjectName}.`,
      Type: "Examination",
      AccessType: "Restricted",
      AccessGroup: "Unlimited",
      AccessValue: 0,
      Code: generateCode(),
      Status: "Active",
      Segment: targetSegment,
      Series: targetName,
      Module: "DIY",
      Tag: "DIY-EXAM",
      Version: "8.0.8",
      Year: now.getFullYear(),
      Season: seasonOf(now),
      Level: "Intermediate",
      Difficulty: "Medium",
      ValidFrom: now.toISOString(),
      PublishedAt: now.toISOString(),
      TotalQuestions: totalQuestions,
      TotalMarks: totalQuestions,
      Duration: toNum(effectiveDuration) ?? autoDuration,
      PassMark: toNum(passMark) ?? 70,
      AttemptsAllowed: 80,
      IsTimed: false,
      TimeLimitPerQuestion: undefined,
      ShuffleQuestions: true,
      ShowResultsImmediately: false,
      AllowReview: true,
      HasCertificate: false,
      Price: 0,
      Discount: 0,
      Currency: "USD",
      WaitlistEnabled: false,
      IsFeatured: false,
      Instructions: `Answer all ${totalQuestions} questions within ${effectiveDuration || autoDuration} minutes. Unanswered questions are marked incorrect.`,
      Objectives: `Practice and assess knowledge in ${subjectName}.`,
      Prerequisites: "None",
      Resources: "Course material",
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
        onClose();
        router.push(
          `/web/${targetPanel}/vista/exam/generic?mode=${encodeURIComponent(mode)}&diyidentifier=${newGuid}`
        );
        return;
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

  return (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-auto mt-6 flex max-h-[calc(100vh-3rem)] w-[min(44rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-fuchsia-100 via-lime-100 to-blue-100 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">{subjectName} — Custom Test</h1>
            <p className="truncate text-xs text-slate-600">
              {courseName ? `${courseName} · ` : ""}Pick the exams to draw questions from.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border border-slate-300 bg-white p-2 text-slate-600 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!userLoading && !user && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              You need to be logged in to create a DIY exam.
            </div>
          )}

          {/* Step 1: exams */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold">1. Exams ({selectedExams.length}/{exams.length})</h2>
              <button type="button" onClick={toggleAll} className="text-xs font-semibold text-indigo-600">
                {allPicked ? "Clear all" : "Select all"}
              </button>
            </div>

            {exams.length === 0 ? (
              <p className="flex items-center gap-2 py-4 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading exams . . .
              </p>
            ) : (
              <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                {exams.map((e) => (
                  <li key={e.guid}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={picked.has(e.guid)}
                        onChange={() => toggle(e.guid)}
                        className="h-4 w-4 shrink-0 accent-indigo-600"
                      />
                      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate text-sm">{e.title}</span>
                      <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                        {e.questions} Qs
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Step 2: questions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-bold">2. Questions</h2>
            <div className="mb-1 flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" checked={drawAll} onChange={() => setDrawAll(true)} className="accent-indigo-600" />
                All ({availableQuestions})
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" checked={!drawAll} onChange={() => setDrawAll(false)} className="accent-indigo-600" />
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
            <p className="text-[11px] text-slate-500">Random picks that many unique questions from the selected exams.</p>
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Exam title</label>
            <div className="mb-3 flex gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leave empty to auto-generate"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setTitle(generateTitle())}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
              >
                <Sparkles className="h-3.5 w-3.5" /> Auto
              </button>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
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

            <label className="mb-1 block text-xs font-semibold text-slate-600">Open in mode</label>
            <div className="mb-4 flex flex-wrap gap-1.5">
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

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating . . ." : `Create Exam (${totalQuestions} Qs)`}
            </button>
          </section>

          {result && (
            <div
              className={`rounded-2xl border p-4 text-sm ${result.ok
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-red-300 bg-red-50 text-red-900"
                }`}
            >
              <div className="flex items-start gap-2">
                {result.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                <p className="font-semibold">{result.message}</p>
              </div>
              {result.warnings.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-6 text-xs">
                  {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}