"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, RotateCcw, ArrowRight } from "lucide-react";

export default function SavedQuestionsPage() {
  const savedQuestions = [
    {
      id: "sq-1",
      stem: "A nurse is preparing to administer digoxin 0.25 mg PO to an adult client diagnosed with heart failure. Which clinical assessment is a priority before administering this medication?",
      subject: "Pharmacology",
      topic: "Cardiac Glycosides",
      savedOn: "Nov 4, 2026",
    },
    {
      id: "sq-2",
      stem: "A 68-year-old male with an established history of systolic heart failure is admitted to telemetry with acute decompensation. Review the client's vital signs and lab results. Which action is the priority?",
      subject: "Medical-Surgical",
      topic: "Heart Failure Decompensation",
      savedOn: "Nov 2, 2026",
    },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Flagged Questions</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Saved & Flagged Questions
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Bookmarked questions saved during practice sessions for focused rationale review.
          </p>
        </div>

        <div className="space-y-4">
          {savedQuestions.map((q) => (
            <Card key={q.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">{q.subject}</Badge>
                  <span className="text-foreground-muted">{q.topic}</span>
                  <span className="text-foreground-muted">• Saved {q.savedOn}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                  {q.stem}
                </p>
              </div>

              <Link href="/exam-session">
                <Button size="sm" className="text-xs h-8 gap-1.5 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Practice Question</span>
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
