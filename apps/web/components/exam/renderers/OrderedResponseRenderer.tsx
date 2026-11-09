"use client";

import * as React from "react";
import { QuestionRendererProps, RendererOption } from "./types";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, GripVertical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderedResponseRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Ordered options list
  const [items, setItems] = React.useState<RendererOption[]>(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        const orderIds: string[] = parsed.OrderedOptionIds || parsed.orderedOptionIds || [];
        if (Array.isArray(orderIds) && orderIds.length > 0) {
          const map = new Map(question.options.map((o) => [o.id, o]));
          const sorted = orderIds.map((id) => map.get(id)).filter(Boolean) as RendererOption[];
          if (sorted.length === question.options.length) return sorted;
        }
      } catch {}
    }
    return [...question.options];
  });

  const move = (fromIndex: number, toIndex: number) => {
    if (disabled || toIndex < 0 || toIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
    onChange?.(JSON.stringify({ OrderedOptionIds: updated.map((i) => i.id) }));
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-foreground-secondary">
        Arrange the nursing interventions in order of priority from first (highest priority) to last:
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background transition-all",
              "hover:border-brand-teal/50 shadow-2xs"
            )}
          >
            <span className="w-8 h-8 rounded-lg bg-brand-teal/10 text-brand-teal font-brand font-bold text-sm flex items-center justify-center shrink-0">
              {index + 1}
            </span>

            <span className="flex-1 text-sm text-foreground leading-relaxed">
              {item.optionText}
            </span>

            {!disabled && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Priority Sequence Rationale</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
