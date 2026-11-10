"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function MatchingRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Pairs: map premiseId -> responseId
  const pairs = React.useMemo<Record<string, string>>(() => {
    if (!value) return {};
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.Pairs || parsed.pairs || {};
      }
      return {};
    } catch {
      return {};
    }
  }, [value]);

  const handlePair = (premiseId: string, responseId: string) => {
    if (disabled) return;
    const updated = { ...pairs, [premiseId]: responseId };
    onChange?.(JSON.stringify({ Pairs: updated }));
  };

  // Half the options can be premises, half can be responses, or contentJsonData can specify them
  const options = question.options;
  const premises = options.filter((_, idx) => idx % 2 === 0);
  const responses = options.filter((_, idx) => idx % 2 === 1);

  return (
    <div className="space-y-4">
      <div className="text-xs text-foreground-secondary">
        Match each clinical item on the left with its corresponding response on the right:
      </div>

      <div className="space-y-3">
        {premises.map((p, idx) => {
          const matchedResponseId = pairs[p.id] || "";
          return (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-background"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-6 h-6 rounded-md bg-brand-teal/10 text-brand-teal font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{p.optionText}</span>
              </div>

              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-foreground-muted hidden sm:block shrink-0" />
                <select
                  disabled={disabled}
                  value={matchedResponseId}
                  onChange={(e) => handlePair(p.id, e.target.value)}
                  className="h-10 px-3 rounded-lg border border-border bg-surface text-xs font-medium text-foreground focus:outline-brand-teal min-w-[200px]"
                >
                  <option value="">-- Select Match --</option>
                  {responses.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.optionText}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Matching Solution & Clinical Analysis</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
