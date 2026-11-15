using Nurvia.Domain.Common;

namespace Nurvia.Domain.Accounts;

/// <summary>
/// Represents a persisted study planner task owned by a learner.
/// </summary>
public class StudyPlanTask : Entity
{
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime ScheduledForUtc { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public Guid? ExamId { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public StudyPlanTask() { }
}
