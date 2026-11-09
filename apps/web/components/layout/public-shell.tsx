"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  MessageSquare,
  HelpCircle,
  Stethoscope,
  Compass,
  FileText,
  Layers,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

interface NavSubItem {
  name: string;
  href: string;
  description?: string;
  badge?: string;
}

interface PublicNavItem {
  name: string;
  href: string;
  subItems?: NavSubItem[];
}

// Exactly 9 approved navigation items in exact approved order (Section 5.1)
const approvedNavItems: PublicNavItem[] = [
  {
    name: "Home",
    href: ROUTES.home,
  },
  {
    name: "Exams",
    href: ROUTES.exams,
    subItems: [
      { name: "All Examinations", href: "/exams", description: "Comprehensive catalogue of ATI, HESI & Exit assessments" },
      { name: "RN Examinations", href: "/exams?track=RN", description: "Specialty modules, exit predictors, and certification tracks" },
      { name: "LPN / PN Examinations", href: "/exams?track=PN_LPN", description: "Practical nursing preparation, ATI practical and HESI PN" },
      { name: "ATI Subject Mastery", href: "/exams?category=ATI", description: "Fundamentals, Med-Surg, Pharmacology, and Maternal Health" },
      { name: "HESI Specialty Exams", href: "/exams?category=HESI", description: "Targeted specialty exams and scoring rubrics" },
      { name: "Exit & Predictor Exams", href: "/exams?category=ExitPredictor", description: "Comprehensive readiness predictors for NCLEX qualification", badge: "Predictor" },
    ],
  },
  {
    name: "Study",
    href: ROUTES.study,
    subItems: [
      { name: "Study Hub Overview", href: "/study", description: "Explore NURVIA learning tools and structured study paths" },
      { name: "Study Library", href: "/learner/library", description: "Searchable question collections with step-by-step rationales" },
      { name: "Study Guides", href: "/learner/guides", description: "Clinical cheat sheets and high-yield concept summaries" },
      { name: "Spaced Flashcards", href: "/learner/flashcards", description: "Evidence-based active recall flashcard decks", badge: "SRS" },
      { name: "Custom Practice", href: "/learner/custom-practice", description: "Build personalized practice quizzes by cognitive skill" },
      { name: "Study Planner", href: "/learner/planner", description: "Set your exam date and structured weekly milestones" },
      { name: "AI Clinical Tutor", href: "/learner/ai-tutor", description: "Socratic feedback on clinical judgment scenarios", badge: "AI" },
      { name: "Performance Analytics", href: "/learner/performance", description: "Visual tracking across NGN cognitive dimensions" },
    ],
  },
  {
    name: "Care Plans",
    href: ROUTES.carePlans,
    subItems: [
      { name: "Care Plan Library", href: "/care-plans", description: "Clinical nursing diagnoses, outcomes, and interventions" },
      { name: "Med-Surg Care Plans", href: "/care-plans?specialty=med-surg", description: "Cardiac, pulmonary, renal, and postoperative care" },
      { name: "Maternal & Newborn", href: "/care-plans?specialty=maternal-newborn", description: "Obstetric stages, postpartum recovery, and neonatal care" },
      { name: "Pediatrics", href: "/care-plans?specialty=pediatrics", description: "Developmental milestones and acute pediatric conditions" },
      { name: "Mental Health", href: "/care-plans?specialty=mental-health", description: "Therapeutic communication and psychotropic considerations" },
    ],
  },
  {
    name: "Mark K.",
    href: ROUTES.markK,
    subItems: [
      { name: "Mark K. Review Hub", href: "/mark-k", description: "Organized index of the 12 core NCLEX review lectures" },
      { name: "Lectures 1–4: Prioritization & ABGs", href: "/mark-k#lectures-1-4", description: "Acid-base balance, lab values, and clinical prioritization" },
      { name: "Lectures 5–8: Cardiac & Electrolytes", href: "/mark-k#lectures-5-8", description: "EKG strips, electrolyte rules, and endocrine therapies" },
      { name: "Lectures 9–12: Psych & Maternity", href: "/mark-k#lectures-9-12", description: "Psychiatric care, labor & delivery, and pharmacology" },
    ],
  },
  {
    name: "Community",
    href: ROUTES.community,
    subItems: [
      { name: "Community Overview", href: "/community", description: "Peer discussions, study groups, and exam debriefs" },
      { name: "NCLEX Study Cohorts", href: "/community?group=nclex", description: "Connect with students testing in the same window" },
      { name: "Clinical Case Debriefs", href: "/community?group=cases", description: "Analyze complex NGN unfolding case studies" },
      { name: "Community Guidelines", href: "/community#guidelines", description: "Professional etiquette, academic integrity, and support" },
    ],
  },
  {
    name: "FAQ",
    href: ROUTES.faq,
    subItems: [
      { name: "All Questions", href: "/faq", description: "Quick answers to common questions about NURVIA" },
      { name: "Exam Preparation", href: "/faq?category=exam-prep", description: "ATI, HESI, NCLEX, and NGN simulation details" },
      { name: "Account & Subscriptions", href: "/faq?category=account", description: "Access plans, trials, and billing information" },
      { name: "Technical Support", href: "/faq?category=platform", description: "Browser support, offline access, and mobile usage" },
    ],
  },
  {
    name: "NCLEX",
    href: ROUTES.nclex,
    subItems: [
      { name: "NCLEX Hub", href: "/nclex", description: "Comprehensive Next Generation NCLEX-RN & PN preparation" },
      { name: "NCLEX-RN Pathway", href: "/nclex?track=rn", description: "85-150 question adaptive simulator and case studies" },
      { name: "NCLEX-PN Pathway", href: "/nclex?track=pn", description: "Practical nurse clinical judgment focus areas" },
      { name: "NGN Framework", href: "/nclex#ngn-framework", description: "The 6 cognitive skills of the NCSBN measurement model" },
    ],
  },
  {
    name: "TEAS",
    href: ROUTES.teas,
    subItems: [
      { name: "TEAS Overview", href: "/teas", description: "Test of Essential Academic Skills pre-nursing prep" },
      { name: "Science & Anatomy", href: "/teas?subject=science", description: "Human physiology, biology, and chemistry review" },
      { name: "Reading & English", href: "/teas?subject=reading", description: "Passage analysis, vocabulary, and grammar conventions" },
      { name: "Mathematics", href: "/teas?subject=math", description: "Algebraic equations, conversions, and data analysis" },
    ],
  },
];

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = React.useState<string | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const navRef = React.useRef<HTMLDivElement>(null);

  // Scroll detection for sticky header treatment
  React.useEffect(() => {
    function onScroll() {
      if (typeof window !== "undefined") {
        setScrolled(window.scrollY > 10);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      if (mobileMenuOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [mobileMenuOpen]);

  // Close dropdown on outside click or Escape key
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const toggleMobileGroup = (name: string) => {
    setMobileExpandedGroup((prev) => (prev === name ? null : name));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Banner */}
      <div className="bg-brand-navy dark:bg-brand-navyDeep text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 bg-brand-teal/20 text-teal-300 px-2 py-0.5 rounded-full text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" /> NURVIA Education
        </span>
        <span className="hidden sm:inline">
          NURVIA — Your Path to Nursing Confidence. Next-Gen NCLEX, ATI & HESI preparation.
        </span>
        <span className="sm:hidden">NURVIA — Nursing Confidence</span>
        <Link href="/learner" className="underline hover:text-teal-300 font-semibold ml-1">
          Enter Learner Dashboard →
        </Link>
      </div>

      {/* Main Public Header with exact 9 approved items */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200 bg-surface/95 backdrop-blur-md",
          scrolled ? "border-b border-border shadow-xs" : "border-b border-border/70"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Wordmark */}
          <Logo size="md" variant="full" />

          {/* Desktop Navigation — Exactly 9 Items in Approved Order */}
          <nav
            ref={navRef}
            className="hidden xl:flex items-center gap-1 lg:gap-2"
            aria-label="Main Navigation"
          >
            {approvedNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname?.startsWith(item.href + "/");
              const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
              const isOpen = activeDropdown === item.name;

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => hasSubItems && setActiveDropdown(item.name)}
                  onMouseLeave={() => hasSubItems && setActiveDropdown(null)}
                >
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs lg:text-[13px] font-medium transition-colors",
                        isActive
                          ? "text-brand-teal dark:text-teal-400 font-bold bg-brand-teal/5"
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-muted"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span>{item.name}</span>
                    </Link>

                    {hasSubItems && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleDropdown(item.name);
                        }}
                        aria-expanded={isOpen}
                        aria-label={`Toggle ${item.name} submenu`}
                        className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-transform"
                      >
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            isOpen && "rotate-180 text-brand-teal"
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Menu */}
                  {hasSubItems && isOpen && (
                    <div
                      role="menu"
                      className="absolute top-full left-0 z-50 w-72 pt-2 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="rounded-xl border border-border bg-surface p-2 shadow-xl backdrop-blur-md">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-muted border-b border-border/60 mb-1">
                          {item.name} Resources
                        </div>
                        <div className="space-y-0.5">
                          {item.subItems?.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setActiveDropdown(null)}
                              className="group flex flex-col p-2.5 rounded-lg text-xs hover:bg-surface-muted transition-colors"
                              role="menuitem"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground group-hover:text-brand-teal transition-colors">
                                  {sub.name}
                                </span>
                                {sub.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-brand-teal/10 text-brand-teal">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              {sub.description && (
                                <span className="text-[11px] text-foreground-muted line-clamp-1 mt-0.5">
                                  {sub.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Compact Tablet Navigation (< 1280px, >= 768px) */}
          <div className="hidden md:flex xl:hidden items-center gap-1">
            <Link
              href="/exams"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-foreground-secondary hover:text-foreground"
            >
              Exams
            </Link>
            <Link
              href="/study"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-foreground-secondary hover:text-foreground"
            >
              Study
            </Link>
            <Link
              href="/nclex"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-foreground-secondary hover:text-foreground"
            >
              NCLEX
            </Link>
          </div>

          {/* Header Controls & Primary CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />
            <Link href="/learner">
              <Button variant="ghost" size="sm" className="text-xs font-semibold px-3">
                Sign in / Sign up
              </Button>
            </Link>
            <Link href="/learner">
              <Button
                size="sm"
                className="text-xs font-semibold h-9 px-4 gap-1.5 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark shadow-xs"
              >
                <span>Start Studying</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="xl:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto px-4 py-6 border-b border-border shadow-2xl animate-in slide-in-from-top-2"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted px-2">
                NURVIA Menu
              </div>

              <nav className="flex flex-col space-y-1">
                {approvedNavItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname?.startsWith(item.href + "/");
                  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                  const isExpanded = mobileExpandedGroup === item.name;

                  return (
                    <div key={item.name} className="border-b border-border/50 pb-1">
                      <div className="flex items-center justify-between">
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                            isActive
                              ? "text-brand-teal dark:text-teal-400 bg-brand-teal/10"
                              : "text-foreground hover:bg-surface-muted"
                          )}
                        >
                          {item.name}
                        </Link>

                        {hasSubItems && (
                          <button
                            type="button"
                            onClick={() => toggleMobileGroup(item.name)}
                            aria-expanded={isExpanded}
                            aria-label={`Expand ${item.name} sub-options`}
                            className="p-2 rounded-lg text-foreground-muted hover:text-foreground"
                          >
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isExpanded && "rotate-180 text-brand-teal"
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {/* Expandable sub-items in mobile drawer */}
                      {hasSubItems && isExpanded && (
                        <div className="pl-4 pr-2 py-1 space-y-1 bg-surface-muted/40 rounded-lg mt-1 mb-2">
                          {item.subItems?.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-foreground-secondary hover:text-brand-teal hover:bg-surface"
                            >
                              <span>{sub.name}</span>
                              {sub.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Mobile CTAs */}
              <div className="pt-4 border-t border-border flex flex-col gap-2.5">
                <Link href="/learner" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center text-xs h-10 font-semibold">
                    Sign in / Sign up
                  </Button>
                </Link>
                <Link href="/learner" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center text-xs h-10 font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal">
                    Start Studying
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="border-t border-border bg-surface mt-16 transition-colors">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" variant="full" />
              <p className="text-sm text-foreground-secondary max-w-sm">
                NURVIA provides structured exam preparation, clinical judgment training,
                and personalized revision intelligence for nursing learners across ATI,
                HESI, NCLEX, and TEAS tracks.
              </p>
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                <span>Evidence-based clinical education architecture</span>
              </div>
            </div>

            {/* Examination Tracks */}
            <div>
              <h4 className="font-brand font-bold text-sm text-foreground mb-3">
                Exam Tracks
              </h4>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link href="/exams?track=RN" className="hover:text-primary">RN Examinations</Link></li>
                <li><Link href="/exams?track=PN_LPN" className="hover:text-primary">LPN / PN Tracks</Link></li>
                <li><Link href="/exams?category=ATI" className="hover:text-primary">ATI Subject Sets</Link></li>
                <li><Link href="/exams?category=HESI" className="hover:text-primary">HESI Specialties</Link></li>
                <li><Link href="/exams?category=ExitPredictor" className="hover:text-primary">Exit Predictor Exams</Link></li>
                <li><Link href="/nclex" className="hover:text-primary">NCLEX-RN & PN</Link></li>
                <li><Link href="/teas" className="hover:text-primary">TEAS Prep</Link></li>
              </ul>
            </div>

            {/* Learning Hub */}
            <div>
              <h4 className="font-brand font-bold text-sm text-foreground mb-3">
                Learning Tools
              </h4>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link href="/study" className="hover:text-primary">Study Hub</Link></li>
                <li><Link href="/care-plans" className="hover:text-primary">Care Plans</Link></li>
                <li><Link href="/mark-k" className="hover:text-primary">Mark K. Review</Link></li>
                <li><Link href="/community" className="hover:text-primary">Student Community</Link></li>
                <li><Link href="/faq" className="hover:text-primary">Frequently Asked Questions</Link></li>
                <li><Link href="/learner/ai-tutor" className="hover:text-primary">AI Clinical Tutor</Link></li>
              </ul>
            </div>

            {/* Platform & Workspaces */}
            <div>
              <h4 className="font-brand font-bold text-sm text-foreground mb-3">
                Platform Workspaces
              </h4>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link href="/learner" className="hover:text-primary">Learner Dashboard</Link></li>
                <li><Link href="/learner/library" className="hover:text-primary">Study Library</Link></li>
                <li><Link href="/exam-session" className="hover:text-primary">Exam Experience Shell</Link></li>
                <li><Link href="/admin" className="hover:text-primary">Admin Studio Shell</Link></li>
                <li><Link href="/design-system" className="hover:text-primary">Design System Showcase</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between text-xs text-foreground-muted gap-4">
            <p>© {new Date().getFullYear()} NURVIA. All rights reserved. Your Path to Nursing Confidence.</p>
            <p className="max-w-xl text-center md:text-right">
              Disclaimer: NURVIA is an independent educational prep platform and is not affiliated with or endorsed by ATI, HESI, or NCSBN. Rationales are intended solely for academic study.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
