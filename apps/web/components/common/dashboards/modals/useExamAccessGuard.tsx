'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ReminderModal } from '@/components/common/dashboards/modals/AccessReminderModals';

type Reason = null | 'login' | 'verify' | 'subscribe';

export function useExamAccessGuard(slug: string, panelName: string) {
  const segment = slug.toUpperCase().replace(/-/g, '_');
  const badge = segment.replace(/_/g, ' ');
  const loginHref = `/sign-in?next=${encodeURIComponent(`/dashboards/${slug}`)}`;
  const verifyHref = '/learner/settings/security';
  const packagesHref = '/learner/subscription';

  const { user, status } = useAuth();
  const loading = status === 'loading';
  const [reason, setReason] = useState<Reason>(null);

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

  const close = useCallback(() => setReason(null), []);

  const guard = useCallback(
    (needsSubscription: boolean, hasActiveSub: boolean, onPass: () => void) => {
      if (loading) return;
      if (!user) return setReason('login');
      if (!isEmailVerified) return setReason('verify');
      if (needsSubscription && !hasActiveSub) return setReason('subscribe');
      onPass();
    },
    [loading, user, isEmailVerified]
  );

  let modal: React.ReactNode = null;
  if (reason === 'login') {
    modal = (
      <ReminderModal
        isOpen
        onClose={close}
        step={1}
        icon="🔐"
        tone="navy"
        badge={badge}
        title={`Sign in to Start ${panelName} Exams`}
        description="You need a NURVIA account to take exams, track readiness, and save results."
        points={['Track your progress', 'Save your exam results', 'Unlock your subscription']}
        primaryLabel="Sign In Now"
        primaryHref={loginHref}
        secondaryLabel="Not Now"
        onPrimary={close}
      />
    );
  } else if (reason === 'verify') {
    modal = (
      <ReminderModal
        isOpen
        onClose={close}
        step={2}
        icon="✉️"
        tone="amber"
        badge={badge}
        title="Verify Your Email to Continue"
        description="Please verify your email address before starting an examination."
        primaryLabel="Verify Email"
        primaryHref={verifyHref}
        secondaryLabel="Not Now"
        onPrimary={close}
      />
    );
  } else if (reason === 'subscribe') {
    modal = (
      <ReminderModal
        isOpen
        onClose={close}
        step={3}
        icon="⭐"
        tone="teal"
        badge={badge}
        title={`Subscribe to Unlock ${panelName} Exams`}
        description="Upgrade your plan for full access to nursing exam banks and clinical rationales."
        primaryLabel="View Plans"
        primaryHref={packagesHref}
        secondaryLabel="Not Now"
        onPrimary={close}
      />
    );
  }

  return { guard, modal };
}
