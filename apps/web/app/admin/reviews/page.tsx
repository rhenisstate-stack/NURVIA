"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  MessageSquare,
  FileQuestion,
  BookCheck,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import { QuestionDto, ExamDto } from "@/lib/api-types";

export default function ReviewApprovalQueuePage() {
  const [questions, setQuestions] = React.useState<QuestionDto[]>([]);
  const [exams, setExams] = React.useState<ExamDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"questions" | "exams">("questions");

  // Review Dialog State
  const [selectedItem, setSelectedItem] = React.useState<QuestionDto | null>(null);
  const [selectedExam, setSelectedExam] = React.useState<ExamDto | null>(null);
  const [reviewDecision, setReviewDecision] = React.useState<"Approved" | "Rejected" | "ChangesRequested">("Approved");
  const [reviewComments, setReviewComments] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const qRes = await nurviaApi.getQuestions({ status: "PendingReview", pageSize: 50 });
    if (qRes.success && qRes.data) {
      setQuestions(qRes.data.items);
    }

    const eRes = await nurviaApi.getExams({ status: "PendingReview", pageSize: 50 });
    if (eRes.success && eRes.data) {
      setExams(eRes.data.items);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitQuestionReview = async () => {
    if (!selectedItem) return;
    if (!reviewComments.trim()) {
      setActionMessage("Please provide reviewer clinical feedback comments.");
      return;
    }

    setSubmittingReview(true);
    const res = await nurviaApi.reviewQuestion(selectedItem.id, reviewDecision, reviewComments);
    setSubmittingReview(false);

    if (res.success) {
      setActionMessage(`Question ${selectedItem.code} successfully marked as ${reviewDecision}.`);
      setSelectedItem(null);
      setReviewComments("");
      loadData();
    } else {
      setActionMessage(`Review failed: ${res.errors?.join("; ") || res.message}`);
    }
  };

  const handleApproveExam = async () => {
    if (!selectedExam) return;
    setSubmittingReview(true);
    const res = await nurviaApi.approveExam(selectedExam.id, reviewComments || "Approved for student delivery.");
    setSubmittingReview(false);

    if (res.success) {
      setActionMessage(`Exam ${selectedExam.code} approved for publication!`);
      setSelectedExam(null);
      setReviewComments("");
      loadData();
    } else {
      setActionMessage(`Exam approval failed: ${res.errors?.join("; ") || res.message}`);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
              <span>Studio</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Quality & Governance</span>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-brand-teal" />
              Clinical Review & Approval Queue
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Peer-review submissions from nurse authors against evidence-based nursing standards, NGN rubrics, and clinical rationales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "questions" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("questions")}
              className="gap-1.5 text-xs"
            >
              <FileQuestion className="w-4 h-4" /> Questions ({questions.length})
            </Button>
            <Button
              variant={activeTab === "exams" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("exams")}
              className="gap-1.5 text-xs"
            >
              <BookCheck className="w-4 h-4" /> Exam Blueprints ({exams.length})
            </Button>
          </div>
        </div>

        {/* Message Banner */}
        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-surface-muted border border-brand-teal/40 text-xs flex items-center justify-between">
            <span className="text-foreground font-medium">{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-foreground-muted hover:text-foreground text-xs font-bold">✕</button>
          </div>
        )}

        {/* Content Queue */}
        {activeTab === "questions" ? (
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Questions Awaiting Clinical Verification
              </div>
              <Badge variant="warning">{questions.length} Pending</Badge>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-foreground-muted">Loading queue...</div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Review Queue is Clear!</h3>
                <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                  All submitted nursing questions have been evaluated and approved for curriculum inclusion.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 hover:bg-surface-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{q.code}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {q.pathway} • {q.category}
                        </Badge>
                        <Badge variant="teal" className="text-[10px]">
                          {q.currentVersion?.questionType || "Item"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {q.currentVersion?.stem}
                      </p>
                      <div className="text-xs text-foreground-muted flex items-center gap-3">
                        <span>Submitted by: {q.createdBy}</span>
                        <span>•</span>
                        <span>{q.subject} › {q.topic}</span>
                        <span>•</span>
                        <span>Cognitive: {q.currentVersion?.cognitiveSkill}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/admin/questions/${q.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Inspect
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedItem(q)}
                        className="h-8 text-xs bg-brand-navy hover:bg-brand-navy/90 text-white"
                      >
                        Clinical Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Exam Blueprints Queue */
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Exam Blueprints Awaiting Publication Approval
              </div>
              <Badge variant="warning">{exams.length} Pending</Badge>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-foreground-muted">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Exam Queue is Clear!</h3>
                <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                  No exam blueprints currently awaiting review.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {exams.map((ex) => (
                  <div key={ex.id} className="p-4 hover:bg-surface-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{ex.code}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {ex.pathway} • {ex.category}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {ex.totalQuestions} Questions Assigned
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{ex.title}</h4>
                      <p className="text-xs text-foreground-muted">{ex.description}</p>
                      <div className="text-xs text-foreground-muted flex items-center gap-3">
                        <span>Time Limit: {ex.timeLimitMinutes} mins</span>
                        <span>•</span>
                        <span>Passing: {ex.passingScorePercentage}%</span>
                        <span>•</span>
                        <span>Author: {ex.createdBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedExam(ex)}
                        className="h-8 text-xs bg-brand-teal hover:bg-brand-teal/90 text-white"
                      >
                        Approve Exam
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Question Review Modal Dialog */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-teal" />
                  <h3 className="text-base font-bold text-foreground">
                    Peer Review: {selectedItem.code}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-foreground-muted hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Question summary in dialog */}
              <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border space-y-2 text-xs">
                <div className="font-semibold text-foreground">Question Stem:</div>
                <div className="text-foreground-secondary leading-relaxed">
                  {selectedItem.currentVersion?.stem}
                </div>
                <div className="font-semibold text-foreground mt-2">Comprehensive Rationale:</div>
                <div className="text-foreground-secondary leading-relaxed">
                  {selectedItem.currentVersion?.generalRationale}
                </div>
              </div>

              {/* Decision Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted block">
                  Clinical Review Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision("Approved")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      reviewDecision === "Approved"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border text-foreground-muted hover:bg-surface-muted"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision("ChangesRequested")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      reviewDecision === "ChangesRequested"
                        ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "border-border text-foreground-muted hover:bg-surface-muted"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision("Rejected")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      reviewDecision === "Rejected"
                        ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "border-border text-foreground-muted hover:bg-surface-muted"
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>

              {/* Review Comments */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted block">
                  Educator Review Notes & Citations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="State the evidence-based rationale for your decision or specific revision instructions for the author..."
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-background focus:ring-1 focus:ring-brand-teal focus:outline-none"
                />
              </div>

              {/* Dialog Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={submittingReview}
                  onClick={handleSubmitQuestionReview}
                  className="bg-brand-navy hover:bg-brand-navy/90 text-white"
                >
                  Record Clinical Decision
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Exam Approval Modal Dialog */}
        {selectedExam && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  Approve Blueprint: {selectedExam.title}
                </h3>
                <button onClick={() => setSelectedExam(null)} className="text-foreground-muted hover:text-foreground text-sm font-bold">✕</button>
              </div>

              <div className="p-3 bg-surface-muted/50 rounded-lg text-xs space-y-1.5">
                <div><strong>Code:</strong> {selectedExam.code}</div>
                <div><strong>Track:</strong> {selectedExam.pathway} • {selectedExam.category}</div>
                <div><strong>Assigned Questions:</strong> {selectedExam.totalQuestions}</div>
                <div><strong>Benchmark Target:</strong> {selectedExam.passingScorePercentage}% Passing</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted block">
                  Approval Endorsement Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Confirm curriculum alignment and readiness for publication..."
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-background focus:ring-1 focus:ring-brand-teal focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setSelectedExam(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={submittingReview}
                  onClick={handleApproveExam}
                  className="bg-brand-teal hover:bg-brand-teal/90 text-white"
                >
                  Confirm & Approve Exam
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
