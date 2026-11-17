"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { status, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [twoFaLoading, setTwoFaLoading] = React.useState(false);
  const [twoFaSecret, setTwoFaSecret] = React.useState<string | null>(null);
  const [twoFaQr, setTwoFaQr] = React.useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = React.useState("");
  const [twoFaEnabled, setTwoFaEnabled] = React.useState<boolean | null>(null);
  const [isSigningOutAll, setIsSigningOutAll] = React.useState(false);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    void nurviaApi.getTwoFactorStatus().then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        const enabled = Boolean(
          (res.data as Record<string, unknown>).enabled ??
          (res.data as Record<string, unknown>).twoFactorEnabled
        );
        setTwoFaEnabled(enabled);
      }
    });
    return () => {
      active = false;
    };
  }, [status]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters long.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await nurviaApi.changeSupportPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        setMessage("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.message || "Unable to change password.");
      }
    } catch {
      setError("Network error while changing password.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetupTwoFactor = async () => {
    setTwoFaLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await nurviaApi.setupTwoFactor();
      if (res.success && res.data) {
        const data = res.data as Record<string, unknown>;
        setTwoFaSecret(typeof data.secret === "string" ? data.secret : null);
        setTwoFaQr(typeof data.qrCodeUrl === "string" ? data.qrCodeUrl : null);
        setMessage("Scan the authenticator setup details and enter the verification code below.");
      } else {
        setError(res.message || "Unable to initialize two-factor authentication.");
      }
    } catch {
      setError("Network error while initializing two-factor authentication.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirmTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaCode.trim()) return;
    setTwoFaLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await nurviaApi.confirmTwoFactor(twoFaCode.trim());
      if (res.success) {
        setTwoFaEnabled(true);
        setTwoFaSecret(null);
        setTwoFaQr(null);
        setTwoFaCode("");
        setMessage("Two-factor authentication enabled.");
      } else {
        setError(res.message || "Invalid verification code.");
      }
    } catch {
      setError("Network error while confirming two-factor authentication.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setTwoFaLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await nurviaApi.disableTwoFactor();
      if (res.success) {
        setTwoFaEnabled(false);
        setMessage("Two-factor authentication disabled.");
      } else {
        setError(res.message || "Unable to disable two-factor authentication.");
      }
    } catch {
      setError("Network error while disabling two-factor authentication.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    setIsSigningOutAll(true);
    setError(null);
    try {
      await nurviaApi.logout({ scope: "relative" });
      await signOut();
      router.replace("/sign-in");
    } catch {
      setError("Unable to sign out of all sessions.");
      setIsSigningOutAll(false);
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
        <div className="space-y-1">
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">Security Settings</h1>
          <p className="text-sm text-foreground-secondary">Manage your password, two-factor authentication, and active sessions.</p>
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

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
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
              <p className="text-xs text-foreground-muted">Minimum 12 characters</p>
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

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-teal" /> Two-Factor Authentication
              </h2>
              <p className="text-xs text-foreground-secondary">
                {twoFaEnabled === true
                  ? "Two-factor authentication is currently enabled."
                  : "Protect your account with an authenticator app."}
              </p>
            </div>
            {twoFaEnabled ? (
              <Button variant="outline" size="sm" onClick={handleDisableTwoFactor} disabled={twoFaLoading}>
                Disable 2FA
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleSetupTwoFactor} disabled={twoFaLoading}>
                Setup 2FA
              </Button>
            )}
          </div>

          {(twoFaSecret || twoFaQr) && (
            <form onSubmit={handleConfirmTwoFactor} className="space-y-3 border-t border-border pt-4">
              {twoFaSecret && (
                <p className="text-xs font-mono bg-surface-muted p-2 rounded">Secret: {twoFaSecret}</p>
              )}
              <div className="flex gap-2">
                <Input
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  placeholder="Enter 6-digit authenticator code"
                  required
                />
                <Button type="submit" size="sm" disabled={twoFaLoading}>
                  Verify
                </Button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Session Management</h2>
              <p className="text-xs text-foreground-secondary">
                Sign out from all active devices and invalidate remote sessions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleSignOutAll}
              disabled={isSigningOutAll}
            >
              <LogOut className="w-3.5 h-3.5" />
              {isSigningOutAll ? "Signing out..." : "Sign Out All Devices"}
            </Button>
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
