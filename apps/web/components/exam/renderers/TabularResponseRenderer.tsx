"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TabularResponseRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Selected finding ID
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
      <div className="flex items-center justify-between text-xs text-foreground-secondary">
        <span>Review the trended electronic health record vitals and laboratory values across time points:</span>
        <Badge variant="teal" className="text-[10px]">
          <TrendingUp className="w-3 h-3 mr-1" /> Trend Analysis
        </Badge>
      </div>

      {/* Clinical Trend Data Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-background">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-muted border-b border-border text-foreground font-semibold">
              <th className="p-3 text-left">Clinical Parameter</th>
              <th className="p-3 text-center">Admission (00:00)</th>
              <th className="p-3 text-center">+2 Hours (02:00)</th>
              <th className="p-3 text-center">+4 Hours (04:00)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground-secondary font-mono">
            <tr>
              <td className="p-3 text-foreground font-medium font-sans">Heart Rate (bpm)</td>
              <td className="p-3 text-center">88</td>
              <td className="p-3 text-center">104</td>
              <td className="p-3 text-center font-bold text-rose-500">128</td>
            </tr>
            <tr>
              <td className="p-3 text-foreground font-medium font-sans">Blood Pressure (mmHg)</td>
              <td className="p-3 text-center">122/78</td>
              <td className="p-3 text-center">108/64</td>
              <td className="p-3 text-center font-bold text-rose-500">86/48</td>
            </tr>
            <tr>
              <td className="p-3 text-foreground font-medium font-sans">Respiratory Rate (/min)</td>
              <td className="p-3 text-center">18</td>
              <td className="p-3 text-center">22</td>
              <td className="p-3 text-center font-bold text-rose-500">28</td>
            </tr>
            <tr>
              <td className="p-3 text-foreground font-medium font-sans">Urine Output (mL/hr)</td>
              <td className="p-3 text-center">55</td>
              <td className="p-3 text-center">35</td>
              <td className="p-3 text-center font-bold text-rose-500">12</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-foreground-secondary pt-2">
        Based on the trended findings, select the priority nursing action:
      </div>

      {/* Question Options */}
      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id || opt.wasSelected === true;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(opt.id)}
              className={cn(
                "w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between",
                isSelected
                  ? "border-brand-teal bg-brand-teal/10 text-foreground font-semibold ring-1 ring-brand-teal"
                  : "border-border bg-background hover:bg-surface-muted text-foreground-secondary"
              )}
            >
              <span>{opt.optionText}</span>
              {isReview && opt.isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Hemodynamic Trend Rationale</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
