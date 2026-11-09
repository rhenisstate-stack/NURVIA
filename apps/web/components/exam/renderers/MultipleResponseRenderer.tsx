"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckSquare, Square, CheckCircle2, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MultipleResponseRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Parse current value: can be array of IDs or { SelectedOptionIds: [...] }
  const selectedIds = React.useMemo<string[]>(() => {
    if (!value) return [];
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.SelectedOptionIds || parsed.selectedOptionIds || [];
      }
      if (value.startsWith("[")) {
        return JSON.parse(value);
      }
      return [value];
    } catch {
      return [];
    }
  }, [value]);

  const handleToggle = (optId: string) => {
    if (disabled) return;
    const exists = selectedIds.includes(optId);
    const updated = exists ? selectedIds.filter((id) => id !== optId) : [...selectedIds, optId];
    const payload = JSON.stringify({ SelectedOptionIds: updated });
    onChange?.(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal bg-teal-500/10 border border-teal-500/20 px-3 py-2 rounded-lg">
        <Info className="w-4 h-4 shrink-0" />
        <span>Select All That Apply (SATA). One, multiple, or all options may be correct.</span>
      </div>

      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedIds.includes(opt.id) || opt.wasSelected === true;
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
                onClick={() => handleToggle(opt.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5",
                  disabled && "cursor-default",
                  borderClass
                )}
              >
                <span className="shrink-0 pt-0.5 text-foreground-secondary">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-brand-teal" />
                  ) : (
                    <Square className="w-5 h-5 text-foreground-muted" />
                  )}
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
                <div className="text-xs text-foreground-secondary ml-8 p-2 rounded-lg bg-surface-muted border border-border/50">
                  <span className="font-semibold text-foreground">Rationale: </span>
                  {opt.specificRationale}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
