export interface SampleQuestion {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  modeBadge: string;
  topic: string;
  stem: string;
  options: {
    letter: string;
    text: string;
    isCorrect: boolean;
  }[];
  rationale: string;
  clinicalTip: string;
}

export interface StudentPassRecord {
  id: string;
  studentName: string;
  examCode: string;
  examName: string;
  date: string;
  status: "NCLEX-RN - PASSED" | "NCLEX-PN - PASSED" | "ATI - LEVEL 3" | "HESI - 900+ COMPLETED";
  badgeVariant: "emerald" | "teal" | "blue";
}

export interface StudentTestimonial {
  id: string;
  displayName: string;
  examTrack: "NCLEX-RN" | "NCLEX-PN" | "ATI" | "HESI";
  resultStatus: "Passed" | "Completed";
  testimonial: string;
  examDate?: string;
  isVerified: boolean;
  avatarUrl?: string;
  scoreOrLevel?: string;
}

export interface StudySetItem {
  id: string;
  title: string;
  slug: string;
  category: "FUNDAMENTALS" | "CORE SERIES" | "SPECIALTIES" | "NURSING MATH" | "EXIT EXAM" | "NCLEX RN" | "Nursing Practice" | "LPN ATI Maternity" | "RN Regular Foundations of Nursing" | "RN Regular Microbiology";
  pathway: "RN" | "PN_LPN" | "RN_Exit" | "PN_Exit" | "All";
  examTrack: "ATI" | "HESI" | "NCLEX" | "Regular";
  badge: "Free" | "Included" | "Proctored";
  rating: number;
  reviewsCount: number;
  viewsCount: string;
  questionCount: number;
  hasRationales: boolean;
  hasNgnFormat: boolean;
  description: string;
  studentQuote?: string;
  previewQuestion?: {
    stem: string;
    options: string[];
    correctIndex: number;
    rationale: string;
  };
}

// Hero Quick Practice Sample Questions
export const heroPracticeQuestions: SampleQuestion[] = [
  {
    id: "q-hero-01",
    questionNumber: 1,
    totalQuestions: 3,
    modeBadge: "Learn-as-you-go mode",
    topic: "PHARMACOLOGY",
    stem: "A nurse is caring for a client who has been prescribed warfarin. The client asks why frequent blood tests are necessary. Which response by the nurse is most appropriate?",
    options: [
      {
        letter: "A",
        text: "To check your blood sugar levels regularly",
        isCorrect: false,
      },
      {
        letter: "B",
        text: "To monitor the time it takes for your blood to clot and adjust the dose accordingly",
        isCorrect: true,
      },
      {
        letter: "C",
        text: "To ensure your kidneys are functioning properly",
        isCorrect: false,
      },
      {
        letter: "D",
        text: "To check for any signs of infection in the blood",
        isCorrect: false,
      },
    ],
    rationale:
      "Warfarin is a vitamin K antagonist oral anticoagulant. Frequent monitoring of Prothrombin Time (PT) and International Normalized Ratio (INR) is critical to balance antithrombotic efficacy with bleeding risk (target therapeutic INR typically 2.0 to 3.0 for DVT/PE or atrial fibrillation).",
    clinicalTip:
      "Clinical judgment reminder: Warfarin does not alter blood glucose, renal clearance, or leukocyte counts. Reassure the patient while emphasizing consistency in dietary vitamin K intake.",
  },
  {
    id: "q-hero-02",
    questionNumber: 2,
    totalQuestions: 3,
    modeBadge: "Learn-as-you-go mode",
    topic: "CARDIOVASCULAR / ATI PHARM",
    stem: "A nurse is preparing to administer digoxin 0.25 mg PO to an adult client diagnosed with heart failure. Which clinical assessment is a priority before administering this medication?",
    options: [
      {
        letter: "A",
        text: "Measure the client's blood pressure in both arms",
        isCorrect: false,
      },
      {
        letter: "B",
        text: "Auscultate the apical pulse rate for one full minute",
        isCorrect: true,
      },
      {
        letter: "C",
        text: "Check the client's capillary blood glucose level",
        isCorrect: false,
      },
      {
        letter: "D",
        text: "Check the client's most recent sodium laboratory value",
        isCorrect: false,
      },
    ],
    rationale:
      "Digoxin is a cardiac glycoside with positive inotropic and negative chronotropic effects. The apical pulse must be counted for 60 seconds prior to administration. If the rate is < 60 bpm in adults, the dose must be withheld and the prescriber notified to prevent severe bradycardia or complete heart block.",
    clinicalTip:
      "Hypokalemia (potassium < 3.5 mEq/L) potentiates digoxin toxicity; always assess serum potassium along with apical heart rate.",
  },
  {
    id: "q-hero-03",
    questionNumber: 3,
    totalQuestions: 3,
    modeBadge: "Learn-as-you-go mode",
    topic: "CLINICAL JUDGMENT / NGN MED-SURG",
    stem: "A nurse on an inpatient surgical unit cares for a client on postoperative Day 2 following total knee arthroplasty who develops acute-onset chest pain and tachypnea. Which clinical findings support a hypothesis of Pulmonary Embolism (PE) rather than Atelectasis?",
    options: [
      {
        letter: "A",
        text: "Sudden sharp pleuritic chest pain and unexplained tachycardia (HR 120)",
        isCorrect: true,
      },
      {
        letter: "B",
        text: "Gradual low-grade temperature elevation (38.0°C) responsive to incentive spirometry",
        isCorrect: false,
      },
      {
        letter: "C",
        text: "Diminished breath sounds at bilateral bases with dry nonproductive cough",
        isCorrect: false,
      },
      {
        letter: "D",
        text: "Decreased urine output with clear bilateral lung sounds",
        isCorrect: false,
      },
    ],
    rationale:
      "Acute pulmonary embolism presents characteristically with sudden-onset sharp pleuritic chest pain, unexplained tachycardia, tachypnea, and profound hypoxia refractory to low-flow oxygen in high-risk postoperative orthopedic patients. Atelectasis tends to develop gradually with low-grade fever responsive to spirometry.",
    clinicalTip:
      "NGN Recognize & Analyze Cues: Orthopedic surgery carries high Virchow's triad risk. Sudden dyspnea + tachycardia = emergency PE protocol until ruled out.",
  },
];

