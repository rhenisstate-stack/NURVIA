"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, CheckCircle2, Clock } from "lucide-react";

export default function AttemptHistoryPage() {
  const attempts = [
    {
      id: "att-001",
      title: "ATI Comprehensive Pharmacology Practice Exam",
      date: "Today at 7:45 AM",
      score: "81.5%",
      mode: "Review Mode",
      duration: "32 mins",
      status: "Completed",
    },
    {
      id: "att-002",
      title: "RN Comprehensive Predictor Exit Examination",
      date: "Yesterday at 4:15 PM",
      score: "78.0%",
      mode: "Timed Exam Mode",
      duration: "58 mins",
      status: "Completed",
    },
    {
      id: "att-003",
      title: "Dosage Calculations & Pediatric Math",
      date: "3 days ago",
      score: "92.0%",
      mode: "Tutor Mode",
      duration: "18 mins",
      status: "Mastered",
    },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Record of Attempts</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Attempt History
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Review detailed question logs, historical scores, and individual rationale breakdowns.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border text-foreground-secondary font-semibold">
                <tr>
                  <th className="p-4">Exam / Practice Set</th>
                  <th className="p-4">Date Completed</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{a.title}</td>
                    <td className="p-4 text-foreground-muted">{a.date}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px]">{a.mode}</Badge>
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{a.score}</td>
                    <td className="p-4 text-foreground-muted">{a.duration}</td>
                    <td className="p-4 text-right">
                      <Link href="/exam-session">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:text-brand-teal">
                          <RotateCcw className="w-3 h-3" />
                          <span>Review</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
