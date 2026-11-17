'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { PublicShell } from '@/components/layout/public-shell';
import type { NursingProgramMeta } from '@/lib/programs/programRegistry';

export function ProgramLandingView({ program }: { program: NursingProgramMeta }) {
  return (
    <PublicShell>
      <section className="bg-[#142B4A] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-teal-400/40 bg-[#0D9488]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-200">
            {program.shortTitle}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{program.name}</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-200">{program.subtitle}</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{program.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={program.dashboardHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              Open {program.shortTitle} Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <ClipboardCheck className="h-4 w-4" />
              Browse Practice Exams
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-[#142B4A]">Core Clinical &amp; Exam Domains</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {program.focusAreas.map((area) => (
            <div
              key={area}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]" />
              <div>
                <p className="font-semibold text-[#142B4A]">{area}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Server-driven question banks, structured rationales, and readiness analytics.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#0D9488]" />
            <div>
              <p className="font-semibold text-[#142B4A]">Explore NURVIA Nursing Care Plans &amp; Lectures</p>
              <p className="text-sm text-slate-600">
                Pair exam practice with ADPIE care plans and NURVIA high-yield lecture notes.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/care-plans"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#142B4A] hover:bg-slate-100"
            >
              Care Plans
            </Link>
            <Link
              href="/mark-k"
              className="rounded-lg bg-[#142B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Lecture Notes
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
