"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MultipleImageSelectionRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Canonical response contract: {"SelectedOptionIds": ["<id>", ...]} — an array of
  // selected option identifiers, consumed verbatim by QuestionResponseGrader.
  // Legacy scalar payloads ({"SelectedOptionId": "<id>"}) persisted by earlier
  // renderer versions are restored as a one-element selection for in-flight attempts.
  const selectedIds = React.useMemo<string[]>(() => {
    if (!value) return [];
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        const list = parsed.SelectedOptionIds ?? parsed.selectedOptionIds;
        if (Array.isArray(list)) {
          return list.filter((v: unknown): v is string => typeof v === "string");
        }
        if (typeof parsed.SelectedOptionId === "string") return [parsed.SelectedOptionId];
        if (typeof parsed.selectedOptionId === "string") return [parsed.selectedOptionId];
        return [];
      }
      const bare = value.replace(/^"(.*)"$/, "$1");
      return bare ? [bare] : [];
    } catch {
      return [];
    }
  }, [value]);

  const handleToggle = (id: string) => {
    if (disabled) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter((selected) => selected !== id)
      : [...selectedIds, id];
    onChange?.(JSON.stringify({ SelectedOptionIds: next }));
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-foreground-secondary">
        Examine each visual tracing or clinical strip below and select all panels that apply:
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedIds.includes(opt.id) || opt.wasSelected === true;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => handleToggle(opt.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all space-y-3 flex flex-col justify-between",
                isSelected
                  ? "border-brand-teal bg-brand-teal/10 ring-2 ring-brand-teal"
                  : "border-border bg-background hover:bg-surface-muted"
              )}
            >
              {/* Simulated ECG / Visual Strip Panel */}
              <div className="w-full h-24 rounded-lg bg-surface-muted border border-border flex items-center justify-center p-3 relative overflow-hidden">
                <Activity className="w-12 h-12 text-brand-teal/40" />
                <Badge variant="outline" className="absolute top-2 left-2 text-[10px] bg-surface">
                  Panel {String.fromCharCode(65 + idx)}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs w-full">
                <span className="font-medium text-foreground">{opt.optionText}</span>
                {isReview && opt.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Visual Analysis & Diagnostic Findings</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
