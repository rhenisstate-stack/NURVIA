"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { nurviaApi } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await nurviaApi.forgotPassword({ email: email.trim() });
      if (!response.success) {
        setError(response.message || "Unable to process password reset request.");
        return;
      }
      setSubmittedMessage(
        response.message ||
          "If an account with that email exists, password reset instructions have been sent."
      );
    } catch {
      setError("Unable to reach the authentication service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <main id="main-content" className="mx-auto flex w-full max-w-md flex-col px-4 py-14 sm:px-6">
        <section aria-labelledby="forgot-password-heading" className="rounded-3xl border border-border bg-surface-card p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 id="forgot-password-heading" className="font-display text-3xl font-bold text-foreground">
              Reset your password
            </h1>
            <p className="text-sm text-foreground-secondary">
              Enter your account email address and we will send password reset instructions if an active account exists.
            </p>
          </div>

          {submittedMessage ? (
            <div role="status" className="mt-8 space-y-4 rounded-2xl border border-emerald-300/60 bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <p>{submittedMessage}</p>
              <Link
                href="/sign-in"
                className="inline-flex text-sm font-semibold text-brand-teal underline-offset-4 hover:underline"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface-primary px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                  placeholder="student@nursing.edu"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" isLoading={submitting} disabled={submitting}>
                Send Reset Instructions
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Remembered your password?{" "}
            <Link href="/sign-in" className="font-semibold text-brand-teal underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
