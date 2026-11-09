"use client";

import * as React from "react";
import { CheckCircle2, Award, ShieldCheck, ChevronRight } from "lucide-react";
import { studentPassRecords, StudentPassRecord } from "@/lib/study-sets-data";
import { cn } from "@/lib/utils";

export function StudentPassTicker() {
  const [tickerList] = React.useState<StudentPassRecord[]>([
    ...studentPassRecords,
    ...studentPassRecords, // duplicate for infinite continuous ticker feel
  ]);

  return (
    <div className="w-full border-y border-border/80 bg-surface/60 py-6 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-foreground-secondary">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>SHARED BY STUDENTS AFTER EXAM DAY</span>
        </div>
        <div className="text-foreground-muted font-medium hidden sm:block">
          verified student-submitted licensure & exit exam outcomes
        </div>
      </div>

      {/* Horizontal Ticker / Carousel Container */}
      <div className="relative w-full overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 min-w-max pb-2">
          {tickerList.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-[270px] sm:w-[300px] shrink-0 rounded-xl border border-border/80 bg-background/95 p-3.5 sm:p-4 shadow-xs hover:border-brand-teal/40 hover:shadow-sm transition-all text-xs"
            >
              {/* Card Header: Date & Exam Code */}
              <div className="flex items-center justify-between pb-2 border-b border-border/60 text-[11px] text-foreground-muted font-mono">
                <span>{item.date}</span>
                <span className="font-semibold text-foreground-secondary">{item.examCode}</span>
              </div>

              {/* Exam Title */}
              <div className="py-2.5">
                <p className="font-medium text-foreground text-xs leading-snug line-clamp-2">
                  {item.examName}
                </p>
              </div>

              {/* Status and Student Name */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[110px]">{item.studentName}</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  {item.status.includes("PASSED") ? "PASSED" : "LEVEL 3"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
