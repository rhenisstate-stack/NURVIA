"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function StudyLibraryLoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading study sets">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Card key={idx} className="flex h-72 flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="h-5 w-28 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-9 w-full animate-pulse rounded-lg bg-surface-muted" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 animate-pulse rounded-lg bg-surface-muted" />
              <div className="h-8 animate-pulse rounded-lg bg-surface-muted" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function StudyLibraryEmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <Card className="flex flex-col items-center justify-center p-10 text-center">
      <SearchX className="h-10 w-10 text-foreground-muted" aria-hidden="true" />
      <h2 className="mt-3 font-brand text-lg font-bold text-foreground">
        No published study sets match your criteria
      </h2>
      <p className="mt-1 max-w-md text-sm text-foreground-secondary">
        {hasActiveFilters
          ? "Try adjusting your search keywords or clearing one or more academic filters."
          : "Published study sets and examinations will appear here once released."}
      </p>
      {hasActiveFilters && (
        <Button type="button" variant="outline" size="sm" onClick={onClearFilters} className="mt-4">
          Reset all filters
        </Button>
      )}
    </Card>
  );
}

export function StudyLibraryResultsHeader({
  shownCount,
  totalCount,
  pageNumber,
  totalPages,
}: {
  shownCount: number;
  totalCount: number;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-muted" aria-live="polite">
      <p>
        Showing <span className="font-semibold text-foreground">{shownCount}</span> of{" "}
        <span className="font-semibold text-foreground">{totalCount}</span> published study{" "}
        {totalCount === 1 ? "set" : "sets"}
      </p>
      {totalPages > 1 && (
        <p>
          Page <span className="font-semibold text-foreground">{pageNumber}</span> of {totalPages}
        </p>
      )}
    </div>
  );
}

export function StudyLibraryPagination({
  pageNumber,
  totalPages,
  onPageChange,
}: {
  pageNumber: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Study library pagination" className="flex items-center justify-center gap-2 pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Previous
      </Button>
      <span className="px-3 text-xs font-medium text-foreground-secondary">
        Page {pageNumber} / {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pageNumber >= totalPages}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </nav>
  );
}
