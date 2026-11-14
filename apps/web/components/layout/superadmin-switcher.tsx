"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export function SuperadminSwitcher() {
  const { status, user } = useAuth();

  // Only an authenticated Superadmin may see the cross-dashboard switcher.
  // AuthUserDto has no isAuthenticated field — authentication state comes from
  // the AuthProvider status, and the role is authoritative from the backend.
  if (status !== "authenticated" || !user || user.role !== "Superadmin") {
    return null;
  }

  const linkClass =
    "inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal";

  return (
    <div className="flex items-center gap-2">
      <Link href="/admin" prefetch={false} className={linkClass}>
        Admin Dashboard
      </Link>
      <Link href="/learner" prefetch={false} className={linkClass}>
        Learner Dashboard
      </Link>
    </div>
  );
}