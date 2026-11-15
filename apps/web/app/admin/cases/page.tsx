"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import type { QuestionDto } from "@/lib/api-types";

export default function AdminCasesPage() {
  const [cases, setCases] = React.useState<QuestionDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void nurviaApi.getQuestions({ questionType: "ClinicalCaseStudy", pageSize: 50 }).then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setCases(res.data.items);
      } else {
        setError(res.message || "Unable to load clinical case studies.");
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
                Clinical Case Studies
              </h1>
              <Badge variant="teal">ClinicalCaseStudy Items</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Persisted ClinicalCaseStudy questions managed through the standard editorial lifecycle.
            </p>
          </div>

          <Link href="/admin/questions/new">
            <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Author Case Study Question
            </Button>
          </Link>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-foreground-secondary" aria-live="polite">
            Loading clinical case studies…
          </p>
        ) : cases.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-foreground">No ClinicalCaseStudy items authored yet.</p>
            <p className="text-xs text-foreground-secondary">
              Create a new question with type ClinicalCaseStudy in the Question Bank studio to see it here.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((cs) => (
              <Card key={cs.id} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-teal">
                      {cs.code}
                    </span>
                    <Badge variant={cs.status === "Published" ? "teal" : "outline"}>
                      {cs.status}
                    </Badge>
                  </div>

                  <h3 className="font-brand text-base font-bold text-foreground leading-snug line-clamp-2">
                    {cs.currentVersion?.stem || cs.topic}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-foreground-muted">
                    <span>{cs.subject}</span>
                    <span>•</span>
                    <span>{cs.topic}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-foreground-muted">
                    Pathway: {cs.pathway}
                  </span>
                  <Link href={`/admin/questions/${cs.id}/edit`}>
                    <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                      Edit <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
