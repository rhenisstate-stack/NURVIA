"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Play, Eye, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import { ExamAttemptSummaryDto } from "@/lib/api-types";

// My Library is driven entirely by the learner's persisted attempt history.
// In-progress attempts can be resumed; completed attempts can be reviewed.
// No static or fabricated content is presented as learner data.
export default function MyExamsPage() {
  const [attempts, setAttempts] = React.useState<ExamAttemptSummaryDto[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [loadFailed, setLoadFailed] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;
    async function loadLibrary() {
      try {
        const res = await nurviaApi.getAttemptHistory();
        if (!cancelled) {
          if (res.success && res.data) {
            setAttempts(res.data);
          } else {
            setLoadFailed(true);
          }
        }
      } catch {
        if (!cancelled) setLoadFailed(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void loadLibrary();
    return () => { cancelled = true; };
  }, []);

  const inProgress = attempts.filter((a) => a.status === "InProgress");
  const completed = attempts.filter((a) => a.status !== "InProgress").slice(0, 6);

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              My Library
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Resume examinations in progress and revisit completed attempts saved to your account.
            </p>
          </div>
          <Link href="/learner/exams">
            <Button size="sm" className="text-xs bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
              Browse the Study Library
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-3">
                <div className="h-4 w-24 rounded bg-surface-muted animate-pulse" />
                <div className="h-5 w-3/4 rounded bg-surface-muted animate-pulse" />
                <div className="h-8 w-full rounded bg-surface-muted animate-pulse" />
              </Card>
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <Card className="p-10 text-center space-y-3">
            <BookMarked className="w-8 h-8 mx-auto text-foreground-muted" />
            <p className="font-brand font-bold text-sm text-foreground">
              {loadFailed ? "Your library could not be loaded." : "Your library is empty."}
            </p>
            <p className="text-xs text-foreground-secondary">
              {loadFailed
                ? "Please try again later."
                : "Start an examination from the Study Library and it will appear here with your progress."}
            </p>
            <Link href="/learner/exams">
              <Button size="sm" className="text-xs bg-brand-teal hover:bg-brand-tealDark text-white">
                Open the Study Library
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {inProgress.length > 0 && (
              <section aria-labelledby="continue-heading" className="space-y-4">
                <h2 id="continue-heading" className="font-brand text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-teal" /> Continue where you left off
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {inProgress.map((attempt) => (
                    <Card key={attempt.attemptId} className="p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="teal">In Progress</Badge>
                          <span className="text-xs text-foreground-muted">
                            Started {new Date(attempt.startedAtUtc).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="font-brand font-bold text-sm text-foreground">{attempt.examTitle}</p>
                        <p className="text-xs text-foreground-muted">{attempt.totalQuestions} questions</p>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <Link href={`/exam-session?attemptId=${attempt.attemptId}&mode=Exam`}>
                          <Button size="sm" className="w-full text-xs h-8 gap-1.5 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Resume Exam</span>
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section aria-labelledby="recent-heading" className="space-y-4">
                <h2 id="recent-heading" className="font-brand text-base font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" /> Recent completed attempts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {completed.map((attempt) => (
                    <Card key={attempt.attemptId} className="p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Completed</Badge>
                          {attempt.scorePercentage !== undefined && attempt.scorePercentage !== null ? (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {attempt.scorePercentage.toFixed(1)}%
                            </span>
                          ) : null}
                        </div>
                        <p className="font-brand font-bold text-sm text-foreground">{attempt.examTitle}</p>
                        <p className="text-xs text-foreground-muted">
                          {attempt.submittedAtUtc
                            ? `Submitted ${new Date(attempt.submittedAtUtc).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : `${attempt.totalQuestions} questions`}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <Link href={`/exam-session?attemptId=${attempt.attemptId}&mode=Review`}>
                          <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Answers</span>
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
