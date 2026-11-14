using Nurvia.Domain.Common;

namespace Nurvia.Domain.Exams;

/// <summary>
/// Represents a verified learner rating and optional review/testimonial for a published study set.
/// </summary>
public class ExamReview : Entity
{
    public Guid ExamId { get; set; }
    public string LearnerId { get; set; } = string.Empty;
    public string LearnerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }

    public Exam? Exam { get; set; }

    public ExamReview() { }

    public ExamReview(Guid examId, string learnerId, string learnerName, int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");

        ExamId = examId;
        LearnerId = learnerId;
        LearnerName = learnerName;
        Rating = rating;
        Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim();
        IsApproved = true;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void Update(int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");

        Rating = rating;
        Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim();
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
