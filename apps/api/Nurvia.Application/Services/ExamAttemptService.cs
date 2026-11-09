using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Questions;
using Nurvia.Domain.Attempts;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Services;

public class ExamAttemptService : IExamAttemptService
{
    private readonly INurviaDbContext _context;

    public ExamAttemptService(INurviaDbContext context)
    {
        _context = context;
    }

    public async Task<StartAttemptResultDto> StartAttemptAsync(Guid examId, string learnerId, string learnerName, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
                        .ThenInclude(q => q!.CurrentVersion)
                            .ThenInclude(qv => qv!.Options)
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
                        .ThenInclude(q => q!.CurrentVersion)
                            .ThenInclude(qv => qv!.Exhibits)
            .FirstOrDefaultAsync(e => e.Id == examId, ct);

        if (exam == null)
            throw new DomainException($"Examination with ID '{examId}' was not found.");

        var version = exam.CurrentVersion;
        if (version == null)
            throw new DomainException("This examination has not yet been configured with an active version.");
        if (exam.Status != ExamStatus.Published)
            throw new DomainException("Only published examinations are available to learners.");

        // Check for an ongoing active attempt for this learner
        var existingAttempt = await _context.ExamAttempts
            .Include(a => a.Responses)
            .FirstOrDefaultAsync(a => a.ExamId == examId && a.LearnerId == learnerId && a.Status == ExamAttemptStatus.InProgress, ct);

        if (existingAttempt != null)
        {
            var remainingSecs = (int)Math.Max(0, (existingAttempt.DeadlineUtc - DateTime.UtcNow).TotalSeconds);
            if (remainingSecs == 0)
            {
                // Auto-submit expired attempt
                await SubmitAttemptAsync(existingAttempt.Id, learnerId, ct);
            }
            else
            {
                return BuildStartAttemptDto(existingAttempt, exam, version, remainingSecs);
            }
        }

        var sortedExamQuestions = version.ExamQuestions.OrderBy(eq => eq.OrderIndex).ToList();
        var totalQuestions = sortedExamQuestions.Count;

        var attempt = new ExamAttempt(
            exam.Id,
            version.Id,
            learnerId,
            learnerName,
            version.TimeLimitMinutes > 0 ? version.TimeLimitMinutes : 90,
            version.PassingScorePercentage > 0 ? version.PassingScorePercentage : 75.0m,
            totalQuestions
        );

        int order = 1;
        foreach (var eq in sortedExamQuestions)
        {
            if (eq.Question != null && eq.Question.CurrentVersion != null)
            {
                var response = new AttemptResponse(
                    attempt.Id,
                    eq.Question.Id,
                    eq.Question.CurrentVersion.Id,
                    order++,
                    eq.Points > 0 ? eq.Points : 1.0m
                );
                attempt.Responses.Add(response);
            }
        }

        _context.ExamAttempts.Add(attempt);
        await _context.SaveChangesAsync(ct);

        var remaining = (int)Math.Max(0, (attempt.DeadlineUtc - DateTime.UtcNow).TotalSeconds);
        return BuildStartAttemptDto(attempt, exam, version, remaining);
    }

    public async Task<StartAttemptResultDto?> GetActiveAttemptAsync(Guid attemptId, string learnerId, CancellationToken ct = default)
    {
        var attempt = await _context.ExamAttempts
            .Include(a => a.Responses)
            .Include(a => a.Exam)
                .ThenInclude(e => e!.CurrentVersion)
                    .ThenInclude(v => v!.ExamQuestions)
                        .ThenInclude(eq => eq.Question)
                            .ThenInclude(q => q!.CurrentVersion)
                                .ThenInclude(qv => qv!.Options)
            .Include(a => a.Exam)
                .ThenInclude(e => e!.CurrentVersion)
                    .ThenInclude(v => v!.ExamQuestions)
                        .ThenInclude(eq => eq.Question)
                            .ThenInclude(q => q!.CurrentVersion)
                                .ThenInclude(qv => qv!.Exhibits)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct);

        if (attempt == null)
            return null;

