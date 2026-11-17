import { PublicShell } from '@/components/layout/public-shell';

export default function ContactUsPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
          Support &amp; Inquiries
        </span>
        <h1 className="mt-2 text-3xl font-bold text-[#142B4A]">Contact NURVIA</h1>
        <p className="mt-4 text-base text-slate-600">
          Need help with your nursing program access, subscription, or institutional cohort? Sign in
          to open an authenticated support ticket or reach out to our learner support team.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm font-semibold text-[#142B4A]">Learner &amp; Institutional Support</p>
          <p className="mt-1 text-sm text-slate-600">
            Authenticated learners can submit support messages directly from Account Settings.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
