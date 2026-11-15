import React from "react";
import { Info } from "lucide-react";

interface PreviewBannerProps {
  moduleName: string;
}

export function PreviewBanner({ moduleName }: PreviewBannerProps) {
  return (
    <div
      role="status"
      className="rounded-xl border border-amber-300/70 bg-amber-50/80 px-4 py-3 text-xs text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-2.5"
    >
      <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
      <div>
        <span className="font-semibold">{moduleName} — Preview Only (Not Yet Persisted):</span>{" "}
        This administrative view currently displays static preview data and is scheduled for backend persistence in a later track.
      </div>
    </div>
  );
}
