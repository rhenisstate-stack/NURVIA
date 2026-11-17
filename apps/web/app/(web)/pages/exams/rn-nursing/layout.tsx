import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: "RN Nursing Practice Exams",
  description: `${APP_NAME} RN nursing practice exams, study guides and realistic questions to prepare for nursing coursework and certification.`,
  alternates: { canonical: "/pages/exams/rn-nursing" },
  openGraph: { title: "RN Nursing Practice Exams", url: "/pages/exams/rn-nursing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}