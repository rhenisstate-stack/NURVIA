export const NURSING_PROGRAM_SLUGS = [
  'nclex-rn',
  'nclex-pn',
  'rn-nursing',
  'lpn-nursing',
  'ati-teas',
  'hesi-a2',
] as const;

export type NursingProgramSlug = (typeof NURSING_PROGRAM_SLUGS)[number];

export interface NursingProgramMeta {
  slug: NursingProgramSlug;
  segment: string;
  name: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  focusAreas: string[];
  dashboardHref: string;
  examEntryHref: string;
}

export const NURSING_PROGRAMS: Record<NursingProgramSlug, NursingProgramMeta> = {
  'nclex-rn': {
    slug: 'nclex-rn',
    segment: 'NCLEX_RN',
    name: 'NCLEX-RN Examination Prep',
    shortTitle: 'NCLEX-RN',
    subtitle: 'Next Generation NCLEX-RN clinical judgment and licensure readiness',
    description:
      'Practice NGN case studies, prioritization, pharmacology, and client-needs domains with detailed clinical rationales.',
    focusAreas: [
      'Management of Care & Delegation',
      'Pharmacological & Parenteral Therapies',
      'Physiological Adaptation',
      'Next Gen Clinical Judgment (CJMM)',
    ],
    dashboardHref: '/dashboards/nclex-rn',
    examEntryHref: '/web/nclex-rn/vista/exam/generic',
  },
  'nclex-pn': {
    slug: 'nclex-pn',
    segment: 'NCLEX_PN',
    name: 'NCLEX-PN Examination Prep',
    shortTitle: 'NCLEX-PN',
    subtitle: 'Practical & vocational nursing licensure exam preparation',
    description:
      'Master safe and effective care, coordinated care, basic care and comfort, and LPN/LVN scope-of-practice scenarios.',
    focusAreas: [
      'Coordinated Care & Safety',
      'Health Promotion & Maintenance',
      'Pharmacological Therapies (PN Scope)',
      'Reduction of Risk Potential',
    ],
    dashboardHref: '/dashboards/nclex-pn',
    examEntryHref: '/web/nclex-pn/vista/exam/generic',
  },
  'rn-nursing': {
    slug: 'rn-nursing',
    segment: 'RN_NURSING',
    name: 'RN Nursing School Exams',
    shortTitle: 'RN Nursing',
    subtitle: 'Course-level Q-Banks for ADN and BSN nursing students',
    description:
      'Prepare for Fundamentals, Med-Surg, Maternal-Newborn, Pediatrics, Mental Health, and Pharmacology course exams.',
    focusAreas: [
      'Adult Health / Med-Surg',
      'Maternal-Newborn & Pediatrics',
      'Mental Health Nursing',
      'Nursing Fundamentals & Pathophysiology',
    ],
    dashboardHref: '/dashboards/rn-nursing',
    examEntryHref: '/web/rn-nursing/vista/exam/generic',
  },
  'lpn-nursing': {
    slug: 'lpn-nursing',
    segment: 'LPN_NURSING',
    name: 'LPN / LVN Nursing Exams',
    shortTitle: 'LPN Nursing',
    subtitle: 'Comprehensive LPN/LVN program and exit exam preparation',
    description:
      'Build clinical confidence across practical nursing coursework, dosage calculations, and exit-exam readiness.',
    focusAreas: [
      'Practical Nursing Fundamentals',
      'Medical-Surgical Care (LPN)',
      'Dosage & IV Calculation',
      'Maternal & Pediatric Basics',
    ],
    dashboardHref: '/dashboards/lpn-nursing',
    examEntryHref: '/web/lpn-nursing/vista/exam/generic',
  },
  'ati-teas': {
    slug: 'ati-teas',
    segment: 'ATI_TEAS',
    name: 'ATI TEAS 7 Admission Prep',
    shortTitle: 'ATI TEAS 7',
    subtitle: 'Complete preparation for nursing school entrance testing',
    description:
      'Targeted practice across Reading, Mathematics, Science (Anatomy & Physiology), and English & Language Usage.',
    focusAreas: [
      'Human Anatomy & Physiology',
      'Algebra, Measurement & Data',
      'Reading Comprehension & Inference',
      'English & Language Usage',
    ],
    dashboardHref: '/dashboards/ati-teas',
    examEntryHref: '/web/ati-teas/vista/exam/generic',
  },
  'hesi-a2': {
    slug: 'hesi-a2',
    segment: 'HESI_A2',
    name: 'HESI A2 Admission Assessment',
    shortTitle: 'HESI A2',
    subtitle: 'Section-by-section mastery for nursing program admission',
    description:
      'Prepare for HESI A2 Math, Vocabulary, Reading, Grammar, Biology, Chemistry, and Anatomy & Physiology.',
    focusAreas: [
      'Anatomy & Physiology',
      'Healthcare Math & Conversions',
      'Vocabulary & Reading Comprehension',
      'Biology & Chemistry Foundations',
    ],
    dashboardHref: '/dashboards/hesi-a2',
    examEntryHref: '/web/hesi-a2/vista/exam/generic',
  },
};

export function isNursingProgramSlug(value: string): value is NursingProgramSlug {
  return (NURSING_PROGRAM_SLUGS as readonly string[]).includes(value);
}
