"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initialStudySets } from "@/lib/study-sets-data";
import { BookMarked, Play, Eye, ArrowRight } from "lucide-react";

export default function MyExamsPage() {
  const savedSets = initialStudySets.slice(0, 4);

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              My Library
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Bookmarked study sets and active practice modules saved to your account.
            </p>
          </div>
          <Link href="/learner/library">
            <Button size="sm" className="text-xs bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
              Find More Study Sets
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedSets.map((set) => (
            <Card key={set.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="teal">{set.category}</Badge>
                  <span className="text-xs text-foreground-muted">{set.questionCount} questions</span>
                </div>
                <CardTitle className="text-base">{set.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {set.description}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Link href={`/exam-session?setId=${set.id}&mode=Exam`} className="flex-1">
                  <Button size="sm" className="w-full text-xs h-8 gap-1.5 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Practice Exam</span>
                  </Button>
                </Link>
                <Link href={`/exam-session?setId=${set.id}&mode=Review`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Mode</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