// Student Pass Report Carousel Data
export const studentPassRecords: StudentPassRecord[] = [
  {
    id: "pass-01",
    studentName: "Octavio O.",
    examCode: "NCLEX-PN",
    examName: "The National Council Licensure Examination for Practical Nurses",
    date: "22 April 2026",
    status: "NCLEX-PN - PASSED",
    badgeVariant: "emerald",
  },
  {
    id: "pass-02",
    studentName: "Brittany P.",
    examCode: "NCLEX-RN",
    examName: "The National Council Licensure Examination for Registered Nurses",
    date: "20 April 2026",
    status: "NCLEX-RN - PASSED",
    badgeVariant: "emerald",
  },
  {
    id: "pass-03",
    studentName: "Hershe Ann M.",
    examCode: "NCLEX-PN",
    examName: "The National Council Licensure Examination for Practical Nurses",
    date: "24 April 2026",
    status: "NCLEX-PN - PASSED",
    badgeVariant: "emerald",
  },
  {
    id: "pass-04",
    studentName: "Isabella T.",
    examCode: "NCLEX-RN",
    examName: "The National Council Licensure Examination for Registered Nurses",
    date: "25 April 2026",
    status: "NCLEX-RN - PASSED",
    badgeVariant: "emerald",
  },
  {
    id: "pass-05",
    studentName: "Marcus D.",
    examCode: "ATI COMPREHENSIVE",
    examName: "ATI RN Comprehensive Predictor Examination 2026",
    date: "27 April 2026",
    status: "ATI - LEVEL 3",
    badgeVariant: "teal",
  },
  {
    id: "pass-06",
    studentName: "Aaliyah K.",
    examCode: "HESI RN EXIT",
    examName: "HESI RN Comprehensive Exit Assessment V2",
    date: "28 April 2026",
    status: "HESI - 900+ COMPLETED",
    badgeVariant: "blue",
  },
];

