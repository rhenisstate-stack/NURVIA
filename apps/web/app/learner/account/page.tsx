"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, GraduationCap, Calendar, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  return (
    <LearnerShell>
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-1">
          <Badge variant="teal">Profile & Enrollment</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            My Learner Account
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Manage your nursing student profile, exam target dates, and academic preferences.
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xl shadow-md">
              EV
            </div>
            <div>
              <h3 className="font-brand text-lg font-bold text-foreground">Elena Vance</h3>
              <p className="text-xs text-foreground-muted">elena.vance@nursing.edu</p>
              <Badge variant="teal" className="mt-1">Active Learner Access</Badge>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-border bg-surface-muted/40">
                <span className="text-[11px] text-foreground-muted block">Degree Program</span>
                <strong className="text-foreground">BSN Pre-Licensure Track</strong>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-muted/40">
                <span className="text-[11px] text-foreground-muted block">Target NCLEX Date</span>
                <strong className="text-foreground">May 2026</strong>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-muted/40">
                <span className="text-[11px] text-foreground-muted block">Current Institution</span>
                <strong className="text-foreground">College of Nursing</strong>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-muted/40">
                <span className="text-[11px] text-foreground-muted block">Account Status</span>
                <strong className="text-emerald-600 dark:text-emerald-400">Verified Student</strong>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
