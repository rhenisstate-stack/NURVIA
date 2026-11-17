'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  CreditCard,
  Search,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import type { NursingProgramMeta } from '@/lib/programs/programRegistry';
import { useLeftSidebar } from '@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext';
import { ThemeToggleButton } from '@/components/common/ThemeToggleButton';
import { SeekModal } from '@/components/common/modals/seek/SeekModal';
import DashboardsAccessGate from '@/components/common/dashboards/modals/DashboardsAccessGate';

export function ProgramDashboardShell({
  program,
  children,
}: {
  program: NursingProgramMeta;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const { isMobileOpen, toggleMobileSidebar } = useLeftSidebar();
  const [seekOpen, setSeekOpen] = useState(false);

  const base = `/dashboards/${program.slug}`;
  const navItems = [
    { label: 'Overview', href: base, icon: LayoutDashboard },
    { label: 'Subjects', href: `${base}/vista/learning/subjects/absolute/overview`, icon: BookOpen },
    { label: 'Exams', href: `${base}/vista/assessment/exams/absolute/overview`, icon: ClipboardCheck },
    { label: 'Results', href: `${base}/vista/assessment/exams/results/distinct`, icon: BarChart3 },
    { label: 'Subscriptions', href: `${base}/vista/subscriptions/packages`, icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <DashboardsAccessGate />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-[#142B4A] text-white transition-transform md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href={base} className="text-base font-bold tracking-tight text-white">
            NURVIA · {program.shortTitle}
          </Link>
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="rounded-lg p-1 text-slate-300 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#0D9488] text-white'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-4">
          <Link
            href="/learner"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Learner Hub
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-[#142B4A]">{program.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeekOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:border-[#0D9488] hover:text-[#142B4A]"
            >
              <Search className="h-3.5 w-3.5 text-[#0D9488]" />
              Search
            </button>
            <ThemeToggleButton />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <SeekModal isOpen={seekOpen} onClose={() => setSeekOpen(false)} />
    </div>
  );
}
