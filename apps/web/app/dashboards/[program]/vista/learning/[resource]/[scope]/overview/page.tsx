'use client';

import { useParams } from 'next/navigation';
import { useStrataResource } from '@/lib/hooks/nexus/useStrataResource';
import type { StrataFetchType } from '@/lib/services/strata/strataService';

interface LearningItem {
  guidId?: string;
  id?: string | number;
  name?: string;
  description?: string;
}

const VALID_RESOURCES = new Set(['programs', 'courses', 'subjects']);

export default function VistaLearningOverviewPage() {
  const params = useParams<{ program: string; resource: string; scope: string }>();
  const resource = VALID_RESOURCES.has(params?.resource ?? '') ? params.resource : 'subjects';
  const fetchtype: StrataFetchType = params?.scope === 'distinct' ? 'distinct' : 'absolute';

  const { items, loading, error } = useStrataResource<LearningItem>(resource, fetchtype, {
    perPage: 50,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
          Learning · {fetchtype}
        </span>
        <h1 className="mt-1 text-2xl font-bold capitalize text-[#142B4A]">{resource} Overview</h1>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading {resource}...</p>}
      {!loading && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-500">No {resource} records available.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <div
            key={item.guidId ?? item.id ?? idx}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-bold text-[#142B4A]">{item.name || 'Untitled'}</h2>
            {item.description && (
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
