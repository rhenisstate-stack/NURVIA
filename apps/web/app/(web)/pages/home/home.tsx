"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { APP_NAME } from '@/lib/config/config';
import AuthModal from "@/app/(web)/auth/modals/auth";

const heroButtons = [
  { label: "TEAS Prep", href: "/pages/exams/ati-teas", bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", hover: "hover:bg-emerald-500 hover:text-white" },
  { label: "HESI A2 Prep", href: "/pages/exams/hesi-a2", bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", hover: "hover:bg-amber-500 hover:text-white" },
  { label: "RN Nursing Exams", href: "/pages/exams/rn-nursing", bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-800", hover: "hover:bg-sky-500 hover:text-white" },
  { label: "LPN Nursing Exams", href: "/pages/exams/lpn-nursing", bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-800", hover: "hover:bg-indigo-500 hover:text-white" },
  { label: "RN Exit Exams", href: "/pages/exams/rn-nursing", bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-800", hover: "hover:bg-violet-500 hover:text-white", hideOnMobile: true },
  { label: "LPN Exit Exams", href: "/pages/exams/lpn-nursing", bg: "bg-pink-50", border: "border-pink-300", text: "text-pink-800", hover: "hover:bg-pink-500 hover:text-white", hideOnMobile: true },
  { label: "NCLEX-RN", href: "/pages/exams/nclex-rn", bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-800", hover: "hover:bg-rose-500 hover:text-white" },
  { label: "NCLEX-PN", href: "/pages/exams/nclex-pn", bg: "bg-green-50", border: "border-green-300", text: "text-green-800", hover: "hover:bg-green-500 hover:text-white" },
];

const examPrepCards = [
  {
    icon: "💎",
    title: "ATI TEAS Prep",
    badge: "NEW TEAS 7",
    badgeColor: "bg-emerald-600",
    bg: "bg-[#e6e6e6]",
    img: "/images/home/fotoa.webp",
    body: "Prepare for TEAS 7 with practice questions, simulated exams, adaptive learning, and video explanations designed to match the real exam.",
    tags: [
      { label: "Adaptive Learning", color: "bg-emerald-100 text-emerald-700" },
      { label: "3000+ Questions", color: "bg-sky-100 text-sky-700" },
      { label: "Video Explanations", color: "bg-purple-100 text-purple-700" },
    ],
    cta: "Get Instant Access",
    ctaColor: "bg-emerald-600",
  },
  {
    icon: "🧬",
    title: "HESI A2 Prep",
    badge: null,
    bg: "bg-[#d8dadb]",
    img: "/images/home/fotob.webp",
    body: "Get the ultimate edge for the HESI A2 with practice tests and full simulated exams that mirror the real testing experience. Master all four sections with detailed rationales, smart analytics, and proven strategies.",
    tags: [
      { label: "All Sections Covered", color: "bg-indigo-100 text-indigo-700" },
      { label: "4500+ Questions", color: "bg-sky-100 text-sky-700" },
      { label: "Math Calculator", color: "bg-purple-100 text-purple-700" },
    ],
    cta: "Start Now",
    ctaColor: "bg-indigo-600",
  },
  {
    icon: "🎓",
    title: "RN Nursing Exams",
    badge: "96% PASS RATE",
    badgeColor: "bg-sky-600",
    bg: "bg-[#e9eae8]",
    img: "/images/home/fotoc.webp",
    body: "Ace your RN Nursing Exams with 10K+ simulated exams, 30,000+ NGN & NCLEX-style practice questions and study resources. Build the confidence and mastery you need to pass!",
    tags: [
      { label: "NCLEX-Style", color: "bg-sky-100 text-sky-700" },
      { label: "30,000+ Questions", color: "bg-emerald-100 text-emerald-700" },
      { label: "Clinical Judgement", color: "bg-purple-100 text-purple-700" },
    ],
    cta: "Start RN Prep",
    ctaColor: "bg-sky-600",
  },
  {
    icon: "🔷",
    title: "LPN Nursing Exams",
    badge: null,
    bg: "bg-[#e0e1e1]",
    img: "/images/home/fotod.webp",
    body: "Excel in your LPN Nursing Exams with 8K+ simulated exams, 15,000+ NGN & NCLEX-style practice questions, and study resources. Build the confidence and mastery you need to pass!",
    tags: [
      { label: "State-Specific", color: "bg-amber-100 text-amber-700" },
      { label: "18,000+ Questions", color: "bg-sky-100 text-sky-700" },
      { label: "Skills Videos", color: "bg-purple-100 text-purple-700" },
    ],
    cta: "Start LPN Prep",
    ctaColor: "bg-amber-500",
  },
];

const whyChooseUs = [
  { title: "Comprehensive Study Materials", body: "An extensive library of 50,000 practice questions spanning HESI A2, ATI-TEAS, NGN nursing school exams in RN & LPN, study guides, flashcards, and NCLEX RN & LPN QBank.", bg: "bg-[#ffe8e8]" },
  { title: "Practice and Review", body: "Simulate real exams that test clinical judgment and nursing skills. Review detailed rationales to improve and build exam confidence.", bg: "bg-[#d6fbe0]" },
  { title: "Expert Guidance", body: "Access personalized support from our nursing experts through study plans and guidance on challenging topics.", bg: "bg-[#fafed6]" },
  { title: "Real-Time Progress Insights", body: "Track your progress with precision. Our dashboard gives you real-time insights and trends to monitor and meet your study goals.", bg: "bg-[#d0e5fa]" },
];

const qbankFeatures = [
  { icon: "⚡", title: "Adaptive Learning", body: "Smart algorithms adjust to your performance, focusing on weak areas for maximum efficiency." },
  { icon: "📊", title: "Detailed Analytics", body: "Track progress with comprehensive performance metrics and personalized recommendations." },
  { icon: "⏰", title: "Timed Practice", body: "Simulate real exam conditions with customizable timer settings and pause functions." },
];

const qbankTags = ["NCLEX-Style", "Instant Feedback", "Mobile Friendly", "Updated Content", "Video Explanations", "Bookmark System"];

const standoutCards = [
  { title: "Exam-Ready Content", body: "Our resources align with the latest nursing exam formats including NCLEX, ATI TEAS, and HESI A2.", bg: "bg-sky-50", text: "text-sky-700" },
  { title: "Expert Nursing Tutors", body: "Learn from qualified professionals with years of nursing experience and proven exam success.", bg: "bg-purple-50", text: "text-purple-700" },
  { title: "Realistic Simulations", body: "Practice with adaptive mock exams, quizzes, and timed challenges that mirror the real exam environment.", bg: "bg-emerald-50", text: "text-emerald-700" },
  { title: "Supportive Community", body: "Get motivated with group challenges, live webinars, discussion forums, and peer-to-peer mentoring.", bg: "bg-amber-50", text: "text-amber-700" },
];

const successStories = [
  { name: "Fatima L.", highlight: "Top 1% in HESI A2", story: "I focused better and practiced daily using their structured prep. The mock tests felt real.", icon: "💬", badge: "HESI A2 Elite" },
  { name: "Devon R.", highlight: "LPN Success Story", story: "I used to fail practice tests. Now clarity finally clicked — I'm working in my dream clinic!", icon: "🎓", badge: "Licensed Practical Nurse" },
  { name: "Carla T.", highlight: "RN Mastery", story: "The study plan, peer forums, and live reviews helped me finally beat NCLEX after two attempts.", icon: "🌟", badge: "RN Passed" },
];

const successSteps = [
  { title: "Diagnostic Assessment", body: "Identify strengths and weaknesses with smart diagnostic tools." },
  { title: "Personalized Study Plan", body: "AI creates a customized roadmap based on your results." },
  { title: "Confident Exam Day", body: "Walk into your exam fully prepared to succeed." },
];

const examPathButtons = [
  "TEAS Prep", "HESI A2 Prep", "RN Nursing", "LPN Nursing", "NCLEX-RN", "NCLEX-PN",
];

const flashcardTopics = ["Medical-Surgical", "Pediatrics", "Maternal-Newborn", "Pharmacology", "Mental Health", "Fundamentals"];

// Reusable bits

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-sky-100 text-sky-700 font-semibold text-xs px-3 py-2 mb-3">
      {children}
    </span>
  );
}

// Page

type HomePageProps = {
  data?: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HomePage({ data }: HomePageProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");

  return (
    <main className="text-gray-900 bg-white">
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
      {/* HERO */}
      <section className="mt-4 rounded-2xl border border-gray-200 overflow-hidden bg-gradient-to-r from-[#1b3256] via-cyan-50 to-cyan-50 md:bg-gradient-to-r max-md:bg-gradient-to-b max-md:from-cyan-50 max-md:to-white">
        <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-2 py-6 sm:py-8 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Text & buttons: first on mobile, second on desktop */}
          <div className="order-1 md:order-2 text-center flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-3">
              {APP_NAME} — The Future of Nursing Exam Prep!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              Join thousands of future nurses who trust {APP_NAME} today. Master your nursing exams with a
              smarter, faster, and more effective approach.
            </p>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Your dream nursing career starts with the right preparation — let&apos;s make it happen!
            </p>

            <div className="grid grid-cols-2 gap-2">
              {heroButtons.map((b) => (
                <Link
                  key={b.label}
                  href={b.href}
                  className={`rounded-lg py-3 px-3 text-md font-semibold border shadow-sm transition ${b.bg} ${b.border} ${b.text} ${b.hover} ${b.hideOnMobile ? "hidden sm:block" : ""
                    }`}
                >
                  {b.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Image: second on mobile, first on desktop */}
          <div className="order-2 md:order-1 flex flex-col items-center justify-between gap-4 p-3 rounded-2xl max-md:bg-gradient-to-r max-md:from-[#1b3256] max-md:to-cyan-50">
            <Image
              src="/images/home/nursing-banner.avif"
              alt="Nursing Exam Prep"
              width={350}
              height={480}
              priority
              className="rounded-2xl shadow-md object-contain transition hover:scale-105 max-h-[480px] w-auto"
            />

            <div className="flex md:hidden w-full justify-between gap-3 px-6">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setAuthOpen(true);
                }}
                className="flex-1 rounded-full py-3 text-center font-bold text-white bg-indigo-600"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setAuthOpen(true);
                }}
                className="flex-1 rounded-full py-3 text-center font-bold text-white bg-blue-600"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE PREP CARDS */}
      <section className="bg-white py-3 text-center">
        <div className="mx-auto max-w-[1360px]">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Comprehensive <span className="text-sky-600">Nursing Exam Preparation</span>
          </h2>
          <p className="text-left text-gray-600 mb-5">
            {APP_NAME} is your all-in-one study resource bank, offering adaptive learning, video explanations,
            real exam simulations, practice questions, study guides and notes, digital flashcards and smart
            analytics for{" "}
            <span className="text-sky-600 font-semibold">
              ATI TEAS, HESI A2, Nursing school test banks in RN &amp; LPN Nursing, Nursing Exit Exams and
              NCLEX-RN &amp; PN online tutoring.
            </span>{" "}
            <span className="text-red-600">Start Learning with {APP_NAME} Today!</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examPrepCards.map((c) => (
              <div key={c.title} className={`rounded-2xl overflow-hidden shadow-sm text-left transition hover:-translate-y-1 hover:shadow-lg ${c.bg}`}>
                <div className="relative h-[200px]">
                  <Image src={c.img} alt={c.title} fill className="object-cover" />
                  {c.badge && (
                    <span className={`absolute top-3 right-3 rounded-full text-white text-xs font-semibold px-3 py-1.5 shadow ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{c.icon}</span>
                    <h3 className="font-bold text-lg">{c.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{c.body}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.tags.map((t) => (
                      <span key={t.label} className={`text-xs font-semibold rounded-full px-3 py-1 ${t.color}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <button className={`w-full rounded-lg py-2.5 font-semibold text-white shadow-sm ${c.ctaColor}`}>
                    {c.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-3 bg-sky-50">
        <div className="mx-auto max-w-[1360px] px-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-sky-700 mb-4">
            Why Thousands of Nurses Choose {APP_NAME}
          </h2>
          <p className="text-gray-600 mb-10">
            Start your journey with <strong>{APP_NAME}</strong> and ace your ATI-TEAS, HESI A2, nursing school
            exams, and NCLEX. Join over <strong>10,000 future nurses</strong> who are enjoying {APP_NAME}&apos;s
            most affordable exam preparation study resources.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex justify-center">
              <Image
                src="/images/home/whyus.webp"
                alt="Why nurses choose {APP_NAME}"
                width={356}
                height={252}
                className="rounded-2xl shadow-lg object-contain bg-gray-50"
              />
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whyChooseUs.map((f) => (
                <div key={f.title} className={`rounded-2xl border border-sky-100 shadow-sm p-5 transition hover:shadow-md ${f.bg}`}>
                  <h4 className="font-semibold text-sky-700 mb-2">{f.title}</h4>
                  <p className="text-sm text-gray-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QBANK RN / LPN */}
      <section className="relative py-3 overflow-hidden" style={{ background: "linear-gradient(135deg, #eff6ff, #eef2ff)" }}>
        <div className="mx-auto max-w-[1360px] px-6 relative">
          <div className="text-center mb-10">
            <SectionEyebrow>PREMIUM QUESTION BANKS</SectionEyebrow>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Comprehensive <span className="text-sky-600">Nursing Qbank</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-left">
              Equip yourself with expertly prepared clinically focused questions covering all nursing core study
              areas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Nursing RN Test-Bank" },
              { title: "Nursing LPN Test-Bank" },
            ].map((qb) => (
              <div key={qb.title} className="bg-white rounded-2xl shadow p-6 md:p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl text-sky-600">🛡️</span>
                  <h3 className="font-bold text-xl">{qb.title}</h3>
                </div>
                <div className="flex flex-col gap-4 mb-4">
                  {qbankFeatures.map((f) => (
                    <div key={f.title} className="flex gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                        {f.icon}
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1">{f.title}</h5>
                        <p className="text-sm text-gray-600">{f.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t flex flex-wrap justify-center gap-2">
                  {qbankTags.map((t) => (
                    <span key={t} className="rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY WE STAND OUT */}
      <section className="py-3 bg-white">
        <div className="mx-auto max-w-[1360px] px-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-sky-700 mb-10">Why {APP_NAME} Stands Out</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {standoutCards.map((c) => (
              <div key={c.title} className={`rounded-2xl border border-gray-100 shadow-sm p-5 transition hover:shadow-md hover:-translate-y-1 ${c.bg}`}>
                <h3 className={`font-semibold mb-2 ${c.text}`}>{c.title}</h3>
                <p className="text-sm text-gray-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-3 bg-sky-50">
        <div className="mx-auto max-w-[1360px] px-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-sky-700 mb-10">They Believed in {APP_NAME}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 transition hover:shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1">{s.badge}</span>
                </div>
                <h5 className="font-semibold text-sky-700">{s.name}</h5>
                <p className="italic text-sm text-gray-500 mb-2">{s.highlight}</p>
                <p className="text-sm text-gray-600">{s.story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS SYSTEM + EXAM PATH */}
      <section className="relative py-3 overflow-hidden" style={{ background: "linear-gradient(to bottom right, #eff6ff, #eef2ff)" }}>
        <div className="mx-auto max-w-[1360px] px-6 relative">
          <div className="text-center mb-10">
            <SectionEyebrow>Your Nursing Journey Starts Here</SectionEyebrow>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              We&apos;ve Built Your Path to <span className="text-sky-600">Nursing Exam Success</span>
            </h2>
            <p className="text-gray-600">
              Start with <strong>{APP_NAME}</strong> and conquer every exam with confidence.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {examPathButtons.map((b) => (
              <a key={b} href="#" className="rounded-full border border-sky-300 text-sky-700 px-4 py-2 text-sm font-medium shadow-sm hover:bg-sky-600 hover:text-white transition">
                {b}
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 3-step system */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl text-sky-600">🎓</span>
                <h3 className="font-bold text-xl">Proven 3-Step Success System</h3>
              </div>
              <div className="flex flex-col gap-5 mb-6">
                {successSteps.map((s, i) => (
                  <div key={s.title} className="flex gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <h5 className="font-semibold">{s.title}</h5>
                      <p className="text-sm text-gray-600">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex flex-wrap justify-center gap-3">
                <a href="#" className="rounded-full border border-sky-300 text-sky-700 px-4 py-2 text-sm font-medium flex items-center gap-2">
                  📚 ATI TEAS
                  <span className="rounded-full border border-sky-400 text-sky-700 text-xs px-2 py-0.5">Most Popular</span>
                </a>
                <a href="#" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-medium flex items-center gap-2">
                  🔬 HESI A2
                  <span className="rounded-full border border-amber-500 text-xs px-2 py-0.5 bg-white">Updated 2024</span>
                </a>
              </div>
            </div>

            {/* Choose your path */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
              <h3 className="font-bold text-xl flex items-center gap-2 mb-6">
                <span className="text-amber-500 text-2xl">🏆</span> Choose Your Exam Path
              </h3>
              <div className="grid grid-cols-2 gap-3 flex-1">
                <a href="#" className="rounded-lg border border-sky-300 text-sky-700 py-6 text-center font-medium">👩‍⚕️ ATI TEAS</a>
                <a href="#" className="rounded-lg border border-sky-300 text-sky-700 py-6 text-center font-medium">👨‍⚕️ HESI A2</a>
                <a href="#" className="rounded-lg border border-sky-300 text-sky-700 py-6 text-center font-medium">👩‍⚕️ RN Nursing</a>
                <a href="#" className="rounded-lg border border-sky-300 text-sky-700 py-6 text-center font-medium">👨‍⚕️ LPN Nursing</a>
                <a href="#" className="rounded-lg border border-red-300 text-red-600 py-6 text-center font-medium">🏆 NCLEX-RN</a>
                <a href="#" className="rounded-lg border border-emerald-300 text-emerald-600 py-6 text-center font-medium">💉 NCLEX-PN</a>
              </div>
              <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="text-emerald-600">✔</span> Not sure where to start?
                </div>
                <a href="#" className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium">
                  Take Our Quiz →
                </a>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(to bottom right, #a0faff, #eef2ff)" }}>
            <div className="text-center sm:text-left">
              <h4 className="font-bold mb-1">Ready to begin your journey?</h4>
              <p className="text-sm text-gray-600">Join thousands of successful nursing students</p>
            </div>
            <div className="flex gap-3">
              <a href="#" className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold">Sign Up →</a>
              <a href="#" className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold">Watch Demo ▶</a>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM RESOURCES + FLASHCARDS */}
      <section className="relative py-3 overflow-hidden" style={{ background: "linear-gradient(to bottom right, #eff6ff, #e662f0)" }}>
        <div className="mx-auto max-w-[1360px] px-6 relative grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl shadow-lg p-6 md:p-8" style={{ background: "linear-gradient(to bottom right, #d5f57c, #aae8ff)" }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl text-sky-700">📘</span>
              <h3 className="font-bold text-xl">Premium Study Resources</h3>
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              Access a wide range of ATI TEAS, HESI A2, RN exit exams, LPN exams, and nursing study guides directly
              from our shop section. Study anytime, anywhere efficiently.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["ATI TEAS", "HESI A2", "RN Exit", "LPN Exams", "NCLEX-RN", "NCLEX-PN"].map((t) => (
                <span key={t} className="rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
            <a href="#" className="text-sky-700 font-semibold inline-flex items-center gap-1 mb-6">
              Explore all resources →
            </a>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl text-indigo-700">🎓</span>
              <h3 className="font-bold text-xl">Start Your Nursing Journey Today</h3>
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              Flexible, focused on topics that matter most for your nursing success. Join thousands of students
              who&apos;ve passed their exams with our resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#" className="rounded-lg bg-sky-600 text-white px-5 py-2.5 font-semibold text-center">Get Started Now</a>
              <a href="#" className="rounded-lg border border-gray-400 text-gray-700 px-5 py-2.5 font-semibold text-center">Watch Demo Video</a>
            </div>
          </div>

          <div className="rounded-2xl shadow-lg p-6 md:p-8" style={{ background: "linear-gradient(to bottom right, #97faff, #f8ff98)" }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl text-indigo-700">📱</span>
              <h3 className="font-bold text-xl">Digital Flashcards</h3>
            </div>
            <p className="text-gray-700 mb-3 text-sm">
              Master essential nursing concepts with {APP_NAME}&apos;s digital flashcards, covering all core RN &amp;
              LPN courses:
            </p>
            <ul className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-700">
              {flashcardTopics.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="text-amber-500">⚡</span> {t}
                </li>
              ))}
            </ul>
            <p className="text-gray-700 mb-4 text-sm">
              Perfect for NCLEX-RN and NCLEX-PN preparation. Customizable flashcards to reinforce learning and boost
              retention. Accessible anytime on mobile or desktop.
            </p>
            <a href="#" className="rounded-lg bg-indigo-600 text-white px-5 py-2.5 font-semibold text-center inline-block">
              Explore Now
            </a>
          </div>
        </div>
      </section>

      {/* ADAPTIVE NCLEX PRACTICE */}
      <section className="py-3 bg-white">
        <div className="mx-auto max-w-[1360px] px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="rounded-xl p-4 mb-2" style={{ background: "linear-gradient(to bottom right, #e8c9ff, #c2d0ff)" }}>
              <div className="flex flex-wrap gap-2 mb-3">
                {["INNOVATIVE LEARNING", "ADAPTIVE LEARNING", "FLEXIBLE LEARNING"].map((t) => (
                  <span key={t} className="rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5">
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
                Adaptive <span className="text-sky-600">NCLEX-RN</span> &amp; <span className="text-sky-600">NCLEX-PN</span> Practice Tests
              </h2>
              <p className="text-gray-600 text-center">
                Prepare smarter with {APP_NAME}&apos;s adaptive practice tests designed for both NCLEX-RN and
                NCLEX-PN.
              </p>
            </div>

            <div className="rounded-xl p-4 mb-4 flex flex-col gap-4" style={{ background: "linear-gradient(to bottom right, #eaffa0, #ffd2c0)" }}>
              <div className="flex gap-3">
                <span className="text-amber-500">⚡</span>
                <p className="text-sm text-gray-700">
                  Our tests adjust to your strengths and weaknesses, simulating the real exam experience for
                  targeted, personalized practice.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600">📊</span>
                <p className="text-sm text-gray-700">
                  Build confidence and master core nursing concepts to get NCLEX-ready faster — anytime, anywhere.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-600">📱</span>
                <p className="text-sm text-gray-700">
                  Access your personalized study dashboard on any device with full synchronization.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <a href="pages/exams/nclex-rn" className="rounded-lg bg-gray-900 text-white px-5 py-3 font-semibold text-center">NCLEX RN →</a>
              <a href="pages/exams/nclex-pn" className="rounded-lg bg-gray-900 text-white px-5 py-3 font-semibold text-center">NCLEX PN →</a>
            </div>
          </div>

          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-4">
              <Image
                src="/images/home/fotoc.webp"
                alt="Adaptive NCLEX Practice Test Interface"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white text-gray-900 text-xs font-semibold px-3 py-1.5">
                SIMULATED EXAM ENVIRONMENT
              </span>
            </div>
            <div className="text-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full max-w-sm mx-auto rounded-lg border-2 border-purple-300 px-4 py-3 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact section goes here — add as a separate component */}
      
    </main>
  );
}