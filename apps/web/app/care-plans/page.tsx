"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { nurviaApi } from "@/lib/api-client";
import type { CarePlanDto } from "@/lib/api-types";
import {
  HeartHandshake,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CarePlansPage() {
  const [plans, setPlans] = React.useState<CarePlanDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [unavailableError, setUnavailableError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("All");
  const [selectedPlan, setSelectedPlan] = React.useState<CarePlanDto | null>(null);

  const specialties = ["All", "Med-Surg", "Critical Care", "Maternal-Newborn", "Pediatrics", "Mental Health"];

  React.useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void nurviaApi
        .getCarePlans({
          specialty: selectedSpecialty === "All" ? undefined : selectedSpecialty,
          search: search.trim() || undefined,
        })
        .then((res) => {
          if (!active) return;
          if (res.success && res.data) {
            setPlans(res.data);
            setUnavailableError(null);
          } else {
            setPlans([]);
            setUnavailableError(res.message || "Clinical Nursing Care Plans are currently unavailable.");
          }
          setLoading(false);
        });
    }, 150);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selectedSpecialty, search]);

  const filteredPlans = plans;

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Header Hero */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 to-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Evidence-Based Clinical Nursing</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Nursing Care Plan Library
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore NANDA-aligned nursing diagnoses, prioritized clinical outcomes, and rationale-grounded interventions across core nursing specialties.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by diagnosis or condition (e.g. Heart Failure)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filter chips & Content */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedSpecialty === spec
                      ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal"
                      : "bg-surface text-foreground-secondary border-border hover:border-brand-teal/50"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Care Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between space-y-4 hover:border-brand-teal/50 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="teal">{plan.specialty}</Badge>
                      <span className="text-[11px] font-mono text-foreground-muted">
                        {plan.interventions.length} Interventions
                      </span>
                    </div>

                    <h3 className="font-brand text-lg font-bold text-foreground">
                      {plan.title}
                    </h3>

                    <div className="p-3 rounded-lg bg-surface-muted/50 border border-border/60 text-xs text-foreground-secondary space-y-1">
                      <span className="font-bold text-foreground block">Nursing Diagnosis:</span>
                      <p className="line-clamp-2">{plan.diagnosis}</p>
                    </div>

                    <div className="text-xs space-y-1 text-foreground-secondary">
                      <span className="font-semibold text-brand-teal flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> High-Yield Clinical Priority:
                      </span>
                      <p className="line-clamp-2 italic">{plan.interventions[0] ?? ""}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full text-xs font-semibold justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Review Care Plan</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!loading && unavailableError && (
              <div role="alert" className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-amber-300/70 p-6">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-sm font-semibold text-foreground">Clinical Care Plans Not Yet Provisioned</p>
                <p className="text-xs text-foreground-secondary max-w-lg mx-auto">{unavailableError}</p>
              </div>
            )}

            {!loading && !unavailableError && filteredPlans.length === 0 && (
              <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border">
                <AlertCircle className="w-8 h-8 text-foreground-muted mx-auto" />
                <p className="text-sm font-semibold text-foreground">No clinical care plans found</p>
                <p className="text-xs text-foreground-secondary">
                  Try adjusting your search query or selecting &quot;All&quot; specialties.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Modal Detail View */}
        {selectedPlan && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setSelectedPlan(null)}
          >
            <div
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface text-foreground shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <Badge variant="teal">{selectedPlan.specialty}</Badge>
                  <h2 className="font-brand text-2xl font-bold text-foreground mt-2">
                    {selectedPlan.title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlan(null)}
                  className="rounded-full h-8 w-8 p-0"
                >
                  âœ•
                </Button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-brand-teal">
                    Diagnostic Statement (NANDA-I)
                  </h4>
                  <p className="mt-1 p-3 rounded-lg bg-surface-muted border border-border text-foreground-secondary leading-relaxed">
                    {selectedPlan.diagnosis}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-brand-teal">
                    Client Outcomes & Goals (NOC)
                  </h4>
                  <ul className="mt-1 space-y-1.5 list-disc list-inside text-foreground-secondary">
                    {selectedPlan.outcomes.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-brand-teal">
                    Core Nursing Interventions & Rationales (NIC)
                  </h4>
                  <div className="mt-1 p-3 rounded-lg bg-brand-teal/10 border border-brand-teal/20 space-y-2">
                    <p className="font-semibold text-foreground">
                      <strong>Intervention:</strong> {selectedPlan.interventions[0] ?? ""}
                    </p>
                    <p className="text-foreground-secondary">
                      <strong>Clinical Rationale:</strong> {selectedPlan.rationale}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlan(null)}
                  className="text-xs"
                >
                  Close Care Plan
                </Button>
                <Link href="/learner/care-plans">
                  <Button size="sm" className="text-xs bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                    Save to Learner Portfolio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
