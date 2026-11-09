"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Library,
  FileText,
  Layers,
  FileSpreadsheet,
  CalendarCheck,
  BotMessageSquare,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
} from "lucide-react";

export default function StudyHubLandingPage() {
  const [search, setSearch] = React.useState("");

  const learningTools = [
    {
      title: "Study Library",
      desc: "Extensive question banks with step-by-step clinical rationales across ATI, HESI, and NCLEX tracks.",
      href: "/learner/library",
      badge: "Question Bank",
      icon: Library,
      highlight: "Over 40,000 vetted items",
    },
    {
      title: "Study Guides & Notes",
      desc: "High-yield clinical summaries, pharmacology cheat sheets, and anatomy-physiology reviews.",
      href: "/learner/guides",
      badge: "Clinical Notes",
      icon: FileText,
      highlight: "Organized by nursing specialty",
    },
    {
      title: "Spaced Repetition Flashcards",
      desc: "Scientifically scheduled recall decks covering lab values, drug mechanisms, and triage protocols.",
      href: "/learner/flashcards",
      badge: "Active Recall",
      icon: Layers,
      highlight: "Leitner-based intervals",
    },
    {
      title: "Custom Practice Engine",
      desc: "Build targeted practice sessions by client needs, cognitive skill level, or specialty weakness.",
      href: "/learner/custom-practice",
      badge: "Adaptive",
      icon: FileSpreadsheet,
      highlight: "Personalized question counts",
    },
    {
      title: "Study Planner & Milestones",
      desc: "Structured daily pacing to keep you on schedule for proctored finals or your NCLEX test appointment.",
      href: "/learner/planner",
      badge: "Organization",
      icon: CalendarCheck,
      highlight: "Exam date countdown",
    },
    {
      title: "AI Clinical Tutor",
      desc: "Socratic guidance that challenges your clinical judgment without handing you answers prematurely.",
      href: "/learner/ai-tutor",
      badge: "AI Powered",
      icon: BotMessageSquare,
      highlight: "24/7 Clinical Reasoning",
    },
    {
      title: "Performance Analytics",
      desc: "Real-time accuracy heatmaps across all six NGN cognitive skills and client need categories.",
      href: "/learner/performance",
      badge: "Analytics",
      icon: TrendingUp,
      highlight: "Readiness predictor metrics",
    },
  ];

  const filteredTools = learningTools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.badge.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Header Hero */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 via-background to-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NURVIA Study Ecosystem</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              A Complete Study Hub Built for Clinical Judgment
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Every tool you need to transition from rote memorization to confident, evidence-based nursing decision making.
            </p>

            {/* Quick Search */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search learning tools and resources..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Study Tools Grid */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h2 className="font-brand text-2xl font-bold text-foreground">
                Core Learning Modules
              </h2>
              <span className="text-xs text-foreground-muted">
                Showing {filteredTools.length} tools
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card
                    key={tool.title}
                    className="flex flex-col justify-between hover:border-brand-teal/50 hover:shadow-md transition-all group"
                  >
                    <CardHeader className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal group-hover:bg-brand-navy group-hover:text-white dark:group-hover:bg-brand-teal transition-colors flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="teal">{tool.badge}</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold">{tool.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {tool.desc}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="text-[11px] font-semibold text-brand-teal flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{tool.highlight}</span>
                      </div>
                      <Link href={tool.href} className="block w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-xs font-semibold h-9 group-hover:bg-brand-navy group-hover:text-white dark:group-hover:bg-brand-teal"
                        >
                          <span>Open {tool.title}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="border-t border-border bg-surface/50 py-16 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="font-brand text-3xl font-bold text-foreground">
              Ready to Accelerate Your Nursing Revision?
            </h2>
            <p className="text-sm text-foreground-secondary max-w-xl mx-auto">
              Access all study tools in your personalized learner workspace. Track your performance, build study habits, and review rationales.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/learner">
                <Button size="lg" className="h-11 px-6 text-xs font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Launch Learner Dashboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/exams">
                <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-semibold">
                  Browse Exam Catalogue
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
