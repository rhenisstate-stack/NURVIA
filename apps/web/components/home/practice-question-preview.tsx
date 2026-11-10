"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HeartPulse,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { heroPracticeQuestions, SampleQuestion } from "@/lib/study-sets-data";

export function PracticeQuestionPreview() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number>>({});
  const [showRationale, setShowRationale] = React.useState(true);
  const [seconds, setSeconds] = React.useState(18); // matches the approved reference's 0:18 start
  const [isTimerRunning, setIsTimerRunning] = React.useState(true);
  const [completed, setCompleted] = React.useState(false);

  const currentQ: SampleQuestion = heroPracticeQuestions[currentIndex];
  const selectedOptionIndex = selectedAnswers[currentIndex];
  const hasSelected = selectedOptionIndex !== undefined;

  // Real countdown timer
  React.useEffect(() => {
    if (!isTimerRunning || completed) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, completed]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleSelectOption = (index: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: index,
    }));
  };

  const handleNext = () => {
    if (currentIndex < heroPracticeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
      setIsTimerRunning(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCompleted(false);
    setSeconds(18);
    setIsTimerRunning(true);
  };

  // Keyboard accessibility: 1, 2, 3, 4 or A, B, C, D.
  // Skip while the user is typing elsewhere on the page (e.g. the study-set
  // search field) so typing "a"–"d" outside the card never changes a selection.
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toUpperCase();
      if (key === "1" || key === "A") handleSelectOption(0);
      if (key === "2" || key === "B") handleSelectOption(1);
      if (key === "3" || key === "C") handleSelectOption(2);
      if (key === "4" || key === "D") handleSelectOption(3);
      if (key === "ARROWLEFT" && currentIndex > 0) handleBack();
      if (key === "ARROWRIGHT" && hasSelected) handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, hasSelected, completed]);

  // Calculate score if completed
  const correctCount = heroPracticeQuestions.reduce((acc, q, idx) => {
    const chosen = selectedAnswers[idx];
    if (chosen !== undefined && q.options[chosen]?.isCorrect) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <section
      aria-label="Quick Practice"
      data-testid="hero-quick-practice"
      className="relative rounded-lg border border-border/80 bg-surface shadow-lg shadow-slate-900/10 overflow-hidden transition-all duration-200 dark:bg-surface"
    >
      {/* Reference-matched accent strip hugging the top-left edge of the card */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-teal from-45% via-brand-teal/25 to-transparent"
      />
      <div className="p-5 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-teal text-white flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                QUICK PRACTICE
              </span>
              <span className="text-xs text-foreground-muted block">
                Question {currentIndex + 1} of {heroPracticeQuestions.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            title={isTimerRunning ? "Click to pause timer" : "Click to resume timer"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-muted border border-border text-foreground-secondary text-xs font-mono font-medium hover:border-brand-teal/50 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-foreground-muted" />
            <span>{formatTimer(seconds)}</span>
          </button>
        </div>

        {/* Eyebrow tags */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal dark:text-teal-300 border border-brand-teal/25 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            {currentQ.modeBadge}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-foreground-secondary border border-border text-[11px] font-semibold uppercase tracking-wider">
            {currentQ.topic}
          </span>
        </div>
      </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {!completed ? (
            <>
              {/* Question Text */}
              <p className="font-ui text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                {currentQ.stem}
              </p>

              {/* Options List */}
              <div
                role="radiogroup"
                aria-label={`Question ${currentQ.questionNumber}`}
                className="space-y-2.5"
              >
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isCorrect = opt.isCorrect;

                  let optionStyle =
                    "border-border bg-background hover:border-brand-teal/50 hover:bg-surface-muted/60 text-foreground";
                  let badgeStyle =
                    "border-border bg-surface text-foreground-secondary";

                  if (hasSelected) {
                    if (isSelected) {
                      if (isCorrect) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/25 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500";
                        badgeStyle = "bg-emerald-500 text-white border-emerald-500";
                      } else {
                        optionStyle =
                          "border-rose-400 bg-rose-50/70 dark:bg-rose-950/25 text-rose-950 dark:text-rose-100 ring-1 ring-rose-400";
                        badgeStyle = "bg-rose-500 text-white border-rose-500";
                      }
                    } else if (isCorrect) {
                      optionStyle =
                        "border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/15 text-emerald-900 dark:text-emerald-200";
                      badgeStyle = "border-emerald-500 text-emerald-600 dark:text-emerald-400";
                    }
                  }

                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(idx)}
                      className={cn(
                        "w-full text-left p-3.5 sm:p-4 rounded-lg border transition-all flex items-start gap-3.5 group focus:outline-none focus:ring-2 focus:ring-brand-teal/70",
                        optionStyle
                      )}
                    >
                      <span
                        className={cn(
                          "w-7 h-7 shrink-0 rounded-full border text-xs font-bold flex items-center justify-center transition-colors font-mono",
                          badgeStyle
                        )}
                      >
                        {opt.letter}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-snug flex-1 pt-0.5">
                        {opt.text}
                      </span>
                      {hasSelected && isSelected && (
                        <span className="shrink-0 pt-0.5">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Educational Rationale Box (Revealed on selection) */}
              {hasSelected && showRationale && (
                <div
                  className={cn(
                    "p-4 rounded-xl border text-xs leading-relaxed space-y-2 animate-in fade-in duration-200",
                    currentQ.options[selectedOptionIndex]?.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-surface-muted border-border text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-brand-teal dark:text-teal-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Clinical Reasoning & Rationale</span>
                  </div>
                  <p>{currentQ.rationale}</p>
                  <p className="text-foreground-secondary pt-1 border-t border-border/50 text-[11px] italic">
                    💡 {currentQ.clinicalTip}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Completed Preview Summary */
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-brand text-lg font-bold text-foreground">
                  Quick Practice Completed!
                </h3>
                <p className="text-xs text-foreground-secondary">
                  You scored <strong>{correctCount} of {heroPracticeQuestions.length}</strong> correct on high-yield ATI/HESI sample vignettes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs text-foreground-secondary text-left space-y-1">
                <div className="font-semibold text-foreground">Next Step for Readiness:</div>
                <p>
                  Continue your structured preparation in our full interactive exam engine with NGN unfolding case studies, detailed performance tracking, and spaced review.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <Link href="/exam-session" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto text-xs h-9">
                    Launch Full Practice Exam
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestart}
                  className="w-full sm:w-auto text-xs h-9 gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Questions Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer matching screenshot */}
        {!completed && (
          <div className="px-5 sm:px-6 py-4 bg-surface-muted/50 border-t border-border/60 flex items-center justify-between">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              disabled={currentIndex === 0}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold transition-colors",
                currentIndex === 0
                  ? "text-foreground-muted cursor-not-allowed opacity-50"
                  : "text-foreground-secondary hover:text-foreground"
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Pagination Dots (active dot per the reference) */}
            <div className="flex items-center gap-1.5" aria-label="Question progress">
              {heroPracticeQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to question ${idx + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-200",
                    currentIndex === idx
                      ? "w-6 bg-brand-teal"
                      : "w-2 bg-border-strong hover:bg-foreground-muted"
                  )}
                />
              ))}
            </div>

            {/* Continue Button */}
            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs font-semibold h-8 px-4 gap-1 rounded-full bg-brand-teal hover:bg-brand-tealDark text-white"
            >
              <span>{currentIndex === heroPracticeQuestions.length - 1 ? "Finish" : "Keep Going"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
        )}
    </section>
  );
}
