"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export default function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const response = await updateProfile(name.trim());
    setSaving(false);

    if (!response.success || !response.data) {
      setError(response.message || "Unable to save profile changes.");
      return;
    }

    setName(response.data.name);
    setMessage("Your profile changes have been saved.");
  }

  return (
    <LearnerShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">My Account</h1>
          <p className="text-sm text-foreground-secondary">Review your account details and update your display name.</p>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="text-sm font-semibold text-foreground">Full name</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={200}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="text-sm font-semibold text-foreground">Email address</label>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ""}
                readOnly
                className="h-11 w-full rounded-lg border border-border bg-surface-muted px-3 text-sm text-foreground-secondary"
              />
              <p className="text-xs text-foreground-muted">Email changes are not available in this account flow.</p>
            </div>
            <div className="space-y-1.5">
              <span className="block text-sm font-semibold text-foreground">Account role</span>
              <p className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground-secondary" aria-label="Account role">
                {user?.role || "—"}
              </p>
              <p className="text-xs text-foreground-muted">Roles and permissions can only be changed by an authorized administrator.</p>
            </div>
            {message && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
            {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
            <Button type="submit" isLoading={saving} disabled={saving || !name.trim()}>
              Save profile
            </Button>
          </form>
        </section>
      </div>
    </LearnerShell>
  );
}
