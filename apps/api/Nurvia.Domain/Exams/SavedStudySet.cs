using Nurvia.Domain.Common;

namespace Nurvia.Domain.Exams;

/// <summary>
/// Represents a learner's bookmarked/saved study set in their personal library.
/// </summary>
public class SavedStudySet : Entity
{
    public string UserId { get; set; } = string.Empty;
    public Guid ExamId { get; set; }
    public DateTime SavedAtUtc { get; set; } = DateTime.UtcNow;

    public Exam? Exam { get; set; }

    public SavedStudySet() { }

    public SavedStudySet(string userId, Guid examId)
    {
        UserId = userId;
        ExamId = examId;
        SavedAtUtc = DateTime.UtcNow;
    }
}
