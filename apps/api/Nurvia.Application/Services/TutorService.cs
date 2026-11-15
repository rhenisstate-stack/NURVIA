using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Questions;
using Nurvia.Application.Tutor;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Services;

/// <summary>
/// Default deterministic provider when no external AI provider is configured.
/// Never fabricates AI responses.
/// </summary>
public class GroundedFallbackAiTutorProvider : IAiTutorProvider
{
    public bool IsAvailable => false;

    public Task<string?> TryGenerateGroundedHintAsync(Question question, QuestionVersion version, TutorStage stage, CancellationToken ct = default)
        => Task.FromResult<string?>(null);

    public Task<string?> TryGenerateGroundedTakeawayAsync(Question question, QuestionVersion version, bool learnerWasCorrect, CancellationToken ct = default)
        => Task.FromResult<string?>(null);
}

/// <summary>
/// Progressive six-stage Tutor engine. The backend is the sole authority for
/// stage progression: stages are persisted per question on
/// <see cref="AttemptResponse.TutorStageReached"/>, survive page refresh and
/// session recovery, and answer-bearing content (correctness, rationales, the
/// approved key) is released exclusively through <see cref="EvaluateAnswerAsync"/>
/// after the learner's own answer has been graded server-side by
/// <see cref="QuestionResponseGrader"/>. Hint stages (2-3) never return
/// answer-bearing data, so client-side manipulation of the stage field cannot
/// pull the answer key forward.
/// </summary>
public class TutorService : ITutorService
{
    private readonly INurviaDbContext _context;
    private readonly IAiTutorProvider _aiProvider;

    public TutorService(INurviaDbContext context, IAiTutorProvider aiProvider)
    {
        _context = context;
        _aiProvider = aiProvider;
    }

    public async Task<TutorHintResponseDto> GetHintAsync(
        Guid attemptId,
        string learnerId,
        TutorHintRequest request,
        CancellationToken ct = default)
    {
        // Reject undefined enum values: an unknown or out-of-range stage can never
        // be mapped to a legitimate hint stage.
        if (!Enum.IsDefined(typeof(TutorStage), (int)request.Stage))
            throw new DomainException("Unknown tutor stage requested.");

        var (attempt, question, version, response) = await LoadTutorQuestionAsync(attemptId, learnerId, request.QuestionId, ct);

        string? aiHint = null;
        if (_aiProvider.IsAvailable)
        {
            try
            {
                aiHint = await _aiProvider.TryGenerateGroundedHintAsync(question, version, request.Stage, ct);
            }
            catch
            {
                aiHint = null;
            }
        }

        // Persist server-side progression for this non-revealing stage. The value
        // recorded never unlocks answer content; only a server-side evaluation does.
        var stageBefore = response?.TutorStageReached ?? 0;
        RecordStage(response, StageProgressionForHint(request.Stage));
        if ((response?.TutorStageReached ?? 0) != stageBefore)
        {
            await _context.SaveChangesAsync(ct);
        }

        var content = !string.IsNullOrWhiteSpace(aiHint)
            ? aiHint
            : BuildDeterministicHint(question, version, request.Stage);

        return new TutorHintResponseDto
        {
            QuestionId = question.Id,
            Stage = request.Stage,
            Title = GetStageTitle(request.Stage),
            Content = content,
            EliminatedOptionIds = GetEliminatedOptionIds(version, request.Stage),
            IsAiGenerated = !string.IsNullOrWhiteSpace(aiHint)
        };
    }

    public async Task<TutorEvaluateResponseDto> EvaluateAnswerAsync(
        Guid attemptId,
        string learnerId,
        TutorEvaluateRequest request,
        CancellationToken ct = default)
    {
        var (attempt, question, version, response) = await LoadTutorQuestionAsync(attemptId, learnerId, request.QuestionId, ct);

        if (string.IsNullOrWhiteSpace(request.ResponseJson))
            throw new DomainException("Please select or enter an answer before requesting evaluation.");

        var maxPoints = response?.MaxPoints ?? 1.0m;
        // Authoritative grading against the question version snapshotted when the
        // attempt started — never against frontend-supplied correctness values.
        var gradingResult = QuestionResponseGrader.Evaluate(version, request.ResponseJson);
        var isCorrect = gradingResult.IsCorrect;
        var pointsAwarded = Math.Round(maxPoints * gradingResult.Fraction, 2);

        if (response != null)
        {
            response.UpdateResponse(request.ResponseJson, response.IsFlagged);
            response.Grade(isCorrect, pointsAwarded);
            // The evaluate response atomically delivers Stage 4 (evaluation),
            // Stage 5 (educational explanation) and Stage 6 (knowledge
            // reinforcement); progression is recorded in the same transaction so
            // the authorized content and the persisted stage state never diverge.
            RecordStage(response, 6);
            await _context.SaveChangesAsync(ct);
        }

        return await BuildEvaluationDtoAsync(question, version, isCorrect, pointsAwarded, maxPoints);
    }

