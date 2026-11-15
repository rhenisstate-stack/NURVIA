"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Cpu, RefreshCw } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";

interface SystemStatus {
  environment: string;
  databaseStatus: string;
  pendingMigrationsCount: number;
  aiTutorProvider: string;
  emailDeliveryMode: string;
  checkedAtUtc: string;
}

export default function AdminSettingsPage() {
  const [status, setStatus] = React.useState<SystemStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getAdminSystemStatus();
    if (res.success && res.data) {
      setStatus(res.data);
    } else {
      setError(res.message || "Unable to load system status.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Platform System Diagnostics
              </h1>
              {status && <Badge variant="teal">{status.environment}</Badge>}
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Read-only runtime health, EF Core migration state, and active service adapters (no secrets exposed).
            </p>
          </div>

          <Button size="sm" variant="outline" onClick={() => void loadStatus()} className="text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Status
          </Button>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-foreground-secondary" aria-live="polite">
            Checking runtime diagnostics…
          </p>
        ) : status && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-brand-teal" />
                <h3 className="font-brand text-lg font-bold text-foreground">
                  PostgreSQL Persistence
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Database Connectivity:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{status.databaseStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Pending Migrations:</span>
                  <span className="font-mono font-semibold">{status.pendingMigrationsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Checked At:</span>
                  <span className="font-mono text-[11px]">{new Date(status.checkedAtUtc).toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-brand-teal" />
                <h3 className="font-brand text-lg font-bold text-foreground">
                  Active Service Adapters
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">AI Tutor Provider:</span>
                  <span className="font-mono font-semibold">{status.aiTutorProvider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Email Delivery Adapter:</span>
                  <span className="font-mono font-semibold">{status.emailDeliveryMode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Answer Disclosure:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Deferred to Stage 4 / Review</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
