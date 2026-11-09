"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  ListOrdered,
  FileText,
} from "lucide-react";

interface LectureTopic {
  number: number;
  title: string;
  category: "Prioritization & Triage" | "Electrolytes & Endocrine" | "Med-Surg & Cardiac" | "Maternity & Psych";
  description: string;
  highYieldConcepts: string[];
  nurviaPracticeModule: string;
  nurviaModuleHref: string;
}

const markKLectures: LectureTopic[] = [
  {
    number: 1,
    title: "Acid-Base Principles & Ventilator Alarms",
    category: "Prioritization & Triage",
    description: "Systematic interpretation of Arterial Blood Gases (ABGs) and clinical troubleshooting for high-pressure vs. low-pressure ventilator alarms.",
    highYieldConcepts: ["ROME method vs. systematic interpretation", "High-pressure alarms: secretions and kinks", "Low-pressure alarms: disconnections and leaks"],
    nurviaPracticeModule: "Respiratory Acid-Base Practice Set",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 2,
    title: "Alcohol Withdrawal, Wernicke-Korsakoff & Overdose Triage",
    category: "Maternity & Psych",
    description: "Clinical distinctions between alcohol withdrawal syndrome and delirium tremens; triage for acute toxicities and overdoses.",
    highYieldConcepts: ["Delirium Tremens safety precautions", "Wernicke encephalopathy: Vitamin B1 (Thiamine)", "Upper vs. Downer overdose and withdrawal signs"],
    nurviaPracticeModule: "Substance Use & Triage Quiz",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 3,
    title: "Thyroid, Adrenal Disorders & Calcium Regulation",
    category: "Electrolytes & Endocrine",
    description: "Hyperthyroidism, Graves' disease, thyroid storm, Addison's disease, and Cushing's syndrome diagnostic priorities.",
    highYieldConcepts: ["Thyroidectomy post-op airway & tetany (calcium gluconate)", "Addisonian crisis: IV steroids & fluid resuscitation", "Cushing's: cortisol excess, hypokalemia, infection risk"],
    nurviaPracticeModule: "Endocrine & Electrolyte Practice Set",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 4,
    title: "Cardiac Telemetry & Chest Tube Systems",
    category: "Med-Surg & Cardiac",
    description: "Lethal and non-lethal arrhythmias, defibrillation vs. cardioversion, and water seal chest tube maintenance.",
    highYieldConcepts: ["Ventricular fibrillation & asystole protocols", "Atrial fibrillation: rate control & anticoagulation", "Continuous bubbling in water seal chamber indicates leak"],
    nurviaPracticeModule: "Cardiac Arrhythmias & Telemetry",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 5,
    title: "Congenital Heart Defects & Assistive Mobility",
    category: "Med-Surg & Cardiac",
    description: "Cyanotic vs. acyanotic pediatric defects ('TRouBLe' mnemonic) and safe crutch, cane, and walker gait training.",
    highYieldConcepts: ["Tetralogy of Fallot: PROVe anatomical defects", "Crutch walking: 2-point, 3-point, 4-point gaits", "Stairs: Up with the good, down with the bad"],
    nurviaPracticeModule: "Pediatric Cardiac & Mobility Set",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 6,
    title: "Psychotropic Medications & Therapeutic Communication",
    category: "Maternity & Psych",
    description: "Major psychotropic medication classes (SSRIs, MAOIs, Lithium, Phenothiazines) and therapeutic boundary rules.",
    highYieldConcepts: ["Lithium therapeutic range (0.6 - 1.2 mEq/L) & toxicity", "MAOIs: tyramine-restricted diet to prevent hypertensive crisis", "Serotonin syndrome: hyperreflexia, tremors, agitation"],
    nurviaPracticeModule: "Psychiatric Nursing & Psychopharm",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 7,
    title: "Diabetes Mellitus, Diabetes Insipidus & SIADH",
    category: "Electrolytes & Endocrine",
    description: "Pathophysiology of insulin administration, hypoglycemia protocols, DKA, and hyperosmolar hyperglycemic state (HHS).",
    highYieldConcepts: ["Insulin on-peak safety windows: Regular vs. NPH vs. Glargine", "DKA vs. HHS: fluid resuscitation priority", "SIADH: water intoxication, hyponatremia, fluid restriction"],
    nurviaPracticeModule: "Endocrine & Diabetes Mastery Set",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 8,
    title: "Serum Electrolytes & Critical Lab Values",
    category: "Electrolytes & Endocrine",
    description: "Potassium, sodium, calcium, and magnesium clinical manifestations; priority interventions for life-threatening lab values.",
    highYieldConcepts: ["Hyperkalemia: Tall tented T waves & calcium gluconate", "Hyponatremia: Seizure precautions", "Calcium vs. Potassium manifestation rules"],
    nurviaPracticeModule: "Lab Values & Safety Alerts Set",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 9,
    title: "Labor, Delivery & Obstetric Emergencies",
    category: "Maternity & Psych",
    description: "Four stages of labor, active phase dilation, and management of umbilical cord prolapse, shoulder dystocia, and uterine rupture.",
    highYieldConcepts: ["Prolapsed cord: knee-chest or Trendelenburg position", "Active labor dilation (4 to 7 cm)", "Uterine hyperstimulation from oxytocin: stop the infusion"],
    nurviaPracticeModule: "Maternal-Newborn Critical Scenarios",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 10,
    title: "Fetal Heart Rate Monitoring & VEAL CHOP",
    category: "Maternity & Psych",
    description: "Systematic analysis of fetal monitoring strips: variable, early, late decelerations, and nursing actions.",
    highYieldConcepts: ["VEAL CHOP mnemonic for strip deceleration etiology", "Late decelerations: maternal left lateral, O2, IV bolus", "Early decelerations: head compression (benign)"],
    nurviaPracticeModule: "Fetal Heart Rate Strip Interpretation",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 11,
    title: "Maternity Staging & Core Pharmacology Rules",
    category: "Maternity & Psych",
    description: "Postpartum fundal assessment, neonatal APGAR scoring, tocolytic medications, and systemic antibiotic toxicities.",
    highYieldConcepts: ["APGAR score timing: 1 and 5 minutes", "Aminoglycosides: ototoxicity & nephrotoxicity monitoring", "Tocolytics: Terbutaline (tachycardia) and Nifedipine"],
    nurviaPracticeModule: "Pharmacology & Maternal Assessment",
    nurviaModuleHref: "/learner/library",
  },
  {
    number: 12,
    title: "Prioritization & Delegation: The Master Framework",
    category: "Prioritization & Triage",
    description: "The gold standard NCLEX prioritization algorithm: acute vs. chronic, fresh post-op vs. medical, unstable vs. stable, RN vs. LPN vs. UAP delegation.",
    highYieldConcepts: ["Acute beat chronic; fresh post-op (<12h) beat medical", "Unstable vs. stable distinguishing clinical indicators", "Delegation rules: do not delegate assessment, teaching, or evaluation"],
    nurviaPracticeModule: "Master Prioritization & Delegation Simulator",
    nurviaModuleHref: "/learner/library",
  },
];

