"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { RedirectScreen } from "@/components/shared/feedback/RedirectScreen";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_PATTERN = /^\d{4,12}$/;

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
    if (
      destination.origin !== window.location.origin ||
      ["/sign-in", "/sign-up", "/access-denied"].includes(destination.pathname)
    ) {
      return null;
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}

type SignInMethod = "password" | "pin";

function formatServerLoginError(errorCode?: string, message?: string): string {
  switch (errorCode) {
    case "CHALLENGE_REQUIRED":
      return "Sign-in verification challenge is required by the backend service and is not yet provisioned for this application.";
    case "CHALLENGE_REJECTED":
      return "Sign-in verification challenge was rejected by the backend service (Deslizar verification required).";
    case "CHALLENGE_EXPIRED":
      return "Your sign-in verification challenge expired. Please try again.";
    case "INVALID_CREDENTIALS":
      return message || "Invalid email or credentials. Please verify your details and try again.";
    case "BACKEND_ERROR":
    case "NETWORK_ERROR":
    case "TIMEOUT":
      return message || "The authentication service is temporarily unavailable. Please try again shortly.";
    default:
      return message || "Unable to sign in. Please check your credentials and try again.";
  }
}

export default function SignInPage() {
  const router = useRouter();
  const { status, user, signIn } = useAuth();

  const [email, setEmail] = React.useState("");
  const [loginMethod, setLoginMethod] = React.useState<SignInMethod>("password");
  const [password, setPassword] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPin, setShowPin] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const completedSignIn = React.useRef(false);

  React.useEffect(() => {
    if (status === "authenticated" && user && !completedSignIn.current) {
      router.replace(safeReturnTo() || defaultDestination(user.role));
    }
  }, [status, user, router]);

  // Keep early return below every hook call (Rules of Hooks).
  if (status === "loading") {
    return (
      <RedirectScreen
        heading="Verifying your access"
        description="Please wait while we securely prepare your account."
      />
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (loginMethod === "password" && !password) {
      setError("Password is required.");
      return;
    }
    if (loginMethod === "pin") {
      if (!pin.trim()) {
        setError("PIN is required.");
        return;
      }
      if (!PIN_PATTERN.test(pin.trim())) {
        setError("PIN must contain 4–12 numeric digits.");
        return;
      }
    }

    setSubmitting(true);
    const response = await signIn(
      loginMethod === "pin"
        ? {
            email: trimmedEmail,
            pin: pin.trim(),
            loginMethod: "pin",
            LoginProvider: "email",
            rememberMe,
          }
        : {
            email: trimmedEmail,
            password,
            loginMethod: "password",
            LoginProvider: "email",
            rememberMe,
          }
    );
    setSubmitting(false);

    if (!response.success || !response.data) {
      setError(formatServerLoginError(response.errorCode, response.message));
      return;
    }

    completedSignIn.current = true;
    router.replace(safeReturnTo() || defaultDestination(response.data.role));
  }

  return (
    <AuthShell mode="sign-in">
      <div className="mb-6 space-y-1.5">
        <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-sm text-foreground-secondary">
          Sign in to continue your nursing exam preparation.
        </p>
      </div>

      {status === "error" && !error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>We could not verify your session. Check your connection and try again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            maxLength={320}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nurse@example.com"
            className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-foreground-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          />
        </div>

        <div className="space-y-1.5">
          <span id="signin-method-label" className="block text-sm font-semibold text-foreground">
            Sign-in method
          </span>
          <div
            role="radiogroup"
            aria-labelledby="signin-method-label"
            className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-surface-muted/60 p-1"
          >
            {(
              [
                { value: "password", label: "Password" },
                { value: "pin", label: "PIN" },
              ] as const
            ).map((option) => {
              const selected = loginMethod === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setLoginMethod(option.value);
                    setError(null);
                  }}
                  className={cn(
                    "h-9 rounded-md text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                    selected
                      ? "bg-brand-teal text-white shadow-sm"
                      : "text-foreground-secondary hover:bg-surface/80 hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {loginMethod === "password" ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-brand-teal underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
                className="h-11 w-full rounded-lg border border-border bg-background px-3.5 pr-11 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="pin" className="text-sm font-semibold text-foreground">
              PIN
            </label>
            <div className="relative">
              <input
                id="pin"
                name="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoComplete="current-password"
                required
                minLength={4}
                maxLength={12}
                pattern="\d{4,12}"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                aria-describedby="signin-pin-hint"
                className="h-11 w-full rounded-lg border border-border bg-background px-3.5 pr-11 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              />
              <button
                type="button"
                onClick={() => setShowPin((visible) => !visible)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p id="signin-pin-hint" className="text-xs text-foreground-muted">
              Enter your 4 to 12 digit numeric PIN.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          />
          <label htmlFor="rememberMe" className="text-xs text-foreground-secondary">
            Keep me signed in on this device
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={submitting} disabled={submitting}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 border-t border-border pt-5 text-center text-sm text-foreground-secondary">
        New to NURVIA?{" "}
        <Link href="/sign-up" className="font-semibold text-brand-teal underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
