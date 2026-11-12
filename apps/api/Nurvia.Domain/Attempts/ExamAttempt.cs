using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;

namespace Nurvia.Domain.Attempts;

public class ExamAttempt : Entity, IAuditableEntity
{
    public Guid ExamId { get; set; }
    public Guid ExamVersionId { get; set; }
    public string LearnerId { get; set; } = string.Empty;
    public string LearnerName { get; set; } = string.Empty;
    public ExamAttemptStatus Status { get; set; } = ExamAttemptStatus.InProgress;
    public DateTime StartedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime DeadlineUtc { get; set; }
    public DateTime? SubmittedAtUtc { get; set; }
    public int TimeLimitMinutes { get; set; }
    public decimal? ScorePercentage { get; set; }
    public decimal PassingScorePercentage { get; set; }
    public bool? Passed { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectQuestions { get; set; }

    /// <summary>
    /// The delivery mode this attempt was started under (Exam or Tutor).
    /// Tutor attempts are learning sessions in which the approved answer key and
    /// rationales are delivered to the learner; Exam attempts are strictly sanitized.
    /// </summary>
    public ExamDeliveryMode DeliveryMode { get; set; } = ExamDeliveryMode.Exam;

    /// <summary>The navigation layout chosen for this attempt, persisted so resume keeps the learner's choice.</summary>
    public ExamLayout LayoutMode { get; set; } = ExamLayout.Sequential;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    public Exam? Exam { get; set; }
    public ExamVersion? ExamVersion { get; set; }
    public ICollection<AttemptResponse> Responses { get; set; } = new List<AttemptResponse>();

    public ExamAttempt() { }

    public ExamAttempt(
        Guid examId,
        Guid examVersionId,
        string learnerId,
        string learnerName,
        int timeLimitMinutes,
        decimal passingScorePercentage,
        int totalQuestions,
        ExamDeliveryMode deliveryMode = ExamDeliveryMode.Exam,
        ExamLayout layoutMode = ExamLayout.Sequential)
    {
        ExamId = examId;
        ExamVersionId = examVersionId;
        LearnerId = learnerId;
        LearnerName = learnerName;
        TimeLimitMinutes = timeLimitMinutes;
        PassingScorePercentage = passingScorePercentage;
        TotalQuestions = totalQuestions;
        DeliveryMode = deliveryMode;
        LayoutMode = layoutMode;
        Status = ExamAttemptStatus.InProgress;
        StartedAtUtc = DateTime.UtcNow;
        DeadlineUtc = StartedAtUtc.AddMinutes(timeLimitMinutes);
        CreatedAtUtc = StartedAtUtc;
        CreatedBy = learnerId;
    }

    public bool IsTimeExpired(DateTime now) => now > DeadlineUtc;

    public void Submit(DateTime submittedAt)
    {
        if (Status != ExamAttemptStatus.InProgress)
            return; // Idempotent: already submitted

        SubmittedAtUtc = submittedAt;
        Status = ExamAttemptStatus.Submitted;
        UpdatedAtUtc = submittedAt;
    }

    public void RecordScore(int correct, int total)
    {
        CorrectQuestions = correct;
        TotalQuestions = total;
        ScorePercentage = total > 0 ? Math.Round((decimal)correct / total * 100, 2) : 0m;
        Passed = ScorePercentage >= PassingScorePercentage;
        Status = ExamAttemptStatus.Graded;
    }
}