export default function MarkKReviewPage() {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const categories = ["All", "Prioritization & Triage", "Electrolytes & Endocrine", "Med-Surg & Cardiac", "Maternity & Psych"];

  const filteredLectures = markKLectures.filter((lec) => {
    const matchesSearch =
      search.trim() === "" ||
      lec.title.toLowerCase().includes(search.toLowerCase()) ||
      lec.description.toLowerCase().includes(search.toLowerCase()) ||
      lec.highYieldConcepts.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === "All" || lec.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <PublicShell>
      <div className="bg-background text-foreground">
        {/* Header Hero */}
        <section className="border-b border-border bg-gradient-to-b from-surface/80 to-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>NCLEX High-Yield Framework</span>
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Mark Klimek NCLEX Review Index
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore an organized syllabus of the 12 classic review topics—reinforced with NURVIA’s original interactive practice questions and clinical rationales.
            </p>

            {/* Fair Use / Educational Disclaimer Alert */}
            <div className="max-w-3xl mx-auto p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Educational Reference & Copyright Notice</span>
                <p className="text-amber-800 dark:text-amber-300">
                  NURVIA is an independent educational platform and is not affiliated with or endorsed by Mark Klimek or Klimek Reviews. The lectures below represent topic outlines and curricula commonly studied for NCLEX preparation. All practice questions and clinical rationales provided in NURVIA are original educational materials developed by NURVIA.
                </p>
              </div>
            </div>

            {/* Quick Search */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics (e.g. Prioritization, Acid-Base, Lithium)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filter and Lecture Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Filter Bar */}
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

            {/* Lecture Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLectures.map((lec) => (
                <div
                  key={lec.number}
                  className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between space-y-4 hover:border-brand-teal/50 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-brand font-bold text-xs px-2.5 py-1 rounded-md bg-brand-teal/10 text-brand-teal">
                        Lecture {lec.number}
                      </span>
                      <Badge variant="outline">{lec.category}</Badge>
                    </div>

                    <h3 className="font-brand text-lg font-bold text-foreground leading-snug group-hover:text-brand-teal transition-colors">
                      {lec.title}
                    </h3>

                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {lec.description}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                        High-Yield Takeaways:
                      </span>
                      <ul className="space-y-1 text-xs text-foreground-secondary">
                        {lec.highYieldConcepts.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <Link href={lec.nurviaModuleHref} className="block w-full">
                      <Button
                        size="sm"
                        className="w-full text-xs font-semibold h-9 justify-between bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal"
                      >
                        <span>Practice {lec.nurviaPracticeModule}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredLectures.length === 0 && (
              <div className="text-center py-12 space-y-3 bg-surface rounded-2xl border border-border">
                <AlertCircle className="w-8 h-8 text-foreground-muted mx-auto" />
                <p className="text-sm font-semibold text-foreground">No lectures matching your query</p>
                <p className="text-xs text-foreground-secondary">
                  Try searching for terms like &quot;Ventilators&quot;, &quot;Lithium&quot;, or &quot;Prioritization&quot;.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Master Prioritization CTA */}
        <section className="border-t border-border bg-surface/50 py-16 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="font-brand text-3xl font-bold text-foreground">
              Master the Priority Patient Decision Algorithm
            </h2>
            <p className="text-sm text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
              Prioritization questions comprise up to 20% of your NCLEX examination. Put the Mark Klimek triage rules into practice with NURVIA’s adaptive case studies.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/learner/library">
                <Button size="lg" className="h-11 px-6 text-xs font-semibold bg-brand-navy text-white hover:bg-brand-navyDeep dark:bg-brand-teal">
                  Open Prioritization Question Bank
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/nclex">
                <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-semibold">
                  Explore NCLEX Hub
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
