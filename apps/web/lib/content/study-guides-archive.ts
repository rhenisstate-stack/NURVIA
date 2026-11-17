/**
 * ARCHIVAL EXPORT ONLY — NOT AN OPERATIONAL LOCAL-FIRST MODULE.
 *
 * Preserves the 18 NURVIA-authored study guides from Phase 3.11 for safe
 * migration/export once the LexmaCasto Study Guides backend contract is provisioned.
 * Study Guides MUST remain server-driven; do NOT import this file into learner-facing
 * routes as a local fallback.
 */
import type { StudyGuideSummaryDto } from '@/lib/api-types';

export interface StudyGuideTerm {
  term: string;
  definition: string;
}

export interface StudyGuideTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface StudyGuideSection {
  heading: string;
  points: string[];
}

export interface StudyGuideRecord {
  id: string;
  slug: string;
  title: string;
  subject: string;
  pathway: 'RN' | 'PN_LPN' | 'Both';
  summary: string;
  readingMinutes: number;
  keyConcepts: string[];
  clinicalPriorities: string[];
  importantTerminology: StudyGuideTerm[];
  comparisonTable?: StudyGuideTable;
  structuredNotes: StudyGuideSection[];
  relatedTopicSlugs: string[];
  relatedCarePlanSlugs: string[];
  source: 'NURVIA Local Study Library' | 'Verified Remote Backend';
  contentVersion: string;
  publicationStatus: 'Published' | 'Draft';
}

export const STUDY_GUIDE_SUBJECTS = [
  'All',
  'Cardiac & EKG',
  'Respiratory',
  'Maternity',
  'Pediatrics',
  'Pharmacology',
  'Fundamentals',
  'Med-Surg/Renal',
  'Mental Health',
  'Dosage Calculation',
] as const;

