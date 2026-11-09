"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, CheckCircle2, Clock, Play, BookOpen } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import { ExamAttemptSummaryDto } from "@/lib/api-types";

interface DisplayAttempt {
  id: string;
  title: string;
  date: string;
  score: string;
  mode: string;
  duration: string;
  status: string;
  passed?: boolean;
}

const fallbackAttempts: DisplayAttempt[] = [
  {
    id: "att-001",
    title: "ATI Comprehensive Pharmacology Practice Exam",
    date: "Today at 7:45 AM",
    score: "81.5%",
    mode: "Review Mode",
    duration: "32 mins",
    status: "Completed",
    passed: true,
  },
  {
    id: "att-002",
    title: "RN Comprehensive Predictor Exit Examination",
    date: "Yesterday at 4:15 PM",
    score: "78.0%",
    mode: "Timed Exam Mode",
    duration: "58 mins",
    status: "Completed",
    passed: true,
  },
  {
    id: "att-003",
    title: "Dosage Calculations & Pediatric Math",
    date: "3 days ago",
    score: "92.0%",
    mode: "Tutor Mode",
    duration: "18 mins",
    status: "Mastered",
    passed: true,
  },
];

export default function AttemptHistoryPage() {
  const [attempts, setAttempts] = React.useState<DisplayAttempt[]>(fallbackAttempts);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true);
        const res = await nurviaApi.getAttemptHistory();
        if (res.success && res.data && res.data.length > 0) {
          const mapped: DisplayAttempt[] = res.data.map((a: ExamAttemptSummaryDto) => {
            const dateStr = a.submittedAtUtc || a.startedAtUtc;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Recent";

            return {
              id: a.attemptId,
              title: a.examTitle,
              date: formattedDate,
              score:
                a.scorePercentage !== undefined && a.scorePercentage !== null
                  ? `${a.scorePercentage.toFixed(1)}%`
                  : a.status === "InProgress"
                  ? "In Progress"
                  : "Pending",
              mode: a.status === "Completed" ? "Official Exam" : "Active Attempt",
              duration: a.submittedAtUtc ? `${a.totalQuestions} Questions` : "In Progress",
              status: a.status,
              passed: a.passed,
            };
          });
          setAttempts(mapped);
        }
      } catch (err) {
        console.error("Failed to load attempt history", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-foreground-muted">
                      Loading attempt records from NURVIA server...
                    </td>
                  </tr>
                ) : attempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-foreground-muted">
                      No examination attempts recorded yet.
                    </td>
                  </tr>
                ) : (
                  attempts.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="p-4 font-semibold text-foreground">{a.title}</td>
                      <td className="p-4 text-foreground-muted">{a.date}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px]">
                          {a.mode}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {a.score}
                      </td>
                      <td className="p-4 text-foreground-muted">{a.duration}</td>
                      <td className="p-4 text-right">
                        {a.status === "Completed" ? (
                          <Link href={`/exam-session?attemptId=${a.id}&mode=Review`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 hover:text-brand-teal"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Review</span>
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/exam-session?attemptId=${a.id}&mode=Exam`}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-7 text-xs gap-1 bg-brand-teal text-white hover:bg-brand-tealDark"
                            >
                              <Play className="w-3 h-3" />
                              <span>Resume</span>
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
