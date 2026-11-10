"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export function SuperadminSwitcher() {
  const { user } = useAuth();
  
  if (user?.role !== "Superadmin") return null;
  
  return (
    <div className="flex items-center gap-2 mt-4">
      <Link href="/admin">
        <Button variant="outline" size="sm">Admin Dashboard</Button>
      </Link>
      <Link href="/learner">
        <Button variant="outline" size="sm">Learner Dashboard</Button>
      </Link>
    </div>
  );
}