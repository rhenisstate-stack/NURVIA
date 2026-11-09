"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ExtendedResponseRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  const essayText = React.useMemo(() => {
    if (!value) return "";
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.EssayResponse || parsed.essayResponse || parsed.value || "";
      }
      return value.replace(/^"(.*)"$/, "$1");
    } catch {
      return value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const val = e.target.value;
    onChange?.(JSON.stringify({ EssayResponse: val }));
  };

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-foreground-secondary">
        <span>Provide your clinical explanation using the SBAR framework:</span>
        <Badge variant="outline" className="text-[10px] font-mono">
          {wordCount} words (Minimum recommended: 30)
        </Badge>
      </div>

      <div className="space-y-2">
        <textarea
          rows={6}
          disabled={disabled}
          value={essayText}
          onChange={handleChange}
          placeholder="Situation, Background, Assessment, and Recommendation (SBAR)..."
          className="w-full p-4 rounded-xl border border-border bg-background text-sm leading-relaxed focus:outline-brand-teal focus:ring-1 focus:ring-brand-teal text-foreground"
        />
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Exemplary SBAR Clinical Response</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
