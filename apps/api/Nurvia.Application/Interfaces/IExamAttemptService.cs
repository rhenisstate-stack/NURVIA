using Nurvia.Application.Exams;
using Nurvia.Application.Questions;

namespace Nurvia.Application.Interfaces;

public class StartAttemptResultDto
{
    public Guid AttemptId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; }
    public int RemainingSeconds { get; set; }
    public DateTime StartedAtUtc { get; set; }
    public DateTime DeadlineUtc { get; set; }
    public int TotalQuestions { get; set; }
    public List<ActiveExamQuestionDto> Questions { get; set; } = new();
    public Dictionary<Guid, LearnerAnswerStateDto> SavedResponses { get; set; } = new();
}

public class LearnerAnswerStateDto
{
    public string? ResponseJson { get; set; }
    public bool IsAnswered { get; set; }
    public bool IsFlagged { get; set; }
    public DateTime SavedAtUtc { get; set; }
}

public class AutosaveResponseRequest
{
    public Guid QuestionId { get; set; }
    public string? ResponseJson { get; set; }
    public bool IsFlagged { get; set; }
}

public class AutosaveResultDto
{
    public Guid QuestionId { get; set; }
    public bool IsAnswered { get; set; }
    public bool IsFlagged { get; set; }
    public DateTime SavedAtUtc { get; set; }
}

public interface IExamAttemptService
{
    Task<StartAttemptResultDto> StartAttemptAsync(Guid examId, string learnerId, string learnerName, CancellationToken ct = default);
    Task<StartAttemptResultDto?> GetActiveAttemptAsync(Guid attemptId, string learnerId, CancellationToken ct = default);
    Task<AutosaveResultDto> AutosaveResponseAsync(Guid attemptId, AutosaveResponseRequest request, string learnerId, CancellationToken ct = default);
    Task<SubmittedExamResultDto> SubmitAttemptAsync(Guid attemptId, string learnerId, CancellationToken ct = default);
    Task<SubmittedExamResultDto> GetAttemptReviewAsync(Guid attemptId, string learnerId, CancellationToken ct = default);
    Task<List<ExamAttemptSummaryDto>> GetLearnerHistoryAsync(string learnerId, CancellationToken ct = default);
}
