'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/layout/public-shell';

interface PackageDto {
  guidId?: string;
  id?: string | number;
  name?: string;
  description?: string;
  price?: number;
}

export default function SubscriptionPackagesPage() {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/subscriptions/packages?fetchtype=discrete&perPage=50', {
          credentials: 'include',
        });
        const json = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(json?.message || 'Subscription packages are not currently provisioned.');
        } else {
          const items = json?.data?.items ?? json?.items ?? [];
          setPackages(Array.isArray(items) ? items : []);
        }
      } catch {
        if (active) setError('Unable to load subscription packages.');
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
    <PublicShell>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
          Plans &amp; Access
        </span>
        <h1 className="mt-2 text-3xl font-bold text-[#142B4A]">Subscription Packages</h1>

        {loading && <p className="mt-6 text-sm text-slate-500">Loading packages...</p>}
        {!loading && error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </div>
        )}
        {!loading && !error && packages.length === 0 && (
          <p className="mt-6 text-sm text-slate-500">No subscription packages available yet.</p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.guidId ?? pkg.id ?? idx}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-bold text-[#142B4A]">{pkg.name || 'Nursing Plan'}</h2>
                {pkg.description && (
                  <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
                )}
              </div>
              <div className="mt-6">
                <Link
                  href="/learner/subscription"
                  className="block rounded-xl bg-[#0D9488] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Manage Subscription
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
