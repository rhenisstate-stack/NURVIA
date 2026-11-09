"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { nurviaApi } from "@/lib/api-client";
import type { SubmittedExamResultDto } from "@/lib/api-types";

function isUnanswered(response?: string) {
  return !response || ["null", '""', "[]", "{}"].includes(response.trim());
}

export default function AttemptResultPage() {
  const params = useParams<{ id: string }>();
  const attemptId = params.id;
  const [result, setResult] = React.useState<SubmittedExamResultDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void nurviaApi.getAttemptReview(attemptId).then((response) => {
      if (!active) return;
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message || "Unable to load this saved result.");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [attemptId]);

  const unanswered = result?.reviewQuestions.filter((question) =>
    isUnanswered(question.learnerResponse)).length || 0;
  const correct = result?.correctQuestions || 0;
  const incorrect = Math.max(0, (result?.totalQuestions || 0) - correct - unanswered);
  const distribution = [
    { label: "Correct", value: correct, color: "bg-emerald-500" },
    { label: "Incorrect", value: incorrect, color: "bg-rose-500" },
    { label: "Unanswered", value: unanswered, color: "bg-slate-400" },
  ];

  return (
    <LearnerShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">Persisted exam result</p>
            <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Result and review</h1>
          </div>
          <Link href="/learner"><Button variant="outline">Back to dashboard</Button></Link>
        </div>

        {loading && <p className="py-8 text-center text-sm text-foreground-secondary" aria-live="polite">Loading saved result…</p>}
        {error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}

        {result && (
          <>
            <Card className="space-y-5 p-6 sm:p-8">
              <div>
                <h2 className="font-brand text-xl font-bold text-foreground">{result.examTitle}</h2>
                <p className="mt-1 text-sm text-foreground-secondary">
                  Submitted {new Date(result.submittedAtUtc).toLocaleString()}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs text-foreground-secondary">Score</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{result.scorePercentage}%</p>
                  {result.passed !== null && <p className="mt-1 text-xs text-foreground-secondary">{result.passed ? "Met" : "Did not meet"} configured passing score ({result.passingScorePercentage}%).</p>}
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs text-foreground-secondary">Questions correct</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{result.correctQuestions} / {result.totalQuestions}</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs text-foreground-secondary">Time recorded</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{Math.max(0, Math.round(result.timeSpentSeconds / 60))} min</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 p-6">
              <div>
                <h2 className="font-brand text-lg font-bold text-foreground">Question outcome distribution</h2>
                <p className="mt-1 text-sm text-foreground-secondary">
                  {correct} correct, {incorrect} incorrect, and {unanswered} unanswered out of {result.totalQuestions} questions.
                </p>
              </div>
              <div className="space-y-4" aria-label="Question outcome counts">
                {distribution.map((item) => {
                  const percentage = result.totalQuestions > 0
                    ? (item.value / result.totalQuestions) * 100
                    : 0;
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground-secondary">{item.label}</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                      <div
                        className="h-3 overflow-hidden rounded-full bg-surface-muted"
                        role="img"
                        aria-label={`${item.label}: ${item.value} of ${result.totalQuestions}`}
                      >
                        <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <section className="space-y-4">
              <h2 className="font-brand text-xl font-bold text-foreground">Question review</h2>
              {result.reviewQuestions.map((question) => (
                <Card key={question.questionId} className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Question {question.orderIndex}</p>
                    <span className={question.isCorrect ? "text-xs font-semibold text-emerald-700 dark:text-emerald-300" : "text-xs font-semibold text-rose-700 dark:text-rose-300"}>
                      {isUnanswered(question.learnerResponse) ? "Unanswered" : question.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">{question.stem}</p>
                  {question.options.length > 0 && (
                    <ul className="space-y-2">
                      {question.options.map((option) => (
                        <li key={option.id} className="rounded-lg border border-border p-3 text-sm text-foreground-secondary">
                          <span className="font-medium text-foreground">{option.optionText}</span>
                          <span className="ml-2 text-xs">
                            {option.isCorrect ? "Correct answer" : ""}
                            {option.wasSelected ? " · Your selection" : ""}
                          </span>
                          {option.specificRationale && <p className="mt-1 text-xs">{option.specificRationale}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {question.generalRationale && (
                    <p className="border-t border-border pt-3 text-sm leading-relaxed text-foreground-secondary">{question.generalRationale}</p>
                  )}
                </Card>
              ))}
            </section>
          </>
        )}
      </div>
    </LearnerShell>
  );
}
