"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export function SuperadminSwitcher() {
  const { user } = useAuth();
  
  if (user?.role !== "Superadmin") return null;
  
  return (
    <div className="flex items-center gap-2 mt-4">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin">Admin Dashboard</Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/learner">Learner Dashboard</Link>
      </Button>
    </div>
  );
}