"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";

interface QuestionTypeInfo {
  codeValue: number;
  code: string;
  name: string;
  gradingMode: string;
  description: string;
  questionCount: number;
}

export default function AdminQuestionTypesPage() {
  const [types, setTypes] = React.useState<QuestionTypeInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void nurviaApi.getAdminQuestionTypes().then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setTypes(res.data);
      } else {
        setError(res.message || "Unable to load question type registry.");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Question Type Registry (18 Canonical Formats)
              </h1>
              <Badge variant="teal">Fail-Closed Grader</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              All 18 canonical question renderers, their backend grading behavior, and live question counts from PostgreSQL.
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-foreground-secondary" aria-live="polite">
            Loading canonical question types…
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {types.map((type) => (
              <Card key={type.codeValue} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded">
                      #{type.codeValue} · {type.code}
                    </span>
                    <Badge variant={type.gradingMode === "PendingManualReview" ? "warning" : "outline"}>
                      {type.gradingMode}
                    </Badge>
                  </div>
                  <h3 className="font-brand text-base font-bold text-foreground">
                    {type.name}
                  </h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {type.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                  <span>{type.questionCount.toLocaleString()} persisted {type.questionCount === 1 ? "question" : "questions"}</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Renderer Registered
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
