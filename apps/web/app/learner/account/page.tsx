"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Trash2, UserCheck } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, status, refresh, signOut } = useAuth();
  const [displayName, setDisplayName] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteReason, setDeleteReason] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Display name cannot be empty.");
      return;
    }

    setIsUpdating(true);
    setMessage(null);
    setError(null);

    try {
      const res = await nurviaApi.updateSupportAccount({ name: trimmed, username: trimmed });
      if (res.success) {
        setMessage("Account details updated.");
        await refresh();
      } else {
        setError(res.message || "Unable to update account details on the server.");
      }
    } catch {
      setError("Unable to reach the server to update account details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await nurviaApi.destroyAccount(deleteReason.trim() || "User requested account deletion");
      if (res.success) {
        await signOut();
        router.replace("/sign-in");
      } else {
        setError(res.message || "Unable to delete account.");
      }
    } catch {
      setError("Unable to reach the server to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "loading") {
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">My Account</h1>
            <p className="text-sm text-foreground-secondary">Review and manage your server-verified account details.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/learner/profile">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </Link>
            <Link href="/learner/settings/security">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Security
              </Button>
            </Link>
          </div>
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
              <Label htmlFor="account-name">Display Name</Label>
              <Input
                id="account-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

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
                Primary email changes are managed through account verification.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-role">Account Role</Label>
              <Input
                id="account-role"
                value={user?.role || "Learner"}
                readOnly
                className="bg-surface-muted"
              />
              <p className="text-xs text-foreground-muted">
                Roles and permissions are authoritative on the server and can only be changed by an administrator.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-id">Account Identifier</Label>
              <Input
                id="account-id"
                value={user?.id || ""}
                readOnly
                className="bg-surface-muted font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                <UserCheck className="w-3.5 h-3.5" /> Active authenticated session
              </span>
              <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-rose-700 dark:text-rose-300">Delete Account</h2>
              <p className="text-xs text-foreground-secondary">
                Permanently delete your account and terminate your active session.
              </p>
            </div>
            {!showDeleteConfirm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-rose-500/40 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300 gap-1.5"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Account
              </Button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="space-y-3 border-t border-rose-500/20 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="delete-reason">Reason (optional)</Label>
                <Input
                  id="delete-reason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Optional reason for leaving"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Permanent Deletion"}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </LearnerShell>
  );
}
