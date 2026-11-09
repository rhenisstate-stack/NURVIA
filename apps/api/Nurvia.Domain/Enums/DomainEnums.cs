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
    MultipleChoice = 1,      // Single answer
    MultipleResponse = 2,    // Select All That Apply (SATA)
    TrueFalse = 3,
    FillInTheBlank = 4,
    NumericResponse = 5,
    OrderedResponse = 6,     // Drag and drop sequencing
    Matching = 7,
    MatrixGrid = 8,          // NGN Matrix
    ClinicalCaseStudy = 9,   // NGN 6-item unfolding case
    BowTie = 10              // NGN Bow-tie item
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
    RadiologyReport = 5
}
