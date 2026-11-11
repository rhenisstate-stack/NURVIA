"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    setError(null);

    // Basic validation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsUpdating(false);
      return;
    }

    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters long");
      setIsUpdating(false);
      return;
    }

    try {
      // In a real implementation, we would call an API to update password
      setMessage("Password changed successfully!");
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError("Failed to change password");
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
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Security Settings</h1>
          <p className="text-sm text-foreground-secondary">Manage your account security settings.</p>
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
          <h2 className="text-lg font-semibold text-foreground mb-4">Change Password</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-foreground-muted">
                Minimum 12 characters
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
                {isUpdating ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Session Management</h2>
          
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Active Sessions</Label>
                  <p className="text-sm text-foreground-secondary">View and manage your active sessions</p>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
            </div>
            
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Sign Out All Devices</Label>
                  <p className="text-sm text-foreground-secondary">End all active sessions</p>
                </div>
                <Button variant="destructive" size="sm">Sign Out All</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}