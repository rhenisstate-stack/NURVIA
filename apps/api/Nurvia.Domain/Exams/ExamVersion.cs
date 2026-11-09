using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;

namespace Nurvia.Domain.Exams;

public class ExamVersion : Entity, IAuditableEntity
{
    public Guid ExamId { get; set; }
    public int VersionNumber { get; set; } = 1;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; } = 90;
    public decimal PassingScorePercentage { get; set; } = 75.0m;
    public ExamStatus Status { get; set; } = ExamStatus.Draft;
    public string? ValidationErrors { get; set; }

    /// <summary>Controls when learners may review submitted attempts for this exam version.</summary>
    public ReviewReleasePolicy ReviewReleasePolicy { get; set; } = ReviewReleasePolicy.Immediate;

    /// <summary>UTC timestamp at which staff released review for ManualRelease exams; null while withheld.</summary>
    public DateTime? ReviewReleasedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    public Exam? Exam { get; set; }
    public ExamBlueprint? Blueprint { get; set; }
    public ICollection<ExamQuestion> ExamQuestions { get; set; } = new List<ExamQuestion>();

    public ExamVersion() { }

    public ExamVersion(Guid examId, int versionNumber, string title, string description, string createdBy)
    {
        ExamId = examId;
        VersionNumber = versionNumber;
        Title = title;
        Description = description;
        CreatedBy = createdBy;
        CreatedAtUtc = DateTime.UtcNow;
        Status = ExamStatus.Draft;
    }

    public bool Validate(out List<string> errors)
    {
        errors = new List<string>();

        if (string.IsNullOrWhiteSpace(Title) || Title.Trim().Length < 5)
            errors.Add("Exam version title must contain at least 5 characters.");

        if (TimeLimitMinutes <= 0)
            errors.Add("Time limit must be greater than zero minutes.");

        if (PassingScorePercentage <= 0 || PassingScorePercentage > 100)
            errors.Add("Passing score percentage must be between 1% and 100%.");

        if (ExamQuestions.Count == 0)
            errors.Add("Exam blueprint requires at least one question assigned.");

        ValidationErrors = errors.Count > 0 ? string.Join("; ", errors) : null;
        return errors.Count == 0;
    }
}
