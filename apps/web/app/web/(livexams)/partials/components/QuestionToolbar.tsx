'use client';

import { useState } from 'react';
import { Flag, Bookmark, Calculator, Palette } from 'lucide-react';
import { CustomMiniCalculator } from '@/components/panel/exam/tools/CustomMiniCalculator';

interface QuestionToolbarProps {
  flagged: boolean;
  bookmarked: boolean;
  onToggleFlag: () => void;
  onToggleBookmark: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
}

const EXAM_THEMES = ['atlas', 'cascade', 'classic', 'generic', 'glacial', 'orbit', 'pulse', 'zen'];

export function QuestionToolbar({
  flagged,
  bookmarked,
  onToggleFlag,
  onToggleBookmark,
  currentTheme,
  onSelectTheme,
}: QuestionToolbarProps) {
  const [calcOpen, setCalcOpen] = useState(false);

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            flagged
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Flag className="h-3.5 w-3.5" />
          {flagged ? 'Flagged' : 'Flag'}
        </button>

        <button
          type="button"
          onClick={onToggleBookmark}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            bookmarked
              ? 'bg-teal-100 text-[#0D9488]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>

        <button
          type="button"
          onClick={() => setCalcOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            calcOpen
              ? 'bg-[#142B4A] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calculator className="h-3.5 w-3.5" />
          Calculator
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Palette className="h-3.5 w-3.5 text-slate-500" />
        <select
          aria-label="Exam theme"
          value={currentTheme}
          onChange={(e) => onSelectTheme(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold capitalize text-[#142B4A]"
        >
          {EXAM_THEMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {calcOpen && (
        <div className="absolute left-4 top-14 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <CustomMiniCalculator />
        </div>
      )}
    </div>
  );
}
