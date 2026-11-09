"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function FillInTheBlankRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  const currentText = React.useMemo(() => {
    if (!value) return "";
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return parsed.TextResponse || parsed.textResponse || parsed.value || "";
      }
      return value.replace(/^"(.*)"$/, "$1");
    } catch {
      return value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value;
    onChange?.(JSON.stringify({ TextResponse: val }));
  };

  const correctOption = question.options.find((o) => o.isCorrect);

  return (
    <div className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground-secondary">
          Enter Clinical Response:
        </label>
        <Input
          type="text"
          value={currentText}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Type accurate clinical term or value..."
          className="h-12 text-base font-medium"
        />
      </div>

      {isReview && correctOption && (
        <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Target Clinical Term:</span>
            <span className="font-mono text-sm text-foreground bg-surface px-2 py-0.5 rounded border border-border">
              {correctOption.optionText}
            </span>
          </div>
          {correctOption.specificRationale && (
            <p className="text-foreground-secondary mt-1">{correctOption.specificRationale}</p>
          )}
        </div>
      )}
    </div>
  );
}
