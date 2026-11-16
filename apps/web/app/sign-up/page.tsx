"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_PATTERN = /^\d{4,12}$/;

type RegisterMethod = "password" | "pin" | "both";

export default function SignUpPage() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loginMethod, setLoginMethod] = React.useState<RegisterMethod>("password");
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [pinConfirmation, setPinConfirmation] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPin, setShowPin] = React.useState(false);
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
    if (name.trim().length < 2) {
      setError("Full name is required (minimum 2 characters).");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    const usesPassword = loginMethod === "password" || loginMethod === "both";
    const usesPin = loginMethod === "pin" || loginMethod === "both";

    if (usesPassword) {
      if (password.length < 12) {
        setError("Use at least 12 characters for your password.");
        return;
      }
      if (password !== confirmation) {
        setError("Passwords do not match.");
        return;
      }
    }

    if (usesPin) {
      if (!PIN_PATTERN.test(pin.trim())) {
        setError("Use a 4 to 12 digit numeric PIN.");
        return;
      }
      if (pin !== pinConfirmation) {
        setError("PINs do not match.");
        return;
      }
    }

    if (!agree) {
      setError("You must agree to the terms and privacy policy.");
      return;
    }

    setSubmitting(true);
    const response = await nurviaApi.register({
      username: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ...(usesPassword ? { password, passwordConfirmation: confirmation } : {}),
      ...(usesPin ? { pin: pin.trim(), pinConfirmation: pinConfirmation.trim() } : {}),
      loginMethod,
      provider: "email",
      agree,
    });
    setSubmitting(false);
    if (!response.success) {
      const detail =
        Array.isArray(response.errors) && response.errors.length > 0 && response.errors[0] !== response.message
          ? `${response.message} (${response.errors[0]})`
          : response.message;
      setError(detail || "Unable to create your account. Please try again.");
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
                <label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength={32}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+1 555 010 9988"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                />
              </div>
              <div className="space-y-1.5">
                <span id="register-method-label" className="block text-sm font-semibold text-foreground">
                  Sign-in method
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="register-method-label"
                  className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-1"
                >
                  {(
                    [
                      { value: "password", label: "Password" },
                      { value: "pin", label: "PIN" },
                      { value: "both", label: "Both" },
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
                        className={`h-9 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                          selected
                            ? "bg-brand-teal text-white shadow-sm"
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(loginMethod === "password" || loginMethod === "both") && (
                <>
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
                </>
              )}

              {(loginMethod === "pin" || loginMethod === "both") && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="pin" className="text-sm font-semibold text-foreground">PIN</label>
                    <div className="relative">
                      <input
                        id="pin"
                        name="pin"
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="new-password"
                        required
                        minLength={4}
                        maxLength={12}
                        pattern="\d{4,12}"
                        value={pin}
                        onChange={(event) => setPin(event.target.value)}
                        aria-describedby="pin-hint"
                        className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-12 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin((visible) => !visible)}
                        aria-label={showPin ? "Hide PIN" : "Show PIN"}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                      >
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p id="pin-hint" className="text-xs text-foreground-muted">Use a 4 to 12 digit numeric PIN.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pin-confirmation" className="text-sm font-semibold text-foreground">Confirm PIN</label>
                    <input
                      id="pin-confirmation"
                      name="pinConfirmation"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="new-password"
                      required
                      minLength={4}
                      maxLength={12}
                      pattern="\d{4,12}"
                      value={pinConfirmation}
                      onChange={(event) => setPinConfirmation(event.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                    />
                  </div>
                </>
              )}
              <div className="flex items-start gap-2.5">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  required
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                />
                <label htmlFor="agree" className="text-xs leading-relaxed text-foreground-secondary">
                  I agree to the NURVIA{" "}
                  <Link href="/terms" className="font-semibold text-brand-teal underline-offset-4 hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="font-semibold text-brand-teal underline-offset-4 hover:underline">Privacy Policy</Link>.
                </label>
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
