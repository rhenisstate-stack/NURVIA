"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DragAndDropRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Classification: map item id -> "BucketA" | "BucketB"
  const classifications = React.useMemo<Record<string, string>>(() => {
    if (!value) return {};
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.Buckets || parsed.buckets || {};
      }
      return {};
    } catch {
      return {};
    }
  }, [value]);

  const bucketA = "Category A (Indicated / Signs)";
  const bucketB = "Category B (Contraindicated / Adverse)";

  const handleAssign = (itemId: string, bucket: string) => {
    if (disabled) return;
    const current = classifications[itemId];
    const updated = { ...classifications, [itemId]: current === bucket ? "" : bucket };
    onChange?.(JSON.stringify({ Buckets: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-foreground-secondary">
        Classify each clinical finding or nursing action into the appropriate category bucket:
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bucket A */}
        <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/5 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-brand-teal/20">
            <span className="font-brand font-bold text-xs text-brand-teal uppercase tracking-wide">
              {bucketA}
            </span>
          </div>
          <div className="space-y-2 min-h-[120px]">
            {question.options.map((opt) => {
              const inBucketA = classifications[opt.id] === "A";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleAssign(opt.id, "A")}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between",
                    inBucketA
                      ? "border-brand-teal bg-brand-teal text-white font-semibold shadow-xs"
                      : "border-border bg-background hover:bg-surface-muted text-foreground-secondary"
                  )}
                >
                  <span>{opt.optionText}</span>
                  <span className="text-[10px] opacity-80">{inBucketA ? "Added" : "+ Add"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bucket B */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <span className="font-brand font-bold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              {bucketB}
            </span>
          </div>
          <div className="space-y-2 min-h-[120px]">
            {question.options.map((opt) => {
              const inBucketB = classifications[opt.id] === "B";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleAssign(opt.id, "B")}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between",
                    inBucketB
                      ? "border-amber-500 bg-amber-600 text-white font-semibold shadow-xs"
                      : "border-border bg-background hover:bg-surface-muted text-foreground-secondary"
                  )}
                >
                  <span>{opt.optionText}</span>
                  <span className="text-[10px] opacity-80">{inBucketB ? "Added" : "+ Add"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Classification Rationale</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
