"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, BookOpen } from "lucide-react";

export default function StudyGuidesPage() {
  const guides = [
    { title: "High-Yield Pharmacology Drug Classes & Antidotes", pages: "18 pages", category: "Pharmacology", downloads: "14.2k" },
    { title: "Fluid & Electrolyte Imbalances Quick Clinical Cheat Sheet", pages: "12 pages", category: "Med-Surg", downloads: "21.8k" },
    { title: "Pediatric Developmental Milestones & Vital Signs by Age", pages: "10 pages", category: "Pediatrics", downloads: "11.5k" },
    { title: "Maternal Fetal Heart Rate Interpretation (VEAL CHOP Guide)", pages: "8 pages", category: "Maternity", downloads: "19.3k" },
    { title: "Next Gen NCLEX Clinical Judgment Cognitive Skills Handbook", pages: "24 pages", category: "NCLEX Prep", downloads: "35.1k" },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Study Guides</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Curated Study Guides & Outlines
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            High-yield nursing references distilled for fast memorization before exam day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((g) => (
            <Card key={g.title} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{g.category}</Badge>
                  <span className="text-[11px] text-foreground-muted">{g.pages} · {g.downloads} downloads</span>
                </div>
                <CardTitle className="text-base font-semibold">{g.title}</CardTitle>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs text-brand-teal font-medium">Verified Nurse Educator Content</span>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
