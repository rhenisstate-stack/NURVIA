"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/avatar/UserAvatar";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { user, refresh } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    setError(null);

    try {
      // For now, we'll just show a message - email change functionality will be 
      // implemented in a later phase when the actual backend is ready
      setMessage("Account settings would be updated here");
      // In a real implementation, we would call an API endpoint to update account info
    } catch (err) {
      setError("Failed to update account settings");
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
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">My Account</h1>
          <p className="text-sm text-foreground-secondary">Review and manage your account details.</p>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="account-email">Email Address</Label>
              <Input
                id="account-email"
                type="email"
                value={user?.email || ""}
                readOnly
                className="bg-surface-muted"
              />
              <p className="text-xs text-foreground-muted">
                Email changes are not available in this account flow.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="account-role">Account Role</Label>
              <Input
                id="account-role"
                value={user?.role || ""}
                readOnly
                className="bg-surface-muted"
              />
              <p className="text-xs text-foreground-muted">
                Roles and permissions can only be changed by an authorized administrator.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="account-created">Account Created</Label>
              <Input
                id="account-created"
                value="January 2024"
                readOnly
                className="bg-surface-muted"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="account-status">Account Status</Label>
              <Input
                id="account-status"
                value="Active"
                readOnly
                className="bg-surface-muted"
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </LearnerShell>
  );
}