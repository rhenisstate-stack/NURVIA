"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LearnerShell } from "@/components/layout/learner-shell";
import { StudyLibraryView } from "@/components/study/study-library-view";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Stethoscope, Award, BookOpen } from "lucide-react";

function LearnerExamsContent() {
  const searchParams = useSearchParams();
  const track = searchParams?.get("track") || "RN";
  const category = searchParams?.get("category") || "";

  const trackTitles: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
    RN: {
      title: "Registered Nurse (RN) Examination Track",
      subtitle: "Comprehensive ATI proctored, HESI specialty, and semester course exams for RN students.",
      icon: GraduationCap,
    },
    PN_LPN: {
      title: "Licensed Practical / Vocational Nurse (LPN/PN) Track",
      subtitle: "Focused ATI Practical exams, HESI PN benchmarks, and core skills assessments.",
      icon: Stethoscope,
    },
    RN_Exit: {
      title: "RN Exit & Licensure Predictor Exams",
      subtitle: "High-stakes benchmark simulations for ATI Comprehensive Predictor and HESI Exit assessments.",
      icon: Award,
    },
    PN_Exit: {
      title: "LPN Exit & Benchmark Predictor Exams",
      subtitle: "Predictive exit examinations assessing readiness for NCLEX-PN licensure.",
      icon: Award,
    },
  };

  const currentTrackInfo = trackTitles[track] || trackTitles.RN;
  const Icon = currentTrackInfo.icon;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-r from-surface via-surface to-brand-teal/5 p-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="teal">Pathway Track: {track}</Badge>
          {category && <Badge variant="outline">{category}</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-brand text-2xl font-bold text-foreground">
              {currentTrackInfo.title}
            </h1>
            <p className="text-xs text-foreground-secondary">
              {currentTrackInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      <StudyLibraryView initialTrack={track} initialCategory={category} />
    </div>
  );
}

export default function LearnerExamsPage() {
  return (
    <LearnerShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading exam track...</div>}>
        <LearnerExamsContent />
      </Suspense>
    </LearnerShell>
  );
}
