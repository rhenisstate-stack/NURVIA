import type { CarePlanDto } from '@/lib/api-types';

export interface CarePlanNursingDiagnosis {
  diagnosis: string;
  relatedFactors: string[];
  definingCharacteristics: string[];
}

export interface CarePlanIntervention {
  intervention: string;
  rationale: string;
}

export type CarePlanLifecycleStatus =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Published'
  | 'Updated'
  | 'Archived'
  | 'Withdrawn';

export type CarePlanClinicalReviewStatus = 'reviewed' | 'pending_review' | 'unreviewed';

export interface CarePlanChangeHistoryEntry {
  version: string;
  date: string;
  summary: string;
  author: string;
}

export interface CarePlanRecord {
  id: string;
  slug: string;
  title: string;
  shortSummary: string;
  category: string;
  bodySystem: string;
  relatedConditions: string[];
  searchKeywords: string[];
  assessmentCues: {
    subjective: string[];
    objective: string[];
  };
  nursingDiagnoses: CarePlanNursingDiagnosis[];
  goalsAndOutcomes: string[];
  nursingInterventions: CarePlanIntervention[];
  evaluationCriteria: string[];
  patientEducation: string[];
  references: string[];
  publicationStatus: 'Published' | 'Draft';
  lifecycleStatus?: CarePlanLifecycleStatus;
  clinicalReviewStatus?: CarePlanClinicalReviewStatus;
  ownership?: string;
  author?: string;
  reviewDueDate?: string;
  changeHistory?: CarePlanChangeHistoryEntry[];
  source: 'NURVIA Local Clinical Library' | 'Verified Remote Backend';
  contentVersion: string;
}

export interface CarePlanWritingGuide {
  id: string;
  title: string;
  format: '3-Column' | '4-Column' | 'Student Care Plan' | 'Diagnosis Distinction';
  summary: string;
  columns: string[];
  steps: string[];
  exampleNote: string;
}

export const CARE_PLAN_BODY_SYSTEMS = [
  'All',
  'Cardiovascular',
  'Respiratory',
  'Neurological',
  'Endocrine',
  'Renal & Urinary',
  'Gastrointestinal',
  'Musculoskeletal',
  'Maternal-Newborn',
  'Pediatrics',
  'Mental Health',
] as const;

export const CARE_PLAN_WRITING_GUIDES: readonly CarePlanWritingGuide[] = [
  {
    id: 'guide-3-column',
    title: 'Three-Column Clinical Care Plan Format',
    format: '3-Column',
    summary: 'Concise bedside format pairing Nursing Diagnosis, Goals/Outcomes, and Interventions with Rationales.',
    columns: ['Nursing Diagnosis', 'Goals & Expected Outcomes', 'Nursing Interventions & Rationales'],
    steps: [
      'Write a NANDA-aligned nursing diagnosis using Problem + Related To (etiology) + As Evidenced By (defining characteristics).',
      'State SMART outcomes (Specific, Measurable, Achievable, Realistic, Time-bound).',
      'Pair each priority nursing action with an evidence-based physiological rationale.',
    ],
    exampleNote: 'Ideal for rapid clinical handoff and NCLEX prioritization review.',
  },
  {
    id: 'guide-4-column',
    title: 'Four-Column ADPIE Care Plan Format',
    format: '4-Column',
    summary: 'Full nursing process view separating Assessment cues, Diagnosis, Planning/Interventions, and Evaluation.',
    columns: ['Assessment Cues', 'Nursing Diagnosis', 'Interventions & Rationales', 'Evaluation'],
    steps: [
      'Cluster subjective symptoms and objective vital signs/labs before selecting a diagnosis.',
      'Prioritize airway, breathing, circulation, and acute safety threats first.',
      'Document measurable evaluation criteria showing whether each outcome was met, partially met, or unmet.',
    ],
    exampleNote: 'Matches standard hospital electronic health record (EHR) care planning.',
  },
  {
    id: 'guide-student',
    title: 'Student Clinical Care Plan Format',
    format: 'Student Care Plan',
    summary: 'Comprehensive academic template integrating pathophysiology, patient education, and discharge readiness.',
    columns: ['Assessment & Pathophysiology', 'NANDA Diagnosis & Goals', 'Interventions + Rationales', 'Education & Evaluation'],
    steps: [
      'Distinguish the medical diagnosis (e.g., Heart Failure) from the human response nursing diagnosis (e.g., Excess Fluid Volume).',
      'Include independent, dependent (ordered medications/therapies), and collaborative interventions.',
      'Incorporate teach-back patient education and clear red-flag return precautions.',
    ],
    exampleNote: 'Designed for nursing school clinical rotations and preceptorships.',
  },
  {
    id: 'guide-diagnosis-distinction',
    title: 'Medical Diagnosis vs. Nursing Diagnosis',
    format: 'Diagnosis Distinction',
    summary: 'Never confuse disease pathology with the patient’s holistic clinical response.',
    columns: ['Medical Diagnosis', 'Nursing Diagnosis', 'Nursing Focus'],
    steps: [
      'Medical diagnosis names the disease or pathology (e.g., Community-Acquired Pneumonia, Type 1 Diabetes).',
      'Nursing diagnosis describes the patient’s actual or potential response (e.g., Impaired Gas Exchange, Risk for Unstable Blood Glucose).',
      'Nurses treat the human response through monitoring, positioning, airway clearance, safety, and education.',
    ],
    exampleNote: 'Essential for avoiding scope-of-practice errors on NCLEX and clinicals.',
  },
];

