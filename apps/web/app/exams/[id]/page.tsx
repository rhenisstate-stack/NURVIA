"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { StudySetDetails } from "@/components/study/StudySetDetails";

export default function PublicExamDetailPage() {
  const params = useParams<{ id: string }>();
  const examId = params?.id ?? "";

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <StudySetDetails examId={examId} isPublic />
      </div>
    </PublicShell>
  );
}
