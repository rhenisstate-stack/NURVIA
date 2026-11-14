"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { LearnerShell } from "@/components/layout/learner-shell";
import { StudySetDetails } from "@/components/study/StudySetDetails";

export default function LearnerStudySetDetailPage() {
  const params = useParams<{ id: string }>();
  const examId = params?.id ?? "";

  return (
    <LearnerShell>
      <StudySetDetails examId={examId} />
    </LearnerShell>
  );
}
