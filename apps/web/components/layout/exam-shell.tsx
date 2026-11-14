"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Clock,
  Pause,
  Play,
  Bookmark,
  Calculator,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Stethoscope,
  Info,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamShellProps {
  children: React.ReactNode;
  examTitle?: string;
  totalQuestions?: number;
  currentQuestion?: number;
  mode?: "Review" | "Exam" | "Tutor";
  onModeChange?: (mode: "Review" | "Exam" | "Tutor") => void;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
  onSubmitExam?: () => void;
  secondsRemaining?: number;
  onTimerExpired?: () => void;
  autosaveStatus?: "saving" | "saved" | "idle" | "error";
  onRetrySave?: () => void;
  onOpenQuestionGrid?: () => void;
  answeredCount?: number;
  showTimer?: boolean;
  showSubmitExam?: boolean;
  showFlag?: boolean;
  modeBadge?: string;
}

export function ExamShell({
  children,
  examTitle = "ATI RN Adult Medical-Surgical Practice Exam",
  totalQuestions = 60,
  currentQuestion = 14,
  mode = "Review",
  onModeChange,
  isFlagged = false,
  onToggleFlag,
  onSubmitExam,
  secondsRemaining: propSecondsRemaining,
  onTimerExpired,
  autosaveStatus = "idle",
  onRetrySave,
  onOpenQuestionGrid,
  answeredCount,
  showTimer = true,
  showSubmitExam = true,
  showFlag = true,
  modeBadge,
}: ExamShellProps) {
  // Authoritative countdown timer
  const [internalSeconds, setInternalSeconds] = React.useState(propSecondsRemaining ?? 5420);
  const [isPaused, setIsPaused] = React.useState(false);
  const [showCalculator, setShowCalculator] = React.useState(false);

  React.useEffect(() => {
    if (propSecondsRemaining !== undefined) {
      setInternalSeconds(propSecondsRemaining);
    }
  }, [propSecondsRemaining]);

  React.useEffect(() => {
    if (isPaused || !showTimer) return;
    const interval = setInterval(() => {
      setInternalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimerExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, onTimerExpired, showTimer]);

  const secondsRemaining = internalSeconds;

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const progressPct = totalQuestions > 0
    ? Math.min(100, Math.max(0, (currentQuestion / totalQuestions) * 100))
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Focused Exam Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left: Brand & Exam Title */}
          <div className="flex items-center gap-4 min-w-0">
            <Logo size="sm" variant="symbol" href="/learner" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate max-w-[240px] sm:max-w-md">
                {examTitle}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-foreground-secondary">
                <span>
                  Question <strong>{currentQuestion}</strong> of {totalQuestions}
                </span>
                <span className="text-border">•</span>
                <Badge variant={mode === "Review" ? "teal" : mode === "Exam" ? "destructive" : "info"} className="text-[10px] py-0 px-2">
                  {modeBadge || `${mode} Mode`}
                </Badge>
              </div>
            </div>
          </div>

          {/* Center: Question Progress */}
          <div className="hidden md:flex flex-col items-center w-64 max-w-xs">
            <div className="w-full flex justify-between text-[11px] text-foreground-muted mb-1 font-medium">
              <span>Progress</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden border border-border/60">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Right: Timer, Calculator, Flag & Submission */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer */}
            {showTimer && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-muted border border-border font-mono text-xs font-bold text-foreground">
              <Clock className="w-3.5 h-3.5 text-brand-teal" />
              <span>{formatTime(secondsRemaining)}</span>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="ml-1 p-0.5 hover:text-primary transition-colors"
                title={isPaused ? "Resume exam" : "Pause exam"}
                aria-label="Pause or Resume Timer"
              >
                {isPaused ? <Play className="w-3 h-3 text-emerald-600" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>
            )}

            {/* Autosave Indicator */}
            {autosaveStatus !== "idle" && (
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium">
                {autosaveStatus === "saving" && (
                  <span className="flex items-center gap-1 text-amber-500 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Saving...
                  </span>
                )}
                {autosaveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved
                  </span>
                )}
                {autosaveStatus === "error" && (
                  <button
                    type="button"
                    onClick={onRetrySave}
                    className="flex items-center gap-1 text-rose-500 hover:text-rose-600 underline underline-offset-2"
                    title="Retry saving your latest answer"
                    aria-label="Retry saving your latest answer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Save failed — retry
                  </button>
                )}
              </div>
            )}

            {/* Question Grid Drawer Trigger */}
            {onOpenQuestionGrid && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenQuestionGrid}
                className="text-xs h-8 px-2 sm:px-3 text-foreground"
                title="Open Question Grid"
              >
                <FileText className="w-3.5 h-3.5 sm:mr-1 text-brand-teal" />
                <span className="hidden sm:inline">
                  Grid{answeredCount !== undefined ? ` (${answeredCount}/${totalQuestions})` : ""}
                </span>
              </Button>
            )}

            {/* Dosage Calculator Launcher */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalculator(!showCalculator)}
              className={cn("text-xs h-8 px-2 sm:px-3", showCalculator && "border-brand-teal text-brand-teal")}
              title="Dosage Calculator"
            >
              <Calculator className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Calc</span>
            </Button>

            {/* Flag for Review */}
            {showFlag && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFlag}
              className={cn("text-xs h-8 px-2 sm:px-3", isFlagged && "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold")}
              title="Flag question for review"
            >
              <Bookmark className={cn("w-3.5 h-3.5 sm:mr-1", isFlagged && "fill-amber-500")} />
              <span className="hidden sm:inline">{isFlagged ? "Flagged" : "Flag"}</span>
            </Button>
            )}

            <ThemeToggle />

            {/* Exit / Submit */}
            <Link href="/learner">
              <Button variant="ghost" size="sm" className="text-xs h-8 text-foreground-secondary hover:text-foreground">
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span className="hidden md:inline">Exit</span>
              </Button>
            </Link>

            {showSubmitExam && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmitExam}
              className="text-xs h-8 px-3"
            >
              Finish Exam
            </Button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Interactive Dosage Calculator Widget */}
      {showCalculator && (
        <div className="fixed top-16 right-6 z-50 w-72 rounded-xl border border-border bg-surface shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-brand font-bold text-xs flex items-center gap-1.5 text-foreground">
              <Calculator className="w-4 h-4 text-brand-teal" /> Nursing Dosage Calculator
            </span>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-foreground-secondary hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary">Desired Dose (D)</label>
              <input
                type="number"
                placeholder="e.g. 500 mg"
                className="w-full h-8 px-2 rounded border border-border bg-background text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary">Dose on Hand (H)</label>
              <input
                type="number"
                placeholder="e.g. 250 mg"
                className="w-full h-8 px-2 rounded border border-border bg-background text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary">Vehicle / Quantity (V)</label>
              <input
                type="number"
                placeholder="e.g. 1 tab or 5 mL"
                className="w-full h-8 px-2 rounded border border-border bg-background text-xs"
              />
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-bold text-xs text-brand-teal">
              <span>Formula: (D / H) × V</span>
              <span>Result: 2.0 tabs</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Examination Canvas */}
      <main className="flex-1 mx-auto max-w-5xl w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