export const LOCAL_STUDY_GUIDES: readonly StudyGuideRecord[] = [
  {
    id: 'sg-cardiac-ekg-strips',
    slug: 'ekg-rhythm-recognition-acls',
    title: 'EKG Rhythm Recognition & ACLS Priorities',
    subject: 'Cardiac & EKG',
    pathway: 'Both',
    summary: 'Master 5-step rhythm strip analysis, lethal dysrhythmias (VF, pulseless VT, asystole), and immediate nursing actions.',
    readingMinutes: 12,
    keyConcepts: [
      'Normal PR interval is 0.12–0.20 seconds; normal QRS is < 0.12 seconds.',
      'Defibrillate pulseless VT and Ventricular Fibrillation immediately; never defibrillate asystole or PEA.',
      'Atropine 0.5–1 mg IV is first-line for symptomatic sinus bradycardia.',
    ],
    clinicalPriorities: [
      'Always assess the patient (pulse, responsiveness, BP) before treating the monitor.',
      'Check serum potassium and magnesium on any new ventricular ectopy.',
    ],
    importantTerminology: [
      { term: 'Pulseless Electrical Activity (PEA)', definition: 'Organized ECG rhythm on the monitor without a palpable pulse or mechanical cardiac output.' },
      { term: 'Synchronized Cardioversion', definition: 'Timed electrical shock delivered on the R wave for unstable tachycardias with a pulse.' },
    ],
    comparisonTable: {
      title: 'Lethal & High-Risk Dysrhythmias',
      headers: ['Rhythm', 'Key ECG Feature', 'Primary Intervention'],
      rows: [
        ['Ventricular Fibrillation (VF)', 'Chaotic baseline, no P/QRS', 'Immediate CPR + Defibrillation'],
        ['Pulseless VT', 'Wide, fast regular QRS, no pulse', 'Immediate CPR + Defibrillation'],
        ['Asystole', 'Flat line (confirm in 2 leads)', 'CPR + Epinephrine (NO shock)'],
        ['Atrial Fibrillation', 'Irregularly irregular, no P waves', 'Rate/rhythm control + Anticoagulation'],
      ],
    },
    structuredNotes: [
      {
        heading: 'Five-Step Strip Interpretation',
        points: [
          'Calculate ventricular rate (300 ÷ large boxes between R waves for regular rhythms; 6-second strip × 10 for irregular).',
          'Determine regularity using R-R intervals.',
          'Verify P waves (upright in lead II, 1:1 with QRS) and measure PR interval (0.12–0.20 s).',
          'Measure QRS duration (< 0.12 s narrow; >= 0.12 s wide).',
        ],
      },
    ],
    relatedTopicSlugs: ['heart-failure-hemodynamics'],
    relatedCarePlanSlugs: ['acute-myocardial-infarction-acs', 'heart-failure-fluid-overload'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-cardiac-hf',
    slug: 'heart-failure-hemodynamics',
    title: 'Heart Failure: Left-Sided vs. Right-Sided',
    subject: 'Cardiac & EKG',
    pathway: 'Both',
    summary: 'Differentiate pulmonary congestion from systemic venous congestion and anchor diuretic/ACEi/digoxin monitoring.',
    readingMinutes: 10,
    keyConcepts: [
      'Left-sided HF backs up into the lungs: crackles, dyspnea, orthopnea, pink frothy sputum.',
      'Right-sided HF backs up into the body: JVD, peripheral edema, hepatomegaly, ascites.',
      'Report weight gain >= 2–3 lb in 24 hours or 5 lb in 1 week.',
    ],
    clinicalPriorities: [
      'Position in High-Fowler’s for acute pulmonary edema.',
      'Check apical pulse for 1 full minute before digoxin (hold if < 60 bpm in adults).',
    ],
    importantTerminology: [
      { term: 'Preload', definition: 'Volume of blood stretching the ventricles at the end of diastole.' },
      { term: 'Afterload', definition: 'Resistance the left ventricle must overcome to eject blood.' },
    ],
    structuredNotes: [
      {
        heading: 'Core Pharmacotherapy',
        points: [
          'Loop diuretics (furosemide): reduce preload; monitor potassium and creatinine.',
          'ACE inhibitors (-pril): reduce afterload; watch for dry cough, hyperkalemia, and angioedema.',
          'Beta-blockers (-olol): reduce myocardial workload; monitor HR and BP.',
        ],
      },
    ],
    relatedTopicSlugs: ['ekg-rhythm-recognition-acls'],
    relatedCarePlanSlugs: ['heart-failure-fluid-overload'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-resp-abg',
    slug: 'abg-interpretation-ventilator-care',
    title: 'ABG Interpretation & Mechanical Ventilation',
    subject: 'Respiratory',
    pathway: 'Both',
    summary: 'Use ROME and Tic-Tac-Toe to solve acid-base imbalances and troubleshoot high/low ventilator alarms.',
    readingMinutes: 11,
    keyConcepts: [
      'Normal ABGs: pH 7.35–7.45, PaCO2 35–45 mmHg, HCO3 22–26 mEq/L.',
      'High-pressure alarm = obstruction/resistance (kink, secretions, biting, pneumothorax).',
      'Low-pressure alarm = air leak/disconnection (disconnected circuit, cuff leak).',
    ],
    clinicalPriorities: [
      'Never silence a ventilator alarm without assessing the patient first.',
      'If unable to troubleshoot rapidly, disconnect and manually ventilate with a bag-valve mask.',
    ],
    importantTerminology: [
      { term: 'ROME', definition: 'Respiratory Opposite (pH and PaCO2 move opposite), Metabolic Equal (pH and HCO3 move same).' },
      { term: 'PEEP', definition: 'Positive End-Expiratory Pressure keeping alveoli open at end expiration.' },
    ],
    structuredNotes: [
      {
        heading: 'VAP Prevention Bundle',
        points: [
          'Elevate head of bed 30–45 degrees.',
          'Perform oral care with chlorhexidine per facility protocol.',
          'Daily sedation vacation and spontaneous breathing trials.',
        ],
      },
    ],
    relatedTopicSlugs: ['copd-oxygenation-chest-tubes'],
    relatedCarePlanSlugs: ['copd-acute-exacerbation', 'pneumonia-impaired-gas-exchange'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-resp-chest-tubes',
    slug: 'copd-oxygenation-chest-tubes',
    title: 'Oxygen Delivery & Chest Tube Management',
    subject: 'Respiratory',
    pathway: 'Both',
    summary: 'Select the right oxygen device, maintain COPD target SpO2 (88–92%), and handle chest tube emergencies.',
    readingMinutes: 9,
    keyConcepts: [
      'Tidaling in the water-seal chamber is expected with spontaneous breathing.',
      'Continuous vigorous bubbling in the water-seal chamber indicates an air leak.',
      'If a chest tube dislodges, apply a sterile occlusive dressing taped on 3 sides.',
    ],
    clinicalPriorities: [
      'Never clamp a chest tube without a provider order (risk of tension pneumothorax).',
      'Keep the drainage system below chest level at all times.',
    ],
    importantTerminology: [
      { term: 'Tidaling', definition: 'Rhythmic rise and fall of fluid in the water-seal chamber with respirations.' },
    ],
    structuredNotes: [
      {
        heading: 'Oxygen Devices',
        points: [
          'Nasal cannula: 1–6 L/min (24–44% FiO2).',
          'Venturi mask: precise FiO2 delivery ideal for COPD.',
          'Non-rebreather mask: 10–15 L/min (up to ~90% FiO2); keep reservoir bag inflated.',
        ],
      },
    ],
    relatedTopicSlugs: ['abg-interpretation-ventilator-care'],
    relatedCarePlanSlugs: ['copd-acute-exacerbation'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-mat-fhr',
    slug: 'fetal-heart-rate-veal-chop',
    title: 'Fetal Heart Rate Monitoring & VEAL CHOP',
    subject: 'Maternity',
    pathway: 'Both',
    summary: 'Interpret FHR decelerations, variability, and execute intrauterine resuscitation in exact priority order.',
    readingMinutes: 10,
    keyConcepts: [
      'Normal FHR baseline is 110–160 bpm; moderate variability is the best indicator of fetal well-being.',
      'VEAL CHOP: Variable = Cord compression, Early = Head compression, Accelerations = OK, Late = Placental insufficiency.',
    ],
    clinicalPriorities: [
      'For late decelerations: turn mother to left lateral, stop oxytocin, give IV fluid bolus, apply O2 per protocol.',
    ],
    importantTerminology: [
      { term: 'Tachysystole', definition: 'More than 5 contractions in 10 minutes averaged over a 30-minute window.' },
    ],
    structuredNotes: [
      {
        heading: 'Obstetric Bleeding Distinction',
        points: [
          'Placenta previa: painless bright-red bleeding — NO vaginal exams.',
          'Placental abruption: painful dark-red bleeding with rigid board-like uterus — prepare for emergency birth.',
        ],
      },
    ],
    relatedTopicSlugs: ['postpartum-hemorrhage-preeclampsia'],
    relatedCarePlanSlugs: ['preeclampsia-magnesium-safety'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-mat-postpartum',
    slug: 'postpartum-hemorrhage-preeclampsia',
    title: 'Postpartum Hemorrhage & Preeclampsia Care',
    subject: 'Maternity',
    pathway: 'Both',
    summary: 'Manage uterine atony (massage first), lochia progression, magnesium sulfate toxicity, and RhoGAM timing.',
    readingMinutes: 10,
    keyConcepts: [
      'Boggy uterus = massage fundus first and assess bladder distension.',
      'Magnesium sulfate toxicity sequence: loss of DTRs -> RR < 12/min -> oliguria; antidote = calcium gluconate.',
      'RhoGAM is given at 28 weeks gestation and within 72 hours postpartum for Rh-negative mothers.',
    ],
    clinicalPriorities: [
      'Saturating >= 1 peripad in 1 hour or less is postpartum hemorrhage.',
    ],
    importantTerminology: [
      { term: 'Lochia Progression', definition: 'Rubra (days 1–3, red) -> Serosa (days 4–10, pink/brown) -> Alba (days 11+, white/yellow).' },
    ],
    structuredNotes: [
      {
        heading: 'BUBBLE-HE Postpartum Assessment',
        points: [
          'Breasts, Uterus (firmness/height), Bladder, Bowels, Lochia, Episiotomy/Incision, Homan’s/DVT, Emotional bonding.',
        ],
      },
    ],
    relatedTopicSlugs: ['fetal-heart-rate-veal-chop'],
    relatedCarePlanSlugs: ['preeclampsia-magnesium-safety'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-peds-chd',
    slug: 'pediatric-congenital-heart-defects',
    title: 'Pediatric Congenital Heart Defects & Milestones',
    subject: 'Pediatrics',
    pathway: 'Both',
    summary: 'Classify acyanotic vs. cyanotic heart defects, manage Tet spells, and review infant developmental milestones.',
    readingMinutes: 11,
    keyConcepts: [
      'Tetralogy of Fallot (Tet spell): place child in knee-to-chest position, give O2 and morphine.',
      'Coarctation of the aorta: bounding upper-extremity pulses/HTN and weak femoral pulses.',
      'Birth weight doubles by 6 months and triples by 12 months.',
    ],
    clinicalPriorities: [
      'Infants are obligate nose breathers — suction nares before feeding.',
    ],
    importantTerminology: [
      { term: 'Right-to-Left Shunt', definition: 'Deoxygenated blood bypasses the lungs and enters systemic circulation, causing cyanosis.' },
    ],
    structuredNotes: [
      {
        heading: 'Key Pediatric Safety Rules',
        points: [
          'Rear-facing car seat until at least age 2 or maximum seat height/weight.',
          'Back to sleep on a firm mattress with no loose bedding.',
        ],
      },
    ],
    relatedTopicSlugs: ['pediatric-respiratory-emergencies'],
    relatedCarePlanSlugs: ['pediatric-bronchiolitis-rsv'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-peds-resp',
    slug: 'pediatric-respiratory-emergencies',
    title: 'Pediatric Respiratory: Croup, Epiglottitis & RSV',
    subject: 'Pediatrics',
    pathway: 'Both',
    summary: 'Distinguish barking croup from airway-emergency epiglottitis (never inspect throat) and manage RSV.',
    readingMinutes: 9,
    keyConcepts: [
      'Epiglottitis: drooling, dysphagia, tripod position, high fever — DO NOT inspect throat with tongue depressor.',
      'Croup (LTB): barking seal cough, inspiratory stridor — cool mist and racemic epinephrine/dexamethasone.',
    ],
    clinicalPriorities: [
      'Keep emergency intubation/tracheostomy equipment at bedside for suspected epiglottitis.',
    ],
    importantTerminology: [
      { term: 'Stridor', definition: 'High-pitched inspiratory sound indicating upper airway narrowing.' },
    ],
    structuredNotes: [
      {
        heading: 'Cystic Fibrosis Essentials',
        points: [
          'Administer pancreatic enzymes with every meal and snack.',
          'High-calorie, high-protein diet with fat-soluble vitamins (A, D, E, K).',
        ],
      },
    ],
    relatedTopicSlugs: ['pediatric-congenital-heart-defects'],
    relatedCarePlanSlugs: ['pediatric-bronchiolitis-rsv'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-pharm-high-alert',
    slug: 'high-alert-medications-antidotes',
    title: 'High-Alert Medications & Essential Antidotes',
    subject: 'Pharmacology',
    pathway: 'Both',
    summary: 'Anchor therapeutic drug levels (digoxin, lithium, phenytoin, warfarin/heparin) and their reversal agents.',
    readingMinutes: 12,
    keyConcepts: [
      'Warfarin (monitor INR 2.0–3.0) -> Antidote: Vitamin K.',
      'Heparin (monitor aPTT 1.5–2.5× control) -> Antidote: Protamine sulfate.',
      'Opioids -> Naloxone; Acetaminophen -> N-acetylcysteine; Digoxin -> Digoxin immune Fab.',
    ],
    clinicalPriorities: [
      'Draw trough antibiotic levels (vancomycin) immediately before the next scheduled dose.',
    ],
    importantTerminology: [
      { term: 'Therapeutic Index', definition: 'Ratio between toxic and therapeutic drug concentrations; narrow-index drugs require serum monitoring.' },
    ],
    comparisonTable: {
      title: 'Must-Know Drug Levels & Antidotes',
      headers: ['Medication', 'Therapeutic Range', 'Toxicity Sign / Antidote'],
      rows: [
        ['Digoxin', '0.5–2.0 ng/mL', 'Yellow-green halos, bradycardia / Digibind'],
        ['Lithium', '0.6–1.2 mEq/L', 'Coarse tremor, ataxia / IV hydration'],
        ['Warfarin', 'INR 2.0–3.0 (most)', 'Bleeding / Vitamin K'],
        ['Heparin', 'aPTT 60–80 sec (therapeutic)', 'Bleeding / Protamine sulfate'],
      ],
    },
    structuredNotes: [
      {
        heading: 'Suffix Pattern Recognition',
        points: [
          '-pril (ACEi): cough, hyperkalemia, angioedema.',
          '-statin (HMG-CoA): myopathy/rhabdomyolysis, monitor LFTs.',
          '-mycin (Aminoglycoside): nephrotoxicity and ototoxicity.',
        ],
      },
    ],
    relatedTopicSlugs: ['insulin-antidiabetic-pharmacology'],
    relatedCarePlanSlugs: ['acute-kidney-injury-aki'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-pharm-insulin',
    slug: 'insulin-antidiabetic-pharmacology',
    title: 'Insulin Profiles & Antidiabetic Safety',
    subject: 'Pharmacology',
    pathway: 'Both',
    summary: 'Compare onset, peak, and duration of rapid, short, intermediate, and long-acting insulins plus metformin safety.',
    readingMinutes: 8,
    keyConcepts: [
      'Rapid-acting (lispro/aspart): onset 15 min, peak 1–2 hr — give only when meal is at bedside.',
      'Regular (short-acting): only insulin given IV; draw clear (Regular) before cloudy (NPH).',
      'Glargine (long-acting): no peak; never mix in the same syringe with other insulins.',
    ],
    clinicalPriorities: [
      'Hold metformin 48 hours before/after iodinated IV contrast to prevent lactic acidosis.',
    ],
    importantTerminology: [
      { term: 'Somogyi Phenomenon', definition: 'Nocturnal hypoglycemia followed by rebound morning hyperglycemia.' },
    ],
    structuredNotes: [
      {
        heading: 'Hypoglycemia Rule of 15',
        points: [
          'If awake with BG < 70 mg/dL: give 15 g fast-acting carbohydrate, recheck in 15 minutes.',
          'If unresponsive: give IV D50W or IM/intranasal glucagon.',
        ],
      },
    ],
    relatedTopicSlugs: ['high-alert-medications-antidotes'],
    relatedCarePlanSlugs: ['diabetic-ketoacidosis-dka'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-fund-delegation',
    slug: 'prioritization-delegation-scope',
    title: 'Prioritization Frameworks & Delegation Scope',
    subject: 'Fundamentals',
    pathway: 'Both',
    summary: 'Apply ABCs, Maslow, acute-vs-chronic, and RN/LPN/UAP delegation rules for leadership questions.',
    readingMinutes: 10,
    keyConcepts: [
      'RNs NEVER delegate EAT: Evaluation, Assessment (initial/change), and Teaching.',
      'UAPs perform routine, stable tasks: vitals on stable clients, ADLs, I&O, ambulation.',
      'LPNs care for stable clients with predictable outcomes: oral/topical meds, wound care, suctioning.',
    ],
    clinicalPriorities: [
      'Unstable/acute/unexpected findings always outrank stable/chronic/expected findings.',
    ],
    importantTerminology: [
      { term: 'Five Rights of Delegation', definition: 'Right Task, Right Circumstance, Right Person, Right Direction/Communication, Right Supervision/Evaluation.' },
    ],
    structuredNotes: [
      {
        heading: 'Isolation Precautions Quick Review',
        points: [
          'Airborne (MTV: Measles, TB, Varicella): negative-pressure room, N95 respirator.',
          'Droplet (pertussis, influenza, meningococcal): surgical mask within 3–6 ft.',
          'Contact (C. diff, MRSA, RSV): gown and gloves; wash hands with soap and water for C. diff.',
        ],
      },
    ],
    relatedTopicSlugs: ['infection-control-safety-fundamentals'],
    relatedCarePlanSlugs: ['postoperative-joint-arthroplasty'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-fund-infection',
    slug: 'infection-control-safety-fundamentals',
    title: 'Infection Control, Sterile Technique & Restraints',
    subject: 'Fundamentals',
    pathway: 'Both',
    summary: 'Master PPE donning/doffing order, sterile field boundaries, and legal restraint requirements.',
    readingMinutes: 8,
    keyConcepts: [
      'Donning PPE: Gown -> Mask/Respirator -> Goggles -> Gloves.',
      'Doffing PPE: Gloves -> Goggles -> Gown -> Mask (hand hygiene after).',
      'Restraints require a provider order, frequent neurovascular/skin checks, and quick-release ties to bed frame (never side rails).',
    ],
    clinicalPriorities: [
      'Use soap and water (not alcohol sanitizer) for C. difficile spores.',
    ],
    importantTerminology: [
      { term: 'Sterile Field Border', definition: 'The outer 1-inch (2.5 cm) margin of a sterile drape is considered contaminated.' },
    ],
    structuredNotes: [
      {
        heading: 'Fall Prevention',
        points: [
          'Bed in lowest position, brakes locked, call light within reach, non-skid footwear.',
        ],
      },
    ],
    relatedTopicSlugs: ['prioritization-delegation-scope'],
    relatedCarePlanSlugs: ['postoperative-joint-arthroplasty'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-ms-electrolytes',
    slug: 'fluid-electrolytes-renal-balance',
    title: 'Fluid, Electrolytes & Renal Balance',
    subject: 'Med-Surg/Renal',
    pathway: 'Both',
    summary: 'Pair sodium, potassium, calcium, and magnesium imbalances with ECG changes and safe IV replacement rules.',
    readingMinutes: 11,
    keyConcepts: [
      'Hyperkalemia (> 5.0 mEq/L): peaked T waves, widened QRS; give IV calcium gluconate to protect myocardium.',
      'Never administer IV potassium via IV push; always dilute and verify urine output >= 30 mL/hr.',
      'Hypocalcemia (< 8.4 mg/dL): positive Chvostek and Trousseau signs, laryngeal stridor.',
    ],
    clinicalPriorities: [
      'Correct hyponatremia gradually to avoid osmotic demyelination syndrome.',
    ],
    importantTerminology: [
      { term: 'Trousseau Sign', definition: 'Carpal spasm elicited by inflating a blood pressure cuff above systolic pressure for 3 minutes.' },
    ],
    structuredNotes: [
      {
        heading: 'Dialysis & AV Fistula Care',
        points: [
          'Palpate thrill and auscultate bruit every shift.',
          'NO blood pressures, venipunctures, or IVs in the fistula arm.',
          'Hold dialyzable antihypertensives before hemodialysis.',
        ],
      },
    ],
    relatedTopicSlugs: ['endocrine-diabetes-adrenal-thyroid'],
    relatedCarePlanSlugs: ['acute-kidney-injury-aki'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-ms-endocrine',
    slug: 'endocrine-diabetes-adrenal-thyroid',
    title: 'Endocrine Disorders: DKA/HHS, DI/SIADH & Thyroid',
    subject: 'Med-Surg/Renal',
    pathway: 'Both',
    summary: 'Contrast DI vs. SIADH, DKA vs. HHS, and post-thyroidectomy airway/calcium monitoring.',
    readingMinutes: 10,
    keyConcepts: [
      'DI = massive dilute urine + hypernatremia -> give desmopressin.',
      'SIADH = concentrated low urine output + hyponatremia -> restrict fluids.',
      'Post-thyroidectomy: keep tracheostomy tray at bedside; monitor for hoarseness and hypocalcemia.',
    ],
    clinicalPriorities: [
      'In DKA/HHS: 0.9% NaCl fluids FIRST, then IV regular insulin, then potassium monitoring.',
    ],
    importantTerminology: [
      { term: 'Addisonian Crisis', definition: 'Life-threatening acute adrenal insufficiency causing refractory hypotension, hyponatremia, and hyperkalemia.' },
    ],
    structuredNotes: [
      {
        heading: 'Addison’s vs. Cushing’s',
        points: [
          'Addison’s (low cortisol): hypotension, hyponatremia, hyperkalemia, hypoglycemia — needs IV hydrocortisone.',
          'Cushing’s (high cortisol): hypertension, hyperglycemia, moon face, buffalo hump, hypokalemia.',
        ],
      },
    ],
    relatedTopicSlugs: ['fluid-electrolytes-renal-balance'],
    relatedCarePlanSlugs: ['diabetic-ketoacidosis-dka', 'hypothyroidism-myxedema-care'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-mh-therapeutic',
    slug: 'therapeutic-communication-psych-safety',
    title: 'Therapeutic Communication & Psychiatric Safety',
    subject: 'Mental Health',
    pathway: 'Both',
    summary: 'Identify therapeutic responses, avoid non-therapeutic traps, and manage acute agitation or suicide risk.',
    readingMinutes: 9,
    keyConcepts: [
      'Therapeutic: open-ended questions, reflection, focusing, presenting reality without arguing.',
      'Non-therapeutic: "Why?" questions, false reassurance, giving advice, changing the subject.',
      'Always ask directly about suicidal plan and means.',
    ],
    clinicalPriorities: [
      'Physical safety and airway/medical stabilization precede psychosocial exploration.',
    ],
    importantTerminology: [
      { term: 'Presenting Reality', definition: 'Stating what is real calmly without validating or arguing against a hallucination or delusion.' },
    ],
    structuredNotes: [
      {
        heading: 'Alcohol Withdrawal & CIWA',
        points: [
          'Delirium tremens peaks 24–72 hours after last drink.',
          'Administer thiamine BEFORE IV glucose to prevent Wernicke’s encephalopathy.',
        ],
      },
    ],
    relatedTopicSlugs: ['psychotropic-medications-nms-serotonin'],
    relatedCarePlanSlugs: ['major-depressive-disorder-suicide-safety'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-mh-psychotropics',
    slug: 'psychotropic-medications-nms-serotonin',
    title: 'Psychotropic Medications: NMS, Serotonin & MAOIs',
    subject: 'Mental Health',
    pathway: 'Both',
    summary: 'Differentiate Neuroleptic Malignant Syndrome from Serotonin Syndrome and master clozapine/MAOI safety.',
    readingMinutes: 9,
    keyConcepts: [
      'Clozapine: monitor ANC/WBC regularly; fever or sore throat = emergency agranulocytosis check.',
      'MAOIs + tyramine (aged cheese, cured meats, red wine) = hypertensive crisis.',
      'NMS: lead-pipe rigidity + high fever -> stop antipsychotic, cool patient, give dantrolene.',
    ],
    clinicalPriorities: [
      'Allow a 14-day washout when switching between MAOIs and SSRIs/SNRIs.',
    ],
    importantTerminology: [
      { term: 'Akathisia', definition: 'Motor restlessness and inability to sit still caused by dopamine-blocking antipsychotics.' },
    ],
    structuredNotes: [
      {
        heading: 'Lithium Toxicity Prevention',
        points: [
          'Maintain consistent sodium and fluid intake; avoid NSAIDs.',
        ],
      },
    ],
    relatedTopicSlugs: ['therapeutic-communication-psych-safety'],
    relatedCarePlanSlugs: ['major-depressive-disorder-suicide-safety'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-dosage-iv-rates',
    slug: 'dosage-calc-iv-flow-rates',
    title: 'Dosage Calculation: IV Flow Rates & Weight-Based Dosing',
    subject: 'Dosage Calculation',
    pathway: 'Both',
    summary: 'Solve mL/hr pump rates, gtt/min gravity drip rates, and mcg/kg/min critical care infusions without rounding errors.',
    readingMinutes: 8,
    keyConcepts: [
      'Pump rate (mL/hr) = Total Volume (mL) ÷ Time (hours).',
      'Gravity rate (gtt/min) = [Volume (mL) × Drop Factor (gtt/mL)] ÷ Time (minutes); round to nearest whole drop.',
      'Convert pounds to kilograms first: kg = lb ÷ 2.2.',
    ],
    clinicalPriorities: [
      'Never round intermediate steps; round only the final answer per clinical question instructions.',
    ],
    importantTerminology: [
      { term: 'Microdrip Tubing', definition: 'IV tubing with a standard drop factor of 60 gtt/mL (where mL/hr equals gtt/min).' },
    ],
    structuredNotes: [
      {
        heading: 'Worked Example',
        points: [
          'Order: Infuse 1,000 mL 0.9% NaCl over 8 hours using 15 gtt/mL tubing.',
          'Calculation: (1,000 × 15) ÷ (8 × 60) = 15,000 ÷ 480 = 31.25 -> 31 gtt/min.',
        ],
      },
    ],
    relatedTopicSlugs: ['dosage-calc-conversions-rounding'],
    relatedCarePlanSlugs: ['diabetic-ketoacidosis-dka'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
  {
    id: 'sg-dosage-conversions',
    slug: 'dosage-calc-conversions-rounding',
    title: 'Dosage Calculation: Metric Conversions & Safe Rounding',
    subject: 'Dosage Calculation',
    pathway: 'Both',
    summary: 'Master mg/mcg/g/mL conversions, leading-zero safety rules, and pediatric safe-dose range checks.',
    readingMinutes: 7,
    keyConcepts: [
      '1 g = 1,000 mg; 1 mg = 1,000 mcg; 1 L = 1,000 mL; 1 tsp = 5 mL; 1 tbsp = 15 mL; 1 oz = 30 mL.',
      'Always use a leading zero (0.5 mg, never .5 mg) and never use a trailing zero (5 mg, never 5.0 mg).',
    ],
    clinicalPriorities: [
      'Always verify pediatric orders against the mg/kg/day safe dose range before administering.',
    ],
    importantTerminology: [
      { term: 'Desired Over Have', definition: 'Formula: (Desired Dose ÷ Dose on Hand) × Vehicle Quantity.' },
    ],
    structuredNotes: [
      {
        heading: 'Pediatric Safe Dose Verification',
        points: [
          'Step 1: Convert child weight to kg (lb ÷ 2.2).',
          'Step 2: Multiply kg by safe min and max mg/kg/day.',
          'Step 3: Compare ordered 24-hour total against the safe range; hold and clarify if exceeded.',
        ],
      },
    ],
    relatedTopicSlugs: ['dosage-calc-iv-flow-rates'],
    relatedCarePlanSlugs: ['pediatric-bronchiolitis-rsv'],
    source: 'NURVIA Local Study Library',
    contentVersion: '1.0.0',
    publicationStatus: 'Published',
  },
];

export interface StudyGuidesLoadResult {
  guides: StudyGuideRecord[];
  localCount: number;
  remoteCount: number;
  remoteStatus: 'not_provisioned' | 'loaded' | 'error';
  remoteMessage?: string;
}

function mapRemoteStudyGuide(dto: StudyGuideSummaryDto): StudyGuideRecord {
  return {
    id: dto.id,
    slug: dto.slug || dto.id,
    title: dto.title,
    subject: dto.category || 'Fundamentals',
    pathway: (dto.pathway as StudyGuideRecord['pathway']) || 'Both',
    summary: dto.summary,
    readingMinutes: dto.readingMinutes || 10,
    keyConcepts: [],
    clinicalPriorities: [],
    importantTerminology: [],
    structuredNotes: [],
    relatedTopicSlugs: [],
    relatedCarePlanSlugs: [],
    source: 'Verified Remote Backend',
    contentVersion: 'remote',
    publicationStatus: dto.isPublished ? 'Published' : 'Draft',
  };
}

export function mergeStudyGuides(
  localGuides: readonly StudyGuideRecord[] = LOCAL_STUDY_GUIDES,
  remoteDtos: readonly StudyGuideSummaryDto[] = []
): StudyGuideRecord[] {
  const byKey = new Map<string, StudyGuideRecord>();
  for (const guide of localGuides) {
    if (guide.publicationStatus !== 'Published') continue;
    byKey.set(guide.slug.toLowerCase(), guide);
  }
  for (const dto of remoteDtos) {
    if (!dto.isPublished) continue;
    const mapped = mapRemoteStudyGuide(dto);
    const key = mapped.slug.toLowerCase();
    if (!byKey.has(key) && !Array.from(byKey.values()).some((g) => g.id === mapped.id)) {
      byKey.set(key, mapped);
    }
  }
  return Array.from(byKey.values());
}

export async function loadStudyGuidesCatalogue(options?: {
  remoteFetcher?: () => Promise<{ success: boolean; statusCode?: number; errorCode?: string; message?: string; data?: StudyGuideSummaryDto[] }>;
}): Promise<StudyGuidesLoadResult> {
  const publishedLocal = LOCAL_STUDY_GUIDES.filter((g) => g.publicationStatus === 'Published');
  if (!options?.remoteFetcher) {
    return {
      guides: publishedLocal,
      localCount: publishedLocal.length,
      remoteCount: 0,
      remoteStatus: 'not_provisioned',
      remoteMessage: 'Remote study-guide endpoint is not provisioned on the shared backend; serving local study library.',
    };
  }
  try {
    const res = await options.remoteFetcher();
    if (res.success && Array.isArray(res.data)) {
      const merged = mergeStudyGuides(publishedLocal, res.data);
      return { guides: merged, localCount: publishedLocal.length, remoteCount: res.data.length, remoteStatus: 'loaded' };
    }
    if (res.statusCode === 501 || res.errorCode === 'NOT_PROVISIONED') {
      return { guides: publishedLocal, localCount: publishedLocal.length, remoteCount: 0, remoteStatus: 'not_provisioned', remoteMessage: res.message };
    }
    return { guides: publishedLocal, localCount: publishedLocal.length, remoteCount: 0, remoteStatus: 'error', remoteMessage: res.message || 'Remote study-guide retrieval failed; showing local library.' };
  } catch {
    return { guides: publishedLocal, localCount: publishedLocal.length, remoteCount: 0, remoteStatus: 'error', remoteMessage: 'Remote study-guide retrieval failed; showing local library.' };
  }
}

export function getStudyGuideBySlug(slug: string, guides: readonly StudyGuideRecord[] = LOCAL_STUDY_GUIDES): StudyGuideRecord | null {
  const normalized = slug.trim().toLowerCase();
  return guides.find((g) => g.slug.toLowerCase() === normalized || g.id.toLowerCase() === normalized) ?? null;
}
