"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Stethoscope, Timer, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { ROUTES } from "@/lib/routes";
import type { NursingPathway } from "@/lib/api-types";
import { cn } from "@/lib/utils";

/**
 * Licensure pathways offered by Quick Practice. Each maps onto an existing
 * `NursingPathway` understood by the exam service and the learner
 * Quick Practice page (`/learner/custom-practice?pathway=`).
 */
const quickPracticePathways = [
  {
    id: "RN",
    label: "NCLEX-RN",
    description: "Registered Nurse pathway",
    icon: Stethoscope,
  },
  {
    id: "PN_LPN",
    label: "NCLEX-PN",
    description: "Practical / Vocational Nurse pathway",
    icon: UserRound,
  },
] as const satisfies ReadonlyArray<{
  id: NursingPathway;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}>;

type QuickPracticePathway = (typeof quickPracticePathways)[number]["id"];

export function getQuickPracticeDestination(
  pathway: QuickPracticePathway,
  status: string,
  role: string | undefined,
) {
  const practicePath = `${ROUTES.learner.customPractice}?pathway=${encodeURIComponent(pathway)}`;
  if (status === "authenticated") {
    return role === "Learner" ? practicePath : ROUTES.accessDenied;
  }
  return `${ROUTES.signIn}?returnTo=${encodeURIComponent(practicePath)}`;
}

export function HeroQuickPractice() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [pathway, setPathway] = React.useState<QuickPracticePathway | null>(null);
  const [showError, setShowError] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const firstOptionRef = React.useRef<HTMLInputElement>(null);
  const headingId = React.useId();
  const errorId = React.useId();
  const hintId = React.useId();

  // If the learner clicked Begin while the session check was still running,
  // continue as soon as the authentication status is known.
  React.useEffect(() => {
    if (!pending || !pathway || status === "loading") return;
    setPending(false);
    router.push(getQuickPracticeDestination(pathway, status, user?.role));
  }, [pending, pathway, status, user?.role, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pathway) {
      setShowError(true);
      firstOptionRef.current?.focus();
      return;
    }
    if (status === "loading") {
      setPending(true);
      return;
    }
    router.push(getQuickPracticeDestination(pathway, status, user?.role));
  }

  const isStaff = status === "authenticated" && user?.role !== "Learner";
  const hint = isStaff
    ? "Quick Practice is available to learner accounts."
    : status === "authenticated"
      ? "You'll choose from the published exams for this pathway."
      : "Sign in to continue — you'll return here to choose a published exam.";

  return (
    <section
      aria-labelledby={headingId}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-7"
      data-testid="hero-quick-practice"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-teal via-brand-tealDark to-brand-navy" />

      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal dark:bg-teal-400/10 dark:text-teal-300">
          <Timer className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 id={headingId} className="font-brand text-xl font-bold text-foreground">
            Quick Practice
          </h2>
          <p className="text-sm leading-relaxed text-foreground-secondary">
            Pick your licensure pathway and go straight to published practice exams with saved progress.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
        <fieldset
          aria-describedby={showError && !pathway ? errorId : hintId}
          aria-invalid={showError && !pathway ? true : undefined}
          className="space-y-3"
        >
          <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
            Choose your pathway
          </legend>
          <div className="grid gap-3">
            {quickPracticePathways.map((option, index) => {
              const Icon = option.icon;
              const checked = pathway === option.id;
              return (
                <label
                  key={option.id}
                  className={cn(
                    "group flex min-h-[64px] cursor-pointer items-center gap-4 rounded-xl border-2 bg-background px-4 py-3 transition-colors",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-teal has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface",
                    checked
                      ? "border-brand-teal bg-brand-teal/[0.06] dark:border-teal-400 dark:bg-teal-400/10"
                      : showError && !pathway
                        ? "border-rose-400 dark:border-rose-500/70"
                        : "border-border hover:border-brand-teal/60",
                  )}
                >
                  <input
                    ref={index === 0 ? firstOptionRef : undefined}
                    type="radio"
                    name="quick-practice-pathway"
                    value={option.id}
                    checked={checked}
                    onChange={() => {
                      setPathway(option.id);
                      setShowError(false);
                    }}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                      checked
                        ? "bg-brand-teal text-white"
                        : "bg-surface-muted text-foreground-secondary group-hover:text-brand-teal",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-brand text-base font-bold text-foreground">{option.label}</span>
                    <span className="block text-xs text-foreground-secondary">{option.description}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      checked ? "border-brand-teal dark:border-teal-400" : "border-border-strong",
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full bg-brand-teal transition-transform dark:bg-teal-400", checked ? "scale-100" : "scale-0")} />
                  </span>
                </label>
              );
            })}
          </div>
          {showError && !pathway && (
            <p id={errorId} role="alert" className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Select NCLEX-RN or NCLEX-PN to begin.
            </p>
          )}
        </fieldset>

        <Button
          type="submit"
          size="lg"
          isLoading={pending}
          className="h-14 w-full rounded-lg bg-brand-teal text-[1.1875rem] font-bold text-white hover:bg-brand-tealDark focus-visible:ring-offset-surface dark:bg-brand-teal dark:text-white dark:hover:bg-brand-tealDark"
        >
          Begin Quick Practice
          {!pending && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
        </Button>
        <p id={hintId} className="text-center text-xs text-foreground-secondary">
          {hint}
        </p>
      </form>
    </section>
  );
}
