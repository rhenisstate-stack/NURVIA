// src/app/(web)/pages/(more)/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn more about our platform, mission, and the team behind it.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-white py-24 px-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/15 text-sm font-semibold tracking-wide uppercase">
                        Our Story
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
                        Built for Students.<br className="hidden sm:block" /> Driven by Results.
                    </h1>
                    <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                        We&apos;re on a mission to make exam preparation smarter, more accessible, and
                        genuinely effective — for every student, everywhere.
                    </p>
                </div>
            </section>

            {/* ── Mission ── */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-4">Our Mission</h2>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                            We believe every student deserves access to high-quality exam practice tools —
                            not just those who can afford expensive prep courses or tutors.
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Our platform combines adaptive assessments, AI-powered guidance, and
                            real-time performance analytics to give you the edge you need to succeed.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { emoji: "🎯", label: "Focused Practice" },
                            { emoji: "🤖", label: "AI Assistance" },
                            { emoji: "📊", label: "Smart Analytics" },
                            { emoji: "⚡", label: "Real-time Feedback" },
                        ].map(({ emoji, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center"
                            >
                                <span className="text-3xl">{emoji}</span>
                                <span className="text-sm font-bold">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="bg-slate-50 dark:bg-slate-900 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-center mb-12">By the Numbers</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { value: "50K+", label: "Students" },
                            { value: "10K+", label: "Practice Questions" },
                            { value: "98%", label: "Satisfaction Rate" },
                            { value: "24/7", label: "AI Support" },
                        ].map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent mb-1">
                                    {value}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-center mb-12">What We Stand For</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {[
                            {
                                emoji: "🌍",
                                title: "Accessibility",
                                desc: "Quality education tools should be available to everyone, regardless of background or budget.",
                            },
                            {
                                emoji: "🔬",
                                title: "Evidence-Based",
                                desc: "Every feature is grounded in learning science — spaced repetition, active recall, and more.",
                            },
                            {
                                emoji: "🤝",
                                title: "Student-First",
                                desc: "We listen to our users and ship improvements fast. Your success is our only metric.",
                            },
                        ].map(({ emoji, title, desc }) => (
                            <div
                                key={title}
                                className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="text-4xl mb-4">{emoji}</div>
                                <h3 className="text-lg font-black mb-2">{title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Team ── */}
            <section className="bg-slate-50 dark:bg-slate-900 py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-center mb-4">Meet the Team</h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 mb-12 max-w-xl mx-auto">
                        A small, passionate team of educators, engineers, and designers committed to
                        transforming how students prepare for exams.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { initials: "SK", name: "Skew Blanc", role: "Founder & CEO" },
                            { initials: "AM", name: "Alex M.", role: "Lead Engineer" },
                            { initials: "JR", name: "Jamie R.", role: "Head of Design" },
                            { initials: "TC", name: "Taylor C.", role: "Content Lead" },
                        ].map(({ initials, name, role }) => (
                            <div key={name} className="flex flex-col items-center text-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center text-xl font-black shadow-lg">
                                    {initials}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-black mb-4">Ready to Start?</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Join thousands of students already using our platform to ace their exams.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/auth/register"
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/pages/contact"
                            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
}