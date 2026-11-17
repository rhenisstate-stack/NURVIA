import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: "NCLEX-PN Practice Questions",
  description: `${APP_NAME} NCLEX-PN practice questions and exit exam preparation for LPN/LVN students.`,
  alternates: { canonical: "/pages/exams/nclex-pn" },
  openGraph: { title: "NCLEX-PN Practice Questions", url: "/pages/exams/nclex-pn" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}