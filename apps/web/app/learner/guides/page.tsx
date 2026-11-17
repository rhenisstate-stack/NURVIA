"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nurviaApi } from "@/lib/api-client";
import {
  STUDY_GUIDE_SUBJECTS,
  type StudyGuideRecord,
} from "@/lib/content/study-guides-data";
import {
  getStudyGuideBySlug,
  loadStudyGuidesCatalogue,
} from "@/lib/content/study-guides-service";
import {
  BookOpen,
  Search,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function StudyGuidesPage() {
  const [guides, setGuides] = React.useState<StudyGuideRecord[]>([]);
  const [selectedGuide, setSelectedGuide] = React.useState<StudyGuideRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [remoteStatus, setRemoteStatus] = React.useState<'loaded' | 'not_provisioned' | 'unauthorized' | 'error'>('loaded');
  const [remoteNote, setRemoteNote] = React.useState<string | null>(null);
  const [subject, setSubject] = React.useState<string>("All");
  const [pathway, setPathway] = React.useState<string>("All");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    let active = true;
    void loadStudyGuidesCatalogue({
      remoteFetcher: () => nurviaApi.getStudyGuides(),
    }).then((result) => {
      if (!active) return;
      setGuides(result.guides);
      setRemoteStatus(result.remoteStatus);
      setRemoteNote(result.remoteMessage ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const subjectCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of guides) {
      counts[g.subject] = (counts[g.subject] ?? 0) + 1;
    }
    return counts;
  }, [guides]);

  const filteredGuides = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return guides.filter((g) => {
      const matchesSubject = subject === "All" || g.subject === subject;
      const matchesPathway =
        pathway === "All" || g.pathway === "Both" || g.pathway === pathway;
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.keyConcepts.some((c) => c.toLowerCase().includes(q));
      return matchesSubject && matchesPathway && matchesSearch;
    });
  }, [guides, subject, pathway, search]);

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="teal">Curated Reference Library</Badge>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              Nursing Study Guides
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Structured high-yield topic outlines across 9 core nursing subjects, with clinical priorities, terminology, and comparisons.
            </p>
          </div>
          <Link href="/mark-k">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Mark K. Lectures
            </Button>
          </Link>
        </div>

        {!loading && !selectedGuide && remoteStatus === "not_provisioned" && (
          <Card className="border-amber-500/30 bg-amber-500/5 p-6 space-y-2" role="status">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Study Guides Service Not Provisioned (501 NOT_PROVISIONED)</span>
            </div>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              {remoteNote || "Study Guides are server-driven through LexmaCasto and are not yet provisioned for this workspace."}
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <Link href="/mark-k">
                <Button size="sm" variant="outline" className="text-xs">Browse Mark K. Lectures</Button>
              </Link>
              <Link href="/care-plans">
                <Button size="sm" variant="outline" className="text-xs">Browse Nursing Care Plans</Button>
              </Link>
            </div>
          </Card>
        )}

        {!loading && !selectedGuide && (remoteStatus === "unauthorized" || remoteStatus === "error") && (
          <Card className="border-rose-500/30 bg-rose-500/5 p-5 text-xs sm:text-sm text-rose-700 dark:text-rose-300" role="alert">
            {remoteNote || "Unable to load Study Guides from the server."}
          </Card>
        )}

        {selectedGuide ? (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedGuide(null)}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Study Guides
              </Button>
              <div className="flex items-center gap-2 text-[11px] text-foreground-muted">
                <span>{selectedGuide.source}</span>
                <span>•</span>
                <span>v{selectedGuide.contentVersion}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="teal">{selectedGuide.subject}</Badge>
                <Badge variant="outline">{selectedGuide.pathway === "Both" ? "RN & PN/LPN" : selectedGuide.pathway}</Badge>
                <span className="text-xs text-foreground-muted inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selectedGuide.readingMinutes} min read
                </span>
              </div>
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-foreground">
                {selectedGuide.title}
              </h2>
              <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                {selectedGuide.summary}
              </p>
            </div>

            {selectedGuide.keyConcepts.length > 0 && (
              <div className="rounded-xl border border-brand-teal/25 bg-brand-teal/5 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                  Key Concepts
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-foreground-secondary">
                  {selectedGuide.keyConcepts.map((concept, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedGuide.clinicalPriorities.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Clinical Priorities
                </h3>
                <ul className="space-y-1.5 text-xs text-foreground-secondary">
                  {selectedGuide.clinicalPriorities.map((prio, idx) => (
                    <li key={idx}>• {prio}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedGuide.structuredNotes.map((section, sIdx) => (
              <section key={sIdx} className="space-y-2">
                <h3 className="font-brand text-base font-bold text-foreground border-b border-border/60 pb-1">
                  {section.heading}
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-foreground-secondary">
                  {section.points.map((pt, pIdx) => (
                    <li key={pIdx}>• {pt}</li>
                  ))}
                </ul>
              </section>
            ))}

            {selectedGuide.comparisonTable && (
              <section className="space-y-2">
                <h3 className="font-brand text-base font-bold text-foreground">
                  {selectedGuide.comparisonTable.title}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surface-muted text-foreground font-semibold">
                      <tr>
                        {selectedGuide.comparisonTable.headers.map((h) => (
                          <th key={h} className="px-3 py-2 border-b border-border">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedGuide.comparisonTable.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 text-foreground-secondary">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {selectedGuide.importantTerminology.length > 0 && (
              <section className="space-y-2">
                <h3 className="font-brand text-base font-bold text-foreground">
                  Important Terminology
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedGuide.importantTerminology.map((item) => (
                    <div key={item.term} className="rounded-xl border border-border bg-surface-muted/40 p-3 text-xs space-y-1">
                      <div className="font-bold text-foreground">{item.term}</div>
                      <div className="text-foreground-secondary">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(selectedGuide.relatedTopicSlugs.length > 0 || selectedGuide.relatedCarePlanSlugs.length > 0) && (
              <section className="border-t border-border pt-4 flex flex-wrap gap-2 items-center">
                {selectedGuide.relatedTopicSlugs.map((relSlug) => {
                  const rel = getStudyGuideBySlug(relSlug, guides);
                  if (!rel) return null;
                  return (
                    <Button
                      key={rel.slug}
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedGuide(rel)}
                      className="text-xs gap-1.5"
                    >
                      <span>Next: {rel.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  );
                })}
                {selectedGuide.relatedCarePlanSlugs.map((cpSlug) => (
                  <Link key={cpSlug} href={`/care-plans/${cpSlug}`}>
                    <Button size="sm" variant="ghost" className="text-xs text-brand-teal">
                      Related Care Plan →
                    </Button>
                  </Link>
                ))}
              </section>
            )}
          </Card>
        ) : remoteStatus === "loaded" ? (
          <>
            {/* Subject Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {STUDY_GUIDE_SUBJECTS.filter((s) => s !== "All").map((subj) => {
                const count = subjectCounts[subj] ?? 0;
                const active = subject === subj;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSubject(active ? "All" : subj)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      active
                        ? "border-brand-teal bg-brand-teal/10"
                        : "border-border bg-surface hover:border-brand-teal/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Layers className="w-4 h-4 text-brand-teal" />
                      <span className="text-[11px] font-mono text-foreground-muted">{count}</span>
                    </div>
                    <div className="mt-2 font-brand text-xs font-bold text-foreground">{subj}</div>
                  </button>
                );
              })}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(["All", "RN", "PN_LPN"] as const).map((pw) => (
                  <Button
                    key={pw}
                    size="sm"
                    variant={pathway === pw ? "primary" : "outline"}
                    onClick={() => setPathway(pw)}
                    className="text-xs"
                  >
                    {pw === "All" ? "All Pathways" : pw === "PN_LPN" ? "PN / LPN" : "RN"}
                  </Button>
                ))}
                {subject !== "All" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSubject("All")}
                    className="text-xs text-brand-teal"
                  >
                    Clear Subject ({subject})
                  </Button>
                )}
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-2.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics or concepts..."
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6 h-44 animate-pulse bg-surface-muted/40" />
                ))}
              </div>
            ) : filteredGuides.length === 0 ? (
              <Card className="p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-foreground">No study guides match your filters</p>
                <p className="text-xs text-foreground-secondary">Try resetting the subject filter or searching another topic.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGuides.map((g) => (
                  <Card key={g.id} className="p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="teal">{g.subject}</Badge>
                        <span className="text-[11px] text-foreground-muted inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {g.readingMinutes} min
                        </span>
                      </div>
                      <h2 className="font-brand text-base font-bold text-foreground">{g.title}</h2>
                      <p className="text-xs text-foreground-secondary leading-relaxed">{g.summary}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedGuide(g)}
                      className="w-full justify-between text-xs"
                    >
                      <span>Open Study Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </LearnerShell>
  );
}
