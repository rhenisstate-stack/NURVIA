"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Stethoscope,
  Activity,
} from "lucide-react";

export default function NclexPage() {
  const ngnCognitiveSkills = [
    {
      num: 1,
      title: "Recognize Cues",
      desc: "Identify relevant vs. irrelevant clinical findings, abnormal lab values, and vital sign deviations.",
    },
    {
      num: 2,
      title: "Analyze Cues",
      desc: "Connect clinical cues to pathophysiology, anticipating patient complications and immediate hazards.",
    },
    {
      num: 3,
      title: "Prioritize Hypotheses",
      desc: "Evaluate competing clinical needs to identify the most urgent physiological or safety priority.",
    },
    {
      num: 4,
      title: "Generate Solutions",
      desc: "Identify evidence-based nursing interventions and safety precautions that directly address the priority.",
    },
    {
      num: 5,
      title: "Take Actions",
      desc: "Select the correct implementation steps—pharmacological, non-pharmacological, or interdisciplinary.",
    },
    {
      num: 6,
      title: "Evaluate Outcomes",
      desc: "Determine if clinical interventions were effective by comparing post-intervention assessments to goals.",
    },
  ];

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 via-background to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Next Generation NCLEX Mastery</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Pass NCLEX-RN and NCLEX-PN on Your First Attempt
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Master the NGN Clinical Judgment Measurement Model with authentic adaptive testing, unfolding clinical vignettes, and dual-rationale breakdowns.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/exam-session?track=RN&category=NCLEX">
                <Button size="lg" className="h-12 px-7 text-sm font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Launch NCLEX-RN Simulation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/exams?track=RN">
                <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-semibold">
                  Browse NCLEX Tracks
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 2 Study Tracks: RN vs PN */}
        <section className="py-16 sm:py-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                SELECT YOUR PATHWAY
              </span>
              <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
                Tailored for RN and PN Licensure Candidates
              </h2>
              <p className="text-sm text-foreground-secondary">
                Practice with question difficulty and delegation boundaries matching your exact licensure scope.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* RN Card */}
              <div className="rounded-2xl border border-border bg-surface p-8 space-y-6 hover:border-brand-teal/50 shadow-xs transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <Badge variant="teal" className="mb-1">Registered Nurse</Badge>
                    <h3 className="font-brand text-2xl font-bold text-foreground">
                      NCLEX-RN Pathway
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-foreground-secondary leading-relaxed">
                  Focus on comprehensive assessment, complex medication titration, management of care, clinical delegation, and emergent multi-system decompensation.
                </p>

                <div className="space-y-2 text-xs text-foreground-secondary">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>85 to 150 adaptive items with 3 full unfolding case studies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Focus on complex clinical delegation (RN vs. LPN vs. UAP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Full coverage of NGN polytomous (+/-) scoring mechanics</span>
                  </div>
                </div>

                <Link href="/exams?track=RN" className="block w-full pt-2">
                  <Button className="w-full text-xs font-semibold h-11 bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                    Enter NCLEX-RN Track
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>

              {/* PN Card */}
              <div className="rounded-2xl border border-border bg-surface p-8 space-y-6 hover:border-brand-teal/50 shadow-xs transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1 text-purple-600 border-purple-500/30">Practical Nurse</Badge>
                    <h3 className="font-brand text-2xl font-bold text-foreground">
                      NCLEX-PN Pathway
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-foreground-secondary leading-relaxed">
                  Built specifically around the LPN/PN scope of practice: focused data collection, medication administration safety, routine post-op recovery, and reporting clinical changes.
                </p>

                <div className="space-y-2 text-xs text-foreground-secondary">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Focused clinical data collection vs. initial comprehensive evaluation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Oral and subcutaneous medication administration protocols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Supervised care coordination and immediate nurse notification rules</span>
                  </div>
                </div>

                <Link href="/exams?track=PN_LPN" className="block w-full pt-2">
                  <Button variant="outline" className="w-full text-xs font-semibold h-11">
                    Enter NCLEX-PN Track
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* NGN 6 Cognitive Skills Framework */}
        <section id="ngn-framework" className="py-16 sm:py-20 bg-surface/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                THE NCSBN MEASUREMENT MODEL
              </span>
              <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-foreground">
                Master the Six Cognitive Skills of Clinical Judgment
              </h2>
              <p className="text-sm text-foreground-secondary">
                The Next Gen NCLEX evaluates your ability to think through patient situations safely. NURVIA maps every question to this 6-step clinical framework.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ngnCognitiveSkills.map((skill) => (
                <div
                  key={skill.num}
                  className="rounded-2xl border border-border bg-background p-6 space-y-3 hover:border-brand-teal/50 shadow-2xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold text-sm">
                      {skill.num}
                    </span>
                    <h3 className="font-brand font-bold text-base text-foreground">
                      {skill.title}
                    </h3>
                  </div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {skill.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NCLEX Readiness CTA */}
        <section className="py-16 border-t border-border text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="font-brand text-3xl font-bold text-foreground">
              Ready to Test Your NCLEX Preparedness?
            </h2>
            <p className="text-sm text-foreground-secondary">
              Take an interactive simulation with real timing, NGN question formats, and detailed performance metrics.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/exam-session?track=RN&category=NCLEX">
                <Button size="lg" className="h-11 px-6 text-xs font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Start NCLEX Practice Exam
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/learner/library">
                <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-semibold">
                  Open Study Library
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
