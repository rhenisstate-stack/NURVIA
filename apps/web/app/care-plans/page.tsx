"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CARE_PLAN_BODY_SYSTEMS,
  CARE_PLAN_WRITING_GUIDES,
  type CarePlanRecord,
} from "@/lib/content/care-plans-data";
import { loadCarePlansCatalogue } from "@/lib/content/care-plans-service";
import { nurviaApi } from "@/lib/api-client";
import {
  HeartHandshake,
  Search,
  FileText,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers,
} from "lucide-react";

const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function CarePlansPage() {
  const [plans, setPlans] = React.useState<CarePlanRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedSystem, setSelectedSystem] = React.useState<string>("All");
  const [selectedLetter, setSelectedLetter] = React.useState<string>("All");
  const [activeTab, setActiveTab] = React.useState<"library" | "guides">("library");
  const [sourceNote, setSourceNote] = React.useState<string>("");

  React.useEffect(() => {
    let active = true;
    void loadCarePlansCatalogue({
      remoteFetcher: () => nurviaApi.getCarePlans(),
    }).then((result) => {
      if (!active) return;
      setPlans(result.plans);
      if (result.remoteStatus === "loaded" && result.remoteCount > 0) {
        setSourceNote(`Showing ${result.localCount} local + ${result.remoteCount} remote care plans.`);
      } else {
        setSourceNote(`Showing ${result.localCount} NURVIA clinical care plans (local-first library).`);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredPlans = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesSystem =
        selectedSystem === "All" || plan.bodySystem === selectedSystem;
      const matchesLetter =
        selectedLetter === "All" ||
        plan.title.toUpperCase().startsWith(selectedLetter);
      const matchesSearch =
        query === "" ||
        plan.title.toLowerCase().includes(query) ||
        plan.shortSummary.toLowerCase().includes(query) ||
        plan.bodySystem.toLowerCase().includes(query) ||
        plan.relatedConditions.some((c) => c.toLowerCase().includes(query)) ||
        plan.nursingDiagnoses.some((d) => d.diagnosis.toLowerCase().includes(query)) ||
        plan.searchKeywords.some((k) => k.toLowerCase().includes(query));
      return matchesSystem && matchesLetter && matchesSearch;
    });
  }, [plans, selectedSystem, selectedLetter, search]);

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Header Hero */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 to-background py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Evidence-Based Clinical Nursing</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Nursing Care Plans Library
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Browse NANDA-aligned nursing diagnoses, assessment cues, measurable outcomes, and rationale-grounded interventions organized by body system.
            </p>

            {/* View Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant={activeTab === "library" ? "primary" : "outline"}
                onClick={() => setActiveTab("library")}
                className="gap-1.5 text-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                Care Plans ({plans.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeTab === "guides" ? "primary" : "outline"}
                onClick={() => setActiveTab("guides")}
                className="gap-1.5 text-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Care-Plan Writing Guides ({CARE_PLAN_WRITING_GUIDES.length})
              </Button>
            </div>

            {activeTab === "library" && (
              <div className="max-w-lg mx-auto pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
                  <input
                    type="search"
                    aria-label="Search care plans"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by condition, nursing diagnosis, or keyword (e.g. Heart Failure)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                {sourceNote && (
                  <p className="mt-2 text-[11px] text-foreground-muted">{sourceNote}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {activeTab === "library" ? (
          <section className="py-10 sm:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
              {/* Body System Filter Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                  Browse by Body System
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {CARE_PLAN_BODY_SYSTEMS.map((sys) => (
                    <button
                      key={sys}
                      type="button"
                      onClick={() => setSelectedSystem(sys)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                        selectedSystem === sys
                          ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal"
                          : "bg-surface text-foreground-secondary border-border hover:border-brand-teal/50"
                      }`}
                    >
                      {sys}
                    </button>
                  ))}
                </div>
              </div>

              {/* A-Z Browsing */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                  Browse A–Z
                </span>
                <div className="flex flex-wrap gap-1">
                  {ALPHABET.map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setSelectedLetter(letter)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors border ${
                        selectedLetter === letter
                          ? "bg-brand-teal text-white border-brand-teal"
                          : "bg-surface text-foreground-secondary border-border hover:border-brand-teal/50"
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-56 rounded-2xl border border-border bg-surface animate-pulse" />
                  ))}
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border">
                  <FileText className="w-8 h-8 text-foreground-muted mx-auto" />
                  <p className="text-sm font-semibold text-foreground">
                    No care plans match your current filters
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    Try clearing the A–Z filter, choosing &quot;All&quot; body systems, or searching another diagnosis.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setSelectedSystem("All");
                      setSelectedLetter("All");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between space-y-4 hover:border-brand-teal/50 hover:shadow-md transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="teal">{plan.bodySystem}</Badge>
                          <span className="text-[10px] font-medium text-foreground-muted">
                            {plan.source}
                          </span>
                        </div>
                        <h2 className="font-brand text-lg font-bold text-foreground leading-snug">
                          {plan.title}
                        </h2>
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                          {plan.shortSummary}
                        </p>
                        {plan.nursingDiagnoses[0] && (
                          <div className="rounded-lg bg-surface-muted/70 border border-border/70 p-2.5 text-[11px]">
                            <span className="font-bold text-foreground block">Primary Nursing Diagnosis:</span>
                            <span className="text-foreground-secondary">{plan.nursingDiagnoses[0].diagnosis}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border">
                        <Link href={`/care-plans/${plan.slug}`} className="block w-full">
                          <Button
                            size="sm"
                            className="w-full text-xs font-semibold justify-between bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal"
                          >
                            <span>Open Care Plan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="py-10 sm:py-14">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CARE_PLAN_WRITING_GUIDES.map((guide) => (
                  <div
                    key={guide.id}
                    className="rounded-2xl border border-border bg-surface p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="teal">{guide.format}</Badge>
                      <span className="text-[11px] text-foreground-muted">Writing Guide</span>
                    </div>
                    <h2 className="font-brand text-xl font-bold text-foreground">{guide.title}</h2>
                    <p className="text-xs text-foreground-secondary leading-relaxed">{guide.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {guide.columns.map((col) => (
                        <span
                          key={col}
                          className="px-2.5 py-1 rounded-md bg-surface-muted text-[11px] font-medium text-foreground"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                    <ul className="space-y-2 text-xs text-foreground-secondary">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] italic text-foreground-muted border-t border-border pt-3">
                      {guide.exampleNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
