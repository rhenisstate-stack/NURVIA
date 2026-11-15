"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nurviaApi } from "@/lib/api-client";
import type { CarePlanDto } from "@/lib/api-types";
import { Plus, Search, Trash2 } from "lucide-react";

const SPECIALTIES = ["All", "Med-Surg", "Critical Care", "Maternal-Newborn", "Pediatrics", "Mental Health"];

export default function CarePlansPage() {
  const [plans, setPlans] = React.useState<CarePlanDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [specialty, setSpecialty] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const [showCreate, setShowCreate] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [newSpecialty, setNewSpecialty] = React.useState("Med-Surg");
  const [diagnosis, setDiagnosis] = React.useState("");
  const [relatedTo, setRelatedTo] = React.useState("");
  const [outcomes, setOutcomes] = React.useState("");
  const [interventions, setInterventions] = React.useState("");
  const [rationale, setRationale] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadPlans = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getCarePlans({
      specialty: specialty === "All" ? undefined : specialty,
      search: search.trim() || undefined,
    });
    if (res.success && res.data) {
      setPlans(res.data);
    } else {
      setError(res.message || "Unable to load care plans.");
    }
    setLoading(false);
  }, [specialty, search]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPlans();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [loadPlans]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await nurviaApi.createCarePlan({
      title,
      specialty: newSpecialty,
      diagnosis,
      relatedTo,
      outcomes: outcomes.split("\n").map((s) => s.trim()).filter(Boolean),
      interventions: interventions.split("\n").map((s) => s.trim()).filter(Boolean),
      rationale,
    });
    if (res.success) {
      setTitle("");
      setDiagnosis("");
      setRelatedTo("");
      setOutcomes("");
      setInterventions("");
      setRationale("");
      setShowCreate(false);
      await loadPlans();
    } else {
      setError(res.message || "Unable to save care plan.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await nurviaApi.deleteCarePlan(id);
    if (res.success) {
      await loadPlans();
    } else {
      setError(res.message || "Unable to delete care plan.");
    }
  };

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
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="gap-1.5 bg-brand-teal hover:bg-brand-tealDark text-white"
          >
            <Plus className="w-4 h-4" />
            {showCreate ? "Close Form" : "New Care Plan"}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-1.5">
            {SPECIALTIES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={specialty === s ? "primary" : "outline"}
                onClick={() => setSpecialty(s)}
                className="text-xs h-8"
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diagnoses..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {showCreate && (
          <Card className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <h2 className="font-brand text-base font-bold text-foreground">Create Personal Care Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cp-title">Condition / Title</Label>
                  <Input id="cp-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cp-specialty">Specialty</Label>
                  <select
                    id="cp-specialty"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                  >
                    {SPECIALTIES.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cp-diagnosis">NANDA-I Nursing Diagnosis</Label>
                <Input id="cp-diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cp-related">Related To / Etiology</Label>
                <Input id="cp-related" value={relatedTo} onChange={(e) => setRelatedTo(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cp-outcomes">Expected Outcomes (one per line)</Label>
                  <Textarea id="cp-outcomes" value={outcomes} onChange={(e) => setOutcomes(e.target.value)} required rows={3} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cp-interventions">Priority Interventions (one per line)</Label>
                  <Textarea id="cp-interventions" value={interventions} onChange={(e) => setInterventions(e.target.value)} required rows={3} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cp-rationale">Clinical Rationale</Label>
                <Textarea id="cp-rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} rows={2} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving} className="bg-brand-teal text-white">
                  {saving ? "Saving..." : "Save Care Plan"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <Card className="p-8 text-center text-sm text-foreground-secondary">Loading nursing care plans…</Card>
        ) : plans.length === 0 ? (
          <Card className="p-8 text-center text-sm text-foreground-secondary">No care plans match your filter.</Card>
        ) : (
          <div className="space-y-4">
            {plans.map((p) => (
              <Card key={p.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                    {p.specialty} · {p.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{p.isSystemPlan ? "NANDA-I Curated" : "Personal Plan"}</Badge>
                    {p.isOwnedByCaller && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleDelete(p.id)}
                        className="text-rose-600 hover:text-rose-700 h-7 px-2 text-xs gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    )}
                  </div>
                </div>

                <CardTitle className="text-base sm:text-lg text-foreground font-bold">{p.diagnosis}</CardTitle>

                <div className="space-y-2 text-xs">
                  {p.relatedTo && (
                    <p className="text-foreground-secondary">
                      <strong className="text-foreground">Related To / Etiology:</strong> {p.relatedTo}
                    </p>
                  )}
                  <div className="p-3 rounded-lg bg-surface-muted border border-border">
                    <strong className="text-foreground block mb-1">Priority Nursing Interventions:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-foreground-secondary">
                      {p.interventions.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100">
                    <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">Expected Patient Outcomes:</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      {p.outcomes.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {p.rationale && (
                    <p className="text-foreground-secondary">
                      <strong className="text-foreground">Clinical Rationale:</strong> {p.rationale}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