// Illustrative Sample Testimonials for the Automatic Carousel (Phase D)
export const sampleStudentTestimonials: StudentTestimonial[] = [
  {
    id: "test-01",
    displayName: "Octavio O.",
    examTrack: "NCLEX-PN",
    resultStatus: "Passed",
    scoreOrLevel: "First Attempt",
    examDate: "April 2026",
    isVerified: true,
    testimonial:
      "The NGN case study rationales taught me how to recognize clinical cues instead of second-guessing. The interface felt identical to exam day.",
  },
  {
    id: "test-02",
    displayName: "Brittany P.",
    examTrack: "NCLEX-RN",
    resultStatus: "Passed",
    scoreOrLevel: "85 Questions",
    examDate: "April 2026",
    isVerified: true,
    testimonial:
      "NURVIA's prioritization breakdowns in Med-Surg and Pharmacology were the exact difference-maker I needed. Shut off at 85 questions!",
  },
  {
    id: "test-03",
    displayName: "Hershe Ann M.",
    examTrack: "NCLEX-PN",
    resultStatus: "Passed",
    scoreOrLevel: "Passed with Confidence",
    examDate: "April 2026",
    isVerified: true,
    testimonial:
      "The Socratic tutor mode forced me to understand why each distractor was clinically unsafe. Walked into testing center calm and prepared.",
  },
  {
    id: "test-04",
    displayName: "Marcus D.",
    examTrack: "ATI",
    resultStatus: "Completed",
    scoreOrLevel: "Level 3 · 94.6% Predictor",
    examDate: "April 2026",
    isVerified: true,
    testimonial:
      "Scored Level 3 on my Comprehensive Predictor. The ATI-focused clinical judgment scenarios mirror the exact difficulty of proctored finals.",
  },
  {
    id: "test-05",
    displayName: "Isabella T.",
    examTrack: "NCLEX-RN",
    resultStatus: "Passed",
    scoreOrLevel: "Passed First Try",
    examDate: "April 2026",
    isVerified: true,
    testimonial:
      "The dosage calculation modules and fluid/electrolyte guides eliminated my test anxiety. The step-by-step rationales are unmatched.",
  },
  {
    id: "test-06",
    displayName: "Aaliyah K.",
    examTrack: "HESI",
    resultStatus: "Completed",
    scoreOrLevel: "Score: 982 · Exit Exam",
    examDate: "April 2026",
    isVerified: true,
    testimonial:
      "Scored 982 on my HESI Exit! The pharmacology rationales break down high-risk mechanisms so you understand the physiological safety net.",
  },
  {
    id: "test-07",
    displayName: "Daniel R.",
    examTrack: "NCLEX-RN",
    resultStatus: "Passed",
    scoreOrLevel: "85 Questions",
    examDate: "May 2026",
    isVerified: true,
    testimonial:
      "Passed in 85 questions. The question formats matched the real NGN test screen perfectly. Best investment in nursing school.",
  },
  {
    id: "test-08",
    displayName: "Maya S.",
    examTrack: "NCLEX-PN",
    resultStatus: "Passed",
    scoreOrLevel: "First Attempt Pass",
    examDate: "May 2026",
    isVerified: true,
    testimonial:
      "Practicing with timed simulation mode built the stamina and time-management pacing I needed. Could not have done it without NURVIA.",
  },
];

