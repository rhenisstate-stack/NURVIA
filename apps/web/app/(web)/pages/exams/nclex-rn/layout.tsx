import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: "NCLEX-RN Practice Tests",
  description: `${APP_NAME} NCLEX-RN practice tests with realistic questions and detailed rationales to help you pass the licensure exam.`,
  alternates: { canonical: "/pages/exams/nclex-rn" },
  openGraph: { title: "NCLEX-RN Practice Tests", url: "/pages/exams/nclex-rn" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}