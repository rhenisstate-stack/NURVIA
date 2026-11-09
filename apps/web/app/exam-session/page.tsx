"use client";

import * as React from "react";
import Link from "next/link";
import { ExamShell } from "@/components/layout/exam-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function ExamSessionPage() {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<"notes" | "vitals" | "labs" | "orders">("notes");
  const [currentMode, setCurrentMode] = React.useState<"Review" | "Exam" | "Tutor">("Review");
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
      examTitle="ATI RN Adult Medical-Surgical Comprehensive Practice"
      totalQuestions={60}
      currentQuestion={14}
      mode={currentMode}
      onModeChange={setCurrentMode}
      isFlagged={isFlagged}
      onToggleFlag={() => setIsFlagged(!isFlagged)}
    >
      <div className="space-y-6">
        {/* Mode Switcher Tabs for demonstration */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground-secondary">Switch Exam Engine Mode:</span>
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
                  <Activity className="w-3.5 h-3.5" /> Vitals
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
                  <FlaskConical className="w-3.5 h-3.5" /> Labs
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

              {/* Exhibit Content Pane */}
              <div className="p-4 text-xs font-mono leading-relaxed bg-surface-muted/30 min-h-[170px]">
                {activeTab === "notes" && <p>{questionData.exhibits.notes}</p>}
                {activeTab === "vitals" && <p>{questionData.exhibits.vitals}</p>}
                {activeTab === "labs" && (
                  <div className="space-y-1">
                    <p className="text-rose-600 dark:text-rose-400 font-bold">
                      ⚠ Potassium: 3.1 mEq/L [CRITICAL LOW]
                    </p>
                    <p>Sodium: 138 mEq/L</p>
                    <p>BUN: 22 mg/dL</p>
                    <p>Creatinine: 1.1 mg/dL</p>
                    <p>BNP: 410 pg/mL</p>
                  </div>
                )}
                {activeTab === "orders" && (
                  <pre className="font-mono text-xs whitespace-pre-wrap">{questionData.exhibits.orders}</pre>
                )}
              </div>
            </div>

            {/* Tutor Mode Concept Coach */}
            {currentMode === "Tutor" ? (
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-teal flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Tutor Guidance
                  </span>
                  <button
                    onClick={() => setShowTutorHint(!showTutorHint)}
                    className="text-xs font-semibold text-brand-teal underline"
                  >
                    {showTutorHint ? "Hide Hint" : "Request Socratic Hint"}
                  </button>
                </div>
                {showTutorHint && (
                  <p className="text-xs text-foreground-secondary leading-relaxed bg-surface p-3 rounded-md border border-border">
                    💡 <em>Hint:</em> Loop diuretics eliminate water through potassium excretion. Look closely at the electrolyte panel and consider what dysrhythmia risk is present.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {/* Right Column: Question Stem & Answer Options (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    Multiple Choice · Single Response
                  </Badge>
                  <span className="text-xs text-foreground-secondary">
                    Skill: <strong>{questionData.rationales.cognitiveSkill}</strong>
                  </span>
                </div>
                <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                  {questionData.stem}
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-3">
                {/* Answer Options */}
                {questionData.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const showCorrectness = isSubmitted && currentMode === "Review";

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3",
                        isSelected
                          ? "border-brand-teal bg-teal-500/10 font-semibold"
                          : "border-border bg-surface hover:bg-surface-muted",
                        showCorrectness && opt.isCorrect && "border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100",
                        showCorrectness && isSelected && !opt.isCorrect && "border-rose-500 bg-rose-500/15 text-rose-900 dark:text-rose-100"
                      )}
                    >
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs mt-0.5",
                          isSelected ? "border-brand-teal bg-brand-teal text-white" : "border-border text-foreground-secondary",
                          showCorrectness && opt.isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                          showCorrectness && isSelected && !opt.isCorrect && "border-rose-500 bg-rose-500 text-white"
                        )}
                      >
                        {String.fromCharCode(65 + opt.id)}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {showCorrectness && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {showCorrectness && isSelected && !opt.isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Exam Mode manual submission button */}
                {currentMode === "Exam" && (
                  <div className="pt-3 flex justify-end">
                    <Button
                      size="sm"
                      disabled={selectedOption === null}
                      onClick={() => setIsSubmitted(true)}
                    >
                      Confirm Response
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Mode: Detailed Educational Rationale */}
            {isSubmitted && currentMode === "Review" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  {selectedOption === 0 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Correct Answer! Clinical Judgment Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <span className="text-rose-700 dark:text-rose-400">Incorrect Choice — Study Rationale Below</span>
                    </>
                  )}
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-foreground">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-brand-teal mb-1">
                      Educational Rationale
                    </h4>
                    <p className="bg-surface p-3 rounded-lg border border-border">
                      {questionData.rationales.correctRationale}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-foreground-secondary mb-1">
                      Distractor Rationales
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4 text-foreground-secondary">
                      {questionData.rationales.distractorRationales.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-border/80 flex flex-wrap items-center justify-between text-[11px] text-foreground-muted">
                    <span>Client Need: <strong>{questionData.rationales.clientNeed}</strong></span>
                    <span>Next Review Cycle: <strong>Spaced (3 Days)</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Control Bar */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Previous Question
          </Button>
          <div className="text-xs text-foreground-secondary font-medium">
            14 of 60 answered
          </div>
          <Button variant="primary" size="sm" className="gap-1.5">
            Next Question <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </ExamShell>
  );
}
