"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Check, X } from "lucide-react";

export function TrueFalseRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  const selectedChoice = React.useMemo<string | null>(() => {
    if (!value) return null;
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.SelectedOptionId || parsed.value || null;
      }
      return value.replace(/^"(.*)"$/, "$1");
    } catch {
      return value;
    }
  }, [value]);

  const handleSelect = (choice: string) => {
    if (disabled) return;
    onChange?.(JSON.stringify({ value: choice }));
  };

  const trueOpt = question.options.find((o) => o.optionText.toLowerCase().includes("true")) || {
    id: "true",
    optionIndex: 1,
    optionText: "True",
  };
  const falseOpt = question.options.find((o) => o.optionText.toLowerCase().includes("false")) || {
    id: "false",
    optionIndex: 2,
    optionText: "False",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[trueOpt, falseOpt].map((opt) => {
        const isTrue = opt.optionText.toLowerCase().includes("true");
        const isSelected = selectedChoice === opt.id || selectedChoice === opt.optionText || opt.wasSelected === true;

        let borderClass = "border-border bg-background hover:bg-surface-muted text-foreground";

        if (isSelected) {
          borderClass = "border-brand-teal bg-brand-teal/10 text-foreground ring-2 ring-brand-teal";
        }

        if (isReview) {
          if (opt.isCorrect) {
            borderClass = "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500";
          } else if (isSelected && !opt.isCorrect) {
            borderClass = "border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500";
          }
        }

        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => handleSelect(opt.id)}
            className={cn(
              "p-6 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 font-brand font-bold text-lg",
              disabled && "cursor-default",
              borderClass
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-xl",
              isTrue ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}>
              {isTrue ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
            </div>
            <span>{opt.optionText}</span>
            {isReview && opt.isCorrect && (
              <span className="text-xs font-sans text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Correct Answer
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
