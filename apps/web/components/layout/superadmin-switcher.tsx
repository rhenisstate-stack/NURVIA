"use client";

import { Button } from "@/components/ui/button";
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
  
  return (
    <div className="flex items-center gap-2 mt-4">
      <Link href="/admin" prefetch={false}>
        <Button variant="outline" size="sm">Admin Dashboard</Button>
      </Link>
      <Link href="/learner" prefetch={false}>
        <Button variant="outline" size="sm">Learner Dashboard</Button>
      </Link>
    </div>
  );
}