"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  FileCheck,
} from "lucide-react";

export default function AdminCasesPage() {
  const caseStudies = [
    {
      id: "CS-401",
      title: "Acute Pulmonary Embolism Following Total Knee Arthroplasty",
      patient: "M.K., 58yo Male (Post-Op Day 1)",
      specialty: "Medical-Surgical",
      itemsCount: 6,
      status: "Published",
      author: "Dr. Sarah M., DNP",
      views: "14,200",
    },
    {
      id: "CS-402",
      title: "Diabetic Ketoacidosis & Hyperglycemic Emergency in Adolescence",
      patient: "E.J., 16yo Female (ED Admission)",
      specialty: "Critical Care / Endocrine",
      itemsCount: 6,
      status: "Published",
      author: "Rebecca C., CNS",
      views: "9,850",
    },
    {
      id: "CS-403",
      title: "Postpartum Hemorrhage with Chorioamnionitis Complication",
      patient: "A.T., 29yo Female (Stage 4 Labor)",
      specialty: "Maternal-Newborn",
      itemsCount: 6,
      status: "Review Pending",
      author: "Prof. James L., MSN",
      views: "1,120",
    },
    {
      id: "CS-404",
      title: "Severe Sepsis from Untreated Pyelonephritis in Geriatric Client",
      patient: "H.W., 76yo Female (Inpatient Med-Surg)",
      specialty: "Infection & Renal",
      itemsCount: 6,
      status: "Draft",
      author: "Dr. Marcus D., DNP",
      views: "0",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Clinical Case Studies Studio
              </h1>
              <Badge variant="teal">NGN 6-Step Vignettes</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Multi-tab unfolding patient scenarios featuring clinical progress notes, vitals flowsheets, lab panels, and physician orders.
            </p>
          </div>

          <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Author New Case Study
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseStudies.map((cs) => (
            <Card key={cs.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-teal">
                    {cs.id}
                  </span>
                  <Badge
                    variant={
                      cs.status === "Published"
                        ? "teal"
                        : cs.status === "Review Pending"
                        ? "warning"
                        : "outline"
                    }
                  >
                    {cs.status}
                  </Badge>
                </div>

                <h3 className="font-brand text-base font-bold text-foreground leading-snug">
                  {cs.title}
                </h3>

                <p className="text-xs text-foreground-secondary">
                  <strong>Patient Vignette:</strong> {cs.patient}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-foreground-muted">
                  <span>{cs.specialty}</span>
                  <span>•</span>
                  <span>{cs.itemsCount} Cognitive Items</span>
                  <span>•</span>
                  <span>Author: {cs.author}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-foreground-muted">{cs.views} learner attempts</span>
                <Link href="/admin/questions">
                  <Button variant="outline" size="sm" className="text-xs font-semibold h-8">
                    <span>Inspect Case</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
