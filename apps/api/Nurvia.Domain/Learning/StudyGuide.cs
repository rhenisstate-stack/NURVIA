using Nurvia.Domain.Common;

namespace Nurvia.Domain.Learning;

/// <summary>
/// Curated, downloadable clinical nursing study guide.
/// </summary>
public class StudyGuide : Entity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Pathway { get; set; } = "RN";
    public string Summary { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;
    public int ReadingMinutes { get; set; } = 10;
    public bool IsPublished { get; set; } = true;
    public string CreatedByUserId { get; set; } = "system";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }

    public StudyGuide() { }
}
