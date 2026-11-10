"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function MatrixGridRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Map rowId -> selectedColumnKey (e.g. "Indicated" | "Contraindicated" | "NonEssential")
  const selections = React.useMemo<Record<string, string>>(() => {
    if (!value) return {};
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.MatrixSelections || parsed.matrixSelections || {};
      }
      return {};
    } catch {
      return {};
    }
  }, [value]);

  const columns = ["Indicated", "Non-Essential", "Contraindicated"];

  const handleSelect = (rowId: string, col: string) => {
    if (disabled) return;
    const updated = { ...selections, [rowId]: col };
    onChange?.(JSON.stringify({ MatrixSelections: updated }));
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-foreground-secondary">
        For each clinical action or finding below, select whether it is Indicated, Non-Essential, or Contraindicated:
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-foreground font-semibold">
                <th className="p-3 text-left w-1/2">Clinical Action / Intervention</th>
                {columns.map((c) => (
                  <th key={c} className="p-3 text-center whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {question.options.map((opt) => {
                const selectedCol = selections[opt.id] || "";
                return (
                  <tr key={opt.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-3 text-foreground font-medium">{opt.optionText}</td>
                    {columns.map((col) => {
                      const isChecked = selectedCol === col;
                      return (
                        <td key={col} className="p-3 text-center">
                          <input
                            type="radio"
                            name={`matrix-${opt.id}`}
                            disabled={disabled}
                            checked={isChecked}
                            onChange={() => handleSelect(opt.id, col)}
                            className="w-4 h-4 text-brand-teal focus:ring-brand-teal cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Matrix Evaluation Rationale</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
