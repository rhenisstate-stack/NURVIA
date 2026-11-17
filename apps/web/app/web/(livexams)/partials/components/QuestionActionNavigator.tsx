'use client';

import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface QuestionActionNavigatorProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
  onSubmit: () => void;
  submitting?: boolean;
}

export function QuestionActionNavigator({
  currentIndex,
  total,
  onPrev,
  onNext,
  onJump,
  onSubmit,
  submitting = false,
}: QuestionActionNavigatorProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentIndex <= 0}
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <span className="text-xs font-semibold text-slate-600">
          Question {total > 0 ? currentIndex + 1 : 0} of {total}
        </span>

        <div className="flex items-center gap-2">
          {currentIndex < total - 1 ? (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B4A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={onSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>

      {total > 1 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {Array.from({ length: total }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onJump(idx)}
              className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${
                idx === currentIndex
                  ? 'bg-[#0D9488] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
