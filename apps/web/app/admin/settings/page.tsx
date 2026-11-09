"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HardDrive,
  Database,
  Sliders,
  CheckCircle2,
  Lock,
  Cpu,
  Globe,
} from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Platform System Configuration
              </h1>
              <Badge variant="teal">Production Ready</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Backend runtime settings, database connection health, AI tutor rate limits, and caching policies.
            </p>
          </div>

          <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
            Save System Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Configuration Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-brand-teal" />
              <h3 className="font-brand text-lg font-bold text-foreground">
                PostgreSQL Persistence
              </h3>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Persisted storage source of truth for questions, exams, blueprints, learner attempts, and rationales.
            </p>
            <div className="p-3 rounded-lg bg-surface-muted/50 border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Database Engine:</span>
                <span className="font-mono font-semibold">PostgreSQL 16 (Alpine)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Connection Pool:</span>
                <span className="font-mono font-semibold">Healthy (10/100 active)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Migration State:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Up to Date</span>
              </div>
            </div>
          </Card>

          {/* AI Tutor Engine Settings */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-brand text-lg font-bold text-foreground">
                AI Clinical Tutor Configuration
              </h3>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Socratic clinical prompt templates, cognitive skill alignment, and rate limiting rules.
            </p>
            <div className="p-3 rounded-lg bg-surface-muted/50 border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Reasoning Model:</span>
                <span className="font-mono font-semibold">Gemini 1.5 Pro Clinical</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Socratic Safety Check:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Answer Disclosure:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Deferred to Rationales</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
