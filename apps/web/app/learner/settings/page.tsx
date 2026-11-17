"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Bell } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

function applyThemePreference(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("theme", mode);
  } catch {
    // Ignore storage restriction
  }
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
}

export default function SettingsPage() {
  const [theme, setTheme] = React.useState<ThemeMode>("system");
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        setTheme(saved);
      }
    } catch {
      // Ignore storage restriction
    }
  }, []);

  const handleThemeChange = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    applyThemePreference(nextTheme);
    setMessage(`Display theme updated to ${nextTheme}.`);
  };

  return (
    <LearnerShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
          <p className="text-sm text-foreground-secondary">Manage your display preferences and access account security tools.</p>
        </div>

        {message && (
          <Alert variant="default">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Display Preferences</h2>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="theme" className="font-medium">Color Theme</Label>
                <p className="text-sm text-foreground-secondary">Choose your preferred color scheme for this browser</p>
              </div>
              <select
                id="theme"
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
                className="rounded border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Account &amp; Security</h2>

            <div className="space-y-3">
              <div className="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-1 text-brand-teal shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Profile &amp; Account Details</p>
                    <p className="text-xs text-foreground-secondary">Update your display name, biography, and nursing pathway</p>
                  </div>
                </div>
                <Link href="/learner/profile">
                  <Button variant="outline" size="sm">Manage Profile</Button>
                </Link>
              </div>

              <div className="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 mt-1 text-brand-teal shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Password, 2FA &amp; Sessions</p>
                    <p className="text-xs text-foreground-secondary">Change your password, configure two-factor authentication, or sign out all devices</p>
                  </div>
                </div>
                <Link href="/learner/settings/security">
                  <Button variant="outline" size="sm">Security Settings</Button>
                </Link>
              </div>

              <div className="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-4 h-4 mt-1 text-brand-teal shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Notifications &amp; Support Inbox</p>
                    <p className="text-xs text-foreground-secondary">View server notifications and support messages</p>
                  </div>
                </div>
                <Link href="/learner/notifications">
                  <Button variant="outline" size="sm">Open Inbox</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
