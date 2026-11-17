"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { APP_NAME } from "@/lib/config/config";

function SubscriptionPackageCallbackContent() {
  const searchParams = useSearchParams();

  const provider = (searchParams.get("provider") ?? "").toLowerCase();
  const subscriptionId = searchParams.get("subscriptionId") ?? undefined;
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id") ?? undefined;
  const dashboard = searchParams.get("dashboard") || "ati-teas";

  const isCancel = status === "cancel";

  const completedAt = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mt-3 flex items-center justify-center px-6 py-16 bg-gradient-to-b from-indigo-100 via-amber-100 to-green-100">
      <div className="w-full max-w-lg rounded-2xl border border-blue-800 bg-gradient-to-b from-green-100 via-blue-100 to-indigo-100 shadow-sm p-8 text-center">
        {isCancel ? (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Checkout Cancelled</h1>
            <p className="text-slate-600 mb-6">Your subscription was not completed. No charge was made.</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re Almost There!</h1>
            <p className="text-slate-600 mb-6">
              Thanks for subscribing to {APP_NAME}. Your subscription is being processed — this
              usually takes less than a minute, then you&apos;ll have full access.
            </p>
          </>
        )}

        <div className="text-xs text-slate-400 mb-6 space-y-0.5">
          {provider && <p>Provider : {provider}</p>}
          {subscriptionId && <p>Subscription ID : {subscriptionId}</p>}
          {sessionId && <p>Session: {sessionId}</p>}
          {!isCancel && <p>Completed : {completedAt}</p>}
        </div>

        {!isCancel && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-white/70 p-4 text-left text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">What happens next</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>A receipt has been sent to your registered email.</li>
              <li>Your plan activates automatically — no action needed from you.</li>
              <li>
                If your access hasn&apos;t updated in a few minutes, refresh your dashboard or{" "}
                <Link href="/pages/contact-us" className="text-blue-600 font-medium hover:underline">
                  contact support
                </Link>{" "}
                with the Subscription ID above.
              </li>
            </ul>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/dashboards/${dashboard}/vista/subscriptions/items`}
            className="rounded-lg bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-500 transition"
          >
            View Subscriptions
          </Link>

          <Link
            href={`/dashboards/${dashboard}`}
            className="rounded-lg bg-blue-600 text-white px-5 py-2 text-sm font-semibold hover:bg-blue-500 transition"
          >
            Go To Dashboard
          </Link>

          <Link
            href="/"
            className="rounded-lg bg-slate-800 text-white px-5 py-2 text-sm font-semibold hover:bg-slate-700 transition"
          >
            Back Home
          </Link>

          {isCancel && (
            <button
              onClick={() => history.back()}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function SubscriptionPackageCallbackFallback() {
  return (
    <main className="mt-3 flex items-center justify-center px-6 py-16 bg-gradient-to-b from-indigo-100 via-amber-100 to-green-100">
      <div className="w-full max-w-lg rounded-2xl border border-blue-800 bg-gradient-to-b from-green-100 via-blue-100 to-indigo-100 shadow-sm p-8 text-center">
        <p className="text-slate-500 text-sm">Loading your subscription status…</p>
      </div>
    </main>
  );
}

export default function SubscriptionPackageCallbackPage() {
  return (
    <Suspense fallback={<SubscriptionPackageCallbackFallback />}>
      <SubscriptionPackageCallbackContent />
    </Suspense>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────