using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Domain.Exams;

public class Exam : Entity, IAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public NursingPathway Pathway { get; set; } = NursingPathway.RN;
    public ExamCategory Category { get; set; } = ExamCategory.ATI;
    public ExamDeliveryMode ModeAllowed { get; set; } = ExamDeliveryMode.All;
    public int TimeLimitMinutes { get; set; } = 90;
    public decimal PassingScorePercentage { get; set; } = 75.0m;
    public ExamStatus Status { get; set; } = ExamStatus.Draft;
    public Guid? CurrentVersionId { get; set; }
    public int TotalQuestions { get; set; } = 0;
    public string? School { get; set; }
    public int? AcademicYear { get; set; }
    public string? Season { get; set; }
    public string? Subject { get; set; }
    public string? Topic { get; set; }
    public DifficultyLevel? Difficulty { get; set; }
    public List<string> LearningObjectives { get; set; } = new();
    public Guid ConcurrencyToken { get; set; } = Guid.NewGuid();

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    public ExamVersion? CurrentVersion { get; set; }
    public ICollection<ExamVersion> Versions { get; set; } = new List<ExamVersion>();

    public Exam() { }

    public Exam(string code, string title, string description, NursingPathway pathway, ExamCategory category, string createdBy)
    {
        Code = code;
        Title = title;
        Description = description;
        Pathway = pathway;
        Category = category;
        CreatedBy = createdBy;
        CreatedAtUtc = DateTime.UtcNow;
        Status = ExamStatus.Draft;
        ConcurrencyToken = Guid.NewGuid();
    }

    public void SubmitForReview(string actor)
    {
        if (Status == ExamStatus.Published)
            throw new DomainException("Cannot submit an already published exam for review. Create a new version first.");

        if (CurrentVersion == null)
            throw new DomainException("Exam has no active version to submit.");

        if (!CurrentVersion.Validate(out var errors))
        {
            throw new DomainException($"Exam blueprint validation failed: {string.Join("; ", errors)}");
        }

        Status = ExamStatus.PendingReview;
        CurrentVersion.Status = ExamStatus.PendingReview;
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = actor;
        ConcurrencyToken = Guid.NewGuid();
    }

    public void Approve(string reviewerName, string comments)
    {
        if (Status != ExamStatus.PendingReview)
            throw new DomainException($"Only exams in 'PendingReview' can be approved. Current status: '{Status}'.");

        if (CurrentVersion == null)
            throw new DomainException("Active version not found.");

        Status = ExamStatus.Approved;
        CurrentVersion.Status = ExamStatus.Approved;
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = reviewerName;
        ConcurrencyToken = Guid.NewGuid();
    }

    public void Publish(string publisher)
    {
        if (Status != ExamStatus.Approved)
            throw new DomainException($"Cannot publish exam directly. An exam must be configured and approved before publishing. Current status: '{Status}'.");

        if (CurrentVersion == null)
            throw new DomainException("Active version not found.");

        // Invariant: Verify all questions in exam are published
        foreach (var eq in CurrentVersion.ExamQuestions)
        {
            if (eq.Question != null && eq.Question.Status != ContentStatus.Published)
            {
                throw new DomainException($"Cannot publish exam '{Title}'. Contains unapproved question '{eq.Question.Code}' in status '{eq.Question.Status}'.");
            }
        }

        Status = ExamStatus.Published;
        CurrentVersion.Status = ExamStatus.Published;
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = publisher;
        ConcurrencyToken = Guid.NewGuid();
    }

    public void Archive(string actor)
    {
        Status = ExamStatus.Archived;
        if (CurrentVersion != null)
        {
            CurrentVersion.Status = ExamStatus.Archived;
        }
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = actor;
        ConcurrencyToken = Guid.NewGuid();
    }

    public ExamVersion CreateNewVersion(string author)
    {
        var nextNumber = (Versions.Count > 0 ? Versions.Max(v => v.VersionNumber) : 1) + 1;
        var newVersion = new ExamVersion(Id, nextNumber, Title, Description, author)
        {
            Instructions = CurrentVersion?.Instructions ?? string.Empty,
            TimeLimitMinutes = TimeLimitMinutes,
            PassingScorePercentage = PassingScorePercentage,
            Status = ExamStatus.Draft
        };

        if (CurrentVersion != null)
        {
            foreach (var q in CurrentVersion.ExamQuestions)
            {
                newVersion.ExamQuestions.Add(new ExamQuestion(newVersion.Id, q.QuestionId, q.QuestionVersionId, q.OrderIndex, q.Points));
            }
        }

        Versions.Add(newVersion);
        CurrentVersion = newVersion;
        CurrentVersionId = newVersion.Id;
        Status = ExamStatus.Draft;
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = author;
        ConcurrencyToken = Guid.NewGuid();

        return newVersion;
    }
}
