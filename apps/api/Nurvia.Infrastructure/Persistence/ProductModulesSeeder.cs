using Microsoft.EntityFrameworkCore;
using Nurvia.Domain.Billing;
using Nurvia.Domain.Community;
using Nurvia.Domain.Learning;

namespace Nurvia.Infrastructure.Persistence;

public static class ProductModulesSeeder
{
    public static async Task SeedAsync(NurviaDbContext db, CancellationToken ct = default)
    {
        if (!await db.Flashcards.AnyAsync(ct))
        {
            db.Flashcards.AddRange(
                new Flashcard
                {
                    Category = "Pharmacology",
                    Pathway = "RN",
                    Front = "What is the therapeutic serum level for Lithium Carbonate, and what are early signs of toxicity?",
                    Back = "Therapeutic Range: 0.6 to 1.2 mEq/L. Early toxicity (1.5–2.0 mEq/L): Nausea, vomiting, diarrhea, coarse hand tremors, lethargy, and slurred speech.",
                    Hint = "Think narrow therapeutic window and GI + neuromuscular signs.",
                    IsSystemCard = true
                },
                new Flashcard
                {
                    Category = "Maternal-Newborn",
                    Pathway = "RN",
                    Front = "What is the priority nursing intervention when late decelerations are noted on electronic fetal monitoring?",
                    Back = "Reposition client to left-lateral position, discontinue oxytocin infusion, apply high-flow oxygen via non-rebreather (8–10 L/min), and increase IV maintenance fluids to correct uteroplacental insufficiency.",
                    Hint = "LION: Left lateral, IV fluid, Oxygen, Notify / stop oxytocin.",
                    IsSystemCard = true
                },
                new Flashcard
                {
                    Category = "Pharmacology",
                    Pathway = "RN",
                    Front = "What is the antidote for unfractionated heparin-induced anticoagulation excess?",
                    Back = "Protamine Sulfate (1 mg neutralizes approximately 100 units of unfractionated heparin).",
                    Hint = "Vitamin K is for warfarin; this is for heparin.",
                    IsSystemCard = true
                },
                new Flashcard
                {
                    Category = "Fundamentals",
                    Pathway = "PN",
                    Front = "Which electrolyte imbalance places a client taking furosemide at highest risk for digoxin toxicity?",
                    Back = "Hypokalemia (serum K+ < 3.5 mEq/L). Low potassium increases digoxin binding to cardiac Na+/K+ ATPase pumps, precipitating arrhythmias.",
                    Hint = "Loop diuretics waste potassium.",
                    IsSystemCard = true
                },
                new Flashcard
                {
                    Category = "Med-Surg",
                    Pathway = "RN",
                    Front = "What are the classic triad signs of cardiac tamponade (Beck's Triad)?",
                    Back = "1. Hypotension (narrowed pulse pressure)\n2. Jugular venous distention (JVD)\n3. Muffled / distant heart sounds.",
                    Hint = "Fluid in the pericardial sac compresses the heart.",
                    IsSystemCard = true
                },
                new Flashcard
                {
                    Category = "Pediatrics",
                    Pathway = "RN",
                    Front = "What is the priority nursing action for a child presenting with acute epiglottitis (drooling, tripod position, inspiratory stridor)?",
                    Back = "Maintain a calm airway, do NOT inspect the throat with a tongue depressor, keep the child upright, and prepare for immediate endotracheal intubation.",
                    Hint = "Never agitate or insert a tongue blade into the oropharynx.",
                    IsSystemCard = true
                }
            );
        }

        if (!await db.CarePlans.AnyAsync(ct))
        {
            db.CarePlans.AddRange(
                new CarePlan
                {
                    Title = "Heart Failure (Fluid Volume Excess)",
                    Specialty = "Med-Surg",
                    Diagnosis = "Excess Fluid Volume related to decreased cardiac output and renal perfusion",
                    RelatedTo = "Compromised regulatory mechanisms secondary to biventricular pump failure",
                    OutcomesText = "Client maintains clear lung sounds bilaterally without adventitious crackles\nEuvolemia demonstrated by stable daily weight and absence of peripheral pitting edema",
                    InterventionsText = "Auscultate breath sounds and assess for S3 gallop every 4 hours\nMonitor daily weights on the same scale at the same time each morning\nAdminister prescribed loop diuretics and ACE inhibitors while monitoring serum potassium and creatinine\nPosition client in high-Fowler's to reduce venous return and ease work of breathing",
                    Rationale = "Early detection of pulmonary vascular congestion enables prompt diuretic titration prior to acute respiratory distress.",
                    IsSystemPlan = true
                },
                new CarePlan
                {
                    Title = "Type 1 Diabetes (Diabetic Ketoacidosis)",
                    Specialty = "Critical Care",
                    Diagnosis = "Deficient Fluid Volume and Metabolic Acidosis related to osmotic diuresis and ketoacid accumulation",
                    RelatedTo = "Absolute insulin deficiency and hyperosmolar hyperglycemia",
                    OutcomesText = "Serum potassium maintained between 3.5 and 5.0 mEq/L during continuous regular insulin infusion\nAnion gap normalizes and arterial pH exceeds 7.30",
                    InterventionsText = "Initiate isotonic 0.9% NaCl fluid resuscitation prior to insulin therapy\nVerify serum potassium is above 3.3 mEq/L before starting IV regular insulin infusion\nMonitor blood glucose hourly and transition to D5W-containing fluids when glucose drops below 250 mg/dL",
                    Rationale = "Insulin drives extracellular potassium intracellularly; administering insulin without adequate baseline potassium precipitates fatal cardiac arrhythmias.",
                    IsSystemPlan = true
                },
                new CarePlan
                {
                    Title = "Postpartum Hemorrhage Risk",
                    Specialty = "Maternal-Newborn",
                    Diagnosis = "Risk for Bleeding related to uterine atony secondary to prolonged oxytocin augmentation",
                    RelatedTo = "Myometrial fatigue and retained placental fragments",
                    OutcomesText = "Uterine fundus remains firm, midline, and at or below umbilicus\nLochia rubra remains moderate without saturating more than 1 perineal pad per hour",
                    InterventionsText = "Perform firm fundal massage immediately upon noting a boggy uterus\nAssist client to void or perform straight catheterization if bladder distention displaces the fundus\nAdminister prescribed uterotonics (oxytocin, methylergonovine, or carboprost) after verifying contraindications",
                    Rationale = "Uterine massage stimulates myometrial smooth muscle contraction, compressing open placental site sinuses to arrest hemorrhage.",
                    IsSystemPlan = true
                },
                new CarePlan
                {
                    Title = "Pediatric Acute Asthma Exacerbation",
                    Specialty = "Pediatrics",
                    Diagnosis = "Impaired Gas Exchange related to bronchospasm, mucosal edema, and increased secretions",
                    RelatedTo = "Hyperreactive airway response triggered by viral upper respiratory tract infection",
                    OutcomesText = "Client achieves SpO2 >= 95% on room air with decrease in accessory muscle retractions\nRespiratory rate returns to baseline within pediatric age-adjusted norms",
                    InterventionsText = "Administer prescribed short-acting beta2 agonist (albuterol) via metered-dose inhaler with spacer or nebulizer\nAdminister systemic corticosteroids early to reduce airway inflammation\nMonitor for silent chest or waning breath sounds indicating impending respiratory failure",
                    Rationale = "Rapid bronchodilation relieves airflow obstruction and reverses acute alveolar hypoventilation.",
                    IsSystemPlan = true
                },
                new CarePlan
                {
                    Title = "Major Depressive Disorder (Self-Harm Risk)",
                    Specialty = "Mental Health",
                    Diagnosis = "Risk for Self-Directed Violence related to profound hopelessness and vegetative signs",
                    RelatedTo = "Neurochemical imbalance and severe psychological distress",
                    OutcomesText = "Client verbalizes intent to seek nurse assistance if thoughts of self-harm intensify\nClient identifies at least two positive coping mechanisms to manage acute despair",
                    InterventionsText = "Maintain 15-minute irregular safety checks and remove environmental ligature or sharp hazards\nEstablish a trusting, non-judgmental therapeutic alliance\nAssess directly for suicidal ideation, plan, and lethality",
                    Rationale = "Irregular intervals prevent predictable windows while frequent nurse presence fosters safety and emotional containment.",
                    IsSystemPlan = true
                }
            );
        }

        if (!await db.StudyGuides.AnyAsync(ct))
        {
            db.StudyGuides.AddRange(
                new StudyGuide
                {
                    Title = "High-Yield Pharmacology: Drug Suffixes & Antidotes",
                    Slug = "pharmacology-suffixes-and-antidotes",
                    Category = "Pharmacology",
                    Pathway = "RN",
                    Summary = "Master high-frequency NCLEX and ATI drug classes, therapeutic serum ranges, black-box warnings, and reversal agents.",
                    ReadingMinutes = 12,
                    IsPublished = true,
                    ContentMarkdown = """
                    # High-Yield Pharmacology: Drug Suffixes & Antidotes

                    ## 1. Essential Suffixes
                    - **-pril** (ACE Inhibitors: Lisinopril, Enalapril): Watch for dry cough, angioedema, hyperkalemia, and first-dose hypotension. Contraindicated in pregnancy.
                    - **-sartan** (ARBs: Losartan, Valsartan): Similar to ACE inhibitors without the dry cough; monitor potassium and renal function.
                    - **-olol** (Beta-Blockers: Metoprolol, Propranolol): Hold if HR < 60 bpm or SBP < 100 mmHg. Avoid non-selective beta-blockers in asthma/COPD.
                    - **-statin** (HMG-CoA Reductase Inhibitors): Administer in the evening; report unexplained muscle pain (rhabdomyolysis) and monitor LFTs.
                    - **-mycin / -micin** (Aminoglycosides: Gentamicin, Vancomycin): Nephrotoxic & ototoxic; draw peak and trough serum levels.

                    ## 2. Critical Antidotes
                    | Medication / Toxin | Antidote / Reversal Agent |
                    |---|---|
                    | Warfarin | Vitamin K (Phytonadione) |
                    | Unfractionated Heparin | Protamine Sulfate |
                    | Opioids | Naloxone |
                    | Acetaminophen | Acetylcysteine (Mucomyst) |
                    | Benzodiazepines | Flumazenil |
                    | Magnesium Sulfate | Calcium Gluconate |
                    | Digoxin | Digoxin Immune Fab |
                    """
                },
                new StudyGuide
                {
                    Title = "Fluid, Electrolyte & Acid-Base Clinical Pocket Guide",
                    Slug = "fluid-electrolyte-acid-base-guide",
                    Category = "Med-Surg",
                    Pathway = "RN",
                    Summary = "Rapid-reference guide to normal serum electrolyte ranges, ECG changes, ROME ABG interpretation, and priority interventions.",
                    ReadingMinutes = 10,
                    IsPublished = true,
                    ContentMarkdown = """
                    # Fluid, Electrolyte & Acid-Base Clinical Pocket Guide

                    ## 1. Critical Serum Ranges
                    - **Sodium (Na+):** 135–145 mEq/L — Neurological status is the priority assessment.
                    - **Potassium (K+):** 3.5–5.0 mEq/L — Cardiac rhythm (ECG) is the priority assessment. Never give IV K+ as a push!
                    - **Calcium (Ca2+):** 8.5–10.5 mg/dL — Hypocalcemia causes Chvostek's & Trousseau's signs and laryngospasm.
                    - **Magnesium (Mg2+):** 1.3–2.1 mEq/L — Hypermagnesemia depresses DTRs and respiratory drive.

                    ## 2. ABG Interpretation (ROME)
                    - **pH:** 7.35–7.45
                    - **PaCO2:** 35–45 mmHg (Respiratory — Opposite)
                    - **HCO3-:** 22–26 mEq/L (Metabolic — Equal)
                    """
                },
                new StudyGuide
                {
                    Title = "Maternal-Newborn & Obstetric Emergencies",
                    Slug = "maternal-newborn-obstetric-emergencies",
                    Category = "Maternal-Newborn",
                    Pathway = "RN",
                    Summary = "Fetal heart rate monitoring (VEAL CHOP), magnesium sulfate toxicity, postpartum hemorrhage, and newborn resuscitation.",
                    ReadingMinutes = 11,
                    IsPublished = true,
                    ContentMarkdown = """
                    # Maternal-Newborn & Obstetric Emergencies

                    ## 1. Fetal Heart Rate Patterns (VEAL CHOP)
                    - **V**ariable decelerations → **C**ord compression → Reposition mother (knee-chest or lateral).
                    - **E**arly decelerations → **H**ead compression → Normal finding during active labor; continue monitoring.
                    - **A**ccelerations → **O**kay / fetal well-being → Reassuring.
                    - **L**ate decelerations → **P**lacental insufficiency → Left lateral, stop oxytocin, O2, IV fluids.

                    ## 2. Postpartum Hemorrhage
                    - #1 cause: **Uterine atony**.
                    - Priority action: **Massage the uterine fundus** and assess bladder distention.
                    """
                },
                new StudyGuide
                {
                    Title = "PN/LPN Scope of Practice & Delegation Priorities",
                    Slug = "pn-lpn-scope-and-delegation",
                    Category = "Leadership",
                    Pathway = "PN",
                    Summary = "Clear delineation of RN, LPN/LVN, and UAP delegation rules for NCLEX-PN and ATI Management of Care.",
                    ReadingMinutes = 8,
                    IsPublished = true,
                    ContentMarkdown = """
                    # PN/LPN Scope of Practice & Delegation Priorities

                    ## 1. LPN/LVN Responsibilities
                    - Care for **stable clients** with predictable outcomes.
                    - Perform sterile dressing changes, urinary catheterization, enteral tube feedings, and oral/IM/subcutaneous medications.
                    - Reinforce teaching initiated by the RN.

                    ## 2. Retain with the RN (Do NOT Delegate)
                    - Initial assessments, admission assessments, and care plan formulation.
                    - IV push medications, blood product administration, and unstable/acute-change clients.
                    """
                }
            );
        }

        if (!await db.CommunityPosts.AnyAsync(ct))
        {
            var post1 = new CommunityPost
            {
                ChannelId = "ati-hesi-debriefs",
                ChannelName = "ATI & HESI Specialty Debriefs",
                AuthorUserId = "system",
                AuthorName = "Brianna M., BSN Senior",
                CohortLabel = "Spring 2026 NCLEX Cohort",
                Title = "How did everyone study for the ATI Maternal Newborn Level 3?",
                Content = "I'm scoring around 74% right now. What specific topics on fetal monitoring and postpartum hemorrhage gave you the biggest boost?",
                CreatedAtUtc = DateTime.UtcNow.AddHours(-2)
            };
            var post2 = new CommunityPost
            {
                ChannelId = "clinical-cases",
                ChannelName = "NGN Unfolding Case Study Debriefs",
                AuthorUserId = "system",
                AuthorName = "Darius K., Accelerated BSN",
                CohortLabel = "RN Pre-Licensure Track",
                Title = "NGN BowTie and Matrix item practice tips",
                Content = "Make sure you read the nurses notes first! If you see trending fever and crackles, prioritize pneumonia or atelectasis before jumping to cardiac.",
                CreatedAtUtc = DateTime.UtcNow.AddHours(-5)
            };
            db.CommunityPosts.AddRange(post1, post2);
            db.CommunityReplies.Add(new CommunityReply
            {
                PostId = post1.Id,
                AuthorUserId = "system",
                AuthorName = "Elena R., Nursing Tutor",
                Content = "Focus on VEAL CHOP for FHR strips and the 4 T's of postpartum hemorrhage (Tone, Trauma, Tissue, Thrombin). Uterine atony is almost always tested!",
                CreatedAtUtc = DateTime.UtcNow.AddHours(-1)
            });
        }

        if (!await db.SubscriptionPlans.AnyAsync(ct))
        {
            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    Code = "FREE",
                    Name = "Free Starter",
                    Description = "Core access to public Mark K. lecture notes, clinical dosage calculators, and starter practice exams.",
                    MonthlyPriceUsd = 0m,
                    BillingInterval = "Free",
                    FeaturesText = "Public Mark K. Lecture Notes\nClinical Dosage Calculators\nStarter Practice Examinations\nStudy Planner & Saved Questions",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    Code = "PRO_MONTHLY",
                    Name = "NURVIA Pro",
                    Description = "Full access to all NGN unfolding case studies, 18 canonical item formats, Socratic AI tutor sessions, and spaced repetition decks.",
                    MonthlyPriceUsd = 29.00m,
                    BillingInterval = "Monthly",
                    FeaturesText = "All Published RN & PN Examinations\nFull 12-Lecture Mark K. Archive\nSocratic AI Clinical Tutor\nUnlimited Spaced Repetition Flashcards\nDownloadable Study Guides",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    Code = "INSTITUTIONAL",
                    Name = "Cohort & Institutional",
                    Description = "Managed seat licensing for nursing schools, clinical instructors, and graduating NCLEX cohorts.",
                    MonthlyPriceUsd = 79.00m,
                    BillingInterval = "Monthly",
                    FeaturesText = "Everything in NURVIA Pro\nInstructor Cohort Analytics\nAdmin-Granted Seat Entitlements\nPriority Assessment Scheduling",
                    IsActive = true
                }
            );
        }

        await db.SaveChangesAsync(ct);
    }
}
