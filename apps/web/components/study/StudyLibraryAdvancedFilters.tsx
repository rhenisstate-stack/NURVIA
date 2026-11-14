"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudyLibraryFiltersDto } from "@/lib/api-types";

export interface AdvancedFilterState {
  school: string;
  academicYear: string;
  subject: string;
  season: string;
  examId: string;
  topic: string;
  difficulty: string;
  questionType: string;
  savedOnly: boolean;
}

interface StudyLibraryAdvancedFiltersProps {
  filtersData: StudyLibraryFiltersDto | null;
  value: AdvancedFilterState;
  isPublic?: boolean;
  onChange: (patch: Partial<AdvancedFilterState>) => void;
  onClearAll: () => void;
}

export function StudyLibraryAdvancedFilters({
  filtersData,
  value,
  isPublic = false,
  onChange,
  onClearAll,
}: StudyLibraryAdvancedFiltersProps) {
  const [expanded, setExpanded] = React.useState(false);

  const activeEntries: Array<{ key: keyof AdvancedFilterState; label: string; display: string }> = [];
  if (value.school) activeEntries.push({ key: "school", label: "School", display: value.school });
  if (value.academicYear) activeEntries.push({ key: "academicYear", label: "Year", display: value.academicYear });
  if (value.subject) activeEntries.push({ key: "subject", label: "Subject", display: value.subject });
  if (value.season) activeEntries.push({ key: "season", label: "Season", display: value.season });
  if (value.examId) {
    const examName = filtersData?.exams.find((e) => e.id === value.examId)?.title ?? "Selected exam";
    activeEntries.push({ key: "examId", label: "Examination", display: examName });
  }
  if (value.topic) activeEntries.push({ key: "topic", label: "Topic", display: value.topic });
  if (value.difficulty) activeEntries.push({ key: "difficulty", label: "Difficulty", display: value.difficulty });
  if (value.questionType) {
    activeEntries.push({
      key: "questionType",
      label: "Question Type",
      display: value.questionType.replace(/([a-z])([A-Z])/g, "$1 $2"),
    });
  }
  if (value.savedOnly) activeEntries.push({ key: "savedOnly", label: "Library", display: "Saved Only" });

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-md"
        >
          <SlidersHorizontal className="h-4 w-4 text-brand-teal" aria-hidden="true" />
          <span>Academic &amp; Examination Filters</span>
          {activeEntries.length > 0 && (
            <span className="rounded-full bg-brand-teal/15 px-2 py-0.5 text-xs font-bold text-brand-teal">
              {activeEntries.length}
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {activeEntries.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
            Clear all filters
          </Button>
        )}
      </div>

      {activeEntries.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2.5">
          {activeEntries.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3 py-1 text-xs font-medium text-foreground"
            >
              <span className="text-foreground-muted">{chip.label}:</span>
              <span>{chip.display}</span>
              <button
                type="button"
                aria-label={`Remove ${chip.label} filter`}
                onClick={() => onChange({ [chip.key]: chip.key === "savedOnly" ? false : "" })}
                className="rounded-full p-0.5 hover:bg-brand-teal/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            id="filter-school"
            label="School"
            value={value.school}
            options={filtersData?.schools ?? []}
            placeholder="All schools"
            onChange={(school) => onChange({ school })}
          />
          <FilterSelect
            id="filter-year"
            label="Year"
            value={value.academicYear}
            options={(filtersData?.academicYears ?? []).map(String)}
            placeholder="All years"
            onChange={(academicYear) => onChange({ academicYear })}
          />
          <FilterSelect
            id="filter-subject"
            label="Subject"
            value={value.subject}
            options={filtersData?.subjects ?? []}
            placeholder="All subjects"
            onChange={(subject) => onChange({ subject })}
          />
          <FilterSelect
            id="filter-season"
            label="Season"
            value={value.season}
            options={filtersData?.seasons ?? []}
            placeholder="All seasons"
            onChange={(season) => onChange({ season })}
          />
          <div className="space-y-1">
            <label htmlFor="filter-exam" className="block text-xs font-medium text-foreground-secondary">
              Examination
            </label>
            <select
              id="filter-exam"
              value={value.examId}
              onChange={(e) => onChange({ examId: e.target.value })}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <option value="">All examinations</option>
              {(filtersData?.exams ?? []).map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>
          <FilterSelect
            id="filter-topic"
            label="Topic"
            value={value.topic}
            options={filtersData?.topics ?? []}
            placeholder="All topics"
            onChange={(topic) => onChange({ topic })}
          />
          <FilterSelect
            id="filter-difficulty"
            label="Difficulty"
            value={value.difficulty}
            options={filtersData?.difficulties ?? []}
            placeholder="All difficulties"
            onChange={(difficulty) => onChange({ difficulty })}
          />
          <FilterSelect
            id="filter-qtype"
            label="Question Type"
            value={value.questionType}
            options={(filtersData?.questionTypes ?? []).map(String)}
            formatOption={(v) => v.replace(/([a-z])([A-Z])/g, "$1 $2")}
            placeholder="All question types"
            onChange={(questionType) => onChange({ questionType })}
          />
          {!isPublic && (
            <div className="flex items-end pb-1">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={value.savedOnly}
                  onChange={(e) => onChange({ savedOnly: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-brand-teal focus:ring-brand-teal"
                />
                Saved to My Library only
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  placeholder,
  formatOption,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  formatOption?: (v: string) => string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-foreground-secondary">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.length === 0}
        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
      >
        <option value="">{options.length === 0 ? "No data available" : placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {formatOption ? formatOption(opt) : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
