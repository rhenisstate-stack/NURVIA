using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;

namespace Nurvia.Domain.Questions;

public class QuestionReview : Entity
{
    public Guid QuestionId { get; set; }
    public Guid QuestionVersionId { get; set; }
    public string ReviewerId { get; set; } = string.Empty;
    public string ReviewerName { get; set; } = string.Empty;
    public ReviewDecision Decision { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime ReviewedAtUtc { get; set; } = DateTime.UtcNow;

    public Question? Question { get; set; }
    public QuestionVersion? QuestionVersion { get; set; }

    public QuestionReview() { }

    public QuestionReview(Guid questionId, Guid questionVersionId, string reviewerId, string reviewerName, ReviewDecision decision, string comments)
    {
        QuestionId = questionId;
        QuestionVersionId = questionVersionId;
        ReviewerId = reviewerId;
        ReviewerName = reviewerName;
        Decision = decision;
        Comments = comments;
        ReviewedAtUtc = DateTime.UtcNow;
    }
}
