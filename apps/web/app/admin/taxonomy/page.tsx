"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderTree } from "lucide-react";
import { nurviaApi } from "@/lib/api-client";

interface TaxonomyData {
  totalQuestions: number;
  clientNeedsCategories: {
    category: string;
    questionCount: number;
    subjects: string[];
  }[];
  pathways: string[];
  subjects: string[];
  topics: string[];
}

export default function AdminTaxonomyPage() {
  const [data, setData] = React.useState<TaxonomyData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void nurviaApi.getAdminTaxonomy().then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Unable to load taxonomy metadata.");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Curriculum Taxonomy &amp; Client Needs
              </h1>
              <Badge variant="teal">NCSBN Mapped</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Live question distribution across Client Needs categories, nursing pathways, subjects, and topics.
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-foreground-secondary" aria-live="polite">
            Loading taxonomy metadata…
          </p>
        ) : data && (
          <div className="space-y-4">
            {data.clientNeedsCategories.map((node) => (
              <Card key={node.category} className="p-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <FolderTree className="w-4 h-4 text-brand-teal" />
                    <h3 className="font-brand text-base font-bold text-foreground">
                      {node.category}
                    </h3>
                  </div>
                  <Badge variant="outline">{node.questionCount.toLocaleString()} Questions</Badge>
                </div>

                <div className="pt-3 pl-2 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                    Active Subjects in Category:
                  </span>
                  {node.subjects.length === 0 ? (
                    <p className="text-xs text-foreground-muted">No subjects tagged in this category yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {node.subjects.map((sub) => (
                        <Badge key={sub} variant="secondary" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            <Card className="p-5 space-y-3">
              <h3 className="font-brand text-base font-bold text-foreground">
                Supported Pathways ({data.pathways.length}) &amp; Topics ({data.topics.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.pathways.map((p) => (
                  <Badge key={p} variant="teal">{p}</Badge>
                ))}
              </div>
              {data.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {data.topics.map((t) => (
                    <Badge key={t} variant="outline" className="text-[11px]">{t}</Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