    public async Task<TutorSessionStateDto> GetSessionStateAsync(
        Guid attemptId,
        string learnerId,
        CancellationToken ct = default)
    {
        var attempt = await _context.ExamAttempts
            .Include(a => a.Responses)
                .ThenInclude(r => r.Question)
            .Include(a => a.Responses)
                .ThenInclude(r => r.QuestionVersion!)
                    .ThenInclude(qv => qv!.Options)
            .Include(a => a.Responses)
                .ThenInclude(r => r.QuestionVersion!)
                    .ThenInclude(qv => qv!.Exhibits)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct);

        if (attempt == null)
            throw new DomainException("Examination attempt not found.");

        if (!string.Equals(attempt.LearnerId, learnerId, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Access denied: You do not own this examination attempt.");

        if (attempt.DeliveryMode != ExamDeliveryMode.Tutor)
            throw new UnauthorizedAccessException("Tutor guidance is only available during Tutor-mode sessions.");

        if (attempt.Status != ExamAttemptStatus.InProgress)
            throw new DomainException("Tutor guidance is only available while the Tutor session is in progress.");

        var state = new TutorSessionStateDto
        {
            AttemptId = attempt.Id,
            DeliveryMode = attempt.DeliveryMode
        };

        foreach (var response in attempt.Responses.OrderBy(r => r.OrderIndex))
        {
            var version = response.QuestionVersion;
            var question = response.Question;
            if (question == null || version == null)
                continue;

            var dto = new TutorQuestionStateDto
            {
                QuestionId = question.Id,
                // Legacy attempts graded before stage tracking existed: an already
                // graded response implies the learner passed through evaluation.
                StageReached = response.IsCorrect != null && response.TutorStageReached < 4
                    ? 6
                    : response.TutorStageReached
            };

            // Evaluation content is attached ONLY for questions whose own answer
            // was already evaluated server-side. A question at stages 1-3 gets a
            // bare state row — no correctness, no rationales, no answer key.
            if (dto.StageReached >= 4 && response.IsCorrect != null)
            {
                dto.Evaluation = await BuildEvaluationDtoAsync(
                    question,
                    version,
                    response.IsCorrect.Value,
                    response.PointsAwarded,
                    response.MaxPoints);
            }

            state.Questions.Add(dto);
        }

        return state;
    }

    /// <summary>
    /// Loads a Tutor question with full ownership, mode, and session-state
    /// enforcement, returning the snapshotted question version the learner
    /// actually saw when the attempt started (authoritative for grading).
    /// </summary>
    private async Task<(ExamAttempt Attempt, Question Question, QuestionVersion Version, AttemptResponse? Response)> LoadTutorQuestionAsync(
        Guid attemptId,
        string learnerId,
        Guid questionId,
        CancellationToken ct)
    {
        var attempt = await _context.ExamAttempts
            .Include(a => a.Responses)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct);

        if (attempt == null)
            throw new DomainException("Examination attempt not found.");

        if (!string.Equals(attempt.LearnerId, learnerId, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Access denied: You do not own this examination attempt.");

        if (attempt.DeliveryMode != ExamDeliveryMode.Tutor)
            throw new UnauthorizedAccessException("Tutor guidance is only available during Tutor-mode sessions.");

        if (attempt.Status != ExamAttemptStatus.InProgress)
            throw new DomainException("Tutor guidance is only available while the Tutor session is in progress.");

        // The attempt response is the authoritative membership + content anchor:
        // a question is only reachable if the learner's own attempt contains it.
        var response = attempt.Responses.FirstOrDefault(r => r.QuestionId == questionId);
        if (response == null)
            throw new DomainException("Question not found in this Tutor session.");

        var version = await _context.QuestionVersions
            .Include(v => v.Options)
            .Include(v => v.Exhibits)
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == response.QuestionVersionId, ct);

        if (version == null)
            throw new DomainException("Question not found in this Tutor session.");

        var question = await _context.Questions
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == questionId, ct);

        if (question == null)
            throw new DomainException("Question not found in this Tutor session.");

        return (attempt, question, version, response);
    }

    private static int StageProgressionForHint(TutorStage stage) => stage switch
    {
        // First Hint (Stage 2). The ExplainConcept aid is a Stage-3-level
        // conceptual overview and never discloses the answer.
        TutorStage.FirstHint => 2,
        // Guided Reasoning (Stage 3) and the conceptual overview aid.
        _ => 3
    };

    private static void RecordStage(AttemptResponse? response, int stage)
    {
        if (response == null)
            return;

        // Monotonic: replayed or manipulated requests can never rewind the stage.
        response.RecordTutorStage(stage);
    }

