"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nurviaApi } from "@/lib/api-client";
import type { SubscriptionPlanDto, UserSubscriptionDto } from "@/lib/api-types";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";

export default function SubscriptionPage() {
  const [activeSub, setActiveSub] = React.useState<UserSubscriptionDto | null>(null);
  const [plans, setPlans] = React.useState<SubscriptionPlanDto[]>([]);
  const [providerConfigured, setProviderConfigured] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyPlanId, setBusyPlanId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const res = await nurviaApi.getMySubscription();
    if (res.success && res.data) {
      setActiveSub(res.data.activeSubscription);
      setPlans(res.data.plans);
      setProviderConfigured(res.data.paymentProviderConfigured);
    } else {
      setError(res.message || "Unable to load subscription details.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSelectPlan = async (plan: SubscriptionPlanDto) => {
    setBusyPlanId(plan.id);
    setMessage(null);
    setError(null);

    if (plan.code === "FREE" || plan.monthlyPriceUsd === 0) {
      const res = await nurviaApi.activateFreeTier();
      if (res.success && res.data) {
        setActiveSub(res.data);
        setMessage("Free Starter plan activated on your account.");
      } else {
        setError(res.errors?.[0] || res.message || "Unable to activate Free Starter plan.");
      }
    } else {
      const res = await nurviaApi.requestCheckout(plan.id);
      if (res.success) {
        setMessage("Checkout session initiated.");
      } else {
        setError(res.errors?.[0] || res.message || "Paid checkout is not available without configured payment provider credentials.");
      }
    }
    setBusyPlanId(null);
  };

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-5xl">
        <div className="space-y-1">
          <Badge variant="teal">Entitlements &amp; Plans</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Subscription &amp; Entitlements
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            View your active PostgreSQL-backed plan entitlement or compare available NURVIA tiers.
          </p>
        </div>

        {message && (
          <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            {message}
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <Card className="p-8 text-center text-sm text-foreground-secondary">Loading subscription status…</Card>
        ) : (
          <>
            <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-brand-teal shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-brand text-base font-bold text-foreground">
                    {activeSub ? `Active Plan: ${activeSub.planName}` : "No Active Plan Selected"}
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    {activeSub
                      ? `Status: ${activeSub.status} · Source: ${activeSub.source}${
                          activeSub.expiresAtUtc ? ` · Expires ${new Date(activeSub.expiresAtUtc).toLocaleDateString()}` : " · No expiration"
                        }`
                      : "Activate the Free Starter tier below or request an institutional grant from an administrator."}
                  </p>
                </div>
              </div>
              <Badge variant={providerConfigured ? "success" : "outline"}>
                {providerConfigured ? "Payment Gateway Connected" : "Local Entitlement Mode"}
              </Badge>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isCurrent = activeSub?.planCode === plan.code;
                return (
                  <Card key={plan.id} className="p-6 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={isCurrent ? "teal" : "outline"}>{plan.billingInterval}</Badge>
                        {isCurrent && <Badge variant="success">Current</Badge>}
                      </div>
                      <div>
                        <h3 className="font-brand text-lg font-bold text-foreground">{plan.name}</h3>
                        <p className="font-brand text-2xl font-extrabold text-foreground mt-1">
                          \${plan.monthlyPriceUsd.toFixed(2)}
                          <span className="text-xs font-normal text-foreground-muted"> / mo</span>
                        </p>
                      </div>
                      <p className="text-xs text-foreground-secondary leading-relaxed">{plan.description}</p>
                      <ul className="space-y-1.5 pt-2">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground-secondary">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      size="sm"
                      disabled={isCurrent || busyPlanId === plan.id}
                      onClick={() => void handleSelectPlan(plan)}
                      variant={plan.code === "FREE" ? "primary" : "outline"}
                      className="w-full text-xs gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      {isCurrent
                        ? "Active on Account"
                        : plan.code === "FREE"
                        ? "Activate Free Starter"
                        : "Request Upgrade"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </LearnerShell>
  );
}
