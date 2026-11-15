using Nurvia.Domain.Common;
using Nurvia.Domain.Questions;

namespace Nurvia.Domain.Attempts;

public class AttemptResponse : Entity
{
    public Guid ExamAttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid QuestionVersionId { get; set; }
    public int OrderIndex { get; set; }
    public string? ResponseJson { get; set; }
    public bool IsAnswered { get; set; }
    public bool IsFlagged { get; set; }
    public DateTime SavedAtUtc { get; set; } = DateTime.UtcNow;
    public bool? IsCorrect { get; set; }
    public decimal PointsAwarded { get; set; }
    public decimal MaxPoints { get; set; } = 1.0m;

    /// <summary>
    /// Server-authoritative Tutor stage progression for this question (0 = not a
    /// Tutor session; 1 = Independent Thinking; 2 = First Hint; 3 = Guided
    /// Reasoning; 4 = Answer Evaluated; 6 = Explanation + Reinforcement delivered).
    /// The backend, never the client, decides which Tutor content may be released,
    /// and this value survives page refresh and session recovery.
    /// </summary>
    public int TutorStageReached { get; set; }

    public ExamAttempt? ExamAttempt { get; set; }
    public Question? Question { get; set; }
    public QuestionVersion? QuestionVersion { get; set; }

    public AttemptResponse() { }

    public AttemptResponse(Guid examAttemptId, Guid questionId, Guid questionVersionId, int orderIndex, decimal maxPoints = 1.0m)
    {
        ExamAttemptId = examAttemptId;
        QuestionId = questionId;
        QuestionVersionId = questionVersionId;
        OrderIndex = orderIndex;
        MaxPoints = maxPoints;
        SavedAtUtc = DateTime.UtcNow;
    }

    public void UpdateResponse(string? responseJson, bool isFlagged)
    {
        ResponseJson = responseJson;
        IsAnswered = !string.IsNullOrWhiteSpace(responseJson) && responseJson != "[]" && responseJson != "{}";
        IsFlagged = isFlagged;
        SavedAtUtc = DateTime.UtcNow;
    }

    public void Grade(bool isCorrect, decimal pointsAwarded)
    {
        IsCorrect = isCorrect;
        PointsAwarded = pointsAwarded;
    }

    /// <summary>
    /// Monotonically advances the server-authoritative Tutor progression for this
    /// question. Lower or equal stages are ignored so replayed requests can never
    /// rewind or manipulate the stage state.
    /// </summary>
    public void RecordTutorStage(int stage)
    {
        if (stage > TutorStageReached)
            TutorStageReached = stage;
    }
}
