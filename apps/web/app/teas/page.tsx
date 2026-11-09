"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Microscope,
  Calculator,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

interface TeasSubject {
  title: string;
  category: string;
  questionCountEstimate: string;
  icon: React.ElementType;
  description: string;
  keyTopics: string[];
  practiceUrl: string;
}

const teasSubjects: TeasSubject[] = [
  {
    title: "Science & Anatomy",
    category: "High-Yield Admission Core",
    questionCountEstimate: "50 Scored Questions",
    icon: Microscope,
    description: "In-depth review of human anatomy & physiology organ systems, basic cellular biology, genetics, and scientific methodology.",
    keyTopics: [
      "Cardiovascular, respiratory, renal, and gastrointestinal systems",
      "Endocrine feedback loops and neuroanatomy basics",
      "Chemical bonding, periodic trends, and solution concentration",
    ],
    practiceUrl: "/exams?category=ATI",
  },
  {
    title: "Reading Comprehension",
    category: "Verbal Competence",
    questionCountEstimate: "45 Scored Questions",
    icon: BookOpen,
    description: "Passage analysis, identifying primary arguments, differentiating fact from opinion, and synthesizing multi-paragraph clinical passages.",
    keyTopics: [
      "Key ideas, author tone, and primary intended audience",
      "Text structure: cause/effect, compare/contrast, sequence",
      "Interpreting graphic information, tables, and medical diagrams",
    ],
    practiceUrl: "/exams?category=ATI",
  },
  {
    title: "Mathematics & Conversions",
    category: "Quantitative Reasoning",
    questionCountEstimate: "38 Scored Questions",
    icon: Calculator,
    description: "Foundational arithmetic, algebraic equations, fractions, decimals, percentages, metric conversions, and ratio proportions.",
    keyTopics: [
      "Metric system conversions (mg to mcg, mL to L, kg to lbs)",
      "Solving single-variable and multi-step algebraic equations",
      "Statistical reasoning: mean, median, mode, and probability tables",
    ],
    practiceUrl: "/learner/calculators",
  },
  {
    title: "English & Language Usage",
    category: "Grammar & Communication",
    questionCountEstimate: "37 Scored Questions",
    icon: FileText,
    description: "Standard English grammar rules, spelling conventions, punctuation, sentence structure clarity, and medical context vocabulary.",
    keyTopics: [
      "Subject-verb agreement and pronoun-antecedent consistency",
      "Common medical terminology prefixes, suffixes, and roots",
      "Sentence mechanics: run-ons, comma splices, and dangling modifiers",
    ],
    practiceUrl: "/exams?category=ATI",
  },
];

export default function TeasPage() {
  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 via-background to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pre-Nursing Admission Exam</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              TEAS Examination Preparation
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Build the academic foundation required for nursing school admission. Master Science, Reading, Math, and English with structured practice.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/exams?category=ATI">
                <Button size="lg" className="h-12 px-7 text-sm font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Explore Pre-Nursing Practice Sets
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/learner/library">
                <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-semibold">
                  Study Library
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Subjects Grid */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                TEST CONTENT OUTLINE
              </span>
              <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
                Four Tested Core Disciplines
              </h2>
              <p className="text-sm text-foreground-secondary">
                The ATI TEAS consists of 170 total questions designed to measure preparedness for health-science programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teasSubjects.map((sub) => {
                const Icon = sub.icon;
                return (
                  <Card
                    key={sub.title}
                    className="flex flex-col justify-between hover:border-brand-teal/50 hover:shadow-md transition-all group p-1"
                  >
                    <CardHeader className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal group-hover:bg-brand-navy group-hover:text-white dark:group-hover:bg-brand-teal transition-colors flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="teal">{sub.category}</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold">{sub.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {sub.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">
                          Key Focus Areas:
                        </span>
                        {sub.keyTopics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-foreground-muted font-mono">{sub.questionCountEstimate}</span>
                        <Link href={sub.practiceUrl}>
                          <Button size="sm" variant="outline" className="text-xs font-semibold h-8">
                            Practice Topic
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Disclaimer / Transparency Box */}
        <section className="py-12 border-t border-border bg-surface/50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="p-5 rounded-2xl border border-border bg-background flex flex-col sm:flex-row items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-brand-teal shrink-0 mt-1" />
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-foreground block text-sm">
                  Independent Educational Notice
                </span>
                <p className="text-foreground-secondary leading-relaxed">
                  ATI® and TEAS® are registered trademarks of Assessment Technologies Institute, LLC, which is unaffiliated with NURVIA. NURVIA provides independent review materials and original practice problems designed to help students master physiological and mathematical prerequisites.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
