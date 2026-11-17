'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useStrataResource } from '@/lib/hooks/nexus/useStrataResource';

interface SubjectRecord {
  guidId?: string;
  id?: string | number;
  name?: string;
  description?: string;
}

export function DistinctSubjects({ programSlug }: { programSlug: string }) {
  const { items, loading, error } = useStrataResource<SubjectRecord>('subjects', 'absolute', {
    perPage: 12,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#0D9488]" />
          <h2 className="text-lg font-bold text-[#142B4A]">Nursing Subjects</h2>
        </div>
        <Link
          href={`/dashboards/${programSlug}/vista/learning/subjects/absolute/overview`}
          className="text-xs font-semibold text-[#0D9488] hover:underline"
        >
          View All
        </Link>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading subjects...</p>}
      {!loading && error && (
        <p className="mt-4 text-sm text-amber-700">{error}</p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No subjects provisioned yet.</p>
      )}

      {items.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((subj, idx) => (
            <div
              key={subj.guidId ?? subj.id ?? idx}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-semibold text-[#142B4A]">{subj.name || 'Nursing Subject'}</p>
              {subj.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{subj.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
