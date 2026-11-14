"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Copy, ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExamDeliveryMode, ExamLayoutPolicy, StudySetCardDto } from "@/lib/api-types";

export function isModeEnabled(modeAllowed: ExamDeliveryMode, target: "Exam" | "Review" | "Tutor"): boolean {
  return modeAllowed === "All" || modeAllowed === target;
}

export function buildStudySessionHref(
  examId: string,
  mode: "Exam" | "Review" | "Tutor",
  layoutPolicy?: ExamLayoutPolicy
): string {
  const params = new URLSearchParams({ examId, mode });
  if (layoutPolicy === "AllInOneOnly") params.set("layout", "AllInOne");
  else if (layoutPolicy === "SequentialOnly") params.set("layout", "Sequential");
  return `/exam-session?${params.toString()}`;
}

interface StudySetCardActionsProps {
  studySet: StudySetCardDto;
}

interface StudySetOverflowMenuProps {
  studySet: StudySetCardDto;
  detailHref: string;
  isPublic?: boolean;
  onToggleSave?: (studySet: StudySetCardDto) => void;
  onNotify?: (message: string) => void;
}

export function StudySetCardActions({
  studySet,
}: StudySetCardActionsProps) {
  const canExam = isModeEnabled(studySet.modeAllowed, "Exam");
  const canReview = isModeEnabled(studySet.modeAllowed, "Review");
  const canTutor = isModeEnabled(studySet.modeAllowed, "Tutor");

  return (
    <div className="space-y-2 pt-1">
      {canExam ? (
        <Link href={buildStudySessionHref(studySet.id, "Exam", studySet.allowedLayouts)} className="block">
          <Button className="w-full">Exam</Button>
        </Link>
      ) : (
        <Button
          type="button"
          disabled
          title="Exam mode is not enabled for this study set."
          className="w-full"
        >
          Exam (Unavailable)
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2">
        {canReview ? (
          <Link href={buildStudySessionHref(studySet.id, "Review", studySet.allowedLayouts)} className="block">
            <Button variant="outline" size="sm" className="w-full">
              Review
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Review mode is not enabled for this study set."
            className="w-full"
          >
            Review
          </Button>
        )}

        {canTutor ? (
          <Link href={buildStudySessionHref(studySet.id, "Tutor", studySet.allowedLayouts)} className="block">
            <Button variant="outline" size="sm" className="w-full">
              Tutor
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Tutor mode is not enabled for this study set."
            className="w-full"
          >
            Tutor
          </Button>
        )}
      </div>

      {(!canExam || !canReview || !canTutor) && (
        <p className="text-[11px] text-foreground-muted">
          Available modes are governed by the published exam configuration.
        </p>
      )}
    </div>
  );
}

export function StudySetOverflowMenu({
  studySet,
  detailHref,
  isPublic = false,
  onToggleSave,
  onNotify,
}: StudySetOverflowMenuProps) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleCopyLink = async () => {
    setOpen(false);
    try {
      const url = `${window.location.origin}${detailHref}`;
      await navigator.clipboard.writeText(url);
      onNotify?.("Study set link copied to clipboard.");
    } catch {
      onNotify?.("Unable to copy link.");
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${studySet.title}`}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-lg"
        >
          <Link
            href={detailHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
          >
            <ExternalLink className="h-3.5 w-3.5 text-brand-teal" />
            View details
          </Link>

          {!isPublic && onToggleSave && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onToggleSave(studySet);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-surface-muted"
            >
              {studySet.isSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5 text-brand-teal" />
                  Remove from My Library
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5 text-brand-teal" />
                  Save to My Library
                </>
              )}
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => void handleCopyLink()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-surface-muted"
          >
            <Copy className="h-3.5 w-3.5 text-foreground-muted" />
            Copy study-set link
          </button>
        </div>
      )}
    </div>
  );
}
