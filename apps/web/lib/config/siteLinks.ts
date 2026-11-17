export const SITE_URL = (
  process.env.SKEW_LINE_APP_DOMAIN || "https://nurvia-black.vercel.app"
).replace(/\/$/, "");

export interface SiteLink {
  name: string;
  description: string;
  href: string;
}

export const SITE_LINKS: SiteLink[] = [
  { name: "RN Nursing Exams", description: "Practice exams and Q-Banks for RN students: Med-Surg, Fundamentals, Maternal-Newborn, Mental Health and more.", href: "/rn-nursing" },
  { name: "NCLEX-RN", description: "Realistic NCLEX-RN and Next Generation NCLEX-style questions with detailed rationales.", href: "/pages/exams/nclex-rn" },
  { name: "NCLEX-PN", description: "NCLEX-PN practice questions and exit exam preparation for LPN/LVN students.", href: "/pages/exams/nclex-pn" },
  { name: "ATI TEAS 7", description: "TEAS 7 practice tests and study guides to prepare for nursing school admission.", href: "/pages/exams/ati-teas" },
  { name: "HESI A2", description: "HESI A2 practice exams covering every section of the admission assessment.", href: "/pages/exams/hesi-a2" },
  { name: "LPN Nursing Exams", description: "LPN exit exams and proctored-style assessments with answers and explanations.", href: "/pages/exams/lpn-nursing" },
  { name: "Pricing", description: "Compare subscription packages and unlock full access to all nursing exams.", href: "/pages/entrance/pricing" },
  { name: "About Us", description: "Learn about the team and mission behind our nursing exam preparation platform.", href: "/pages/about-us" },
  { name: "FAQ", description: "Answers to common questions about exams, subscriptions and study resources.", href: "/pages/faqs" },
  { name: "Sign In", description: "Log in to your account to continue practicing and track your progress.", href: "/auth/login" },
  { name: "Register", description: "Create a free account and start practicing nursing exams today.", href: "/auth/register" },
];
