"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users2,
  Search,
  Filter,
  UserCheck,
  GraduationCap,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function AdminLearnersPage() {
  const [search, setSearch] = React.useState("");

  const learners = [
    {
      id: "LRN-7701",
      name: "Octavio O.",
      email: "octavio.o@student.edu",
      track: "NCLEX-PN",
      cohort: "Spring 2026",
      status: "Active (Exam Passed)",
      completedExams: 28,
      readinessScore: "94.2%",
    },
    {
      id: "LRN-7702",
      name: "Brittany P.",
      email: "brittany.p@student.edu",
      track: "NCLEX-RN",
      cohort: "Spring 2026",
      status: "Active (Exam Passed)",
      completedExams: 42,
      readinessScore: "96.5%",
    },
    {
      id: "LRN-7703",
      name: "Marcus D.",
      email: "marcus.d@student.edu",
      track: "ATI Comprehensive",
      cohort: "Fall 2026",
      status: "Active",
      completedExams: 19,
      readinessScore: "88.0%",
    },
    {
      id: "LRN-7704",
      name: "Aaliyah K.",
      email: "aaliyah.k@student.edu",
      track: "HESI Exit",
      cohort: "Fall 2026",
      status: "Active",
      completedExams: 34,
      readinessScore: "91.8%",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Learner Directory & Readiness Tracking
              </h1>
              <Badge variant="teal">FERPA Compliant</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Enrollment status, simulation activity records, and predictive NCLEX readiness metrics.
            </p>
          </div>

          <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
            Export Student Roster
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-muted/30">
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-foreground-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students by name or email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {learners.map((lrn) => (
              <div key={lrn.id} className="p-4 hover:bg-surface-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{lrn.name}</span>
                    <Badge variant="outline" className="text-[10px]">{lrn.track}</Badge>
                    <span className="text-[11px] text-foreground-muted font-mono">{lrn.id}</span>
                  </div>
                  <div className="text-foreground-secondary text-[11px] flex items-center gap-2">
                    <Mail className="w-3 h-3 text-foreground-muted" />
                    <span>{lrn.email}</span>
                    <span>•</span>
                    <span>Cohort: {lrn.cohort}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:self-center">
                  <div className="text-right">
                    <span className="block font-bold text-brand-teal">{lrn.readinessScore}</span>
                    <span className="text-[10px] text-foreground-muted">{lrn.completedExams} exams finished</span>
                  </div>
                  <Badge variant="teal">{lrn.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
