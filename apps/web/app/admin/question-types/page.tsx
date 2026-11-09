"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  Code2,
  Plus,
} from "lucide-react";

export default function AdminQuestionTypesPage() {
  const registeredTypes = [
    {
      code: "MULTIPLE_CHOICE",
      name: "Standard Multiple Choice (Single Response)",
      scoring: "0/1 Binary",
      status: "Active",
      count: 7850,
      description: "Traditional 4-option item format assessing foundational knowledge and single priority interventions.",
    },
    {
      code: "SATA",
      name: "Select All That Apply (Multiple Response)",
      scoring: "+/- Polytomous",
      status: "Active",
      count: 2410,
      description: "Multiple response item where learners select all true clinical indicators; partial credit with negative penalty down to zero.",
    },
    {
      code: "NGN_CASE_STUDY",
      name: "NGN Unfolding Case Study (6-Item Sequence)",
      scoring: "Polytomous & Binary",
      status: "Active",
      count: 480,
      description: "Progressive clinical scenario following CJMM steps with evolving patient EHR notes, labs, and orders.",
    },
    {
      code: "EXTENDED_DRAG_DROP",
      name: "Extended Drag and Drop (Prioritization / Matching)",
      scoring: "+/- Polytomous",
      status: "Active",
      count: 615,
      description: "Targeted placement of nursing interventions or ordering emergency resuscitation steps.",
    },
    {
      code: "CLOZE_DROPDOWN",
      name: "Drop-Down Cloze (Dyad & Triad)",
      scoring: "0/1 per drop-down",
      status: "Active",
      count: 820,
      description: "Sentence-completion items requiring recognition of cause, effect, and clinical action.",
    },
    {
      code: "MATRIX_GRID",
      name: "Matrix / Grid (Multiple Response)",
      scoring: "0/1 per row",
      status: "Active",
      count: 275,
      description: "Multi-column evaluation grid (e.g. Indicated vs. Contraindicated vs. Non-Essential).",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Question Type Registry
              </h1>
              <Badge variant="teal">NGN Validated</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Registered cognitive item formats, rendering engines, and scoring schema specifications.
            </p>
          </div>

          <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Register Item Schema
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registeredTypes.map((type) => (
            <Card key={type.code} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded">
                    {type.code}
                  </span>
                  <Badge variant="outline">{type.scoring}</Badge>
                </div>
                <h3 className="font-brand text-base font-bold text-foreground">
                  {type.name}
                </h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {type.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                <span>{type.count.toLocaleString()} published questions</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Engine Active
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
