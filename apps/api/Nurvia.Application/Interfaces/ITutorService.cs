using Nurvia.Application.Tutor;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Interfaces;

public interface ITutorService
{
    Task<TutorHintResponseDto> GetHintAsync(Guid attemptId, string learnerId, TutorHintRequest request, CancellationToken ct = default);
    Task<TutorEvaluateResponseDto> EvaluateAnswerAsync(Guid attemptId, string learnerId, TutorEvaluateRequest request, CancellationToken ct = default);

    /// <summary>
    /// Server-authoritative Tutor stage progression with already-authorized
    /// evaluation content for each question. Used for session recovery after page
    /// refresh; evaluation content is included only for questions whose own answer
    /// has been evaluated server-side (stage &gt;= 4).
    /// </summary>
    Task<TutorSessionStateDto> GetSessionStateAsync(Guid attemptId, string learnerId, CancellationToken ct = default);
}

/// <summary>
/// Explicit abstraction for optional AI-assisted tutoring. Implementations must remain
/// grounded in the published question, options, and approved rationales, and must never
/// alter the official answer key.
/// </summary>
public interface IAiTutorProvider
{
    bool IsAvailable { get; }
    Task<string?> TryGenerateGroundedHintAsync(Question question, QuestionVersion version, TutorStage stage, CancellationToken ct = default);
    Task<string?> TryGenerateGroundedTakeawayAsync(Question question, QuestionVersion version, bool learnerWasCorrect, CancellationToken ct = default);
}
