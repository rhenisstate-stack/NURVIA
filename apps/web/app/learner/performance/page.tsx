"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { nurviaApi } from "@/lib/api-client";
import type { ExamAttemptSummaryDto } from "@/lib/api-types";

export default function PerformancePage() {
  const [attempts, setAttempts] = React.useState<ExamAttemptSummaryDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void nurviaApi.getAttemptHistory().then((response) => {
      if (!active) return;
      if (response.success) {
        setAttempts(response.data || []);
      } else {
        setError(response.message || "Unable to load saved performance.");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const completed = attempts.filter((attempt) =>
    ["Graded", "Submitted"].includes(attempt.status) &&
    typeof attempt.scorePercentage === "number");
  const average = completed.length
    ? completed.reduce((sum, attempt) => sum + (attempt.scorePercentage || 0), 0) / completed.length
    : null;

  return (
    <LearnerShell>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">Saved assessment results</p>
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Performance</h1>
          <p className="max-w-2xl text-sm text-foreground-secondary">Scores and attempt history are calculated from exams you have submitted. No readiness estimate or topic breakdown is shown without recorded data.</p>
        </header>

        {error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
        {loading ? (
          <p className="py-8 text-center text-sm text-foreground-secondary" aria-live="polite">Loading saved performance…</p>
        ) : !error && (
          <>
            <section className="grid gap-4 sm:grid-cols-2" aria-label="Performance summary">
              <Card className="p-5">
                <p className="text-sm text-foreground-secondary">Submitted exams</p>
                <p className="mt-2 font-brand text-3xl font-bold text-foreground">{completed.length}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-foreground-secondary">Average score</p>
                <p className="mt-2 font-brand text-3xl font-bold text-foreground">{average === null ? "—" : `${Math.round(average)}%`}</p>
              </Card>
            </section>

            <section className="space-y-3">
              <h2 className="font-brand text-xl font-bold text-foreground">Score by submitted attempt</h2>
              {completed.length ? (
                <div className="space-y-4">
                  {completed.map((attempt) => {
                    const score = Math.max(0, Math.min(100, attempt.scorePercentage || 0));
                    return (
                      <Card key={attempt.attemptId} className="space-y-3 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{attempt.examTitle}</h3>
                            <p className="mt-1 text-xs text-foreground-muted">
                              {attempt.submittedAtUtc
                                ? new Date(attempt.submittedAtUtc).toLocaleString()
                                : "Submission date unavailable"}
                            </p>
                          </div>
                          <span className="shrink-0 font-bold text-foreground">{score}%</span>
                        </div>
                        <div
                          className="h-3 overflow-hidden rounded-full bg-surface-muted"
                          role="img"
                          aria-label={`${attempt.examTitle}: ${score} percent score`}
                        >
                          <div className="h-full rounded-full bg-brand-teal" style={{ width: `${score}%` }} />
                        </div>
                        <p className="text-xs text-foreground-secondary">
                          {score}% of {attempt.totalQuestions} questions correct by recorded exam score.
                          {attempt.passed === true ? " Passed." : attempt.passed === false ? " Did not meet the exam's configured passing score." : ""}
                        </p>
                        <Link href={`/learner/attempts/${encodeURIComponent(attempt.attemptId)}`} className="inline-block text-sm font-semibold text-brand-teal hover:underline">View result and review</Link>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-6">
                  <p className="font-semibold text-foreground">No submitted results yet.</p>
                  <p className="mt-1 text-sm text-foreground-secondary">Once you submit an exam, its saved score will appear here.</p>
                  <Link href="/learner/exams" className="mt-4 inline-block text-sm font-semibold text-brand-teal hover:underline">Choose an exam</Link>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </LearnerShell>
  );
}
