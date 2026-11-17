'use client';

import { useParams, useRouter } from 'next/navigation';
import { PlayCircle } from 'lucide-react';
import { useStrataResource } from '@/lib/hooks/nexus/useStrataResource';
import type { StrataFetchType } from '@/lib/services/strata/strataService';
import { isNursingProgramSlug, NURSING_PROGRAMS } from '@/lib/programs/programRegistry';
import { useExamAccessGuard } from '@/components/common/dashboards/modals/useExamAccessGuard';

interface AssessmentItem {
  guidId?: string;
  id?: string | number;
  name?: string;
  description?: string;
}

const VALID_RESOURCES = new Set(['assessments', 'exams']);

export default function VistaAssessmentOverviewPage() {
  const router = useRouter();
  const params = useParams<{ program: string; resource: string; scope: string }>();
  const slug = isNursingProgramSlug(params?.program ?? '') ? params.program : 'nclex-rn';
  const program = NURSING_PROGRAMS[slug as keyof typeof NURSING_PROGRAMS];
  const resource = VALID_RESOURCES.has(params?.resource ?? '') ? params.resource : 'exams';
  const fetchtype: StrataFetchType = params?.scope === 'distinct' ? 'distinct' : 'absolute';

  const { items, loading, error } = useStrataResource<AssessmentItem>(resource, fetchtype, {
    perPage: 50,
  });
  const { guard, modal } = useExamAccessGuard(program.slug, program.shortTitle);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {modal}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
          Assessment · {fetchtype}
        </span>
        <h1 className="mt-1 text-2xl font-bold capitalize text-[#142B4A]">{resource} Overview</h1>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading {resource}...</p>}
      {!loading && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-500">No {resource} records available.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <div
            key={item.guidId ?? item.id ?? idx}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="font-bold text-[#142B4A]">{item.name || 'Nursing Exam'}</h2>
              {item.description && (
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              )}
            </div>
            {resource === 'exams' && item.guidId && (
              <button
                type="button"
                onClick={() =>
                  guard(false, true, () =>
                    router.push(
                      `/web/${program.slug}/vista/exam/generic?identifier=${encodeURIComponent(
                        String(item.guidId)
                      )}`
                    )
                  )
                }
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                <PlayCircle className="h-4 w-4" />
                Start Exam
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
