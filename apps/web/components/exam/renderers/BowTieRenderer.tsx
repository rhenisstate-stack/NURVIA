"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function BowTieRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  // Bow-Tie state: Actions (2), Condition (1), Parameters (2)
  const state = React.useMemo<{
    actions: string[];
    condition: string | null;
    parameters: string[];
  }>(() => {
    if (!value) return { actions: [], condition: null, parameters: [] };
    try {
      if (value.startsWith("{")) {
        const parsed = JSON.parse(value);
        return {
          actions: parsed.Actions || parsed.actions || [],
          condition: parsed.Condition || parsed.condition || null,
          parameters: parsed.Parameters || parsed.parameters || [],
        };
      }
      return { actions: [], condition: null, parameters: [] };
    } catch {
      return { actions: [], condition: null, parameters: [] };
    }
  }, [value]);

  const updateBowTie = (newActions: string[], newCond: string | null, newParams: string[]) => {
    if (disabled) return;
    onChange?.(
      JSON.stringify({
        Actions: newActions,
        Condition: newCond,
        Parameters: newParams,
      })
    );
  };

  const toggleAction = (optId: string) => {
    const current = state.actions;
    const next = current.includes(optId)
      ? current.filter((id) => id !== optId)
      : current.length < 2
      ? [...current, optId]
      : current;
    updateBowTie(next, state.condition, state.parameters);
  };

  const setCondition = (optId: string) => {
    updateBowTie(state.actions, optId, state.parameters);
  };

  const toggleParam = (optId: string) => {
    const current = state.parameters;
    const next = current.includes(optId)
      ? current.filter((id) => id !== optId)
      : current.length < 2
      ? [...current, optId]
      : current;
    updateBowTie(state.actions, state.condition, next);
  };

  const options = question.options;

  return (
    <div className="space-y-6">
      <div className="text-xs text-foreground-secondary flex items-center justify-between">
        <span>Complete the clinical judgment Bow-Tie by selecting items for each section:</span>
        <Badge variant="outline" className="text-[10px]">NGN NextGen Format</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border border-border bg-surface-muted/40">
        {/* Left: Actions to Take (Pick 2) */}
        <div className="space-y-3 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="font-brand font-bold text-xs text-foreground uppercase tracking-wider">
              1. Actions to Take
            </span>
            <Badge variant="teal" className="text-[10px]">Pick 2</Badge>
          </div>
          <div className="space-y-2">
            {options.slice(0, 4).map((opt) => {
              const isSelected = state.actions.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleAction(opt.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border text-xs transition-all",
                    isSelected
                      ? "border-brand-teal bg-teal-500/10 text-foreground font-semibold ring-1 ring-brand-teal"
                      : "border-border bg-surface hover:bg-surface-muted text-foreground-secondary"
                  )}
                >
                  {opt.optionText}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Potential Condition (Pick 1) */}
        <div className="space-y-3 rounded-xl border-2 border-brand-teal/40 bg-teal-500/5 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-brand font-bold text-xs text-brand-teal uppercase tracking-wider">
                2. Potential Condition
              </span>
              <Badge variant="teal" className="text-[10px]">Pick 1</Badge>
            </div>
            <div className="space-y-2">
              {options.slice(2, 6).map((opt) => {
                const isSelected = state.condition === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setCondition(opt.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border text-xs transition-all",
                      isSelected
                        ? "border-brand-teal bg-brand-teal text-white font-bold shadow-xs"
                        : "border-border bg-surface hover:bg-surface-muted text-foreground-secondary"
                    )}
                  >
                    {opt.optionText}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-[11px] text-center text-foreground-muted italic pt-2">
            Core Client Diagnosis / Hypothesized State
          </div>
        </div>

        {/* Right: Parameters to Monitor (Pick 2) */}
        <div className="space-y-3 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="font-brand font-bold text-xs text-foreground uppercase tracking-wider">
              3. Parameters to Monitor
            </span>
            <Badge variant="teal" className="text-[10px]">Pick 2</Badge>
          </div>
          <div className="space-y-2">
            {options.slice( options.length > 4 ? options.length - 4 : 0 ).map((opt) => {
              const isSelected = state.parameters.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleParam(opt.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border text-xs transition-all",
                    isSelected
                      ? "border-brand-teal bg-teal-500/10 text-foreground font-semibold ring-1 ring-brand-teal"
                      : "border-border bg-surface hover:bg-surface-muted text-foreground-secondary"
                  )}
                >
                  {opt.optionText}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isReview && question.generalRationale && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-foreground-secondary space-y-1">
          <div className="font-bold text-brand-teal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Bow-Tie Clinical Judgment Rationale</span>
          </div>
          <p className="pt-1 leading-relaxed">{question.generalRationale}</p>
        </div>
      )}
    </div>
  );
}