    private async Task<TutorEvaluateResponseDto> BuildEvaluationDtoAsync(
        Question question,
        QuestionVersion version,
        bool isCorrect,
        decimal pointsAwarded,
        decimal maxPoints)
    {
        // Stage 6 reinforcement: grounded takeaway from the AI provider when
        // available, deterministic grounded content otherwise.
        string? aiTakeaway = null;
        if (_aiProvider.IsAvailable)
        {
            try
            {
                aiTakeaway = await _aiProvider.TryGenerateGroundedTakeawayAsync(question, version, isCorrect);
            }
            catch
            {
                aiTakeaway = null;
            }
        }

        var clinicalConcept = $"{question.Subject} — {question.Topic} ({FormatEnumName(version.ClientNeedCategory.ToString())})";
        var nursingPrinciple = $"NCJMM Cognitive Skill: {FormatEnumName(version.CognitiveSkill.ToString())}.";
        var takeaway = !string.IsNullOrWhiteSpace(aiTakeaway)
            ? aiTakeaway
            : BuildDeterministicTakeaway(question, version, isCorrect);

        return new TutorEvaluateResponseDto
        {
            QuestionId = question.Id,
            IsCorrect = isCorrect,
            PointsAwarded = pointsAwarded,
            MaxPoints = maxPoints,
            GeneralRationale = version.GeneralRationale,
            OptionRationales = version.Options
                .OrderBy(o => o.DisplayOrder)
                .Select(o => new TutorOptionExplanationDto
                {
                    OptionId = o.Id,
                    OptionIndex = o.OptionIndex.ToString(),
                    OptionText = o.OptionText,
                    IsCorrect = o.IsCorrect,
                    SpecificRationale = o.SpecificRationale
                })
                .ToList(),
            ClinicalConcept = clinicalConcept,
            NursingPrinciple = nursingPrinciple,
            Takeaway = takeaway,
            IsAiGenerated = !string.IsNullOrWhiteSpace(aiTakeaway)
        };
    }

    private static string GetStageTitle(TutorStage stage) => stage switch
    {
        TutorStage.FirstHint => "Stage 2 · Conceptual Hint",
        TutorStage.GuidedReasoning => "Stage 3 · Guided Clinical Reasoning",
        TutorStage.ExplainConcept => "Clinical Concept Overview",
        _ => "Tutor Guidance"
    };

    private static List<Guid> GetEliminatedOptionIds(QuestionVersion version, TutorStage stage)
    {
        if (stage != TutorStage.GuidedReasoning)
            return new List<Guid>();

        // Eliminate one clearly incorrect distractor when multiple incorrect options exist
        // so the learner still actively reasons through the remaining choices.
        var incorrectOptions = version.Options
            .Where(o => !o.IsCorrect)
            .OrderBy(o => o.DisplayOrder)
            .ToList();

        if (incorrectOptions.Count >= 2)
        {
            return new List<Guid> { incorrectOptions[0].Id };
        }

        return new List<Guid>();
    }

    private static string BuildDeterministicHint(Question question, QuestionVersion version, TutorStage stage)
    {
        var skill = FormatEnumName(version.CognitiveSkill.ToString());
        var clientNeed = FormatEnumName(version.ClientNeedCategory.ToString());

        return stage switch
        {
            TutorStage.FirstHint =>
                $"Focus on the core nursing domain: {question.Subject} ({question.Topic}). " +
                $"This item tests '{skill}' under '{clientNeed}'. Identify the priority clinical cue in the stem before evaluating options.",

            TutorStage.GuidedReasoning =>
                BuildGuidedReasoningText(version, skill),

            TutorStage.ExplainConcept =>
                $"Key Concept: {question.Subject} — {question.Topic}. " +
                $"In NCLEX/CJMM clinical judgment, '{skill}' requires linking patient safety cues with evidence-based '{clientNeed}' interventions.",

            _ => $"Review the clinical cues for {question.Topic} and apply {skill}."
        };
    }

    private static string BuildGuidedReasoningText(QuestionVersion version, string skill)
    {
        var firstIncorrect = version.Options
            .Where(o => !o.IsCorrect)
            .OrderBy(o => o.DisplayOrder)
            .FirstOrDefault();

        if (firstIncorrect != null && !string.IsNullOrWhiteSpace(firstIncorrect.SpecificRationale))
        {
            return $"Guided Reasoning ({skill}): Consider ruling out option {firstIncorrect.OptionIndex} — {firstIncorrect.SpecificRationale} Now compare the remaining options against the patient's immediate safety needs.";
        }

        if (version.Exhibits.Count > 0)
        {
            return $"Guided Reasoning ({skill}): Cross-check the clinical exhibits ({string.Join(", ", version.Exhibits.Select(e => e.Title))}) with the question stem to eliminate options that do not address the primary physiological or safety cue.";
        }

        return $"Guided Reasoning ({skill}): Eliminate options that delay urgent assessment, violate scope of practice, or fail to address the highest-priority patient safety cue.";
    }

    private static string BuildDeterministicTakeaway(Question question, QuestionVersion version, bool isCorrect)
    {
        var prefix = isCorrect
            ? "Great clinical reasoning."
            : "Review this principle for your next attempt:";

        return $"{prefix} For {question.Subject} ({question.Topic}), always anchor your decision in {FormatEnumName(version.ClientNeedCategory.ToString())} and {FormatEnumName(version.CognitiveSkill.ToString())}.";
    }

    private static string FormatEnumName(string value)
    {
        return System.Text.RegularExpressions.Regex.Replace(value, "([a-z])([A-Z])", "$1 $2");
    }
}