        VerifyLearnerOwnership(attempt, learnerId);

        var remainingSecs = (int)Math.Max(0, (attempt.DeadlineUtc - DateTime.UtcNow).TotalSeconds);
        if (remainingSecs == 0 && attempt.Status == ExamAttemptStatus.InProgress)
        {
            await SubmitAttemptAsync(attemptId, learnerId, ct);
            return null; // Converted to submitted
        }

        if (attempt.Exam == null || attempt.Exam.CurrentVersion == null)
            return null;

        return BuildStartAttemptDto(attempt, attempt.Exam, attempt.Exam.CurrentVersion, remainingSecs);
    }

    public async Task<AutosaveResultDto> AutosaveResponseAsync(Guid attemptId, AutosaveResponseRequest request, string learnerId, CancellationToken ct = default)
    {
        var attempt = await _context.ExamAttempts
            .Include(a => a.Responses)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct);

        if (attempt == null)
            throw new DomainException($"Attempt with ID '{attemptId}' was not found.");

        VerifyLearnerOwnership(attempt, learnerId);

        if (attempt.Status != ExamAttemptStatus.InProgress)
            throw new DomainException("Responses can only be saved while an examination attempt is in progress.");

        if (attempt.IsTimeExpired(DateTime.UtcNow))
        {
            await SubmitAttemptAsync(attemptId, learnerId, ct);
            throw new DomainException("Examination time limit has expired. Your attempt has been automatically submitted.");
        }

        var response = attempt.Responses.FirstOrDefault(r => r.QuestionId == request.QuestionId);
        if (response == null)
            throw new DomainException($"Question with ID '{request.QuestionId}' is not part of this examination attempt.");

        response.UpdateResponse(request.ResponseJson, request.IsFlagged);
        await _context.SaveChangesAsync(ct);

        return new AutosaveResultDto
        {
            QuestionId = response.QuestionId,
            IsAnswered = response.IsAnswered,
            IsFlagged = response.IsFlagged,
            SavedAtUtc = response.SavedAtUtc
        };
    }

    public async Task<SubmittedExamResultDto> SubmitAttemptAsync(Guid attemptId, string learnerId, CancellationToken ct = default)
    {
        var attempt = await _context.ExamAttempts
            .Include(a => a.Exam)
            .Include(a => a.ExamVersion)
            .Include(a => a.Responses)
                .ThenInclude(r => r.Question)
                    .ThenInclude(q => q!.CurrentVersion)
                        .ThenInclude(qv => qv!.Options)
            .Include(a => a.Responses)
                .ThenInclude(r => r.Question)
                    .ThenInclude(q => q!.CurrentVersion)
                        .ThenInclude(qv => qv!.Exhibits)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct);

        if (attempt == null)
            throw new DomainException($"Attempt with ID '{attemptId}' was not found.");

        VerifyLearnerOwnership(attempt, learnerId);

        // Review release policy is resolved from the exam version that owns this attempt.
        var reviewReleased = IsReviewReleased(attempt);

        // If already graded, return existing result (Idempotent)
        if (attempt.Status == ExamAttemptStatus.Graded || attempt.Status == ExamAttemptStatus.Submitted)
        {
            return BuildSubmittedResultDto(attempt, reviewReleased);
        }

        // Deterministic Scoring Engine
        int correctCount = 0;
        int totalQuestions = attempt.Responses.Count;

        foreach (var response in attempt.Responses)
        {
            var qv = response.Question?.CurrentVersion;
            if (qv == null)
                continue;

            bool isCorrect = EvaluateQuestionResponse(qv, response.ResponseJson);
            decimal points = isCorrect ? response.MaxPoints : 0.0m;

            response.Grade(isCorrect, points);
            if (isCorrect)
                correctCount++;
        }

        attempt.Submit(DateTime.UtcNow);
        attempt.RecordScore(correctCount, totalQuestions);

        await _context.SaveChangesAsync(ct);

        return BuildSubmittedResultDto(attempt, reviewReleased);
    }

    public async Task<SubmittedExamResultDto> GetAttemptReviewAsync(Guid attemptId, string learnerId, CancellationToken ct = default)
    {
        var attempt = await _context.ExamAttempts
            .Include(a => a.Exam)
            .Include(a => a.ExamVersion)
            .Include(a => a.Responses)
                .ThenInclude(r => r.Question)
                    .ThenInclude(q => q!.CurrentVersion)
                        .ThenInclude(qv => qv!.Options)
            .Include(a => a.Responses)
                .ThenInclude(r => r.Question)
                    .ThenInclude(q => q!.CurrentVersion)
                        .ThenInclude(qv => qv!.Exhibits)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct);

        if (attempt == null)
            throw new DomainException($"Attempt with ID '{attemptId}' was not found.");

        VerifyLearnerOwnership(attempt, learnerId);

        if (attempt.Status == ExamAttemptStatus.InProgress)
            throw new DomainException("Review is not permitted while an examination attempt is in progress.");

        if (!IsReviewReleased(attempt))
            throw new ReviewNotReleasedException();

        return BuildSubmittedResultDto(attempt, reviewReleased: true);
    }

    public async Task<List<ExamAttemptSummaryDto>> GetLearnerHistoryAsync(string learnerId, CancellationToken ct = default)
    {
        return await _context.ExamAttempts
            .AsNoTracking()
            .Where(a => a.LearnerId == learnerId)
            .OrderByDescending(a => a.StartedAtUtc)
            .Select(a => new ExamAttemptSummaryDto
            {
                AttemptId = a.Id,
                ExamId = a.ExamId,
                ExamTitle = a.Exam != null ? a.Exam.Title : "Nursing Examination",
                Status = a.Status.ToString(),
                StartedAtUtc = a.StartedAtUtc,
                SubmittedAtUtc = a.SubmittedAtUtc,
                ScorePercentage = a.ScorePercentage,
                Passed = a.Passed,
                TotalQuestions = a.TotalQuestions
            })
            .ToListAsync(ct);
    }

    private static bool EvaluateQuestionResponse(QuestionVersion qv, string? responseJson)
    {
        if (string.IsNullOrWhiteSpace(responseJson) || responseJson == "null")
            return false;

        try
        {
            switch (qv.QuestionType)
            {
                case QuestionType.MultipleChoice:
                case QuestionType.SingleChoice:
                case QuestionType.TrueFalse:
                case QuestionType.ImageBased:
                    var selectedOpt = FindSelectedOption(qv.Options, responseJson);
                    return selectedOpt?.IsCorrect == true;

                case QuestionType.MultipleResponse: // SATA
                    var chosenOpts = FindSelectedOptions(qv.Options, responseJson);
                    var correctOpts = qv.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                    var chosenIds = chosenOpts.Select(o => o.Id).ToHashSet();
                    return chosenIds.Count > 0 && chosenIds.SetEquals(correctOpts);

                case QuestionType.NumericCalculation:
                    var trimmedResponse = responseJson.Trim('\"', ' ', '\'');
                    if (trimmedResponse.StartsWith("{"))
                    {
                        using var numDoc = JsonDocument.Parse(trimmedResponse);
                        if (numDoc.RootElement.TryGetProperty("NumericResponse", out var prop) ||
                            numDoc.RootElement.TryGetProperty("numericResponse", out prop) ||
                            numDoc.RootElement.TryGetProperty("value", out prop))
                        {
                            trimmedResponse = prop.ToString().Trim('\"', ' ', '\'');
                        }
                    }
                    var targetOption = qv.Options.FirstOrDefault(o => o.IsCorrect)?.OptionText?.Trim();
                    if (targetOption != null && decimal.TryParse(targetOption, out var targetNum) && decimal.TryParse(trimmedResponse, out var candidateNum))
                    {
                        return Math.Abs(targetNum - candidateNum) < 0.01m;
                    }
                    return string.Equals(trimmedResponse, targetOption, StringComparison.OrdinalIgnoreCase);

                case QuestionType.Cloze:
                case QuestionType.ShortAnswer:
                    var textResponse = responseJson.Trim('\"', ' ', '\'').ToLowerInvariant();
                    if (textResponse.StartsWith("{"))
                    {
                        using var txtDoc = JsonDocument.Parse(textResponse);
                        if (txtDoc.RootElement.TryGetProperty("TextResponse", out var tprop) ||
                            txtDoc.RootElement.TryGetProperty("textResponse", out tprop) ||
                            txtDoc.RootElement.TryGetProperty("value", out tprop))
                        {
                            textResponse = tprop.GetString()?.Trim().ToLowerInvariant() ?? "";
                        }
                    }
                    return qv.Options.Any(o => o.IsCorrect && o.OptionText.Trim().ToLowerInvariant() == textResponse);

                default:
                    // For remaining types, check non-empty response
                    return !string.IsNullOrWhiteSpace(responseJson) && responseJson != "[]" && responseJson != "{}";
            }
        }
        catch
        {
            return false;
        }
    }

    private static StartAttemptResultDto BuildStartAttemptDto(ExamAttempt attempt, Exam exam, ExamVersion version, int remainingSecs)
    {
        var questions = new List<ActiveExamQuestionDto>();
        var savedResponses = new Dictionary<Guid, LearnerAnswerStateDto>();

        var sortedExamQuestions = version.ExamQuestions.OrderBy(eq => eq.OrderIndex).ToList();
        int order = 1;

        foreach (var eq in sortedExamQuestions)
        {
            var q = eq.Question;
            var qv = q?.CurrentVersion;
            if (q == null || qv == null)
                continue;

            // Strict DTO Sanitization: Active exam questions NEVER contain IsCorrect, specific rationales, or general rationales
            var activeQuestion = new ActiveExamQuestionDto
            {
                Id = q.Id,
                OrderIndex = order++,
                Stem = qv.Stem,
                QuestionType = qv.QuestionType,
                CognitiveSkill = qv.CognitiveSkill,
                ClientNeedCategory = qv.ClientNeedCategory,
                ContentJsonData = qv.ContentJsonData,
                Options = qv.Options.OrderBy(o => o.DisplayOrder).Select(o => new ActiveExamOptionDto
                {
                    Id = o.Id,
                    OptionIndex = o.OptionIndex,
                    OptionText = o.OptionText,
                    DisplayOrder = o.DisplayOrder
                }).ToList(),
                Exhibits = qv.Exhibits.OrderBy(e => e.DisplayOrder).Select(e => new QuestionExhibitDto
                {
                    Id = e.Id,
                    Type = e.Type,
                    Title = e.Title,
                    Content = e.Content,
                    DisplayOrder = e.DisplayOrder
                }).ToList()
            };

            questions.Add(activeQuestion);

            var existingResp = attempt.Responses.FirstOrDefault(r => r.QuestionId == q.Id);
            if (existingResp != null)
            {
                savedResponses[q.Id] = new LearnerAnswerStateDto
                {
                    ResponseJson = existingResp.ResponseJson,
                    IsAnswered = existingResp.IsAnswered,
                    IsFlagged = existingResp.IsFlagged,
                    SavedAtUtc = existingResp.SavedAtUtc
                };
            }
        }

        return new StartAttemptResultDto
        {
            AttemptId = attempt.Id,
            ExamId = exam.Id,
            ExamTitle = exam.Title,
            TimeLimitMinutes = attempt.TimeLimitMinutes,
            RemainingSeconds = remainingSecs,
            StartedAtUtc = attempt.StartedAtUtc,
            DeadlineUtc = attempt.DeadlineUtc,
            TotalQuestions = questions.Count,
            Questions = questions,
            SavedResponses = savedResponses
        };
    }

    private static bool IsReviewReleased(ExamAttempt attempt)
    {
        var version = attempt.ExamVersion;
        if (version == null)
            return true; // Legacy attempts without a resolvable version keep immediate review.

        return version.ReviewReleasePolicy == ReviewReleasePolicy.Immediate
            || version.ReviewReleasedAtUtc != null;
    }

    private static SubmittedExamResultDto BuildSubmittedResultDto(ExamAttempt attempt, bool reviewReleased)
    {
        var reviewQuestions = new List<ReviewQuestionDto>();
        int order = 1;

        foreach (var resp in attempt.Responses.OrderBy(r => r.OrderIndex))
        {
            var q = resp.Question;
            var qv = q?.CurrentVersion;
            if (q == null || qv == null)
                continue;

            // Review questions include full feedback: IsCorrect, specific rationale, and general rationale.
            // While review is withheld, correctness indicators and rationales are strictly sanitized.
            var reviewQ = new ReviewQuestionDto
            {
                QuestionId = q.Id,
                OrderIndex = order++,
                Stem = qv.Stem,
                QuestionType = qv.QuestionType,
                CognitiveSkill = qv.CognitiveSkill,
                ClientNeedCategory = qv.ClientNeedCategory,
                GeneralRationale = reviewReleased ? qv.GeneralRationale : null,
                LearnerResponse = resp.ResponseJson,
                IsCorrect = reviewReleased && resp.IsCorrect == true,
                PointsAwarded = reviewReleased ? resp.PointsAwarded : 0m,
                MaxPoints = resp.MaxPoints,
                Options = qv.Options.OrderBy(o => o.DisplayOrder).Select(o => new ReviewOptionDto
                {
                    Id = o.Id,
                    OptionIndex = o.OptionIndex,
                    OptionText = o.OptionText,
                    IsCorrect = reviewReleased && o.IsCorrect,
                    SpecificRationale = reviewReleased ? o.SpecificRationale : null,
                    WasSelected = IsOptionSelected(o, resp.ResponseJson, qv.QuestionType)
                }).ToList(),
                Exhibits = qv.Exhibits.OrderBy(e => e.DisplayOrder).Select(e => new QuestionExhibitDto
                {
                    Id = e.Id,
                    Type = e.Type,
                    Title = e.Title,
                    Content = e.Content,
                    DisplayOrder = e.DisplayOrder
                }).ToList()
            };

            reviewQuestions.Add(reviewQ);
        }

        var timeSpent = (int)Math.Max(0, ((attempt.SubmittedAtUtc ?? DateTime.UtcNow) - attempt.StartedAtUtc).TotalSeconds);

        return new SubmittedExamResultDto
        {
            AttemptId = attempt.Id,
            ExamId = attempt.ExamId,
            ExamTitle = attempt.Exam != null ? attempt.Exam.Title : "Nursing Examination",
            Status = attempt.Status.ToString(),
            StartedAtUtc = attempt.StartedAtUtc,
            SubmittedAtUtc = attempt.SubmittedAtUtc ?? DateTime.UtcNow,
            TimeSpentSeconds = timeSpent,
            TotalQuestions = attempt.TotalQuestions,
            CorrectQuestions = attempt.CorrectQuestions,
            ScorePercentage = attempt.ScorePercentage ?? 0m,
            PassingScorePercentage = attempt.PassingScorePercentage,
            Passed = attempt.Passed == true,
            ReviewReleased = reviewReleased,
            ReviewQuestions = reviewQuestions
        };
    }

    private static QuestionOption? FindSelectedOption(IEnumerable<QuestionOption> options, string responseJson)
    {
        var trimmed = responseJson.Trim();

        // 1. Direct integer (OptionIndex)
        if (int.TryParse(trimmed, out var intIdx))
            return options.FirstOrDefault(o => o.OptionIndex == intIdx);

        // 2. Direct Guid (Option ID)
        if (Guid.TryParse(trimmed.Trim('\"'), out var guidId))
            return options.FirstOrDefault(o => o.Id == guidId);

        // 3. JSON Document
        using var doc = JsonDocument.Parse(trimmed);
        if (doc.RootElement.ValueKind == JsonValueKind.Number)
        {
            var idx = doc.RootElement.GetInt32();
            return options.FirstOrDefault(o => o.OptionIndex == idx);
        }

        if (doc.RootElement.ValueKind == JsonValueKind.String)
        {
            var str = doc.RootElement.GetString()?.Trim();
            if (Guid.TryParse(str, out var g))
                return options.FirstOrDefault(o => o.Id == g);
            if (int.TryParse(str, out var parsedIdx))
                return options.FirstOrDefault(o => o.OptionIndex == parsedIdx);
            return options.FirstOrDefault(o => string.Equals(o.OptionText, str, StringComparison.OrdinalIgnoreCase));
        }

        if (doc.RootElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var propName in new[] { "SelectedOptionId", "selectedOptionId", "OptionId", "optionId" })
            {
                if (doc.RootElement.TryGetProperty(propName, out var p))
                {
                    if (p.ValueKind == JsonValueKind.String && Guid.TryParse(p.GetString(), out var g))
                        return options.FirstOrDefault(o => o.Id == g);
                    if (p.ValueKind == JsonValueKind.Number)
                    {
                        var idx = p.GetInt32();
                        return options.FirstOrDefault(o => o.OptionIndex == idx);
                    }
                }
            }

            foreach (var propName in new[] { "OptionIndex", "optionIndex", "SelectedOptionIndex", "selectedOptionIndex", "value", "Value" })
            {
                if (doc.RootElement.TryGetProperty(propName, out var p))
                {
                    if (p.ValueKind == JsonValueKind.Number)
                    {
                        var idx = p.GetInt32();
                        return options.FirstOrDefault(o => o.OptionIndex == idx);
                    }
                    if (p.ValueKind == JsonValueKind.String && int.TryParse(p.GetString(), out var parsedIdx))
                        return options.FirstOrDefault(o => o.OptionIndex == parsedIdx);
                }
            }
        }

        return null;
    }

    private static List<QuestionOption> FindSelectedOptions(IEnumerable<QuestionOption> options, string responseJson)
    {
        var result = new List<QuestionOption>();
        var trimmed = responseJson.Trim();

        using var doc = JsonDocument.Parse(trimmed);
        JsonElement arrayEl = default;

        if (doc.RootElement.ValueKind == JsonValueKind.Array)
        {
            arrayEl = doc.RootElement;
        }
        else if (doc.RootElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var propName in new[] { "SelectedOptionIds", "selectedOptionIds", "OptionIds", "optionIds", "SelectedIndices", "selectedIndices", "values", "Values" })
            {
                if (doc.RootElement.TryGetProperty(propName, out var p) && p.ValueKind == JsonValueKind.Array)
                {
                    arrayEl = p;
                    break;
                }
            }
        }

        if (arrayEl.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in arrayEl.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Number)
                {
                    var idx = item.GetInt32();
                    var opt = options.FirstOrDefault(o => o.OptionIndex == idx);
                    if (opt != null) result.Add(opt);
                }
                else if (item.ValueKind == JsonValueKind.String)
                {
                    var str = item.GetString()?.Trim();
                    if (Guid.TryParse(str, out var g))
                    {
                        var opt = options.FirstOrDefault(o => o.Id == g);
                        if (opt != null) result.Add(opt);
                    }
                    else if (int.TryParse(str, out var idx))
                    {
                        var opt = options.FirstOrDefault(o => o.OptionIndex == idx);
                        if (opt != null) result.Add(opt);
                    }
                }
            }
        }

        return result;
    }

    private static bool IsOptionSelected(QuestionOption option, string? responseJson, QuestionType type)
    {
        if (string.IsNullOrWhiteSpace(responseJson))
            return false;

        try
        {
            if (type == QuestionType.MultipleResponse)
            {
                var chosen = FindSelectedOptions(new[] { option }, responseJson);
                return chosen.Any(o => o.Id == option.Id);
            }
            else
            {
                var chosen = FindSelectedOption(new[] { option }, responseJson);
                return chosen?.Id == option.Id;
            }
        }
        catch
        {
            return false;
        }
    }

    private static void VerifyLearnerOwnership(ExamAttempt attempt, string learnerId)
    {
        // Strict learner isolation: no role-based bypass. Staff review occurs through admin tooling.
        if (!string.Equals(attempt.LearnerId, learnerId, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Access denied: You do not own this examination attempt.");
        }
    }
}
