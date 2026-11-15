"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { nurviaApi } from "@/lib/api-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = React.useState(tokenFromUrl);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tokenFromUrl && !token) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("A valid password reset token is required.");
      return;
    }
    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await nurviaApi.resetPassword({
        token: token.trim(),
        newPassword,
      });
      if (!response.success) {
        setError(response.message || "The password reset token is invalid or has expired.");
        return;
      }
      setSuccessMessage(response.message || "Your password has been reset. You may now sign in.");
    } catch {
      setError("Unable to reach the authentication service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="reset-password-heading" className="rounded-3xl border border-border bg-surface-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 id="reset-password-heading" className="font-display text-3xl font-bold text-foreground">
          Choose a new password
        </h1>
        <p className="text-sm text-foreground-secondary">
          Enter a strong password of at least 12 characters to complete your reset.
        </p>
      </div>

      {successMessage ? (
        <div role="status" className="mt-8 space-y-4 rounded-2xl border border-emerald-300/60 bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <p>{successMessage}</p>
          <Link
            href="/sign-in"
            className="inline-flex text-sm font-semibold text-brand-teal underline-offset-4 hover:underline"
          >
            Continue to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {!tokenFromUrl && (
            <div className="space-y-1.5">
              <label htmlFor="reset-token" className="text-sm font-semibold text-foreground">
                Reset token
              </label>
              <input
                id="reset-token"
                name="token"
                type="text"
                required
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface-primary px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                placeholder="Paste your reset token"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-sm font-semibold text-foreground">
              New password
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface-primary px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              placeholder="At least 12 characters"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface-primary px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              placeholder="Repeat your new password"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={submitting} disabled={submitting}>
            Update Password
          </Button>
        </form>
      )}
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto flex w-full max-w-md flex-col px-4 py-14 sm:px-6">
        <React.Suspense
          fallback={
            <div className="rounded-3xl border border-border bg-surface-card p-8 text-center text-sm text-foreground-secondary shadow-sm">
              Loading password reset form...
            </div>
          }
        >
          <ResetPasswordForm />
        </React.Suspense>
      </main>
    </PublicShell>
  );
}
