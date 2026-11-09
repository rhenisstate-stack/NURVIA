"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Database,
  FileQuestion,
  BookCheck,
  FolderTree,
  Users2,
  DollarSign,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  HardDrive,
  FileText,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavGroup {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const adminNavigation: AdminNavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Platform Overview", href: "/admin", icon: ShieldAlert },
      { name: "Content Analytics", href: "/admin/analytics", icon: Sliders },
      { name: "Audit Trail", href: "/admin/audit", icon: FileText },
    ],
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      { name: "Question Bank", href: "/admin/questions", icon: FileQuestion, badge: "12,450" },
      { name: "Review Queue", href: "/admin/reviews", icon: BookCheck, badge: "Review" },
      { name: "Question Type Registry", href: "/admin/question-types", icon: Database },
      { name: "Exam Builder & Studio", href: "/admin/exams", icon: BookCheck, badge: "84" },
      { name: "Curriculum Taxonomy", href: "/admin/taxonomy", icon: FolderTree },
      { name: "Clinical Case Studies", href: "/admin/cases", icon: Sparkles },
    ],
  },
  {
    title: "LEARNER & ACCESS",
    items: [
      { name: "Learner Directory", href: "/admin/learners", icon: Users2 },
      { name: "Roles & RBAC", href: "/admin/rbac", icon: Lock },
    ],
  },
  {
    title: "MONETIZATION",
    items: [
      { name: "Plans & Entitlements", href: "/admin/plans", icon: DollarSign },
      { name: "System Settings", href: "/admin/settings", icon: HardDrive },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar (High Density, Theme-Semantic) */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-surface text-foreground transition-all duration-300 ease-in-out shadow-xs",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Logo size="sm" variant={collapsed ? "symbol" : "compact"} href="/admin" />
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-teal/15 text-brand-teal px-1.5 py-0.5 rounded border border-brand-teal/20">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded border border-border text-foreground-secondary hover:text-foreground hover:bg-surface-muted transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
          {adminNavigation.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-brand-teal text-white font-semibold shadow-xs"
                        : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground",
                      collapsed && "justify-center px-1"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-foreground-muted group-hover:text-brand-teal")} />
                    {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                    {!collapsed && item.badge && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded font-mono",
                        isActive ? "bg-white/20 text-white" : "bg-surface-muted text-foreground-secondary"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Switch to Learner App */}
        <div className="p-3 border-t border-border bg-surface-muted/50">
          <Link href="/learner">
            <Button variant="outline" size="sm" className="w-full text-xs h-8 justify-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              {!collapsed && <span>Learner App</span>}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        {/* Admin Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground">Management Console</span>
              <span className="text-border">•</span>
              <Badge variant="teal" className="text-[10px]">
                SUPERADMIN ACCESS
              </Badge>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
                API: HEALTHY
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 pl-2 border-l border-border text-xs">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                SA
              </div>
              <span className="hidden sm:inline font-semibold">Admin Workspace</span>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
