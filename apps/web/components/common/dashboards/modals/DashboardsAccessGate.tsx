'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import {
  AccessGate,
  type OtherSubscription,
} from '@/components/common/dashboards/modals/AccessReminderModals';

const PANELS: Record<string, string> = {
  'ati-teas': 'ATI TEAS 7',
  'hesi-a2': 'HESI A2',
  'rn-nursing': 'RN Nursing',
  'lpn-nursing': 'LPN Nursing',
  'nclex-rn': 'NCLEX-RN',
  'nclex-pn': 'NCLEX-PN',
};

interface StrataProgramItem {
  guidId?: string;
  name?: string;
  segment?: string;
}

interface SubscriptionPkgItem {
  terminalClusterTableName?: string;
  terminalClusterGuidId?: string;
  userSubscriptions?: Array<{ subscriptionStatus?: string }>;
}

function PanelGate({ slug }: { slug: string }) {
  const segment = slug.toUpperCase().replace(/-/g, '_');
  const { user, status } = useAuth();
  const isUserLoading = status === 'loading';
  const [programs, setPrograms] = useState<StrataProgramItem[]>([]);
  const [packages, setPackages] = useState<SubscriptionPkgItem[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [progRes, pkgRes] = await Promise.all([
          fetch('/api/strata/programs?fetchtype=absolute&perPage=100', { credentials: 'include' }),
          fetch('/api/subscriptions/packages?fetchtype=discrete&perPage=100', { credentials: 'include' }),
        ]);
        if (active && progRes.ok) {
          const pj = await progRes.json();
          setPrograms(Array.isArray(pj?.data?.items) ? pj.data.items : []);
        }
        if (active && pkgRes.ok) {
          const kj = await pkgRes.json();
          setPackages(Array.isArray(kj?.data?.items) ? kj.data.items : []);
        }
      } catch {
        // Keep empty defaults on network error
      }
    }
    if (user) void load();
    return () => {
      active = false;
    };
  }, [user]);

  const isEmailVerified = useMemo(() => {
    const u = user as unknown as {
      emailVerified?: boolean;
      isEmailVerified?: boolean;
      emailVerifiedAt?: string | null;
    } | null;
    if (!u) return false;
    if (u.emailVerified !== undefined) return !!u.emailVerified;
    if (u.isEmailVerified !== undefined) return !!u.isEmailVerified;
    if (u.emailVerifiedAt !== undefined) return !!u.emailVerifiedAt;
    return true;
  }, [user]);

  const hasActiveSubscription = useMemo(() => {
    const ids = new Set(programs.filter((p) => p.segment === segment).map((p) => p.guidId));
    return packages.some(
      (p) =>
        p.terminalClusterTableName === 'strata_programs' &&
        !!p.terminalClusterGuidId &&
        ids.has(p.terminalClusterGuidId) &&
        !!p.userSubscriptions?.some((s) => s.subscriptionStatus === 'Active')
    );
  }, [packages, programs, segment]);

  const otherSubscriptions = useMemo<OtherSubscription[]>(() => {
    const out: OtherSubscription[] = [];
    const seen = new Set<string>();
    packages.forEach((p) => {
      if (p.terminalClusterTableName !== 'strata_programs' || !p.terminalClusterGuidId) return;
      if (!p.userSubscriptions?.some((s) => s.subscriptionStatus === 'Active')) return;
      const program = programs.find((x) => x.guidId === p.terminalClusterGuidId);
      if (!program || program.segment === segment) return;
      const otherSlug = (program.segment ?? '').toLowerCase().replace(/_/g, '-');
      if (!PANELS[otherSlug] || seen.has(otherSlug)) return;
      seen.add(otherSlug);
      out.push({ name: program.name ?? PANELS[otherSlug], href: `/dashboards/${otherSlug}` });
    });
    return out;
  }, [packages, programs, segment]);

  return (
    <AccessGate
      isUserLoading={isUserLoading}
      isLoggedIn={!!user}
      isEmailVerified={isEmailVerified}
      hasActiveSubscription={hasActiveSubscription}
      otherSubscriptions={otherSubscriptions}
      panelName={PANELS[slug]}
      badge={segment.replace(/_/g, ' ')}
      loginHref={`/sign-in?next=${encodeURIComponent(`/dashboards/${slug}`)}`}
      verifyHref="/learner/settings/security"
      packagesHref="/learner/subscription"
      homeHref="/"
      lock
    />
  );
}

export default function DashboardsAccessGate() {
  const pathname = usePathname() ?? '';
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] !== 'dashboards' || !PANELS[parts[1]]) return null;
  if (parts[2] === 'auth') return null;
  if (parts[2] === 'vista' && parts[3] === 'assessment' && parts[4] === 'exams') return null;

  return <PanelGate key={parts[1]} slug={parts[1]} />;
}
