"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sliders, Sparkles, Play, CheckCircle2 } from "lucide-react";

export default function CustomPracticePage() {
  const [selectedTrack, setSelectedTrack] = React.useState("RN");
  const [selectedMode, setSelectedMode] = React.useState<"Review" | "Exam" | "Tutor">("Review");
  const [questionCount, setQuestionCount] = React.useState(25);
  const [onlyIncorrect, setOnlyIncorrect] = React.useState(false);

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-1">
          <Badge variant="teal">Custom Practice Engine</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Build a Custom Practice Quiz
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Configure subjects, question volume, and study mode targeted to your current study goals.
          </p>
        </div>

        <Card className="p-6 space-y-6">
          {/* Pathway Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Nursing Pathway</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["RN", "PN_LPN", "RN_Exit", "PN_Exit"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedTrack(p)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    selectedTrack === p
                      ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal"
                      : "bg-surface text-foreground-secondary border-border hover:border-brand-teal"
                  }`}
                >
                  {p.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Study Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Review", "Exam", "Tutor"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMode(m)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    selectedMode === m
                      ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal"
                      : "bg-surface text-foreground-secondary border-border hover:border-brand-teal"
                  }`}
                >
                  {m} Mode
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold uppercase tracking-wider text-foreground">Number of Questions</label>
              <span className="font-bold text-brand-teal">{questionCount} Questions</span>
            </div>
            <input
              type="range"
              min="10"
              max="75"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-brand-teal"
            />
          </div>

          {/* Filter options */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={onlyIncorrect}
                onChange={(e) => setOnlyIncorrect(e.target.checked)}
                className="rounded accent-brand-teal"
              />
              <span>Focus only on previously incorrect questions (Adaptive Remediation)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-border">
            <Link href={`/exam-session?track=${selectedTrack}&mode=${selectedMode}&count=${questionCount}`}>
              <Button size="lg" className="w-full h-11 text-xs sm:text-sm font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark gap-2 justify-center">
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Custom Practice Session ({questionCount} Qs)</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
