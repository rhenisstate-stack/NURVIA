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
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  FileText,
  Activity,
  ClipboardList,
  Sparkles,
  Lightbulb,
  Check,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nurviaApi } from "@/lib/api-client";
import {
  ActiveExamQuestionDto,
  StartAttemptResultDto,
  SubmittedExamResultDto,
  ReviewQuestionDto,
} from "@/lib/api-types";
import { QuestionRendererRegistry, RendererQuestion } from "@/components/exam/renderers";
import { useAuth } from "@/components/auth/auth-provider";

function ExamSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status, user } = useAuth();

  const attemptIdParam = searchParams?.get("attemptId");
  const examIdParam = searchParams?.get("examId");
  const modeParam = searchParams?.get("mode") as "Review" | "Exam" | "Tutor" | null;

  // Session state
  const [attemptId, setAttemptId] = React.useState<string | null>(attemptIdParam);
  const [examTitle, setExamTitle] = React.useState<string>("NURVIA examination");
  const [questions, setQuestions] = React.useState<RendererQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [flags, setFlags] = React.useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(5400); // 90 min default
  const [deliveryMode, setDeliveryMode] = React.useState<"Review" | "Exam" | "Tutor">(modeParam || "Exam");
  const [autosaveStatus, setAutosaveStatus] = React.useState<"saving" | "saved" | "idle" | "error">("idle");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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

  // 1. Initialize attempt from API
  React.useEffect(() => {
    async function loadAttempt() {
      if (attemptIdParam) {
        setIsLoading(true);
        setLoadError(null);
        if (modeParam === "Review") {
          const reviewRes = await nurviaApi.getAttemptReview(attemptIdParam);
          if (reviewRes.success && reviewRes.data) {
            hydrateFromReview(reviewRes.data);
            setIsLoading(false);
            return;
          }
        }

        const res = await nurviaApi.getActiveAttempt(attemptIdParam);
        if (res.success && res.data) {
          hydrateFromAttempt(res.data);
        } else {
          // Attempt may already be submitted, try loading completed review
          const reviewRes = await nurviaApi.getAttemptReview(attemptIdParam);
          if (reviewRes.success && reviewRes.data) {
            hydrateFromReview(reviewRes.data);
          } else {
            setLoadError(reviewRes.message || res.message || "Unable to load this exam attempt.");
          }
        }
        setIsLoading(false);
      } else if (examIdParam) {
        setIsLoading(true);
        setLoadError(null);
        const res = await nurviaApi.startAttempt(examIdParam);
        if (res.success && res.data) {
          setAttemptId(res.data.attemptId);
          hydrateFromAttempt(res.data);
        } else {
          setLoadError(res.message || "Unable to start this exam. Please choose another published exam.");
        }
        setIsLoading(false);
      } else {
        setLoadError("Choose a published exam before opening an exam session.");
      }
    }

    loadAttempt();
  }, [attemptIdParam, examIdParam, modeParam]);

  // Cancel pending autosaves when the exam session is unmounted.
  React.useEffect(() => {
    const timeouts = autosaveTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

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

    if (data.questions && data.questions.length > 0) {
      const mapped: RendererQuestion[] = data.questions.map((q) => ({
        id: q.id,
        orderIndex: q.orderIndex,
        stem: q.stem,
        questionType: q.questionType,
        cognitiveSkill: q.cognitiveSkill,
        clientNeedCategory: q.clientNeedCategory,
        contentJsonData: q.contentJsonData,
        options: q.options.map((o) => ({
          id: o.id,
          optionIndex: o.optionIndex,
          optionText: o.optionText,
          displayOrder: o.displayOrder,
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
  const persistResponse = async (questionId: string, payloadJson: string | null, isFlagged: boolean) => {
    if (!attemptId) return;
    try {
      const res = await nurviaApi.autosaveResponse(attemptId, {
        questionId,
        responseJson: payloadJson,
        isFlagged,
      });
      setAutosaveStatus(res.success ? "saved" : "error");
    } catch {
      setAutosaveStatus("error");
    }
  };

  // Immediately persists a debounced-but-unsaved response (used before
  // navigating to another question or opening the submit dialog).
  const flushPendingAutosave = (questionId: string) => {
    const pending = autosaveTimeoutsRef.current[questionId];
    if (pending) {
      clearTimeout(pending);
      autosaveTimeoutsRef.current[questionId] = null;
      void persistResponse(questionId, answers[questionId] ?? null, flags[questionId] || false);
    }
  };

  const handleAnswerChange = (questionId: string, payloadJson: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: payloadJson }));

    if (!attemptId) return;

    setAutosaveStatus("saving");
    if (autosaveTimeoutsRef.current[questionId]) clearTimeout(autosaveTimeoutsRef.current[questionId]);

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

  if (status !== "authenticated" ||
      (user?.role !== "Learner" && user?.role !== "Superadmin")) {
    return <main className="flex min-h-screen items-center justify-center px-6 text-sm text-foreground-secondary" aria-live="polite">Checking your learner accessâ€¦</main>;
  }

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center px-6 text-sm text-foreground-secondary" aria-live="polite">Loading your saved examinationâ€¦</main>;
  }

  if (loadError && !attemptId && !questions.length) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-brand text-2xl font-bold text-foreground">No exam session available</h1>
        <p role="alert" className="text-sm text-foreground-secondary">{loadError}</p>
        <Link href="/learner/exams"><Button>Choose a published exam</Button></Link>
      </main>
    );
  }

  return (
    <ExamShell
      examTitle={examTitle}
      totalQuestions={questions.length}
      currentQuestion={currentIndex + 1}
      mode={deliveryMode}
      onModeChange={setDeliveryMode}
      isFlagged={isCurrentFlagged}
      onToggleFlag={handleToggleFlag}
      onSubmitExam={() => {
        // Persist every debounced-but-unsaved response before reviewing
        // the submission status.
        Object.keys(autosaveTimeoutsRef.current).forEach((qid) => flushPendingAutosave(qid));
        setIsSubmitModalOpen(true);
      }}
      secondsRemaining={secondsRemaining}
      onTimerExpired={handleSubmitExam}
      autosaveStatus={autosaveStatus}
      answeredCount={answeredCount}
      onOpenQuestionGrid={() => setIsQuestionGridOpen(true)}
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

        {/* Question Header Bar */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              Item {currentIndex + 1} of {questions.length}
            </Badge>
            {isCurrentFlagged && (
              <Badge variant="destructive" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                <Bookmark className="w-3 h-3 mr-1 fill-amber-500" /> Flagged
              </Badge>
            )}
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

        {/* Question Stem & Active Renderer Canvas */}
        {currentQ ? (
          <Card className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span className="font-semibold text-brand-teal">
                  Canonical Type: {String(currentQ.questionType)}
                </span>
                {currentQ.cognitiveSkill && (
                  <Badge variant="outline" className="text-[10px]">
                    <Sparkles className="w-3 h-3 mr-1 text-brand-teal" />
                    {String(currentQ.cognitiveSkill)}
                  </Badge>
                )}
              </div>

              <h2 className="font-brand text-base sm:text-lg font-bold text-foreground leading-relaxed">
                {currentQ.stem}
              </h2>
            </div>

            {/* Modular Renderer Registry */}
            <div className="pt-2">
              <QuestionRendererRegistry
                question={currentQ}
                value={currentAnswer}
                onChange={(val) => handleAnswerChange(currentQ.id, val)}
                disabled={isSubmitted}
                isReview={isSubmitted || deliveryMode === "Review"}
              />
            </div>
          </Card>
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
            onClick={() => {
              if (currentQ) flushPendingAutosave(currentQ.id);
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
            onClick={() => {
              if (currentQ) flushPendingAutosave(currentQ.id);
              setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
            }}
            className="text-xs gap-1 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal"
          >
            Next Item <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
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
                âœ•
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
                const isCurr = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsQuestionGridOpen(false);
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
                Resume Exam
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
    </ExamShell>
  );
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading NURVIA examination session...</div>}>
      <ExamSessionContent />
    </Suspense>
  );
}
