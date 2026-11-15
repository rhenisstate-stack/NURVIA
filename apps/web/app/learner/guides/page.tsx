"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function StudyGuidesPage() {
  return (
    <LearnerShell>
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-1">
          <Badge variant="outline">Out of Scope — Future Module</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Downloadable Study Guides
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            PDF study guide downloads are a planned future module. Use the live Mark K. Lecture Notes and Study Library below.
          </p>
        </div>

        <Card className="p-6 flex items-start gap-4">
          <BookOpen className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h2 className="font-brand text-base font-bold text-foreground">
              Live Study Resources Available Now
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
              Access published Mark K. Lecture Notes and curated Study Library sets backed by PostgreSQL.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/mark-k">
                <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
                  Open Mark K. Lectures
                </Button>
              </Link>
              <Link href="/learner/library">
                <Button size="sm" variant="outline" className="text-xs">
                  Open Study Library
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
