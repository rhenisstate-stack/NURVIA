"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save,
  Send,
  Layers,
  FileText,
  Activity,
  ClipboardList,
  Stethoscope,
  Sparkles,
  ChevronLeft,
  Info,
} from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import {
  QuestionType,
  NursingPathway,
  ExamCategory,
  DifficultyLevel,
  CognitiveSkill,
  ClientNeedCategory,
  ExhibitType,
  QuestionOptionDto,
  QuestionExhibitDto,
} from "@/lib/api-types";

export default function NewQuestionAuthoringPage() {
  const router = useRouter();

  // Core metadata
  const [code, setCode] = React.useState("");
  const [pathway, setPathway] = React.useState<NursingPathway>("RN");
  const [category, setCategory] = React.useState<ExamCategory>("ATI");
  const [subject, setSubject] = React.useState("Pharmacology");
  const [topic, setTopic] = React.useState("Cardiac Medications");
  const [difficulty, setDifficulty] = React.useState<DifficultyLevel>("Intermediate");

  // Version content
  const [stem, setStem] = React.useState("");
  const [questionType, setQuestionType] = React.useState<QuestionType>("MultipleChoice");
  const [cognitiveSkill, setCognitiveSkill] = React.useState<CognitiveSkill>("RecognizeCues");
  const [clientNeed, setClientNeed] = React.useState<ClientNeedCategory>("PhysiologicalIntegrity");
  const [generalRationale, setGeneralRationale] = React.useState("");

  // Options
  const [options, setOptions] = React.useState<QuestionOptionDto[]>([
    { optionIndex: 1, optionText: "", isCorrect: true, specificRationale: "", displayOrder: 1 },
    { optionIndex: 2, optionText: "", isCorrect: false, specificRationale: "", displayOrder: 2 },
    { optionIndex: 3, optionText: "", isCorrect: false, specificRationale: "", displayOrder: 3 },
    { optionIndex: 4, optionText: "", isCorrect: false, specificRationale: "", displayOrder: 4 },
  ]);

  // Exhibits (NGN Clinical chart)
  const [exhibits, setExhibits] = React.useState<QuestionExhibitDto[]>([]);

  // Preview & validation state
  const [previewMode, setPreviewMode] = React.useState(false);
  const [activeExhibitTab, setActiveExhibitTab] = React.useState(0);
  const [selectedPreviewOption, setSelectedPreviewOption] = React.useState<number | null>(null);
  const [showPreviewRationale, setShowPreviewRationale] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  // Live client-side validation rules
  const validationErrors = React.useMemo(() => {
    const errors: string[] = [];
    if (!stem || stem.trim().length < 10) {
      errors.Add ? null : errors.push("Question stem must contain at least 10 characters.");
    }
    if (!generalRationale || generalRationale.trim().length < 15) {
      errors.push("Clinical rationale must contain at least 15 characters explaining why choices are correct.");
    }

    if (questionType === "MultipleChoice") {
      if (options.length < 2) errors.push("Multiple choice requires at least 2 options.");
      const correctCount = options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) errors.push("Multiple choice must have exactly 1 correct answer choice.");
    } else if (questionType === "MultipleResponse") {
      if (options.length < 3) errors.push("Select All That Apply (SATA) requires at least 3 options.");
      const correctCount = options.filter((o) => o.isCorrect).length;
      if (correctCount < 1) errors.push("SATA must have at least 1 correct answer choice.");
    } else if (questionType === "ClinicalCaseStudy") {
      if (exhibits.length === 0) errors.push("Clinical Case Studies require at least one EHR Exhibit (Notes, Vitals, Labs).");
    }

    const emptyOptions = options.some((o) => !o.optionText || o.optionText.trim().length === 0);
    if (emptyOptions) {
      errors.push("All answer option text fields must be filled out.");
    }

    return errors;
  }, [stem, generalRationale, questionType, options, exhibits]);

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], optionText: text };
      return copy;
    });
  };

  const handleOptionRationaleChange = (index: number, rat: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], specificRationale: rat };
      return copy;
    });
  };

  const handleOptionCorrectToggle = (index: number) => {
    setOptions((prev) => {
      if (questionType === "MultipleChoice" || questionType === "TrueFalse") {
        return prev.map((opt, i) => ({
          ...opt,
          isCorrect: i === index,
        }));
      } else {
        const copy = [...prev];
        copy[index] = { ...copy[index], isCorrect: !copy[index].isCorrect };
        return copy;
      }
    });
  };

  const addOption = () => {
    const nextIdx = options.length + 1;
    setOptions((prev) => [
      ...prev,
      { optionIndex: nextIdx, optionText: "", isCorrect: false, specificRationale: "", displayOrder: nextIdx },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addExhibit = (type: ExhibitType) => {
    const titleMap: Record<ExhibitType, string> = {
      NursesNotes: "Nursing Progress Note",
      VitalSigns: "Vital Signs Flowsheet",
      LabResults: "STAT Laboratory Results",
      ProviderOrders: "Physician / Provider Orders",
      RadiologyReport: "Diagnostic Imaging Report",
    };

    setExhibits((prev) => [
      ...prev,
      {
        type,
        title: titleMap[type] || "Clinical Record",
        content: "",
        displayOrder: prev.length + 1,
      },
    ]);
  };

  const removeExhibit = (index: number) => {
    setExhibits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (submitForReview = false) => {
    if (validationErrors.length > 0 && submitForReview) {
      setFeedbackError("Please correct all clinical validation errors before submitting for review.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    const payload = {
      code: code.trim() || undefined,
      pathway,
      category,
      subject,
      topic,
      difficulty,
      stem,
      questionType,
      cognitiveSkill,
      clientNeedCategory: clientNeed,
      generalRationale,
      options,
      exhibits,
    };

    const res = await nurviaApi.createQuestion(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      if (submitForReview) {
        await nurviaApi.submitQuestion(res.data.id);
        setFeedbackSuccess(`Question ${res.data.code} created and submitted for clinical review!`);
      } else {
        setFeedbackSuccess(`Question ${res.data.code} saved as draft.`);
      }
      setTimeout(() => {
        router.push("/admin/questions");
      }, 1200);
    } else {
      setFeedbackError(res.errors?.join("; ") || res.message || "Failed to save question.");
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        {/* Breadcrumb & Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Question Bank
            </Link>
            <h1 className="font-brand text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-teal" />
              Question Authoring Studio
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-1.5 text-xs"
            >
              <Eye className="w-4 h-4 text-brand-teal" />
              {previewMode ? "Authoring Mode" : "Learner Preview"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="gap-1.5 text-xs"
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting || validationErrors.length > 0}
              onClick={() => handleSave(true)}
              className="gap-1.5 text-xs bg-brand-teal hover:bg-brand-teal/90 text-white"
            >
              <Send className="w-4 h-4" /> Submit for Review
            </Button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {feedbackError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}
        {feedbackSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {previewMode ? (
          /* ============================================================ */
          /* INTERACTIVE LEARNER PREVIEW                                  */
          /* ============================================================ */
          <div className="space-y-6">
            <div className="p-3 bg-brand-teal/10 border border-brand-teal/30 rounded-xl text-xs text-brand-teal flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" /> Simulating Student Exam Experience
              </span>
              <span className="text-foreground-muted">
                {pathway} • {category} • {difficulty}
              </span>
            </div>

            <Card className="p-6 space-y-6 border-2 border-brand-navy/20 dark:border-border">
              {/* Exhibit Tabs (If any exist) */}
              {exhibits.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-surface-muted/60 border border-border">
                  <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-brand-teal" /> Electronic Health Record (EHR) Exhibits
                  </div>
                  <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                    {exhibits.map((exh, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveExhibitTab(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          activeExhibitTab === idx
                            ? "bg-brand-navy text-white dark:bg-brand-teal dark:text-brand-navyDeep"
                            : "bg-surface hover:bg-surface-muted text-foreground-secondary border border-border"
                        }`}
                      >
                        {exh.title}
                      </button>
                    ))}
                  </div>

                  {exhibits[activeExhibitTab] && (
                    <div className="p-4 rounded-lg bg-background border border-border whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                      {exhibits[activeExhibitTab].content || "No exhibit content entered."}
                    </div>
                  )}
                </div>
              )}

              {/* Question Stem */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-brand-teal">
                  {questionType === "MultipleResponse" ? "Select All That Apply (SATA)" : "Question Item"}
                </div>
                <div className="text-base font-medium text-foreground leading-relaxed">
                  {stem || "Question stem preview will appear here..."}
                </div>
              </div>

              {/* Options Interactive Selector */}
              <div className="space-y-2.5">
                {options.map((opt) => {
                  const isSelected = selectedPreviewOption === opt.optionIndex;
                  return (
                    <button
                      key={opt.optionIndex}
                      type="button"
                      onClick={() => setSelectedPreviewOption(opt.optionIndex)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-brand-teal bg-brand-teal/10 font-medium"
                          : "border-border hover:border-brand-teal/40 bg-surface"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? "border-brand-teal bg-brand-teal text-white"
                            : "border-border text-foreground-muted"
                        }`}
                      >
                        {String.fromCharCode(64 + opt.optionIndex)}
                      </div>
                      <div className="flex-1 text-foreground leading-relaxed">
                        {opt.optionText || `Option choice ${opt.optionIndex}`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Exam Interactive Action */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviewRationale(!showPreviewRationale)}
                  className="text-xs text-brand-teal border-brand-teal/30"
                >
                  {showPreviewRationale ? "Hide Rationale" : "Check Answer & Rationale"}
                </Button>
                <div className="text-xs text-foreground-muted font-medium">
                  {cognitiveSkill} • {clientNeed}
                </div>
              </div>

              {/* Instant Rationale Preview */}
              {showPreviewRationale && (
                <div className="p-5 rounded-xl bg-surface-muted border border-brand-teal/30 space-y-4">
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Correct Answer:{" "}
                    {options
                      .filter((o) => o.isCorrect)
                      .map((o) => String.fromCharCode(64 + o.optionIndex))
                      .join(", ")}
                  </div>
                  <div className="text-xs leading-relaxed text-foreground-secondary whitespace-pre-wrap">
                    {generalRationale || "No general rationale provided yet."}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* ============================================================ */
          /* AUTHORING FORM VIEW                                          */
          /* ============================================================ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Authoring Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question Stem Card */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Clinical Scenario & Question Stem <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      stem.length >= 10 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"
                    }`}
                  >
                    {stem.length} chars (min 10)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={stem}
                  onChange={(e) => setStem(e.target.value)}
                  placeholder="Describe the clinical patient scenario, vital cues, and the direct question prompt..."
                  className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none leading-relaxed"
                />
              </Card>

              {/* NGN Exhibits Section */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-brand-teal" />
                      Electronic Health Record (EHR) Exhibits
                    </h3>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      Required for NGN Clinical Case Studies (Nurses Notes, Vital Signs flow sheets, STAT Labs).
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addExhibit("NursesNotes")}
                      className="text-xs h-7"
                    >
                      + Notes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addExhibit("VitalSigns")}
                      className="text-xs h-7"
                    >
                      + Vitals
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addExhibit("LabResults")}
                      className="text-xs h-7"
                    >
                      + Labs
                    </Button>
                  </div>
                </div>

                {exhibits.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-foreground-muted">
                    No exhibits attached. Click above to add electronic health record charts.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exhibits.map((exh, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-border bg-surface-muted/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={exh.title}
                            onChange={(e) => {
                              const copy = [...exhibits];
                              copy[idx].title = e.target.value;
                              setExhibits(copy);
                            }}
                            className="font-semibold text-xs bg-background px-2 py-1 rounded border border-border focus:outline-none focus:ring-1 focus:ring-brand-teal w-64"
                          />
                          <button
                            type="button"
                            onClick={() => removeExhibit(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={exh.content}
                          onChange={(e) => {
                            const copy = [...exhibits];
                            copy[idx].content = e.target.value;
                            setExhibits(copy);
                          }}
                          placeholder="Enter exhibit clinical data (e.g. flow sheet, lab values with reference ranges)..."
                          className="w-full p-2.5 text-xs rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal focus:outline-none font-mono"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Answer Choices Manager */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Answer Options & Specific Rationales</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      Mark the correct choice(s) and provide distractor feedback for nursing students.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addOption} className="text-xs h-7">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
                  </Button>
                </div>

                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.optionIndex}
                      className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
                        opt.isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10"
                          : "border-border bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type={questionType === "MultipleResponse" ? "checkbox" : "radio"}
                            checked={opt.isCorrect}
                            onChange={() => handleOptionCorrectToggle(idx)}
                            className="rounded border-border text-brand-teal focus:ring-brand-teal h-4 w-4"
                          />
                          <span className="font-mono text-xs font-bold text-foreground">
                            {String.fromCharCode(64 + opt.optionIndex)}
                          </span>
                        </label>

                        <input
                          type="text"
                          value={opt.optionText}
                          onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                          placeholder={`Answer choice text for option ${String.fromCharCode(64 + opt.optionIndex)}...`}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal focus:outline-none"
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="p-1 text-foreground-muted hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={opt.specificRationale || ""}
                        onChange={(e) => handleOptionRationaleChange(idx, e.target.value)}
                        placeholder="Option feedback (why this choice is correct or a clinical distractor)..."
                        className="w-full px-3 py-1 text-[11px] rounded-lg border border-border/70 bg-background/60 text-foreground-secondary focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Comprehensive Clinical Rationale */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Comprehensive Clinical Rationale <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      generalRationale.length >= 15 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"
                    }`}
                  >
                    {generalRationale.length} chars (min 15)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={generalRationale}
                  onChange={(e) => setGeneralRationale(e.target.value)}
                  placeholder="Explain the pathophysiology, nursing judgment framework, safety parameters, and evidence-based clinical reasoning..."
                  className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none leading-relaxed"
                />
              </Card>
            </div>

            {/* Right Col: Taxonomy & Validation Panel */}
            <div className="space-y-6">
              {/* Question Properties & Taxonomy */}
              <Card className="p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Classification & Taxonomy
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Nursing Pathway Track</label>
                    <select
                      value={pathway}
                      onChange={(e) => setPathway(e.target.value as NursingPathway)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="RN">RN (Registered Nurse)</option>
                      <option value="PN_LPN">PN / LPN Practical</option>
                      <option value="RN_Exit">RN Exit Predictor</option>
                      <option value="PN_Exit">PN Exit Predictor</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Examination Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExamCategory)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="ATI">ATI Practice Bank</option>
                      <option value="HESI">HESI Specialty</option>
                      <option value="RegularCourse">Course Exam</option>
                      <option value="ExitPredictor">Exit Predictor</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Item Format Type</label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal font-medium"
                    >
                      <option value="MultipleChoice">Multiple Choice (Single Response)</option>
                      <option value="MultipleResponse">Select All That Apply (SATA)</option>
                      <option value="TrueFalse">True / False</option>
                      <option value="ClinicalCaseStudy">NGN Unfolding Case Study</option>
                      <option value="MatrixGrid">NGN Matrix Grid</option>
                      <option value="NumericResponse">Numeric / Dosage Calculation</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Cognitive Skill (CJMM)</label>
                    <select
                      value={cognitiveSkill}
                      onChange={(e) => setCognitiveSkill(e.target.value as CognitiveSkill)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="RecognizeCues">Recognize Cues</option>
                      <option value="AnalyzeCues">Analyze Cues</option>
                      <option value="PrioritizeHypotheses">Prioritize Hypotheses</option>
                      <option value="GenerateSolutions">Generate Solutions</option>
                      <option value="TakeActions">Take Actions</option>
                      <option value="EvaluateOutcomes">Evaluate Outcomes</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Client Need Category</label>
                    <select
                      value={clientNeed}
                      onChange={(e) => setClientNeed(e.target.value as ClientNeedCategory)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="PhysiologicalIntegrity">Physiological Integrity</option>
                      <option value="SafeEffectiveCareEnvironment">Safe & Effective Care</option>
                      <option value="HealthPromotionAndMaintenance">Health Promotion</option>
                      <option value="PsychosocialIntegrity">Psychosocial Integrity</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="Foundational">Foundational</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Benchmark">Benchmark Predictor</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-foreground block mb-1">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-foreground block mb-1">Topic</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Real-time Clinical Validation Feedback Panel */}
              <Card className="p-5 space-y-3 border-2 border-dashed border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center justify-between">
                  <span>Validation Engine</span>
                  {validationErrors.length === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.length} issues
                    </span>
                  )}
                </h3>

                {validationErrors.length === 0 ? (
                  <p className="text-xs text-foreground-muted">
                    All clinical authoring invariants satisfied. Ready for submission.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {validationErrors.map((err, i) => (
                      <li key={i} className="text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
