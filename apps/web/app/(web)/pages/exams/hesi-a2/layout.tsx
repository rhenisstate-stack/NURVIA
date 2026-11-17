import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: "HESI A2 Practice Exams",
  description: `${APP_NAME} HESI A2 practice exams covering every section of the admission assessment, with detailed explanations.`,
  alternates: { canonical: "/pages/exams/hesi-a2" },
  openGraph: { title: "HESI A2 Practice Exams", url: "/pages/exams/hesi-a2" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}