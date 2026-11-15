"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, RotateCcw, Trash2 } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";

interface SavedQuestionItem {
  id: string;
  questionId: string;
  examId: string | null;
  stem: string;
  subject: string;
  topic: string;
  questionType: string;
  notes: string | null;
  savedAtUtc: string;
}

export default function SavedQuestionsPage() {
  const [items, setItems] = React.useState<SavedQuestionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const loadSaved = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getSavedQuestions();
    if (res.success && res.data) {
      setItems(res.data);
    } else {
      setError(res.message || "Unable to load saved questions.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const handleRemove = async (questionId: string) => {
    setRemovingId(questionId);
    setError(null);
    const res = await nurviaApi.removeSavedQuestion(questionId);
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.questionId !== questionId));
    } else {
      setError(res.message || "Unable to remove saved question.");
    }
    setRemovingId(null);
  };

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Saved Questions</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Saved &amp; Flagged Questions
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Bookmarked questions persisted to your account for focused rationale review.
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-foreground-secondary" aria-live="polite">
            Loading saved questions…
          </p>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-brand-teal mx-auto" />
            <h2 className="font-brand text-lg font-bold text-foreground">No saved questions yet</h2>
            <p className="text-xs sm:text-sm text-foreground-secondary max-w-md mx-auto">
              Questions you bookmark during practice or review appear here and stay saved across sessions.
            </p>
            <div className="pt-2">
              <Link href="/learner/custom-practice">
                <Button size="sm" className="text-xs bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                  Start Practice Session
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((q) => (
              <Card key={q.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline">{q.subject}</Badge>
                    <span className="text-foreground-muted">{q.topic}</span>
                    <span className="text-foreground-muted">• {q.questionType}</span>
                    <span className="text-foreground-muted">
                      • Saved {new Date(q.savedAtUtc).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                    {q.stem}
                  </p>
                  {q.notes && (
                    <p className="text-xs text-foreground-secondary italic">Note: {q.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={q.examId ? `/exam-session?examId=${encodeURIComponent(q.examId)}` : "/learner/custom-practice"}>
                    <Button size="sm" className="text-xs h-8 gap-1.5 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Practice</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={removingId === q.questionId}
                    onClick={() => void handleRemove(q.questionId)}
                    aria-label="Remove saved question"
                    className="text-xs h-8 text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
