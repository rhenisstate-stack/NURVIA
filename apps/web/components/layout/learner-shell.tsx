"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  Library,
  BookMarked,
  FileSpreadsheet,
  History,
  Layers,
  FileText,
  CreditCard,
  HeartHandshake,
  Calculator,
  BotMessageSquare,
  Bookmark,
  Users,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  Flame,
  Award,
  ExternalLink,
  GraduationCap,
  Stethoscope,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSubItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  subItems?: NavSubItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const learnerNavigation: NavSection[] = [
  {
    title: "01 — EXAMS",
    items: [
      {
        name: "RN Exams",
        href: "/learner/exams?track=RN",
        icon: GraduationCap,
        subItems: [
          { name: "ATI Assessments", href: "/learner/exams?track=RN&category=ATI" },
          { name: "HESI Specialty", href: "/learner/exams?track=RN&category=HESI" },
          { name: "Regular Courses", href: "/learner/exams?track=RN&category=RegularCourse" },
          { name: "Certifications", href: "/learner/exams?track=RN&category=Certification" },
        ],
      },
      {
        name: "LPN / PN Exams",
        href: "/learner/exams?track=PN_LPN",
        icon: Stethoscope,
        subItems: [
          { name: "ATI Practical", href: "/learner/exams?track=PN_LPN&category=ATI" },
          { name: "HESI PN", href: "/learner/exams?track=PN_LPN&category=HESI" },
          { name: "Regular Courses", href: "/learner/exams?track=PN_LPN&category=RegularCourse" },
        ],
      },
      {
        name: "RN Exit Exams",
        href: "/learner/exams?track=RN_Exit",
        icon: Award,
        badge: "Predictor",
        subItems: [
          { name: "Comprehensive Predictor", href: "/learner/exams?track=RN_Exit&category=ExitPredictor" },
          { name: "HESI Exit Assessment", href: "/learner/exams?track=RN_Exit&category=HESI" },
        ],
      },
      {
        name: "LPN Exit Exams",
        href: "/learner/exams?track=PN_Exit",
        icon: Award,
        badge: "Predictor",
        subItems: [
          { name: "PN Exit Predictor", href: "/learner/exams?track=PN_Exit&category=ExitPredictor" },
        ],
      },
    ],
  },
  {
    title: "02 — PRACTICE & PROGRESS",
    items: [
      { name: "Study Library", href: "/learner/library", icon: Library },
      { name: "Performance Intel", href: "/learner/performance", icon: TrendingUp },
      { name: "My Library", href: "/learner/my-exams", icon: BookMarked },
      { name: "Custom Practice", href: "/learner/custom-practice", icon: FileSpreadsheet },
    ],
  },
  {
    title: "03 — CLINICAL RESOURCES",
    items: [
      { name: "Study Hub", href: "/learner/hub", icon: Layers },
      { name: "Study Cards / Flashcards", href: "/learner/flashcards", icon: Layers, badge: "SRS" },
      { name: "Study Guides", href: "/learner/guides", icon: FileText },
      { name: "Nursing Care Plans", href: "/learner/care-plans", icon: HeartHandshake },
      { name: "Dosage Calculators", href: "/learner/calculators", icon: Calculator },
      { name: "AI Clinical Tutor", href: "/learner/ai-tutor", icon: BotMessageSquare, badge: "AI" },
      { name: "Study Planner", href: "/learner/planner", icon: CalendarCheck, badge: "New" },
    ],
  },
  {
    title: "04 — NCLEX PREP",
    items: [
      { name: "NCLEX-RN Next-Gen", href: "/learner/nclex-rn", icon: Sparkles, badge: "NGN" },
      { name: "NCLEX-PN", href: "/learner/nclex-pn", icon: Sparkles },
      { name: "TEAS Pre-Nursing", href: "/learner/teas", icon: FileText },
    ],
  },
  {
    title: "05 — MANAGEMENT & ACCOUNT",
    items: [
      { name: "Content Studio", href: "/admin", icon: ShieldAlert, badge: "Studio" },
      { name: "My Account", href: "/learner/account", icon: User },
      { name: "Settings", href: "/learner/settings", icon: Settings },
    ],
  },
];

export function LearnerShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    "RN Exams": true,
    "RN Exit Exams": false,
  });
  const pathname = usePathname();

  const toggleSubmenu = (itemName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out",
          collapsed ? "w-[76px]" : "w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/learner" className="flex items-center gap-2 overflow-hidden">
            <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-foreground-muted hover:text-foreground h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground-muted hover:text-foreground h-8 w-8"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {learnerNavigation.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-foreground-muted/80 mb-2">
                  {section.title}
                </div>
              ) : (
                <div className="h-px bg-border my-2" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.subItems && item.subItems.some((s) => pathname === s.href));
                const isSubmenuOpen = expandedSections[item.name];

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand-navy text-white shadow-sm font-semibold dark:bg-brand-teal/20 dark:text-brand-teal"
                            : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground",
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-brand-teal")} />
                        {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                        {!collapsed && item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-brand-teal/15 text-brand-teal dark:text-teal-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {/* Expand Submenu Chevron if subitems exist */}
                      {!collapsed && item.subItems && (
                        <button
                          type="button"
                          onClick={(e) => toggleSubmenu(item.name, e)}
                          className="p-1.5 rounded-md hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors"
                        >
                          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isSubmenuOpen && "rotate-180")} />
                        </button>
                      )}
                    </div>

                    {/* Expandable Sub-items */}
                    {!collapsed && item.subItems && isSubmenuOpen && (
                      <div className="pl-8 pr-1 space-y-0.5 border-l-2 border-brand-teal/20 ml-4 py-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                                isSubActive
                                  ? "text-brand-teal font-semibold bg-brand-teal/10"
                                  : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
                              )}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border bg-surface-muted/50">
          {!collapsed ? (
            <div className="rounded-lg border border-border bg-surface p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Target Exam</span>
                <span className="font-bold text-brand-teal">NCLEX-RN Next-Gen</span>
              </div>
              <div className="text-[11px] text-foreground-muted">
                Confidence Readiness: <strong className="text-emerald-600 dark:text-emerald-400">82% Benchmark</strong>
              </div>
              <Link href="/exam-session">
                <Button variant="primary" size="sm" className="w-full text-xs h-7">
                  Launch Practice Exam
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <Award className="w-5 h-5 text-brand-teal" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          collapsed ? "lg:ml-[76px]" : "lg:ml-[264px]"
        )}
      >
        {/* Top Learner Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="search"
                placeholder="Search ATI, HESI, rationales..."
                className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-1.5 text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>5 Day Streak</span>
            </div>

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="relative text-foreground-muted">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-teal" />
            </Button>

            <Link href="/admin">
              <Button variant="outline" size="sm" className="hidden md:flex text-xs border-brand-teal/40 text-brand-teal hover:bg-brand-teal/10">
                Authoring Studio
              </Button>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shadow-sm">
                RN
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold leading-none text-foreground">Elena Vance</div>
                <div className="text-[10px] text-foreground-muted">BSN Student</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
