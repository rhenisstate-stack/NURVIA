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
        var (attempt, question, version) = await LoadTutorQuestionAsync(attemptId, learnerId, request.QuestionId, ct);

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

        if (!string.IsNullOrWhiteSpace(aiHint))
        {
            return new TutorHintResponseDto
            {
                QuestionId = question.Id,
                Stage = request.Stage,
                Title = GetStageTitle(request.Stage),
                Content = aiHint,
                EliminatedOptionIds = GetEliminatedOptionIds(version, request.Stage),
                IsAiGenerated = true
            };
        }

        var content = BuildDeterministicHint(question, version, request.Stage);
        return new TutorHintResponseDto
        {
            QuestionId = question.Id,
            Stage = request.Stage,
            Title = GetStageTitle(request.Stage),
            Content = content,
            EliminatedOptionIds = GetEliminatedOptionIds(version, request.Stage),
            IsAiGenerated = false
        };
    }

    public async Task<TutorEvaluateResponseDto> EvaluateAnswerAsync(
        Guid attemptId,
        string learnerId,
        TutorEvaluateRequest request,
        CancellationToken ct = default)
    {
        var (attempt, question, version) = await LoadTutorQuestionAsync(attemptId, learnerId, request.QuestionId, ct);

        if (string.IsNullOrWhiteSpace(request.ResponseJson))
            throw new DomainException("Please select or enter an answer before requesting evaluation.");

        var responseEntity = attempt.Responses.FirstOrDefault(r => r.QuestionId == question.Id);
        if (responseEntity != null && attempt.Status == ExamAttemptStatus.InProgress)
        {
            responseEntity.UpdateResponse(request.ResponseJson, responseEntity.IsFlagged);
        }

        var maxPoints = responseEntity?.MaxPoints ?? 1.0m;
        var gradingResult = QuestionResponseGrader.Evaluate(version, request.ResponseJson);
        var isCorrect = gradingResult.IsCorrect;
        var pointsAwarded = Math.Round(maxPoints * gradingResult.Fraction, 2);

        if (responseEntity != null && attempt.Status == ExamAttemptStatus.InProgress)
        {
            responseEntity.Grade(isCorrect, pointsAwarded);
            await _context.SaveChangesAsync(ct);
        }

        string? aiTakeaway = null;
        if (_aiProvider.IsAvailable)
        {
            try
            {
                aiTakeaway = await _aiProvider.TryGenerateGroundedTakeawayAsync(question, version, isCorrect, ct);
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

    private async Task<(ExamAttempt Attempt, Question Question, QuestionVersion Version)> LoadTutorQuestionAsync(
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

        var examVersion = await _context.ExamVersions
            .Include(v => v.ExamQuestions)
                .ThenInclude(eq => eq.Question)
                    .ThenInclude(q => q!.CurrentVersion)
                        .ThenInclude(qv => qv!.Options)
            .Include(v => v.ExamQuestions)
                .ThenInclude(eq => eq.Question)
                    .ThenInclude(q => q!.CurrentVersion)
                        .ThenInclude(qv => qv!.Exhibits)
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == attempt.ExamVersionId, ct);

        var eq = examVersion?.ExamQuestions.FirstOrDefault(x => x.QuestionId == questionId);
        if (eq?.Question?.CurrentVersion == null)
            throw new DomainException("Question not found in this Tutor session.");

        return (attempt, eq.Question, eq.Question.CurrentVersion);
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
