"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function AdminTaxonomyPage() {
  const taxonomyNodes = [
    {
      category: "Safe and Effective Care Environment",
      subcategories: ["Management of Care (Delegation, Prioritization)", "Safety and Infection Control (Asepsis, Precautions)"],
      questionCount: 3820,
    },
    {
      category: "Health Promotion and Maintenance",
      subcategories: ["Growth and Development (Pediatrics, Aging)", "Antepartum, Intrapartum & Newborn Care"],
      questionCount: 2190,
    },
    {
      category: "Psychosocial Integrity",
      subcategories: ["Coping and Adaptation (Crisis, Defense Mechanisms)", "Psychopathology and Psychopharmacology"],
      questionCount: 1740,
    },
    {
      category: "Physiological Integrity",
      subcategories: [
        "Basic Care and Comfort",
        "Pharmacological and Parenteral Therapies",
        "Reduction of Risk Potential (Diagnostic Testing, Surgeries)",
        "Physiological Adaptation (Complex Multi-System Care)",
      ],
      questionCount: 4700,
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Curriculum Taxonomy & Blueprint Hierarchy
              </h1>
              <Badge variant="teal">NCSBN / ATI / HESI Mapped</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Hierarchical classification of client needs categories, nursing specialties, and cognitive competencies.
            </p>
          </div>

          <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Category Node
          </Button>
        </div>

        <div className="space-y-4">
          {taxonomyNodes.map((node) => (
            <Card key={node.category} className="p-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4 text-brand-teal" />
                  <h3 className="font-brand text-base font-bold text-foreground">
                    {node.category}
                  </h3>
                </div>
                <Badge variant="outline">{node.questionCount.toLocaleString()} Questions</Badge>
              </div>

              <div className="pt-3 pl-6 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                  Mapped Sub-Competencies:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {node.subcategories.map((sub, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-border bg-surface-muted/30 flex items-center justify-between">
                      <span className="text-foreground">{sub}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-foreground-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
