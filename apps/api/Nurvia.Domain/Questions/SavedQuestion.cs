using Nurvia.Domain.Common;

namespace Nurvia.Domain.Questions;

/// <summary>
/// Represents a learner's saved/bookmarked question for focused rationale review.
/// </summary>
public class SavedQuestion : Entity
{
    public string UserId { get; set; } = string.Empty;
    public Guid QuestionId { get; set; }
    public Guid? ExamId { get; set; }
    public string? Notes { get; set; }
    public DateTime SavedAtUtc { get; set; } = DateTime.UtcNow;

    public Question? Question { get; set; }

    public SavedQuestion() { }

    public SavedQuestion(string userId, Guid questionId, Guid? examId = null, string? notes = null)
    {
        UserId = userId;
        QuestionId = questionId;
        ExamId = examId;
        Notes = notes;
        SavedAtUtc = DateTime.UtcNow;
    }
}
