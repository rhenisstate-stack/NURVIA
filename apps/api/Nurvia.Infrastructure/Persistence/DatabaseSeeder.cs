using Microsoft.EntityFrameworkCore;
using Nurvia.Domain.Auditing;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;

namespace Nurvia.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(NurviaDbContext context)
    {
        if (await context.Questions.AnyAsync())
        {
            return; // Already seeded
        }

        var author = "Nurse Educator Elena Vance, MSN, RN";

        // ==========================================
        // Question 1: ATI Pharmacology - Digoxin
        // ==========================================
        var q1 = new Question("Q-RN-ATI-PHARM-001", NursingPathway.RN, ExamCategory.ATI, "Pharmacology", "Cardiac Medications", DifficultyLevel.Intermediate, author)
        {
            Status = ContentStatus.Published
        };

        var q1v1 = new QuestionVersion(q1.Id, 1,
            "A nurse is preparing to administer digoxin 0.25 mg PO to an adult client diagnosed with heart failure. Which clinical assessment is a priority before administering this medication?",
            QuestionType.MultipleChoice,
            author)
        {
            CognitiveSkill = CognitiveSkill.RecognizeCues,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "Digoxin is a cardiac glycoside with positive inotropic and negative chronotropic effects. The apical pulse must be counted for a full 60 seconds before administration. If the apical rate is less than 60 beats/min in an adult (or <90 in infants), the dose must be withheld and the healthcare provider notified to prevent fatal bradyarrhythmias.",
            Status = ContentStatus.Published
        };

        q1v1.Options.Add(new QuestionOption(1, "Measure the client's blood pressure in both arms", false, "Blood pressure is monitored but apical heart rate is the decisive withholding parameter.", 1));
        q1v1.Options.Add(new QuestionOption(2, "Auscultate the apical pulse rate for one full minute", true, "Correct: Digoxin must be withheld if the apical heart rate is below 60 bpm in adults.", 2));
        q1v1.Options.Add(new QuestionOption(3, "Check the client's capillary blood glucose level", false, "Digoxin does not directly influence acute blood glucose.", 3));
        q1v1.Options.Add(new QuestionOption(4, "Check the client's most recent sodium laboratory value", false, "Potassium (hypokalemia), not sodium, potentiates digoxin toxicity.", 4));

        q1.Versions.Add(q1v1);

        // ==========================================
        // Question 2: ATI Pharmacology - Lithium (SATA)
        // ==========================================
        var q2 = new Question("Q-RN-ATI-PHARM-002", NursingPathway.RN, ExamCategory.ATI, "Pharmacology", "Psychiatric Medications", DifficultyLevel.Advanced, author)
        {
            Status = ContentStatus.Published
        };

        var q2v1 = new QuestionVersion(q2.Id, 1,
            "A nurse is educating a client who is newly prescribed lithium carbonate for bipolar I disorder. Which clinical signs should the nurse teach the client to identify as early manifestations of lithium toxicity? (Select all that apply.)",
            QuestionType.MultipleResponse,
            author)
        {
            CognitiveSkill = CognitiveSkill.AnalyzeCues,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "Lithium has a narrow therapeutic window (0.6 to 1.2 mEq/L). Early manifestations of toxicity (serum level 1.5 to 2.0 mEq/L) include gastrointestinal disturbances (nausea, vomiting, diarrhea), neurological symptoms (fine hand tremors, muscle weakness, lethargy), and slurred speech. Polyuria and mild thirst are common side effects, but gross ataxia and seizures occur in severe toxicity (>2.5 mEq/L).",
            Status = ContentStatus.Published
        };

        q2v1.Options.Add(new QuestionOption(1, "Nausea, vomiting, and diarrhea", true, "Early gastrointestinal toxicity cue.", 1));
        q2v1.Options.Add(new QuestionOption(2, "Fine hand tremors becoming coarse", true, "Early neuromuscular cue of toxic accumulation.", 2));
        q2v1.Options.Add(new QuestionOption(3, "Constipation and urinary retention", false, "Lithium typically causes polyuria and loose stools, not retention.", 3));
        q2v1.Options.Add(new QuestionOption(4, "Slurred speech and muscle weakness", true, "Early central nervous system impairment cue.", 4));
        q2v1.Options.Add(new QuestionOption(5, "Hypertensive crisis and cardiac arrest", false, "Hypertensive crisis is characteristic of MAOI interactions, not early lithium toxicity.", 5));

        q2.Versions.Add(q2v1);

        // ==========================================
        // Question 3: HESI Med-Surg - NGN Unfolding Case Study (Heart Failure)
        // ==========================================
        var q3 = new Question("Q-RN-HESI-MS-003", NursingPathway.RN, ExamCategory.HESI, "Medical-Surgical", "Cardiovascular", DifficultyLevel.Advanced, author)
        {
            Status = ContentStatus.Published
        };

        var q3v1 = new QuestionVersion(q3.Id, 1,
            "A 68-year-old male with an established history of systolic heart failure is admitted to the telemetry unit with worsening dyspnea. Review the client's electronic health record exhibits (Nurses Notes, Vital Signs, and Diagnostic Labs). Based on these clinical cues, which action is the nurse's immediate priority?",
            QuestionType.ClinicalCaseStudy,
            author)
        {
            CognitiveSkill = CognitiveSkill.PrioritizeHypotheses,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "The client exhibits signs of acute decompensated heart failure with impending pulmonary edema (dyspnea, orthopnea, bilateral crackles, oxygen saturation 88% on room air, elevated BNP 1,450 pg/mL). High-flow oxygen positioning in high-Fowler's and IV loop diuretics take priority to improve gas exchange and reduce preload.",
            Status = ContentStatus.Published
        };

        q3v1.Exhibits.Add(new QuestionExhibit(ExhibitType.NursesNotes, "Nursing Admission Assessment",
            "10:00 - Client presented to ED in acute respiratory distress, stating 'I cannot catch my breath even when sleeping with 3 pillows.' Bilateral diffuse crackles heard in lower two-thirds of lung fields. +3 pitting bilateral lower extremity edema. Client appears anxious and diaphoretic.", 1));

        q3v1.Exhibits.Add(new QuestionExhibit(ExhibitType.VitalSigns, "Vital Signs Flowsheet",
            "BP: 168/96 mmHg\nHeart Rate: 114 bpm (sinus tachycardia on telemetry)\nRespiratory Rate: 28 breaths/min, labored\nSpO2: 88% on ambient room air\nTemperature: 37.1 C (98.8 F)", 2));

        q3v1.Exhibits.Add(new QuestionExhibit(ExhibitType.LabResults, "STAT Laboratory Panel",
            "BNP: 1,450 pg/mL (Normal < 100 pg/mL)\nSodium: 136 mEq/L\nPotassium: 4.1 mEq/L\nBUN: 28 mg/dL\nSerum Creatinine: 1.4 mg/dL\nTroponin I: < 0.01 ng/mL", 3));

        q3v1.Options.Add(new QuestionOption(1, "Place client in high-Fowler's position and administer supplemental oxygen via nasal cannula", true, "Immediate physiological airway/breathing intervention to optimize gas exchange.", 1));
        q3v1.Options.Add(new QuestionOption(2, "Administer 1,000 mL 0.9% Normal Saline IV bolus over 1 hour", false, "Contraindicated: Volume expansion worsens hypervolemia and pulmonary edema.", 2));
        q3v1.Options.Add(new QuestionOption(3, "Encourage oral fluid intake to treat elevated BUN", false, "Client requires strict fluid restriction during acute decompensation.", 3));
        q3v1.Options.Add(new QuestionOption(4, "Schedule a routine echocardiogram for tomorrow morning", false, "Diagnostic testing is secondary to immediate stabilization.", 4));

        q3.Versions.Add(q3v1);

        // ==========================================
        // Question 4: RN Exit - PE vs Atelectasis
        // ==========================================
        var q4 = new Question("Q-RN-EXIT-PRED-004", NursingPathway.RN_Exit, ExamCategory.ExitPredictor, "Comprehensive Nursing", "Critical Care", DifficultyLevel.Advanced, author)
        {
            Status = ContentStatus.Published
        };

        var q4v1 = new QuestionVersion(q4.Id, 1,
            "A nurse on an inpatient surgical unit cares for a client on postoperative Day 2 following total knee arthroplasty who develops acute-onset chest pain and tachypnea. Which clinical findings support a hypothesis of Pulmonary Embolism (PE) rather than Atelectasis?",
            QuestionType.MultipleChoice,
            author)
        {
            CognitiveSkill = CognitiveSkill.AnalyzeCues,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "Pulmonary embolism typically presents with sudden, sharp pleuritic chest pain, profound hypoxia refractory to low oxygen, sudden tachycardia, and a sense of impending doom in an immobile orthopedic postoperative patient. Atelectasis tends to develop gradually with low-grade fever and diminished breath sounds that clear with cough and deep breathing.",
            Status = ContentStatus.Published
        };

        q4v1.Options.Add(new QuestionOption(1, "Sudden sharp pleuritic chest pain and unexplained tachycardia (HR 120)", true, "Hallmark classic cues of acute pulmonary embolism.", 1));
        q4v1.Options.Add(new QuestionOption(2, "Gradual low-grade temperature elevation (38.0 C) responsive to incentive spirometry", false, "Consistent with postoperative atelectasis.", 2));
        q4v1.Options.Add(new QuestionOption(3, "Diminished breath sounds at bilateral bases with dry nonproductive cough", false, "Common manifestation of atelectasis.", 3));
        q4v1.Options.Add(new QuestionOption(4, "Decreased urine output with clear bilateral lung sounds", false, "Indicates hypovolemia or renal cues, not differentiating PE from atelectasis.", 4));

        q4.Versions.Add(q4v1);

        // ==========================================
        // Question 5: LPN Exit - Pediatric Dosage Calculations
        // ==========================================
        var q5 = new Question("Q-PN-ATI-CALC-005", NursingPathway.PN_LPN, ExamCategory.ATI, "Dosage Calculations", "Pediatric Administration", DifficultyLevel.Intermediate, author)
        {
            Status = ContentStatus.Published
        };

        var q5v1 = new QuestionVersion(q5.Id, 1,
            "A licensed practical nurse (LPN) is preparing to administer amoxicillin oral suspension to a pediatric client weighing 44 lbs. The provider orders amoxicillin 25 mg/kg/day divided into 2 equal doses every 12 hours. The pharmacy supplies amoxicillin oral suspension 250 mg/5 mL. How many milliliters should the nurse administer per dose?",
            QuestionType.MultipleChoice,
            author)
        {
            CognitiveSkill = CognitiveSkill.GenerateSolutions,
            ClientNeedCategory = ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = "Step 1: Convert weight: 44 lbs / 2.2 = 20 kg. Step 2: Total daily dosage: 20 kg * 25 mg/kg/day = 500 mg/day. Step 3: Per dose (divided into 2 doses): 500 mg / 2 = 250 mg per dose. Step 4: Liquid volume: (250 mg / 250 mg) * 5 mL = 5 mL per dose.",
            Status = ContentStatus.Published
        };

        q5v1.Options.Add(new QuestionOption(1, "2.5 mL", false, "Underdose calculation.", 1));
        q5v1.Options.Add(new QuestionOption(2, "5 mL", true, "Correct: 20 kg * 25 mg/kg / 2 = 250 mg; 250 mg = 5 mL.", 2));
        q5v1.Options.Add(new QuestionOption(3, "10 mL", false, "This represents the full daily dose, not the divided single dose.", 3));
        q5v1.Options.Add(new QuestionOption(4, "15 mL", false, "Overdose calculation error.", 4));

        q5.Versions.Add(q5v1);

        // Add questions to DB (Phase 1: Without CurrentVersionId to prevent cycle)
        await context.Questions.AddRangeAsync(q1, q2, q3, q4, q5);
        await context.SaveChangesAsync();

        // Phase 2: Set CurrentVersionId
        q1.CurrentVersionId = q1v1.Id;
        q2.CurrentVersionId = q2v1.Id;
        q3.CurrentVersionId = q3v1.Id;
        q4.CurrentVersionId = q4v1.Id;
        q5.CurrentVersionId = q5v1.Id;
        await context.SaveChangesAsync();

        // ==========================================
        // Seed Pre-Configured Exams
        // ==========================================
        var exam1 = new Exam("ATI-PHARM-2026", "ATI Comprehensive Pharmacology Practice Exam", "Official simulated ATI Pharmacology exam covering cardiac, endocrine, and psychotropic therapeutics.", NursingPathway.RN, ExamCategory.ATI, author)
        {
            ModeAllowed = ExamDeliveryMode.All,
            TimeLimitMinutes = 60,
            PassingScorePercentage = 78.0m,
            Status = ExamStatus.Published,
            TotalQuestions = 2
        };

        var exam1v1 = new ExamVersion(exam1.Id, 1, "ATI Comprehensive Pharmacology Practice Exam", "Simulated assessment with full clinical rationales and NGN item formats.", author)
        {
            Instructions = "You have 60 minutes. Immediate rationales will be displayed in Tutor Mode. All questions must be attempted before final submission.",
            TimeLimitMinutes = 60,
            PassingScorePercentage = 78.0m,
            Status = ExamStatus.Published,
            Blueprint = new ExamBlueprint(exam1.Id, 2)
            {
                SubjectDistributionJson = "{\"Pharmacology\": 100}",
                CognitiveDistributionJson = "{\"RecognizeCues\": 50, \"AnalyzeCues\": 50}",
                DifficultyDistributionJson = "{\"Intermediate\": 50, \"Advanced\": 50}"
            }
        };

        exam1v1.ExamQuestions.Add(new ExamQuestion(exam1v1.Id, q1.Id, q1v1.Id, 1, 1));
        exam1v1.ExamQuestions.Add(new ExamQuestion(exam1v1.Id, q2.Id, q2v1.Id, 2, 1));
        exam1.Versions.Add(exam1v1);

        var exam2 = new Exam("RN-EXIT-COMP-01", "RN Comprehensive Predictor Exit Examination", "Comprehensive multi-specialty exit exam measuring readiness for NCLEX-RN licensure.", NursingPathway.RN_Exit, ExamCategory.ExitPredictor, author)
        {
            ModeAllowed = ExamDeliveryMode.Exam,
            TimeLimitMinutes = 90,
            PassingScorePercentage = 80.0m,
            Status = ExamStatus.Published,
            TotalQuestions = 3
        };

        var exam2v1 = new ExamVersion(exam2.Id, 1, "RN Comprehensive Predictor Exit Examination", "Timed high-stakes benchmark with unfolding clinical case studies.", author)
        {
            Instructions = "Timed benchmark exam simulating actual testing conditions. Calculator is available on screen. Rationales viewable after submission.",
            TimeLimitMinutes = 90,
            PassingScorePercentage = 80.0m,
            Status = ExamStatus.Published,
            Blueprint = new ExamBlueprint(exam2.Id, 3)
            {
                SubjectDistributionJson = "{\"Pharmacology\": 33, \"Medical-Surgical\": 33, \"Critical Care\": 34}",
                CognitiveDistributionJson = "{\"RecognizeCues\": 33, \"PrioritizeHypotheses\": 33, \"AnalyzeCues\": 34}",
                DifficultyDistributionJson = "{\"Intermediate\": 33, \"Advanced\": 67}"
            }
        };

        exam2v1.ExamQuestions.Add(new ExamQuestion(exam2v1.Id, q1.Id, q1v1.Id, 1, 1));
        exam2v1.ExamQuestions.Add(new ExamQuestion(exam2v1.Id, q3.Id, q3v1.Id, 2, 1));
        exam2v1.ExamQuestions.Add(new ExamQuestion(exam2v1.Id, q4.Id, q4v1.Id, 3, 1));
        exam2.Versions.Add(exam2v1);

        await context.Exams.AddRangeAsync(exam1, exam2);
        await context.SaveChangesAsync();

        exam1.CurrentVersionId = exam1v1.Id;
        exam2.CurrentVersionId = exam2v1.Id;
        await context.SaveChangesAsync();

        // Audit Logs
        context.AuditLogs.Add(new AuditLog("Question", q1.Id.ToString(), "SeedQuestion", "system", "System Seeder", "System", "Seeded foundational question Q-RN-ATI-PHARM-001"));
        context.AuditLogs.Add(new AuditLog("Question", q3.Id.ToString(), "SeedQuestion", "system", "System Seeder", "System", "Seeded unfolding case study Q-RN-HESI-MS-003"));
        context.AuditLogs.Add(new AuditLog("Exam", exam1.Id.ToString(), "SeedExam", "system", "System Seeder", "System", "Seeded published exam ATI-PHARM-2026"));
        context.AuditLogs.Add(new AuditLog("Exam", exam2.Id.ToString(), "SeedExam", "system", "System Seeder", "System", "Seeded published exam RN-EXIT-COMP-01"));

        await context.SaveChangesAsync();
    }
}
