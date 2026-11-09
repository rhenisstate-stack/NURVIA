"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/components/auth/auth-provider";

interface PublicNavItem {
  name: string;
  href: string;
}

// Exactly 9 approved navigation items in exact approved order (Section 5.1)
const approvedNavItems: PublicNavItem[] = [
  { name: "Home", href: ROUTES.home },
  { name: "Exams", href: ROUTES.exams },
  { name: "Study", href: ROUTES.study },
  { name: "Care Plans", href: ROUTES.carePlans },
  { name: "Mark K.", href: ROUTES.markK },
  { name: "Community", href: ROUTES.community },
  { name: "FAQ", href: ROUTES.faq },
  { name: "NCLEX", href: ROUTES.nclex },
  { name: "TEAS", href: ROUTES.teas },
];

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, signOut } = useAuth();

  async function handleSignOut() {
    setAuthError(null);
    const response = await signOut();
    if (!response.success) {
      setAuthError(response.message || "Unable to sign out. Please try again.");
      return;
    }

    setMobileMenuOpen(false);
    router.replace("/");
  }

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
      </div>

      {/* Main Public Header with exact 9 approved items (Direct Links, No Dropdowns) */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200 bg-surface/95 backdrop-blur-md",
          scrolled ? "border-b border-border shadow-xs" : "border-b border-border/70"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Wordmark */}
          <Logo size="md" variant="full" />

          {/* Desktop Navigation — Exactly 9 Direct Items in Approved Order (No Dropdowns) */}
          <nav
            className="hidden xl:flex items-center gap-1 lg:gap-2"
            aria-label="Main Navigation"
          >
            {approvedNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || (pathname ? pathname.startsWith(item.href + "/") : false);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs lg:text-[13px] font-medium transition-colors",
                    isActive
                      ? "text-brand-teal dark:text-teal-400 font-bold bg-brand-teal/10"
                      : "text-foreground-secondary hover:text-foreground hover:bg-surface-muted"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {status === "authenticated" && user ? (
              <>
                <Link href={user.role === "Learner" ? "/learner" : "/admin"}>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs h-9">
                    {user.role === "Learner" ? "My Account" : "Workspace"}
                  </Button>
                </Link>
                <Button type="button" variant="ghost" size="sm" className="hidden sm:inline-flex text-xs h-9" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href={ROUTES.signIn}>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs h-9">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.signUp}>
                  <Button size="sm" className="hidden sm:inline-flex text-xs h-9">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <Link href="/exams">
              <Button size="sm" className="text-xs h-9 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDeep">
                Explore Exams
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden h-9 w-9 text-foreground"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop and Slide-out Navigation (Strict 9 Direct Items, No Dropdowns) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Canvas */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-surface border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <Logo size="sm" variant="full" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-muted"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 9 Mobile Items in Exact Approved Order */}
              <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
                {approvedNavItems.map((item, idx) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || (pathname ? pathname.startsWith(item.href + "/") : false);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-teal/10 text-brand-teal font-bold"
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-muted"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-5 text-[11px] font-mono text-foreground-muted">
                          0{idx + 1}
                        </span>
                        <span>{item.name}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-foreground-muted" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Links */}
            <div className="pt-6 border-t border-border space-y-3">
              {status === "authenticated" && user ? (
                <>
                  <Link href={user.role === "Learner" ? "/learner" : "/admin"} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full text-xs">
                      {user.role === "Learner" ? "My Account" : "Workspace"}
                    </Button>
                  </Link>
                  <Button type="button" variant="outline" className="w-full text-xs" onClick={handleSignOut}>Sign Out</Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={ROUTES.signIn} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-xs">Sign In</Button>
                  </Link>
                  <Link href={ROUTES.signUp} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full text-xs">Sign Up</Button>
                  </Link>
                </div>
              )}
              {authError && <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{authError}</p>}
              <div className="flex items-center justify-between text-xs text-foreground-muted pt-2">
                <span>NURVIA Platform</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}

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
