"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { nurviaApi } from "@/lib/api-client";
import type { ExamDto } from "@/lib/api-types";

const pathways = ["RN", "PN_LPN", "RN_Exit", "PN_Exit"] as const;
type PracticePathway = (typeof pathways)[number];

function isPracticePathway(value: string | null): value is PracticePathway {
  return value !== null && (pathways as readonly string[]).includes(value);
}

export default function CustomPracticePage() {
  // The pathway can be preselected via `?pathway=` (e.g. from the home-page Quick Practice panel).
  const [pathway, setPathway] = React.useState<PracticePathway | null>(null);
  const [exams, setExams] = React.useState<ExamDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("pathway");
    setPathway(isPracticePathway(requested) ? requested : "RN");
  }, []);

  React.useEffect(() => {
    if (!pathway) return;
    let active = true;
    setLoading(true);
    setError(null);
    void nurviaApi.getExams({ status: "Published", pathway, pageSize: 50 }).then((response) => {
      if (!active) return;
      if (response.success) {
        setExams(response.data?.items || []);
      } else {
        setError(response.message || "Unable to load published exams.");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [pathway]);

  return (
    <LearnerShell>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">Quick practice</p>
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Choose a published exam</h1>
          <p className="max-w-2xl text-sm text-foreground-secondary">
            Select an available assessment to create or resume a persisted attempt. Custom question counts and remediation filters are not offered until supported by the exam service.
          </p>
        </header>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by nursing pathway">
          {pathways.map((item) => (
            <Button
              key={item}
              type="button"
              variant={pathway === item ? "primary" : "outline"}
              aria-pressed={pathway === item}
              onClick={() => {
                setPathway(item);
                window.history.replaceState(null, "", `?pathway=${encodeURIComponent(item)}`);
              }}
            >
              {item.replace("_", " ")}
            </Button>
          ))}
        </div>

        {loading && <p className="py-8 text-center text-sm text-foreground-secondary" aria-live="polite">Loading published exams…</p>}
        {error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
        {!loading && !error && exams.length === 0 && (
          <Card className="p-6 text-sm text-foreground-secondary">No published exams are available for this pathway yet.</Card>
        )}
        {!loading && !error && exams.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam) => (
              <Card key={exam.id} className="flex flex-col justify-between gap-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">{exam.pathway} · {exam.category}</p>
                  <h2 className="mt-2 font-brand text-lg font-bold text-foreground">{exam.title}</h2>
                  <p className="mt-2 text-sm text-foreground-secondary">{exam.description}</p>
                  <p className="mt-3 text-xs text-foreground-muted">{exam.totalQuestions} questions · {exam.timeLimitMinutes} minutes</p>
                </div>
                <Link href={`/exam-session?examId=${encodeURIComponent(exam.id)}`}>
                  <Button className="w-full">Start practice</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
