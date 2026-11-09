using Nurvia.Domain.Enums;

namespace Nurvia.Application.Questions;

public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public int OptionIndex { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? SpecificRationale { get; set; }
    public int DisplayOrder { get; set; }
}

public class QuestionExhibitDto
{
    public Guid Id { get; set; }
    public ExhibitType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class QuestionReviewDto
{
    public Guid Id { get; set; }
    public Guid QuestionVersionId { get; set; }
    public string ReviewerId { get; set; } = string.Empty;
    public string ReviewerName { get; set; } = string.Empty;
    public ReviewDecision Decision { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime ReviewedAtUtc { get; set; }
}

public class QuestionVersionDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public int VersionNumber { get; set; }
    public string Stem { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public CognitiveSkill CognitiveSkill { get; set; }
    public ClientNeedCategory ClientNeedCategory { get; set; }
    public string GeneralRationale { get; set; } = string.Empty;
    public string? ContentJsonData { get; set; }
    public ContentStatus Status { get; set; }
    public string? ValidationErrors { get; set; }
    public string? ReviewNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public List<QuestionOptionDto> Options { get; set; } = new();
    public List<QuestionExhibitDto> Exhibits { get; set; } = new();
    public List<QuestionReviewDto> Reviews { get; set; } = new();
}

public class QuestionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public NursingPathway Pathway { get; set; }
    public ExamCategory Category { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string? Subtopic { get; set; }
    public DifficultyLevel Difficulty { get; set; }
    public ContentStatus Status { get; set; }
    public Guid? CurrentVersionId { get; set; }
    public Guid ConcurrencyToken { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }
    public QuestionVersionDto? CurrentVersion { get; set; }
    public int TotalVersions { get; set; }
}

public class CreateQuestionRequest
{
    public string? Code { get; set; }
    public NursingPathway Pathway { get; set; } = NursingPathway.RN;
    public ExamCategory Category { get; set; } = ExamCategory.ATI;
    public string Subject { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string? Subtopic { get; set; }
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Intermediate;
    public QuestionType QuestionType { get; set; } = QuestionType.MultipleChoice;
    public CognitiveSkill CognitiveSkill { get; set; } = CognitiveSkill.AnalyzeCues;
    public ClientNeedCategory ClientNeedCategory { get; set; } = ClientNeedCategory.PhysiologicalIntegrity;
    public string Stem { get; set; } = string.Empty;
    public string GeneralRationale { get; set; } = string.Empty;
    public string? ContentJsonData { get; set; }
    public List<CreateOptionRequest> Options { get; set; } = new();
    public List<CreateExhibitRequest> Exhibits { get; set; } = new();
}

public class CreateOptionRequest
{
    public int OptionIndex { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? SpecificRationale { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateExhibitRequest
{
    public ExhibitType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class UpdateQuestionDraftRequest
{
    public Guid ConcurrencyToken { get; set; }
    public NursingPathway Pathway { get; set; }
    public ExamCategory Category { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string? Subtopic { get; set; }
    public DifficultyLevel Difficulty { get; set; }
    public QuestionType QuestionType { get; set; }
    public CognitiveSkill CognitiveSkill { get; set; }
    public ClientNeedCategory ClientNeedCategory { get; set; }
    public string Stem { get; set; } = string.Empty;
    public string GeneralRationale { get; set; } = string.Empty;
    public string? ContentJsonData { get; set; }
    public List<CreateOptionRequest> Options { get; set; } = new();
    public List<CreateExhibitRequest> Exhibits { get; set; } = new();
}

public class QuestionReviewRequest
{
    public ReviewDecision Decision { get; set; }
    public string Comments { get; set; } = string.Empty;
}

public class QuestionFilterRequest
{
    public string? SearchTerm { get; set; }
    public NursingPathway? Pathway { get; set; }
    public ExamCategory? Category { get; set; }
    public string? Subject { get; set; }
    public string? Topic { get; set; }
    public DifficultyLevel? Difficulty { get; set; }
    public QuestionType? QuestionType { get; set; }
    public ContentStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 15;
}

public class ActiveExamOptionDto
{
    public Guid Id { get; set; }
    public int OptionIndex { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class ActiveExamQuestionDto
{
    public Guid Id { get; set; }
    public int OrderIndex { get; set; }
    public string Stem { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public CognitiveSkill CognitiveSkill { get; set; }
    public ClientNeedCategory ClientNeedCategory { get; set; }
    public string? ContentJsonData { get; set; }
    public List<ActiveExamOptionDto> Options { get; set; } = new();
    public List<QuestionExhibitDto> Exhibits { get; set; } = new();
}

public class ReviewOptionDto
{
    public Guid Id { get; set; }
    public int OptionIndex { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? SpecificRationale { get; set; }
    public bool WasSelected { get; set; }
}

public class ReviewQuestionDto
{
    public Guid QuestionId { get; set; }
    public int OrderIndex { get; set; }
    public string Stem { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public CognitiveSkill CognitiveSkill { get; set; }
    public ClientNeedCategory ClientNeedCategory { get; set; }
    public string GeneralRationale { get; set; } = string.Empty;
    public string? LearnerResponse { get; set; }
    public bool IsCorrect { get; set; }
    public decimal PointsAwarded { get; set; }
    public decimal MaxPoints { get; set; }
    public List<ReviewOptionDto> Options { get; set; } = new();
    public List<QuestionExhibitDto> Exhibits { get; set; } = new();
}
