"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AdminPlansPage() {
  const plans = [
    {
      name: "Starter Trial Access",
      price: "Free",
      interval: "14 Days",
      activeSubscribers: 4200,
      features: ["Sample question sets", "Basic flashcard access", "Community reading access"],
    },
    {
      name: "Monthly Clinical Mastery",
      price: "$29",
      interval: "per month",
      activeSubscribers: 3150,
      features: ["Full ATI, HESI & NCLEX banks", "AI Clinical Tutor unlimited", "Study Planner", "Spaced flashcards"],
    },
    {
      name: "Semester Comprehensive Access",
      price: "$79",
      interval: "per 4 months",
      activeSubscribers: 5820,
      features: ["All question banks", "Exit predictor assessments", "Prioritization simulator", "Offline caching"],
    },
    {
      name: "Institutional Cohort License",
      price: "Custom",
      interval: "annual contract",
      activeSubscribers: 18,
      features: ["Faculty analytics dashboard", "LMS integration (Canvas/Blackboard)", "Custom exam blueprints"],
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Subscription Plans & Entitlements
              </h1>
              <Badge variant="teal">Stripe & Campus Billing</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Tier configurations, access gates, feature flags, and institutional enterprise licenses.
            </p>
          </div>

          <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create Plan Tier
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((p) => (
            <Card key={p.name} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-brand text-base font-bold text-foreground">
                    {p.name}
                  </h3>
                  <Badge variant="outline">{p.activeSubscribers.toLocaleString()} Active</Badge>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-brand text-3xl font-extrabold text-foreground">{p.price}</span>
                  <span className="text-xs text-foreground-muted">{p.interval}</span>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-foreground-secondary">
                  <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">
                    Included Entitlements:
                  </span>
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-foreground-muted">Tier Status: Active</span>
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Configure Tier
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
