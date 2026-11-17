'use client';

import { useParams } from 'next/navigation';
import { useStrataResource } from '@/lib/hooks/nexus/useStrataResource';

export default function VistaExamReportsPage() {
  const params = useParams<{ scope: string }>();
  const scope = params?.scope ?? 'relative';
  const { items, loading, error } = useStrataResource('examResults', 'relative', { perPage: 25 });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
          Performance Report · {scope}
        </span>
        <h1 className="mt-1 text-2xl font-bold text-[#142B4A]">Examination Analytics</h1>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading analytics...</p>}
      {!loading && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Completed exam records retrieved from LexmaCasto: <strong>{items.length}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
