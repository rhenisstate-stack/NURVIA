namespace Nurvia.Domain.Enums;

public enum ContentStatus
{
    Draft = 1,
    ValidationFailed = 2,
    PendingReview = 3,
    Approved = 4,
    Published = 5,
    Archived = 6,
    Rejected = 7
}

public enum ExamStatus
{
    Draft = 1,
    Configured = 2,
    PendingReview = 3,
    Approved = 4,
    Published = 5,
    Archived = 6
}

public enum QuestionType
{
    // Canonical 1-18 Question Types for Nursing Examinations
    MultipleChoice = 1,          // 1. Single Choice MCQ (Single correct answer among distractors)
    MultipleResponse = 2,        // 2. Multiple Choice / SATA
    SelectAllThatApply = 2,      // 3. SATA (Select All That Apply)
    TrueFalse = 3,               // 15. True / False
    FillInTheBlank = 4,          // 12. Cloze / Fill in the blank
    Cloze = 4,                   // Alias for 12. Cloze
    NumericResponse = 5,         // 14. Numeric Calculation
    NumericCalculation = 5,      // Alias for 14. Numeric Calculation
    OrderedResponse = 6,         // 8. Ordered Response (Priority / Sequential steps)
    Matching = 7,                // 11. Matching (Premise to response pairs)
    MatrixGrid = 8,              // 13. Matrix / Grid (Rows vs columns)
    ClinicalCaseStudy = 9,       // 9. Unfolding Case Study (NGN multi-step scenario)
    UnfoldingCaseStudy = 9,      // Alias for 9. Unfolding Case Study
    BowTie = 10,                 // 18. Dynamic Lab / Bow-Tie (Actions, condition, parameters)
    DynamicLabBowTie = 10,       // Alias for 18. Dynamic Lab / Bow-Tie

    MultipleTrueFalse = 11,      // 4. Multiple True/False Checkbox (Matrix of T/F evaluations)
    ImageBased = 12,             // 5. Image-Based (Visual clinical exhibit / anatomical hotspot)
    MultipleImageSelection = 13, // 6. Multiple-Image Selection (Choose among visual medical panels)
    DragAndDrop = 14,            // 7. Drag-and-Drop (Interactive classification into buckets)
    ExtendedResponse = 15,       // 10. Extended Response / Essay (Clinical rationale explanation)
    TabularResponse = 16,        // 16. Tabular Response (Data table with trended clinical cues)
    ShortAnswer = 17,            // 17. Short Answer (Concise medical terminology / calculation)
    SingleChoice = 18            // 1. Explicit Canonical Single Choice MCQ
}

public enum NursingPathway
{
    RN = 1,
    PN_LPN = 2,
    RN_Exit = 3,
    PN_Exit = 4
}

public enum ExamCategory
{
    ATI = 1,
    HESI = 2,
    RegularCourse = 3,
    Certification = 4,
    ExitPredictor = 5
}

public enum DifficultyLevel
{
    Foundational = 1,
    Intermediate = 2,
    Advanced = 3,
    Benchmark = 4
}

public enum CognitiveSkill
{
    RecognizeCues = 1,
    AnalyzeCues = 2,
    PrioritizeHypotheses = 3,
    GenerateSolutions = 4,
    TakeActions = 5,
    EvaluateOutcomes = 6
}

public enum ClientNeedCategory
{
    SafeEffectiveCareEnvironment = 1,
    HealthPromotionAndMaintenance = 2,
    PsychosocialIntegrity = 3,
    PhysiologicalIntegrity = 4
}

public enum ReviewDecision
{
    Approved = 1,
    Rejected = 2,
    ChangesRequested = 3
}

public enum ExamDeliveryMode
{
    Review = 1,
    Exam = 2,
    Tutor = 3,
    All = 4
}

public enum ExhibitType
{
    NursesNotes = 1,
    VitalSigns = 2,
    LabResults = 3,
    ProviderOrders = 4,
    RadiologyReport = 5,
    Image = 6,
    Diagram = 7,
    Chart = 8
}

public enum ExamAttemptStatus
{
    InProgress = 1,
    Submitted = 2,
    Graded = 3,
    Expired = 4
}

/// <summary>
/// Governs when a learner may review a submitted attempt's answer key and rationales.
/// Immediate preserves the legacy behavior; ManualRelease withholds review until
/// authorized staff release the results for the exam.
/// </summary>
public enum ReviewReleasePolicy
{
    Immediate = 1,
    ManualRelease = 2
}

/// <summary>
/// Admin configuration for which learner navigation layouts an examination permits.
/// Layout and navigation restrictions are independent concerns.
/// </summary>
public enum ExamLayoutPolicy
{
    AllInOneOnly = 1,
    SequentialOnly = 2,
    Both = 3
}

/// <summary>
/// The concrete navigation layout used for a specific examination attempt.
/// </summary>
public enum ExamLayout
{
    AllInOne = 1,
    Sequential = 2
}
