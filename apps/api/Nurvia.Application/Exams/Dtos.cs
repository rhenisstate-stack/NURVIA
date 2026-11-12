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
    public ReviewReleasePolicy ReviewReleasePolicy { get; set; }
    public DateTime? ReviewReleasedAtUtc { get; set; }
    public ExamLayoutPolicy AllowedLayouts { get; set; }
    public ExamLayout DefaultLayout { get; set; }
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
    public ReviewReleasePolicy ReviewReleasePolicy { get; set; } = ReviewReleasePolicy.Immediate;
    public ExamLayoutPolicy AllowedLayouts { get; set; } = ExamLayoutPolicy.Both;
    public ExamLayout DefaultLayout { get; set; } = ExamLayout.Sequential;
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
    public ReviewReleasePolicy ReviewReleasePolicy { get; set; } = ReviewReleasePolicy.Immediate;
    public ExamLayoutPolicy AllowedLayouts { get; set; } = ExamLayoutPolicy.Both;
    public ExamLayout DefaultLayout { get; set; } = ExamLayout.Sequential;
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

/// <summary>
/// Learner-facing review-mode content for a published examination. Contains the
/// approved answer key and rationales for every question so learners can study the
/// examination without creating a graded attempt. Delivered only when the exam
/// version's review release policy permits it.
/// </summary>
public class ExamReviewContentDto
{
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public NursingPathway Pathway { get; set; }
    public ExamCategory Category { get; set; }
    public string Instructions { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; }
    public bool ReviewReleased { get; set; }
    public List<ReviewQuestionDto> Questions { get; set; } = new();
}

public class SubmittedExamResultDto
{
    public Guid AttemptId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAtUtc { get; set; }
    public DateTime SubmittedAtUtc { get; set; }
    public int TimeSpentSeconds { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectQuestions { get; set; }
    public decimal ScorePercentage { get; set; }
    public decimal PassingScorePercentage { get; set; }
    public bool Passed { get; set; }

    /// <summary>False when the exam's review release policy withholds answer keys and rationales until staff release.</summary>
    public bool ReviewReleased { get; set; } = true;

    public List<ReviewQuestionDto> ReviewQuestions { get; set; } = new();
}

public class ExamAttemptSummaryDto
{
    public Guid AttemptId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAtUtc { get; set; }
    public DateTime? SubmittedAtUtc { get; set; }
    public decimal? ScorePercentage { get; set; }
    public bool? Passed { get; set; }
    public int TotalQuestions { get; set; }
}
