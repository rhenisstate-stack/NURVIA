"use client";

import * as React from "react";
import { BookOpen, HelpCircle, Layers } from "lucide-react";
import type { StudyLibrarySummaryDto } from "@/lib/api-types";

interface StudyLibraryHeaderProps {
  isPublic?: boolean;
  summary: StudyLibrarySummaryDto | null;
}

export function StudyLibraryHeader({ isPublic = false, summary }: StudyLibraryHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal">
          {isPublic ? "NURVIA Examination Discovery" : "Learner Workspace"}
        </p>
        <h1 className="font-brand text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Study Library
        </h1>
        <p className="max-w-2xl text-sm text-foreground-secondary">
          Discover examinations, practice questions and curated learning resources.
        </p>
      </div>

      {summary && (
        <div className="flex flex-wrap items-center gap-3" aria-label="Live catalog statistics">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2">
            <BookOpen className="h-4 w-4 text-brand-teal" aria-hidden="true" />
            <div>
              <p className="text-xs text-foreground-muted">Study Sets</p>
              <p className="text-sm font-bold text-foreground">{summary.totalPublishedStudySets.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2">
            <HelpCircle className="h-4 w-4 text-brand-teal" aria-hidden="true" />
            <div>
              <p className="text-xs text-foreground-muted">Questions</p>
              <p className="text-sm font-bold text-foreground">{summary.totalAvailableQuestions.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2">
            <Layers className="h-4 w-4 text-brand-teal" aria-hidden="true" />
            <div>
              <p className="text-xs text-foreground-muted">Categories</p>
              <p className="text-sm font-bold text-foreground">{summary.totalCategories.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
