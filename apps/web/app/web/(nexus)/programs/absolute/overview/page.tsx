'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProgramItem {
  guidId?: string;
  id?: string | number;
  name?: string;
  description?: string;
  segment?: string;
}

export default function NexusProgramsAbsoluteOverviewPage() {
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/strata/programs?fetchtype=absolute&perPage=50', {
          credentials: 'include',
        });
        const json = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(json?.message || 'Unable to load programs.');
        } else {
          setItems(Array.isArray(json?.data?.items) ? json.data.items : []);
        }
      } catch {
        if (active) setError('Unable to reach programs service.');
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
        Academic Structure
      </span>
      <h1 className="mt-2 text-3xl font-bold text-[#142B4A]">Programs Overview</h1>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading nursing programs...</p>}
      {!loading && error && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, idx) => {
          const slug = (p.segment || 'nclex-rn').toLowerCase().replace(/_/g, '-');
          return (
            <Link
              key={p.guidId ?? p.id ?? idx}
              href={`/dashboards/${slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#0D9488]"
            >
              <h2 className="font-bold text-[#142B4A]">{p.name || 'Nursing Program'}</h2>
              {p.description && <p className="mt-1 text-sm text-slate-600">{p.description}</p>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
