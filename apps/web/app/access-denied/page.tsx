import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <PublicShell>
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-brand text-3xl font-bold text-foreground">Access not available</h1>
        <p className="text-sm text-foreground-secondary">
          Your account does not have permission to open this workspace.
        </p>
        <Link href="/">
          <Button variant="outline">Return to NURVIA</Button>
        </Link>
      </main>
    </PublicShell>
  );
}
