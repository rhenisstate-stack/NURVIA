"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Layers,
  Settings,
  ChevronRight,
  Send,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import {
  ExamDto,
  ExamStatus,
  NursingPathway,
  ExamCategory,
  ExamDeliveryMode,
  ReviewReleasePolicy,
  ExamLayoutPolicy,
  ExamLayout,
  QuestionDto,
} from "@/lib/api-types";

export default function ExamStudioPage() {
  const [exams, setExams] = React.useState<ExamDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [pathwayFilter, setPathwayFilter] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  // Create Exam Dialog
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newPathway, setNewPathway] = React.useState<NursingPathway>("RN");
  const [newCategory, setNewCategory] = React.useState<ExamCategory>("ATI");
  const [newTimeLimit, setNewTimeLimit] = React.useState(60);
  const [newPassingScore, setNewPassingScore] = React.useState(75);
  const [newMode, setNewMode] = React.useState<ExamDeliveryMode>("All");
  const [newReviewReleasePolicy, setNewReviewReleasePolicy] = React.useState<ReviewReleasePolicy>("Immediate");
  const [newAllowedLayouts, setNewAllowedLayouts] = React.useState<ExamLayoutPolicy>("Both");
  const [newDefaultLayout, setNewDefaultLayout] = React.useState<ExamLayout>("Sequential");

  // Blueprint Editor Drawer / Dialog
  const [selectedExam, setSelectedExam] = React.useState<ExamDto | null>(null);
  const [publishedQuestions, setPublishedQuestions] = React.useState<QuestionDto[]>([]);
  const [assignedQuestionIds, setAssignedQuestionIds] = React.useState<string[]>([]);
  const [isConfiguring, setIsConfiguring] = React.useState(false);

  const loadExams = React.useCallback(async () => {
    setLoading(true);
    const params: Record<string, any> = { pageSize: 50 };
    if (searchTerm) params.searchTerm = searchTerm;
    if (pathwayFilter) params.pathway = pathwayFilter;
    if (categoryFilter) params.category = categoryFilter;

    const res = await nurviaApi.getExams(params);
    if (res.success && res.data) {
      setExams(res.data.items);
      setLoadError(null);
    } else {
      setLoadError(res.errors?.join("; ") || res.message || "Unable to load examinations.");
      setExams([]);
    }
    setLoading(false);
  }, [searchTerm, pathwayFilter, categoryFilter]);

  React.useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleCreateExam = async () => {
    if (!newTitle.trim()) {
      setActionMessage("Please provide an examination title.");
      return;
    }

    const payload = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      pathway: newPathway,
      category: newCategory,
      timeLimitMinutes: Number(newTimeLimit),
      passingScorePercentage: Number(newPassingScore),
      modeAllowed: newMode,
      reviewReleasePolicy: newReviewReleasePolicy,
      allowedLayouts: newAllowedLayouts,
      defaultLayout: newDefaultLayout,
      instructions: "Read all questions thoroughly. Calculator and exhibits are accessible during testing.",
    };

    const res = await nurviaApi.createExam(payload);
    if (res.success && res.data) {
      setActionMessage(`Exam ${res.data.code} created successfully!`);
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      loadExams();
    } else {
      setActionMessage(`Create failed: ${res.errors?.join("; ") || res.message}`);
    }
  };

  const openBlueprintEditor = async (exam: ExamDto) => {
    setSelectedExam(exam);
    // Load published questions available for assignment
    const qRes = await nurviaApi.getQuestions({ status: "Published", pageSize: 50 });
    if (qRes.success && qRes.data) {
      setPublishedQuestions(qRes.data.items);
    }

    // Set currently assigned questions
    if (exam.currentVersion?.examQuestions) {
      setAssignedQuestionIds(exam.currentVersion.examQuestions.map((eq) => eq.questionId));
    } else {
      setAssignedQuestionIds([]);
    }
  };

  const toggleAssignQuestion = (qId: string) => {
    setAssignedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSaveBlueprint = async () => {
    if (!selectedExam) return;
    setIsConfiguring(true);

    const payload = {
      title: selectedExam.title,
      description: selectedExam.description,
      instructions: selectedExam.currentVersion?.instructions || "Read each question carefully.",
      pathway: selectedExam.pathway,
      category: selectedExam.category,
      modeAllowed: selectedExam.modeAllowed,
      timeLimitMinutes: selectedExam.timeLimitMinutes,
      passingScorePercentage: selectedExam.passingScorePercentage,
      reviewReleasePolicy: selectedExam.currentVersion?.reviewReleasePolicy || "Immediate",
      allowedLayouts: selectedExam.currentVersion?.allowedLayouts || "Both",
      defaultLayout: selectedExam.currentVersion?.defaultLayout || "Sequential",
      targetQuestionCount: assignedQuestionIds.length,
      assignedQuestionIds,
      concurrencyToken: selectedExam.concurrencyToken,
    };

    const res = await nurviaApi.configureExam(selectedExam.id, payload);
    setIsConfiguring(false);

    if (res.success) {
      setActionMessage(`Exam blueprint configured with ${assignedQuestionIds.length} questions!`);
      setSelectedExam(null);
      loadExams();
    } else {
      setActionMessage(`Configuration failed: ${res.errors?.join("; ") || res.message}`);
    }
  };

  const handlePublishExam = async (examId: string, examCode: string) => {
    const res = await nurviaApi.publishExam(examId);
    if (res.success) {
      setActionMessage(`Exam ${examCode} published to learner library!`);
      loadExams();
    } else {
      setActionMessage(`Publishing failed: ${res.errors?.join("; ") || res.message}`);
    }
  };

  const handleSubmitExamForReview = async (examId: string, examCode: string) => {
    const res = await nurviaApi.submitExam(examId);
    if (res.success) {
      setActionMessage(`Exam ${examCode} blueprint submitted for clinical review.`);
      loadExams();
    } else {
      setActionMessage(`Submission failed: ${res.errors?.join("; ") || res.message}`);
    }
  };

  const handleReleaseReview = async (examId: string, examCode: string) => {
    const res = await nurviaApi.releaseExamReview(examId);
    if (res.success) {
      setActionMessage(`Exam ${examCode}: review results released to learners.`);
      loadExams();
    } else {
      setActionMessage(`Release failed: ${res.errors?.join("; ") || res.message}`);
    }
  };

  const getStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case "Published":
        return <Badge variant="success" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Published</Badge>;
      case "Approved":
        return <Badge variant="teal">Approved</Badge>;
      case "PendingReview":
        return <Badge variant="warning">Pending Review</Badge>;
      case "Configured":
        return <Badge variant="info">Configured</Badge>;
      case "Draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
              <span className="text-foreground font-semibold">Exam Management Studio</span>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2.5">
              <BookCheck className="w-7 h-7 text-brand-teal" />
              Examination Management Studio
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Assemble, validate, and publish benchmark nursing assessments, ATI practice exams, HESI specialties, and exit predictors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5 shadow-sm bg-brand-teal hover:bg-brand-teal/90 text-white"
            >
              <Plus className="w-4 h-4" /> Assemble New Exam
            </Button>
          </div>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-surface-muted border border-brand-teal/30 text-xs flex items-center justify-between">
            <span className="text-foreground font-medium">{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-foreground-muted hover:text-foreground text-xs font-bold">✕</button>
          </div>
        )}

        {/* Filter bar */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exam code, title, or topic..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none"
              />
            </div>

            <div>
              <select
                value={pathwayFilter}
                onChange={(e) => setPathwayFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none"
              >
                <option value="">All Tracks (RN, LPN, Exit)</option>
                <option value="RN">RN Exams</option>
                <option value="PN_LPN">PN / LPN Exams</option>
                <option value="RN_Exit">RN Exit Predictors</option>
                <option value="PN_Exit">PN Exit Predictors</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none"
              >
                <option value="">All Categories (ATI, HESI, Courses)</option>
                <option value="ATI">ATI Assessments</option>
                <option value="HESI">HESI Specialty</option>
                <option value="RegularCourse">Course Examinations</option>
                <option value="ExitPredictor">Exit Predictors</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 p-12 text-center text-sm text-foreground-muted">
              Loading examination catalogue...
            </div>
          ) : exams.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-sm text-foreground-muted" role={loadError ? "alert" : undefined}>
              {loadError ? `Unable to load examinations: ${loadError}` : "No exams found matching current filters."}
            </div>
          ) : (
            exams.map((ex) => (
              <Card key={ex.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-brand-teal/40 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-teal">{ex.code}</span>
                    {getStatusBadge(ex.status)}
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug">{ex.title}</h3>
                  <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                    {ex.description}
                  </p>
                </div>

                {/* Exam Parameters Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-surface-muted/60 text-xs border border-border">
                  <div>
                    <span className="text-foreground-muted block text-[10px] uppercase font-bold">Track</span>
                    <span className="font-semibold text-foreground">{ex.pathway} • {ex.category}</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted block text-[10px] uppercase font-bold">Questions</span>
                    <span className="font-semibold text-foreground">{ex.totalQuestions} items</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted block text-[10px] uppercase font-bold">Review release</span>
                    <span className="font-semibold text-foreground">
                      {ex.currentVersion?.reviewReleasePolicy === "ManualRelease"
                        ? ex.currentVersion?.reviewReleasedAtUtc
                          ? "Released"
                          : "Manual — withheld"
                        : "Immediate"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBlueprintEditor(ex)}
                      className="h-8 text-xs gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Blueprint & Questions
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {ex.status === "Draft" || ex.status === "Configured" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubmitExamForReview(ex.id, ex.code)}
                        className="h-8 text-xs text-brand-teal border-brand-teal/40"
                      >
                        Submit
                      </Button>
                    ) : null}

                    {ex.status === "Approved" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublishExam(ex.id, ex.code)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Publish
                      </Button>
                    ) : null}

                    {ex.status === "Published" && ex.currentVersion?.reviewReleasePolicy === "ManualRelease" && !ex.currentVersion?.reviewReleasedAtUtc ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReleaseReview(ex.id, ex.code)}
                        className="h-8 text-xs text-brand-teal border-brand-teal/40"
                      >
                        <Eye className="w-3.5 h-3.5" /> Release Review
                      </Button>
                    ) : null}

                    <Link href={`/exam-session?examId=${ex.id}&mode=Exam`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-foreground-muted hover:text-foreground">
                        <PlayCircle className="w-3.5 h-3.5 text-brand-teal" /> Preview Exam
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Assemble New Exam Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BookCheck className="w-5 h-5 text-brand-teal" /> Assemble New Examination
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-foreground-muted hover:text-foreground text-sm font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. ATI Adult Medical-Surgical Comprehensive Assessment 2026"
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe target clinical skills, audience, and curriculum objectives..."
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Nursing Pathway</label>
                    <select
                      value={newPathway}
                      onChange={(e) => setNewPathway(e.target.value as NursingPathway)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="RN">RN (Registered Nurse)</option>
                      <option value="PN_LPN">PN / LPN Practical</option>
                      <option value="RN_Exit">RN Exit Predictor</option>
                      <option value="PN_Exit">PN Exit Predictor</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Exam Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ExamCategory)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="ATI">ATI Practice Bank</option>
                      <option value="HESI">HESI Specialty</option>
                      <option value="RegularCourse">Course Examination</option>
                      <option value="ExitPredictor">Exit Predictor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Time Limit (mins)</label>
                    <input
                      type="number"
                      value={newTimeLimit}
                      onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Passing %</label>
                    <input
                      type="number"
                      value={newPassingScore}
                      onChange={(e) => setNewPassingScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Delivery Mode</label>
                    <select
                      value={newMode}
                      onChange={(e) => setNewMode(e.target.value as ExamDeliveryMode)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="All">All Modes</option>
                      <option value="Exam">Exam Mode</option>
                      <option value="Tutor">Tutor Mode</option>
                      <option value="Review">Review Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Review Release</label>
                    <select
                      value={newReviewReleasePolicy}
                      onChange={(e) => setNewReviewReleasePolicy(e.target.value as ReviewReleasePolicy)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="Immediate">Immediate — release with results</option>
                      <option value="ManualRelease">Manual — staff release required</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Navigation Layouts</label>
                    <select
                      value={newAllowedLayouts}
                      onChange={(e) => setNewAllowedLayouts(e.target.value as ExamLayoutPolicy)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="Both">Both — learner may choose</option>
                      <option value="AllInOneOnly">All-in-One only</option>
                      <option value="SequentialOnly">Sequential only</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Default Layout</label>
                    <select
                      value={newDefaultLayout}
                      onChange={(e) => setNewDefaultLayout(e.target.value as ExamLayout)}
                      disabled={newAllowedLayouts !== "Both"}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-brand-teal disabled:opacity-50"
                    >
                      <option value="Sequential">Sequential (recommended)</option>
                      <option value="AllInOne">All-in-One</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateExam}
                  className="bg-brand-teal hover:bg-brand-teal/90 text-white"
                >
                  Create Blueprint
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Blueprint & Question Assignment Drawer / Modal */}
        {selectedExam && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Blueprint Editor: {selectedExam.title}
                  </h3>
                  <div className="text-xs text-foreground-muted font-mono mt-0.5">
                    {selectedExam.code} • {assignedQuestionIds.length} questions currently assigned
                  </div>
                </div>
                <button onClick={() => setSelectedExam(null)} className="text-foreground-muted hover:text-foreground text-sm font-bold">✕</button>
              </div>

              {/* Published Question Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Assign Published Questions from Bank
                  </span>
                  <span className="text-xs font-semibold text-brand-teal">
                    Selected: {assignedQuestionIds.length} items
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                  {publishedQuestions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-foreground-muted">
                      No published questions available. Ensure questions are approved and published first.
                    </div>
                  ) : (
                    publishedQuestions.map((q) => {
                      const isAssigned = assignedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleAssignQuestion(q.id)}
                          className={`p-3 cursor-pointer text-xs flex items-start gap-3 transition-colors ${
                            isAssigned ? "bg-brand-teal/10 border-l-4 border-l-brand-teal" : "hover:bg-surface-muted/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-border text-brand-teal focus:ring-brand-teal"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-foreground">{q.code}</span>
                              <Badge variant="outline" className="text-[10px]">{q.pathway}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{q.currentVersion?.questionType}</Badge>
                            </div>
                            <p className="text-foreground-secondary line-clamp-2">
                              {q.currentVersion?.stem}
                            </p>
                            <div className="text-[10px] text-foreground-muted">
                              {q.subject} › {q.topic} • Cognitive: {q.currentVersion?.cognitiveSkill}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Drawer actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-foreground-muted">
                  {assignedQuestionIds.length === 0 ? (
                    <span className="text-amber-600 font-medium">⚠️ Exam requires at least 1 question to validate.</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Valid configuration</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedExam(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isConfiguring || assignedQuestionIds.length === 0}
                    onClick={handleSaveBlueprint}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-white"
                  >
                    Save Exam Blueprint
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
