"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExamShell } from "@/components/layout/exam-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initialStudySets } from "@/lib/study-sets-data";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  FileText,
  Activity,
  FlaskConical,
  ClipboardList,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ExamSessionContent() {
  const searchParams = useSearchParams();
  const paramMode = searchParams?.get("mode");
  const paramSetId = searchParams?.get("setId");

  const initialMode: "Review" | "Exam" | "Tutor" =
    paramMode === "Exam" || paramMode === "Tutor" ? paramMode : "Review";

  const matchedSet = initialStudySets.find((s) => s.id === paramSetId || s.slug === paramSetId);
  const examTitle = matchedSet ? matchedSet.title : "ATI RN Adult Medical-Surgical Comprehensive Practice";

  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<"notes" | "vitals" | "labs" | "orders">("notes");
  const [currentMode, setCurrentMode] = React.useState<"Review" | "Exam" | "Tutor">(initialMode);
  const [isFlagged, setIsFlagged] = React.useState<boolean>(false);
  const [showTutorHint, setShowTutorHint] = React.useState<boolean>(false);

  // High-Yield Sample Clinical Vignette Question
  const questionData = {
    id: "q-4091",
    stem: "A 64-year-old client admitted 48 hours ago for acute decompensated heart failure is receiving intravenous furosemide 40 mg twice daily. The nurse reviews the client's morning assessment and laboratory findings. Which clinical finding requires the nurse's immediate intervention?",
    options: [
      { id: 0, text: "Serum potassium level of 3.1 mEq/L (3.1 mmol/L)", isCorrect: true },
      { id: 1, text: "Weight loss of 1.4 kg (3.1 lb) over the last 24 hours", isCorrect: false },
      { id: 2, text: "Urine output of 2,100 mL over the previous 24 hours", isCorrect: false },
      { id: 3, text: "Trace pedal edema noted bilaterally in lower extremities", isCorrect: false },
    ],
    rationales: {
      correctRationale:
        "Hypokalemia (potassium < 3.5 mEq/L) is a critical adverse effect of loop diuretics like furosemide. A potassium level of 3.1 mEq/L predisposes the client to fatal cardiac dysrhythmias (e.g., ventricular fibrillation) and increases the risk of digoxin toxicity if applicable. The provider must be notified immediately for potassium repletion.",
      distractorRationales: [
        "Option B: Weight loss of 1.4 kg represents therapeutic fluid elimination expected with diuretic therapy.",
        "Option C: Urine output of 2,100 mL is an anticipated therapeutic response demonstrating effective diuresis.",
        "Option D: Trace pedal edema represents marked clinical improvement from previous 3+ pitting edema at admission.",
      ],
      cognitiveSkill: "Analyze Cues & Prioritize Hypotheses",
      clientNeed: "Physiological Integrity: Pharmacological and Parenteral Therapies",
    },
    exhibits: {
      notes: "Client alert and oriented x 4. Lung crackles significantly diminished in bilateral bases compared to admission. Denies shortness of breath at rest with head of bed elevated 30 degrees.",
      vitals: "BP: 124/76 mmHg | HR: 88 bpm (irregular beats noted) | RR: 16 breaths/min | SpO2: 96% on 2 L nasal cannula | Temp: 36.8°C (98.2°F).",
      labs: "Potassium: 3.1 mEq/L (Normal: 3.5–5.0) | Sodium: 138 mEq/L | BUN: 22 mg/dL | Serum Creatinine: 1.1 mg/dL | BNP: 410 pg/mL (trending down from 1,100).",
      orders: "1. Furosemide 40 mg IV push Q12H.\n2. Low-sodium diet (2,000 mg/day).\n3. Daily weights before breakfast.\n4. Strict Intake & Output tracking.",
    },
  };

  const handleSelect = (idx: number) => {
    if (isSubmitted && currentMode === "Review") return;
    setSelectedOption(idx);
    if (currentMode === "Review") {
      setIsSubmitted(true);
    }
  };

  return (
    <ExamShell
      examTitle={examTitle}
      totalQuestions={matchedSet ? matchedSet.questionCount : 60}
      currentQuestion={14}
      mode={currentMode}
      onModeChange={setCurrentMode}
      isFlagged={isFlagged}
      onToggleFlag={() => setIsFlagged(!isFlagged)}
    >
      <div className="space-y-6">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground-secondary">Delivery Mode:</span>
            <div className="inline-flex rounded-lg border border-border p-1 bg-surface">
              {(["Review", "Exam", "Tutor"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setCurrentMode(m);
                    setIsSubmitted(false);
                    setSelectedOption(null);
                  }}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold transition-colors",
                    currentMode === m
                      ? "bg-brand-teal text-white shadow-xs"
                      : "text-foreground-secondary hover:text-foreground"
                  )}
                >
                  {m} Mode
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-foreground-muted hidden sm:block">
            Item ID: <span className="font-mono">{questionData.id}</span>
          </div>
        </div>

        {/* Question Canvas with Split View for Clinical Exhibits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Electronic Health Record (EHR) Clinical Exhibits (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
              <div className="bg-surface-muted border-b border-border px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-brand-teal" /> Clinical Chart Exhibits
                </span>
                <Badge variant="outline" className="text-[10px]">EHR Simulator</Badge>
              </div>

              {/* Exhibit Tabs */}
              <div className="flex border-b border-border text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setActiveTab("notes")}
                  className={cn(
                    "px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                    activeTab === "notes"
                      ? "border-brand-teal text-brand-teal bg-surface"
                      : "border-transparent text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" /> Notes
                </button>
                <button
                  onClick={() => setActiveTab("vitals")}
                  className={cn(
                    "px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                    activeTab === "vitals"
                      ? "border-brand-teal text-brand-teal bg-surface"
                      : "border-transparent text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <Activity className="w-3.5 h-3.5" /> Vital Signs
                </button>
                <button
                  onClick={() => setActiveTab("labs")}
                  className={cn(
                    "px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                    activeTab === "labs"
                      ? "border-brand-teal text-brand-teal bg-surface"
                      : "border-transparent text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <FlaskConical className="w-3.5 h-3.5" /> Lab Results
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={cn(
                    "px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                    activeTab === "orders"
                      ? "border-brand-teal text-brand-teal bg-surface"
                      : "border-transparent text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Orders
                </button>
              </div>

              {/* Exhibit Body Content */}
              <div className="p-4 text-xs font-mono leading-relaxed bg-background/50 min-h-[180px] whitespace-pre-line text-foreground-secondary">
                {questionData.exhibits[activeTab]}
              </div>
            </div>

            {/* Cognitive Skills Guidance Chip */}
            <div className="p-3.5 rounded-xl border border-border bg-surface text-xs space-y-1">
              <div className="font-bold text-brand-teal text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {questionData.rationales.cognitiveSkill}
              </div>
              <div className="text-foreground-secondary text-[11px]">
                Client Need: {questionData.rationales.clientNeed}
              </div>
            </div>

            {/* Tutor Mode Hint Accordion */}
            {currentMode === "Tutor" && (
              <div className="p-3.5 rounded-xl border border-brand-teal/30 bg-teal-500/5 text-xs space-y-2">
                <button
                  onClick={() => setShowTutorHint(!showTutorHint)}
                  className="w-full flex items-center justify-between text-brand-teal font-semibold text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Need a Socratic Hint?</span>
                  </span>
                  <span>{showTutorHint ? "Hide Hint" : "Show Hint"}</span>
                </button>
                {showTutorHint && (
                  <p className="text-foreground-secondary pt-1 leading-relaxed border-t border-brand-teal/20 animate-in fade-in">
                    Focus on the laboratory panel. Loop diuretics waste potassium in the ascending loop of Henle. What cardiac rhythm disturbances occur when serum potassium dips below 3.5 mEq/L?
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Question Stem, Options, and Rationale (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span>Single Choice · High Yield Item</span>
                  <Badge variant="outline">Clinical Judgment Vignette</Badge>
                </div>
                <h2 className="font-brand text-base sm:text-lg font-bold text-foreground leading-relaxed">
                  {questionData.stem}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {questionData.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isSubmittedReview = isSubmitted && currentMode === "Review";

                  let optionClass =
                    "border-border bg-background hover:bg-surface-muted text-foreground";
                  if (isSelected) {
                    optionClass = "border-brand-teal bg-brand-teal/10 text-foreground ring-1 ring-brand-teal";
                  }
                  if (isSubmittedReview) {
                    if (opt.isCorrect) {
                      optionClass =
                        "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500";
                    } else if (isSelected && !opt.isCorrect) {
                      optionClass =
                        "border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(idx)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3",
                        optionClass
                      )}
                    >
                      <span className="w-6 h-6 rounded-full border border-border bg-surface text-xs font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug pt-0.5">{opt.text}</span>
                      {isSubmittedReview && (
                        <span className="shrink-0 pt-0.5">
                          {opt.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Actions in Exam Mode */}
              {currentMode === "Exam" && (
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedOption === null}
                    onClick={() => setIsSubmitted(true)}
                  >
                    Confirm Answer Selection
                  </Button>
                  <span className="text-xs text-foreground-muted">Rationales shown upon exam completion</span>
                </div>
              )}

              {/* Rationale Display in Review & Tutor Modes */}
              {isSubmitted && (currentMode === "Review" || currentMode === "Tutor") && (
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs leading-relaxed space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-brand-teal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Evidence-Based Clinical Rationale</span>
                  </div>
                  <p className="text-foreground">{questionData.rationales.correctRationale}</p>

                  <div className="pt-2 border-t border-teal-500/20 space-y-1">
                    <span className="font-semibold text-foreground block">Distractor Explanations:</span>
                    {questionData.rationales.distractorRationales.map((d, i) => (
                      <p key={i} className="text-foreground-secondary text-[11px]">{d}</p>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Bottom Question Stepper Footer */}
            <div className="flex items-center justify-between text-xs pt-2">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <ChevronLeft className="w-4 h-4" /> Previous Item
              </Button>
              <span className="text-foreground-muted font-medium">Question 14 of 60</span>
              <Button size="sm" className="text-xs gap-1 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                Next Item <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ExamShell>
  );
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading exam session...</div>}>
      <ExamSessionContent />
    </Suspense>
  );
}
