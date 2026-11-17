'use client';

import { useEffect, useState, type ReactNode } from 'react';

export default function DashboardPreloader({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-950">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D9488]"
          aria-label="Loading dashboard"
        />
      </div>
    );
  }

  return <>{children}</>;
}
