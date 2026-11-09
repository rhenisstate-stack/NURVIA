"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Sparkles, CheckCircle2 } from "lucide-react";

export default function CalculatorsPage() {
  // IV Drip rate state
  const [volume, setVolume] = React.useState<number>(1000);
  const [timeHours, setTimeHours] = React.useState<number>(8);
  const [dropFactor, setDropFactor] = React.useState<number>(15);

  const dripRate = Math.round((volume * dropFactor) / (timeHours * 60));
  const hourlyRate = Math.round(volume / timeHours);

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-1">
          <Badge variant="teal">Nursing Mathematics</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Dosage & IV Infusion Calculators
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Step-by-step formula calculators with worked solutions for clinical dosage exams.
          </p>
        </div>

        {/* IV Drip Rate Calculator Card */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <CardTitle className="text-base">IV Drop Rate Calculator (gtt/min)</CardTitle>
              <CardDescription className="text-xs">Formula: (Volume in mL × Drop Factor) ÷ Time in minutes</CardDescription>
            </div>
            <Badge variant="outline">Gravity Infusion</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Total Volume (mL)</label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Time (Hours)</label>
              <input
                type="number"
                value={timeHours}
                onChange={(e) => setTimeHours(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Drop Factor (gtt/mL)</label>
              <select
                value={dropFactor}
                onChange={(e) => setDropFactor(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
              >
                <option value={10}>10 gtt/mL (Macro)</option>
                <option value={15}>15 gtt/mL (Standard)</option>
                <option value={20}>20 gtt/mL (Macro)</option>
                <option value={60}>60 gtt/mL (Micro/Peds)</option>
              </select>
            </div>
          </div>

          {/* Results Box */}
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-brand-teal uppercase tracking-wider block">Calculated Infusion Rate</span>
              <div className="text-2xl font-bold font-brand text-foreground">
                {dripRate} <span className="text-xs font-normal text-foreground-secondary">drops per minute (gtt/min)</span>
              </div>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Electronic infusion pump rate: <strong>{hourlyRate} mL/hr</strong>
              </p>
            </div>

            <div className="text-xs text-foreground-secondary p-2.5 rounded-lg bg-surface border border-border sm:max-w-xs">
              <span className="font-semibold text-foreground block">Worked Formula:</span>
              ({volume} mL × {dropFactor}) ÷ ({timeHours} × 60 min) = {dripRate} gtt/min
            </div>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
