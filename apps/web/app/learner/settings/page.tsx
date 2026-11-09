"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Moon, Sun, Bell, Volume2, Shield } from "lucide-react";

export default function SettingsPage() {
  const [soundEffects, setSoundEffects] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [highContrast, setHighContrast] = React.useState(false);

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-1">
          <Badge variant="teal">Preferences</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Configure examination simulation behavior, audio cues, and notification preferences.
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-semibold text-foreground block">Exam Simulation Timer Audio</span>
                <span className="text-foreground-muted">Alert when 5 minutes remain on proctored exams</span>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="rounded accent-brand-teal h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-semibold text-foreground block">Daily Spaced Repetition Reminders</span>
                <span className="text-foreground-muted">Receive email reminders when review cards are due</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded accent-brand-teal h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground block">High Contrast Testing Mode</span>
                <span className="text-foreground-muted">Enhance visual contrast during exam sessions</span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="rounded accent-brand-teal h-4 w-4"
              />
            </div>
          </div>
        </Card>
      </div>
    </LearnerShell>
  );
}
