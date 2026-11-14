using Microsoft.EntityFrameworkCore;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Lectures;

namespace Nurvia.Infrastructure.Persistence;

/// <summary>
/// Seeds the twelve Mark K.-series lecture records that make up the NURVIA
/// lecture catalogue. All content is original NURVIA educational material;
/// NURVIA is independent and is not affiliated with, endorsed by, or officially
/// connected to Mark Klimek or Klimek Reviews.
///
/// Seeding is idempotent and independent of the question/exam seed: lectures
/// are inserted only when the Lectures table is empty, so existing databases
/// with question content are still populated with the lecture catalogue.
/// Lectures 1-3 are public (open to visitors); lectures 4-12 require an
/// authenticated learner account.
/// </summary>
public static class LectureSeeder
{
    private const string SeedAuthor = "NURVIA Nurse Educator, MSN, RN";

    public static async Task SeedAsync(NurviaDbContext context)
    {
        if (await context.Lectures.AnyAsync())
        {
            return; // Lecture catalogue already seeded
        }

        var now = DateTime.UtcNow;

        // ---------------------------------------------------------------
        // 1. Public lecture — Acid-Base / Ventilator Alarms
        // ---------------------------------------------------------------
        var lecture1 = new Lecture(
            1,
            "acid-base-ventilator-alarms",
            "Acid-Base/Ventilator Alarms",
            "Critical Care & Respiratory",
            "Interpret arterial blood gases using the Tic-Tac-Toe method, recognize compensation, and troubleshoot every mechanical ventilator alarm.",
            """
            ## Acid-Base Interpretation

            ### The Four Core Values
            - **pH**: 7.35-7.45 (acidosis below, alkalosis above)
            - **PaCO2**: 35-45 mmHg (respiratory component — an acid)
            - **HCO3**: 22-26 mEq/L (metabolic component — a base)
            - **PaO2**: 80-100 mmHg (oxygenation, not acid-base)

            ### Tic-Tac-Toe Method
            1. Draw a 3x3 grid. Label the top row **acidosis / normal / alkalosis**.
            2. Place **pH** in the row matching its value, then **PaCO2** (acid row if high) and **HCO3** (base row if high).
            3. Whichever column has **two values** names the primary disorder; the odd value out is compensation.
            4. If pH is abnormal, the disorder is **uncompensated**; if pH is normal but PaCO2 and HCO3 are both abnormal, it is **fully compensated**.

            ### Worked Examples
            | pH | PaCO2 | HCO3 | Interpretation |
            |----|-------|------|----------------|
            | 7.30 | 50 | 24 | Uncompensated respiratory acidosis |
            | 7.48 | 38 | 30 | Uncompensated metabolic alkalosis |
            | 7.38 | 60 | 36 | Fully compensated respiratory acidosis |
            | 7.31 | 35 | 16 | Uncompensated metabolic acidosis |

            ### Causes To Memorize
            - **Respiratory acidosis**: hypoventilation — opioid sedation, COPD, respiratory depression, neuromuscular disease.
            - **Respiratory alkalosis**: hyperventilation — anxiety, fever, pain, early sepsis, mechanical overventilation.
            - **Metabolic acidosis**: DKA, renal failure, sepsis/lactic acid, severe diarrhea, salicylate toxicity.
            - **Metabolic alkalosis**: vomiting/NG suction (acid loss), diuretic overuse, excessive sodium bicarbonate, hyperaldosteronism.

            ## Ventilator Alarms

            **High-pressure alarm** — something is blocking or resisting airflow:
            - Kinked tubing, water in the circuit, biting the endotracheal tube, secretions/mucus plug, bronchospasm, coughing, worsening pneumothorax.
            - *First actions*: assess the patient, auscultate, suction if secretions are present, check the circuit; ventilate manually with a resuscitation bag if the problem is unresolved.

            **Low-pressure alarm** — air is escaping the system:
            - Disconnected tubing, cuff leak (the most likely culprit for a persistent low-pressure alarm), circuit leak.
            - *First actions*: follow the tubing from the ventilator to the patient; reconnect; check cuff pressure.

            **Other alarms**: low exhaled volume (leak or shallow breaths), apnea alarm (spontaneous mode breathing stopped), high respiratory rate (patient-ventilator asynchrony, pain, or anxiety).

            ## NCLEX Practice Points
            - Sudden high-pressure alarm + absent breath sounds on one side + tracheal deviation = **tension pneumothorax**; prepare for needle decompression.
            - Never silence an alarm without assessing the patient first.
            - Suction only as needed, pre-oxygenate, limit to ~10 seconds per pass.
            """,
            new[]
            {
                "Tic-Tac-Toe method for ABG interpretation",
                "High-pressure alarm = obstruction (kink, secretions, biting, pneumothorax)",
                "Low-pressure alarm = leak or disconnection (check cuff first)",
                "Respiratory acidosis causes: hypoventilation",
                "Metabolic acidosis causes: DKA, renal failure, diarrhea",
                "Compensation rules: pH abnormal = uncompensated",
                "Assess before silencing any ventilator alarm"
            },
            LectureAccessLevel.Public,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 2. Public lecture — Alcohol Withdrawal / Wernicke-Korsakoff / Overdose
        // ---------------------------------------------------------------
        var lecture2 = new Lecture(
            2,
            "alcohol-withdrawal-wernicke-overdose",
            "Alcohol Withdrawal/Wernicke-Korsakoff/Overdose",
            "Psychiatric & Substance Use",
            "Manage alcohol withdrawal safely with the CIWA protocol, prevent Wernicke-Korsakoff syndrome with thiamine, and prioritize antidotes for common overdoses.",
            """
            ## Alcohol Withdrawal

            **Timeline** (symptoms peak 24-72 hours after the last drink):
            - 4-12 hours: tremors, diaphoresis, anxiety, anorexia.
            - 12-48 hours: hallucinations (visual/auditory), agitation.
            - 24-72 hours: **delirium tremens** — confusion, severe autonomic instability (tachycardia, hypertension, hyperthermia), seizures. DTs are a medical emergency and can be fatal.

            **CIWA-Ar nursing protocol**: score tremor, sweating, anxiety, agitation, headache, nausea, orientation, and visual disturbances. Higher scores drive benzodiazepine dosing (chlordiazepoxide, lorazepam, or diazepam per protocol). Reassess frequently; never leave a withdrawing patient unstimulated and unsupervised.

            **Priority nursing actions**: seizure precautions, frequent vital signs and neuro checks, calm low-stimulation environment, bright lights off, orientation restraints avoided when possible, thiamine before glucose.

            ## Wernicke-Korsakoff Syndrome

            - **Cause**: thiamine (vitamin B1) deficiency in chronic alcohol use. Always give thiamine **before** IV glucose — glucose infusion can precipitate or worsen it.
            - **Wernicke's encephalopathy (acute, reversible)**: confusion, ataxia, ophthalmoplegia (nystagmus/eye-movement palsy). Treat with immediate parenteral thiamine.
            - **Korsakoff psychosis (chronic, largely irreversible)**: anterograde amnesia, confabulation (fabricating stories to fill memory gaps), personality change.
            - NCLEX cue: a confused, ataxic alcoholic patient who confabulates = think thiamine deficiency, not intoxication alone.

            ## Overdose Antidotes and Priorities

            | Agent | Presentation | Antidote / Priority |
            |-------|--------------|---------------------|
            | Acetaminophen | Delayed hepatotoxicity (RUQ pain, jaundice) | N-acetylcysteine |
            | Opioids | Respiratory depression, pinpoint pupils | Naloxone (reassess — it wears off sooner than most opioids) |
            | Benzodiazepines | Sedation, ataxia | Flumazenil (caution: seizure risk in dependent patients) |
            | Tricyclic antidepressants | Anticholinergic toxidrome, dysrhythmias | Sodium bicarbonate for QRS widening |
            | Warfarin | Bleeding | Vitamin K (+ PCC if severe) |
            | Beta blockers | Bradycardia, hypotension | Glucagon/atropine per protocol |

            **Decontamination**: activated charcoal within about an hour of ingestion for suitable agents; never induce emesis; charcoal is contraindicated with depressed consciousness unless the airway is protected.

            ## NCLEX Practice Points
            - Airway, breathing, circulation always precede antidote administration.
            - Naloxone's duration is shorter than most opioids — keep monitoring for re-sedation.
            - Thiamine before glucose in any patient with alcohol use disorder receiving IV dextrose.
            - Withdrawal seizure risk peaks in the first 72 hours — institute precautions on admission, not after the first seizure.
            """,
            new[]
            {
                "Delirium tremens peaks 24-72 hours and is life-threatening",
                "CIWA-Ar drives symptom-triggered benzodiazepine dosing",
                "Thiamine before glucose — prevents Wernicke's encephalopathy",
                "Wernicke triad: confusion, ataxia, ophthalmoplegia",
                "Korsakoff: confabulation + anterograde amnesia",
                "Naloxone for opioid overdose; watch for re-sedation",
                "N-acetylcysteine for acetaminophen toxicity"
            },
            LectureAccessLevel.Public,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 3. Public lecture — Thyroid / Adrenal / Calcium
        // ---------------------------------------------------------------
        var lecture3 = new Lecture(
            3,
            "thyroid-adrenal-calcium",
            "Thyroid/Adrenal/Calcium",
            "Endocrine",
            "Differentiate hypo- and hyper-thyroidism, master thyroid storm and myxedema coma, manage Addison's and Cushing's, and treat calcium derangements.",
            """
            ## Thyroid Disorders

            **Hypothyroidism** — everything slows down: fatigue, cold intolerance, weight gain, bradycardia, constipation, dry skin, brittle hair, heavy menses. Severe form = **myxedema coma** (hypothermia, unresponsiveness, respiratory depression) — treat with IV levothyroxine, cautious rewarming, airway support.
            Nursing care: levothyroxine in the morning on an empty stomach, monitor pulse (hold and notify if the rate exceeds the ordered parameter), lifelong therapy, avoid taking with iron or calcium supplements.

            **Hyperthyroidism** — everything speeds up: heat intolerance, weight loss, tachycardia, palpitations, diarrhea, exophthalmos (Graves' disease). Severe form = **thyroid storm** (fever, extreme tachydysrhythmia, delirium) — treat with antithyroid drugs (propylthiouracil/methimazole), beta blockers, iodine, cooling, glucocorticoids.
            Post-thyroidectomy priorities: keep tracheostomy/suction at the bedside, monitor for **laryngeal nerve injury** (hoarseness) and **hypocalcemia** (tingling around the mouth and fingertips, positive Chvostek/Trousseau signs) from accidental parathyroid removal, watch for hemorrhage causing airway compression.

            ## Adrenal Disorders

            **Addison's disease (adrenal insufficiency)** — low cortisol and aldosterone: hyponatremia, hyperkalemia, hypoglycemia, hypotension, bronze skin pigmentation, salt craving. Crisis = profound hypotension and shock; treat with IV hydrocortisone and aggressive IV fluids. Patients need lifelong steroid replacement with **sick-day dose increases**; never stop steroids abruptly.

            **Cushing's syndrome (excess cortisol)** — moon face, buffalo hump, truncal obesity, thin skin with striae and easy bruising, hyperglycemia, hypernatremia, hypokalemia, hypertension, immunosuppression. Nursing: blood glucose monitoring, fall precautions, infection vigilance, gradual steroid taper when iatrogenic.

            ## Calcium Derangements

            | | Hypocalcemia | Hypercalcemia |
            |---|---|---|
            | Key signs | Tingling lips/fingers, carpopedal spasm, Chvostek & Trousseau signs, laryngeal stridor, prolonged QT | Constipation, bone pain, kidney stones, confusion, shortened QT, deep bone pain |
            | Causes | Thyroid/parathyroid surgery, vitamin D deficiency, hypomagnesemia | Malignancy, hyperparathyroidism, thiazides, immobilization |
            | Treatment | IV calcium gluconate; treat coexisting low magnesium | IV fluids first, loop diuretics (NOT thiazides), calcitonin, bisphosphonates |

            ## NCLEX Practice Points
            - Hyperparathyroidism = high calcium; watch for confusion and falls before the numbers.
            - After thyroidectomy, the calcium assessment matters as much as the airway.
            - Addison's = "low and slow" (sodium, glucose, blood pressure); Cushing's = "high everything" except potassium and immunity.
            """,
            new[]
            {
                "Myxedema coma: hypothermia + unresponsiveness + bradycardia",
                "Thyroid storm: fever, tachydysrhythmia, delirium",
                "Post-thyroidectomy: airway, hoarseness (nerve injury), hypocalcemia",
                "Chvostek and Trousseau signs of hypocalcemia",
                "Addisonian crisis: IV hydrocortisone + fluids",
                "Cushing's: hyperglycemia, hypernatremia, hypokalemia",
                "Levothyroxine on empty stomach; monitor pulse"
            },
            LectureAccessLevel.Public,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 4. Learner lecture — Cardiac Telemetry / Chest Tubes
        // ---------------------------------------------------------------
        var lecture4 = new Lecture(
            4,
            "cardiac-telemetry-chest-tubes",
            "Cardiac Telemetry/Chest Tubes",
            "Cardiovascular",
            "Read telemetry strips systematically, recognize lethal rhythms, and manage chest tube systems and their emergencies.",
            """
            ## Systematic Rhythm Interpretation

            1. **Rate** (300 ÷ R-R interval in large squares for regular rhythms).
            2. **Rhythm** (regular vs irregular — calipers or paper march).
            3. **P waves** (one per QRS? upright in lead II?).
            4. **PR interval** (0.12-0.20 s).
            5. **QRS duration** (< 0.12 s = narrow).

            ### Rhythms That Matter
            - **Sinus bradycardia**: treat only if symptomatic — atropine 0.5-1 mg IV, then pacing/epinephrine per ACLS.
            - **Atrial fibrillation**: irregularly irregular, no true P waves; risk of embolic stroke — anticoagulation and rate control.
            - **First-degree AV block**: prolonged PR, every beat conducted — usually just monitor.
            - **Second-degree Mobitz II and third-degree block**: dropped beats without lengthening PR / complete AV dissociation — prepare for **transcutaneous pacing**; atropine may be tried but is often ineffective.
            - **Ventricular tachycardia with a pulse**: amiodarone/procainamide; pulseless VT and VF = immediate defibrillation + CPR.
            - **Asystole/PEA**: CPR and epinephrine — no defibrillation for asystole.

            ### Normal Values To Memorize
            - PR 0.12-0.20 s, QRS < 0.12 s, QT < half the R-R interval.
            - Potassium, magnesium, and calcium derangements cause dysrhythmias — check electrolytes on any new dangerous rhythm.

            ## Chest Tube Systems

            **Three-chamber drainage system**: collection chamber (drains the pleural space), water-seal chamber (prevents air re-entry — tidaling with respiration is expected), suction control chamber (gentle bubbling is expected with suction applied).

            ### Expected vs Emergency
            - **Expected**: tidaling in the water seal on spontaneous breathing; gentle continuous bubbling only in the suction chamber; drainage of up to ~70-100 mL/hour in the early postoperative period (per protocol).
            - **Continuous vigorous bubbling in the water-seal chamber** = an air leak in the system — check connections from the patient outward.
            - **Sudden bright-red drainage > 100 mL/hour or a gush** = hemorrhage — notify the provider immediately, prepare for reoperation.
            - **Drainage stops abruptly + respiratory distress** = occlusion (kink, clot) — never strip or milk without an order; assess first.

            ### Emergencies
            - **System dislodges from the patient**: cover the site with a sterile occlusive dressing and press on three sides (petrolatum gauze per protocol) — a completely sealed dressing can convert an open pneumothorax into a tension pneumothorax; have a chest tube tray ready.
            - **Tubing disconnects from the collection unit**: place the distal end in sterile water to re-establish a water seal (per most protocols) or reconnect aseptically.
            - **Never** clamp a chest tube without an order; never lower the collection unit below chest level.
            """,
            new[]
            {
                "Rate, rhythm, P waves, PR, QRS — systematic strip reading",
                "Atropine first for symptomatic sinus bradycardia",
                "Mobitz II / third-degree block: prepare for pacing",
                "Pulseless VT/VF: defibrillate; asystole: CPR only",
                "Water-seal tidaling expected; vigorous bubbling = air leak",
                "Chest tube falls out: occlusive dressing on three sides",
                "Bright red gush of drainage = hemorrhage; notify provider"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 5. Learner lecture — Congenital Heart Defects / Mobility
        // ---------------------------------------------------------------
        var lecture5 = new Lecture(
            5,
            "congenital-heart-defects-mobility",
            "Congenital Heart Defects/Mobility",
            "Pediatrics",
            "Sort congenital heart defects by blood-flow direction, recognize their classic signs, and apply pediatric mobility and safety principles.",
            """
            ## Classifying Congenital Heart Defects

            ### Increased Pulmonary Blood Flow (left-to-right shunt)
            Blood recirculates through the lungs → **congestive heart failure** signs: poor feeding, tachypnea, diaphoresis with feeds, failure to thrive.
            - **Patent ductus arteriosus**: wide pulse pressure, machinery-like murmur; prostaglandin inhibitor (indomethacin/ibuprofen) may close it.
            - **Atrial septal defect / ventricular septal defect**: harsh murmur; many close spontaneously.

            ### Decreased Pulmonary Blood Flow (right-to-left shunt — cyanotic)
            Deoxygenated blood enters systemic circulation → **cyanosis unrelieved by oxygen**.
            - **Tetralogy of Fallot** (four defects: pulmonary stenosis, VSD, overriding aorta, RVH): **tet spells** — squatting or knee-to-chest position increases systemic resistance and decreases the right-to-left shunt; morphine and oxygen for severe spells.

            ### Obstructive Defects
            Blood flow is blocked → poor perfusion, shock.
            - **Coarctation of the aorta**: hypertension in the arms, weak femoral pulses, BP gradient between extremities.
            - **Aortic stenosis / pulmonary stenosis**: murmur, activity intolerance.

            ### Mixed Defects (complete mixing)
            - **Transposition of the great arteries**: severe cyanosis from birth; prostaglandin E1 keeps the ductus open to allow mixing until surgery.
            - **Truncus arteriosus / total anomalous pulmonary venous return**: mixing with variable cyanosis and CHF.

            ## Mobility Principles (Pediatric and Immobile Patients)

            - **Turn q2h**, position alignment, skin inspection every turn — pressure injury prevention ( heels floated, no direct skin-to-skin contact).
            - **Range of motion**: passive for the immobile patient, active-assisted where able; contracture prevention is a nursing outcome, not a therapy-only task.
            - **Deep-breathing/incentive spirometer q2h** and early ambulation — the immobile child is at risk for atelectasis, pneumonia, DVT, constipation, and orthostatic hypotension.
            - Pediatric cues: infants are nose breathers — suction the nose before feeds; a child with CHD uses calories for breathing, so offer high-calorie feeds and cluster care to conserve energy.
            """,
            new[]
            {
                "Left-to-right shunts: CHF signs, poor feeding, sweating with feeds",
                "Tet spell: knee-to-chest/squatting + oxygen + morphine",
                "PDA: machinery murmur, wide pulse pressure",
                "Prostaglandin E1 keeps the ductus open in transposition",
                "Coarctation: arm hypertension, weak femoral pulses",
                "Turn q2h; contracture and pressure-injury prevention",
                "Immobility risks: atelectasis, DVT, constipation, orthostasis"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 6. Learner lecture — Psychotropics / Communication
        // ---------------------------------------------------------------
        var lecture6 = new Lecture(
            6,
            "psychotropics-communication",
            "Psychotropics/Communication",
            "Psychiatric & Substance Use",
            "Master psychotropic monitoring (lithium, clozapine, MAOIs, antipsychotics) and therapeutic communication traps that decide psychiatric NCLEX questions.",
            """
            ## Psychotropic Medication Safety

            **Lithium**: therapeutic window 0.6-1.2 mEq/L. Teach consistent sodium and water intake (dehydration and NSAIDs raise levels). Early toxicity: coarse tremor, GI upset, ataxia — check a level before the morning dose (12 hours after the last dose).

            **Clozapine**: the **agranulocytosis** drug — mandatory WBC/ANC monitoring; report fever or sore throat immediately. Also watch orthostatic hypotension, seizures, and metabolic effects.

            **Typical antipsychotics (haloperidol)**: extrapyramidal symptoms (pseudo-Parkinsonism, akathisia, dystonia) — treated with anticholinergics (benztropine); **neuroleptic malignant syndrome** (rigidity, hyperthermia, autonomic instability) — stop the drug, cool, dantrolene/bromocriptine per provider.

            **Atypical antipsychotics (olanzapine, quetiapine)**: metabolic syndrome — monitor weight, glucose, lipids.

            **MAOIs (phenelzine)**: hypertensive crisis with tyramine (aged cheese, cured meats, fermented products, red wine); avoid SSRIs, meperidine, and decongestants. Teach waiting ~14 days between MAOI and other serotonergic agents.

            **Antidepressants**: all classes carry a boxed warning for **suicidality in young patients** — assess, do not assume improvement means safety; most overdose deaths involve TCAs (dysrhythmia).

            ## Therapeutic Communication

            **Do**: broad openings ("Tell me what you mean by..."), reflection, silence with presence, presenting reality ("I don't hear voices, but you seem frightened"), giving recognition without judgment, offering self, setting limits calmly.

            **Avoid — the classic NCLEX traps**:
            - "Why" questions (defensive).
            - False reassurance ("Everything will be fine").
            - Giving advice or approval/disapproval.
            - Probing ("Tell me about your childhood").
            - Changing the subject in response to a patient's statement.
            - Agreeing/disagreeing with delusions — present reality, do not argue.

            **Anger/aggression**: de-escalate first — calm voice, respect personal space (arm's length), set clear limits, offer a quieter setting; restraints and seclusion are last resorts for imminent danger only, and never for staff convenience or as punishment.

            ## NCLEX Practice Points
            - Psych questions choose the response that **explores the patient's meaning** — not the one that comforts the nurse.
            - Lithium + poor fluid intake or NSAIDs = toxicity; teach when levels matter.
            - Fever on clozapine is an emergency until agranulocytosis is excluded.
            """,
            new[]
            {
                "Lithium window 0.6-1.2 mEq/L; level 12 hours post-dose",
                "Clozapine: weekly ANC monitoring; fever = emergency",
                "NMS: rigidity + hyperthermia — stop drug, cool, dantrolene",
                "MAOI + tyramine = hypertensive crisis",
                "Antidepressants: suicidality warning in young patients",
                "Avoid 'why', false reassurance, advice, probing",
                "Restraints/seclusion: last resort for imminent danger only"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 7. Learner lecture — Diabetes / DI / SIADH
        // ---------------------------------------------------------------
        var lecture7 = new Lecture(
            7,
            "diabetes-di-siadh",
            "Diabetes/DI/SIADH",
            "Endocrine",
            "Contrast diabetes mellitus, diabetes insipidus, and SIADH by their fluid and sodium patterns, then match treatment to the diagnosis.",
            """
            ## The Three D's of Water Balance

            | | Diabetes Mellitus | Diabetes Insipidus | SIADH |
            |---|---|---|---|
            | Problem | Insulin deficiency/resistance | Too little ADH | Too much ADH |
            | Urine | High glucose, high output, specific gravity low-normal | Very dilute, massive output (specific gravity < 1.005), low urine osmolality | Concentrated, low output |
            | Serum | Hyperglycemia | Hypernatremia (dehydration) | Hyponatremia (dilution) |
            | Key signs | Polyuria, polydipsia, polyphagia | Extreme thirst, rapid dehydration, hypotension, tachycardia | Confusion, headache, seizures (from hyponatremia), no thirst |
            | Treatment | Insulin/oral agents, fluids | Vasopressin/desmopressin; hypotonic fluids and strict I&O | Fluid restriction (first line), hypertonic saline if severe, demeclocycline or vasopressin antagonists |

            ### Nursing Priorities
            - **DI**: strict intake and output with hourly urine specific gravity early on, weigh daily, maintain access and give desmopressin as ordered; sudden confusion in a DI patient usually means hypernatremia.
            - **SIADH**: fluid restriction is the NCLEX answer; safety precautions while sodium is low (seizure precautions, reorientation); sodium correction must be gradual — rapid correction risks osmotic demyelination.
            - **DKA vs HHS**: DKA = type 1, ketones, fruity breath, Kussmaul respirations, acidosis. HHS = type 2, profound hyperglycemia without significant ketosis. Both need IV fluids first, then insulin infusion, then potassium monitoring — insulin drives potassium into cells; never give potassium before confirming urine output.

            ### Insulin Teaching Anchors
            - Regular insulin ~30 minutes before meals; rapid-acting 0-15 minutes before.
            - NPH: cloudy — roll, don't shake; peak 6-12 hours (snack coverage).
            - Drawing up: clear then cloudy (regular first, NPH second).
            - Peak times predict hypoglycemia; morning exercise after NPH can cause late-morning lows.
            - Sickness rule: never stop insulin; monitor ketones, sip fluids, check glucose q4h.
            """,
            new[]
            {
                "DI: dilute high-output urine + hypernatremia; treat with desmopressin",
                "SIADH: concentrated urine + hyponatremia; first line = fluid restriction",
                "DKA: Kussmaul respirations, fruity breath, ketones",
                "Fluids before insulin in DKA/HHS; watch potassium after insulin",
                "Never administer potassium before urine output is confirmed",
                "Regular 30 min pre-meal; rapid-acting 0-15 min pre-meal",
                "Clear before cloudy when drawing up mixed insulin"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 8. Learner lecture — Electrolytes / Labs
        // ---------------------------------------------------------------
        var lecture8 = new Lecture(
            8,
            "electrolytes-labs",
            "Electrolytes/Labs",
            "Labs & Diagnostics",
            "Know the critical lab values cold, pair each electrolyte derangement with its signs, and prioritize safe correction.",
            """
            ## Critical Lab Values (Adult)

            | Lab | Normal | Critical threshold (typical) |
            |-----|--------|------------------------------|
            | Potassium | 3.5-5.0 mEq/L | < 2.5 or > 6.0 |
            | Sodium | 135-145 mEq/L | < 120 or > 160 |
            | Calcium | 8.4-10.6 mg/dL | < 6.0 or > 13.0 |
            | Magnesium | 1.5-2.5 mEq/L | < 1.0 or > 4.0 |
            | Glucose | 70-110 mg/dL fasting | < 40 or > 500 |
            | WBC | 5,000-10,000/mm3 | < 1,000 (severe neutropenia) |
            | Platelets | 150,000-400,000/mm3 | < 20,000 (spontaneous bleeding risk) |
            | Digoxin level | 0.5-2.0 ng/mL | > 2.0 (with signs) |
            | Phenytoin | 10-20 mcg/mL | > 20 (nystagmus, ataxia) |
            | Lithium | 0.6-1.2 mEq/L | > 1.5 |

            ## Electrolyte Sign Pairing

            - **Hyperkalemia**: tall peaked T waves, widened QRS, bradycardia, muscle weakness, oliguria. Causes: renal failure, K-sparing diuretics, ACE inhibitors, tissue breakdown, acidosis. Treat: calcium gluconate (protects the myocardium), insulin+dextrose, sodium bicarbonate, kayexalate, dialysis. **Never push potassium IV.**
            - **Hypokalemia**: flat T waves, U waves, weakness, ileus, digoxin toxicity risk. Oral replacement preferred; IV infusion always diluted and pump-controlled, with urine output confirmed.
            - **Hyponatremia**: confusion, headache, seizures. Correct slowly; safety first.
            - **Hypernatremia**: thirst, dry sticky mucosa, agitation; replace water gradually.
            - **Hypercalcemia**: "bones, stones, moans, groans" — bone pain, renal stones, constipation, confusion. Fluids first.
            - **Hypomagnesemia** travels with hypokalemia and hypocalcemia and keeps them refractory to replacement.

            ## Lab Strategy Rules
            - Draw peak/trough levels at the correct times (trough just before the next dose; peak per drug protocol) — a level drawn at the wrong time is not interpretable.
            - Potassium replacement requires urine output first (typically ≥ 0.5 mL/kg/hour per protocol).
            - A patient with a critically low platelet count needs fall/bleeding precautions: soft toothbrush, no IM injections, pressure after venipuncture.
            """,
            new[]
            {
                "Hyperkalemia: peaked T waves; calcium gluconate protects the heart",
                "Never push potassium IV; confirm urine output before infusion",
                "Hypokalemia: flat T waves, U waves, digoxin toxicity risk",
                "Hyponatremia: seizures; correct sodium slowly",
                "Hypercalcemia: bones, stones, moans, groans; fluids first",
                "Trough just before the dose; peak per drug protocol",
                "Platelets < 20,000: bleeding precautions, no IM injections"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 9. Learner lecture — Labor / Obstetric Emergencies
        // ---------------------------------------------------------------
        var lecture9 = new Lecture(
            9,
            "labor-obstetric-emergencies",
            "Labor/Obstetric Emergencies",
            "Maternity",
            "Recognize true labor versus prodromal signs, manage precipitous and prolonged labor, and act on the classic obstetric emergencies.",
            """
            ## True vs False Labor

            - **True labor**: contractions grow stronger, longer, and closer with activity; pain radiates from the back around the abdomen; the cervix shows progressive effacement and dilation; discomfort is not relieved by rest.
            - **False labor (Braxton Hicks)**: irregular, walk or rest changes them, discomfort stays in front, the cervix is unchanged.

            ## Normal Labor Anchors
            - Stages: 1st (onset to complete dilation — latent, active, transition), 2nd (full dilation to delivery), 3rd (placenta), 4th (first 1-4 hours after placenta).
            - Monitor maternal vital signs, FHR, and labor progress; position changes promote progress and comfort; encourage voiding q2h (a full bladder stalls labor).
            - Cord care: clamp per protocol, keep dry; expect the cord to fall off in 1-2 weeks.

            ## Obstetric Emergencies

            **Shoulder dystocia**: the head delivers but the anterior shoulder is wedged — McRoberts maneuver (hyperflex the maternal hips) and suprapubic pressure; never fundal pressure.

            **Cord prolapse**: cord visible or palpated with ruptured membranes — relieve pressure off the cord immediately: knee-chest or Trendelenburg position, gloved hand lifting the presenting part off the cord, **emergent delivery**; continuous hand pressure until the team takes over.

            **Uterine rupture**: severe abdominal pain, loss of contraction pattern, FHR bradycardia/prolonged decelerations, signs of hypovolemia — emergent laparotomy; highest risk with prior uterine scar and labor induction.

            **Placenta previa**: painless bright-red bleeding — **no vaginal exams**, no vaginal delivery if central; cesarean birth.

            **Placental abruption**: painful, dark-red bleeding with a rigid, "board-like" uterus and fetal distress — prepare for rapid delivery; watch for DIC.

            **Precipitous delivery in the ED or hallway**: do not try to stop the delivery — support the perineum, guide the head between contractions, check for a nuchal cord, deliver the anterior shoulder downward, dry and stimulate the newborn, keep the newborn at placental level until clamping per protocol.

            **Postpartum hemorrhage**: the 4 T's — tone (massage first), trauma (laceration/hematoma), tissue (retained placenta), thrombin (coagulopathy). Uterine atony is the most common cause: massage the fundus, empty the bladder, give oxytocics per order.

            ## NCLEX Practice Points
            - Painless bleeding = previa (no exam); painful bleeding = abruption (prepare for delivery).
            - Cord prolapse: hand in the vagina lifting the presenting part — off the cord — all the way to the OR.
            - Fundal massage before any additional uterotonic.
            """,
            new[]
            {
                "True labor: progressive dilation, back-to-front radiation",
                "Shoulder dystocia: McRoberts + suprapubic pressure; never fundal pressure",
                "Cord prolapse: knee-chest, lift presenting part off cord, stat delivery",
                "Painless red bleeding = previa (no vaginal exam)",
                "Painful bleeding + rigid uterus = abruption (DIC risk)",
                "Precipitous delivery: support, don't restrain",
                "Postpartum hemorrhage: massage, empty bladder, oxytocics"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 10. Learner lecture — FHR / VEAL CHOP
        // ---------------------------------------------------------------
        var lecture10 = new Lecture(
            10,
            "fhr-veal-chop",
            "FHR/VEAL CHOP",
            "Maternity",
            "Decode fetal heart-rate tracings with the VEAL CHOP mnemonic, classify variability, and know which patterns demand immediate intrauterine resuscitation.",
            """
            ## VEAL CHOP

            The mnemonic pairs each fetal heart-rate pattern with its most likely cause — **the causes go in reverse order**:

            | Pattern | Mnemonic pairing | Cause | Meaning |
            |---------|------------------|-------|---------|
            | **V**ariable decelerations | **C**ord compression | Umbilical cord squeezed | Reposition the mother (side-lying), amnioinfusion per order, stop oxytocin, oxygen per protocol |
            | **E**arly decelerations | **H**ead compression | Fetal head squeezed during contractions | Benign — mirrors contractions, nadir with the peak; continue monitoring |
            | **A**ccelerations | **O**K | Fetal well-being | Reassuring — at least 32-weeks+ standard: ≥ 15 bpm above baseline for ≥ 15 seconds |
            | **L**ate decelerations | **P**lacental insufficiency | Uteroplacental blood flow is inadequate | Urgent — intrauterine resuscitation: reposition (left lateral), stop oxytocin, IV fluid bolus, oxygen per protocol, assess for tachysystole |

            ## Baseline and Variability
            - **Normal baseline**: 110-160 bpm. Tachycardia > 160 (fever, hypoxia, meds); bradycardia < 110 (hypoxia, cord compression, anesthetics).
            - **Moderate variability** is the single best sign of a non-acidotic fetus.
            - **Absent/minimal variability** persisting ≥ 40-80+ minutes (per gestational criteria) or with recurrent decelerations = abnormal tracing; escalate.

            ## Intrauterine Resuscitation Sequence
            1. Change maternal position (left lateral first).
            2. Stop or reduce uterotonic infusions (oxytocin).
            3. IV fluid bolus (per protocol; dextrose-free).
            4. Oxygen 8-10 L/min by facemask where indicated by policy.
            5. Assess tachysystole (more than 5 contractions in 10 minutes averaged over 30 minutes); notify the provider; prepare for operative delivery if the pattern does not improve.

            ## NCLEX Practice Points
            - Early decels = head compression = **no intervention** needed beyond reassurance.
            - Variable decels with a sinusoidal-appearing pattern, prolonged bradycardia, or late decels with minimal variability = **move toward delivery**.
            - Maternal fever causes fetal tachycardia — treat the mother's temperature.
            """,
            new[]
            {
                "VEAL CHOP: Variable=Cord, Early=Head, Accelerations=OK, Late=Placental",
                "Early decelerations are benign; late decelerations are urgent",
                "Moderate variability = best sign of a non-acidotic fetus",
                "Variable decels: reposition, amnioinfusion, stop oxytocin",
                "Late decels: reposition, stop oxytocin, fluid bolus, oxygen",
                "Baseline 110-160 bpm; tachycardia often means maternal fever",
                "Tachysystole: > 5 contractions per 10 minutes"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 11. Learner lecture — Maternity Staging / Pharmacology
        // ---------------------------------------------------------------
        var lecture11 = new Lecture(
            11,
            "maternity-staging-pharmacology",
            "Maternity Staging/Pharmacology",
            "Maternity",
            "Stage pregnancy, labor, postpartum recovery, and newborn maturity accurately, then anchor the core maternity pharmacology (magnesium, pitocin, terbutaline, RhoGAM).",
            """
            ## Staging Frameworks

            **Pregnancy stages/trimesters**: 1st trimester (fertilization to 13 weeks), 2nd (14-27), 3rd (28-birth). Fundal height approximates gestational age at 20-36 weeks (cm ≈ weeks), then descends with lightening.

            **Labor stages**: 1st — latent (0-6 cm, contractions mild-moderate), active (6-10 cm with faster dilation), transition (8-10 cm, "can't cope" behavior); 2nd — full dilation to birth; 3rd — placental separation (gush of blood, cord lengthening, uterus becomes globular); 4th — immediate recovery.

            **Newborn maturity staging (Ballard/Ballard-based cues)**: more skin creases, more cartilage in the ear, deeper sole creases, testes in the scrotum with rugae = more mature. Preterm cues: lanugo abundant, sole creases absent, ear cartilage floppy, cryptorchidism.

            **Postpartum uterine involution**: fundus at the umbilicus after delivery, descends ~1 cm (one fingerbreadth) per day; by day 10-14 it is at or below the symphysis. A "boggy" uterus = atony until proven otherwise — massage first.

            **Lochia staging**: rubra (red, days 1-3) → serosa (pink-brown, days 4-10) → alba (white-yellow, days 11-6 weeks). Saturating a pad in < 1 hour = hemorrhage; return of bright-red flow after serosa suggests subinvolution or retained tissue.

            ## Core Maternity Pharmacology

            - **Magnesium sulfate**: seizure prophylaxis in preeclampsia/eclampsia and neuroprotection < 32 weeks. Antidote = **calcium gluconate**. Toxicity order: patellar reflex loss → respiratory depression (< 12/min) → cardiac arrest. Monitor: reflexes, respiratory rate, urine output (> 25-30 mL/hour per protocol).
            - **Oxytocin (Pitocin)**: induction/augmentation and postpartum hemorrhage. Stop or reduce for late decelerations/tachysystole; never bolus; uterine hyperstimulation is the hazard to act on first.
            - **Terbutaline**: tocolytic for preterm contractions — watch maternal tachycardia and tremor; contraindicated in significant cardiac disease and poorly controlled hyperthyroidism/diabetes.
            - **RhoGAM (Rh immune globulin)**: Rh-negative mother without sensitization — at ~28 weeks and within 72 hours after birth of an Rh-positive baby; also after any sensitizing event (amniocentesis, miscarriage, trauma).
            - **Nalbuphine/butorphanol**: mixed agonist-antagonists avoid respiratory depression but can precipitate withdrawal in opioid-dependent patients.
            - **Nitrous oxide/epidural**: hypotension is the hazard — IV fluid bolus before epidural, monitor BP, watch the bladder.

            ## NCLEX Practice Points
            - Magnesium toxicity signs are reflex, respiratory, renal — in that order of concern.
            - Oxytocin problem? The answer is almost always "stop the oxytocin" before anything else.
            - RhoGAM timing: 28 weeks and within 72 hours postpartum.
            """,
            new[]
            {
                "Labor stage 1: latent, active, transition phases",
                "Lochia: rubra → serosa → alba; pad < 1 hour = hemorrhage",
                "Fundus descends one fingerbreadth per day; massage boggy uterus",
                "Magnesium sulfate: reflexes, respirations, urine output; calcium gluconate antidote",
                "Oxytocin with late decels/tachysystole: stop the infusion first",
                "RhoGAM at 28 weeks and within 72 hours postpartum",
                "Epidural hypotension: fluid bolus before placement"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        // ---------------------------------------------------------------
        // 12. Learner lecture — Prioritization / Delegation
        // ---------------------------------------------------------------
        var lecture12 = new Lecture(
            12,
            "prioritization-delegation",
            "Prioritization/Delegation",
            "Leadership",
            "Apply the airway-breathing-circulation hierarchy, maslow, acute-versus-chronic reasoning, and the five rights of delegation to answer every management question.",
            """
            ## Prioritization Frameworks

            **1. ABC + unexpected findings**: airway, breathing, circulation first — but an *unexpected* finding outranks an expected one at the same level. Fresh surgical bleeding, sudden confusion, or a new fever outrank routine chronic complaints.

            **2. Maslow**: physiology before safety, safety before psychosocial — except when an immediate safety threat (suicidal ideation, elopement risk, violence) is present.

            **3. Acute/unstable beats chronic/stable**: a new-onset presentation (chest pain, stroke signs) outranks a stable chronic condition; a client with a potential complication (new atrial fibrillation after MI) outranks one with a predictable course.

            **4. Assess before you act**: when two options both look plausible, the correct answer is usually the one that **gathers more information first** (assess) — unless the finding is already an emergency (then act).

            **5. Least restrictive/least invasive first**: reorientation before restraints; positioning before medication when both are safe.

            ### The Classic Question Patterns
            - "Which client first?" → the unstable/acute/unexpected one (airway > breathing > circulation > disability > everything else).
            - "Which action first?" → assessment (except emergencies: e.g., a witnessed tension pneumothorax means act).
            - "What do you do next?" → the action that addresses the **cause**, not the symptom.

            ## Delegation — The Five Rights

            1. **Right task**: routine, repetitive, low-risk with predictable outcomes (vital signs on a stable patient, ADLs, ambulation, specimen collection, I&O).
            2. **Right circumstance**: stable client, appropriate resources, no unpredictable elements (never delegate the first assessment after a procedure, a new complaint, or an unstable client).
            3. **Right person**: match the task to validated competence and the role's legal scope.
            4. **Right direction/communication**: the task, the expected result, the time frame, and what to report back.
            5. **Right supervision/evaluation**: the delegating nurse remains accountable — follow up, review, and document.

            ### What A Nurse Can NEVER Delegate
            - Nursing assessment (admission, shift, pre-procedure, pre-medication), nursing judgment, teaching, and any task requiring professional judgment: triage, first post-op assessment, developing/evaluating the care plan, blood administration, informed consent discussion, IV push medications (UAP), sterile invasive procedures (UAP).

            ### Scope Reminders
            - **LPN/LVN** (depending on state rules): stable clients, oral/topical medications, suctioning, enemas, routine catheterization, dressing changes, feeding stable patients. Not: IV push, blood, initial assessment, teaching planning.
            - **UAP/NAP**: hygiene, mobility, feeding, vitals, transport, I&O. Not: medications (any route), assessment, interpreting data, invasive procedures.
            """,
            new[]
            {
                "Prioritize: airway > breathing > circulation > unexpected findings",
                "Acute/unstable beats chronic/stable",
                "When in doubt, assess first — unless it is an emergency",
                "Five rights of delegation: task, circumstance, person, direction, supervision",
                "Never delegate assessment, teaching, or nursing judgment",
                "LPN/LVN: stable clients only; no IV push or blood",
                "The delegating nurse remains accountable for delegated care"
            },
            LectureAccessLevel.AuthenticatedLearner,
            SeedAuthor);

        var lectures = new List<Lecture>
        {
            lecture1, lecture2, lecture3, lecture4, lecture5, lecture6,
            lecture7, lecture8, lecture9, lecture10, lecture11, lecture12
        };

        foreach (var lecture in lectures)
        {
            // Seed records are published catalogue content: advance through the domain lifecycle.
            lecture.SubmitForReview(SeedAuthor);
            lecture.Approve("seed-reviewer", "NURVIA Clinical Reviewer", "Initial catalogue seed");
            lecture.Publish(SeedAuthor);
            lecture.CreatedAtUtc = now;
            lecture.UpdatedAtUtc = now;
            lecture.UpdatedBy = SeedAuthor;
        }

        context.Lectures.AddRange(lectures);
        await context.SaveChangesAsync();
    }
}
