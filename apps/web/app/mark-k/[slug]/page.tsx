"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import { LectureContentDto } from "@/lib/api-types";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertCircle,
  BookOpen,
} from "lucide-react";

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      tokens.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      tokens.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      tokens.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-surface-muted text-xs font-mono">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }
  return tokens;
}

function SafeMarkdownBody({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="font-brand text-base font-bold text-foreground pt-4">
          {renderInlineFormatting(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="font-brand text-xl font-bold text-foreground pt-6 pb-1 border-b border-border/60">
          {renderInlineFormatting(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const rows = tableLines
        .filter((row) => !/^\|[\s\-:|]+\|$/.test(row))
        .map((row) =>
          row
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim())
        );

      if (rows.length > 0) {
        const [header, ...body] = rows;
        blocks.push(
          <div key={key++} className="overflow-x-auto my-4 rounded-xl border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-muted text-foreground font-semibold">
                <tr>
                  {header.map((cell, idx) => (
                    <th key={idx} className="px-3 py-2 border-b border-border">
                      {renderInlineFormatting(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className="bg-surface">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-foreground-secondary">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-1.5 text-sm text-foreground-secondary leading-relaxed">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-5 space-y-1.5 text-sm text-foreground-secondary leading-relaxed">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    blocks.push(
      <p key={key++} className="text-sm text-foreground-secondary leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-3">{blocks}</div>;
}

export default function MarkKLectureReaderPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { status } = useAuth();

  const [lecture, setLecture] = React.useState<LectureContentDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorKind, setErrorKind] = React.useState<"none" | "unauthenticated" | "forbidden" | "not_found" | "error">("none");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  React.useEffect(() => {
    if (!slug || status === "loading") return;
    let cancelled = false;

    async function loadLecture() {
      setIsLoading(true);
      setErrorKind("none");
      setErrorMessage("");

      try {
        const response = await nurviaApi.getLectureBySlug(slug);
        if (cancelled) return;

        if (response.success && response.data) {
          setLecture(response.data);
        } else {
          const msg = (response.message || "").toLowerCase();
          if (msg.includes("not found")) {
            setErrorKind("not_found");
          } else if (msg.includes("authentication") || msg.includes("sign in") || status === "unauthenticated") {
            setErrorKind("unauthenticated");
          } else if (msg.includes("permission") || msg.includes("forbidden")) {
            setErrorKind("forbidden");
          } else {
            setErrorKind("error");
          }
          setErrorMessage(response.message || "Unable to load lecture.");
        }
      } catch {
        if (!cancelled) {
          setErrorKind("error");
          setErrorMessage("Unable to reach the lecture service.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadLecture();
    return () => {
      cancelled = true;
    };
  }, [slug, status]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Link href="/mark-k" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Mark K. Lecture Index
        </Link>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 space-y-4">
            <div className="h-5 w-32 rounded bg-surface-muted animate-pulse" />
            <div className="h-8 w-2/3 rounded bg-surface-muted animate-pulse" />
            <div className="h-40 w-full rounded bg-surface-muted animate-pulse" />
          </div>
        ) : errorKind === "unauthenticated" ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-brand text-xl font-bold text-foreground">
              Learner Account Required
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary max-w-md mx-auto">
              Lectures 1–3 are open to all visitors. Lectures 4–12 require a signed-in NURVIA learner account.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href={`/sign-in?returnTo=${encodeURIComponent(`/mark-k/${slug}`)}`}>
                <Button size="sm" className="text-xs bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Sign In to Read Lecture
                </Button>
              </Link>
              <Link href="/mark-k">
                <Button variant="outline" size="sm" className="text-xs">
                  Return to Catalogue
                </Button>
              </Link>
            </div>
          </div>
        ) : errorKind !== "none" || !lecture ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h1 className="font-brand text-lg font-bold text-foreground">
              {errorKind === "not_found" ? "Lecture Not Found" : "Unable to Open Lecture"}
            </h1>
            <p className="text-xs text-foreground-secondary max-w-md mx-auto">
              {errorMessage || "This lecture may not be published or you may not have access."}
            </p>
            <Link href="/mark-k">
              <Button variant="outline" size="sm" className="text-xs">
                Return to Lecture Index
              </Button>
            </Link>
          </div>
        ) : (
          <article className="space-y-6">
            <header className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-brand font-bold text-xs px-2.5 py-1 rounded-md bg-brand-teal/10 text-brand-teal">
                  Lecture {lecture.number}
                </span>
                <Badge variant="outline">{lecture.category}</Badge>
                <Badge variant={lecture.accessLevel === "Public" ? "teal" : "outline"}>
                  {lecture.accessLevel === "Public" ? "Public Access" : "Learner Access"}
                </Badge>
              </div>

              <h1 className="font-brand text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                {lecture.title}
              </h1>

              <p className="text-sm text-foreground-secondary leading-relaxed">
                {lecture.summary}
              </p>

              {lecture.highYieldConcepts.length > 0 && (
                <div className="p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    High-Yield Concepts
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground-secondary">
                    {lecture.highYieldConcepts.map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </header>

            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <SafeMarkdownBody markdown={lecture.bodyMarkdown} />
            </section>

            <footer className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p>
                NURVIA is independent and is not affiliated with, endorsed by, or officially connected to Mark Klimek or Klimek Reviews. All notes above are original NURVIA educational materials.
              </p>
            </footer>
          </article>
        )}
      </div>
    </PublicShell>
  );
}
