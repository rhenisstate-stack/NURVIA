using Nurvia.Domain.Enums;

namespace Nurvia.Application.Lectures;

public class LectureCatalogueItemDto
{
    public Guid Id { get; set; }
    public int Number { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public List<string> HighYieldConcepts { get; set; } = new();
    public LectureAccessLevel AccessLevel { get; set; }
}

public class LectureContentDto : LectureCatalogueItemDto
{
    public string BodyMarkdown { get; set; } = string.Empty;
}

public class LectureManagementDto : LectureContentDto
{
    public ContentStatus Status { get; set; }
    public string ReviewNotes { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }
}

public class CreateLectureRequest
{
    public int Number { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string BodyMarkdown { get; set; } = string.Empty;
    public List<string> HighYieldConcepts { get; set; } = new();
    public LectureAccessLevel AccessLevel { get; set; }
}

public class UpdateLectureRequest
{
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string BodyMarkdown { get; set; } = string.Empty;
    public List<string> HighYieldConcepts { get; set; } = new();
    public LectureAccessLevel AccessLevel { get; set; }
}

public class ReviewLectureRequest
{
    public ReviewDecision Decision { get; set; }
    public string Comments { get; set; } = string.Empty;
}
