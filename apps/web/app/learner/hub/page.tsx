"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  FileText,
  HeartHandshake,
  Calculator,
  BotMessageSquare,
  ArrowRight,
} from "lucide-react";

export default function StudyHubPage() {
  const tools = [
    {
      title: "Study Guides & High-Yield Summaries",
      desc: "Condensed nursing outlines for Pharmacology, Med-Surg, Maternity, and Pediatrics with key memorization hooks.",
      icon: FileText,
      href: "/learner/guides",
      badge: "Curated",
    },
    {
      title: "Spaced Repetition Flashcards",
      desc: "Smart flashcard decks covering drug suffixes, lab values, pediatric milestones, and NCLEX safety rules.",
      icon: Layers,
      href: "/learner/flashcards",
      badge: "SRS Algorithm",
    },
    {
      title: "Clinical Nursing Care Plans",
      desc: "Evidence-based nursing care plans organized by NANDA-I diagnoses with nursing interventions and rationales.",
      icon: HeartHandshake,
      href: "/learner/care-plans",
      badge: "Clinical",
    },
    {
      title: "Clinical Dosage Calculators",
      desc: "Interactive calculators for IV drip rate (gtt/min), pediatric weight-based dosing, and continuous infusion titration.",
      icon: Calculator,
      href: "/learner/calculators",
      badge: "Interactive",
    },
    {
      title: "AI Clinical Judgment Tutor",
      desc: "Socratic AI assistant that guides you through complex clinical vignettes without giving away answers.",
      icon: BotMessageSquare,
      href: "/learner/ai-tutor",
      badge: "AI Powered",
    },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Knowledge Center</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Study Hub Resources
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Essential reference materials, clinical judgment tools, and spaced repetition decks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.title} className="p-6 flex flex-col justify-between hover:border-brand-teal/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline">{t.badge}</Badge>
                  </div>
                  <CardTitle className="text-base">{t.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{t.desc}</CardDescription>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <Link href={t.href}>
                    <Button variant="ghost" size="sm" className="w-full text-xs justify-between p-0 hover:text-brand-teal">
                      <span>Access Resource</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </LearnerShell>
  );
}
