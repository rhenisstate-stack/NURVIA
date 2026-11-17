"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCarePlanBySlug, getRelatedCarePlans } from "@/lib/content/care-plans-service";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  BookOpen,
} from "lucide-react";

type CarePlanViewFormat = "3-column" | "4-column" | "student";

export default function CarePlanDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const plan = React.useMemo(() => getCarePlanBySlug(slug), [slug]);
  const relatedPlans = React.useMemo(() => (plan ? getRelatedCarePlans(plan) : []), [plan]);
  const [viewFormat, setViewFormat] = React.useState<CarePlanViewFormat>("4-column");

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Link
          href="/care-plans"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Nursing Care Plans Library
        </Link>

        {!plan ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h1 className="font-brand text-xl font-bold text-foreground">Care Plan Not Found</h1>
            <p className="text-xs text-foreground-secondary">
              The requested nursing care plan could not be found in the library.
            </p>
            <Link href="/care-plans">
              <Button variant="outline" size="sm">Return to Care Plans</Button>
            </Link>
          </div>
        ) : (
          <article className="space-y-6">
            {/* Header */}
            <header className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="teal">{plan.bodySystem}</Badge>
                <Badge variant="outline">{plan.category}</Badge>
                <Badge variant="outline">{plan.source}</Badge>
                <span className="text-[11px] font-mono text-foreground-muted">
                  v{plan.contentVersion}
                </span>
              </div>

              <h1 className="font-brand text-2xl sm:text-3xl font-extrabold text-foreground">
                {plan.title}
              </h1>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                {plan.shortSummary}
              </p>

              {plan.relatedConditions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-foreground-muted">Related Medical Conditions:</span>
                  {plan.relatedConditions.map((cond) => (
                    <span key={cond} className="px-2 py-0.5 rounded-md bg-surface-muted text-foreground-secondary">
                      {cond}
                    </span>
                  ))}
                </div>
              )}

              {/* Format Switcher */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs font-semibold text-foreground-muted mr-1">Care Plan Format:</span>
                {(
                  [
                    ["3-column", "3-Column Clinical"],
                    ["4-column", "4-Column ADPIE"],
                    ["student", "Student Care Plan"],
                  ] as const
                ).map(([fmt, label]) => (
                  <Button
                    key={fmt}
                    type="button"
                    size="sm"
                    variant={viewFormat === fmt ? "primary" : "outline"}
                    onClick={() => setViewFormat(fmt)}
                    className="h-7 text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </header>

            {/* Assessment Cues (shown in 4-column & student views) */}
            {viewFormat !== "3-column" && (
              <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
                <h2 className="font-brand text-lg font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-brand-teal" />
                  Assessment Cues
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2">
                    <h3 className="font-bold uppercase tracking-wider text-foreground-muted">Subjective Cues</h3>
                    <ul className="space-y-1.5 text-foreground-secondary">
                      {plan.assessmentCues.subjective.map((cue, idx) => (
                        <li key={idx}>• {cue}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2">
                    <h3 className="font-bold uppercase tracking-wider text-foreground-muted">Objective Cues</h3>
                    <ul className="space-y-1.5 text-foreground-secondary">
                      {plan.assessmentCues.objective.map((cue, idx) => (
                        <li key={idx}>• {cue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Nursing Diagnoses */}
            <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <h2 className="font-brand text-lg font-bold text-foreground">
                NANDA-Aligned Nursing Diagnoses
              </h2>
              <div className="space-y-4">
                {plan.nursingDiagnoses.map((nd, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2 text-xs">
                    <div className="font-bold text-sm text-brand-teal">{nd.diagnosis}</div>
                    {nd.relatedFactors.length > 0 && (
                      <p className="text-foreground-secondary">
                        <strong className="text-foreground">Related to:</strong> {nd.relatedFactors.join("; ")}
                      </p>
                    )}
                    {nd.definingCharacteristics.length > 0 && (
                      <p className="text-foreground-secondary">
                        <strong className="text-foreground">As evidenced by:</strong> {nd.definingCharacteristics.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Goals & Outcomes */}
            <section className="rounded-2xl border border-border bg-surface p-6 space-y-3">
              <h2 className="font-brand text-lg font-bold text-foreground">
                Goals &amp; Expected Outcomes
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground-secondary">
                {plan.goalsAndOutcomes.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Interventions & Rationales */}
            <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <h2 className="font-brand text-lg font-bold text-foreground">
                Nursing Interventions &amp; Rationales
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-muted text-foreground font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b border-border w-1/2">Nursing Intervention</th>
                      <th className="px-4 py-3 border-b border-border w-1/2">Evidence-Based Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {plan.nursingInterventions.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-foreground font-medium align-top">{item.intervention}</td>
                        <td className="px-4 py-3 text-foreground-secondary align-top">{item.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Evaluation & Patient Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {viewFormat !== "3-column" && (
                <section className="rounded-2xl border border-border bg-surface p-6 space-y-3">
                  <h2 className="font-brand text-lg font-bold text-foreground">Evaluation Criteria</h2>
                  <ul className="space-y-2 text-xs text-foreground-secondary">
                    {plan.evaluationCriteria.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className={`rounded-2xl border border-border bg-surface p-6 space-y-3 ${viewFormat === "3-column" ? "md:col-span-2" : ""}`}>
                <h2 className="font-brand text-lg font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-teal" />
                  Patient &amp; Family Education
                </h2>
                <ul className="space-y-2 text-xs text-foreground-secondary">
                  {plan.patientEducation.map((edu, idx) => (
                    <li key={idx}>• {edu}</li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Related Care Plans */}
            {relatedPlans.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-brand text-lg font-bold text-foreground">Related Care Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPlans.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/care-plans/${rel.slug}`}
                      className="rounded-xl border border-border bg-surface p-4 hover:border-brand-teal/50 transition-colors space-y-2"
                    >
                      <Badge variant="teal" className="text-[10px]">{rel.bodySystem}</Badge>
                      <div className="font-brand text-sm font-bold text-foreground">{rel.title}</div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </div>
    </PublicShell>
  );
}