// Study-Set Cards for Homepage & Study Library
export const initialStudySets: StudySetItem[] = [
  {
    id: "set-ati-fund",
    title: "ATI Fundamentals",
    slug: "ati-fundamentals",
    category: "FUNDAMENTALS",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.8,
    reviewsCount: 3783,
    viewsCount: "31K views",
    questionCount: 750,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Foundational nursing concepts — patient safety, infection control, vital signs, and the nursing process. Practice with rationale-based questions matching ATI's content outline.",
    studentQuote: "Mastered asepsis and prioritization before my first clinical rotation!",
    previewQuestion: {
      stem: "A nurse is performing hand hygiene before entering an isolation room. What is the minimum duration for lathering hands with antimicrobial soap under running water?",
      options: ["5 seconds", "10 seconds", "15 to 20 seconds", "45 seconds"],
      correctIndex: 2,
      rationale: "The CDC and WHO recommend scrubbing hands vigorously with friction for at least 15 to 20 seconds to effectively dislodge transient pathogens.",
    },
  },
  {
    id: "set-ati-medsurg",
    title: "ATI Adult Medical-Surgical",
    slug: "ati-adult-med-surg",
    category: "CORE SERIES",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.7,
    reviewsCount: 2290,
    viewsCount: "54K views",
    questionCount: 1200,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Care of adult patients across major body systems — cardiovascular, respiratory, renal, endocrine, and GI. One of the most heavily weighted proctored exams.",
    studentQuote: "Questions were very similar to the actual proctored test!",
    previewQuestion: {
      stem: "A client with acute decompensated heart failure presents with severe dyspnea, bilateral pulmonary crackles, and SpO2 87%. Which nursing action is the immediate priority?",
      options: [
        "Place the client in high-Fowler's position and administer supplemental oxygen",
        "Infuse a 500 mL normal saline IV fluid bolus",
        "Encourage oral fluids to improve hydration",
        "Obtain a routine 12-lead ECG",
      ],
      correctIndex: 0,
      rationale: "High-Fowler's positioning reduces venous return (preload) and promotes maximal lung excursion, while oxygen relieves life-threatening hypoxia.",
    },
  },
  {
    id: "set-ati-pharm",
    title: "ATI Pharmacology",
    slug: "ati-pharmacology",
    category: "CORE SERIES",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.8,
    reviewsCount: 1857,
    viewsCount: "51K views",
    questionCount: 980,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Drug classifications, mechanisms of action, side effects, and nursing implications for medication administration. Organized by drug class.",
    studentQuote: "The rationale breakdowns helped me memorize high-risk black box warnings easily.",
    previewQuestion: {
      stem: "A client newly prescribed furosemide 40 mg daily reports muscle cramps and weakness. Which serum electrolyte imbalance does the nurse anticipate?",
      options: ["Hypercalcemia", "Hypokalemia", "Hypernatremia", "Hypermagnesemia"],
      correctIndex: 1,
      rationale: "Furosemide is a loop diuretic that causes substantial urinary excretion of potassium, leading to hypokalemia, muscle weakness, and cardiac arrhythmias.",
    },
  },
  {
    id: "set-ati-dosage",
    title: "ATI Dosage Calculations",
    slug: "ati-dosage-calculations",
    category: "NURSING MATH",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.8,
    reviewsCount: 261,
    viewsCount: "51K views",
    questionCount: 450,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Medication math — oral and IV dosages, drip rates, unit conversions, and weight-based dosing. Step-by-step worked solutions for every problem.",
    studentQuote: "Scored 100% on my clinical dosage calculation threshold exam on the first attempt!",
    previewQuestion: {
      stem: "Order: Potassium chloride 20 mEq in 250 mL D5W over 2 hours. What is the hourly infusion rate in mL/hr?",
      options: ["100 mL/hr", "125 mL/hr", "150 mL/hr", "250 mL/hr"],
      correctIndex: 1,
      rationale: "Total volume (250 mL) divided by total time (2 hours) = 125 mL/hr.",
    },
  },
  {
    id: "set-ati-maternal",
    title: "ATI Maternal Newborn",
    slug: "ati-maternal-newborn",
    category: "SPECIALTIES",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.6,
    reviewsCount: 1123,
    viewsCount: "37K views",
    questionCount: 620,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Antepartum, intrapartum, postpartum, and newborn care, including pregnancy and labor complications. Organized by stage of the maternity cycle.",
    studentQuote: "Clear rationales for fetal heart rate decelerations made VEAL CHOP click instantly.",
    previewQuestion: {
      stem: "A nurse notes late decelerations on the electronic fetal monitoring strip. What is the immediate priority intervention?",
      options: [
        "Reposition the mother to left-lateral position and administer high-flow oxygen",
        "Administer IV oxytocin to hasten labor progression",
        "Place the mother in supine Trendelenburg position",
        "Prepare the client immediately for general anesthesia",
      ],
      correctIndex: 0,
      rationale: "Late decelerations indicate uteroplacental insufficiency. Turning the client laterally alleviates aortocaval compression and improves placental perfusion.",
    },
  },
  {
    id: "set-ati-pediatrics",
    title: "ATI Pediatrics",
    slug: "ati-pediatrics",
    category: "SPECIALTIES",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.7,
    reviewsCount: 1329,
    viewsCount: "36K views",
    questionCount: 590,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Nursing Care of Children — growth and development milestones, pediatric illness, and family-centered care by age group.",
    studentQuote: "Developmental milestone tables and vaccine schedules were spot on.",
    previewQuestion: {
      stem: "A 4-year-old child is hospitalized with suspected acute epiglottitis. Which action is strictly contraindicated?",
      options: [
        "Inspecting the child's throat with a tongue blade",
        "Allowing the child to sit upright in tripod position",
        "Keeping emergency airway equipment at bedside",
        "Administering humidified oxygen as tolerated",
      ],
      correctIndex: 0,
      rationale: "Inserting a tongue blade into the oropharynx can trigger severe laryngospasm and immediate complete airway occlusion.",
    },
  },
  {
    id: "set-ati-mental",
    title: "ATI Mental Health",
    slug: "ati-mental-health",
    category: "SPECIALTIES",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.7,
    reviewsCount: 1933,
    viewsCount: "16K views",
    questionCount: 540,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Psychiatric disorders, therapeutic communication, crisis intervention, and legal/ethical issues in psychiatric care.",
    studentQuote: "Therapeutic communication questions helped me identify non-defensive responses.",
    previewQuestion: {
      stem: "A client diagnosed with major depressive disorder states, 'Nothing matters anymore. Everyone would be better off without me.' What is the nurse's priority response?",
      options: [
        "'Are you having thoughts of killing yourself?'",
        "'Things will get better once your medication starts working.'",
        "'Why do you feel that way about your family?'",
        "'Let us focus on positive activities for today.'",
      ],
      correctIndex: 0,
      rationale: "Direct, unambiguous assessment of suicidal ideation and intent is the nurse's ethical and clinical priority when warning signs are verbalized.",
    },
  },
  {
    id: "set-ati-comm",
    title: "ATI Community Health",
    slug: "ati-community-health",
    category: "SPECIALTIES",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.9,
    reviewsCount: 2827,
    viewsCount: "40K views",
    questionCount: 480,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Population health, epidemiology, health promotion, and care of vulnerable populations outside the hospital.",
    studentQuote: "Level 3 achieved! Primary vs secondary vs tertiary prevention was crystal clear.",
    previewQuestion: {
      stem: "A public health nurse organizes a blood pressure screening booth at a local senior community center. This intervention represents which level of prevention?",
      options: ["Primary prevention", "Secondary prevention", "Tertiary prevention", "Quaternary prevention"],
      correctIndex: 1,
      rationale: "Secondary prevention involves early detection and screening of asymptomatic individuals to halt disease progression.",
    },
  },
  {
    id: "set-ati-lead",
    title: "ATI Leadership",
    slug: "ati-leadership",
    category: "CORE SERIES",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.8,
    reviewsCount: 3416,
    viewsCount: "23K views",
    questionCount: 510,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Delegation, prioritization, and management principles nurses apply in clinical settings.",
    studentQuote: "The 5 Rights of Delegation practice scenarios are the best in the market.",
    previewQuestion: {
      stem: "Which task is most appropriate for a registered nurse to delegate to an unlicensed assistive personnel (UAP)?",
      options: [
        "Measuring and recording intake and output on a stable postoperative client",
        "Assessing surgical dressing drainage on a client 2 hours post-op",
        "Educating a newly admitted client regarding incentive spirometry",
        "Administering PRN sublingual nitroglycerin",
      ],
      correctIndex: 0,
      rationale: "UAPs may perform routine, non-invasive tasks on stable clients (e.g. measuring I&O, vital signs, hygiene). Assessment, teaching, and medication administration cannot be delegated.",
    },
  },
  {
    id: "set-ati-nutr",
    title: "ATI Nutrition",
    slug: "ati-nutrition",
    category: "FUNDAMENTALS",
    pathway: "RN",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.9,
    reviewsCount: 235,
    viewsCount: "12K views",
    questionCount: 420,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Therapeutic diets, nutrient deficiencies, enteral/parenteral nutrition, and patient education.",
    studentQuote: "High-protein renal diets vs cardiac diets questions were exceptionally helpful.",
    previewQuestion: {
      stem: "A client diagnosed with chronic kidney disease (CKD) stage 4 requires dietary counseling. Which food choice should the nurse recommend limiting due to high potassium content?",
      options: ["Applesauce", "Bananas and cantaloupe", "White rice", "Green beans"],
      correctIndex: 1,
      rationale: "Bananas, cantaloupe, potatoes, and citrus fruits are high in potassium and must be restricted in advanced renal failure to avoid hyperkalemia.",
    },
  },
  {
    id: "set-ati-predictor",
    title: "ATI Comprehensive Predictor",
    slug: "ati-comprehensive-predictor",
    category: "EXIT EXAM",
    pathway: "RN_Exit",
    examTrack: "ATI",
    badge: "Free",
    rating: 4.9,
    reviewsCount: 4192,
    viewsCount: "41K views",
    questionCount: 1500,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Cumulative exam covering every content area above — taken near graduation to benchmark NCLEX readiness.",
    studentQuote: "Scored 99% predicted probability of passing NCLEX on my graduation exit exam!",
    previewQuestion: {
      stem: "A nurse is prioritizing care for 4 admitted clients. Which client should the nurse assess first?",
      options: [
        "A client with COPD who has an SpO2 of 91% on 2 L/min nasal cannula",
        "A client with a new tracheostomy who has thick secretions and audible rhonchi",
        "A client with diabetes mellitus whose fasting blood glucose is 168 mg/dL",
        "A client with a tibia fracture reporting pain rated 7/10 despite oral acetaminophen",
      ],
      correctIndex: 1,
      rationale: "Airway takes precedence over all other physiological needs. A tracheostomy client with audible rhonchi and secretions requires immediate airway assessment and suctioning.",
    },
  },
  // Additional study sets from Learner Library screenshot (media_1794209744175_4438dfcc.jpg)
  {
    id: "set-nclex-ready-1",
    title: "Nclex-Rn Readiness Test 1",
    slug: "nclex-rn-readiness-test-1",
    category: "NCLEX RN",
    pathway: "RN",
    examTrack: "NCLEX",
    badge: "Included",
    rating: 5.0,
    reviewsCount: 1298,
    viewsCount: "68K views",
    questionCount: 150,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Full computerized adaptive benchmark simulating NCLEX-RN test plan with Next Generation clinical judgment item types.",
    studentQuote: "My entire cohort used this and we all passed! 🎉",
  },
  {
    id: "set-hesi-adult-health",
    title: "HESI RN Adult Health Proctored Exam",
    slug: "hesi-rn-adult-health",
    category: "Nursing Practice",
    pathway: "RN",
    examTrack: "HESI",
    badge: "Included",
    rating: 4.9,
    reviewsCount: 3214,
    viewsCount: "58K views",
    questionCount: 57,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Proctored HESI specialty exam for adult medical-surgical nursing including fluid & electrolytes, cardiovascular, and surgical nursing.",
    studentQuote: "Questions were very similar to the actual test 🎯",
  },
  {
    id: "set-lpn-ati-maternity",
    title: "ATI PN Maternal Newborn 2026 Proctored Exam",
    slug: "ati-pn-maternal-newborn-2026",
    category: "LPN ATI Maternity",
    pathway: "PN_LPN",
    examTrack: "ATI",
    badge: "Included",
    rating: 5.0,
    reviewsCount: 1298,
    viewsCount: "29K views",
    questionCount: 60,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Practical nursing maternity assessment focused on prenatal care, labor monitoring, postpartum assessment, and newborn safety.",
    studentQuote: "My entire cohort used this and we all passed! 🎉",
  },
  {
    id: "set-rn-comp-pred-v2",
    title: "RN Comprehensive Predictor 2026 Proctored Exam V2",
    slug: "rn-comprehensive-predictor-2026-v2",
    category: "EXIT EXAM",
    pathway: "RN_Exit",
    examTrack: "ATI",
    badge: "Proctored",
    rating: 4.8,
    reviewsCount: 1932,
    viewsCount: "62K views",
    questionCount: 180,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Comprehensive multi-specialty benchmark exam with detailed topic analytics and NCLEX probability estimation.",
    studentQuote: "Comprehensive and well-organized study material ⭐",
  },
  {
    id: "set-bsn-206-foundations",
    title: "BSN 206 Foundations Of Nursing Fundamentals Proctored Exam",
    slug: "bsn-206-foundations-of-nursing",
    category: "RN Regular Foundations of Nursing",
    pathway: "RN",
    examTrack: "Regular",
    badge: "Included",
    rating: 4.9,
    reviewsCount: 3214,
    viewsCount: "44K views",
    questionCount: 75,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Academic course final preparation for BSN semester 1 foundations covering aseptic technique, vitals, mobility, and ethics.",
    studentQuote: "The best investment for my nursing education 💪",
  },
  {
    id: "set-microbiology-proctored",
    title: "Microbiology Proctored Exam",
    slug: "microbiology-proctored-exam",
    category: "RN Regular Microbiology",
    pathway: "RN",
    examTrack: "Regular",
    badge: "Included",
    rating: 4.9,
    reviewsCount: 2641,
    viewsCount: "38K views",
    questionCount: 104,
    hasRationales: true,
    hasNgnFormat: true,
    description:
      "Pre-nursing science course exam covering pathogenic bacteria, viruses, antibiotic resistance, immunology, and lab diagnostics.",
    studentQuote: "Questions were very similar to the actual test ⭐",
  },
];
