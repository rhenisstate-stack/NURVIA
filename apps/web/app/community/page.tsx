"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  ShieldCheck,
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Lock,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";

interface CommunityCategory {
  id: string;
  name: string;
  description: string;
  topicsCount: number;
  repliesCount: number;
  badge: string;
  icon: React.ElementType;
}

const communityCategories: CommunityCategory[] = [
  {
    id: "nclex-cohorts",
    name: "NCLEX 2026 Test-Taker Cohorts",
    description: "Connect with nursing graduates testing in your upcoming window. Share testing center experiences and study routines.",
    topicsCount: 124,
    repliesCount: 890,
    badge: "Active Cohort",
    icon: Users,
  },
  {
    id: "ati-hesi-debriefs",
    name: "ATI & HESI Specialty Debriefs",
    description: "Discuss proctored benchmark pacing, Level 2 / Level 3 score strategies, and HESI exit conversion formulas.",
    topicsCount: 86,
    repliesCount: 540,
    badge: "Proctored Exams",
    icon: Award,
  },
  {
    id: "clinical-cases",
    name: "NGN Unfolding Case Study Debriefs",
    description: "Peer dissection of complex unfolding vignettes: prioritizing cues, recognizing systemic complications, and evaluating outcomes.",
    topicsCount: 65,
    repliesCount: 412,
    badge: "Clinical Reasoning",
    icon: Sparkles,
  },
  {
    id: "wellness-support",
    name: "Nursing School Resilience & Mental Health",
    description: "A safe, supportive space for nursing students dealing with burnout, test anxiety, clinical exhaustion, and work-life balance.",
    topicsCount: 48,
    repliesCount: 310,
    badge: "Peer Support",
    icon: HeartHandshake,
  },
];

export default function CommunityPage() {
  const [search, setSearch] = React.useState("");

  const filteredCategories = communityCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Header Hero */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 to-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>NURVIA Peer Community</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Nursing Student Study & Discussion Hub
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Connect with thousands of nursing learners nationwide. Share rationales, celebrate exam passes, and support each other through clinical milestones.
            </p>

            {/* Quick Search */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search community forums and topics..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Discussion Categories */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h2 className="font-brand text-2xl font-bold text-foreground">
                Discussion Channels
              </h2>
              <span className="text-xs text-foreground-muted">
                Authenticated Participation Only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Card
                    key={cat.id}
                    className="flex flex-col justify-between hover:border-brand-teal/50 hover:shadow-md transition-all group"
                  >
                    <CardHeader className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal group-hover:bg-brand-navy group-hover:text-white dark:group-hover:bg-brand-teal transition-colors flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="teal">{cat.badge}</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold">{cat.name}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {cat.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="flex items-center gap-4 text-xs text-foreground-muted">
                        <span>{cat.topicsCount} Discussions</span>
                        <span>•</span>
                        <span>{cat.repliesCount} Responses</span>
                      </div>
                      <Link href="/learner" className="block w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-xs font-semibold h-9 group-hover:bg-brand-navy group-hover:text-white dark:group-hover:bg-brand-teal"
                        >
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Sign in to Join Channel
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Community Guidelines Section */}
        <section id="guidelines" className="border-t border-border bg-surface/50 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                CODE OF CONDUCT
              </span>
              <h2 className="font-brand text-3xl font-bold text-foreground">
                NURVIA Community Guidelines
              </h2>
              <p className="text-sm text-foreground-secondary">
                To maintain a safe, professional, and academically honest environment, all members agree to:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Academic Integrity & No Live Dumps</span>
                </div>
                <p className="text-foreground-secondary leading-relaxed">
                  Never share, solicit, or post unauthorized actual live exam questions or NDA-protected test materials. All discussions must center on conceptual understanding.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Professional Nursing Etiquette</span>
                </div>
                <p className="text-foreground-secondary leading-relaxed">
                  Treat peers, moderators, and clinical mentors with respect. NURVIA embodies the collaborative spirit and empathy expected of registered nurses.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Patient Privacy & HIPAA Compliance</span>
                </div>
                <p className="text-foreground-secondary leading-relaxed">
                  Never post identifiable client data or clinical hospital site disclosures. Always utilize synthetic scenarios or de-identified educational vignettes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Constructive Peer Feedback</span>
                </div>
                <p className="text-foreground-secondary leading-relaxed">
                  When debating clinical rationales, reference evidence-based standards (CDC, AHA, Saunders, Lewis, ATI outlines) to enrich the learning experience.
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link href="/learner">
                <Button size="lg" className="h-11 px-8 text-xs font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Access Community in Learner Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
