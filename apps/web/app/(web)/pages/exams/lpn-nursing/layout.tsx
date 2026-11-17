import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: "LPN Nursing Practice Exams",
  description: `${APP_NAME} LPN nursing practice exams, study guides and realistic questions to prepare for your licensure and nursing program.`,
  alternates: { canonical: "/pages/exams/lpn-nursing" },
  openGraph: { title: "LPN Nursing Practice Exams", url: "/pages/exams/lpn-nursing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}