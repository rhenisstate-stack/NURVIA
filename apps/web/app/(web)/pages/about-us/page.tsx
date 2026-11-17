import Link from 'next/link';
import { PublicShell } from '@/components/layout/public-shell';

export default function AboutUsPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
          About NURVIA
        </span>
        <h1 className="mt-2 text-3xl font-bold text-[#142B4A]">
          Clinical Nursing Education &amp; Licensure Preparation
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          NURVIA empowers pre-nursing, ADN, BSN, and LPN/LVN learners across ATI TEAS 7, HESI A2,
          RN/LPN coursework, and Next Generation NCLEX-RN and NCLEX-PN readiness with structured
          assessments, ADPIE nursing care plans, and educator-authored study lectures.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/exams"
            className="rounded-xl bg-[#142B4A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Explore Exams
          </Link>
          <Link
            href="/care-plans"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#142B4A] hover:bg-slate-50"
          >
            Nursing Care Plans
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
