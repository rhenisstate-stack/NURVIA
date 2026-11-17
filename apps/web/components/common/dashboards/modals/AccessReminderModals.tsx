'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const FIRST_DELAY_MS = 1500;
const REMINDER_DELAY_MS = 5 * 60 * 1000;

type Tone = 'navy' | 'amber' | 'teal' | 'slate';

const TONES: Record<Tone, { pill: string; icon: string; btn: string; ring: string }> = {
  navy: {
    pill: 'border-[#142B4A]/20 bg-slate-100 text-[#142B4A]',
    icon: 'bg-[#142B4A]/10 text-[#142B4A]',
    btn: 'bg-[#142B4A] hover:bg-slate-800 shadow-[#142B4A]/25',
    ring: 'ring-slate-200',
  },
  amber: {
    pill: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: 'bg-amber-100 text-amber-700',
    btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25',
    ring: 'ring-amber-200',
  },
  teal: {
    pill: 'border-teal-200 bg-teal-50 text-[#0D9488]',
    icon: 'bg-teal-100 text-[#0D9488]',
    btn: 'bg-[#0D9488] hover:bg-teal-700 shadow-teal-600/25',
    ring: 'ring-teal-200',
  },
  slate: {
    pill: 'border-slate-200 bg-slate-100 text-slate-700',
    icon: 'bg-slate-200 text-slate-700',
    btn: 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/25',
    ring: 'ring-slate-200',
  },
};

