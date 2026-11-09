"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, ArrowRight, BookOpen, GraduationCap, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Exam Library", href: "/exams" },
    { name: "ATI & HESI", href: "/exams?category=ATI" },
    { name: "NCLEX Prep", href: "/exams?category=NCLEX" },
    { name: "Study Hub", href: "/learner/hub" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Banner */}
      <div className="bg-brand-navy dark:bg-brand-navyDeep text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 bg-brand-teal/20 text-teal-300 px-2 py-0.5 rounded-full text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" /> Phase 1 Architecture
        </span>
        <span className="hidden sm:inline">NURVIA — Your Path to Nursing Confidence. Next-Gen NCLEX, ATI & HESI preparation.</span>
        <span className="sm:hidden">NURVIA — Nursing Confidence</span>
        <Link href="/learner" className="underline hover:text-teal-300 font-semibold ml-1">
          Enter Learner Dashboard →
        </Link>
      </div>

      {/* Main Public Header matching screenshot */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Logo size="md" variant="full" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-brand-teal dark:hover:text-teal-400",
                    isActive
                      ? "text-brand-teal dark:text-teal-400 font-semibold"
                      : "text-foreground-secondary"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Header Controls & CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/learner">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Sign in / Sign up
              </Button>
            </Link>
            <Link href="/learner">
              <Button size="sm" className="text-xs font-semibold bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark shadow-sm">
                Start Studying
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-muted transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link href="/learner" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center text-xs">
                  Sign in / Sign up
                </Button>
              </Link>
              <Link href="/learner" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center text-xs bg-brand-navy text-white dark:bg-brand-teal">
                  Start Studying
                </Button>
              </Link>
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
                HESI, and NCLEX tracks.
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
              </ul>
            </div>

            {/* Learning Hub */}
            <div>
              <h4 className="font-brand font-bold text-sm text-foreground mb-3">
                Learning Tools
              </h4>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link href="/learner/guides" className="hover:text-primary">Study Guides & Notes</Link></li>
                <li><Link href="/learner/care-plans" className="hover:text-primary">Clinical Care Plans</Link></li>
                <li><Link href="/learner/flashcards" className="hover:text-primary">Spaced Flashcards</Link></li>
                <li><Link href="/learner/calculators" className="hover:text-primary">Dosage Calculators</Link></li>
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
