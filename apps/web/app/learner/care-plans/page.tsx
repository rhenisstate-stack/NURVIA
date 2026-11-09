"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, BookOpen, ChevronRight } from "lucide-react";

export default function CarePlansPage() {
  const plans = [
    {
      diagnosis: "Decreased Cardiac Output",
      etiology: "Related to impaired myocardial contractility as evidenced by ejection fraction 30%, bilateral crackles, and fatigue.",
      interventions: "Auscultate heart and lung sounds every 4 hours, monitor I&O, administer prescribed ACE inhibitors and diuretics, position client in high-Fowler's.",
      outcomes: "Client maintains adequate cardiac output evidenced by BP within parameters, clear lung sounds, and urine output > 30 mL/hr.",
    },
    {
      diagnosis: "Impaired Gas Exchange",
      etiology: "Related to alveolar-capillary membrane changes secondary to pneumonia as evidenced by SpO2 88% and productive cough.",
      interventions: "Administer supplemental humidified oxygen, encourage deep breathing and incentive spirometry every 1-2 hours while awake, maintain hydration to thin secretions.",
      outcomes: "Client demonstrates improved ventilation and adequate oxygenation with SpO2 > 95% on room air prior to discharge.",
    },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Clinical Framework</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Clinical Nursing Care Plans
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Structured NANDA-I nursing diagnoses with evidence-based interventions and evaluative outcomes.
          </p>
        </div>

        <div className="space-y-4">
          {plans.map((p, idx) => (
            <Card key={idx} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                  Nursing Diagnosis #{idx + 1}
                </span>
                <Badge variant="outline">NANDA-I Standard</Badge>
              </div>

              <CardTitle className="text-base sm:text-lg text-foreground font-bold">
                {p.diagnosis}
              </CardTitle>

              <div className="space-y-2 text-xs">
                <p className="text-foreground-secondary">
                  <strong className="text-foreground">Etiology / Defining Characteristics:</strong> {p.etiology}
                </p>
                <div className="p-3 rounded-lg bg-surface-muted border border-border">
                  <strong className="text-foreground block mb-1">Priority Nursing Interventions:</strong>
                  <p className="text-foreground-secondary">{p.interventions}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100">
                  <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">Expected Patient Outcomes:</strong>
                  <p>{p.outcomes}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
