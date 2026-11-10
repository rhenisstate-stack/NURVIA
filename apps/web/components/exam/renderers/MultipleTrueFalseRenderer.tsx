"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function MultipleTrueFalseRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Map optionId -> "True" | "False"
  const selections = React.useMemo<Record<string, string>>(() => {
    if (!value) return {};
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.TrueFalseMap || parsed.trueFalseMap || {};
      }
      return {};
    } catch {
      return {};
    }
  }, [value]);

  const handleSelect = (optId: string, choice: "True" | "False") => {
    if (disabled) return;
    const updated = { ...selections, [optId]: choice };
    onChange?.(JSON.stringify({ TrueFalseMap: updated }));
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-foreground-secondary">
        Evaluate each clinical statement below and determine whether it is True or False:
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-background">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-muted border-b border-border text-foreground font-semibold">
              <th className="p-3 text-left w-3/4">Clinical Statement / Assessment Finding</th>
              <th className="p-3 text-center w-24">True</th>
              <th className="p-3 text-center w-24">False</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {question.options.map((opt) => {
              const selectedVal = selections[opt.id] || "";
              return (
                <tr key={opt.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-3 text-foreground font-medium">{opt.optionText}</td>
                  <td className="p-3 text-center">
                    <input
                      type="radio"
                      name={`mtf-${opt.id}`}
                      disabled={disabled}
                      checked={selectedVal === "True"}
                      onChange={() => handleSelect(opt.id, "True")}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="radio"
                      name={`mtf-${opt.id}`}
                      disabled={disabled}
                      checked={selectedVal === "False"}
                      onChange={() => handleSelect(opt.id, "False")}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Clinical Judgment Rationale</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
