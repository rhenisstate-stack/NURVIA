import { PublicShell } from '@/components/layout/public-shell';
import type { Metadata } from 'next';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import Whastapp from '@/app/(web)/includes/partials/Whastapp';
import { APP_NAME } from '@/lib/config/config';
import Tawkto from "@/app/(web)/includes/partials/Tawkto";
import { SITE_URL, SITE_LINKS } from '@/lib/config/siteLinks';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} – NCLEX-RN/PN, TEAS 7, HESI A2 Exam Prep`,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_NAME} is a premier online platform for nursing exam preparation: NCLEX-RN/PN, TEAS 7, HESI A2, and RN and LPN Q-Banks.`,
  applicationName: APP_NAME,
  robots: { index: true, follow: true },
  openGraph: { siteName: APP_NAME, type: "website", url: SITE_URL, title: APP_NAME },
};

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    alternateName: APP_NAME.replace(/\s/g, ""),
    url: SITE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SITE_LINKS.map((l, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: l.name,
      url: `${SITE_URL}${l.href}`,
    })),
  },
];

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      <main className="flex-grow px-0 sm:px-0 lg:px-0">{children}</main>
      <ScrollToTopButton />
      <Whastapp />
      <Tawkto />
    </PublicShell>
  );
}
