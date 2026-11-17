"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { nurviaApi } from "@/lib/api-client";
import { CARE_PLAN_BODY_SYSTEMS, type CarePlanRecord } from "@/lib/content/care-plans-data";
import { loadCarePlansCatalogue } from "@/lib/content/care-plans-service";
import { ArrowRight, Search } from "lucide-react";

export default function LearnerCarePlansPage() {
  const [plans, setPlans] = React.useState<CarePlanRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [remoteNote, setRemoteNote] = React.useState<string | null>(null);
  const [bodySystem, setBodySystem] = React.useState("All");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    let active = true;
    void loadCarePlansCatalogue({
      remoteFetcher: () => nurviaApi.getCarePlans(),
    }).then((result) => {
      if (!active) return;
      setPlans(result.plans);
      if (result.remoteStatus === "not_provisioned") {
        setRemoteNote("Serving verified local care-plan library (custom remote care-plan creation is not yet provisioned on the shared backend).");
      } else if (result.remoteStatus === "error") {
        setRemoteNote(result.remoteMessage ?? null);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredPlans = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return plans.filter((p) => {
      const matchesSys = bodySystem === "All" || p.bodySystem === bodySystem;
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.shortSummary.toLowerCase().includes(q) ||
        p.nursingDiagnoses.some((d) => d.diagnosis.toLowerCase().includes(q));
      return matchesSys && matchesSearch;
    });
  }, [plans, bodySystem, search]);

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="teal">Clinical Framework</Badge>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              Clinical Nursing Care Plans
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Structured NANDA-I nursing diagnoses with evidence-based interventions and evaluative outcomes.
            </p>
          </div>
          <Link href="/care-plans">
            <Button size="sm" variant="outline" className="text-xs">
              Open Full Library &amp; Writing Guides
            </Button>
          </Link>
        </div>

        {remoteNote && (
          <div className="rounded-lg border border-border bg-surface-muted/50 px-3.5 py-2.5 text-xs text-foreground-secondary">
            {remoteNote}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-1.5">
            {CARE_PLAN_BODY_SYSTEMS.slice(0, 7).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={bodySystem === s ? "primary" : "outline"}
                onClick={() => setBodySystem(s)}
                className="text-xs"
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diagnoses or conditions..."
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6 h-44 animate-pulse bg-surface-muted/40" />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No matching care plans</p>
            <p className="text-xs text-foreground-secondary">Try another body system or search term.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="teal">{plan.bodySystem}</Badge>
                    <span className="text-[10px] text-foreground-muted">{plan.source}</span>
                  </div>
                  <h2 className="font-brand text-base font-bold text-foreground">{plan.title}</h2>
                  <p className="text-xs text-foreground-secondary">{plan.shortSummary}</p>
                </div>
                <Link href={`/care-plans/${plan.slug}`}>
                  <Button size="sm" variant="outline" className="w-full justify-between text-xs">
                    <span>View Care Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
