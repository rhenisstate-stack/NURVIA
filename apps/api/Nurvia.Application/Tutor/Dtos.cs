using Nurvia.Domain.Enums;

namespace Nurvia.Application.Tutor;

/// <summary>
/// Hint-request stages within the progressive Tutor experience. These are
/// non-revealing learning aids: no hint stage ever returns answer keys,
/// correctness, or rationales. The answer-bearing stages (4 Evaluation,
/// 5 Explanation, 6 Reinforcement) are released only by the tutor evaluate
/// endpoint after server-side grading.
/// </summary>
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

/// <summary>
/// Server-authoritative Tutor progression state for one question within an
/// attempt. Stage numbering follows the six-stage learner experience:
/// 1 Independent Thinking · 2 First Hint · 3 Guided Reasoning ·
/// 4 Answer Evaluation · 5 Educational Explanation · 6 Knowledge Reinforcement.
/// <see cref="Evaluation"/> is populated only once the learner's own answer has
/// been evaluated server-side (stage &gt;= 4); it is never included preemptively.
/// </summary>
public class TutorQuestionStateDto
{
    public Guid QuestionId { get; set; }
    public int StageReached { get; set; }
    public TutorEvaluateResponseDto? Evaluation { get; set; }
}

/// <summary>
/// Full Tutor session recovery payload: per-question stage state with already
/// authorized evaluation content. Lets the learner's session survive a page
/// refresh without re-releasing any answer-bearing information prematurely.
/// </summary>
public class TutorSessionStateDto
{
    public Guid AttemptId { get; set; }
    public ExamDeliveryMode DeliveryMode { get; set; }
    public List<TutorQuestionStateDto> Questions { get; set; } = new();
}
