"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ExamShell } from "@/components/layout/exam-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ClipboardList,
  Sparkles,
  Trophy,
  LayoutList,
  Rows3,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nurviaApi } from "@/lib/api-client";
import {
  StartAttemptResultDto,
  SubmittedExamResultDto,
  ExamReviewContentDto,
  ExamLayout,
} from "@/lib/api-types";
import { QuestionRendererRegistry, RendererQuestion } from "@/components/exam/renderers";
import { useAuth } from "@/components/auth/auth-provider";

type DeliveryMode = "Review" | "Exam" | "Tutor";type LayoutPolicy = "AllInOneOnly" | "SequentialOnly" | "Both" | null;

function ExamSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status, user } = useAuth();

  const attemptIdParam = searchParams?.get("attemptId");
  const examIdParam = searchParams?.get("examId");
  const modeParam = searchParams?.get("mode") as "Exam" | "Tutor" | "Review" | "Preview" | null;
  const layoutParam = searchParams?.get("layout") as ExamLayout | null;

  // Session state
  const [attemptId, setAttemptId] = React.useState<string | null>(attemptIdParam);
  const [examTitle, setExamTitle] = React.useState<string>("NURVIA examination");
  const [questions, setQuestions] = React.useState<RendererQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [flags, setFlags] = React.useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(5400); // 90 min default
  const [deliveryMode, setDeliveryMode] = React.useState<DeliveryMode>(modeParam === "Tutor" ? "Tutor" : modeParam === "Preview" ? "Review" : modeParam || "Exam");
  const [autosaveStatus, setAutosaveStatus] = React.useState<"saving" | "saved" | "idle" | "error">("idle");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Layout state — persisted on the attempt server-side so resume keeps the choice.
  const [layout, setLayout] = React.useState<ExamLayout>(layoutParam || "Sequential");
  const [layoutPolicy, setLayoutPolicy] = React.useState<LayoutPolicy>(null);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = React.useState<boolean>(false);

  // Review-mode study session (no graded attempt) and Tutor reveal state.
  const [isReviewContent, setIsReviewContent] = React.useState<boolean>(false);
  const [isPreview, setIsPreview] = React.useState<boolean>(false);

  // Review & Submit state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = React.useState<SubmittedExamResultDto | null>(null);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);

  // Autosave debounce timers, keyed per question so that answering a new
  // question can never cancel a pending save for a previous one.
  const autosaveTimeoutsRef = React.useRef<Record<string, NodeJS.Timeout | null>>({});
  const autosaveRetryTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const allInOneRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  React.useEffect(() => {
    if (status === "unauthenticated") {
      const returnTo = typeof window === "undefined"
        ? "/exam-session"
        : `${window.location.pathname}${window.location.search}`;
      router.replace(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
    } else if (status === "authenticated" && user?.role !== "Learner" && user?.role !== "Superadmin") {
      router.replace("/access-denied");
    }
  }, [status, user, router]);

  // 1. Initialize session from the API
  React.useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (attemptIdParam) {
        setIsLoading(true);
        setLoadError(null);
        if (modeParam === "Review") {
          const reviewRes = await nurviaApi.getAttemptReview(attemptIdParam);
          if (!cancelled && reviewRes.success && reviewRes.data) {
            hydrateFromReview(reviewRes.data);
            setIsLoading(false);
            return;
          }
        }

        const res = await nurviaApi.getActiveAttempt(attemptIdParam);
        if (!cancelled && res.success && res.data) {
          hydrateFromAttempt(res.data);
        } else if (!cancelled) {
          // Attempt may already be submitted, try loading completed review
          const reviewRes = await nurviaApi.getAttemptReview(attemptIdParam);
          if (reviewRes.success && reviewRes.data) {
            hydrateFromReview(reviewRes.data);
          } else {
            setLoadError(reviewRes.message || res.message || "Unable to load this exam attempt.");
          }
        }
        if (!cancelled) setIsLoading(false);
      } else if (examIdParam && (modeParam === "Review" || modeParam === "Preview")) {
        // Review mode: study the published exam's approved answer keys without
        // creating any graded attempt. Preview mode is the admin equivalent:
        // same read-only rendering, available for any exam status via the
        // admin-only preview endpoint.
        setIsLoading(true);
        setLoadError(null);
        const res = modeParam === "Preview"
          ? await nurviaApi.getExamPreviewContent(examIdParam)
          : await nurviaApi.getExamReviewContent(examIdParam);
        if (!cancelled && res.success && res.data) {
          hydrateFromReviewContent(res.data);
          if (modeParam === "Preview") setIsPreview(true);
        } else if (!cancelled) {
          setLoadError(res.message || "Review is not available for this examination.");
        }
        if (!cancelled) setIsLoading(false);
      } else if (examIdParam && layoutParam) {
        // Layout already chosen (e.g. from an exam card) — start immediately.
        await startFreshAttempt(layoutParam);
      } else if (examIdParam) {
        // Ask the learner to choose a permitted navigation layout first.
        setIsLayoutModalOpen(true);
      } else {
        setLoadError("Choose a published exam before opening an exam session.");
      }
    }

    async function startFreshAttempt(chosenLayout: ExamLayout) {
      setIsLoading(true);
      setLoadError(null);
      const res = await nurviaApi.startAttempt(examIdParam!, {
        deliveryMode: modeParam === "Tutor" ? "Tutor" : "Exam",
        layoutMode: chosenLayout,
      });
      if (cancelled) return;
      if (res.success && res.data) {
        setAttemptId(res.data.attemptId);
        setIsLayoutModalOpen(false);
        hydrateFromAttempt(res.data);
      } else {
        setLoadError(res.message || "Unable to start this exam. Please choose another published exam.");
      }
      setIsLoading(false);
    }

    loadSession();
    return () => { cancelled = true; };
  }, [attemptIdParam, examIdParam, modeParam, layoutParam]);

  // Cancel pending autosaves when the exam session is unmounted.
  React.useEffect(() => {
    const timeouts = autosaveTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      if (autosaveRetryTimerRef.current) clearTimeout(autosaveRetryTimerRef.current);
    };
  }, []);

  const hydrateFromReviewContent = (data: ExamReviewContentDto) => {
    setExamTitle(data.examTitle);
    setIsReviewContent(true);
    setDeliveryMode("Review");

    const mapped: RendererQuestion[] = data.questions.map((q) => ({
      id: q.questionId,
      orderIndex: q.orderIndex,
      stem: q.stem,
      questionType: q.questionType,
      cognitiveSkill: q.cognitiveSkill,
      clientNeedCategory: q.clientNeedCategory,
      generalRationale: q.generalRationale,
      options: q.options.map((o) => ({
        id: o.id,
        optionIndex: o.optionIndex,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
        specificRationale: o.specificRationale,
        wasSelected: o.wasSelected,
        displayOrder: o.optionIndex,
      })),
      exhibits: q.exhibits,
    }));
    setQuestions(mapped);
  };

  const hydrateFromReview = (data: SubmittedExamResultDto) => {
    setAttemptId(data.attemptId);
    setExamTitle(data.examTitle);
    setIsSubmitted(true);
    setSubmittedResult(data);
    setDeliveryMode("Review");

    if (data.reviewQuestions && data.reviewQuestions.length > 0) {
      const mapped: RendererQuestion[] = data.reviewQuestions.map((q) => ({
        id: q.questionId,
        orderIndex: q.orderIndex,
        stem: q.stem,
        questionType: q.questionType,
        cognitiveSkill: q.cognitiveSkill,
        clientNeedCategory: q.clientNeedCategory,
        generalRationale: q.generalRationale,
        options: q.options.map((o) => ({
          id: o.id,
          optionIndex: o.optionIndex,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          specificRationale: o.specificRationale,
          wasSelected: o.wasSelected,
          displayOrder: o.optionIndex,
        })),
        exhibits: q.exhibits,
      }));
      setQuestions(mapped);

      const initialAnswers: Record<string, string> = {};
      data.reviewQuestions.forEach((q) => {
        if (q.learnerResponse) {
          initialAnswers[q.questionId] = q.learnerResponse;
        }
      });
      setAnswers(initialAnswers);
    }
  };

  const hydrateFromAttempt = (data: StartAttemptResultDto) => {
    setAttemptId(data.attemptId);
    setExamTitle(data.examTitle);
    setSecondsRemaining(data.remainingSeconds);
    setLayoutPolicy(data.allowedLayouts);
    setLayout(data.layoutMode);
    setDeliveryMode(data.deliveryMode === "Tutor" ? "Tutor" : "Exam");

    if (data.questions && data.questions.length > 0) {
      const mapped: RendererQuestion[] = data.questions.map((q) => ({
        id: q.id,
        orderIndex: q.orderIndex,
        stem: q.stem,
        questionType: q.questionType,
        cognitiveSkill: q.cognitiveSkill,
        clientNeedCategory: q.clientNeedCategory,
        contentJsonData: q.contentJsonData,
        generalRationale: q.generalRationale,
        options: q.options.map((o) => ({
          id: o.id,
          optionIndex: o.optionIndex,
          optionText: o.optionText,
          displayOrder: o.displayOrder,
          isCorrect: o.isCorrect,
          specificRationale: o.specificRationale,
        })),
        exhibits: q.exhibits,
      }));
      setQuestions(mapped);
    }

    // Saved answers
    if (data.savedResponses) {
      const initialAnswers: Record<string, string> = {};
      const initialFlags: Record<string, boolean> = {};
      Object.entries(data.savedResponses).forEach(([qId, state]) => {
        if (state.responseJson) initialAnswers[qId] = state.responseJson;
        if (state.isFlagged) initialFlags[qId] = true;
      });
      setAnswers(initialAnswers);
      setFlags(initialFlags);
    }
  };

  // 2. Debounced Autosave Handler
  const persistResponse = async (
    questionId: string,
    payloadJson: string | null,
    isFlagged: boolean,
    layoutMode?: ExamLayout
  ) => {
    if (!attemptId) return;
    try {
      const res = await nurviaApi.autosaveResponse(attemptId, {
        questionId,
        responseJson: payloadJson,
        isFlagged,
        layoutMode: layoutMode ?? null,
      });
      setAutosaveStatus(res.success ? "saved" : "error");
    } catch {
      setAutosaveStatus("error");
    }
  };

  // Retries a failed save for the latest pending answer. Safe to repeat: the
  // backend autosave is an idempotent per-question update.
  const scheduleSaveRetry = (questionId: string, payloadJson: string | null, isFlagged: boolean) => {
    if (autosaveRetryTimerRef.current) clearTimeout(autosaveRetryTimerRef.current);
    autosaveRetryTimerRef.current = setTimeout(async () => {
      autosaveRetryTimerRef.current = null;
      setAutosaveStatus("saving");
      await persistResponse(questionId, payloadJson, isFlagged);
    }, 4000);
  };

  React.useEffect(() => {
    // Schedule a safe retry whenever a save fails while an attempt is active.
    if (autosaveStatus !== "error" || !attemptId || isSubmitted) return;
    const qid = questions[currentIndex]?.id;
    if (!qid) return;
    scheduleSaveRetry(qid, answers[qid] ?? null, flags[qid] || false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveStatus]);

  // Immediately persists a debounced-but-unsaved response (used before
  // navigating to another question or opening the submit dialog). Returns a
  // promise so submission can await reconciliation of every pending save.
  const flushPendingAutosave = (questionId: string): Promise<void> => {
    const pending = autosaveTimeoutsRef.current[questionId];
    if (!pending) return Promise.resolve();
    clearTimeout(pending);
    autosaveTimeoutsRef.current[questionId] = null;
    return persistResponse(questionId, answers[questionId] ?? null, flags[questionId] || false);
  };

  const handleAnswerChange = (questionId: string, payloadJson: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: payloadJson }));

    if (!attemptId || isReviewContent) return;

    setAutosaveStatus("saving");
    if (autosaveTimeoutsRef.current[questionId]) clearTimeout(autosaveTimeoutsRef.current[questionId]);
    if (autosaveRetryTimerRef.current) {
      clearTimeout(autosaveRetryTimerRef.current);
      autosaveRetryTimerRef.current = null;
    }

    autosaveTimeoutsRef.current[questionId] = setTimeout(async () => {
      autosaveTimeoutsRef.current[questionId] = null;
      await persistResponse(questionId, payloadJson, flags[questionId] || false);
    }, 600);
  };

  // 3. Toggle Flag Handler
  const handleToggleFlag = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const currentFlag = flags[currentQ.id] || false;
    const nextFlag = !currentFlag;

    setFlags((prev) => ({ ...prev, [currentQ.id]: nextFlag }));

    if (attemptId) {
      setAutosaveStatus("saving");
      if (autosaveTimeoutsRef.current[currentQ.id]) {
        clearTimeout(autosaveTimeoutsRef.current[currentQ.id]!);
        autosaveTimeoutsRef.current[currentQ.id] = null;
      }
      await persistResponse(currentQ.id, answers[currentQ.id] || null, nextFlag);
    }
  };

  // Layout switch: permitted only when the exam allows both layouts. Switching
  // never touches persisted responses; the choice is persisted on the attempt.
  const handleLayoutChange = async (nextLayout: ExamLayout) => {
    if (layoutPolicy && layoutPolicy !== "Both") return;
    if (nextLayout === layout) return;
    setLayout(nextLayout);
    if (attemptId && !isSubmitted) {
      const currentQ = questions[currentIndex];
      if (currentQ) {
        setAutosaveStatus("saving");
        await persistResponse(currentQ.id, answers[currentQ.id] ?? null, flags[currentQ.id] || false, nextLayout);
      }
    }
  };

  // 4. Submit Examination Handler
  const handleSubmitExam = async () => {
    setIsSubmitModalOpen(false);
    setSubmissionError(null);
    if (!attemptId) {
      setSubmissionError("There is no persisted exam attempt to submit.");
      return;
    }
    setIsLoading(true);

    try {
      // Reconcile every debounced-but-unsaved response before submitting so the
      // authoritative backend grading uses the learner's latest answers.
      await Promise.all(
        Object.keys(autosaveTimeoutsRef.current).map((qid) => flushPendingAutosave(qid))
      );

      const response = await nurviaApi.submitAttempt(attemptId);
      if (!response.success || !response.data) {
        setSubmissionError(response.message || "The exam could not be submitted. Your attempt has not been marked complete.");
      } else {
        setSubmittedResult(response.data);
        setIsSubmitted(true);
        setDeliveryMode("Review");
        router.replace(`/learner/attempts/${encodeURIComponent(attemptId)}`);
      }
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "The exam could not be submitted.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[currentIndex];
  const isCurrentFlagged = currentQ ? Boolean(flags[currentQ.id]) : false;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  // Tutor immediate feedback: reveal correctness + rationale once the learner
  // answers. Approved content only — the key arrives from the backend for
  // Tutor attempts and is never fabricated client-side.
  const isTutorRevealed = (q: RendererQuestion) =>
    deliveryMode === "Tutor" && !isSubmitted && Boolean(answers[q.id]);

  const reviewStateFor = (q: RendererQuestion) =>
    isSubmitted || isReviewContent || deliveryMode === "Review" || isTutorRevealed(q);

  const scrollToQuestion = (qId: string) => {
    const el = allInOneRefs.current[qId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (status !== "authenticated" ||
      (user?.role !== "Learner" && user?.role !== "Superadmin")) {
    return <main className="flex min-h-screen items-center justify-center px-6 text-sm text-foreground-secondary" aria-live="polite">Checking your learner access…</main>;
  }

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center px-6 text-sm text-foreground-secondary" aria-live="polite">Loading your saved examination…</main>;
  }

  if (loadError && !attemptId && !questions.length) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-brand text-2xl font-bold text-foreground">No exam session available</h1>
        <p role="alert" className="text-sm text-foreground-secondary">{loadError}</p>
        <Link href="/learner/library"><Button>Choose a published exam</Button></Link>
      </main>
    );
  }

  const renderQuestion = (q: RendererQuestion, index: number, isSequential: boolean) => {
    const showReview = reviewStateFor(q);
    return (
      <div key={q.id} ref={(el) => { if (!isSequential) allInOneRefs.current[q.id] = el; }} className="scroll-mt-24">
      <Card
        className={cn("p-6 space-y-6")}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-semibold text-brand-teal">
              Item {index + 1}
              {!isSequential && ` of ${questions.length}`}
            </span>
            <div className="flex items-center gap-2">
              {q.cognitiveSkill && (
                <Badge variant="outline" className="text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1 text-brand-teal" />
                  {String(q.cognitiveSkill)}
                </Badge>
              )}
              {isSequential && flags[q.id] && (
                <Badge variant="destructive" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                  <Bookmark className="w-3 h-3 mr-1 fill-amber-500" /> Flagged
                </Badge>
              )}
            </div>
          </div>

          <h2 className="font-brand text-base sm:text-lg font-bold text-foreground leading-relaxed">
            {q.stem}
          </h2>
        </div>

        {/* Modular Renderer Registry */}
        <div className="pt-2">
          <QuestionRendererRegistry
            question={q}
            value={answers[q.id] ?? null}
            onChange={(val) => handleAnswerChange(q.id, val)}
            disabled={isSubmitted || isReviewContent}
            isReview={showReview}
          />
        </div>

        {/* Tutor immediate feedback panel (approved content delivered by the backend) */}
        {isTutorRevealed(q) && q.generalRationale && (
          <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground-secondary space-y-1">
            <div className="font-bold text-brand-teal flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>Tutor Guidance — Approved Rationale</span>
            </div>
            <p className="pt-1 leading-relaxed">{q.generalRationale}</p>
          </div>
        )}

        {/* All-in-One inline flag control */}
        {!isSequential && !isSubmitted && !isReviewContent && attemptId && (
          <button
            type="button"
            onClick={async () => {
              const nextFlag = !flags[q.id];
              setFlags((prev) => ({ ...prev, [q.id]: nextFlag }));
              setAutosaveStatus("saving");
              await persistResponse(q.id, answers[q.id] ?? null, nextFlag);
            }}
            className={cn(
              "text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors",
              flags[q.id]
                ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "border-border text-foreground-secondary hover:bg-surface-muted"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5", flags[q.id] && "fill-amber-500")} />
            {flags[q.id] ? "Flagged" : "Flag for review"}
          </button>
        )}
      </Card>
      </div>
    );
  };

  return (
    <ExamShell
      examTitle={examTitle}
      totalQuestions={questions.length}
      currentQuestion={layout === "Sequential" ? currentIndex + 1 : Math.min(answeredCount + 1, questions.length)}
      mode={deliveryMode}
      onModeChange={setDeliveryMode}
      isFlagged={isCurrentFlagged}
      onToggleFlag={handleToggleFlag}
      onSubmitExam={() => {
        setIsSubmitModalOpen(true);
      }}
      secondsRemaining={secondsRemaining}
      onTimerExpired={handleSubmitExam}
      autosaveStatus={autosaveStatus}
      answeredCount={answeredCount}
      onOpenQuestionGrid={() => setIsQuestionGridOpen(true)}
      showTimer={!isReviewContent}
      showSubmitExam={!isReviewContent && !isSubmitted}
      showFlag={layout === "Sequential" && !isReviewContent && !isSubmitted}
      modeBadge={deliveryMode === "Tutor" ? "Tutor Mode · Immediate Feedback" : undefined}
    >
      <div className="space-y-6">
        {/* Post-Submission Result Hero Banner */}
        {isSubmitted && submittedResult && (
          <div className="p-6 rounded-2xl border border-brand-teal/30 bg-surface shadow-md space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0",
                  submittedResult.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                )}>
                  {submittedResult.passed ? <Trophy className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-brand font-bold text-lg text-foreground">
                    {submittedResult.passed ? "Examination Passed!" : "Remediation Recommended"}
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Your attempt has been scored deterministically. Review clinical rationales below.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-brand font-extrabold text-foreground">
                    {submittedResult.scorePercentage}%
                  </div>
                  <div className="text-[11px] text-foreground-muted font-medium">
                    Passing: {submittedResult.passingScorePercentage}%
                  </div>
                </div>
                <Badge variant={submittedResult.passed ? "teal" : "destructive"} className="text-xs px-3 py-1">
                  {submittedResult.passed ? "Passed" : "Needs Review"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-foreground-secondary">
              <div className="p-3 rounded-xl bg-surface-muted border border-border/50">
                <span className="block text-[11px] text-foreground-muted">Total Questions</span>
                <span className="font-bold text-sm text-foreground">{submittedResult.totalQuestions}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-muted border border-border/50">
                <span className="block text-[11px] text-foreground-muted">Correct Answers</span>
                <span className="font-bold text-sm text-emerald-600">{submittedResult.correctQuestions}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-muted border border-border/50">
                <span className="block text-[11px] text-foreground-muted">Time Spent</span>
                <span className="font-bold text-sm text-foreground">
                  {Math.round(submittedResult.timeSpentSeconds / 60)} minutes
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-muted border border-border/50">
                <span className="block text-[11px] text-foreground-muted">Review Mode</span>
                <span className="font-bold text-sm text-brand-teal">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Review-mode study banner (no graded attempt) */}
        {isReviewContent && (
          <div className="p-4 rounded-2xl border border-brand-teal/30 bg-brand-teal/5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
            <div className="text-xs text-foreground-secondary space-y-1">
              <p className="font-brand font-bold text-sm text-foreground">
                {isPreview ? "Admin Preview — Content Validation" : "Review Mode — Study Session"}
              </p>
              <p>
                {isPreview
                  ? "Previewing every question with its approved answer keys and rationales. This preview does not create an attempt and never affects examination statistics."
                  : "Study each question with its approved correct answers and clinical rationales. This session is separate from any graded examination attempt and is not scored."}
              </p>
            </div>
          </div>
        )}

        {/* Layout selector — only when the exam permits both layouts */}
        {layoutPolicy === "Both" && !isSubmitted && !isReviewContent && (
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-1" role="group" aria-label="Navigation layout">
              <Button
                variant={layout === "Sequential" ? "primary" : "outline"}
                size="sm"
                className="text-xs gap-1.5"
                aria-pressed={layout === "Sequential"}
                onClick={() => void handleLayoutChange("Sequential")}
              >
                <Rows3 className="w-3.5 h-3.5" /> Sequential
              </Button>
              <Button
                variant={layout === "AllInOne" ? "primary" : "outline"}
                size="sm"
                className="text-xs gap-1.5"
                aria-pressed={layout === "AllInOne"}
                onClick={() => void handleLayoutChange("AllInOne")}
              >
                <LayoutList className="w-3.5 h-3.5" /> All-in-One
              </Button>
            </div>
            <span className="text-[11px] text-foreground-muted hidden sm:block">
              Switching layout never loses your answers.
            </span>
          </div>
        )}

        {/* Sequential View — one question at a time */}
        {layout === "Sequential" ? (
          <>
            {/* Question Header Bar */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  Item {currentIndex + 1} of {questions.length}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsQuestionGridOpen(true)}
                  className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Question List ({answeredCount}/{questions.length})</span>
                </button>
              </div>
            </div>

            {currentQ ? (
              renderQuestion(currentQ, currentIndex, true)
            ) : (
              <div className="p-12 text-center text-xs text-foreground-muted">
                No questions available for this session.
              </div>
            )}

            {/* Question Stepper Navigation Footer */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={async () => {
                  if (currentQ) await flushPendingAutosave(currentQ.id);
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }}
                className="text-xs gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Item
              </Button>

              <span className="text-xs font-medium text-foreground-muted">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <Button
                size="sm"
                disabled={currentIndex === questions.length - 1}
                onClick={async () => {
                  if (currentQ) await flushPendingAutosave(currentQ.id);
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                }}
                className="text-xs gap-1 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal"
              >
                Next Item <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          /* All-in-One View — continuous vertical scroll over the same attempt data */
          <>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Badge variant="outline" className="text-xs font-mono">
                All-in-One View · {questions.length} items
              </Badge>
              <button
                onClick={() => setIsQuestionGridOpen(true)}
                className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Question List ({answeredCount}/{questions.length})</span>
              </button>
            </div>
            <div className="space-y-6">
              {questions.map((q, idx) => renderQuestion(q, idx, false))}
            </div>
          </>
        )}
      </div>

      {/* Question Grid Modal / Drawer */}
      {isQuestionGridOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-brand font-bold text-base text-foreground">Examination Question Navigator</h3>
                <p className="text-xs text-foreground-secondary">
                  Jump directly to any item. Review answered and flagged items before submission.
                </p>
              </div>
              <button
                onClick={() => setIsQuestionGridOpen(false)}
                className="text-foreground-secondary hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-teal/20 border border-brand-teal" />
                <span>Answered ({answeredCount})</span>
              </span>
              <span className="flex-1 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-surface-muted border border-border" />
                <span>Unanswered ({unansweredCount})</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Flagged ({flaggedCount})</span>
              </span>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAns = Boolean(answers[q.id]);
                const isFlg = Boolean(flags[q.id]);
                const isCurr = layout === "Sequential" && idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setIsQuestionGridOpen(false);
                      if (layout === "AllInOne") {
                        setCurrentIndex(idx);
                        scrollToQuestion(q.id);
                      } else {
                        setCurrentIndex(idx);
                      }
                    }}
                    className={cn(
                      "h-10 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center border",
                      isAns
                        ? "bg-brand-teal/15 border-brand-teal text-brand-teal"
                        : "bg-surface-muted border-border text-foreground-secondary hover:bg-surface",
                      isCurr && "ring-2 ring-foreground",
                      isFlg && "border-amber-500 text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {idx + 1}
                    {isFlg && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button size="sm" onClick={() => setIsQuestionGridOpen(false)} className="text-xs">
                Resume
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-base text-foreground">Finish Examination?</h3>
                <p className="text-xs text-foreground-secondary">
                  Please review your submission status.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Total Questions:</span>
                <span className="font-bold text-foreground">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Answered:</span>
                <span className="font-bold text-emerald-600">{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between font-semibold text-rose-500">
                  <span>Unanswered:</span>
                  <span>{unansweredCount}</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-600 font-medium">
                  <span>Flagged for Review:</span>
                  <span>{flaggedCount}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-rose-500 font-medium">
                Warning: You have {unansweredCount} unanswered questions. Unanswered items will receive zero points.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-xs"
              >
                Return to Exam
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitExam}
                className="text-xs"
              >
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Selection Modal — shown before starting a fresh attempt */}
      {isLayoutModalOpen && examIdParam && !loadError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5">
            <div>
              <h3 className="font-brand font-bold text-base text-foreground">Choose your navigation layout</h3>
              <p className="text-xs text-foreground-secondary pt-1">
                Select how you want to move through this examination. Your choice is saved with the attempt.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void startFreshAttemptFromModal("Sequential")}
                className="w-full text-left p-4 rounded-xl border border-border bg-background hover:border-brand-teal/60 transition-colors space-y-1"
              >
                <div className="flex items-center gap-2 font-brand font-bold text-sm text-foreground">
                  <Rows3 className="w-4 h-4 text-brand-teal" /> Sequential
                  <Badge variant="outline" className="text-[10px]">Recommended</Badge>
                </div>
                <p className="text-xs text-foreground-secondary">One question at a time with Previous and Next controls.</p>
              </button>

              <button
                type="button"
                onClick={() => void startFreshAttemptFromModal("AllInOne")}
                className="w-full text-left p-4 rounded-xl border border-border bg-background hover:border-brand-teal/60 transition-colors space-y-1"
              >
                <div className="flex items-center gap-2 font-brand font-bold text-sm text-foreground">
                  <LayoutList className="w-4 h-4 text-brand-teal" /> All-in-One
                </div>
                <p className="text-xs text-foreground-secondary">All questions on one continuous scrolling page.</p>
              </button>
            </div>

            <div className="pt-1 text-[11px] text-foreground-muted text-center">
              {modeParam === "Tutor" ? "Tutor mode" : "Exam mode"} · {examTitle}
            </div>
          </div>
        </div>
      )}
    </ExamShell>
  );

  async function startFreshAttemptFromModal(chosenLayout: ExamLayout) {
    // Reuse the shared start routine for modal-initiated attempts.
    setIsLayoutModalOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("layout", chosenLayout);
    router.replace(url.toString());
  }
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading NURVIA examination session...</div>}>
      <ExamSessionContent />
    </Suspense>
  );
}
