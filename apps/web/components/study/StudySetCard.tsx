"use client";

import * as React from "react";
import Link from "next/link";
import { BookmarkCheck, Clock, HelpCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { StudySetCardDto } from "@/lib/api-types";
import { StudySetCardActions, StudySetOverflowMenu } from "./StudySetCardActions";

interface StudySetCardProps {
  studySet: StudySetCardDto;
  isPublic?: boolean;
  onToggleSave?: (studySet: StudySetCardDto) => void;
  onNotify?: (message: string) => void;
}

function formatCategoryBadge(pathway: string, category: string): string {
  const pathLabel = pathway.replace("_", " ");
  const catLabel = category.replace(/([a-z])([A-Z])/g, "$1 $2");
  return `${pathLabel} · ${catLabel}`;
}

export function StudySetCard({
  studySet,
  isPublic = false,
  onToggleSave,
  onNotify,
}: StudySetCardProps) {
  const detailHref = isPublic ? `/exams/${studySet.id}` : `/learner/library/${studySet.id}`;
  const hasReviews = studySet.reviewCount > 0 && studySet.averageRating != null;

  return (
    <Card className="flex h-full flex-col justify-between gap-4 border border-border bg-surface p-5 transition-colors hover:border-brand-teal/50">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="teal" className="text-[11px] font-semibold">
              {formatCategoryBadge(studySet.pathway, studySet.category)}
            </Badge>
            {studySet.isSaved && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2 py-0.5 text-[11px] font-medium text-brand-teal"
                title="Saved to My Library"
              >
                <BookmarkCheck className="h-3 w-3" aria-hidden="true" />
                Saved
              </span>
            )}
          </div>
          <StudySetOverflowMenu
            studySet={studySet}
            detailHref={detailHref}
            isPublic={isPublic}
            onToggleSave={onToggleSave}
            onNotify={onNotify}
          />
        </div>

        <div>
          <Link
            href={detailHref}
            className="font-brand text-lg font-bold leading-snug text-foreground hover:text-brand-teal focus-visible:outline-none focus-visible:underline"
          >
            {studySet.title}
          </Link>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
            {studySet.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-muted">
          <span className="inline-flex items-center gap-1 font-medium text-foreground-secondary">
            <HelpCircle className="h-3.5 w-3.5 text-brand-teal" aria-hidden="true" />
            {studySet.totalQuestions} {studySet.totalQuestions === 1 ? "Question" : "Questions"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {studySet.timeLimitMinutes} min
          </span>
          {studySet.school && <span>{studySet.school}</span>}
          {studySet.academicYear && <span>{studySet.academicYear}</span>}
        </div>

        {/* Authentic Rating & Reviews */}
        <div className="flex items-center gap-1.5 text-xs">
          {hasReviews ? (
            <>
              <div className="flex items-center text-amber-500" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-3.5 w-3.5 ${
                      idx < Math.round(studySet.averageRating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">{studySet.averageRating?.toFixed(1)}</span>
              <span className="text-foreground-muted">
                ({studySet.reviewCount.toLocaleString()} {studySet.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </>
          ) : (
            <span className="text-foreground-muted">Not yet rated</span>
          )}
        </div>

        {/* Authentic Verified Testimonial (only when present in DB) */}
        {studySet.featuredTestimonial && (
          <blockquote className="line-clamp-2 rounded-lg border-l-2 border-brand-teal/50 bg-background/60 px-3 py-2 text-xs italic text-foreground-secondary">
            &ldquo;{studySet.featuredTestimonial}&rdquo;
          </blockquote>
        )}
      </div>

      <StudySetCardActions
        studySet={studySet}
      />
    </Card>
  );
}
