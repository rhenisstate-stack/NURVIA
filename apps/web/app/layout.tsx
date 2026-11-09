import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "NURVIA — Your Path to Nursing Confidence",
  description:
    "Comprehensive nursing education and exam-preparation platform for ATI, HESI, NCLEX-RN, and NCLEX-PN.",
  icons: {
    icon: "/brand/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-brand-teal selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
