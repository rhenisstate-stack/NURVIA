using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Domain.Questions;

public class Question : Entity, IAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public NursingPathway Pathway { get; set; } = NursingPathway.RN;
    public ExamCategory Category { get; set; } = ExamCategory.ATI;
    public string Subject { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string? Subtopic { get; set; }
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Intermediate;
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public Guid? CurrentVersionId { get; set; }
    public Guid ConcurrencyToken { get; set; } = Guid.NewGuid();

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    public QuestionVersion? CurrentVersion { get; set; }
    public ICollection<QuestionVersion> Versions { get; set; } = new List<QuestionVersion>();
    public ICollection<QuestionReview> Reviews { get; set; } = new List<QuestionReview>();

    public Question() { }

    public Question(string code, NursingPathway pathway, ExamCategory category, string subject, string topic, DifficultyLevel difficulty, string createdBy)
    {
        Code = code;
        Pathway = pathway;
        Category = category;
        Subject = subject;
        Topic = topic;
        Difficulty = difficulty;
        CreatedBy = createdBy;
        CreatedAtUtc = DateTime.UtcNow;
        Status = ContentStatus.Draft;
        ConcurrencyToken = Guid.NewGuid();
    }

    public void SubmitForReview(string actor)
    {
        if (Status == ContentStatus.Published)
            throw new DomainException("Cannot submit an already published question for review. Create a new version first.");

        if (CurrentVersion == null)
            throw new DomainException("Question does not have an active content version to submit.");

        if (!CurrentVersion.Validate(out var errors))
        {
            Status = ContentStatus.ValidationFailed;
            CurrentVersion.Status = ContentStatus.ValidationFailed;
            throw new DomainException($"Question validation failed: {string.Join("; ", errors)}");
        }

        Status = ContentStatus.PendingReview;
        CurrentVersion.Status = ContentStatus.PendingReview;
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = actor;
        ConcurrencyToken = Guid.NewGuid();
    }

    public QuestionReview Approve(string reviewerId, string reviewerName, string comments)
    {
        if (Status != ContentStatus.PendingReview)
            throw new DomainException($"Only questions in 'PendingReview' status can be approved. Current status: '{Status}'.");

        if (CurrentVersion == null)
            throw new DomainException("Question active version not found.");

        Status = ContentStatus.Approved;
        CurrentVersion.Status = ContentStatus.Approved;
        CurrentVersion.ReviewNotes = comments;

        var review = new QuestionReview(Id, CurrentVersion.Id, reviewerId, reviewerName, ReviewDecision.Approved, comments);
        Reviews.Add(review);

        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = reviewerName;
        ConcurrencyToken = Guid.NewGuid();
        return review;
    }

    public QuestionReview Reject(string reviewerId, string reviewerName, string comments)
    {
        if (Status != ContentStatus.PendingReview)
            throw new DomainException($"Only questions in 'PendingReview' status can be rejected. Current status: '{Status}'.");

        if (CurrentVersion == null)
            throw new DomainException("Question active version not found.");

        Status = ContentStatus.Rejected;
        CurrentVersion.Status = ContentStatus.Rejected;
        CurrentVersion.ReviewNotes = comments;

        var review = new QuestionReview(Id, CurrentVersion.Id, reviewerId, reviewerName, ReviewDecision.Rejected, comments);
        Reviews.Add(review);

        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = reviewerName;
        ConcurrencyToken = Guid.NewGuid();
        return review;
    }

    public void Publish(string publisher)
    {
        if (Status != ContentStatus.Approved)
            throw new DomainException($"Cannot publish question directly. A question must be validated and approved by an authorized reviewer before publishing. Current status: '{Status}'.");

        if (CurrentVersion == null)
            throw new DomainException("Active version not found.");

        Status = ContentStatus.Published;
        CurrentVersion.Status = ContentStatus.Published;
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = publisher;
        ConcurrencyToken = Guid.NewGuid();
    }

    public void Archive(string actor)
    {
        Status = ContentStatus.Archived;
        if (CurrentVersion != null)
        {
            CurrentVersion.Status = ContentStatus.Archived;
        }
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = actor;
        ConcurrencyToken = Guid.NewGuid();
    }

    public QuestionVersion CreateNewVersion(string author)
    {
        var nextNumber = (Versions.Count > 0 ? Versions.Max(v => v.VersionNumber) : 1) + 1;
        var newVersion = new QuestionVersion(Id, nextNumber, CurrentVersion?.Stem ?? string.Empty, CurrentVersion?.QuestionType ?? QuestionType.MultipleChoice, author)
        {
            CognitiveSkill = CurrentVersion?.CognitiveSkill ?? CognitiveSkill.AnalyzeCues,
            ClientNeedCategory = CurrentVersion?.ClientNeedCategory ?? ClientNeedCategory.PhysiologicalIntegrity,
            GeneralRationale = CurrentVersion?.GeneralRationale ?? string.Empty,
            ContentJsonData = CurrentVersion?.ContentJsonData,
            Status = ContentStatus.Draft
        };

        // Clone options
        if (CurrentVersion != null)
        {
            foreach (var opt in CurrentVersion.Options)
            {
                newVersion.Options.Add(new QuestionOption(opt.OptionIndex, opt.OptionText, opt.IsCorrect, opt.SpecificRationale, opt.DisplayOrder));
            }
            foreach (var exh in CurrentVersion.Exhibits)
            {
                newVersion.Exhibits.Add(new QuestionExhibit(exh.Type, exh.Title, exh.Content, exh.DisplayOrder));
            }
        }

        Versions.Add(newVersion);
        CurrentVersion = newVersion;
        CurrentVersionId = newVersion.Id;
        Status = ContentStatus.Draft;
        UpdatedAtUtc = DateTime.UtcNow;
        UpdatedBy = author;
        ConcurrencyToken = Guid.NewGuid();

        return newVersion;
    }
}
