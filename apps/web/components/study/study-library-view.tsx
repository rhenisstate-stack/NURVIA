"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { nurviaApi } from "@/lib/api-client";
import type {
  StudyLibraryFiltersDto,
  StudyLibrarySummaryDto,
  StudySetCardDto,
} from "@/lib/api-types";
import {
  StudyLibraryAdvancedFilters,
  type AdvancedFilterState,
} from "./StudyLibraryAdvancedFilters";
import { StudyLibraryCategoryTabs } from "./StudyLibraryCategoryTabs";
import { StudyLibraryHeader } from "./StudyLibraryHeader";
import { StudyLibrarySearch } from "./StudyLibrarySearch";
import {
  StudyLibraryEmptyState,
  StudyLibraryLoadingState,
  StudyLibraryPagination,
  StudyLibraryResultsHeader,
} from "./StudyLibraryStates";
import { StudySetCard } from "./StudySetCard";

interface StudyLibraryViewProps {
  isPublic?: boolean;
  initialTrack?: string;
  initialCategory?: string;
}

const DEFAULT_ADVANCED: AdvancedFilterState = {
  school: "",
  academicYear: "",
  subject: "",
  season: "",
  examId: "",
  topic: "",
  difficulty: "",
  questionType: "",
  savedOnly: false,
};

const PAGE_SIZE = 12;

