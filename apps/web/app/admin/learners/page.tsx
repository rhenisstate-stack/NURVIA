"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Download } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";

interface LearnerSummary {
  id: string;
  name: string;
  email: string;
  pathway: string;
  isActive: boolean;
  completedExams: number;
  averageScorePercentage: number | null;
  createdAtUtc: string;
}

export default function AdminLearnersPage() {
  const [search, setSearch] = React.useState("");
  const [learners, setLearners] = React.useState<LearnerSummary[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadLearners = React.useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getAdminLearners({
      search: searchTerm.trim() || undefined,
      pageNumber: 1,
      pageSize: 50,
    });
    if (res.success && res.data) {
      setLearners(res.data.items);
      setTotalCount(res.data.totalCount);
    } else {
      setError(res.message || "Unable to load learner directory.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadLearners(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, loadLearners]);

  const handleExportCsv = () => {
    if (!learners.length) return;
    const header = ["Id", "Name", "Email", "Pathway", "Active", "CompletedExams", "AverageScorePercentage", "CreatedAtUtc"];
    const escape = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = learners.map((l) => [
      l.id,
      l.name,
      l.email,
      l.pathway,
      l.isActive ? "Active" : "Inactive",
      l.completedExams,
      l.averageScorePercentage ?? "",
      l.createdAtUtc,
    ].map(escape).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nurvia-learners-${new Date().toISOString().slice(0, 10)}.csv`;
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
                Learner Directory &amp; Activity
              </h1>
              <Badge variant="teal">{totalCount} Learners</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Persisted learner accounts, declared nursing pathways, and recorded exam attempt statistics.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={!learners.length}
            className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Learner CSV
          </Button>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-muted/30">
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-foreground-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search learners by name or email..."
                aria-label="Search learners by name or email"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-center text-xs text-foreground-secondary" aria-live="polite">
              Loading learners…
            </p>
          ) : learners.length === 0 ? (
            <p className="p-8 text-center text-xs text-foreground-secondary">
              No learner accounts match the current filter.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {learners.map((lrn) => (
                <div key={lrn.id} className="p-4 hover:bg-surface-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{lrn.name}</span>
                      <Badge variant="outline" className="text-[10px]">{lrn.pathway}</Badge>
                    </div>
                    <div className="text-foreground-secondary text-[11px] flex items-center gap-2">
                      <Mail className="w-3 h-3 text-foreground-muted" />
                      <span>{lrn.email}</span>
                      <span>•</span>
                      <span>Joined {new Date(lrn.createdAtUtc).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:self-center">
                    <div className="text-right">
                      <span className="block font-bold text-brand-teal">
                        {lrn.averageScorePercentage !== null ? `${lrn.averageScorePercentage}% avg` : "—"}
                      </span>
                      <span className="text-[10px] text-foreground-muted">
                        {lrn.completedExams} completed {lrn.completedExams === 1 ? "exam" : "exams"}
                      </span>
                    </div>
                    <Badge variant={lrn.isActive ? "teal" : "outline"}>
                      {lrn.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
