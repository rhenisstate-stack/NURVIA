"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/config/config";
import Annex from "@/app/(web)/auth/modals/Annex";

const LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact Us" },
  { href: "/docs", label: "Documentation" },
];

export default function Footer() {
  const [annexOpen, setAnnexOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-red-200 bg-red-100 text-sm text-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 sm:px-6 md:flex-row md:justify-between">
          <p className="font-bold text-center md:text-left">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() => setAnnexOpen(true)}
            className="flex items-center gap-2 text-xs opacity-70 transition hover:text-red-700 hover:opacity-100"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Powered By {APP_NAME} Team
          </button>
          
          <Link href="/explore">Site Directory</Link>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="whitespace-nowrap opacity-80 transition hover:text-red-700 hover:opacity-100"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

      <Annex isOpen={annexOpen} onClose={() => setAnnexOpen(false)} />
    </>
  );
}