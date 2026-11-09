"use client";

import * as React from "react";
import { Suspense } from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { StudyLibraryView } from "@/components/study/study-library-view";

export default function LearnerStudyLibraryPage() {
  return (
    <LearnerShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading study library...</div>}>
        <StudyLibraryView />
      </Suspense>
    </LearnerShell>
  );
}
