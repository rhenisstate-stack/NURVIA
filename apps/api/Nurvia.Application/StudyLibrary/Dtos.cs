using Nurvia.Domain.Enums;

namespace Nurvia.Application.StudyLibrary;

public class StudyLibraryFilterRequest
{
    public string? SearchTerm { get; set; }
    public NursingPathway? Pathway { get; set; }
    public ExamCategory? Category { get; set; }
    public string? School { get; set; }
    public int? AcademicYear { get; set; }
    public string? Season { get; set; }
    public string? Subject { get; set; }
    public string? Topic { get; set; }
    public DifficultyLevel? Difficulty { get; set; }
    public QuestionType? QuestionType { get; set; }
    public Guid? ExamId { get; set; }
    public bool SavedOnly { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class StudySetCardDto
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
    public int TotalQuestions { get; set; }
    public string? School { get; set; }
    public int? AcademicYear { get; set; }
    public string? Season { get; set; }
    public string? Subject { get; set; }
    public string? Topic { get; set; }
    public DifficultyLevel? Difficulty { get; set; }
    public ExamLayoutPolicy AllowedLayouts { get; set; }
    public ExamLayout DefaultLayout { get; set; }
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public string? FeaturedTestimonial { get; set; }
    public bool IsSaved { get; set; }
}

public class StudySetDetailDto : StudySetCardDto
{
    public string Instructions { get; set; } = string.Empty;
    public List<string> LearningObjectives { get; set; } = new();
    public List<string> SubjectsCovered { get; set; } = new();
    public List<string> TopicsCovered { get; set; } = new();
    public List<QuestionType> QuestionTypesIncluded { get; set; } = new();
    public List<ExamReviewDto> Reviews { get; set; } = new();
    public bool CanReview { get; set; }
    public ExamReviewDto? LearnerReview { get; set; }
}

public class StudyLibraryExamOptionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}

public class StudyLibraryFiltersDto
{
    public List<NursingPathway> Pathways { get; set; } = new();
    public List<ExamCategory> Categories { get; set; } = new();
    public List<string> Schools { get; set; } = new();
    public List<int> AcademicYears { get; set; } = new();
    public List<string> Seasons { get; set; } = new();
    public List<string> Subjects { get; set; } = new();
    public List<string> Topics { get; set; } = new();
    public List<DifficultyLevel> Difficulties { get; set; } = new();
    public List<QuestionType> QuestionTypes { get; set; } = new();
    public List<StudyLibraryExamOptionDto> Exams { get; set; } = new();
}

public class StudyLibrarySummaryDto
{
    public int TotalPublishedStudySets { get; set; }
    public int TotalAvailableQuestions { get; set; }
    public int TotalCategories { get; set; }
    public int TotalPathways { get; set; }
}

public class ExamReviewDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string LearnerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class SubmitExamReviewRequest
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
