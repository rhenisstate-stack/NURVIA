"use client";

import * as React from "react";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { StudyLibraryView } from "@/components/study/study-library-view";
import { FloatingStudyChat } from "@/components/home/floating-study-chat";

export default function PublicExamsPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading exam catalog...</div>}>
          <StudyLibraryView isPublic />
        </Suspense>
      </div>
      <FloatingStudyChat />
    </PublicShell>
  );
}
