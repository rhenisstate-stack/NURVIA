'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useSubscriptionPackages } from '@/lib/hooks/nexus/useSubscriptionPackages';

interface PkgRecord {
  guidId?: string;
  id?: string | number;
  name?: string;
  userSubscriptions?: Array<{ subscriptionStatus?: string }>;
}

export function ActiveSubscriptionPackage({ programSlug }: { programSlug: string }) {
  const { items, loading } = useSubscriptionPackages<PkgRecord>('packages', 'discrete');
  const activePkgs = items.filter((p) =>
    p.userSubscriptions?.some((s) => s.subscriptionStatus === 'Active')
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#0D9488]" />
          <h2 className="text-lg font-bold text-[#142B4A]">Subscription Status</h2>
        </div>
        <Link
          href={`/dashboards/${programSlug}/vista/subscriptions/packages`}
          className="text-xs font-semibold text-[#0D9488] hover:underline"
        >
          Manage Plans
        </Link>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-slate-500">Checking active plans...</p>
      ) : activePkgs.length > 0 ? (
        <div className="mt-3 space-y-2">
          {activePkgs.map((pkg, idx) => (
            <div
              key={pkg.guidId ?? pkg.id ?? idx}
              className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3"
            >
              <span className="text-sm font-semibold text-[#142B4A]">
                {pkg.name || 'Active Nursing Plan'}
              </span>
              <span className="rounded-full bg-[#0D9488] px-2.5 py-0.5 text-xs font-semibold text-white">
                Active
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          No active program subscription detected.{' '}
          <Link href="/learner/subscription" className="font-semibold text-[#0D9488] hover:underline">
            Explore Plans
          </Link>
        </p>
      )}
    </section>
  );
}
