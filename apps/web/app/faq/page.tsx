"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  category: "Exam Preparation" | "NGN & Clinical Judgment" | "Account & Subscriptions" | "Platform & Technical";
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "faq-01",
    category: "Exam Preparation",
    question: "How does NURVIA prepare me for ATI Content Mastery and Comprehensive Predictor exams?",
    answer:
      "NURVIA organizes practice questions around ATI's core testing blueprints—including Fundamentals, Adult Med-Surg, Pharmacology, Maternal-Newborn, Nursing Care of Children, Mental Health, and Community Health. Every question includes dual rationales breaking down why the correct choice is safe and why distractors are clinically unsound.",
  },
  {
    id: "faq-02",
    category: "Exam Preparation",
    question: "What is the difference between Review Mode and Exam Mode?",
    answer:
      "In Review Mode (Learn-as-you-go), you receive immediate clinical judgment feedback and rationales directly after answering each question. In Exam Mode, you take a timed simulation without intermediate feedback, replicating the pressure, pacing, and interface rules of actual ATI, HESI, and NCLEX proctored assessments.",
  },
  {
    id: "faq-03",
    category: "NGN & Clinical Judgment",
    question: "Does NURVIA support all Next Generation NCLEX (NGN) question item types?",
    answer:
      "Yes. NURVIA natively supports Extended Multiple Response, Extended Drag-and-Drop, Cloze (Drop-Down), Enhanced Hot Spot, Matrix / Grid, and 6-question Unfolding Clinical Case Studies that follow the NCSBN Clinical Judgment Measurement Model (CJMM).",
  },
  {
    id: "faq-04",
    category: "NGN & Clinical Judgment",
    question: "How does partial credit (polytomous) scoring work in NGN questions?",
    answer:
      "NURVIA accurately implements NCSBN scoring models: +/- Scoring (giving +1 point for correct responses and deducting -1 point for incorrect choices down to a minimum score of 0) and 0/1 Scoring (for drop-down and matrix cells), so your practice scores reflect true NCLEX scoring.",
  },
  {
    id: "faq-05",
    category: "Account & Subscriptions",
    question: "Can I use NURVIA across my phone, tablet, and laptop?",
    answer:
      "Yes. NURVIA is fully responsive and cloud-synchronized across iOS, Android, macOS, and Windows. Your question history, saved questions, flashcard intervals, and study planner sync automatically.",
  },
  {
    id: "faq-06",
    category: "Account & Subscriptions",
    question: "What happens if I need to pause or cancel my subscription?",
    answer:
      "You can manage, pause, or cancel your subscription at any time directly in your Learner Account Settings under the Subscription tab. You retain full access through the end of your prepaid billing period.",
  },
  {
    id: "faq-07",
    category: "Platform & Technical",
    question: "Can I take practice exams offline?",
    answer:
      "When using modern progressive web browsers, active quiz attempts maintain local caching so an intermittent network drop does not disrupt your session. Submitting and synchronizing final attempts requires an active internet connection.",
  },
  {
    id: "faq-08",
    category: "Platform & Technical",
    question: "Who writes and reviews the clinical rationales on NURVIA?",
    answer:
      "All NURVIA rationales and unfolding case studies are authored and reviewed by MSN and DNP nurse educators, licensed nurse practitioners, and clinical nurse specialists referencing evidence-based medical and nursing guidelines.",
  },
];

export default function FaqPage() {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({
    "faq-01": true,
    "faq-03": true,
  });

  const categories = [
    "All",
    "Exam Preparation",
    "NGN & Clinical Judgment",
    "Account & Subscriptions",
    "Platform & Technical",
  ];

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchesSearch =
      search.trim() === "" ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 to-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support & Information</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Find clear, straightforward answers about exam preparation, NGN scoring formats, subscription access, and platform features.
            </p>

            {/* Search Input */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions (e.g. NGN, scoring, offline)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-brand-navy text-white border-brand-navy dark:bg-brand-teal dark:border-brand-teal"
                      : "bg-surface text-foreground-secondary border-border hover:border-brand-teal/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            <div className="space-y-4">
              {filteredFaqs.map((faq) => {
                const isOpen = Boolean(openItems[faq.id]);
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-border bg-surface overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(faq.id)}
                      aria-expanded={isOpen}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-surface-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-teal">
                          {faq.category}
                        </span>
                        <h3 className="font-brand text-base sm:text-lg font-bold text-foreground">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="p-1 rounded-full text-foreground-muted shrink-0 mt-1">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-foreground-secondary leading-relaxed border-t border-border/50 bg-background/50 animate-in fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFaqs.length === 0 && (
                <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border">
                  <HelpCircle className="w-8 h-8 text-foreground-muted mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No questions match your search</p>
                  <p className="text-xs text-foreground-secondary">
                    Try different keywords or browse all categories above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="border-t border-border bg-surface/50 py-16 text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 text-brand-teal mx-auto flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="font-brand text-3xl font-bold text-foreground">
              Still Have Questions?
            </h2>
            <p className="text-sm text-foreground-secondary max-w-xl mx-auto">
              Our clinical nurse educators and support team are available to assist with study plan recommendations or technical inquiries.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/learner">
                <Button size="lg" className="h-11 px-6 text-xs font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Go to Learner Dashboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/exams">
                <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-semibold">
                  Explore Exam Tracks
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
