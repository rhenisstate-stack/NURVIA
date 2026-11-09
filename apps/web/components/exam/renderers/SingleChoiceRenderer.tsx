"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function SingleChoiceRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Parse current value: can be number, string, or { SelectedOptionId: string }
  const selectedId = React.useMemo(() => {
    if (!value) return null;
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.SelectedOptionId || parsed.selectedOptionId || parsed.value || null;
      }
      return value.replace(/^"(.*)"$/, "$1");
    } catch {
      return value;
    }
  }, [value]);

  const handleSelect = (optId: string) => {
    if (disabled) return;
    const payload = JSON.stringify({ SelectedOptionId: optId });
    onChange?.(payload);
  };

  return (
    <div className="space-y-3">
      {question.options.map((opt, idx) => {
        const isSelected = selectedId === opt.id || opt.wasSelected === true;
        let borderClass = "border-border bg-background hover:bg-surface-muted text-foreground";

        if (isSelected) {
          borderClass = "border-brand-teal bg-teal-500/10 text-foreground ring-1 ring-brand-teal font-medium";
        }

        if (isReview) {
          if (opt.isCorrect) {
            borderClass = "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500 font-medium";
          } else if (isSelected && !opt.isCorrect) {
            borderClass = "border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500 font-medium";
          }
        }

        return (
          <div key={opt.id} className="space-y-1.5">
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(opt.id)}
              className={cn(
                "w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5",
                disabled && "cursor-default",
                borderClass
              )}
            >
              <span className="w-6 h-6 rounded-full border border-border bg-surface text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 leading-relaxed">{opt.optionText}</span>
              {isReview && (
                <span className="shrink-0 pt-0.5">
                  {opt.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : null}
                </span>
              )}
            </button>

            {isReview && opt.specificRationale && (
              <div className="text-xs text-foreground-secondary ml-10 p-2 rounded-lg bg-surface-muted border border-border/50">
                <span className="font-semibold text-foreground">Rationale: </span>
                {opt.specificRationale}
              </div>
            )}
          </div>
        );
      })}

      {isReview && question.generalRationale && (
        <div className="mt-4 p-4 rounded-xl border border-brand-teal/30 bg-teal-500/5 space-y-1 text-xs">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <span>Overall Clinical Rationale</span>
          </div>
          <p className="text-foreground leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
