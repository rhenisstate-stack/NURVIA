"use client";

import * as React from "react";
import Link from "next/link";
import { StudySetItem } from "@/lib/study-sets-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudySetPreviewModalProps {
  studySet: StudySetItem | null;
  onClose: () => void;
}

export function StudySetPreviewModal({ studySet, onClose }: StudySetPreviewModalProps) {
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);

  if (!studySet) return null;

  const previewQ = studySet.previewQuestion;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface text-foreground shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-surface-muted/40">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2">
              <Badge variant="teal">{studySet.category}</Badge>
              <Badge variant="outline">
                {studySet.examTrack} Â· {studySet.pathway}
              </Badge>
            </div>
            <h2 className="font-brand text-xl font-bold text-foreground">
              {studySet.title}
            </h2>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              {studySet.description}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-foreground-muted hover:text-foreground shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-background">
              <span className="text-foreground-muted block text-[11px]">Practice Focus</span>
              <strong className="text-foreground">{studySet.examTrack} Â· {studySet.pathway}</strong>
            </div>
            <div className="p-3 rounded-lg border border-border bg-background">
              <span className="text-foreground-muted block text-[11px]">Exam Format</span>
              <strong className="text-emerald-600 dark:text-emerald-400">NGN Clinical Items</strong>
            </div>
            <div className="p-3 rounded-lg border border-border bg-background col-span-2 sm:col-span-1">
              <span className="text-foreground-muted block text-[11px]">Rationales</span>
              <strong className="text-brand-teal">Included for every answer</strong>
            </div>
          </div>

          {/* Sample Question Section */}
          {previewQ ? (
            <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-background">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground-secondary pb-2 border-b border-border/60">
                <span className="flex items-center gap-1.5 text-brand-teal">
                  <Sparkles className="w-4 h-4" /> Sample Practice Question
                </span>
                <span className="text-[11px] text-foreground-muted">Interactive Demo</span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed pt-1">
                {previewQ.stem}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {previewQ.options.map((option, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrect = idx === previewQ.correctIndex;

                  let optClass = "border-border bg-surface hover:bg-surface-muted";
                  if (selectedIdx !== null) {
                    if (isSelected) {
                      optClass = isCorrect
                        ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100"
                        : "border-rose-400 bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100";
                    } else if (isCorrect) {
                      optClass = "border-emerald-500/60 bg-emerald-50/30 text-emerald-900";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIdx(idx)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-between",
                        optClass
                      )}
                    >
                      <span>{option}</span>
                      {selectedIdx !== null && isSelected && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Rationale */}
              {selectedIdx !== null && (
                <div className="p-3 rounded-lg bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground leading-relaxed animate-in fade-in">
                  <div className="font-bold text-brand-teal text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Clinical Rationale Breakdown
                  </div>
                  {previewQ.rationale}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-background text-xs text-foreground-secondary">
              <p>Full question bank with rationales available in the exam session.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-surface-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full sm:w-auto text-xs">
            Close Preview
          </Button>

          <Link href={`/exam-session?track=${studySet.pathway}&category=${studySet.examTrack}`} className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto text-xs h-9 px-5 gap-1.5">
              <span>Open Complete {studySet.title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
