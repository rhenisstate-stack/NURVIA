"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export default function AdminPlansPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
                Subscription Plans &amp; Entitlements
              </h1>
              <Badge variant="outline">Out of Scope — Future Module</Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Subscription billing and payment entitlements are not part of the current local NURVIA release.
            </p>
          </div>
        </div>

        <Card className="p-6 flex items-start gap-4">
          <Info className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h2 className="font-brand text-base font-bold text-foreground">
              Billing &amp; Plan Management Unavailable
            </h2>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              No subscription plan entities or payment provider integrations are configured in this environment.
              All published examinations and study resources are governed by role-based access control and pathway eligibility.
            </p>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
