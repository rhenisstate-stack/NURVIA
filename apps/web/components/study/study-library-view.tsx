"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { nurviaApi } from "@/lib/api-client";
import type { ExamDto } from "@/lib/api-types";

const pathways = ["All", "RN", "PN_LPN", "RN_Exit", "PN_Exit"] as const;
const categories = ["All", "ATI", "HESI", "RegularCourse", "Certification", "ExitPredictor"] as const;

interface StudyLibraryViewProps {
  isPublic?: boolean;
  initialTrack?: string;
  initialCategory?: string;
}

export function StudyLibraryView({
  isPublic = false,
  initialTrack,
  initialCategory,
}: StudyLibraryViewProps) {
  const searchParams = useSearchParams();
  const queryTrack = initialTrack || searchParams?.get("track") || "All";
  const queryCategory = initialCategory || searchParams?.get("category") || "All";
  const [pathway, setPathway] = React.useState<string>(queryTrack);
  const [category, setCategory] = React.useState<string>(queryCategory);
  const [search, setSearch] = React.useState(searchParams?.get("q") || "");
  const [exams, setExams] = React.useState<ExamDto[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void nurviaApi.getExams({
      status: "Published",
      pathway: pathway === "All" ? undefined : pathway,
      category: category === "All" ? undefined : category,
      searchTerm: search.trim() || undefined,
      pageSize: 100,
    }).then((response) => {
      if (!active) return;
      if (!response.success || !response.data) {
        setError(response.message || "Unable to load published exams.");
      } else {
        setExams(response.data.items);
        setTotalCount(response.data.totalCount);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [pathway, category, search, retryCount]);

  React.useEffect(() => {
    setPathway(queryTrack);
    setCategory(queryCategory);
  }, [queryTrack, queryCategory]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-2xl font-extrabold text-foreground sm:text-3xl">
          {isPublic ? "Explore published exams" : "Exam library"}
        </h1>
        <p className="text-sm text-foreground-secondary">
          Browse available assessments by nursing pathway and exam category.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
        <label htmlFor="exam-search" className="sr-only">Search published exams</label>
        <input
          id="exam-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search exam titles or descriptions"
          className="h-11 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Nursing pathway</legend>
        <div className="flex flex-wrap gap-2">
          {pathways.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={pathway === item ? "primary" : "outline"}
              aria-pressed={pathway === item}
              onClick={() => setPathway(item)}
            >
              {item.replace("_", " ")}
            </Button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Exam category</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={category === item ? "primary" : "outline"}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </Button>
          ))}
        </div>
      </fieldset>

      {!loading && !error && (
        <p className="text-xs text-foreground-muted" aria-live="polite">
          Showing {exams.length} of {totalCount} published exam{totalCount === 1 ? "" : "s"}.
        </p>
      )}
      {loading && <p className="py-8 text-center text-sm text-foreground-secondary" aria-live="polite">Loading published exams…</p>}
      {error && (
        <div role="alert" className="space-y-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setRetryCount((count) => count + 1)}>Retry</Button>
        </div>
      )}
      {!loading && !error && exams.length === 0 && (
        <Card className="p-6">
          <p className="font-semibold text-foreground">No published exams match these filters.</p>
          <p className="mt-1 text-sm text-foreground-secondary">Try another pathway or category, or check back when more assessments are published.</p>
        </Card>
      )}
      {!loading && !error && exams.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam }: { exam: ExamDto }) {
  // Direct mode access: each card action resolves the mode against the exam's
  // configured delivery modes so unavailable modes are never offered.
  const modeAllowed = exam.modeAllowed;
  const canExam = modeAllowed === "All" || modeAllowed === "Exam";
  const canReview = modeAllowed === "All" || modeAllowed === "Review";
  const canTutor = modeAllowed === "All" || modeAllowed === "Tutor";

  const currentVersion = exam.currentVersion;
  const layoutPolicy = currentVersion?.allowedLayouts ?? "Both";

  const buildSessionHref = (mode: "Exam" | "Review" | "Tutor") => {
    const params = new URLSearchParams({ examId: exam.id, mode });
    // Restricted-layout exams start directly in their only permitted layout;
    // when both layouts are permitted the session shows the layout selector
    // before starting so the learner makes an explicit choice.
    if (layoutPolicy === "AllInOneOnly") params.set("layout", "AllInOne");
    else if (layoutPolicy === "SequentialOnly") params.set("layout", "Sequential");
    return `/exam-session?${params.toString()}`;
  };

  return (
    <Card className="flex flex-col justify-between gap-5 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
          {exam.pathway.replace("_", " ")} · {exam.category.replace(/([a-z])([A-Z])/g, "$1 $2")}
        </p>
        <h2 className="mt-2 font-brand text-lg font-bold text-foreground">{exam.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground-secondary">{exam.description}</p>
        <p className="mt-3 text-xs text-foreground-muted">
          {exam.totalQuestions} questions · {exam.timeLimitMinutes} minutes
        </p>
      </div>
      <div className="space-y-2">
        {canExam && (
          <Link href={buildSessionHref("Exam")} className="block">
            <Button className="w-full">Start this exam</Button>
          </Link>
        )}
        <div className="grid grid-cols-2 gap-2">
          {canReview && (
            <Link href={buildSessionHref("Review")} className="block">
              <Button variant="outline" size="sm" className="w-full">Review</Button>
            </Link>
          )}
          {canTutor && (
            <Link href={buildSessionHref("Tutor")} className="block">
              <Button variant="outline" size="sm" className="w-full">Tutor</Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
