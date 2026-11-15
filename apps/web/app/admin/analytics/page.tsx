"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";

interface AnalyticsData {
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  meanScorePercentage: number | null;
  passRatePercentage: number | null;
  trackBreakdown: {
    pathway: string;
    attemptCount: number;
    completedCount: number;
    meanScorePercentage: number | null;
  }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void nurviaApi.getAdminAnalytics().then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Unable to load analytics.");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleExport = () => {
    if (!data) return;
    const header = ["Pathway", "TotalAttempts", "CompletedAttempts", "MeanScorePercentage"];
    const rows = data.trackBreakdown.map((t) =>
      [t.pathway, t.attemptCount, t.completedCount, t.meanScorePercentage ?? ""].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nurvia-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Assessment &amp; Attempt Analytics
              </h1>
              <Badge variant="teal">Persisted Metrics</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Aggregated examination attempt counts, completion rates, and track-level mean scores from PostgreSQL.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleExport}
            disabled={!data}
            className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Analytics CSV
          </Button>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-foreground-secondary" aria-live="polite">
            Loading persisted analytics…
          </p>
        ) : data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <CardDescription className="text-xs font-semibold text-foreground-muted">
                  Total Exam Attempts
                </CardDescription>
                <div className="font-brand text-2xl font-bold text-foreground mt-1">
                  {data.totalAttempts.toLocaleString()}
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  {data.inProgressAttempts.toLocaleString()} currently in progress
                </p>
              </Card>

              <Card className="p-4">
                <CardDescription className="text-xs font-semibold text-foreground-muted">
                  Completed Attempts
                </CardDescription>
                <div className="font-brand text-2xl font-bold text-foreground mt-1">
                  {data.completedAttempts.toLocaleString()}
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  Submitted or graded
                </p>
              </Card>

              <Card className="p-4">
                <CardDescription className="text-xs font-semibold text-foreground-muted">
                  Mean Assessment Score
                </CardDescription>
                <div className="font-brand text-2xl font-bold text-foreground mt-1">
                  {data.meanScorePercentage !== null ? `${data.meanScorePercentage}%` : "—"}
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  Across completed attempts
                </p>
              </Card>

              <Card className="p-4">
                <CardDescription className="text-xs font-semibold text-foreground-muted">
                  Passing Rate
                </CardDescription>
                <div className="font-brand text-2xl font-bold text-foreground mt-1">
                  {data.passRatePercentage !== null ? `${data.passRatePercentage}%` : "—"}
                </div>
                <p className="text-[11px] text-foreground-secondary mt-1">
                  Attempts meeting exam threshold
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-bold">
                  Attempt Breakdown by Nursing Pathway
                </CardTitle>
                <CardDescription className="text-xs">
                  Recorded attempt volume and mean score per pathway. Item-level psychometric discrimination is not computed in this release.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                {data.trackBreakdown.length === 0 ? (
                  <p className="text-xs text-foreground-secondary">No exam attempts recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.trackBreakdown.map((item) => (
                      <div key={item.pathway} className="p-3 rounded-lg border border-border bg-surface-muted/30 flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{item.pathway}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-foreground-muted">{item.attemptCount} attempts ({item.completedCount} completed)</span>
                          <span className="font-bold text-brand-teal px-2 py-0.5 rounded bg-brand-teal/10">
                            {item.meanScorePercentage !== null ? `${item.meanScorePercentage}% Mean` : "No scores yet"}
                          </span>
                        </div>
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
