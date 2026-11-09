"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  RefreshCw,
  GitBranch,
  Eye,
  Edit3,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { nurviaApi } from "@/lib/api-client";
import { QuestionDto, ContentStatus, NursingPathway, ExamCategory } from "@/lib/api-types";

export default function QuestionBankPage() {
  const [questions, setQuestions] = React.useState<QuestionDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [pathwayFilter, setPathwayFilter] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const loadQuestions = React.useCallback(async () => {
    setLoading(true);
    const params: Record<string, any> = {
      pageNumber,
      pageSize: 10,
    };
    if (searchTerm) params.searchTerm = searchTerm;
    if (pathwayFilter) params.pathway = pathwayFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;

    const res = await nurviaApi.getQuestions(params);
    if (res.success && res.data) {
      setQuestions(res.data.items);
      setTotalCount(res.data.totalCount);
    } else {
      // Fallback display if backend is offline
      setQuestions([
        {
          id: "1",
          code: "Q-RN-ATI-PHARM-001",
          pathway: "RN",
          category: "ATI",
          subject: "Pharmacology",
          topic: "Cardiac Medications",
          difficulty: "Intermediate",
          status: "Published",
          concurrencyToken: "tok-1",
          createdAtUtc: new Date().toISOString(),
          createdBy: "Nurse Educator Elena Vance, MSN, RN",
          currentVersion: {
            id: "v1",
            versionNumber: 1,
            stem: "A nurse is preparing to administer digoxin 0.25 mg PO to an adult client diagnosed with heart failure. Which clinical assessment is a priority before administering this medication?",
            questionType: "MultipleChoice",
            cognitiveSkill: "RecognizeCues",
            clientNeedCategory: "PhysiologicalIntegrity",
            generalRationale: "Auscultate apical pulse for one full minute prior to administration.",
            status: "Published",
            createdAtUtc: new Date().toISOString(),
            createdBy: "Elena Vance",
            options: [
              { optionIndex: 1, optionText: "Auscultate the apical pulse rate for one full minute", isCorrect: true, displayOrder: 1 },
              { optionIndex: 2, optionText: "Measure blood pressure in both arms", isCorrect: false, displayOrder: 2 },
            ],
            exhibits: [],
            reviews: [],
          },
        },
        {
          id: "2",
          code: "Q-RN-HESI-MS-003",
          pathway: "RN",
          category: "HESI",
          subject: "Medical-Surgical",
          topic: "Cardiovascular",
          difficulty: "Advanced",
          status: "Published",
          concurrencyToken: "tok-2",
          createdAtUtc: new Date().toISOString(),
          createdBy: "Elena Vance",
          currentVersion: {
            id: "v2",
            versionNumber: 1,
            stem: "A 68-year-old male with an established history of systolic heart failure is admitted to telemetry with acute dyspnea. Review EHR exhibits (Nurses Notes, Vital Signs, Labs). Which action is the immediate priority?",
            questionType: "ClinicalCaseStudy",
            cognitiveSkill: "PrioritizeHypotheses",
            clientNeedCategory: "PhysiologicalIntegrity",
            generalRationale: "Immediate high-Fowler's positioning and oxygen to stabilize pulmonary edema.",
            status: "Published",
            createdAtUtc: new Date().toISOString(),
            createdBy: "Elena Vance",
            options: [],
            exhibits: [],
            reviews: [],
          },
        },
      ]);
      setTotalCount(2);
    }
    setLoading(false);
  }, [searchTerm, pathwayFilter, categoryFilter, statusFilter, pageNumber]);

  React.useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handlePublish = async (id: string, code: string) => {
    const res = await nurviaApi.publishQuestion(id);
    if (res.success) {
      setActionMessage(`Question ${code} successfully published!`);
      loadQuestions();
    } else {
      setActionMessage(`Publishing failed: ${res.errors?.join(", ") || res.message}`);
    }
  };

  const handleSubmit = async (id: string, code: string) => {
    const res = await nurviaApi.submitQuestion(id);
    if (res.success) {
      setActionMessage(`Question ${code} submitted for review.`);
      loadQuestions();
    } else {
      setActionMessage(`Submission failed: ${res.errors?.join(", ") || res.message}`);
    }
  };

  const handleCreateVersion = async (id: string, code: string) => {
    const res = await nurviaApi.createQuestionVersion(id);
    if (res.success) {
      setActionMessage(`New revision draft created for ${code}.`);
      loadQuestions();
    } else {
      setActionMessage(`Version creation failed: ${res.errors?.join(", ") || res.message}`);
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case "Published":
        return <Badge variant="success" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Published</Badge>;
      case "Approved":
        return <Badge variant="teal" className="bg-brand-teal/15 text-brand-teal border-brand-teal/30">Approved</Badge>;
      case "PendingReview":
        return <Badge variant="warning" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Pending Review</Badge>;
      case "ValidationFailed":
        return <Badge variant="destructive" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Validation Failed</Badge>;
      case "Draft":
        return <Badge variant="outline" className="text-foreground-muted">Draft</Badge>;
      case "Rejected":
        return <Badge variant="destructive" className="bg-rose-500/15 text-rose-700 dark:text-rose-300">Rejected</Badge>;
      case "Archived":
        return <Badge variant="secondary" className="opacity-70">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
              <span>Studio</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Question Bank Builder</span>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2.5">
              <FileQuestion className="w-7 h-7 text-brand-teal" />
              Question Bank Management
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Comprehensive repository for clinical judgment items, NGN case studies, rationales, and exhibits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/questions/new">
              <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" /> Author New Question
              </Button>
            </Link>
          </div>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div className="p-3 rounded-lg bg-surface-muted border border-brand-teal/30 text-xs flex items-center justify-between">
            <span className="text-foreground font-medium">{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-foreground-muted hover:text-foreground text-xs font-bold">✕</button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stem, code, topic, or rationale..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none"
              />
            </div>

            <div>
              <select
                value={pathwayFilter}
                onChange={(e) => setPathwayFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none"
              >
                <option value="">All Nursing Tracks</option>
                <option value="RN">RN (Registered Nurse)</option>
                <option value="PN_LPN">PN / LPN Practical</option>
                <option value="RN_Exit">RN Exit Predictor</option>
                <option value="PN_Exit">PN Exit Predictor</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="ATI">ATI Practice Bank</option>
                <option value="HESI">HESI Specialty</option>
                <option value="RegularCourse">Course Exam</option>
                <option value="ExitPredictor">Exit Comprehensive</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-teal focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="ValidationFailed">Validation Failed</option>
                <option value="PendingReview">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question List Table */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/60 border-b border-border text-xs uppercase font-semibold text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Code / Track</th>
                  <th className="px-4 py-3">Item Type</th>
                  <th className="px-4 py-3">Clinical Scenario / Stem</th>
                  <th className="px-4 py-3">Cognitive Skill</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-foreground-muted">
                      Loading question repository...
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-foreground-muted">
                      No questions matched the selected filters.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => {
                    const version = q.currentVersion;
                    return (
                      <tr key={q.id} className="hover:bg-surface-muted/40 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-mono text-xs font-bold text-foreground">{q.code}</div>
                          <div className="text-[11px] text-foreground-muted">
                            {q.pathway} • {q.category}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs font-medium">
                            {version?.questionType || "MultipleChoice"}
                          </Badge>
                        </td>

                        <td className="px-4 py-3.5 max-w-md">
                          <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                            {version?.stem || "No stem available."}
                          </p>
                          <div className="text-[11px] text-foreground-muted mt-1">
                            {q.subject} › {q.topic}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs text-foreground-secondary font-medium">
                            {version?.cognitiveSkill || "AnalyzeCues"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(q.status)}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-muted border border-border">
                            v{version?.versionNumber || 1}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/questions/${q.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </Button>
                            </Link>

                            {q.status === "Draft" || q.status === "ValidationFailed" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubmit(q.id, q.code)}
                                className="h-7 px-2 text-xs text-brand-teal border-brand-teal/40 hover:bg-brand-teal/10"
                              >
                                Submit
                              </Button>
                            ) : null}

                            {q.status === "Approved" ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handlePublish(q.id, q.code)}
                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Publish
                              </Button>
                            ) : null}

                            {q.status === "Published" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateVersion(q.id, q.code)}
                                className="h-7 px-2 text-xs text-foreground-muted hover:text-foreground gap-1"
                                title="Branch new draft revision"
                              >
                                <GitBranch className="w-3.5 h-3.5" /> Revise
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
            <div>
              Showing {questions.length} of {totalCount} total examination questions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <span className="font-semibold px-2">Page {pageNumber}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={questions.length < 10}
                onClick={() => setPageNumber((p) => p + 1)}
                className="h-7 px-2"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
