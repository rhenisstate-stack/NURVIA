"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function NumericCalculationRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  const currentNum = React.useMemo(() => {
    if (!value) return "";
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.NumericResponse ?? parsed.numericResponse ?? parsed.value ?? "";
      }
      return value.replace(/^"(.*)"$/, "$1");
    } catch {
      return value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value;
    onChange?.(JSON.stringify({ NumericResponse: val }));
  };

  const correctOption = question.options.find((o) => o.isCorrect);

  return (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center gap-2 text-xs text-foreground-secondary bg-surface-muted border border-border p-3 rounded-xl">
        <Info className="w-4 h-4 text-brand-teal shrink-0" />
        <span>
          Enter numbers only. Do not include units in the input box unless prompted.
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground-secondary flex items-center justify-between">
          <span>Calculated Dosage / Value:</span>
          <Badge variant="outline" className="text-[10px] font-mono">Precision: Â±0.01</Badge>
        </label>
        <div className="relative">
          <Input
            type="number"
            step="any"
            value={currentNum}
            onChange={handleChange}
            disabled={disabled}
            placeholder="e.g. 25.5"
            className="h-12 text-lg font-mono font-bold pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted text-xs font-semibold">
            Value
          </div>
        </div>
      </div>

      {isReview && correctOption && (
        <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Target Calculation:</span>
            <span className="font-mono text-base font-bold text-foreground">
              {correctOption.optionText}
            </span>
          </div>
          {correctOption.specificRationale && (
            <p className="text-foreground-secondary pt-1 leading-relaxed">{correctOption.specificRationale}</p>
          )}
        </div>
      )}
    </div>
  );
}
