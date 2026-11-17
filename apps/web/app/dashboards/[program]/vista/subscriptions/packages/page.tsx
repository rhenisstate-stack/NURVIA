'use client';

import Link from 'next/link';
import { useSubscriptionPackages } from '@/lib/hooks/nexus/useSubscriptionPackages';

interface PkgItem {
  guidId?: string;
  id?: string | number;
  name?: string;
  description?: string;
}

export default function VistaSubscriptionPackagesPage() {
  const { items, loading, error } = useSubscriptionPackages<PkgItem>('packages', 'discrete');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-[#142B4A]">Program Subscription Packages</h1>

      {loading && <p className="text-sm text-slate-500">Loading packages...</p>}
      {!loading && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((pkg, idx) => (
          <div
            key={pkg.guidId ?? pkg.id ?? idx}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="font-bold text-[#142B4A]">{pkg.name || 'Nursing Package'}</h2>
              {pkg.description && <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>}
            </div>
            <Link
              href="/learner/subscription"
              className="mt-4 block rounded-xl bg-[#0D9488] px-4 py-2 text-center text-xs font-semibold text-white hover:bg-teal-700"
            >
              Manage Plan
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
