"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function PerformancePage() {
  const categories = [
    { name: "Pharmacology & Parenteral", score: 64, status: "High Priority Focus", color: "bg-rose-500", qCount: 320 },
    { name: "Adult Medical-Surgical", score: 71, status: "Approaching Benchmark", color: "bg-amber-500", qCount: 450 },
    { name: "Pediatric Nursing", score: 76, status: "Proficient", color: "bg-blue-500", qCount: 280 },
    { name: "Maternal Newborn & OB", score: 82, status: "Strong", color: "bg-teal-500", qCount: 230 },
    { name: "Fundamentals of Nursing", score: 88, status: "Mastered", color: "bg-emerald-500", qCount: 200 },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="teal">Readiness Analytics</Badge>
            <span className="text-xs text-foreground-muted">Updated today</span>
          </div>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Performance Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Aggregated clinical competence tracking across Next Gen cognitive skills and exam tracks.
          </p>
        </div>

        {/* 3 Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="p-5 pb-2">
              <span className="text-xs text-foreground-secondary font-medium">Estimated NCLEX Probability</span>
              <CardTitle className="text-2xl font-bold text-foreground">82% Benchmark</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              +4% improvement over last 14 days
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-2">
              <span className="text-xs text-foreground-secondary font-medium">Questions Completed</span>
              <CardTitle className="text-2xl font-bold text-foreground">1,480 / 6,200</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs text-foreground-muted">
              23.8% of available question bank
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-2">
              <span className="text-xs text-foreground-secondary font-medium">Average Time Per Question</span>
              <CardTitle className="text-2xl font-bold text-foreground">58 seconds</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs text-brand-teal font-semibold">
              Optimal NCLEX pacing (&lt; 90 sec target)
            </CardContent>
          </Card>
        </div>

        {/* Category breakdown */}
        <Card>
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-lg">Specialty Subject Breakdown</CardTitle>
            <CardDescription className="text-xs">
              Direct recommendations generated from your historical answer rationales
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-3 space-y-5">
            {categories.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{c.name} ({c.qCount} questions attempted)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{c.score}%</span>
                    <span className="text-[11px] text-foreground-muted">({c.status})</span>
                  </div>
                </div>
                <Progress value={c.score} indicatorColor={c.color} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </LearnerShell>
  );
}
