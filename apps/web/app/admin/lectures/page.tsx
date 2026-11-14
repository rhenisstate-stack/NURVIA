"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import {
  LectureAccessLevel,
  LectureManagementDto,
} from "@/lib/api-types";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Plus,
  Send,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

interface LectureFormState {
  number: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  bodyMarkdown: string;
  highYieldConceptsText: string;
  accessLevel: LectureAccessLevel;
}

const EMPTY_FORM: LectureFormState = {
  number: 1,
  slug: "",
  title: "",
  category: "",
  summary: "",
  bodyMarkdown: "",
  highYieldConceptsText: "",
  accessLevel: "Public",
};

export default function AdminLecturesPage() {
  const { user } = useAuth();
  const [lectures, setLectures] = React.useState<LectureManagementDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [form, setForm] = React.useState<LectureFormState>(EMPTY_FORM);

  const [reviewingId, setReviewingId] = React.useState<string | null>(null);
  const [reviewComments, setReviewComments] = React.useState("");

  const role = user?.role || "";
  const isAdmin = role === "Administrator" || role === "Superadmin";
  const canAuthor = isAdmin || role === "Author";
  const canReview = isAdmin || role === "Reviewer";
  const canPublish = isAdmin || role === "Publisher";

  const loadLectures = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await nurviaApi.getManagementLectures();
      if (res.success && res.data) {
        setLectures(res.data);
      } else {
        setError(res.message || "Unable to load lecture management records.");
      }
    } catch {
      setError("Failed to communicate with lecture management API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadLectures();
  }, [loadLectures]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
    setError(null);
    setNotice(null);
  };

  const openEditForm = (lecture: LectureManagementDto) => {
    setEditingId(lecture.id);
    setForm({
      number: lecture.number,
      slug: lecture.slug,
      title: lecture.title,
      category: lecture.category,
      summary: lecture.summary,
      bodyMarkdown: lecture.bodyMarkdown,
      highYieldConceptsText: lecture.highYieldConcepts.join("\n"),
      accessLevel: lecture.accessLevel,
    });
    setIsFormOpen(true);
    setError(null);
    setNotice(null);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setNotice(null);

    const concepts = form.highYieldConceptsText
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const res = editingId
        ? await nurviaApi.updateLectureDraft(editingId, {
            slug: form.slug.trim(),
            title: form.title.trim(),
            category: form.category.trim(),
            summary: form.summary.trim(),
            bodyMarkdown: form.bodyMarkdown,
            highYieldConcepts: concepts,
            accessLevel: form.accessLevel,
          })
        : await nurviaApi.createLectureDraft({
            number: Number(form.number),
            slug: form.slug.trim(),
            title: form.title.trim(),
            category: form.category.trim(),
            summary: form.summary.trim(),
            bodyMarkdown: form.bodyMarkdown,
            highYieldConcepts: concepts,
            accessLevel: form.accessLevel,
          });

      if (res.success) {
        setNotice(editingId ? "Lecture draft updated." : "Lecture draft created.");
        setIsFormOpen(false);
        setEditingId(null);
        await loadLectures();
      } else {
        setError(res.message || "Unable to save lecture draft.");
      }
    } catch {
      setError("Failed to save lecture draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const runAction = async (
    action: () => Promise<{ success: boolean; message?: string }>,
    successMsg: string
  ) => {
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await action();
      if (res.success) {
        setNotice(successMsg);
        await loadLectures();
      } else {
        setError(res.message || "Action could not be completed.");
      }
    } catch {
      setError("Request failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-brand text-2xl font-bold text-foreground">
              Mark K. Lecture Notes Management
            </h1>
            <p className="text-xs text-foreground-secondary">
              Author, review, publish, and archive the 12-lecture NCLEX curriculum.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/mark-k" target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                View Public Index
              </Button>
            </Link>
            {canAuthor && (
              <Button
                size="sm"
                onClick={openCreateForm}
                className="text-xs bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Lecture Draft
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {isFormOpen && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-brand font-bold text-base text-foreground">
                {editingId ? "Edit Lecture Draft" : "Create Lecture Draft"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} className="text-xs">
                Cancel
              </Button>
            </div>
            <form onSubmit={handleSaveDraft} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lec-number" className="text-xs">Lecture Number (1–12)</Label>
                  <Input
                    id="lec-number"
                    type="number"
                    min={1}
                    max={12}
                    disabled={Boolean(editingId)}
                    value={form.number}
                    onChange={(e) => setForm((p) => ({ ...p, number: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lec-slug" className="text-xs">Slug</Label>
                  <Input
                    id="lec-slug"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="acid-base-ventilator-alarms"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lec-access" className="text-xs">Access Policy</Label>
                  <select
                    id="lec-access"
                    value={form.accessLevel}
                    onChange={(e) => setForm((p) => ({ ...p, accessLevel: e.target.value as LectureAccessLevel }))}
                    className="w-full h-9 rounded-md border border-border bg-surface px-3 text-xs text-foreground"
                  >
                    <option value="Public">Public (Lectures 1–3)</option>
                    <option value="AuthenticatedLearner">AuthenticatedLearner (Lectures 4–12)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lec-title" className="text-xs">Title</Label>
                  <Input
                    id="lec-title"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lec-category" className="text-xs">Category</Label>
                  <Input
                    id="lec-category"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lec-summary" className="text-xs">Summary</Label>
                <Textarea
                  id="lec-summary"
                  rows={2}
                  value={form.summary}
                  onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lec-concepts" className="text-xs">High-Yield Concepts (one per line)</Label>
                <Textarea
                  id="lec-concepts"
                  rows={3}
                  value={form.highYieldConceptsText}
                  onChange={(e) => setForm((p) => ({ ...p, highYieldConceptsText: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lec-body" className="text-xs">Body Markdown</Label>
                <Textarea
                  id="lec-body"
                  rows={8}
                  value={form.bodyMarkdown}
                  onChange={(e) => setForm((p) => ({ ...p, bodyMarkdown: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isSaving} size="sm" className="text-xs bg-brand-navy text-white dark:bg-brand-teal">
                  {isSaving ? "Saving..." : editingId ? "Save Draft Changes" : "Create Draft"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5 h-20 animate-pulse bg-surface-muted/40" />
            ))}
          </div>
        ) : lectures.length === 0 ? (
          <Card className="p-8 text-center text-xs text-foreground-muted">
            No lecture records found.
          </Card>
        ) : (
          <div className="space-y-3">
            {lectures.map((lec) => {
              const isEditable = lec.status === "Draft" || lec.status === "Rejected";
              return (
                <Card key={lec.id} className="p-5 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-brand font-bold text-xs px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal">
                          #{lec.number}
                        </span>
                        <h3 className="font-brand font-bold text-sm text-foreground">{lec.title}</h3>
                        <Badge variant="outline" className="text-[10px]">{lec.status}</Badge>
                        <Badge variant={lec.accessLevel === "Public" ? "teal" : "outline"} className="text-[10px]">
                          {lec.accessLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground-secondary">
                        /{lec.slug} • {lec.category}
                      </p>
                      {lec.reviewNotes && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                          Review notes: {lec.reviewNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {lec.status === "Published" && (
                        <Link href={`/mark-k/${lec.slug}`} target="_blank">
                          <Button variant="outline" size="sm" className="text-xs">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Reader
                          </Button>
                        </Link>
                      )}

                      {canAuthor && isEditable && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openEditForm(lec)} disabled={isSaving} className="text-xs">
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            disabled={isSaving}
                            onClick={() => void runAction(() => nurviaApi.submitLectureForReview(lec.id), "Submitted for review.")}
                            className="text-xs bg-brand-navy text-white dark:bg-brand-teal"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            Submit for Review
                          </Button>
                        </>
                      )}

                      {canReview && lec.status === "PendingReview" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => {
                            setReviewingId(reviewingId === lec.id ? null : lec.id);
                            setReviewComments("");
                          }}
                          className="text-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          Review
                        </Button>
                      )}

                      {canPublish && lec.status === "Approved" && (
                        <Button
                          size="sm"
                          disabled={isSaving}
                          onClick={() => void runAction(() => nurviaApi.publishLecture(lec.id), "Lecture published.")}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          Publish
                        </Button>
                      )}

                      {canPublish && lec.status === "Published" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => void runAction(() => nurviaApi.archiveLecture(lec.id), "Lecture archived.")}
                          className="text-xs text-rose-600 border-rose-500/30"
                        >
                          <Archive className="w-3.5 h-3.5 mr-1" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>

                  {reviewingId === lec.id && (
                    <div className="pt-3 border-t border-border space-y-3">
                      <Input
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        placeholder="Clinical review comments (required if rejecting)..."
                        className="text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={isSaving}
                          onClick={() => {
                            void runAction(
                              () => nurviaApi.reviewLecture(lec.id, { decision: "Approved", comments: reviewComments }),
                              "Lecture approved."
                            );
                            setReviewingId(null);
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSaving || !reviewComments.trim()}
                          onClick={() => {
                            void runAction(
                              () => nurviaApi.reviewLecture(lec.id, { decision: "Rejected", comments: reviewComments.trim() }),
                              "Lecture rejected."
                            );
                            setReviewingId(null);
                          }}
                          className="text-xs text-rose-600 border-rose-500/30"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
