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
  DollarSign,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Database,
  Sliders,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const contentPipeline = [
    { stage: "Drafts", count: 342, badge: "default" as const },
    { stage: "Validation", count: 85, badge: "warning" as const },
    { stage: "Editorial Review", count: 120, badge: "info" as const },
    { stage: "Approved", count: 210, badge: "teal" as const },
    { stage: "Published", count: 12450, badge: "success" as const },
    { stage: "Archived", count: 1420, badge: "outline" as const },
  ];

  const recentQuestions = [
    {
      id: "Q-8902",
      title: "Pediatric Asthma Exacerbation & Bronchodilator Administration",
      category: "Pediatric Nursing",
      type: "NGN Unfolding Case",
      status: "Published",
      author: "Dr. Sarah M., DNP",
      updated: "10 mins ago",
    },
    {
      id: "Q-8901",
      title: "Digoxin Toxicity & Serum Electrolyte Monitoring",
      category: "Pharmacology",
      type: "Select All That Apply",
      status: "Editorial Review",
      author: "Prof. James L., MSN, RN",
      updated: "25 mins ago",
    },
    {
      id: "Q-8900",
      title: "Postpartum Hemorrhage & Oxytocin Titration Protocol",
      category: "Maternal Newborn",
      type: "Multiple Choice",
      status: "Published",
      author: "Rebecca C., CNS",
      updated: "1 hour ago",
    },
    {
      id: "Q-8899",
      title: "Chest Tube Drainage System Complications & Crepitus",
      category: "Adult Med-Surg",
      type: "Matrix Grid",
      status: "Validation",
      author: "Dr. Sarah M., DNP",
      updated: "3 hours ago",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              Curriculum & Examination Studio
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

        {/* Studio Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
              <span>Total Question Bank</span>
              <FileQuestion className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="text-2xl font-bold font-brand text-foreground">12,450</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              +145 added this week
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
              <span>Published Exams</span>
              <BookCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-brand text-foreground">84</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              Across RN, PN & Exit Tracks
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
              <span>Active Learners</span>
              <Users2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold font-brand text-foreground">3,890</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              Logged in during past 30 days
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-xs text-foreground-muted mb-2 font-medium">
              <span>Clinical Vignettes</span>
              <Database className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-brand text-foreground">320 Cases</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              NGN 6-item unfolding sets
            </p>
          </Card>
        </div>

        {/* Content Publishing Lifecycle Pipeline */}
        <Card>
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-lg">Content Lifecycle & Governance Pipeline</CardTitle>
            <CardDescription className="text-xs">
              Immutable versioning: Published items served to ongoing attempts remain locked.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {contentPipeline.map((pipe) => (
                <div key={pipe.stage} className="p-3.5 rounded-xl border border-border bg-surface-muted/40 text-center space-y-1">
                  <Badge variant={pipe.badge} className="text-[10px] mb-1">
                    {pipe.stage}
                  </Badge>
                  <div className="text-xl font-bold font-brand text-foreground">
                    {pipe.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Bank Table Preview */}
        <Card>
          <CardHeader className="p-6 pb-4 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Recent Question Repository Entries</CardTitle>
              <CardDescription className="text-xs">
                Authoritative questions with validated rationales and cognitive skill mappings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/questions">
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1 text-brand-teal border-brand-teal/40">
                  <FileQuestion className="w-3.5 h-3.5" /> Full Question Bank
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-border bg-surface-muted/60 text-foreground-secondary">
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Question Stem / Concept</th>
                  <th className="py-3 px-4 font-semibold">Specialty</th>
                  <th className="py-3 px-4 font-semibold">Format</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Author</th>
                  <th className="py-3 px-4 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-teal">{q.id}</td>
                    <td className="py-3.5 px-4 font-medium text-foreground max-w-xs truncate">
                      {q.title}
                    </td>
                    <td className="py-3.5 px-4 text-foreground-secondary">{q.category}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-surface-muted border border-border px-2 py-0.5 rounded text-[11px]">
                        {q.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          q.status === "Published"
                            ? "success"
                            : q.status === "Validation"
                            ? "warning"
                            : "info"
                        }
                        className="text-[10px]"
                      >
                        {q.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-foreground-secondary">{q.author}</td>
                    <td className="py-3.5 px-4 text-foreground-muted">{q.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
