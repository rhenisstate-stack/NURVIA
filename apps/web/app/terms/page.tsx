import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <Badge variant="outline">Draft Pending Owner &amp; Legal Review</Badge>
          <h1 className="font-brand text-3xl font-bold text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-foreground-secondary">
            These Terms of Service are a draft template provided for structural completeness and require formal review and approval by the NURVIA platform owner and legal counsel before publication as binding legal terms.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-foreground-secondary">
          <section className="space-y-2">
            <h2 className="font-brand text-lg font-bold text-foreground">1. Educational Purpose</h2>
            <p>
              NURVIA is an independent nursing exam-preparation and clinical study platform. Practice questions, rationales, and study materials are provided solely for educational and academic review purposes and do not constitute medical advice, clinical diagnosis, or official licensure endorsement by ATI, HESI, or NCSBN.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-brand text-lg font-bold text-foreground">2. Account Responsibilities</h2>
            <p>
              Learners and staff are responsible for maintaining the confidentiality of their account credentials and for all activity conducted under their registered account. Unauthorized sharing of accounts, automated scraping, or attempts to bypass platform security controls are prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-brand text-lg font-bold text-foreground">3. Acceptable Use &amp; Intellectual Property</h2>
            <p>
              Platform software, branding, and original educational materials remain the property of their respective owners. Users may not redistribute, republish, or commercially exploit platform content without prior written authorization.
            </p>
          </section>

          <section className="space-y-2 rounded-lg border border-amber-300/70 bg-amber-50/70 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <h2 className="font-brand text-sm font-bold">Owner / Legal Counsel Action Required</h2>
            <p className="text-xs leading-relaxed">
              The following authoritative details are not yet defined in the repository and must be supplied before final legal adoption: (1) Legal operating entity name and registered address, (2) Governing law and dispute resolution jurisdiction, (3) Subscription billing, refund, and cancellation terms, and (4) Official legal notice contact address.
            </p>
          </section>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <Link href="/privacy" className="font-semibold text-brand-teal hover:underline">
              View Privacy Policy (Draft)
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
