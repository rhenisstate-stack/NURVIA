"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

interface StudyLibrarySearchProps {
  value: string;
  onChange: (next: string) => void;
  isSearching?: boolean;
}

export function StudyLibrarySearch({ value, onChange, isSearching = false }: StudyLibrarySearchProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
        aria-hidden="true"
      />
      <label htmlFor="study-library-search" className="sr-only">
        Search study sets, subjects, examinations or keywords
      </label>
      <input
        id="study-library-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search study sets, subjects, examinations or keywords..."
        className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-20 text-sm text-foreground shadow-sm transition-colors placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {isSearching && (
          <span className="text-xs text-foreground-muted" aria-live="polite">
            Searching...
          </span>
        )}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
