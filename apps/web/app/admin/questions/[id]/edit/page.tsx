"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  ChevronLeft,
  GitBranch,
  History,
  ShieldCheck,
} from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import { QuestionRendererRegistry, RendererQuestion } from "@/components/exam/renderers";
import {
  QuestionDto,
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

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [question, setQuestion] = React.useState<QuestionDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  // Editable fields
  const [stem, setStem] = React.useState("");
  const [generalRationale, setGeneralRationale] = React.useState("");
  const [questionType, setQuestionType] = React.useState<QuestionType>("MultipleChoice");
  const [cognitiveSkill, setCognitiveSkill] = React.useState<CognitiveSkill>("AnalyzeCues");
  const [clientNeed, setClientNeed] = React.useState<ClientNeedCategory>("PhysiologicalIntegrity");
  const [subject, setSubject] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<DifficultyLevel>("Intermediate");
  const [options, setOptions] = React.useState<QuestionOptionDto[]>([]);
  const [exhibits, setExhibits] = React.useState<QuestionExhibitDto[]>([]);
  const [contentJsonData, setContentJsonData] = React.useState("");
  const [previewMode, setPreviewMode] = React.useState(false);
  const [previewResponse, setPreviewResponse] = React.useState<string | null>(null);
  const [showPreviewRationale, setShowPreviewRationale] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const res = await nurviaApi.getQuestionById(id);
      if (res.success && res.data) {
        setQuestion(res.data);
        setSubject(res.data.subject);
        setTopic(res.data.topic);
        setDifficulty(res.data.difficulty);

        if (res.data.currentVersion) {
          const v = res.data.currentVersion;
          setStem(v.stem);
          setGeneralRationale(v.generalRationale);
          setQuestionType(v.questionType);
          setCognitiveSkill(v.cognitiveSkill);
          setClientNeed(v.clientNeedCategory);
          setOptions(v.options || []);
          setExhibits(v.exhibits || []);
          setContentJsonData(v.contentJsonData || "");
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], optionText: text };
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

  const handleSave = async (submit = false) => {
    if (!id || !question) return;

    setIsSubmitting(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    const payload = {
      subject,
      topic,
      difficulty,
      stem,
      questionType,
      cognitiveSkill,
      clientNeedCategory: clientNeed,
      generalRationale,
      contentJsonData: contentJsonData.trim() || undefined,
      concurrencyToken: question.concurrencyToken,
      options,
      exhibits,
    };

    const res = await nurviaApi.updateQuestion(id, payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      if (submit) {
        await nurviaApi.submitQuestion(id);
        setFeedbackSuccess("Question updated and submitted for clinical review!");
      } else {
        setFeedbackSuccess("Question changes saved successfully.");
      }
      setTimeout(() => {
        router.push("/admin/questions");
      }, 1000);
    } else {
      setFeedbackError(res.errors?.join("; ") || res.message || "Failed to update question.");
    }
  };

  const handleBranchVersion = async () => {
    if (!id) return;
    setIsSubmitting(true);
    const res = await nurviaApi.createQuestionVersion(id);
    setIsSubmitting(false);
    if (res.success && res.data) {
      setFeedbackSuccess(`New revision draft v${res.data.currentVersion?.versionNumber} created!`);
      setTimeout(() => {
        router.refresh();
      }, 800);
    } else {
      setFeedbackError(res.errors?.join("; ") || res.message);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-sm text-foreground-muted">Loading question details...</div>
      </AdminShell>
    );
  }

  const isPublished = question?.status === "Published";

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Question Bank
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="font-brand text-2xl font-bold text-foreground">
                Edit {question?.code || "Question"}
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                v{question?.currentVersion?.versionNumber || 1}
              </Badge>
              <Badge variant={isPublished ? "success" : "teal"}>{question?.status}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode((prev) => !prev)}
              className="gap-1.5 text-xs"
            >
              <Eye className="w-4 h-4" /> {previewMode ? "Authoring Mode" : "Learner Preview"}
            </Button>
            {isPublished ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={handleBranchVersion}
                className="gap-1.5 text-xs text-brand-teal border-brand-teal/40"
              >
                <GitBranch className="w-4 h-4" /> Create New Version Draft
              </Button>
            ) : (
              <>
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
                  disabled={isSubmitting}
                  onClick={() => handleSave(true)}
                  className="gap-1.5 text-xs bg-brand-teal hover:bg-brand-teal/90 text-white"
                >
                  <Send className="w-4 h-4" /> Save & Submit Review
                </Button>
              </>
            )}
          </div>
        </div>

        {isPublished && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong>This question is Published and Immutable.</strong> Published questions cannot be directly altered to maintain test validity for completed and active student exam sessions. To make changes, click <strong>Create New Version Draft</strong> above to branch a new editable version.
            </div>
          </div>
        )}

        {/* Feedback alerts */}
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
          <div className="space-y-6">
            <div className="p-3 bg-brand-teal/10 border border-brand-teal/30 rounded-xl text-xs text-brand-teal flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" /> Simulating Student Exam Experience (Read-Only Preview)
              </span>
              <span className="text-foreground-muted">
                {questionType} • {difficulty}
              </span>
            </div>

            <Card className="p-6 space-y-6 border-2 border-brand-navy/20 dark:border-border">
              {(() => {
                const previewQuestion: RendererQuestion = {
                  id: id || "preview-edit",
                  orderIndex: 1,
                  stem: stem || "Question stem preview will appear here...",
                  questionType,
                  cognitiveSkill,
                  clientNeedCategory: clientNeed,
                  generalRationale: generalRationale || undefined,
                  contentJsonData: contentJsonData.trim() || undefined,
                  options: options.map((opt) => ({
                    id: opt.id || `preview-opt-${opt.optionIndex}`,
                    optionIndex: opt.optionIndex,
                    optionText: opt.optionText || `Option choice ${opt.optionIndex}`,
                    displayOrder: opt.displayOrder ?? opt.optionIndex,
                    isCorrect: showPreviewRationale ? opt.isCorrect : undefined,
                    specificRationale: showPreviewRationale ? opt.specificRationale : undefined,
                  })),
                  exhibits: exhibits.map((exh, idx) => ({
                    id: exh.id || `preview-exh-${idx}`,
                    type: exh.type,
                    title: exh.title,
                    content: exh.content,
                    displayOrder: exh.displayOrder ?? idx + 1,
                  })),
                };

                return (
                  <QuestionRendererRegistry
                    question={previewQuestion}
                    value={previewResponse}
                    onChange={setPreviewResponse}
                    isReview={showPreviewRationale}
                  />
                );
              })()}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviewRationale((prev) => !prev)}
                  className="text-xs text-brand-teal border-brand-teal/30"
                >
                  {showPreviewRationale ? "Hide Rationale" : "Check Answer & Rationale"}
                </Button>
                <div className="text-xs text-foreground-muted font-medium">
                  {cognitiveSkill} • {clientNeed}
                </div>
              </div>

              {showPreviewRationale && (
                <div className="p-5 rounded-xl bg-surface-muted border border-brand-teal/30 space-y-3">
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Clinical Rationale
                  </div>
                  <div className="text-xs leading-relaxed text-foreground-secondary whitespace-pre-wrap">
                    {generalRationale || "No general rationale provided yet."}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
        /* Edit Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted block">
                Question Stem
              </label>
              <textarea
                rows={4}
                disabled={isPublished}
                value={stem}
                onChange={(e) => setStem(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none leading-relaxed disabled:opacity-75"
              />
            </Card>

            <Card className="p-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Answer Options
              </div>
              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <div
                    key={opt.optionIndex}
                    className={`p-3 rounded-xl border space-y-2 ${
                      opt.isCorrect ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type={questionType === "MultipleResponse" ? "checkbox" : "radio"}
                        disabled={isPublished}
                        checked={opt.isCorrect}
                        onChange={() => handleOptionCorrectToggle(idx)}
                        className="rounded border-border text-brand-teal focus:ring-brand-teal h-4 w-4"
                      />
                      <span className="font-mono text-xs font-bold text-foreground">
                        {String.fromCharCode(64 + opt.optionIndex)}
                      </span>
                      <input
                        type="text"
                        disabled={isPublished}
                        value={opt.optionText}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal focus:outline-none disabled:opacity-75"
                      />
                    </div>
                    {"id" in opt && opt.id && (
                      <p className="pl-10 text-[10px] font-mono text-foreground-muted">id: {opt.id}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted block">
                Comprehensive Clinical Rationale
              </label>
              <textarea
                rows={4}
                disabled={isPublished}
                value={generalRationale}
                onChange={(e) => setGeneralRationale(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none leading-relaxed disabled:opacity-75"
              />
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Approved Answer Key (Structured JSON)
                </label>
                <Badge variant="outline" className="text-[10px]">Server-validated</Badge>
              </div>
              <p className="text-xs text-foreground-secondary">
                Required for MultipleTrueFalse, MatrixGrid, DragAndDrop, and BowTie items. Use the option
                IDs shown above to record the approved correct key:
              </p>
              <ul className="text-[11px] text-foreground-muted list-disc pl-4 space-y-0.5">
                <li><strong>MultipleTrueFalse</strong>: <code>{'{"CorrectTrueFalse": {"&lt;optionId&gt;": "True"}}'}</code></li>
                <li><strong>MatrixGrid</strong>: <code>{'{"CorrectSelections": {"&lt;rowOptionId&gt;": "Indicated"}}'}</code></li>
                <li><strong>DragAndDrop</strong>: <code>{'{"CorrectBuckets": {"&lt;optionId&gt;": "A"}}'}</code></li>
                <li><strong>BowTie</strong>: <code>{'{"CorrectActions": [], "CorrectCondition": "&lt;id&gt;", "CorrectParameters": []}'}</code></li>
              </ul>
              <textarea
                rows={5}
                disabled={isPublished}
                value={contentJsonData}
                onChange={(e) => setContentJsonData(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none leading-relaxed disabled:opacity-75"
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 space-y-3 text-xs">
              <div className="font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Version History
              </div>
              <div className="space-y-2">
                {question?.versions?.map((v) => (
                  <div
                    key={v.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      v.id === question.currentVersionId ? "border-brand-teal bg-brand-teal/5 font-semibold" : "border-border"
                    }`}
                  >
                    <div>
                      <div>Version {v.versionNumber}</div>
                      <div className="text-[10px] text-foreground-muted">{v.createdBy}</div>
                    </div>
                    <Badge variant={v.status === "Published" ? "success" : "outline"} className="text-[10px]">
                      {v.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 space-y-3 text-xs">
              <div className="font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Clinical Reviews & Approvals
              </div>
              {question?.reviews && question.reviews.length > 0 ? (
                <div className="space-y-2">
                  {question.reviews.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-border bg-surface-muted/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{r.reviewerName}</span>
                        <Badge variant={r.decision === "Approved" ? "success" : "destructive"} className="text-[10px]">
                          {r.decision}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-foreground-muted italic">{r.comments}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground-muted text-xs">No formal reviews recorded yet.</p>
              )}
            </Card>
          </div>
        </div>
        )}
      </div>
    </AdminShell>
  );
}
