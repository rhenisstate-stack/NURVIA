"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Logo } from "@/components/brand/logo";

interface AuthShellProps {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
}

const HIGHLIGHTS = {
  "sign-up": [
    {
      title: "Focused nursing exam tracks",
      detail: "Structured NCLEX-RN, NCLEX-PN, ATI TEAS, and HESI A2 practice.",
    },
    {
      title: "Flexible sign-in credentials",
      detail: "Choose a strong password, a 4–12 digit PIN, or both for your account.",
    },
    {
      title: "Protected learner sessions",
      detail: "Server-managed HttpOnly session cookies keep credentials out of browser storage.",
    },
  ],
  "sign-in": [
    {
      title: "Pick up right where you left off",
      detail: "Resume timed practice sets, study guides, and clinical rationales.",
    },
    {
      title: "Password or PIN sign-in",
      detail: "Authenticate with the credential method configured for your learner profile.",
    },
    {
      title: "Protected learner sessions",
      detail: "Encrypted transport and same-origin protections guard every sign-in request.",
    },
  ],
} as const;

export function AuthShell({ mode, children }: AuthShellProps) {
  const items = HIGHLIGHTS[mode];

  return (
    <PublicShell>
      <main
        id="main-content"
        className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:py-12"
      >
        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Desktop Brand Panel */}
          <aside className="hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:pt-4">
            <div className="space-y-6">
              <Logo variant="full" size="md" withLink={false} />
              <div className="space-y-2.5">
                <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-brand-teal shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  International Nursing Preparation
                </p>
                <h2 className="font-brand text-2xl font-bold leading-snug text-foreground">
                  {mode === "sign-up"
                    ? "Clinical precision for every exam milestone."
                    : "Steady preparation, measurable readiness."}
                </h2>
                <p className="text-sm leading-relaxed text-foreground-secondary">
                  {mode === "sign-up"
                    ? "Create your NURVIA learner profile to access evidence-based rationales, adaptive study sets, and clinical calculators."
                    : "Sign in to your NURVIA learner workspace to continue exam simulations and review performance insights."}
                </p>
              </div>

              <ul className="space-y-4 border-t border-border pt-6">
                {items.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal"
                      aria-hidden="true"
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs leading-relaxed text-foreground-secondary">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Primary Authentication Card */}
          <section className="w-full lg:col-span-7">
            <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8 lg:max-w-none">
              <div className="mb-5 lg:hidden">
                <Logo variant="compact" size="sm" withLink={false} />
              </div>
              {children}
            </div>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
