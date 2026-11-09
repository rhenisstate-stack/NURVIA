"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

export default function SubscriptionPage() {
  const plans = [
    {
      name: "Standard Learner",
      price: "$29",
      period: "/ month",
      desc: "Full access to ATI & HESI question banks, rationales, and flashcards.",
      features: [
        "40,000+ Verified Practice Questions",
        "Next Gen NCLEX Case Studies",
        "Evidence-Based Rationale Engine",
        "Spaced Repetition Flashcards",
      ],
      current: true,
    },
    {
      name: "NCLEX Licensure Benchmark",
      price: "$79",
      period: "one-time (6 months)",
      desc: "Includes comprehensive exit predictors and AI Socratic clinical tutor.",
      features: [
        "Everything in Standard Learner",
        "ATI & HESI Comprehensive Exit Predictors",
        "AI Socratic Clinical Tutor",
        "Detailed Probability of Passing Guarantee",
        "Priority Educator Support",
      ],
      current: false,
    },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Enrollment & Plans</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Subscription & Access
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Manage your NURVIA learning tier and examination preparation access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {plans.map((p) => (
            <Card key={p.name} className={`p-6 flex flex-col justify-between space-y-6 ${p.current ? "border-brand-teal shadow-md ring-1 ring-brand-teal" : ""}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-brand text-xl font-bold text-foreground">{p.name}</h3>
                  {p.current && <Badge variant="teal">Current Plan</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-brand text-foreground">{p.price}</span>
                  <span className="text-xs text-foreground-muted">{p.period}</span>
                </div>
                <p className="text-xs text-foreground-secondary">{p.desc}</p>

                <div className="space-y-2 pt-2 border-t border-border text-xs">
                  {p.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  className={`w-full text-xs font-semibold ${
                    p.current
                      ? "bg-surface-muted text-foreground-secondary border border-border hover:bg-surface-muted/80"
                      : "bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark"
                  }`}
                  disabled={p.current}
                >
                  {p.current ? "Active Plan" : "Upgrade to Benchmark"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
