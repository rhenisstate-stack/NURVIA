import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: "ATI TEAS 7 Practice Tests",
  description: `${APP_NAME} TEAS 7 practice exams, study guides and realistic questions to prepare for nursing school admission.`,
  alternates: { canonical: "/pages/exams/ati-teas" },
  openGraph: { title: "ATI TEAS 7 Practice Tests", url: "/pages/exams/ati-teas" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}