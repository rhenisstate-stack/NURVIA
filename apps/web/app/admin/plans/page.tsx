"use client";

import * as React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nurviaApi } from "@/lib/api-client";
import type { SubscriptionPlanDto, UserSubscriptionDto } from "@/lib/api-types";
import { Plus, ShieldCheck, Ban } from "lucide-react";

export default function AdminPlansPage() {
  const [plans, setPlans] = React.useState<SubscriptionPlanDto[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<UserSubscriptionDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const [targetUser, setTargetUser] = React.useState("");
  const [selectedPlanId, setSelectedPlanId] = React.useState("");
  const [durationDays, setDurationDays] = React.useState("30");
  const [grantNotes, setGrantNotes] = React.useState("");
  const [granting, setGranting] = React.useState(false);

  const [planCode, setPlanCode] = React.useState("");
  const [planName, setPlanName] = React.useState("");
  const [planPrice, setPlanPrice] = React.useState("19.00");
  const [planDesc, setPlanDesc] = React.useState("");
  const [creatingPlan, setCreatingPlan] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const [plansRes, subsRes] = await Promise.all([
      nurviaApi.getSubscriptionPlans(),
      nurviaApi.getAdminSubscriptions(),
    ]);
    if (plansRes.success && plansRes.data) {
      setPlans(plansRes.data);
      if (plansRes.data.length > 0 && !selectedPlanId) {
        setSelectedPlanId(plansRes.data[0].id);
      }
    } else {
      setError(plansRes.message || "Unable to load subscription plans.");
    }
    if (subsRes.success && subsRes.data) {
      setSubscriptions(subsRes.data);
    }
    setLoading(false);
  }, [selectedPlanId]);

  React.useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setGranting(true);
    setError(null);
    setStatusMessage(null);
    const res = await nurviaApi.grantEntitlement({
      targetUserId: targetUser,
      planId: selectedPlanId,
      durationDays: Number(durationDays) || 30,
      notes: grantNotes || undefined,
    });
    if (res.success && res.data) {
      setStatusMessage(`Granted ${res.data.planName} to ${res.data.userEmail ?? res.data.userId}.`);
      setTargetUser("");
      setGrantNotes("");
      await loadData();
    } else {
      setError(res.message || "Unable to grant entitlement.");
    }
    setGranting(false);
  };

  const handleRevoke = async (id: string) => {
    setError(null);
    setStatusMessage(null);
    const res = await nurviaApi.revokeEntitlement(id);
    if (res.success) {
      setStatusMessage("Entitlement revoked.");
      await loadData();
    } else {
      setError(res.message || "Unable to revoke entitlement.");
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPlan(true);
    setError(null);
    setStatusMessage(null);
    const res = await nurviaApi.createSubscriptionPlan({
      code: planCode,
      name: planName,
      description: planDesc,
      monthlyPriceUsd: Number(planPrice) || 0,
      billingInterval: "Monthly",
      features: ["Full Exam Access", "Study Library & Guides"],
      isActive: true,
    });
    if (res.success) {
      setPlanCode("");
      setPlanName("");
      setPlanDesc("");
      setStatusMessage("Subscription plan created.");
      await loadData();
    } else {
      setError(res.message || "Unable to create plan.");
    }
    setCreatingPlan(false);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="font-brand text-2xl font-bold tracking-tight text-foreground">
            Subscription Plans &amp; Entitlements
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Manage subscription plans and grant or revoke learner entitlements in PostgreSQL with full audit logging.
          </p>
        </div>

        {statusMessage && (
          <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            {statusMessage}
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <form onSubmit={handleGrant} className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                <h2 className="font-brand text-base font-bold text-foreground">Grant Learner Entitlement</h2>
              </div>
              <div className="space-y-1">
                <Label htmlFor="grant-user">Learner Email or User ID</Label>
                <Input
                  id="grant-user"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="learner@example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="grant-plan">Plan</Label>
                  <select
                    id="grant-plan"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="grant-days">Duration (Days)</Label>
                  <Input
                    id="grant-days"
                    type="number"
                    min={1}
                    max={3650}
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="grant-notes">Audit Notes (Optional)</Label>
                <Input id="grant-notes" value={grantNotes} onChange={(e) => setGrantNotes(e.target.value)} placeholder="Cohort scholarship grant" />
              </div>
              <Button type="submit" size="sm" disabled={granting} className="bg-brand-teal text-white">
                {granting ? "Granting..." : "Grant Entitlement"}
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-teal" />
                <h2 className="font-brand text-base font-bold text-foreground">Create Subscription Plan</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="plan-code">Plan Code</Label>
                  <Input id="plan-code" value={planCode} onChange={(e) => setPlanCode(e.target.value)} placeholder="COHORT_SPRING" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="plan-price">Monthly Price (USD)</Label>
                  <Input id="plan-price" type="number" step="0.01" min={0} value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input id="plan-name" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Spring Cohort Access" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-desc">Description</Label>
                <Input id="plan-desc" value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} placeholder="Full clinical judgment suite" />
              </div>
              <Button type="submit" size="sm" variant="outline" disabled={creatingPlan}>
                {creatingPlan ? "Creating..." : "Create Plan"}
              </Button>
            </form>
          </Card>
        </div>

        <Card className="p-5 space-y-4">
          <h2 className="font-brand text-base font-bold text-foreground">Active &amp; Historical Entitlements</h2>
          {loading ? (
            <p className="text-xs text-foreground-secondary">Loading entitlements…</p>
          ) : subscriptions.length === 0 ? (
            <p className="text-xs text-foreground-secondary">No learner entitlements granted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-foreground-muted">
                  <tr>
                    <th className="py-2 pr-3">Learner</th>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Expires</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscriptions.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 pr-3 font-medium text-foreground">{s.userEmail ?? s.userId}</td>
                      <td className="py-2.5 pr-3">{s.planName}</td>
                      <td className="py-2.5 pr-3">{s.source}</td>
                      <td className="py-2.5 pr-3">
                        <Badge variant={s.status === "Active" ? "success" : "outline"}>{s.status}</Badge>
                      </td>
                      <td className="py-2.5 pr-3">
                        {s.expiresAtUtc ? new Date(s.expiresAtUtc).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-2.5">
                        {s.status === "Active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void handleRevoke(s.id)}
                            className="h-7 px-2 text-rose-600 hover:text-rose-700 text-xs gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" /> Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
