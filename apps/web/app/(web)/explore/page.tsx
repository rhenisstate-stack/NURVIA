import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/config/config";
import { SITE_LINKS, SITE_URL } from "@/lib/config/siteLinks";

export const metadata: Metadata = {
  title: `Explore ${APP_NAME} – NCLEX, TEAS, HESI, RN & LPN Exams`,
  description: `Quick links to ${APP_NAME}: NCLEX-RN, NCLEX-PN, ATI TEAS 7, HESI A2, RN and LPN exams, pricing, sign in and registration.`,
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SITE_LINKS.map((l, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: l.name,
      description: l.description,
      url: `${SITE_URL}${l.href}`,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold mb-2">Explore {APP_NAME}</h1>
      <p className="mb-8 opacity-80">Everything you need for nursing exam success, in one place.</p>
      <nav aria-label="Site directory">
        <ul className="divide-y divide-gray-300/50">
          {SITE_LINKS.map((l) => (
            <li key={l.href} className="py-4">
              <Link href={l.href} className="text-xl font-semibold text-blue-600 hover:underline">
                {l.name}
              </Link>
              <p className="mt-1 text-sm opacity-80">{l.description}</p>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}