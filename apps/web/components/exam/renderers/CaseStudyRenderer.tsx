"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { cn } from "@/lib/utils";
import { FileText, Activity, FlaskConical, ClipboardList, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SingleChoiceRenderer } from "./SingleChoiceRenderer";

export function CaseStudyRenderer({
  question,
  value,
  onChange,
  disabled = false,
  isReview = false,
}: QuestionRendererProps) {
  const [activeTab, setActiveTab] = React.useState<"notes" | "vitals" | "labs" | "orders">("notes");

  // Format exhibits
  const exhibits = question.exhibits || [];
  const notesExhibit = exhibits.find((e) => e.title.toLowerCase().includes("note") || e.type === 1 || e.type === "NursesNotes");
  const vitalsExhibit = exhibits.find((e) => e.title.toLowerCase().includes("vital") || e.type === 2 || e.type === "VitalSigns");
  const labsExhibit = exhibits.find((e) => e.title.toLowerCase().includes("lab") || e.type === 3 || e.type === "LabResults");
  const ordersExhibit = exhibits.find((e) => e.title.toLowerCase().includes("order") || e.type === 4 || e.type === "ProviderOrders");

  const getTabContent = () => {
    switch (activeTab) {
      case "notes":
        return notesExhibit?.content || "Nurse's Note: Client admitted 48 hours ago for heart failure decompensation. Lung crackles diminished in bases. Oriented x 4.";
      case "vitals":
        return vitalsExhibit?.content || "BP: 124/76 mmHg | HR: 88 bpm (irregular) | RR: 16 /min | SpO2: 96% on 2 L NC | Temp: 36.8°C.";
      case "labs":
        return labsExhibit?.content || "Potassium: 3.1 mEq/L (Critical Low) | Sodium: 138 mEq/L | BUN: 22 mg/dL | Serum Creatinine: 1.1 mg/dL.";
      case "orders":
        return ordersExhibit?.content || "1. Furosemide 40 mg IV twice daily.\n2. Low sodium diet.\n3. Daily weights before breakfast.\n4. Strict I&O monitoring.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Electronic Health Record (EHR) Clinical Chart Simulator */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            <div className="bg-surface-muted border-b border-border px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-brand-teal" /> EHR Patient Chart Simulator
              </span>
              <Badge variant="outline" className="text-[10px]">Unfolding Case Study</Badge>
            </div>

            {/* Exhibit Tabs */}
            <div className="flex border-b border-border text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={cn(
                  "px-3 py-2 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                  activeTab === "notes"
                    ? "border-brand-teal text-brand-teal bg-surface"
                    : "border-transparent text-foreground-secondary hover:text-foreground"
                )}
              >
                <FileText className="w-3.5 h-3.5" /> Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("vitals")}
                className={cn(
                  "px-3 py-2 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                  activeTab === "vitals"
                    ? "border-brand-teal text-brand-teal bg-surface"
                    : "border-transparent text-foreground-secondary hover:text-foreground"
                )}
              >
                <Activity className="w-3.5 h-3.5" /> Vitals
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("labs")}
                className={cn(
                  "px-3 py-2 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                  activeTab === "labs"
                    ? "border-brand-teal text-brand-teal bg-surface"
                    : "border-transparent text-foreground-secondary hover:text-foreground"
                )}
              >
                <FlaskConical className="w-3.5 h-3.5" /> Labs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={cn(
                  "px-3 py-2 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap",
                  activeTab === "orders"
                    ? "border-brand-teal text-brand-teal bg-surface"
                    : "border-transparent text-foreground-secondary hover:text-foreground"
                )}
              >
                <ClipboardList className="w-3.5 h-3.5" /> Orders
              </button>
            </div>

            {/* Exhibit Body Content */}
            <div className="p-4 text-xs font-mono leading-relaxed bg-background/50 min-h-[160px] whitespace-pre-line text-foreground-secondary">
              {getTabContent()}
            </div>
          </div>
        </div>

        {/* Right Column: Embedded Question Options */}
        <div className="lg:col-span-7 space-y-4">
          <SingleChoiceRenderer
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
            isReview={isReview}
          />
        </div>
      </div>
    </div>
  );
}
