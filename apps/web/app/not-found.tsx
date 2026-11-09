"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4 text-center">
      <div className="space-y-4 max-w-md">
        <Logo size="md" variant="compact" />
        <h2 className="font-brand text-3xl font-bold tracking-tight text-foreground mt-4">
          Page Not Found (404)
        </h2>
        <p className="text-sm text-foreground-secondary">
          The requested clinical module or learning resource could not be found.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary">Return to Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