export function StudyLibraryView({
  isPublic = false,
  initialTrack,
  initialCategory,
}: StudyLibraryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryTrack = initialTrack || searchParams?.get("track") || "All";
  const queryCategory = initialCategory || searchParams?.get("category") || "All";

  const [pathway, setPathway] = React.useState<string>(queryTrack);
  const [category, setCategory] = React.useState<string>(queryCategory);
  const [searchInput, setSearchInput] = React.useState(searchParams?.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchInput);
  const [advanced, setAdvanced] = React.useState<AdvancedFilterState>({
    school: searchParams?.get("school") || "",
    academicYear: searchParams?.get("year") || "",
    subject: searchParams?.get("subject") || "",
    season: searchParams?.get("season") || "",
    examId: searchParams?.get("examId") || "",
    topic: searchParams?.get("topic") || "",
    difficulty: searchParams?.get("difficulty") || "",
    questionType: searchParams?.get("questionType") || "",
    savedOnly: searchParams?.get("saved") === "true",
  });
  const [pageNumber, setPageNumber] = React.useState<number>(
    Math.max(1, Number(searchParams?.get("page") || "1") || 1)
  );

  const [studySets, setStudySets] = React.useState<StudySetCardDto[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [filtersData, setFiltersData] = React.useState<StudyLibraryFiltersDto | null>(null);
  const [summary, setSummary] = React.useState<StudyLibrarySummaryDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [toast, setToast] = React.useState<string | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPageNumber(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Sync incoming route track/category props
  React.useEffect(() => {
    setPathway(queryTrack);
    setCategory(queryCategory);
  }, [queryTrack, queryCategory]);

  // Auto-dismiss toast notifications
  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Fetch data-driven filters & live catalog summary once
  React.useEffect(() => {
    let active = true;
    void Promise.all([
      nurviaApi.getStudyLibraryFilters(),
      nurviaApi.getStudyLibrarySummary(),
    ]).then(([filtersRes, summaryRes]) => {
      if (!active) return;
      if (filtersRes.success && filtersRes.data) setFiltersData(filtersRes.data);
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync URL query params
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (pathway !== "All") params.set("track", pathway);
    if (category !== "All") params.set("category", category);
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (advanced.school) params.set("school", advanced.school);
    if (advanced.academicYear) params.set("year", advanced.academicYear);
    if (advanced.subject) params.set("subject", advanced.subject);
    if (advanced.season) params.set("season", advanced.season);
    if (advanced.examId) params.set("examId", advanced.examId);
    if (advanced.topic) params.set("topic", advanced.topic);
    if (advanced.difficulty) params.set("difficulty", advanced.difficulty);
    if (advanced.questionType) params.set("questionType", advanced.questionType);
    if (advanced.savedOnly) params.set("saved", "true");
    if (pageNumber > 1) params.set("page", String(pageNumber));

    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, pathway, category, debouncedSearch, advanced, pageNumber]);

  // Fetch paginated study sets from backend
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    void nurviaApi
      .getStudyLibrary({
        pathway: pathway === "All" ? undefined : pathway,
        category: category === "All" ? undefined : category,
        searchTerm: debouncedSearch.trim() || undefined,
        school: advanced.school || undefined,
        academicYear: advanced.academicYear ? Number(advanced.academicYear) : undefined,
        subject: advanced.subject || undefined,
        season: advanced.season || undefined,
        examId: advanced.examId || undefined,
        topic: advanced.topic || undefined,
        difficulty: advanced.difficulty || undefined,
        questionType: advanced.questionType || undefined,
        savedOnly: advanced.savedOnly || undefined,
        pageNumber,
        pageSize: PAGE_SIZE,
      })
      .then((response) => {
        if (!active) return;
        if (!response.success || !response.data) {
          setError(response.message || "Unable to load published study sets.");
        } else {
          setStudySets(response.data.items);
          setTotalCount(response.data.totalCount);
          setTotalPages(Math.max(1, response.data.totalPages || Math.ceil(response.data.totalCount / PAGE_SIZE)));
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pathway, category, debouncedSearch, advanced, pageNumber, retryCount]);

  const handleToggleSave = async (studySet: StudySetCardDto) => {
    const nextSaved = !studySet.isSaved;
    setStudySets((prev) =>
      prev.map((item) => (item.id === studySet.id ? { ...item, isSaved: nextSaved } : item))
    );

    const res = nextSaved
      ? await nurviaApi.saveStudySet(studySet.id)
      : await nurviaApi.removeSavedStudySet(studySet.id);

    if (!res.success) {
      setStudySets((prev) =>
        prev.map((item) => (item.id === studySet.id ? { ...item, isSaved: !nextSaved } : item))
      );
      setToast(res.message || "Could not update your personal library.");
      return;
    }

    setToast(nextSaved ? "Saved to My Library." : "Removed from My Library.");
  };

  const handleClearAllFilters = () => {
    setPathway("All");
    setCategory("All");
    setSearchInput("");
    setDebouncedSearch("");
    setAdvanced(DEFAULT_ADVANCED);
    setPageNumber(1);
  };

  const hasActiveFilters =
    pathway !== "All" ||
    category !== "All" ||
    debouncedSearch.trim().length > 0 ||
    Object.values(advanced).some(Boolean);

  return (
    <div className="space-y-6">
      <StudyLibraryHeader isPublic={isPublic} summary={summary} />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 rounded-xl border border-brand-teal/40 bg-surface px-4 py-2.5 text-xs font-semibold text-foreground shadow-lg"
        >
          {toast}
        </div>
      )}

      <StudyLibrarySearch
        value={searchInput}
        onChange={setSearchInput}
        isSearching={loading && searchInput !== debouncedSearch}
      />

      <StudyLibraryCategoryTabs
        selectedPathway={pathway}
        selectedCategory={category}
        availablePathways={filtersData?.pathways ?? []}
        availableCategories={filtersData?.categories ?? []}
        onSelectPathway={(next) => {
          setPathway(next);
          setPageNumber(1);
        }}
        onSelectCategory={(next) => {
          setCategory(next);
          setPageNumber(1);
        }}
      />

      <StudyLibraryAdvancedFilters
        filtersData={filtersData}
        value={advanced}
        isPublic={isPublic}
        onChange={(patch) => {
          setAdvanced((prev) => ({ ...prev, ...patch }));
          setPageNumber(1);
        }}
        onClearAll={handleClearAllFilters}
      />

      {!loading && !error && (
        <StudyLibraryResultsHeader
          shownCount={studySets.length}
          totalCount={totalCount}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}

      {loading && <StudyLibraryLoadingState />}

      {error && (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
        >
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setRetryCount((c) => c + 1)}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && studySets.length === 0 && (
        <StudyLibraryEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAllFilters}
        />
      )}

      {!loading && !error && studySets.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {studySets.map((studySet) => (
              <StudySetCard
                key={studySet.id}
                studySet={studySet}
                isPublic={isPublic}
                onToggleSave={handleToggleSave}
                onNotify={setToast}
              />
            ))}
          </div>

          <StudyLibraryPagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
          />
        </>
      )}
    </div>
  );
}
