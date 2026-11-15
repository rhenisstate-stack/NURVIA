"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import type { ExamDto } from "@/lib/api-types";

interface PlannerTask {
  id: string;
  title: string;
  scheduledForUtc: string;
  durationMinutes: number;
  examId: string | null;
  examTitle: string | null;
  isCompleted: boolean;
  completedAtUtc: string | null;
  createdAtUtc: string;
}

export default function StudyPlannerPage() {
  const [tasks, setTasks] = React.useState<PlannerTask[]>([]);
  const [exams, setExams] = React.useState<ExamDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [scheduledDate, setScheduledDate] = React.useState(() => new Date().toISOString().slice(0, 16));
  const [durationMinutes, setDurationMinutes] = React.useState("30");
  const [selectedExamId, setSelectedExamId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const [tasksRes, examsRes] = await Promise.all([
      nurviaApi.getPlannerTasks(),
      nurviaApi.getExams({ status: "Published", pageSize: 25 }),
    ]);
    if (tasksRes.success && tasksRes.data) {
      setTasks(tasksRes.data);
    } else {
      setError(tasksRes.message || "Unable to load study planner tasks.");
    }
    if (examsRes.success && examsRes.data) {
      setExams(examsRes.data.items);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    const duration = Number(durationMinutes);
    const parsedDate = new Date(scheduledDate);

    if (!trimmed) {
      setError("Please enter a study task title.");
      return;
    }
    if (!Number.isFinite(duration) || duration < 5 || duration > 600) {
      setError("Duration must be between 5 and 600 minutes.");
      return;
    }
    if (Number.isNaN(parsedDate.getTime())) {
      setError("Please choose a valid date and time.");
      return;
    }

    setSubmitting(true);
    const res = await nurviaApi.createPlannerTask({
      title: trimmed,
      scheduledForUtc: parsedDate.toISOString(),
      durationMinutes: duration,
      examId: selectedExamId || null,
    });
    setSubmitting(false);

    if (res.success && res.data) {
      setTasks((prev) => [res.data!, ...prev]);
      setTitle("");
      setSelectedExamId("");
    } else {
      setError(res.message || "Unable to create study plan task.");
    }
  };

  const handleToggleComplete = async (task: PlannerTask) => {
    setError(null);
    const res = await nurviaApi.updatePlannerTask(task.id, {
      isCompleted: !task.isCompleted,
    });
    if (res.success && res.data) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data! : t)));
    } else {
      setError(res.message || "Unable to update task status.");
    }
  };

  const handleDelete = async (taskId: string) => {
    setError(null);
    const res = await nurviaApi.deletePlannerTask(taskId);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      setError(res.message || "Unable to delete task.");
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Study Schedule</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Create, track, and link your personal study milestones to published examinations.
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Study Tasks</CardTitle>
                <span className="text-xs text-foreground-muted">
                  {completedCount} of {tasks.length} completed
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-3">
              {loading ? (
                <p className="py-6 text-center text-xs text-foreground-secondary" aria-live="polite">
                  Loading your study tasks…
                </p>
              ) : tasks.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-border text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">No study tasks scheduled yet</p>
                  <p className="text-xs text-foreground-secondary">
                    Add your first study task using the form to track your preparation.
                  </p>
                </div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-border bg-surface-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => void handleToggleComplete(t)}
                        aria-label={t.isCompleted ? "Mark task incomplete" : "Mark task complete"}
                        className={`mt-0.5 ${t.isCompleted ? "text-emerald-600" : "text-foreground-muted hover:text-brand-teal"}`}
                      >
                        {t.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <div>
                        <div className={`font-semibold ${t.isCompleted ? "line-through text-foreground-muted" : "text-foreground"}`}>
                          {t.title}
                        </div>
                        <div className="text-[11px] text-foreground-muted flex flex-wrap items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(t.scheduledForUtc).toLocaleString()} · {t.durationMinutes} min</span>
                          {t.examTitle && <span>• {t.examTitle}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {t.examId ? (
                        <Link href={`/exam-session?examId=${encodeURIComponent(t.examId)}`}>
                          <Button size="sm" className="h-7 text-xs bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                            Start Exam
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/exams">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Browse Exams
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleDelete(t.id)}
                        aria-label="Delete task"
                        className="h-7 px-2 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-base">Add Study Task</CardTitle>
              <CardDescription className="text-xs">Saved directly to your account</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-3">
              <form onSubmit={(e) => void handleCreate(e)} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label htmlFor="planner-title" className="font-semibold text-foreground block">
                    Task Title
                  </label>
                  <input
                    id="planner-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pharmacology Cardiac Review"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="planner-date" className="font-semibold text-foreground block">
                    Scheduled Date &amp; Time
                  </label>
                  <input
                    id="planner-date"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="planner-duration" className="font-semibold text-foreground block">
                    Duration (minutes)
                  </label>
                  <input
                    id="planner-duration"
                    type="number"
                    min={5}
                    max={600}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="planner-exam" className="font-semibold text-foreground block">
                    Link Published Exam (optional)
                  </label>
                  <select
                    id="planner-exam"
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  >
                    <option value="">None</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="w-full text-xs bg-brand-teal hover:bg-brand-tealDark text-white gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {submitting ? "Saving…" : "Add Study Task"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </LearnerShell>
  );
}
