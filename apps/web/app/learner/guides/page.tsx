"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nurviaApi } from "@/lib/api-client";
import type { StudyGuideDetailDto, StudyGuideSummaryDto } from "@/lib/api-types";
import { BookOpen, Download, Search, Clock, ArrowLeft } from "lucide-react";

const CATEGORIES = ["All", "Pharmacology", "Med-Surg", "Maternal-Newborn", "Leadership"];

export default function StudyGuidesPage() {
  const [guides, setGuides] = React.useState<StudyGuideSummaryDto[]>([]);
  const [selectedGuide, setSelectedGuide] = React.useState<StudyGuideDetailDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const loadGuides = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getStudyGuides({
      category: category === "All" ? undefined : category,
      search: search.trim() || undefined,
    });
    if (res.success && res.data) {
      setGuides(res.data);
    } else {
      setError(res.message || "Unable to load study guides.");
    }
    setLoading(false);
  }, [category, search]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGuides();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [loadGuides]);

  const openGuide = async (id: string) => {
    setError(null);
    const res = await nurviaApi.getStudyGuideById(id);
    if (res.success && res.data) {
      setSelectedGuide(res.data);
    } else {
      setError(res.message || "Unable to open study guide.");
    }
  };

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="teal">Curated Reference Library</Badge>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              Study Guides &amp; High-Yield Outlines
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Read and download PostgreSQL-backed clinical study guides, or jump to Mark K. Lecture Notes.
            </p>
          </div>
          <Link href="/mark-k">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Mark K. Lectures
            </Button>
          </Link>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {selectedGuide ? (
          <Card className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedGuide(null)} className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Guides
              </Button>
              <a
                href={`/api/backend/study-guides/${selectedGuide.id}/download`}
                download={`${selectedGuide.slug}.md`}
              >
                <Button size="sm" className="gap-1.5 bg-brand-teal hover:bg-brand-tealDark text-white text-xs">
                  <Download className="w-3.5 h-3.5" /> Download Guide (.md)
                </Button>
              </a>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="teal">{selectedGuide.category}</Badge>
                <Badge variant="outline">{selectedGuide.pathway}</Badge>
                <span className="text-xs text-foreground-muted inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selectedGuide.readingMinutes} min read
                </span>
              </div>
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-foreground">{selectedGuide.title}</h2>
              <p className="text-xs text-foreground-secondary">{selectedGuide.summary}</p>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-foreground bg-surface-muted p-5 rounded-xl border border-border">
              {selectedGuide.contentMarkdown}
            </pre>
          </Card>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={category === c ? "primary" : "outline"}
                    onClick={() => setCategory(c)}
                    className="text-xs h-8"
                  >
                    {c}
                  </Button>
                ))}
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-2.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search study guides..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {loading ? (
              <Card className="p-8 text-center text-sm text-foreground-secondary">Loading study guides…</Card>
            ) : guides.length === 0 ? (
              <Card className="p-8 text-center text-sm text-foreground-secondary">No study guides match your search.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guides.map((g) => (
                  <Card key={g.id} className="p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="teal">{g.category}</Badge>
                        <span className="text-xs text-foreground-muted">{g.pathway} · {g.readingMinutes} min</span>
                      </div>
                      <h2 className="font-brand text-base font-bold text-foreground">{g.title}</h2>
                      <p className="text-xs text-foreground-secondary leading-relaxed">{g.summary}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <Button size="sm" variant="outline" onClick={() => void openGuide(g.id)} className="text-xs">
                        Read Guide
                      </Button>
                      <a
                        href={`/api/backend/study-guides/${g.id}/download`}
                        download={`${g.slug}.md`}
                      >
                        <Button size="sm" className="gap-1.5 bg-brand-teal hover:bg-brand-tealDark text-white text-xs">
                          <Download className="w-3.5 h-3.5" /> Download
                        </Button>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </LearnerShell>
  );
}
