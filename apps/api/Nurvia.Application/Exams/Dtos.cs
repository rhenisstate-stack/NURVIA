using Nurvia.Domain.Enums;
using Nurvia.Application.Questions;

namespace Nurvia.Application.Exams;

public class ExamQuestionDto
{
    public Guid Id { get; set; }
    public Guid ExamVersionId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid QuestionVersionId { get; set; }
    public int OrderIndex { get; set; }
    public int Points { get; set; }
    public QuestionDto? Question { get; set; }
}

public class ExamBlueprintDto
{
    public Guid Id { get; set; }
    public Guid ExamVersionId { get; set; }
    public int TargetQuestionCount { get; set; }
    public string? SubjectDistributionJson { get; set; }
    public string? CognitiveDistributionJson { get; set; }
    public string? DifficultyDistributionJson { get; set; }
}

public class ExamVersionDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public int VersionNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; }
    public decimal PassingScorePercentage { get; set; }
    public ExamStatus Status { get; set; }
    public string? ValidationErrors { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public ExamBlueprintDto? Blueprint { get; set; }
    public List<ExamQuestionDto> ExamQuestions { get; set; } = new();
}

public class ExamDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public NursingPathway Pathway { get; set; }
    public ExamCategory Category { get; set; }
    public ExamDeliveryMode ModeAllowed { get; set; }
    public int TimeLimitMinutes { get; set; }
    public decimal PassingScorePercentage { get; set; }
    public ExamStatus Status { get; set; }
    public Guid? CurrentVersionId { get; set; }
    public int TotalQuestions { get; set; }
    public Guid ConcurrencyToken { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }
    public ExamVersionDto? CurrentVersion { get; set; }
    public int TotalVersions { get; set; }
}

public class CreateExamRequest
{
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public NursingPathway Pathway { get; set; } = NursingPathway.RN;
    public ExamCategory Category { get; set; } = ExamCategory.ATI;
    public ExamDeliveryMode ModeAllowed { get; set; } = ExamDeliveryMode.All;
    public int TimeLimitMinutes { get; set; } = 90;
    public decimal PassingScorePercentage { get; set; } = 75.0m;
    public int TargetQuestionCount { get; set; } = 50;
    public List<Guid>? InitialQuestionIds { get; set; }
}

public class ConfigureExamRequest
{
    public Guid ConcurrencyToken { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public NursingPathway Pathway { get; set; }
    public ExamCategory Category { get; set; }
    public ExamDeliveryMode ModeAllowed { get; set; }
    public int TimeLimitMinutes { get; set; }
    public decimal PassingScorePercentage { get; set; }
    public int TargetQuestionCount { get; set; }
    public List<Guid> AssignedQuestionIds { get; set; } = new();
}

public class ExamFilterRequest
{
    public string? SearchTerm { get; set; }
    public NursingPathway? Pathway { get; set; }
    public ExamCategory? Category { get; set; }
    public ExamStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 15;
}
