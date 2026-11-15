"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function AiTutorPage() {
  return (
    <LearnerShell>
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-1">
          <Badge variant="teal">Socratic Clinical Tutor</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            AI Clinical Judgment Tutor
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            NURVIA&apos;s progressive Socratic tutor runs inside active Tutor-mode exam sessions to keep guidance grounded in the current question.
          </p>
        </div>

        <Card className="p-6 flex items-start gap-4">
          <Bot className="w-6 h-6 text-brand-teal shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h2 className="font-brand text-base font-bold text-foreground">
              Launch a Tutor-Mode Practice Session
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
              Select any published exam and choose <strong>Tutor Mode</strong> to request progressive hints, evaluate your clinical reasoning, and view deferred rationales.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/learner/custom-practice">
                <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
                  Choose Practice Exam
                </Button>
              </Link>
              <Link href="/learner/exams">
                <Button size="sm" variant="outline" className="text-xs">
                  Browse Exam Tracks
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