const STEPS = ['Sign in', 'Verify email', 'Subscribe'];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-5 flex items-center gap-2" aria-label="Access steps">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                done
                  ? 'bg-[#0D9488] text-white'
                  : current
                    ? 'bg-[#142B4A] text-white ring-4 ring-slate-200'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {done ? '✓' : n}
            </span>
            <span
              className={`hidden whitespace-nowrap text-[11px] font-semibold sm:inline ${
                current ? 'text-[#142B4A]' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
            {n < STEPS.length && (
              <span className={`h-px flex-1 ${done ? 'bg-[#0D9488]' : 'bg-slate-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ReminderModal({
  isOpen,
  onClose,
  badge,
  title,
  description,
  secondaryLabel,
  primaryLabel,
  primaryHref,
  step,
  icon = '🔒',
  tone = 'navy',
  points,
  blocking = false,
  locked = false,
  onPrimary,
  tertiaryLabel,
  tertiaryHref,
}: {
  isOpen: boolean;
  onClose: () => void;
  badge: string;
  title: string;
  description: string;
  secondaryLabel: string;
  primaryLabel: string;
  primaryHref: string;
  locked?: boolean;
  step?: number;
  icon?: string;
  tone?: Tone;
  points?: string[];
  blocking?: boolean;
  onPrimary?: () => void;
  tertiaryLabel?: string;
  tertiaryHref?: string;
}) {
  const t = TONES[tone];

  useEffect(() => {
    if (!isOpen || locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, locked]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={blocking || locked ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        {!locked && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        )}

        <div className="relative mb-4 flex items-center gap-3 pr-8">
          <span
            className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${t.pill}`}
          >
            {badge}
          </span>
        </div>

        {typeof step === 'number' && <Stepper step={step} />}

        <div className="relative flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ring-4 ${t.icon} ${t.ring}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-snug text-[#142B4A]">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>

        {points && points.length > 0 && (
          <ul className="relative mt-4 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[11px] text-[#0D9488]">
                  ✓
                </span>
                <span className="min-w-0 truncate">{p}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="relative mt-6 flex flex-col gap-2.5">
          <Link
            href={primaryHref}
            onClick={onPrimary ?? onClose}
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-all ${t.btn}`}
          >
            {primaryLabel}
          </Link>
          {tertiaryLabel && tertiaryHref && (
            <Link
              href={tertiaryHref}
              className="rounded-xl border border-[#0D9488]/40 bg-teal-50 px-4 py-3 text-center text-sm font-semibold text-[#0D9488] transition-colors hover:bg-teal-100"
            >
              {tertiaryLabel}
            </Link>
          )}
          {!locked && secondaryLabel && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function useAccessReminders({
  isUserLoading,
  isLoggedIn,
  hasActiveSubscription,
}: {
  isUserLoading: boolean;
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
}) {
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestDismissCount, setGuestDismissCount] = useState(0);
  const [subOpen, setSubOpen] = useState(false);
  const [subDismissCount, setSubDismissCount] = useState(0);

  useEffect(() => {
    if (isUserLoading) return;
    if (isLoggedIn) {
      setGuestOpen(false);
      return;
    }
    if (guestOpen) return;

    const timer = setTimeout(
      () => setGuestOpen(true),
      guestDismissCount === 0 ? FIRST_DELAY_MS : REMINDER_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [isUserLoading, isLoggedIn, guestOpen, guestDismissCount]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isLoggedIn || hasActiveSubscription) {
      setSubOpen(false);
      return;
    }
    if (subOpen) return;

    const timer = setTimeout(
      () => setSubOpen(true),
      subDismissCount === 0 ? 3000 : REMINDER_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [isUserLoading, isLoggedIn, hasActiveSubscription, subOpen, subDismissCount]);

  return {
    guestOpen: guestOpen && !isLoggedIn,
    closeGuest: () => {
      setGuestOpen(false);
      setGuestDismissCount((c) => c + 1);
    },
    subOpen: subOpen && isLoggedIn && !hasActiveSubscription,
    closeSub: () => {
      setSubOpen(false);
      setSubDismissCount((c) => c + 1);
    },
  };
}

export interface OtherSubscription {
  name: string;
  href: string;
}

export function AccessGate({
  isUserLoading,
  isLoggedIn,
  isEmailVerified,
  hasActiveSubscription,
  otherSubscriptions,
  panelName,
  badge,
  loginHref,
  verifyHref,
  packagesHref,
  homeHref = '/',
  lock = true,
}: {
  isUserLoading: boolean;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  hasActiveSubscription: boolean;
  otherSubscriptions: OtherSubscription[];
  panelName: string;
  badge: string;
  loginHref: string;
  verifyHref: string;
  packagesHref: string;
  homeHref?: string;
  lock?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const goHome = () => router.replace(homeHref);
  const verifyPath = verifyHref.split('?')[0];
  const packagesPath = packagesHref.split('?')[0].replace(/\/[^/]+$/, '');
  const onVerifyPage = pathname.startsWith(verifyPath);
  const onPackagesPage = pathname.startsWith(packagesPath);

  const [subReady, setSubReady] = useState(false);
  const [subHidden, setSubHidden] = useState(false);

  const passedAuth = !isUserLoading && isLoggedIn && isEmailVerified;

  useEffect(() => {
    if (!passedAuth) {
      setSubReady(false);
      return;
    }
    const t = setTimeout(() => setSubReady(true), 3000);
    return () => clearTimeout(t);
  }, [passedAuth]);

  useEffect(() => {
    if (!subHidden) return;
    const t = setTimeout(() => setSubHidden(false), REMINDER_DELAY_MS);
    return () => clearTimeout(t);
  }, [subHidden]);

  useEffect(() => {
    if (lock && !isUserLoading && isLoggedIn && !isEmailVerified && !onVerifyPage) {
      router.replace(verifyHref);
    }
  }, [lock, isUserLoading, isLoggedIn, isEmailVerified, onVerifyPage, verifyHref, router]);

  if (isUserLoading) return null;

  if (!isLoggedIn) {
    return (
      <ReminderModal
        isOpen
        blocking
        step={1}
        icon="🔐"
        tone="navy"
        badge={badge}
        title={`Sign in to Access ${panelName}`}
        description="Sign in to practice nursing exams, track clinical readiness, and save your results."
        points={['Track your readiness', 'Save exam results', 'Unlock your subscription']}
        primaryLabel="Sign In Now"
        primaryHref={loginHref}
        secondaryLabel="Back to Home"
        onClose={goHome}
      />
    );
  }

  if (!isEmailVerified) {
    if (onVerifyPage) return null;
    return (
      <ReminderModal
        isOpen
        blocking
        locked={lock}
        step={2}
        icon="✉️"
        tone="amber"
        badge={badge}
        title="Verify your email to continue"
        description="Confirm your email address to protect your NURVIA account and unlock your program dashboard."
        points={['Check your inbox and spam folder', 'Click the verification link', 'Refresh this page']}
        primaryLabel="Verify My Email"
        primaryHref={verifyHref}
        secondaryLabel="Back to Home"
        onClose={goHome}
      />
    );
  }

  if (!subReady || hasActiveSubscription || onPackagesPage) return null;
  if (!lock && subHidden) return null;

  if (otherSubscriptions.length > 0) {
    const first = otherSubscriptions[0];
    return (
      <ReminderModal
        isOpen
        locked={lock}
        step={3}
        icon="🧭"
        tone="slate"
        badge={badge}
        title={`You're Subscribed to ${first.name}`}
        description={`Your active plan does not include ${panelName}. Continue to your active program or view plans for ${panelName}.`}
        points={otherSubscriptions.map((s) => `Active: ${s.name}`)}
        primaryLabel={`Go to ${first.name}`}
        primaryHref={first.href}
        tertiaryLabel={`View plans for ${panelName}`}
        tertiaryHref={packagesHref}
        secondaryLabel={`Stay in ${panelName}`}
        onClose={() => setSubHidden(true)}
      />
    );
  }

  return (
    <ReminderModal
      isOpen
      locked={lock}
      step={3}
      icon="⭐"
      tone="teal"
      badge={badge}
      title={`Unlock Full Access to ${panelName}`}
      description="Subscribe to unlock full nursing exam banks, rationales, and clinical performance tracking."
      points={['Full nursing exam library', 'Detailed clinical rationales', 'Progress tracking']}
      primaryLabel="View Subscription Packages"
      primaryHref={packagesHref}
      secondaryLabel="Continue with Limited Access"
      onClose={() => setSubHidden(true)}
    />
  );
}