export const LOCAL_CARE_PLANS: readonly CarePlanRecord[] = [
  {
    id: 'cp-heart-failure',
    slug: 'heart-failure-fluid-overload',
    title: 'Heart Failure & Fluid Volume Overload',
    shortSummary: 'Manage acute decompensated heart failure, pulmonary congestion, daily weight monitoring, and diuretic safety.',
    category: 'Med-Surg',
    bodySystem: 'Cardiovascular',
    relatedConditions: ['Congestive Heart Failure', 'Pulmonary Edema', 'Cardiomyopathy'],
    searchKeywords: ['heart failure', 'fluid overload', 'crackles', 'furosemide', 'orthopnea', 'edema', 'BNP'],
    assessmentCues: {
      subjective: ['Dyspnea on exertion or orthopnea', 'Paroxysmal nocturnal dyspnea', 'Fatigue and activity intolerance'],
      objective: ['Bibasilar crackles on auscultation', '2+ to 3+ pitting peripheral edema', 'Jugular venous distension (JVD)', 'Weight gain > 2 lb (0.9 kg) in 24 hours', 'Elevated BNP'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Excess Fluid Volume',
        relatedFactors: ['Compromised regulatory mechanisms', 'Decreased cardiac output and renal perfusion'],
        definingCharacteristics: ['Crackles', 'Peripheral edema', 'Jugular venous distension', 'Rapid weight gain', 'Shortness of breath'],
      },
      {
        diagnosis: 'Decreased Cardiac Output',
        relatedFactors: ['Altered myocardial contractility', 'Increased preload and afterload'],
        definingCharacteristics: ['Decreased ejection fraction', 'Fatigue', 'Tachycardia', 'Cool extremities'],
      },
    ],
    goalsAndOutcomes: [
      'Client will demonstrate clear lung sounds and SpO2 >= 94% within 24 hours.',
      'Client will achieve net negative fluid balance and weight reduction toward dry weight.',
      'Client will verbalize daily weight monitoring and sodium restriction prior to discharge.',
    ],
    nursingInterventions: [
      {
        intervention: 'Elevate head of bed to High-Fowler’s (60–90 degrees) and administer supplemental oxygen as ordered.',
        rationale: 'Upright positioning reduces venous return to the heart, decreases pulmonary congestion, and maximizes diaphragmatic excursion.',
      },
      {
        intervention: 'Weigh the client daily at the same time, on the same scale, in similar clothing, and track strict intake and output.',
        rationale: 'Daily weight is the most sensitive indicator of fluid balance changes (1 kg weight gain ≈ 1 L fluid retention).',
      },
      {
        intervention: 'Administer loop diuretics (e.g., furosemide) as prescribed and monitor serum potassium and renal function.',
        rationale: 'Loop diuretics promote rapid natriuresis and preload reduction while risking hypokalemia and prerenal azotemia.',
      },
      {
        intervention: 'Auscultate lung sounds and assess JVD, peripheral edema, and blood pressure every 4 hours or with status changes.',
        rationale: 'Frequent cardiopulmonary assessment detects worsening pulmonary edema or diuretic-induced hypotension early.',
      },
    ],
    evaluationCriteria: [
      'Lung fields clear or crackles markedly reduced; respiratory rate 12–20/min without accessory muscle use.',
      'Daily weights trending down toward baseline dry weight with serum potassium 3.5–5.0 mEq/L.',
      'Client accurately states when to contact the provider (weight gain >= 2–3 lb in 1 day or 5 lb in 1 week).',
    ],
    patientEducation: [
      'Weigh yourself every morning after voiding and before breakfast; record weights in a log.',
      'Follow prescribed sodium (typically <= 2,000 mg/day) and fluid restrictions.',
      'Report sudden weight gain, worsening ankle swelling, or needing extra pillows to sleep.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Cardiovascular Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-acute-mi',
    slug: 'acute-myocardial-infarction-acs',
    title: 'Acute Myocardial Infarction (ACS)',
    shortSummary: 'Prioritize myocardial oxygenation, chest pain relief, antiplatelet/anticoagulant safety, and dysrhythmia surveillance.',
    category: 'Critical Care',
    bodySystem: 'Cardiovascular',
    relatedConditions: ['STEMI', 'NSTEMI', 'Unstable Angina'],
    searchKeywords: ['myocardial infarction', 'chest pain', 'troponin', 'nitroglycerin', 'MONA', 'ECG'],
    assessmentCues: {
      subjective: ['Substernal crushing chest pain radiating to left arm or jaw', 'Nausea, diaphoresis, sense of impending doom'],
      objective: ['ST-segment elevation or depression on 12-lead ECG', 'Elevated cardiac troponin I/T', 'Tachycardia or bradycardia', 'Cool, clammy skin'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Acute Pain',
        relatedFactors: ['Myocardial ischemia and tissue hypoxia'],
        definingCharacteristics: ['Verbalized chest pain >= 7/10', 'Diaphoresis', 'Guarding', 'Autonomic changes'],
      },
      {
        diagnosis: 'Ineffective Tissue Perfusion: Cardiopulmonary',
        relatedFactors: ['Coronary artery occlusion or vasospasm'],
        definingCharacteristics: ['ECG ischemic changes', 'Elevated troponin', 'Dysrhythmias'],
      },
    ],
    goalsAndOutcomes: [
      'Client will report chest pain <= 2/10 or complete relief within 30 minutes of antianginal therapy.',
      'Client will maintain hemodynamic stability (SBP >= 90 mmHg) and perfusing cardiac rhythm.',
    ],
    nursingInterventions: [
      {
        intervention: 'Obtain a 12-lead ECG within 10 minutes of chest pain onset and initiate continuous telemetry monitoring.',
        rationale: 'Rapid ECG acquisition identifies STEMI requiring emergent reperfusion and detects lethal ventricular dysrhythmias.',
      },
      {
        intervention: 'Administer nitroglycerin, aspirin, oxygen (if SpO2 < 90%), and morphine as prescribed after checking BP.',
        rationale: 'Nitroglycerin dilates coronary vessels and reduces preload; aspirin inhibits platelet aggregation; check SBP >= 90 mmHg and screen for PDE-5 inhibitors before nitrates.',
      },
      {
        intervention: 'Maintain bedrest with head elevated and minimize environmental stressors.',
        rationale: 'Decreasing physical exertion and sympathetic stimulation lowers myocardial oxygen demand.',
      },
    ],
    evaluationCriteria: [
      'Chest pain resolved; vital signs stable without hypotension after vasodilator therapy.',
      'No sustained ventricular tachycardia, ventricular fibrillation, or symptomatic bradycardia.',
    ],
    patientEducation: [
      'Carry sublingual nitroglycerin in its original dark glass bottle; call 911 if pain is unrelieved after 1 dose (per current AHA guidance) or 5 minutes.',
      'Adhere strictly to dual antiplatelet therapy and cardiac rehabilitation.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Acute Coronary Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-hypertension',
    slug: 'hypertension-hypertensive-crisis',
    title: 'Hypertension & Hypertensive Crisis',
    shortSummary: 'Prevent target-organ damage through safe BP reduction, orthostatic monitoring, and DASH lifestyle adherence.',
    category: 'Med-Surg',
    bodySystem: 'Cardiovascular',
    relatedConditions: ['Primary Hypertension', 'Hypertensive Emergency'],
    searchKeywords: ['hypertension', 'blood pressure', 'ACE inhibitor', 'DASH', 'target organ'],
    assessmentCues: {
      subjective: ['Morning occipital headache', 'Blurred vision', 'Often asymptomatic in chronic stages'],
      objective: ['Sustained BP >= 130/80 mmHg (or > 180/120 mmHg in crisis)', 'Retinal changes', 'Proteinuria or elevated creatinine'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Risk for Decreased Cardiac Output / Ineffective Tissue Perfusion',
        relatedFactors: ['Increased systemic vascular resistance', 'Non-adherence to antihypertensive regimen'],
        definingCharacteristics: ['Elevated blood pressure readings', 'Headache or visual changes in crisis'],
      },
    ],
    goalsAndOutcomes: [
      'Client will achieve target blood pressure reduction safely (no more than 25% MAP drop in first hour during crisis).',
      'Client will demonstrate proper home BP measurement technique prior to discharge.',
    ],
    nursingInterventions: [
      {
        intervention: 'Monitor BP in both arms initially and assess for signs of target-organ injury (neurologic deficits, chest pain, oliguria).',
        rationale: 'Rapid identification of hypertensive emergency guides IV titration and prevents stroke or aortic dissection.',
      },
      {
        intervention: 'Administer prescribed antihypertensives and monitor for orthostatic hypotension during ambulation.',
        rationale: 'Vasodilators and diuretics can cause postural drops and falls, especially in older adults.',
      },
    ],
    evaluationCriteria: [
      'Blood pressure trends safely toward goal without neurologic ischemia or acute kidney injury.',
      'Client states medication schedule and never stops beta-blockers or clonidine abruptly.',
    ],
    patientEducation: [
      'Never discontinue antihypertensives abruptly (risk of rebound hypertension).',
      'Adopt DASH eating pattern, limit sodium, and engage in regular aerobic activity as cleared.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Vascular Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-copd',
    slug: 'copd-acute-exacerbation',
    title: 'COPD Acute Exacerbation',
    shortSummary: 'Optimize oxygenation with controlled FiO2 (target SpO2 88–92%), bronchodilators, and pursed-lip breathing.',
    category: 'Med-Surg',
    bodySystem: 'Respiratory',
    relatedConditions: ['Emphysema', 'Chronic Bronchitis', 'Hypercapnic Respiratory Failure'],
    searchKeywords: ['COPD', 'emphysema', 'pursed lip', 'SpO2 88-92', 'albuterol', 'hypercapnia'],
    assessmentCues: {
      subjective: ['Increased dyspnea', 'Increased sputum volume or purulence', 'Fatigue with minimal exertion'],
      objective: ['Barrel chest', 'Expiratory wheezes and prolonged expiratory phase', 'Tripod positioning', 'SpO2 < 88%'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Impaired Gas Exchange',
        relatedFactors: ['Alveolar-capillary membrane destruction', 'Airway obstruction and air trapping'],
        definingCharacteristics: ['Hypoxemia', 'Hypercapnia (PaCO2 > 45 mmHg)', 'Dyspnea', 'Restlessness'],
      },
      {
        diagnosis: 'Ineffective Airway Clearance',
        relatedFactors: ['Excessive viscous secretions', 'Bronchospasm'],
        definingCharacteristics: ['Wheezes/rhonchi', 'Productive cough', 'Diminished breath sounds'],
      },
    ],
    goalsAndOutcomes: [
      'Client will maintain SpO2 between 88% and 92% without worsening respiratory acidosis.',
      'Client will demonstrate pursed-lip breathing and effective huff coughing.',
    ],
    nursingInterventions: [
      {
        intervention: 'Titrate low-flow oxygen (e.g., Venturi mask or nasal cannula) to maintain SpO2 88–92%.',
        rationale: 'Controlled oxygenation corrects hypoxemia while avoiding V/Q mismatch and worsening hypercapnia.',
      },
      {
        intervention: 'Administer short-acting bronchodilators (albuterol/ipratropium) and systemic corticosteroids as ordered.',
        rationale: 'Bronchodilators relax smooth muscle and corticosteroids reduce airway inflammation.',
      },
      {
        intervention: 'Coach the client in pursed-lip breathing and high-Fowler’s tripod positioning.',
        rationale: 'Pursed-lip breathing creates positive end-expiratory pressure (PEEP) to prevent small airway collapse.',
      },
    ],
    evaluationCriteria: [
      'SpO2 stable at 88–92%, respiratory rate decreased, and work of breathing improved.',
      'Client expectorates secretions effectively and demonstrates inhaler spacer use.',
    ],
    patientEducation: [
      'Use rescue bronchodilator before inhaled corticosteroid; rinse mouth after steroid inhaler.',
      'Receive annual influenza and recommended pneumococcal vaccinations; avoid smoking and irritants.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Respiratory Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-pneumonia',
    slug: 'pneumonia-impaired-gas-exchange',
    title: 'Pneumonia & Impaired Gas Exchange',
    shortSummary: 'Promote alveolar ventilation, mobilization of secretions, hydration, and timely antibiotic therapy.',
    category: 'Med-Surg',
    bodySystem: 'Respiratory',
    relatedConditions: ['Community-Acquired Pneumonia', 'Hospital-Acquired Pneumonia', 'Sepsis Risk'],
    searchKeywords: ['pneumonia', 'crackles', 'fever', 'incentive spirometer', 'sputum', 'antibiotics'],
    assessmentCues: {
      subjective: ['Pleuritic chest pain', 'Productive cough', 'Chills and malaise'],
      objective: ['Fever and tachycardia', 'Localized crackles or bronchial breath sounds', 'Tachypnea', 'Infiltrate on chest X-ray'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Impaired Gas Exchange',
        relatedFactors: ['Alveolar exudate and inflammatory consolidation'],
        definingCharacteristics: ['Decreased SpO2', 'Tachypnea', 'Abnormal ABGs', 'Confusion in older adults'],
      },
    ],
    goalsAndOutcomes: [
      'Client will maintain SpO2 >= 94% on room air or ordered O2 within 48 hours.',
      'Client will use incentive spirometer 10 times/hour while awake.',
    ],
    nursingInterventions: [
      {
        intervention: 'Obtain blood and sputum cultures before initiating broad-spectrum IV antibiotics.',
        rationale: 'Cultures prior to antibiotics maximize pathogen identification without delaying sepsis treatment.',
      },
      {
        intervention: 'Encourage oral or IV hydration (unless contraindicated) and deep-breathing/incentive spirometry.',
        rationale: 'Hydration thins tenacious secretions and incentive spirometry re-expands alveoli.',
      },
    ],
    evaluationCriteria: [
      'Afebrile for 24–48 hours, WBC trending toward normal, and breath sounds clearing.',
    ],
    patientEducation: [
      'Complete the entire prescribed antibiotic course even after symptoms improve.',
      'Continue deep-breathing exercises and report recurrent fever or shortness of breath.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Pulmonary Infection Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-asthma',
    slug: 'acute-asthma-exacerbation',
    title: 'Acute Asthma Exacerbation',
    shortSummary: 'Recognize silent chest warning signs, deliver SABA/steroids rapidly, and build an Asthma Action Plan.',
    category: 'Med-Surg',
    bodySystem: 'Respiratory',
    relatedConditions: ['Status Asthmaticus', 'Bronchospasm'],
    searchKeywords: ['asthma', 'wheezing', 'silent chest', 'albuterol', 'peak flow', 'status asthmaticus'],
    assessmentCues: {
      subjective: ['Chest tightness', 'Air hunger', 'Inability to speak in full sentences'],
      objective: ['Expiratory/inspiratory wheezing (or absent breath sounds = silent chest emergency)', 'Accessory muscle use', 'Decreased peak expiratory flow'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Ineffective Breathing Pattern',
        relatedFactors: ['Bronchospasm', 'Airway inflammation and mucus plugging'],
        definingCharacteristics: ['Dyspnea', 'Tachypnea', 'Nasal flaring', 'Reduced peak flow'],
      },
    ],
    goalsAndOutcomes: [
      'Client will demonstrate improved air entry and peak flow >= 80% of personal best.',
    ],
    nursingInterventions: [
      {
        intervention: 'Administer inhaled short-acting beta2-agonist (albuterol) immediately and prepare systemic corticosteroids.',
        rationale: 'Rapid bronchodilation reverses acute smooth-muscle constriction; steroids treat underlying inflammation.',
      },
      {
        intervention: 'Monitor closely for a sudden disappearance of wheezing ("silent chest") or rising PaCO2.',
        rationale: 'A silent chest indicates severe airflow obstruction and impending respiratory arrest.',
      },
    ],
    evaluationCriteria: [
      'Wheezing resolves with clear air movement; client speaks comfortably in full sentences.',
    ],
    patientEducation: [
      'Use green/yellow/red Asthma Action Plan zones based on peak flow readings.',
      'Always carry a rescue inhaler; controller steroids are for daily prevention, not acute attacks.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Airway Management (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-stroke',
    slug: 'acute-ischemic-stroke',
    title: 'Acute Ischemic Stroke (CVA)',
    shortSummary: 'Protect airway and dysphagia safety, monitor NIHSS neuro checks, and manage thrombolytic eligibility.',
    category: 'Critical Care',
    bodySystem: 'Neurological',
    relatedConditions: ['Transient Ischemic Attack', 'Hemorrhagic Stroke'],
    searchKeywords: ['stroke', 'CVA', 'dysphagia', 'tPA', 'alteplase', 'NIHSS', 'aspiration'],
    assessmentCues: {
      subjective: ['Sudden facial droop', 'Unilateral arm weakness', 'Slurred speech or aphasia'],
      objective: ['Focal neurologic deficits on NIHSS', 'Dysphagia', 'Visual field cuts', 'CT head excluding hemorrhage'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Risk for Aspiration',
        relatedFactors: ['Impaired swallowing reflex and cranial nerve weakness'],
        definingCharacteristics: ['Weak cough', 'Pocketing food', 'Drooling or wet voice'],
      },
      {
        diagnosis: 'Impaired Physical Mobility',
        relatedFactors: ['Neuromuscular impairment / hemiparesis'],
        definingCharacteristics: ['Unilateral weakness', 'Impaired balance and coordination'],
      },
    ],
    goalsAndOutcomes: [
      'Client will remain NPO until a formal dysphagia swallow screen is passed.',
      'Client will experience no aspiration pneumonia or secondary neurologic deterioration.',
    ],
    nursingInterventions: [
      {
        intervention: 'Keep client strictly NPO (including oral medications) until dysphagia screening is completed and passed.',
        rationale: 'Silent aspiration is common after stroke and leads to preventable aspiration pneumonia.',
      },
      {
        intervention: 'Perform frequent neurological checks (NIHSS, pupils, GCS) and maintain head of bed at 30 degrees unless contraindicated.',
        rationale: 'Serial neuro exams detect hemorrhagic transformation or cerebral edema early.',
      },
      {
        intervention: 'Place items within reach on the unaffected side and approach from the intact visual field.',
        rationale: 'Supports independence and reduces injury in clients with hemianopsia or neglect.',
      },
    ],
    evaluationCriteria: [
      'Swallow screen documented before any oral intake; airway remains clear.',
      'Neurologic status stable or improving without bleeding complications.',
    ],
    patientEducation: [
      'Recognize FAST warning signs (Face, Arms, Speech, Time) and call 911 immediately.',
      'Control blood pressure, atrial fibrillation, and cholesterol to prevent recurrent stroke.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Neurovascular Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-seizure',
    slug: 'seizure-disorder-safety',
    title: 'Seizure Disorder & Status Epilepticus',
    shortSummary: 'Implement seizure precautions, protect the airway during ictal activity, and monitor antiepileptic levels.',
    category: 'Med-Surg',
    bodySystem: 'Neurological',
    relatedConditions: ['Epilepsy', 'Status Epilepticus', 'Febrile Seizures'],
    searchKeywords: ['seizure', 'phenytoin', 'lorazepam', 'airway', 'side-lying', 'status epilepticus'],
    assessmentCues: {
      subjective: ['Aura (visual, auditory, or olfactory warning)', 'Postictal confusion and fatigue'],
      objective: ['Tonic-clonic motor activity', 'Loss of consciousness', 'Urinary incontinence', 'Subtherapeutic antiepileptic drug level'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Risk for Injury / Ineffective Airway Clearance',
        relatedFactors: ['Uncontrolled tonic-clonic motor activity', 'Postictal decreased level of consciousness'],
        definingCharacteristics: ['Ictal motor movements', 'Risk of tongue trauma or aspiration'],
      },
    ],
    goalsAndOutcomes: [
      'Client will remain free from physical trauma and aspiration during any seizure episode.',
    ],
    nursingInterventions: [
      {
        intervention: 'Maintain padded side rails, suction, and oxygen at bedside; turn client to lateral (side-lying) position during a seizure.',
        rationale: 'Side-lying positioning drains oral secretions and prevents tongue obstruction without inserting objects into the mouth.',
      },
      {
        intervention: 'Time the seizure duration and administer IV benzodiazepines (e.g., lorazepam) if lasting > 5 minutes.',
        rationale: 'Seizures > 5 minutes indicate status epilepticus and risk permanent hypoxic neuronal injury.',
      },
    ],
    evaluationCriteria: [
      'Airway maintained; no oral or musculoskeletal injury; therapeutic drug levels achieved.',
    ],
    patientEducation: [
      'Never stop antiepileptic medications abruptly; maintain regular sleep and avoid triggers.',
      'Phenytoin requires meticulous oral hygiene to prevent gingival hyperplasia.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Neurological Safety (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-dka',
    slug: 'diabetic-ketoacidosis-dka',
    title: 'Diabetic Ketoacidosis (DKA)',
    shortSummary: 'Restore intravascular volume first, titrate IV regular insulin, and protect potassium levels safely.',
    category: 'Critical Care',
    bodySystem: 'Endocrine',
    relatedConditions: ['Type 1 Diabetes Mellitus', 'Hyperosmolar Hyperglycemic State (HHS)'],
    searchKeywords: ['DKA', 'ketoacidosis', 'Kussmaul', 'regular insulin', 'potassium', 'anion gap'],
    assessmentCues: {
      subjective: ['Extreme thirst', 'Nausea, vomiting, abdominal pain', 'Weakness'],
      objective: ['Blood glucose > 250 mg/dL', 'Arterial pH < 7.30', 'Positive serum/urine ketones', 'Kussmaul respirations and fruity breath'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Deficient Fluid Volume',
        relatedFactors: ['Osmotic diuresis secondary to severe hyperglycemia'],
        definingCharacteristics: ['Dry mucous membranes', 'Poor skin turgor', 'Tachycardia', 'Hypotension'],
      },
    ],
    goalsAndOutcomes: [
      'Client will achieve hemodynamic stability, closed anion gap, and safe glucose reduction (50–75 mg/dL/hr).',
    ],
    nursingInterventions: [
      {
        intervention: 'Administer isotonic IV fluids (0.9% NaCl) first, followed by continuous IV regular insulin infusion.',
        rationale: 'Volume resuscitation restores renal perfusion and begins lowering glucose before insulin shifts potassium intracellularly.',
      },
      {
        intervention: 'Monitor serum potassium closely and confirm urine output (>= 30 mL/hr) before adding IV potassium.',
        rationale: 'Insulin drives potassium into cells, risking lethal hypokalemia; potassium must not be given in anuria.',
      },
    ],
    evaluationCriteria: [
      'Anion gap normalized, ketones clearing, urine output >= 30 mL/hr, potassium 3.5–5.0 mEq/L.',
    ],
    patientEducation: [
      'Follow sick-day rules: never omit basal insulin, check blood glucose and ketones q4h, and hydrate.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Endocrine Emergencies (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-hypothyroidism',
    slug: 'hypothyroidism-myxedema-care',
    title: 'Hypothyroidism & Myxedema Care',
    shortSummary: 'Support metabolic stabilization, morning levothyroxine absorption, and hypothermia/airway vigilance.',
    category: 'Med-Surg',
    bodySystem: 'Endocrine',
    relatedConditions: ['Myxedema Coma', 'Hashimoto Thyroiditis'],
    searchKeywords: ['hypothyroidism', 'levothyroxine', 'myxedema', 'bradycardia', 'cold intolerance'],
    assessmentCues: {
      subjective: ['Fatigue', 'Cold intolerance', 'Constipation', 'Weight gain'],
      objective: ['Bradycardia', 'Dry coarse skin', 'Periorbital edema', 'Elevated TSH, low free T4'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Activity Intolerance / Hypothermia Risk',
        relatedFactors: ['Decreased metabolic rate secondary to thyroid hormone deficiency'],
        definingCharacteristics: ['Fatigue', 'Bradycardia', 'Decreased body temperature'],
      },
    ],
    goalsAndOutcomes: [
      'Client will maintain normothermia and demonstrate safe levothyroxine administration habits.',
    ],
    nursingInterventions: [
      {
        intervention: 'Administer levothyroxine in the morning on an empty stomach, separated from iron, calcium, and antacids by 4 hours.',
        rationale: 'Empty-stomach dosing ensures consistent absorption; divalent cations bind levothyroxine in the GI tract.',
      },
      {
        intervention: 'Use gradual passive rewarming (warm blankets) and avoid sedatives/opioids in severe hypothyroidism.',
        rationale: 'Active rapid rewarming causes peripheral vasodilation and shock; sedative clearance is markedly slowed.',
      },
    ],
    evaluationCriteria: [
      'Vital signs stable, temperature normalized, and client verbalizes lifelong therapy adherence.',
    ],
    patientEducation: [
      'Take levothyroxine at the same time every morning; report palpitations or chest pain.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Endocrine Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-aki',
    slug: 'acute-kidney-injury-aki',
    title: 'Acute Kidney Injury (AKI)',
    shortSummary: 'Monitor hourly urine output, prevent hyperkalemic cardiac toxicity, and avoid nephrotoxic medications.',
    category: 'Med-Surg',
    bodySystem: 'Renal & Urinary',
    relatedConditions: ['Prerenal Azotemia', 'Acute Tubular Necrosis', 'Hyperkalemia'],
    searchKeywords: ['AKI', 'renal failure', 'creatinine', 'oliguria', 'hyperkalemia', 'nephrotoxic'],
    assessmentCues: {
      subjective: ['Decreased urine output', 'Nausea and anorexia', 'Lethargy'],
      objective: ['Urine output < 30 mL/hr (< 400 mL/24 hr)', 'Rising BUN and serum creatinine', 'Hyperkalemia with peaked T waves', 'Fluid overload'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Excess Fluid Volume / Risk for Electrolyte Imbalance',
        relatedFactors: ['Decreased glomerular filtration rate (GFR)'],
        definingCharacteristics: ['Oliguria', 'Elevated creatinine', 'Hyperkalemia', 'Edema'],
      },
    ],
    goalsAndOutcomes: [
      'Client will maintain urine output >= 0.5 mL/kg/hr and remain free of lethal hyperkalemic dysrhythmias.',
    ],
    nursingInterventions: [
      {
        intervention: 'Measure strict hourly intake and output, daily weights, and review all medications for renal dosing.',
        rationale: 'Early detection of oliguria and avoidance of NSAIDs, aminoglycosides, and contrast dye prevent further nephron loss.',
      },
      {
        intervention: 'Place client on telemetry when K+ > 5.0 mEq/L and prepare calcium gluconate, insulin/dextrose as ordered.',
        rationale: 'Calcium gluconate stabilizes the cardiac membrane while insulin shifts potassium intracellularly.',
      },
    ],
    evaluationCriteria: [
      'Serum potassium < 5.0 mEq/L, normal ECG waveform, and improving creatinine/urine output.',
    ],
    patientEducation: [
      'Avoid over-the-counter NSAIDs (ibuprofen, naproxen) and follow prescribed potassium/fluid guidance.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Renal Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-gi-bleed',
    slug: 'upper-gi-bleeding',
    title: 'Upper Gastrointestinal Bleeding',
    shortSummary: 'Stabilize hypovolemic shock with large-bore IV access, blood product readiness, and PPI therapy.',
    category: 'Med-Surg',
    bodySystem: 'Gastrointestinal',
    relatedConditions: ['Peptic Ulcer Disease', 'Esophageal Varices', 'Gastritis'],
    searchKeywords: ['GI bleed', 'melena', 'hematemesis', 'hypovolemia', 'pantoprazole', 'endoscopy'],
    assessmentCues: {
      subjective: ['Epigastric burning pain', 'Dizziness on standing', 'Vomiting dark coffee-ground material'],
      objective: ['Hematemesis or melena', 'Tachycardia and orthostatic hypotension', 'Decreasing hemoglobin/hematocrit'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Deficient Fluid Volume',
        relatedFactors: ['Active gastrointestinal blood loss'],
        definingCharacteristics: ['Hypotension', 'Tachycardia', 'Decreased hemoglobin', 'Cool pale skin'],
      },
    ],
    goalsAndOutcomes: [
      'Client will maintain SBP >= 90 mmHg, HR < 100 bpm, and urine output >= 30 mL/hr.',
    ],
    nursingInterventions: [
      {
        intervention: 'Establish two large-bore (16–18G) IV lines, draw type & crossmatch, and infuse isotonic crystalloids/PRBCs as ordered.',
        rationale: 'Large-bore access enables rapid volume and blood resuscitation to prevent hypovolemic shock.',
      },
      {
        intervention: 'Keep client NPO for emergent upper endoscopy (EGD) and administer IV proton pump inhibitor as prescribed.',
        rationale: 'NPO status reduces aspiration risk during EGD; PPIs raise gastric pH to stabilize clots.',
      },
    ],
    evaluationCriteria: [
      'Hemodynamics stabilized; no further hematemesis or drop in hemoglobin.',
    ],
    patientEducation: [
      'Avoid NSAIDs, aspirin (unless prescribed), and alcohol; report black tarry stools immediately.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — GI Emergencies (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-arthroplasty',
    slug: 'postoperative-joint-arthroplasty',
    title: 'Postoperative Total Joint Arthroplasty',
    shortSummary: 'Prevent DVT/PE, neurovascular compromise, surgical site infection, and hip dislocation.',
    category: 'Med-Surg',
    bodySystem: 'Musculoskeletal',
    relatedConditions: ['Total Hip Replacement', 'Total Knee Replacement', 'DVT Prophylaxis'],
    searchKeywords: ['arthroplasty', 'hip replacement', 'DVT', 'abduction', 'neurovascular', 'enoxaparin'],
    assessmentCues: {
      subjective: ['Surgical site pain', 'Difficulty with initial transfers'],
      objective: ['Postoperative incision', 'Distal pulses, capillary refill, sensation, and motor checks', 'SCDs in place'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Impaired Physical Mobility / Risk for Venous Thromboembolism',
        relatedFactors: ['Surgical joint reconstruction and postoperative pain'],
        definingCharacteristics: ['Limited range of motion', 'Postoperative immobility'],
      },
    ],
    goalsAndOutcomes: [
      'Client will maintain intact distal neurovascular status (5 Ps) and ambulate safely with assistive devices.',
    ],
    nursingInterventions: [
      {
        intervention: 'Perform neurovascular checks (pain, pallor, pulses, paresthesia, paralysis) every 1–2 hours initially.',
        rationale: 'Detects compartment syndrome, arterial compromise, or nerve injury early.',
      },
      {
        intervention: 'Maintain hip abduction (avoid flexion > 90 degrees, internal rotation, or crossing legs after posterior hip arthroplasty) and apply SCDs/anticoagulants as ordered.',
        rationale: 'Prevents prosthetic dislocation and reduces postoperative DVT/PE risk.',
      },
    ],
    evaluationCriteria: [
      'Warm, pink extremity with palpable pedal pulses and no unilateral calf swelling.',
    ],
    patientEducation: [
      'Use elevated toilet seat and reacher; report sudden calf pain, warmth, or shortness of breath.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Orthopedic Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-preeclampsia',
    slug: 'preeclampsia-magnesium-safety',
    title: 'Preeclampsia & Magnesium Sulfate Safety',
    shortSummary: 'Monitor maternal-fetal perfusion, seizure prophylaxis with magnesium sulfate, and toxicity antidote readiness.',
    category: 'Maternal-Newborn',
    bodySystem: 'Maternal-Newborn',
    relatedConditions: ['Gestational Hypertension', 'HELLP Syndrome', 'Eclampsia'],
    searchKeywords: ['preeclampsia', 'magnesium sulfate', 'calcium gluconate', 'clonus', 'proteinuria', 'RUQ pain'],
    assessmentCues: {
      subjective: ['Severe unrelieved headache', 'Visual disturbances (scotomata)', 'Right upper quadrant / epigastric pain'],
      objective: ['BP >= 140/90 mmHg (severe >= 160/110)', 'Proteinuria', 'Hyperreflexia (3+ to 4+ DTRs) or clonus'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Risk for Maternal Injury (Eclamptic Seizure) / Impaired Uteroplacental Perfusion',
        relatedFactors: ['Generalized vasospasm and endothelial dysfunction'],
        definingCharacteristics: ['Severe hypertension', 'Hyperreflexia', 'Headache'],
      },
    ],
    goalsAndOutcomes: [
      'Client will remain seizure-free with magnesium levels therapeutic and respirations >= 12/min.',
    ],
    nursingInterventions: [
      {
        intervention: 'Administer IV magnesium sulfate via infusion pump and assess DTRs, respiratory rate, and urine output hourly; keep calcium gluconate at bedside.',
        rationale: 'Loss of patellar reflexes precedes respiratory depression in magnesium toxicity; calcium gluconate is the immediate antidote.',
      },
      {
        intervention: 'Position client in left lateral recumbent position in a quiet, low-stimulation room.',
        rationale: 'Left lateral positioning relieves vena cava compression to optimize uteroplacental blood flow.',
      },
    ],
    evaluationCriteria: [
      'No eclamptic seizures; DTRs 2+, RR >= 12/min, urine output >= 30 mL/hr, reassuring fetal heart rate.',
    ],
    patientEducation: [
      'Report persistent headache, blurred vision, RUQ pain, or decreased fetal movement immediately.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Perinatal Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-bronchiolitis',
    slug: 'pediatric-bronchiolitis-rsv',
    title: 'Pediatric Bronchiolitis (RSV)',
    shortSummary: 'Prioritize nasal suctioning before feeds, hydration support, and contact/droplet isolation in infants.',
    category: 'Pediatrics',
    bodySystem: 'Pediatrics',
    relatedConditions: ['Respiratory Syncytial Virus', 'Infant Respiratory Distress'],
    searchKeywords: ['bronchiolitis', 'RSV', 'nasal suction', 'retractions', 'pediatrics', 'infant'],
    assessmentCues: {
      subjective: ['Poor feeding', 'Irritability or lethargy reported by caregiver'],
      objective: ['Nasal flaring and subcostal/intercostal retractions', 'Tachypnea (> 60/min in infants)', 'Copious nasal secretions', 'Wheezes/crackles'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Ineffective Airway Clearance',
        relatedFactors: ['Edematous bronchioles and copious thick nasal secretions in obligate nose breathers'],
        definingCharacteristics: ['Nasal congestion', 'Retractions', 'Tachypnea', 'Decreased oral intake'],
      },
    ],
    goalsAndOutcomes: [
      'Infant will maintain patent airway, SpO2 >= 92%, and adequate hydration (>= 6 wet diapers/24 hr).',
    ],
    nursingInterventions: [
      {
        intervention: 'Perform gentle bulb or nasal suctioning with saline drops before feedings and sleep.',
        rationale: 'Young infants are obligate nose breathers; clearing the nares immediately reduces work of breathing and improves feeding.',
      },
      {
        intervention: 'Monitor hydration status, offer small frequent feeds (or IV fluids if RR > 60/min), and maintain contact precautions.',
        rationale: 'Tachypneic infants are at high aspiration risk during oral feeds; RSV spreads via respiratory droplets and fomites.',
      },
    ],
    evaluationCriteria: [
      'Reduced retractions, SpO2 >= 92%, and moist mucous membranes with adequate wet diapers.',
    ],
    patientEducation: [
      'Teach caregivers safe bulb syringe technique and red flags (grunting, head bobbing, < 3 wet diapers/day).',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Pediatric Respiratory Care (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
  {
    id: 'cp-depression-safety',
    slug: 'major-depressive-disorder-suicide-safety',
    title: 'Major Depressive Disorder & Suicide Safety',
    shortSummary: 'Maintain environmental ligature safety, direct suicide risk assessment, and therapeutic presence.',
    category: 'Mental Health',
    bodySystem: 'Mental Health',
    relatedConditions: ['Suicidal Ideation', 'Bipolar Depression', 'SSRI Initiation'],
    searchKeywords: ['depression', 'suicide', 'safety', 'one-to-one', 'SSRI', 'therapeutic communication'],
    assessmentCues: {
      subjective: ['Hopelessness', 'Thoughts of self-harm or a specific plan', 'Anhedonia'],
      objective: ['Psychomotor retardation or agitation', 'Giving away possessions', 'Sudden calm or energy surge after starting antidepressants'],
    },
    nursingDiagnoses: [
      {
        diagnosis: 'Risk for Suicide / Self-Directed Violence',
        relatedFactors: ['Severe depressive episode', 'Hopelessness and recent stressor'],
        definingCharacteristics: ['Expressed suicidal ideation', 'Access to lethal means'],
      },
    ],
    goalsAndOutcomes: [
      'Client will remain free from self-harm throughout hospitalization and engage in a collaborative safety plan.',
    ],
    nursingInterventions: [
      {
        intervention: 'Initiate continuous one-to-one observation as indicated and remove all ligature hazards, sharps, belts, and glass.',
        rationale: 'Direct environmental control and continuous observation are the primary interventions for acute suicide risk.',
      },
      {
        intervention: 'Ask directly and non-judgmentally about suicidal thoughts, intent, and plan; monitor closely during early antidepressant therapy.',
        rationale: 'Asking directly does not plant ideation; returning energy on SSRIs can precede mood improvement and transiently raise action risk.',
      },
    ],
    evaluationCriteria: [
      'Client remains safe, verbalizes coping contacts, and identifies crisis resources (e.g., 988).',
    ],
    patientEducation: [
      'Antidepressants often take 2–6 weeks for full effect; never stop abruptly and report worsening thoughts immediately.',
    ],
    references: ['NURVIA Clinical Nursing Guidelines — Psychiatric Safety (v1.0)'],
    publicationStatus: 'Published',
    source: 'NURVIA Local Clinical Library',
    contentVersion: '1.0.0',
  },
];

export interface CarePlansLoadResult {
  plans: CarePlanRecord[];
  localCount: number;
  remoteCount: number;
  remoteStatus: 'not_provisioned' | 'loaded' | 'error';
  remoteMessage?: string;
}

function mapRemoteCarePlan(dto: CarePlanDto): CarePlanRecord {
  const slugBase = dto.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return {
    id: dto.id,
    slug: slugBase || dto.id,
    title: dto.title,
    shortSummary: `${dto.diagnosis}${dto.relatedTo ? ` related to ${dto.relatedTo}` : ''}`,
    category: dto.specialty || 'Med-Surg',
    bodySystem: dto.specialty || 'Med-Surg',
    relatedConditions: [dto.title],
    searchKeywords: [dto.title, dto.specialty, dto.diagnosis, dto.relatedTo].filter(Boolean),
    assessmentCues: { subjective: [], objective: [] },
    nursingDiagnoses: [
      {
        diagnosis: dto.diagnosis,
        relatedFactors: dto.relatedTo ? [dto.relatedTo] : [],
        definingCharacteristics: [],
      },
    ],
    goalsAndOutcomes: dto.outcomes ?? [],
    nursingInterventions: (dto.interventions ?? []).map((item) => ({
      intervention: item,
      rationale: dto.rationale || 'Evidence-based clinical nursing rationale.',
    })),
    evaluationCriteria: [],
    patientEducation: [],
    references: ['Verified Remote Backend Care Plan'],
    publicationStatus: 'Published',
    lifecycleStatus: 'Published',
    clinicalReviewStatus: 'reviewed',
    ownership: 'Verified Remote Backend',
    source: 'Verified Remote Backend',
    contentVersion: 'remote',
  };
}

export function isCarePlanEligibleForCatalogue(plan: CarePlanRecord): boolean {
  if (plan.publicationStatus !== 'Published') return false;
  const lifecycle = plan.lifecycleStatus ?? 'Published';
  if (lifecycle === 'Draft' || lifecycle === 'Review' || lifecycle === 'Archived' || lifecycle === 'Withdrawn') {
    return false;
  }
  if (plan.clinicalReviewStatus && plan.clinicalReviewStatus !== 'reviewed') {
    return false;
  }
  return true;
}

export function mergeCarePlans(
  localPlans: readonly CarePlanRecord[] = LOCAL_CARE_PLANS,
  remoteDtos: readonly CarePlanDto[] = []
): CarePlanRecord[] {
  const byKey = new Map<string, CarePlanRecord>();
  for (const plan of localPlans) {
    if (!isCarePlanEligibleForCatalogue(plan)) continue;
    byKey.set(plan.slug.toLowerCase(), {
      ...plan,
      lifecycleStatus: plan.lifecycleStatus ?? 'Published',
      clinicalReviewStatus: plan.clinicalReviewStatus ?? 'reviewed',
      ownership: plan.ownership ?? 'NURVIA-authored',
      author: plan.author ?? 'NURVIA Clinical Nursing Team',
    });
  }
  for (const dto of remoteDtos) {
    const mapped = mapRemoteCarePlan(dto);
    const key = mapped.slug.toLowerCase();
    if (!byKey.has(key) && !Array.from(byKey.values()).some((p) => p.id === mapped.id)) {
      byKey.set(key, mapped);
    }
  }
  return Array.from(byKey.values());
}

export async function loadCarePlansCatalogue(options?: {
  remoteFetcher?: () => Promise<{ success: boolean; statusCode?: number; errorCode?: string; message?: string; data?: CarePlanDto[] }>;
}): Promise<CarePlansLoadResult> {
  const publishedLocal = mergeCarePlans(LOCAL_CARE_PLANS, []);
  if (!options?.remoteFetcher) {
    return {
      plans: publishedLocal,
      localCount: publishedLocal.length,
      remoteCount: 0,
      remoteStatus: 'not_provisioned',
      remoteMessage: 'Remote care-plan endpoint is not provisioned on the shared backend; serving verified local library.',
    };
  }
  try {
    const res = await options.remoteFetcher();
    if (res.success && Array.isArray(res.data)) {
      const merged = mergeCarePlans(publishedLocal, res.data);
      return { plans: merged, localCount: publishedLocal.length, remoteCount: res.data.length, remoteStatus: 'loaded' };
    }
    if (res.statusCode === 501 || res.errorCode === 'NOT_PROVISIONED') {
      return { plans: publishedLocal, localCount: publishedLocal.length, remoteCount: 0, remoteStatus: 'not_provisioned', remoteMessage: res.message };
    }
    return { plans: publishedLocal, localCount: publishedLocal.length, remoteCount: 0, remoteStatus: 'error', remoteMessage: res.message || 'Remote care-plan retrieval failed; showing local library.' };
  } catch {
    return { plans: publishedLocal, localCount: publishedLocal.length, remoteCount: 0, remoteStatus: 'error', remoteMessage: 'Remote care-plan retrieval failed; showing local library.' };
  }
}

export function getCarePlanBySlug(slug: string, plans: readonly CarePlanRecord[] = LOCAL_CARE_PLANS): CarePlanRecord | null {
  const normalized = slug.trim().toLowerCase();
  return plans.find((p) => p.slug.toLowerCase() === normalized || p.id.toLowerCase() === normalized) ?? null;
}

export function getRelatedCarePlans(plan: CarePlanRecord, plans: readonly CarePlanRecord[] = LOCAL_CARE_PLANS): CarePlanRecord[] {
  return plans.filter((p) => p.slug !== plan.slug && (p.bodySystem === plan.bodySystem || p.category === plan.category)).slice(0, 3);
}
