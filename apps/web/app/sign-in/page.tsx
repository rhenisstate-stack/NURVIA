"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { RedirectScreen } from "@/components/shared/feedback/RedirectScreen";

function defaultDestination(role: string) {
  if (role === "Learner") return "/learner";
  if (["Author", "Reviewer", "Publisher", "Administrator", "Superadmin"].includes(role)) {
    return "/admin";
  }
  return "/access-denied";
}

function safeReturnTo() {
  const requested = new URLSearchParams(window.location.search).get("returnTo");
  if (!requested || !requested.startsWith("/")) return null;
  try {
    const destination = new URL(requested, window.location.origin);
    if (destination.origin !== window.location.origin ||
        ["/sign-in", "/sign-up", "/access-denied"].includes(destination.pathname)) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}

export default function SignInPage() {
  const router = useRouter();
  const { status, user, signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const completedSignIn = React.useRef(false);

  React.useEffect(() => {
    if (status === "authenticated" && user && !completedSignIn.current) {
      router.replace(safeReturnTo() || defaultDestination(user.role));
    }
  }, [status, user, router]);

  // Show redirect screen when authentication is in progress.
  // This early return must stay below every hook call (Rules of Hooks); because it
  // handles the "loading" state, the form below only renders for the other states.
  if (status === "loading") {
    return <RedirectScreen heading="Verifying your access" description="Please wait while we securely prepare your account." />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await signIn({ email: email.trim(), password });
    setSubmitting(false);
    if (!response.success || !response.data) {
      setError(response.message || "Unable to sign in. Please try again.");
      return;
    }

    completedSignIn.current = true;
    router.replace(safeReturnTo() || defaultDestination(response.data.role));
  }

  return (
    <PublicShell>
      <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-brand text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-foreground-secondary">Sign in to continue your nursing exam preparation.</p>
          </div>

          {status === "error" && (
            <p role="alert" className="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {error || "We could not verify your session. Check your connection and try again."}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="current-password"
                  required
                  maxLength={256}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
            </div>
            {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
            <Button type="submit" className="w-full" isLoading={submitting} disabled={submitting}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            New to NURVIA?{" "}
            <Link href="/sign-up" className="font-semibold text-brand-teal underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
