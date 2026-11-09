"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, CheckCircle2, Heart } from "lucide-react";

export default function CommunityPage() {
  const discussions = [
    {
      author: "Brianna M., BSN Senior",
      cohort: "Spring 2026 NCLEX Cohort",
      time: "2 hours ago",
      title: "How did everyone study for the ATI Maternal Newborn Level 3?",
      content: "I'm scoring around 74% right now. What specific topics on fetal monitoring and postpartum hemorrhage gave you the biggest boost?",
      replies: 18,
      likes: 24,
    },
    {
      author: "Darius K., Accelerated BSN",
      cohort: "RN Pre-Licensure Track",
      time: "5 hours ago",
      title: "NGN BowTie and Matrix item practice tips",
      content: "Make sure you read the nurses notes first! If you see trending fever and crackles, prioritize pneumonia or atelectasis before jumping to cardiac.",
      replies: 31,
      likes: 47,
    },
  ];

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge variant="teal">Peer Learning</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Student Cohort Community
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Connect with fellow nursing candidates preparing for ATI proctored assessments and NCLEX licensure.
          </p>
        </div>

        <div className="space-y-4">
          {discussions.map((d, idx) => (
            <Card key={idx} className="p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-foreground-muted border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{d.author}</span>
                  <span>•</span>
                  <span>{d.cohort}</span>
                </div>
                <span>{d.time}</span>
              </div>

              <CardTitle className="text-base text-foreground font-bold">{d.title}</CardTitle>
              <p className="text-xs text-foreground-secondary leading-relaxed">{d.content}</p>

              <div className="pt-2 flex items-center gap-4 text-xs text-foreground-muted">
                <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-teal" />
                  <span>{d.replies} replies</span>
                </span>
                <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{d.likes} likes</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
