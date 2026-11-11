"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    setError(null);

    try {
      // In a real implementation, we would call an API to update settings
      setMessage("Settings saved successfully!");
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
          <p className="text-sm text-foreground-secondary">Manage your application preferences.</p>
        </div>

        {message && (
          <Alert variant="default">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
              
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="notifications" className="font-medium">Enable Notifications</Label>
                  <p className="text-sm text-foreground-secondary">Receive important updates and alerts</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="theme" className="font-medium">Theme</Label>
                  <p className="text-sm text-foreground-secondary">Choose your preferred color scheme</p>
                </div>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="rounded border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Account Security</h2>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Password</Label>
                      <p className="text-sm text-foreground-secondary">Change your account password</p>
                    </div>
                    <Button variant="outline" size="sm">Change Password</Button>
                  </div>
                </div>
                
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-foreground-secondary">Add extra security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">Setup</Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </LearnerShell>
  );
}