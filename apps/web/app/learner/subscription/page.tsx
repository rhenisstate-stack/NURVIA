"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <LearnerShell>
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-1">
          <Badge variant="outline">Out of Scope — Future Module</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Subscription &amp; Billing
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Subscription billing and payment plans are not enabled in this local release.
          </p>
        </div>

        <Card className="p-6 flex items-start gap-4">
          <Info className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h2 className="font-brand text-base font-bold text-foreground">
              Billing Management Unavailable
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
              Your account already has access to published exams, study library sets, and Mark K. lecture notes based on your declared nursing pathway.
            </p>
            <Link href="/learner/exams" className="inline-block">
              <Button size="sm" className="text-xs bg-brand-teal text-white hover:bg-brand-tealDark">
                Explore Published Exams
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
