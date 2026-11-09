"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, ArrowRight, Play } from "lucide-react";

export default function StudyPlannerPage() {
  const dailyTasks = [
    { time: "9:00 AM", title: "Review 15 Pharmacology Questions (Cardiac & Anticoagulants)", duration: "25 min", done: true },
    { time: "11:30 AM", title: "Practice 1 Unfolding NGN Case Study (Heart Failure Decompensation)", duration: "20 min", done: true },
    { time: "3:00 PM", title: "ATI Adult Med-Surg Practice Exam (Form B - 30 questions)", duration: "45 min", done: false },
    { time: "7:00 PM", title: "Spaced Repetition Flashcards Review (Dosage Calculations)", duration: "15 min", done: false },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Adaptive Schedule</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Structured daily milestone schedule tailored to your graduation date (May 2026).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today&apos;s Revision Schedule</CardTitle>
                <span className="text-xs text-foreground-muted">2 of 4 tasks completed</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-3">
              {dailyTasks.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-surface-muted/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={t.done ? "text-emerald-600" : "text-foreground-muted"}>
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-foreground">{t.title}</div>
                      <div className="text-[11px] text-foreground-muted flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{t.time} · {t.duration}</span>
                      </div>
                    </div>
                  </div>
                  {!t.done ? (
                    <Link href="/exam-session">
                      <Button size="sm" className="h-7 text-xs bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                        Start Task
                      </Button>
                    </Link>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                      Completed
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-base">Milestone Countdown</CardTitle>
              <CardDescription className="text-xs">High-stakes testing timeline</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-4 text-xs">
              <div className="p-3 rounded-xl border border-border bg-surface-muted/30">
                <span className="text-[11px] text-foreground-muted block">ATI Comprehensive Predictor</span>
                <strong className="text-foreground text-sm">28 Days Remaining</strong>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-muted/30">
                <span className="text-[11px] text-foreground-muted block">Target NCLEX Licensure Date</span>
                <strong className="text-brand-teal text-sm">May 15, 2026</strong>
              </div>
              <Link href="/learner/library" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Browse Curriculum Catalog
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </LearnerShell>
  );
}
