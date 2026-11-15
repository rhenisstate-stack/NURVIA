"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nurviaApi } from "@/lib/api-client";
import { ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";

function AcceptInvitationForm() {
  const [token, setToken] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("token");
      if (t) setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await nurviaApi.acceptStaffInvitation({
      token: token.trim(),
      name: name.trim(),
      password,
    });
    if (res.success) {
      setSuccessMessage(
        res.message || "Invitation accepted. You may now sign in with your staff account."
      );
    } else {
      setError(res.message || "Unable to accept staff invitation.");
    }
    setSubmitting(false);
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <CardTitle className="font-brand text-2xl font-bold">
              Accept Staff Invitation
            </CardTitle>
            <CardDescription className="text-xs">
              Activate your NURVIA staff account using your single-use invitation token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
                <Link href="/sign-in" className="block">
                  <Button className="w-full">Proceed to Sign In</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="invite-token" className="text-xs">
                    Invitation Token
                  </Label>
                  <Input
                    id="invite-token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your invitation token"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staff-name" className="text-xs">
                    Full Name
                  </Label>
                  <Input
                    id="staff-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jane Doe, RN"
                    required
                    minLength={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staff-password" className="text-xs">
                    Password (min 12 characters)
                  </Label>
                  <Input
                    id="staff-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    minLength={12}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Activating Account..." : "Activate Staff Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

export default function AcceptInvitationPage() {
  return <AcceptInvitationForm />;
}
