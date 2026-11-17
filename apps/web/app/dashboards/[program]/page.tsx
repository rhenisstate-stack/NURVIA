'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PlusCircle, ClipboardCheck, BookOpen, BarChart3 } from 'lucide-react';
import { isNursingProgramSlug, NURSING_PROGRAMS } from '@/lib/programs/programRegistry';
import { VISTA_QUOTES } from '@/lib/constants/dashboards/nexus/vista/quotes';
import { DistinctSubjects } from '@/app/dashboards/shared/section/DistinctSubjects';
import { ActiveSubscriptionPackage } from '@/app/dashboards/shared/subscription/ActiveSubscriptionPackage';
import { DiyExamCreationModal } from '@/app/dashboards/shared/modal/diyExamCreation';

export default function ProgramDashboardHomePage() {
  const params = useParams<{ program: string }>();
  const slug = params?.program ?? 'nclex-rn';
  const program = isNursingProgramSlug(slug)
    ? NURSING_PROGRAMS[slug]
    : NURSING_PROGRAMS['nclex-rn'];
  const [diyOpen, setDiyOpen] = useState(false);

  const quote = VISTA_QUOTES[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#142B4A] p-6 text-white shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            {program.shortTitle} Workspace
          </span>
          <h1 className="mt-1 text-2xl font-bold">{program.name}</h1>
          <p className="mt-1 text-sm text-slate-200">{program.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setDiyOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <PlusCircle className="h-4 w-4" />
          New Custom Exam
        </button>
      </div>

      {quote && (
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 px-5 py-3.5 text-sm text-[#142B4A]">
          <span className="font-bold">{quote.quoteTitle}:</span> {quote.quoteDescription}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`/dashboards/${program.slug}/vista/assessment/exams/absolute/overview`}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0D9488]"
        >
          <ClipboardCheck className="h-6 w-6 text-[#0D9488]" />
          <div>
            <p className="font-semibold text-[#142B4A]">Practice Exams</p>
            <p className="text-xs text-slate-500">Launch timed or tutor exams</p>
          </div>
        </Link>
        <Link
          href={`/dashboards/${program.slug}/vista/learning/courses/absolute/overview`}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0D9488]"
        >
          <BookOpen className="h-6 w-6 text-[#0D9488]" />
          <div>
            <p className="font-semibold text-[#142B4A]">Nursing Courses</p>
            <p className="text-xs text-slate-500">Explore structured curriculum</p>
          </div>
        </Link>
        <Link
          href={`/dashboards/${program.slug}/vista/assessment/exams/results/distinct`}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0D9488]"
        >
          <BarChart3 className="h-6 w-6 text-[#0D9488]" />
          <div>
            <p className="font-semibold text-[#142B4A]">Exam Results</p>
            <p className="text-xs text-slate-500">Review attempts &amp; analytics</p>
          </div>
        </Link>
      </div>

      <DistinctSubjects programSlug={program.slug} />
      <ActiveSubscriptionPackage programSlug={program.slug} />

      <DiyExamCreationModal
        isOpen={diyOpen}
        onClose={() => setDiyOpen(false)}
        programName={program.shortTitle}
      />
    </div>
  );
}
