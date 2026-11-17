'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { PublicShell } from '@/components/layout/public-shell';
import { SeekModal } from '@/components/common/modals/seek/SeekModal';

export default function SeekPage() {
  const [open, setOpen] = useState(false);

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
          NURVIA Search
        </span>
        <h1 className="mt-2 text-3xl font-bold text-[#142B4A]">
          Search Nursing Programs, Subjects &amp; Exams
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Search across server-driven nursing programs, courses, subjects, and practice exams.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 flex w-full max-w-xl items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-500 shadow-sm transition-colors hover:border-[#0D9488]"
        >
          <Search className="h-4 w-4 text-[#0D9488]" />
          <span>Click to search exams, subjects, or questions...</span>
        </button>

        <SeekModal isOpen={open} onClose={() => setOpen(false)} />
      </section>
    </PublicShell>
  );
}
