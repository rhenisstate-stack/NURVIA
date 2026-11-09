"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sliders,
  TrendingUp,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const metricCards = [
    { label: "Active Question Sessions", value: "28,490", change: "+14.2% vs last week", trend: "up" },
    { label: "Mean Assessment Score", value: "74.8%", change: "+2.1% improvement", trend: "up" },
    { label: "NGN Case Study Completion", value: "86.3%", change: "Above benchmark", trend: "up" },
    { label: "Item Discrimination Index", value: "0.41", change: "Strong psychometric validity", trend: "neutral" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Content & Learner Analytics
              </h1>
              <Badge variant="teal">Live Metrics</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Psychometric analytics, item discrimination indices, and cognitive performance trends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filter by Track
            </Button>
            <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
              Export Psychometrics
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((m) => (
            <Card key={m.label} className="p-4">
              <CardDescription className="text-xs font-semibold text-foreground-muted">
                {m.label}
              </CardDescription>
              <div className="font-brand text-2xl font-bold text-foreground mt-1">
                {m.value}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                {m.change}
              </p>
            </Card>
          ))}
        </div>

        {/* Cognitive Skill Performance Table */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">
              NCSBN Clinical Judgment Cognitive Skill Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregated learner cohort accuracy across the six core clinical judgment steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="space-y-3">
              {[
                { step: "1. Recognize Cues", rate: 82, totalAttempts: "142,500" },
                { step: "2. Analyze Cues", rate: 76, totalAttempts: "138,200" },
                { step: "3. Prioritize Hypotheses", rate: 69, totalAttempts: "125,400" },
                { step: "4. Generate Solutions", rate: 74, totalAttempts: "119,800" },
                { step: "5. Take Actions", rate: 71, totalAttempts: "112,000" },
                { step: "6. Evaluate Outcomes", rate: 78, totalAttempts: "105,600" },
              ].map((item) => (
                <div key={item.step} className="p-3 rounded-lg border border-border bg-surface-muted/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{item.step}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-foreground-muted">{item.totalAttempts} attempts</span>
                    <span className="font-bold text-brand-teal px-2 py-0.5 rounded bg-brand-teal/10">
                      {item.rate}% Cohort Accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
