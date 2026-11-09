"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminAuditPage() {
  const [search, setSearch] = React.useState("");

  const auditEvents = [
    {
      id: "AUD-1049",
      action: "QUESTION_PUBLISHED",
      entity: "Question #Q-8902 (Pediatric Asthma)",
      performedBy: "Dr. Sarah M. (DNP, Lead Editor)",
      ipAddress: "192.168.1.42",
      timestamp: "2026-11-09 11:24:12 UTC",
      status: "SUCCESS",
    },
    {
      id: "AUD-1048",
      action: "BLUEPRINT_UPDATED",
      entity: "ATI RN Comprehensive Predictor Blueprint",
      performedBy: "Prof. James L. (Curriculum Chair)",
      ipAddress: "192.168.1.18",
      timestamp: "2026-11-09 10:48:05 UTC",
      status: "SUCCESS",
    },
    {
      id: "AUD-1047",
      action: "REVIEW_APPROVED",
      entity: "Unfolding Case Study #CS-402 (DKA Management)",
      performedBy: "Rebecca C. (Clinical Nurse Specialist)",
      ipAddress: "192.168.1.89",
      timestamp: "2026-11-09 09:15:30 UTC",
      status: "SUCCESS",
    },
    {
      id: "AUD-1046",
      action: "USER_ROLE_ASSIGNED",
      entity: "Author Role -> dr.martinez@nurvia.edu",
      performedBy: "Admin System (RBAC Controller)",
      ipAddress: "127.0.0.1",
      timestamp: "2026-11-09 08:30:00 UTC",
      status: "SUCCESS",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Security & Editorial Audit Trail
              </h1>
              <Badge variant="teal">SOC-2 & FERPA Logged</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Immutable audit records of content authoring, peer approvals, blueprint revisions, and administrative access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filter Events
            </Button>
          </div>
        </div>

        {/* Audit Records Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-muted/30">
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-foreground-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit records..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {auditEvents.map((event) => (
              <div key={event.id} className="p-4 hover:bg-surface-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-teal">{event.id}</span>
                    <Badge variant="outline" className="text-[10px]">{event.action}</Badge>
                    <span className="font-semibold text-foreground">{event.entity}</span>
                  </div>
                  <div className="text-foreground-secondary text-[11px] flex items-center gap-2">
                    <User className="w-3 h-3 text-foreground-muted" />
                    <span>{event.performedBy}</span>
                    <span>•</span>
                    <span>IP: {event.ipAddress}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center">
                  <span className="text-foreground-muted font-mono text-[11px]">{event.timestamp}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
