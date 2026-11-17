'use client';

import { useStrataResource } from '@/lib/hooks/nexus/useStrataResource';

interface ExamResultItem {
  guidId?: string;
  id?: string | number;
  examName?: string;
  score?: number;
  status?: string;
}

export default function VistaExamResultsDistinctPage() {
  const { items, loading, error } = useStrataResource<ExamResultItem>('examResults', 'relative', {
    perPage: 25,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-[#142B4A]">Exam Results</h1>

      {loading && <p className="text-sm text-slate-500">Loading exam results...</p>}
      {!loading && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-500">No exam results recorded yet.</p>
      )}

      <div className="space-y-3">
        {items.map((r, idx) => (
          <div
            key={r.guidId ?? r.id ?? idx}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-[#142B4A]">{r.examName || 'Practice Exam'}</p>
              <p className="text-xs text-slate-500">{r.status || 'Completed'}</p>
            </div>
            {r.score !== undefined && (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-[#0D9488]">
                {r.score}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
