'use client';

import * as React from 'react';
import type { QuestionRendererProps } from './types';

export const HighlightTextRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const selectedIds = React.useMemo(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }, [value]);

  const toggle = (id: string) => {
    if (disabled || !onChange) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(JSON.stringify(next));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Select the clinical findings to highlight:
      </p>
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
        {question.options.map((opt) => {
          const active = selectedIds.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-200 text-[#142B4A] ring-2 ring-[#0D9488]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {opt.optionText}
            </button>
          );
        })}
      </div>
    </div>
  );
};
