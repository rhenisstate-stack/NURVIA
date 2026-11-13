using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;

namespace Nurvia.Domain.Lectures;

public class Lecture : Entity, IAuditableEntity
{
    public int Number { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string Summary { get; private set; } = string.Empty;
    public string BodyMarkdown { get; private set; } = string.Empty;
    public List<string> HighYieldConcepts { get; private set; } = new();
    public ContentStatus Status { get; private set; } = ContentStatus.Draft;
    public LectureAccessLevel AccessLevel { get; private set; }
    public string ReviewNotes { get; private set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    private Lecture()
    {
    }

    public Lecture(
        int number,
        string slug,
        string title,
        string category,
        string summary,
        string bodyMarkdown,
        IEnumerable<string> highYieldConcepts,
        LectureAccessLevel accessLevel,
        string author)
    {
        if (number < 1 || number > 12)
            throw new DomainException("Lecture number must be between 1 and 12.");

        if (!Enum.IsDefined(accessLevel))
            throw new DomainException("The specified lecture access level is invalid.");

        Number = number;
        Slug = RequireValue(slug, nameof(slug));
        Title = RequireValue(title, nameof(title));
        Category = RequireValue(category, nameof(category));
        Summary = RequireValue(summary, nameof(summary));
        BodyMarkdown = RequireValue(bodyMarkdown, nameof(bodyMarkdown));
        HighYieldConcepts = NormalizeConcepts(highYieldConcepts);
        AccessLevel = accessLevel;
        CreatedBy = RequireValue(author, nameof(author));
        Status = ContentStatus.Draft;
    }

    public void UpdateContent(
        string slug,
        string title,
        string category,
        string summary,
        string bodyMarkdown,
        IEnumerable<string> highYieldConcepts,
        LectureAccessLevel accessLevel,
        string actor)
    {
        if (Status == ContentStatus.Published)
            throw new DomainException(
                "Published lecture content is immutable. Create a versioned revision before making changes.");

        if (Status == ContentStatus.PendingReview ||
            Status == ContentStatus.Approved ||
            Status == ContentStatus.Archived)
        {
            throw new DomainException(
                $"A lecture in '{Status}' status cannot be edited.");
        }

        if (!Enum.IsDefined(accessLevel))
            throw new DomainException("The specified lecture access level is invalid.");

        Slug = RequireValue(slug, nameof(slug));
        Title = RequireValue(title, nameof(title));
        Category = RequireValue(category, nameof(category));
        Summary = RequireValue(summary, nameof(summary));
        BodyMarkdown = RequireValue(bodyMarkdown, nameof(bodyMarkdown));
        HighYieldConcepts = NormalizeConcepts(highYieldConcepts);
        AccessLevel = accessLevel;

        // Editing rejected or validation-failed content returns it to Draft.
        Status = ContentStatus.Draft;
        ReviewNotes = string.Empty;

        MarkUpdated(actor);
    }

    public void SubmitForReview(string actor)
    {
        if (Status != ContentStatus.Draft)
            throw new DomainException(
                $"Only Draft lectures can be submitted for review. Current status: '{Status}'.");

        ValidateContent();

        Status = ContentStatus.PendingReview;
        ReviewNotes = string.Empty;
        MarkUpdated(actor);
    }

    public void Approve(string reviewerId, string reviewerName, string comments)
    {
        if (Status != ContentStatus.PendingReview)
            throw new DomainException(
                $"Only lectures in 'PendingReview' status can be approved. Current status: '{Status}'.");

        RequireValue(reviewerId, nameof(reviewerId));
        RequireValue(reviewerName, nameof(reviewerName));

        Status = ContentStatus.Approved;
        ReviewNotes = comments?.Trim() ?? string.Empty;

        MarkUpdated(reviewerName);
    }

    public void Reject(string reviewerId, string reviewerName, string comments)
    {
        if (Status != ContentStatus.PendingReview)
            throw new DomainException(
                $"Only lectures in 'PendingReview' status can be rejected. Current status: '{Status}'.");

        RequireValue(reviewerId, nameof(reviewerId));
        RequireValue(reviewerName, nameof(reviewerName));

        Status = ContentStatus.Rejected;
        ReviewNotes = RequireValue(comments, nameof(comments));

        MarkUpdated(reviewerName);
    }

    public void Publish(string publisher)
    {
        if (Status != ContentStatus.Approved)
            throw new DomainException(
                $"Only approved lectures can be published. Current status: '{Status}'.");

        Status = ContentStatus.Published;
        MarkUpdated(publisher);
    }

    public void Archive(string actor)
    {
        if (Status != ContentStatus.Published)
            throw new DomainException(
                $"Only published lectures can be archived. Current status: '{Status}'.");

        Status = ContentStatus.Archived;
        MarkUpdated(actor);
    }

    private void ValidateContent()
    {
        var errors = new List<string>();

        if (Number < 1 || Number > 12)
            errors.Add("Lecture number must be between 1 and 12.");

        if (string.IsNullOrWhiteSpace(Slug))
            errors.Add("A lecture slug is required.");

        if (string.IsNullOrWhiteSpace(Title))
            errors.Add("A lecture title is required.");

        if (string.IsNullOrWhiteSpace(Category))
            errors.Add("A lecture category is required.");

        if (string.IsNullOrWhiteSpace(Summary))
            errors.Add("A lecture summary is required.");

        if (string.IsNullOrWhiteSpace(BodyMarkdown))
            errors.Add("Lecture notes content is required.");

        if (!Enum.IsDefined(AccessLevel))
            errors.Add("A valid lecture access level is required.");

        if (errors.Count > 0)
            throw new DomainException(
                $"Lecture validation failed: {string.Join("; ", errors)}");
    }

    private void MarkUpdated(string actor)
    {
        UpdatedBy = RequireValue(actor, nameof(actor));
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private static string RequireValue(string? value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException($"{fieldName} is required.");

        return value.Trim();
    }

    private static List<string> NormalizeConcepts(IEnumerable<string> concepts)
    {
        ArgumentNullException.ThrowIfNull(concepts);

        return concepts
            .Where(concept => !string.IsNullOrWhiteSpace(concept))
            .Select(concept => concept.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}
