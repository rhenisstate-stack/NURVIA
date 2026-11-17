import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <Badge variant="outline">Draft Pending Owner &amp; Legal Review</Badge>
          <h1 className="font-brand text-3xl font-bold text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-foreground-secondary">
            This Privacy Policy is a draft template provided for structural completeness and requires formal review and approval by the NURVIA platform owner and legal counsel before publication as an authoritative privacy notice.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-foreground-secondary">
          <section className="space-y-2">
            <h2 className="font-brand text-lg font-bold text-foreground">1. Account &amp; Session Information</h2>
            <p>
              When you register or sign in, NURVIA collects the account details you submit (such as username, email address, and optional phone number) and stores authentication session credentials in server-managed HttpOnly cookies to keep you signed in securely across requests.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-brand text-lg font-bold text-foreground">2. Academic Activity Data</h2>
            <p>
              When authenticated, NURVIA records your exam attempts, saved questions, study plans, and review progress through the configured backend API so you can resume sessions and review your learning history.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-brand text-lg font-bold text-foreground">3. Security Controls</h2>
            <p>
              NURVIA enforces HTTPS transport in production, same-origin request validation on state-changing routes, and HttpOnly session cookies so session tokens are not exposed to browser JavaScript.
            </p>
          </section>

          <section className="space-y-2 rounded-lg border border-amber-300/70 bg-amber-50/70 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <h2 className="font-brand text-sm font-bold">Owner / Legal Counsel Action Required</h2>
            <p className="text-xs leading-relaxed">
              The following authoritative details are not yet defined in the repository and must be supplied before final legal adoption: (1) Data controller legal entity and privacy contact email, (2) Specific data retention and deletion timelines, (3) Complete inventory of third-party subprocessors and hosting regions, and (4) Jurisdiction-specific rights (e.g., GDPR, CCPA/CPRA, FERPA applicability).
            </p>
          </section>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <Link href="/terms" className="font-semibold text-brand-teal hover:underline">
              View Terms of Service (Draft)
            </Link>
            <Link href="/sign-up" className="font-semibold text-foreground-secondary hover:underline">
              Return to Sign Up
            </Link>
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
