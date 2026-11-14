namespace Nurvia.Application.Tutor;

public enum TutorStage
{
    FirstHint = 1,
    GuidedReasoning = 2,
    ExplainConcept = 3
}

public class TutorHintRequest
{
    public Guid QuestionId { get; set; }
    public TutorStage Stage { get; set; } = TutorStage.FirstHint;
}

public class TutorHintResponseDto
{
    public Guid QuestionId { get; set; }
    public TutorStage Stage { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public List<Guid> EliminatedOptionIds { get; set; } = new();
    public bool IsAiGenerated { get; set; }
}

public class TutorEvaluateRequest
{
    public Guid QuestionId { get; set; }
    public string ResponseJson { get; set; } = string.Empty;
}

public class TutorOptionExplanationDto
{
    public Guid OptionId { get; set; }
    public string OptionIndex { get; set; } = string.Empty;
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? SpecificRationale { get; set; }
}

public class TutorEvaluateResponseDto
{
    public Guid QuestionId { get; set; }
    public bool IsCorrect { get; set; }
    public decimal PointsAwarded { get; set; }
    public decimal MaxPoints { get; set; }
    public string GeneralRationale { get; set; } = string.Empty;
    public List<TutorOptionExplanationDto> OptionRationales { get; set; } = new();
    public string ClinicalConcept { get; set; } = string.Empty;
    public string NursingPrinciple { get; set; } = string.Empty;
    public string Takeaway { get; set; } = string.Empty;
    public bool IsAiGenerated { get; set; }
}
