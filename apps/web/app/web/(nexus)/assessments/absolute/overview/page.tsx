'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AssessmentItem {
  guidId?: string;
  id?: string | number;
  name?: string;
  description?: string;
}

export default function NexusAssessmentsAbsoluteOverviewPage() {
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/strata/assessments?fetchtype=absolute&perPage=50', {
          credentials: 'include',
        });
        const json = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(json?.message || 'Unable to load assessments.');
        } else {
          setItems(Array.isArray(json?.data?.items) ? json.data.items : []);
        }
      } catch {
        if (active) setError('Unable to reach assessments service.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
        Assessment Structure
      </span>
      <h1 className="mt-2 text-3xl font-bold text-[#142B4A]">Assessments Overview</h1>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading assessments...</p>}
      {!loading && error && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <Link
            key={item.guidId ?? item.id ?? idx}
            href="/exams"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#0D9488]"
          >
            <h2 className="font-bold text-[#142B4A]">{item.name || 'Nursing Assessment'}</h2>
            {item.description && (
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
