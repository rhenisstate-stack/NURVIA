"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nurviaApi } from "@/lib/api-client";
import type { ExamDto } from "@/lib/api-types";
import { Sparkles } from "lucide-react";

const pathways = ["RN", "PN_LPN", "RN_Exit", "PN_Exit"] as const;
type PracticePathway = (typeof pathways)[number];

function isPracticePathway(value: string | null): value is PracticePathway {
  return value !== null && (pathways as readonly string[]).includes(value);
}

export default function CustomPracticePage() {
  const router = useRouter();
  const [pathway, setPathway] = React.useState<PracticePathway | null>(null);
  const [exams, setExams] = React.useState<ExamDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [diyTitle, setDiyTitle] = React.useState("");
  const [diyCount, setDiyCount] = React.useState(25);
  const [diyMinutes, setDiyMinutes] = React.useState(45);
  const [diyCreating, setDiyCreating] = React.useState(false);
  const [diyError, setDiyError] = React.useState<string | null>(null);
  const [diySuccess, setDiySuccess] = React.useState<string | null>(null);

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

  const handleCreateDiy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diyTitle.trim()) return;
    setDiyCreating(true);
    setDiyError(null);
    setDiySuccess(null);
    const res = await nurviaApi.createDiyExam({
      title: diyTitle.trim(),
      totalQuestions: Number(diyCount) || 25,
      timeLimitMinutes: Number(diyMinutes) || 45,
      pathway: pathway || "RN",
    });
    if (res.success && res.data) {
      const createdId =
        typeof res.data.id === "string" || typeof res.data.id === "number"
          ? String(res.data.id)
          : typeof res.data.guidId === "string"
            ? res.data.guidId
            : null;
      if (createdId) {
        router.push(`/exam-session?examId=${encodeURIComponent(createdId)}`);
        return;
      }
      setDiySuccess("Custom DIY practice exam created on the server.");
      setDiyTitle("");
    } else {
      setDiyError(res.message || "Unable to create custom DIY exam on the server.");
    }
    setDiyCreating(false);
  };

  return (
    <LearnerShell>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">Quick practice</p>
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Custom Practice &amp; Published Exams</h1>
          <p className="max-w-2xl text-sm text-foreground-secondary">
            Build a custom DIY practice exam via LexmaCasto or select an available published assessment below.
          </p>
        </header>

        <Card className="p-5 space-y-4">
          <h2 className="font-brand text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-teal" /> Create Custom DIY Practice Exam
          </h2>
          {diyError && (
            <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {diyError}
            </p>
          )}
          {diySuccess && (
            <p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
              {diySuccess}
            </p>
          )}
          <form onSubmit={handleCreateDiy} className="grid gap-4 sm:grid-cols-4 items-end">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="diy-title">Practice Title</Label>
              <Input
                id="diy-title"
                value={diyTitle}
                onChange={(e) => setDiyTitle(e.target.value)}
                placeholder="e.g., Pharmacology Timed Drill"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diy-count">Questions</Label>
              <Input
                id="diy-count"
                type="number"
                min={5}
                max={150}
                value={diyCount}
                onChange={(e) => setDiyCount(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diy-minutes">Minutes</Label>
              <Input
                id="diy-minutes"
                type="number"
                min={5}
                max={360}
                value={diyMinutes}
                onChange={(e) => setDiyMinutes(Number(e.target.value))}
                required
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <Button type="submit" disabled={diyCreating}>
                {diyCreating ? "Creating..." : "Create & Start DIY Practice"}
              </Button>
            </div>
          </form>
        </Card>

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

        {loading && <p className="py-8 text-center text-sm text-foreground-secondary" aria-live="polite">Loading published exams...</p>}
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
