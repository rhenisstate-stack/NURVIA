"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PhoneCountryInput } from "@/components/auth/phone-country-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import { DEFAULT_PHONE_COUNTRY, normalizePhoneNumber, type CountryCode } from "@/lib/phone";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_PATTERN = /^\d{4,12}$/;

type RegisterMethod = "password" | "pin" | "both";
type FieldKey =
  | "name"
  | "email"
  | "phone"
  | "password"
  | "confirmation"
  | "pin"
  | "pinConfirmation"
  | "agree";

function formatServerRegisterError(message?: string, errors?: string[]): string {
  const combined = [message, ...(errors || [])].filter(Boolean).join(" ");
  if (/challenge/i.test(combined)) {
    return "Account registration is temporarily unavailable while backend verification is being finalized. Please try again later.";
  }
  if (Array.isArray(errors) && errors.length > 0 && errors[0] !== message) {
    return `${message || "Unable to create your account."} (${errors[0]})`;
  }
  return message || "Unable to create your account. Please try again.";
}

export default function SignUpPage() {
  const router = useRouter();
  const { status, user } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneCountry, setPhoneCountry] = React.useState<CountryCode>(DEFAULT_PHONE_COUNTRY);
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
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<FieldKey, string>>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [signInHref, setSignInHref] = React.useState("/sign-in");

  React.useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("returnTo");
    if (requested?.startsWith("/")) {
      try {
        const destination = new URL(requested, window.location.origin);
        if (
          destination.origin === window.location.origin &&
          !["/sign-in", "/sign-up", "/access-denied"].includes(destination.pathname)
        ) {
          setSignInHref(
            `/sign-in?returnTo=${encodeURIComponent(`${destination.pathname}${destination.search}${destination.hash}`)}`
          );
        }
      } catch {
        setSignInHref("/sign-in");
      }
    }

    if (status === "authenticated" && user) {
      router.replace(user.role === "Learner" ? "/learner" : "/access-denied");
    }
  }, [status, user, router]);

  const phonePreview = React.useMemo(() => {
    if (!phone.trim()) return null;
    return normalizePhoneNumber(phone, phoneCountry, { allowPossible: true });
  }, [phone, phoneCountry]);

  const clearFieldError = React.useCallback((key: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  function validateForm(): {
    errors: Partial<Record<FieldKey, string>>;
    normalizedPhone?: string;
  } {
    const errors: Partial<Record<FieldKey, string>> = {};

    if (name.trim().length < 2) {
      errors.name = "Full name is required (minimum 2 characters).";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    const phoneResult = normalizePhoneNumber(phone, phoneCountry, { allowPossible: true });
    if (!phoneResult.valid || !phoneResult.e164) {
      errors.phone = phoneResult.error || "Enter a valid phone number.";
    }

    const usesPassword = loginMethod === "password" || loginMethod === "both";
    const usesPin = loginMethod === "pin" || loginMethod === "both";

    if (usesPassword) {
      if (password.length < 12) {
        errors.password = "Use at least 12 characters for your password.";
      }
      if (confirmation !== password) {
        errors.confirmation = "Passwords do not match.";
      }
    }

    if (usesPin) {
      if (!PIN_PATTERN.test(pin.trim())) {
        errors.pin = "PIN must contain 4–12 numeric digits.";
      }
      if (pinConfirmation.trim() !== pin.trim()) {
        errors.pinConfirmation = "PINs do not match.";
      }
    }

    if (!agree) {
      errors.agree = "Please accept the terms and privacy policy before continuing.";
    }

    return { errors, normalizedPhone: phoneResult.e164 };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setServerError(null);
    const { errors, normalizedPhone } = validateForm();
    if (Object.keys(errors).length > 0 || !normalizedPhone) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    const usesPassword = loginMethod === "password" || loginMethod === "both";
    const usesPin = loginMethod === "pin" || loginMethod === "both";

    setSubmitting(true);
    const response = await nurviaApi.register({
      username: name.trim(),
      email: email.trim(),
      phone: normalizedPhone,
      ...(usesPassword ? { password, passwordConfirmation: confirmation } : {}),
      ...(usesPin ? { pin: pin.trim(), pinConfirmation: pinConfirmation.trim() } : {}),
      loginMethod,
      provider: "email",
      agree,
    });
    setSubmitting(false);

    if (!response.success) {
      setServerError(formatServerRegisterError(response.message, response.errors));
      return;
    }

    setSuccess(true);
  }

  const usesPassword = loginMethod === "password" || loginMethod === "both";
  const usesPin = loginMethod === "pin" || loginMethod === "both";

  return (
    <AuthShell mode="sign-up">
      <div className="mb-6 space-y-1.5">
        <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create your learner account
        </h1>
        <p className="text-sm text-foreground-secondary">
          Start building confidence with focused nursing exam practice.
        </p>
      </div>

      {success ? (
        <div
          role="status"
          className="space-y-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold">Your registration request is complete.</p>
              <p className="text-xs opacity-90">Sign in with your email and selected credential to continue.</p>
            </div>
          </div>
          <Button type="button" className="w-full" onClick={() => router.push(signInHref)}>
            Go to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={200}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearFieldError("name");
              }}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              placeholder="Ada Lovelace, RN"
              className={cn(
                "h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground placeholder:text-foreground-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                fieldErrors.name ? "border-rose-600 dark:border-rose-500" : "border-border"
              )}
            />
            {fieldErrors.name && (
              <p id="name-error" role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
                {fieldErrors.name}
              </p>
            )}
          </div>

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
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              placeholder="nurse@example.com"
              className={cn(
                "h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground placeholder:text-foreground-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                fieldErrors.email ? "border-rose-600 dark:border-rose-500" : "border-border"
              )}
            />
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-semibold text-foreground">
              Phone number
            </label>
            <PhoneCountryInput
              id="phone"
              country={phoneCountry}
              onCountryChange={(nextCountry) => {
                setPhoneCountry(nextCountry);
                clearFieldError("phone");
              }}
              value={phone}
              onChange={(nextValue) => {
                setPhone(nextValue);
                clearFieldError("phone");
              }}
              error={fieldErrors.phone}
              hint={
                phonePreview?.valid && phonePreview.e164
                  ? `International format: ${phonePreview.e164}`
                  : "Select your country code and enter your local or international number."
              }
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <span id="register-method-label" className="block text-sm font-semibold text-foreground">
              Sign-in method
            </span>
            <div
              role="radiogroup"
              aria-labelledby="register-method-label"
              className="grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-surface-muted/60 p-1"
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
                      setServerError(null);
                      setFieldErrors({});
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

          {usesPassword && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </label>
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
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearFieldError("password");
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
                    className={cn(
                      "h-11 w-full rounded-lg border bg-background px-3.5 pr-11 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                      fieldErrors.password ? "border-rose-600 dark:border-rose-500" : "border-border"
                    )}
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
                {fieldErrors.password ? (
                  <p id="password-error" role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p id="password-hint" className="text-xs text-foreground-muted">
                    Minimum 12 characters.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmation" className="text-sm font-semibold text-foreground">
                  Confirm password
                </label>
                <input
                  id="confirmation"
                  name="confirmation"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  maxLength={256}
                  value={confirmation}
                  onChange={(event) => {
                    setConfirmation(event.target.value);
                    clearFieldError("confirmation");
                  }}
                  aria-invalid={Boolean(fieldErrors.confirmation)}
                  aria-describedby={fieldErrors.confirmation ? "confirmation-error" : undefined}
                  className={cn(
                    "h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                    fieldErrors.confirmation ? "border-rose-600 dark:border-rose-500" : "border-border"
                  )}
                />
                {fieldErrors.confirmation && (
                  <p id="confirmation-error" role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    {fieldErrors.confirmation}
                  </p>
                )}
              </div>
            </div>
          )}

          {usesPin && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    autoComplete="new-password"
                    required
                    minLength={4}
                    maxLength={12}
                    pattern="\d{4,12}"
                    value={pin}
                    onChange={(event) => {
                      setPin(event.target.value);
                      clearFieldError("pin");
                    }}
                    aria-invalid={Boolean(fieldErrors.pin)}
                    aria-describedby={fieldErrors.pin ? "pin-error" : "pin-hint"}
                    className={cn(
                      "h-11 w-full rounded-lg border bg-background px-3.5 pr-11 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                      fieldErrors.pin ? "border-rose-600 dark:border-rose-500" : "border-border"
                    )}
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
                {fieldErrors.pin ? (
                  <p id="pin-error" role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    {fieldErrors.pin}
                  </p>
                ) : (
                  <p id="pin-hint" className="text-xs text-foreground-muted">
                    4 to 12 numeric digits.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pin-confirmation" className="text-sm font-semibold text-foreground">
                  Confirm PIN
                </label>
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
                  onChange={(event) => {
                    setPinConfirmation(event.target.value);
                    clearFieldError("pinConfirmation");
                  }}
                  aria-invalid={Boolean(fieldErrors.pinConfirmation)}
                  aria-describedby={fieldErrors.pinConfirmation ? "pin-confirmation-error" : undefined}
                  className={cn(
                    "h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                    fieldErrors.pinConfirmation ? "border-rose-600 dark:border-rose-500" : "border-border"
                  )}
                />
                {fieldErrors.pinConfirmation && (
                  <p id="pin-confirmation-error" role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    {fieldErrors.pinConfirmation}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <div className="flex items-start gap-2.5">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                required
                checked={agree}
                onChange={(event) => {
                  setAgree(event.target.checked);
                  clearFieldError("agree");
                }}
                aria-invalid={Boolean(fieldErrors.agree)}
                aria-describedby={fieldErrors.agree ? "agree-error" : undefined}
                className="mt-0.5 h-4 w-4 rounded border-border text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              />
              <label htmlFor="agree" className="text-xs leading-relaxed text-foreground-secondary">
                I agree to the NURVIA{" "}
                <Link href="/terms" className="font-semibold text-brand-teal underline-offset-4 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold text-brand-teal underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {fieldErrors.agree && (
              <p id="agree-error" role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">
                {fieldErrors.agree}
              </p>
            )}
          </div>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={submitting}
            disabled={submitting || status === "loading"}
          >
            Create learner account
          </Button>
        </form>
      )}

      <p className="mt-6 border-t border-border pt-5 text-center text-sm text-foreground-secondary">
        Already registered?{" "}
        <Link href={signInHref} className="font-semibold text-brand-teal underline-offset-4 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
