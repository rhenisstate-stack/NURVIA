"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  ShieldCheck,
  UserCheck,
  Plus,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function AdminRbacPage() {
  const roles = [
    {
      role: "Platform Administrator",
      description: "Full system administration, tenant configuration, user provisioning, and billing control.",
      usersCount: 3,
      permissions: ["admin:all", "content:publish", "billing:manage", "audit:view"],
    },
    {
      role: "Lead Clinical Nurse Editor",
      description: "Clinical editorial authority; manages blueprint weights, approves peer reviews, and publishes live questions.",
      usersCount: 8,
      permissions: ["content:author", "content:review", "content:publish", "taxonomy:edit"],
    },
    {
      role: "Question Item Author",
      description: "Drafts question stems, distractors, clinical tips, and unfolds NGN case study vignettes.",
      usersCount: 24,
      permissions: ["content:draft", "content:submit_review"],
    },
    {
      role: "Institutional Nursing Faculty",
      description: "Reviews cohort diagnostic reports, assigns practice exams, and monitors student completion.",
      usersCount: 65,
      permissions: ["cohort:view", "reports:export", "assignments:manage"],
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Roles & Role-Based Access Control (RBAC)
              </h1>
              <Badge variant="teal">Backend Enforced</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Role definitions, granular operational claims, and institutional access authorization policies.
            </p>
          </div>

          <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create Role Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r) => (
            <Card key={r.role} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-brand-teal" />
                    <h3 className="font-brand text-base font-bold text-foreground">
                      {r.role}
                    </h3>
                  </div>
                  <Badge variant="outline">{r.usersCount} Assigned</Badge>
                </div>

                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {r.description}
                </p>

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                    Granted Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions.map((p) => (
                      <span key={p} className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-muted border border-border text-foreground-secondary">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Policy Enforced
                </span>
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Edit Role
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
