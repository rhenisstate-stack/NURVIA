"use client";

import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/config/config";
import { useState, useMemo } from "react";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
import {
  useDiscreteDominionSubscriptionPackages,
  type DiscreteSubscriptionPackage,
  type UserSubscriptionPackage,
} from "@/lib/hooks/nexus/subscription/packages/dicreate/useDiscreteDominionSubscriptionPackages";
import SubscriptionItem from "@/app/(web)/pages/subscription/item/SubscriptionItem";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import {
  DollarSign,
  PlayCircle,
  BarChart3,
  Lightbulb,
  ShieldCheck, HeartPulse, Brain, Activity,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Wallet,
  ArrowRight,
  Repeat,
} from "lucide-react";

import {
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";

import AuthModal from "@/app/(web)/auth/modals/auth";
import Contact from "@/app/(web)/components/sections/Contact";
import { useRouter } from "next/navigation";

const DASHBOARD_NAME = "nclex-pn"; // Lowercase hyphened as per dashboard path expectation 
const PROGRAM_NAME = "NCLEX PN";
const PARENT_TABLE_NAME = "program";
const PARENT_NAME = "NCLEX_PN"; // Uppercase and Underscore as per backend program Segment column expectation

// Wire these up to real config/env values when available
const SOCIAL_LINKS = {
  youtube: "#",
  instagram: "#",
  twitter: "#",
  facebook: "#",
  linkedin: "#",
};

// ─────────────────────────────────────────────────────────────
// Why Choose Section data
// ─────────────────────────────────────────────────────────────
const whyChooseFeatures = [
  {
    icon: DollarSign,
    color: "text-emerald-600",
    title: "Affordable Packages",
    text: "Flexible pricing so every student can prepare without breaking the bank.",
  },
  {
    icon: PlayCircle,
    color: "text-rose-600",
    title: "Video Explanations",
    text: "Step-by-step breakdowns for complex problems, explained by experts.",
  },
  {
    icon: BarChart3,
    color: "text-blue-600",
    title: "Subject Analysis",
    text: "Pinpoint strengths and weaknesses with in-depth subject performance insights.",
  },
  {
    icon: Lightbulb,
    color: "text-amber-600",
    title: "Adaptive Learning",
    text: "AI-driven study plans that adapt to your pace and focus where needed most.",
  },
];


// ─────────────────────────────────────────────────────────────
// What is {PROGRAM_NAME} Exam Section data
// ─────────────────────────────────────────────────────────────
const examSubjects = [
  {
    icon: ShieldCheck,
    color: "text-blue-600",
    title: "Safe & Effective Care Environment",
    points: [
      "Coordinated care: delegation, prioritization, and collaboration",
      "Safety and infection control, including error prevention",
      "Legal, ethical, and informed consent responsibilities for the PN",
    ],
  },
  {
    icon: HeartPulse,
    color: "text-emerald-600",
    title: "Health Promotion & Maintenance",
    points: [
      "Growth and development across the lifespan",
      "Health screening, disease prevention, and patient teaching",
      "Prenatal, newborn, and age-specific care considerations",
    ],
  },
  {
    icon: Brain,
    color: "text-purple-600",
    title: "Psychosocial Integrity",
    points: [
      "Mental health concepts and therapeutic communication",
      "Coping, grief and loss, abuse, and crisis situations",
      "Cultural awareness and supporting patients with behavioral needs",
    ],
  },
  {
    icon: Activity,
    color: "text-rose-600",
    title: "Physiological Integrity",
    points: [
      "Basic care and comfort: nutrition, mobility, hygiene, and elimination",
      "Pharmacological therapies, medication administration, and IV therapy",
      "Reduction of risk potential and physiological adaptation",
    ],
  },
  {
    icon: Lightbulb,
    color: "text-amber-600",
    title: "Clinical Judgment (Next Gen)",
    points: [
      "Case studies and item types that test the full clinical judgment model",
      "Recognize cues, analyze them, prioritize hypotheses, and take action",
      "Evaluate outcomes of care using evidence-based reasoning",
    ],
  },
];


// ─────────────────────────────────────────────────────────────
// Subscription Card Helper Functions
// ─────────────────────────────────────────────────────────────

const formatShortDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatMoney = (amount?: number | null, currency?: string | null) => {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency ?? ""} ${amount}`.trim();
  }
};

const humanizeMinutes = (raw?: string | number | null) => {
  if (raw == null || raw === "") return null;
  const total = Number(raw);
  if (!Number.isFinite(total) || total <= 0) return typeof raw === "string" ? raw : null;

  const units: [string, number][] = [
    ["year", 525600],
    ["month", 43200],
    ["week", 10080],
    ["day", 1440],
    ["hour", 60],
  ];

  let remaining = Math.floor(total);
  const parts: string[] = [];

  for (const [label, size] of units) {
    const count = Math.floor(remaining / size);
    if (count > 0) {
      parts.push(`${count} ${label}${count === 1 ? "" : "s"}`);
      remaining -= count * size;
    }
  }

  if (parts.length === 0) {
    const mins = Math.floor(total);
    return `${mins} minute${mins === 1 ? "" : "s"}`;
  }

  return parts.join(", ");
};

function ActiveSubscriptionCard({
  pkg,
  sub,
  activeCount,
   dashboardName,
}: {
  pkg: DiscreteSubscriptionPackage;
  sub: UserSubscriptionPackage;
  activeCount: number;
  dashboardName: string;
}) {
  const isActive = sub.subscriptionStatus === "Active";
  const isPaid = sub.subscriptionHasPaid === "Yes";
  const isAutoRenew = sub.subscriptionAutoRenew === "Yes";
  const cycle = humanizeMinutes(pkg.priceDuration || pkg.duration);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500 bg-gradient-to-br from-emerald-700 via-black to-teal-700 p-5 md:p-6 shadow-[0_0_24px_-6px_rgba(16,185,129,0.5)] text-white">
      <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-emerald-300/30" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`flex items-center justify-center w-16 h-16 rounded-full shrink-0 shadow-lg ${isActive
              ? "bg-gradient-to-br from-emerald-400 via-indigo-400 to-cyan-500"
              : "bg-gradient-to-br from-yellow-500 via-blue-500 to-red-600"
              }`}
          >
            {isActive ? (
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
            ) : (
              <XCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-200">
              You&apos;ve Got {activeCount} Active Subscription{activeCount === 1 ? "" : "s"} ✔️
            </p>
            <h3 className="text-xl md:text-2xl font-black truncate">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-xs text-white/70 line-clamp-2">{pkg.description}</p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-400 text-yellow-950" : "bg-red-500 text-black"
                  }`}
              >
                {isActive ? <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> : <XCircle className="w-3 h-3" strokeWidth={3} />}
                Status : {sub.subscriptionStatus ?? "—"}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isPaid ? "bg-emerald-400 text-blue-950" : "bg-red-500 text-black"
                  }`}
              >
                {isPaid ? <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> : <XCircle className="w-3 h-3" strokeWidth={3} />}
                Paid : {sub.subscriptionHasPaid ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/15 text-white">
                <Repeat className="w-3 h-3" />
                Auto Renew : {isAutoRenew ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboards/${dashboardName}`}
 
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_0_0_3px_rgba(99,102,241,0.35),0_10px_30px_-8px_rgba(79,70,229,0.9)] ring-2 ring-indigo-400/60 ring-offset-2 ring-offset-black transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:border-white hover:from-indigo-600 hover:via-violet-600 hover:to-indigo-600 hover:shadow-[0_0_0_4px_rgba(129,140,248,0.55),0_16px_40px_-6px_rgba(99,102,241,1)] hover:ring-indigo-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:translate-y-0 active:scale-95 shrink-0"
        >
          {/* Shine sweep */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

          {/* Inner glow border */}
          <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />

          <span className="relative">Go to Dashboard</span>
          <ArrowRight className="relative w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            <CalendarDays className="w-3.5 h-3.5" /> Valid From
          </div>
          <p className="mt-1 text-sm font-bold">{formatShortDate(sub.validFrom)}</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            <CalendarDays className="w-3.5 h-3.5" /> Valid Until
          </div>
          <p className="mt-1 text-sm font-bold">{formatShortDate(sub.validUntil)}</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            <Wallet className="w-3.5 h-3.5" /> Cost
          </div>
          <p className="mt-1 text-sm font-bold">
            {formatMoney(pkg.amount, pkg.currency)}
            {cycle ? <span className="font-normal text-white/70"> / {cycle}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function NclexPnPage() {
  const router = useRouter();
  const { user, loading } = useCurrentSystemUser();
  const isAuthenticated = !!user;

  // Active subscription for THIS program (ATI_TEAS)
  const { programs } = useRelativeStrataPrograms();
  const { filteredSubscriptionPackages } = useDiscreteDominionSubscriptionPackages({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const currentProgramGuidIds = useMemo(
    () => new Set(programs.filter((p) => p.segment === PARENT_NAME).map((p) => p.guidId)),
    [programs]
  );

  const myActiveSubscription = useMemo(() => {
    if (!isAuthenticated) return null;

    type PackageWithCluster = DiscreteSubscriptionPackage & {
      terminalClusterTableName?: string;
      terminalClusterGuidId?: string;
    };

    const active: { pkg: DiscreteSubscriptionPackage; sub: UserSubscriptionPackage }[] = [];

    filteredSubscriptionPackages.forEach((pkg) => {
      const p = pkg as PackageWithCluster;
      const matches =
        p.terminalClusterTableName === "strata_programs" &&
        !!p.terminalClusterGuidId &&
        currentProgramGuidIds.has(p.terminalClusterGuidId);

      if (!matches) return;

      pkg.userSubscriptions?.forEach((sub) => {
        if (sub.subscriptionStatus === "Active") active.push({ pkg, sub });
      });
    });

    if (active.length === 0) return null;
    return { ...active[0], activeCount: active.length };
  }, [filteredSubscriptionPackages, currentProgramGuidIds, isAuthenticated]);

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
 
  const handleStartPractice = () => {
    if (loading) return;
    if (!isAuthenticated) {
      setAuthTab("login");
      setAuthOpen(true);
      return;
    }

    router.push(`/dashboards/${DASHBOARD_NAME}`);
  };

  return (
    <main className="text-gray-900">
      {/*  {PROGRAM_NAME} Hero Section  */}
      <section
        className="relative py-10"
        style={{
          background:
            "linear-gradient(135deg, rgb(195, 215, 255), rgb(214, 251, 224), rgb(242, 255, 246))",
        }}
      >
        <div className="mx-auto max-w-[1360px] px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "#0097b2" }}>
                {PROGRAM_NAME} Exam Prep with {APP_NAME}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {PROGRAM_NAME} Exam is your first step — and <strong>{APP_NAME}</strong> has the prep you
                need to succeed. Boost your confidence, sharpen your skills, and get test-ready
                with realistic practice questions. Join the many aspiring nurses who&apos;ve aced
                their exams with us.
              </p>
              <p className="mb-4">
                <a href="#pricing" className="font-semibold text-blue-600 hover:underline">
                  Ready to get started?
                </a>
              </p>

              <div className="flex flex-wrap sm:flex-nowrap gap-3 justify-between">
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("login");
                      setAuthOpen(true);
                    }}
                    className="rounded-full px-4 py-2 text-sm sm:text-base font-bold text-black shadow-sm transition-transform hover:-translate-y-0.5"
                    style={{ background: "#68FA51" }}
                  >
                    Sign In Now
                  </button>
                ) : (
                  <a
                    href="#pricing"
                    className="rounded-full px-4 py-2 text-sm sm:text-base font-bold text-black shadow-sm transition-transform hover:-translate-y-0.5
                   bg-green-300"
                  >
                    View Our Plans
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleStartPractice}
                  className="rounded-full px-4 py-2 text-sm sm:text-base font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5
                bg-blue-600"
                >
                  Start Practice Now
                </button>
              </div>

            </div>

            {/* Right Column (Image) */}
            <div className="lg:col-span-4 text-center">
              <div
                className="rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(217,47,47,0.4)",
                }}
              >
                <Image
                  src="/images/pages/exams/nclex-pn/hero.jpg"
                  alt="Exam Prep"
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  Features Section  */}
      <section
        className="relative py-3 text-center hidden md:block"
        style={{ background: "linear-gradient(135deg, #f0fff4, #e7fae2, #fff1f8)" }}
      >
        <div className="mx-auto max-w-[1600px] px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 flex justify-center items-center gap-2">
            <span>💎</span>
            Start your <span className="text-blue-600">{PROGRAM_NAME} Exam</span> with {APP_NAME}
          </h2>

          <p className="text-lg text-gray-600 mx-auto mb-2 max-w-6xl">
            At <strong>{APP_NAME}</strong>, we&apos;re committed to your success! Our expert
            instructors have crafted <strong>up-to-date {PROGRAM_NAME} resources</strong>, ensuring
            our practice exams mirror the latest formats. With a comprehensive test bank in{" "}
            you&apos;ll gain the confidence to excel.
          </p>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/*  Pricing / Subscription Items   */}
      <section id="pricing" className="py-2 bg-yellow-200">
        <div className="mx-auto max-w-[1360px] px-4 md:px-6">
          {myActiveSubscription ? (
            <ActiveSubscriptionCard
              pkg={myActiveSubscription.pkg}
              sub={myActiveSubscription.sub}
              activeCount={myActiveSubscription.activeCount}
              dashboardName={DASHBOARD_NAME}
            />
          ) : (
            <SubscriptionItem
              parentTableName={PARENT_TABLE_NAME}
              parentName={PARENT_NAME}
              dashboardName={DASHBOARD_NAME}
              heading={`${PROGRAM_NAME} Exam Prep Plans`}
              showSearch={false}
            />
          )}
        </div>
      </section>
      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/*  Why Choose Section  */}
      <section
        className="py-10"
        style={{ background: "linear-gradient(135deg, #e1f6e7, #c1c8fa, #dfccff)" }}
      >
        <div className="mx-auto max-w-[1360px] px-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
            <a
              href="#contact"
              className="group order-2 md:order-1 inline-flex items-center gap-2 rounded-full border border-rose-400 bg-white px-4 py-2 text-sm font-bold text-rose-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-rose-500 hover:text-white hover:shadow-lg active:scale-95"
            >
              <span className="transition-transform duration-300 group-hover:rotate-12">🛠️</span>
              Having Issues?
            </a>

            <h2 className="order-1 md:order-2 text-center text-3xl md:text-4xl font-bold">
              Why Choose Our <span className="text-blue-600">{PROGRAM_NAME} </span> ?
            </h2>

            <a
              href="#contact"
              className="group order-3 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg active:scale-95"
            >
              Contact Us
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <p className="text-lg text-gray-800 mx-auto mb-8 max-w-3xl text-center">
            At <strong>{APP_NAME}</strong>, we&apos;ve created a transformative study plan designed
            to help you succeed on the {PROGRAM_NAME} test. With <strong>affordable study packages</strong>,{" "}
            <strong>video explanations</strong>, <strong>subject-based analysis</strong>, and{" "}
            <strong>adaptive learning</strong>, our program ensures you focus where it matters
            most.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyChooseFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl shadow bg-white p-5 text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <Icon className={`w-10 h-10 mx-auto mb-3 ${f.color}`} />
                  <h5 className="font-bold mb-1">{f.title}</h5>
                  <p className="text-sm text-gray-600">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/*  What is This Exam Section  */}
      <section
        className="py-10 text-center"
        style={{ background: "linear-gradient(135deg, #e1f6e7, #e0daf6, #ebfbee)" }}
      >
        <div className="mx-auto max-w-[1360px] px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            What is <span className="text-blue-600">{PROGRAM_NAME} Exam?</span>
          </h2>

          <p className="text-lg text-gray-800 text-start mx-auto mb-8 max-w-3xl">
            Join the countless aspiring nurses we&apos;ve helped ace this exam — because success
            starts with the right preparation! Understanding the structure of your {PROGRAM_NAME} Exam is
            the first step.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examSubjects.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl shadow bg-white p-5 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-7 h-7 ${s.color}`} />
                    <h5 className="font-bold mb-0">{s.title}</h5>
                  </div>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/*  Contact Section  */}
      <Contact
        heading={`Questions About ${PROGRAM_NAME} ?`}
        subheading="Send us a message and our Team will get Back to you Shortly."
        defaultCategory="other"
      />

      {/*  Community Section  */}
      <section
        id="moreDetails"
        className="mx-auto max-w-[1360px] rounded-xl border border-blue-600 p-6 mt-8 mb-8"
        style={{ background: "linear-gradient(135deg, #d4f5e8, #fbffc6, #f0ebfb)" }}
      >
        <div className="text-center mb-4">
          <h2 className="font-bold text-2xl">
            Join {APP_NAME} {PROGRAM_NAME} Community
          </h2>
        </div>

        <p className="mb-4">
          Connect with peers and experts on FaInstagram, FaFacebookF, and TikTok. Access quick tips,
          stay motivated, and engage in discussions to boost your {PROGRAM_NAME}. Study smarter and
          succeed with {APP_NAME}.
        </p>

        <div className="flex justify-center gap-4">
          <a href={SOCIAL_LINKS.youtube} className="text-gray-800 hover:text-red-600 transition-colors">
            <FaYoutube className="w-7 h-7" />
          </a>
          <a href={SOCIAL_LINKS.instagram} className="text-gray-800 hover:text-pink-600 transition-colors">
            <FaInstagram className="w-7 h-7" />
          </a>
          <a href={SOCIAL_LINKS.twitter} className="text-gray-800 hover:text-black transition-colors">
            <FaXTwitter className="w-7 h-7" />
          </a>
          <a href={SOCIAL_LINKS.facebook} className="text-gray-800 hover:text-blue-700 transition-colors">
            <FaFacebookF className="w-7 h-7" />
          </a>
          <a href={SOCIAL_LINKS.linkedin} className="text-gray-800 hover:text-blue-600 transition-colors">
            <FaLinkedinIn className="w-7 h-7" />
          </a>
        </div>
      </section>

      {/*  Trustpilot Placeholder  */}
      <section className="py-8 bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center text-gray-500 text-sm">
          {/* Trustpilot widget goes here */}
        </div>
      </section>

      {/*  Footer CTA  */}
      <div className="border-t px-6 py-4 flex justify-between max-w-[1360px] mx-auto">
        <Link href="/pages/contact-us" className="rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium">
          Contact Us
        </Link>
        <Link href="/" className="rounded bg-gray-600 text-white px-4 py-2 text-sm font-medium">
          Back Home
        </Link>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
        redirectPath={`/dashboards/${DASHBOARD_NAME}`}
      />

    </main >
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────