'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

export default function AuthLogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        await signOut();
      } finally {
        if (active) router.replace('/');
      }
    }
    void run();
    return () => {
      active = false;
    };
  }, [signOut, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">
      Signing out safely...
    </div>
  );
}
