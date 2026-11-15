"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  BookCheck,
  Users2,
  Plus,
  CheckCircle2,
  Database,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { getPersonalizedGreeting } from "@/lib/greeting-utils";
import { nurviaApi } from "@/lib/api-client";

interface OverviewData {
  totalQuestions: number;
  publishedQuestions: number;
  totalExams: number;
  publishedExams: number;
  totalLearners: number;
  activeLearners: number;
  clinicalCaseStudies: number;
  pipeline: { stage: string; count: number }[];
  recentQuestions: {
    id: string;
    stemPreview: string;
    category: string;
    questionType: string;
    status: string;
    createdAtUtc: string;
  }[];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = React.useState<OverviewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void nurviaApi.getAdminOverview().then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Unable to load admin overview.");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const badgeVariant = (stage: string) => {
    switch (stage) {
      case "Published": return "success" as const;
      case "Approved": return "teal" as const;
      case "Pending Review": return "info" as const;
      case "Validation Failed": return "warning" as const;
      case "Archived": return "outline" as const;
      default: return "default" as const;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              {getPersonalizedGreeting(user?.name) || "Curriculum & Examination Studio"}
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Author, review, publish, and govern nursing examination questions, clinical case studies, and rubrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/questions/new">
              <Button size="sm" className="gap-1.5 bg-brand-teal hover:bg-brand-teal/90 text-white">
                <Plus className="w-4 h-4" /> New Question
              </Button>
            </Link>
            <Link href="/admin/exams">
              <Button variant="outline" size="sm" className="gap-1.5">
                <BookCheck className="w-4 h-4" /> Exam Studio
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Review Queue
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-foreground-secondary" aria-live="polite">
            Loading live studio metrics…
          </p>
        ) : data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
                  <span>Total Question Bank</span>
                  <FileQuestion className="w-4 h-4 text-brand-teal" />
                </div>
                <div className="text-2xl font-bold font-brand text-foreground">
                  {data.totalQuestions.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  {data.publishedQuestions.toLocaleString()} published
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
                  <span>Published Exams</span>
                  <BookCheck className="w-4 h-4 text-brand-teal" />
                </div>
                <div className="text-2xl font-bold font-brand text-foreground">
                  {data.publishedExams.toLocaleString()}
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  {data.totalExams.toLocaleString()} total blueprints
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
                  <span>Active Learners</span>
                  <Users2 className="w-4 h-4 text-brand-teal" />
                </div>
                <div className="text-2xl font-bold font-brand text-foreground">
                  {data.activeLearners.toLocaleString()}
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  {data.totalLearners.toLocaleString()} registered learners
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
                  <span>Clinical Case Studies</span>
                  <Database className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold font-brand text-foreground">
                  {data.clinicalCaseStudies.toLocaleString()}
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  Persisted ClinicalCaseStudy items
                </p>
              </Card>
            </div>

            <Card>
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-lg">Content Publishing Pipeline</CardTitle>
                <CardDescription>Live question distribution across editorial lifecycle stages.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {data.pipeline.map((p) => (
                    <div key={p.stage} className="p-3.5 rounded-xl border border-border bg-surface-muted/30 space-y-2">
                      <Badge variant={badgeVariant(p.stage)}>{p.stage}</Badge>
                      <div className="text-2xl font-bold font-brand text-foreground">{p.count.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Question Bank Items</CardTitle>
                  <CardDescription>Latest persisted items in PostgreSQL.</CardDescription>
                </div>
                <Link href="/admin/questions">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View all <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-6 pt-3">
                {data.recentQuestions.length === 0 ? (
                  <p className="text-sm text-foreground-secondary">No questions found in the database.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {data.recentQuestions.map((q) => (
                      <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <Link href={`/admin/questions/${q.id}/edit`} className="text-sm font-semibold text-foreground hover:text-brand-teal">
                            {q.stemPreview}
                          </Link>
                          <div className="text-xs text-foreground-muted flex items-center gap-2">
                            <span>{q.category}</span>
                            <span>•</span>
                            <span>{q.questionType}</span>
                            <span>•</span>
                            <span>{new Date(q.createdAtUtc).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant={q.status === "Published" ? "success" : "outline"}>{q.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminShell>
  );
}
