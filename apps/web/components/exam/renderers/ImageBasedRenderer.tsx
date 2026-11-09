"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ImageBasedRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  const selectedOptionId = React.useMemo(() => {
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

  const handleSelect = (id: string) => {
    if (disabled) return;
    onChange?.(JSON.stringify({ SelectedOptionId: id }));
  };

  return (
    <div className="space-y-4">
      {/* Exhibit Image Container / Anatomical Simulator */}
      <div className="relative rounded-2xl border border-border bg-surface-muted/60 p-6 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
        <div className="w-full max-w-md h-48 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 text-foreground-muted bg-surface/50">
          <ImageIcon className="w-10 h-10 text-brand-teal/60" />
          <span className="text-xs font-semibold text-foreground">
            Clinical Diagnostic Exhibit / Anatomical Target
          </span>
          <span className="text-[11px] text-foreground-secondary">
            Select the designated quadrant or site corresponding to the client assessment
          </span>
        </div>
      </div>

      <div className="text-xs text-foreground-secondary">
        Select the appropriate anatomical target or clinical option:
      </div>

      {/* Target Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id || opt.wasSelected === true;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(opt.id)}
              className={cn(
                "p-3.5 rounded-xl border text-left text-xs transition-all flex items-center gap-3",
                isSelected
                  ? "border-brand-teal bg-teal-500/10 text-foreground font-semibold ring-1 ring-brand-teal"
                  : "border-border bg-background hover:bg-surface-muted text-foreground-secondary"
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-foreground">
                <MapPin className={cn("w-4 h-4", isSelected ? "text-brand-teal" : "text-foreground-muted")} />
              </div>
              <span className="flex-1 leading-snug">{opt.optionText}</span>
              {isReview && opt.isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Anatomical / Exhibit Rationale</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
