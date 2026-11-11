import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { NotFoundPage } from "@/components/shared/feedback/NotFoundPage";

export default function AccessDeniedPage() {
  return (
    <PublicShell>
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <NotFoundPage
          title="Access not available"
          message="Your account does not have permission to open this workspace."
          showDashboard={true}
          showBack={false}
          dashboardHref="/"
        />
      </main>
    </PublicShell>
  );
}
