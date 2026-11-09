"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";

export default function SignUpPage() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [signInHref, setSignInHref] = React.useState("/sign-in");

  React.useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("returnTo");
    if (requested?.startsWith("/")) {
      try {
        const destination = new URL(requested, window.location.origin);
        if (destination.origin === window.location.origin &&
            !["/sign-in", "/sign-up", "/access-denied"].includes(destination.pathname)) {
          setSignInHref(`/sign-in?returnTo=${encodeURIComponent(`${destination.pathname}${destination.search}${destination.hash}`)}`);
        }
      } catch {
        setSignInHref("/sign-in");
      }
    }

    if (status === "authenticated" && user) {
      router.replace(user.role === "Learner" ? "/learner" : "/access-denied");
    }
  }, [status, user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 12) {
      setError("Use at least 12 characters for your password.");
      return;
    }

    setSubmitting(true);
    const response = await nurviaApi.register({ name: name.trim(), email: email.trim(), password });
    setSubmitting(false);
    if (!response.success) {
      setError(response.message || "Unable to create your account. Please try again.");
      return;
    }
    setSuccess(true);
  }

  return (
    <PublicShell>
      <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
              <UserRoundPlus className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-brand text-3xl font-bold text-foreground">Create your learner account</h1>
            <p className="text-sm text-foreground-secondary">Start building confidence with focused nursing exam practice.</p>
          </div>

          {success ? (
            <div role="status" className="space-y-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
              <p>Your registration request is complete. Sign in to continue.</p>
              <Button type="button" className="w-full" onClick={() => router.push(signInHref)}>Go to Sign In</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-foreground">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={200}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={320}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={256}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-describedby="password-hint"
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-12 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p id="password-hint" className="text-xs text-foreground-muted">Use at least 12 characters. Your password is stored as a one-way hash.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmation" className="text-sm font-semibold text-foreground">Confirm password</label>
                <input
                  id="confirmation"
                  name="confirmation"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  maxLength={256}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                />
              </div>
              {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
              <Button type="submit" className="w-full" isLoading={submitting} disabled={submitting || status === "loading"}>
                Create learner account
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Already registered?{" "}
            <Link href={signInHref} className="font-semibold text-brand-teal underline-offset-4 hover:underline">Sign In</Link>
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
