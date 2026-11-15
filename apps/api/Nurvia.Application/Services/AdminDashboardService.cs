using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Enums;

namespace Nurvia.Application.Services;

public sealed record AdminPipelineStageDto(string Stage, int Count);

public sealed record AdminRecentQuestionDto(
    Guid Id,
    string StemPreview,
    string Category,
    string QuestionType,
    string Status,
    DateTime CreatedAtUtc);

public sealed record AdminOverviewDto(
    int TotalQuestions,
    int PublishedQuestions,
    int TotalExams,
    int PublishedExams,
    int TotalLearners,
    int ActiveLearners,
    int ClinicalCaseStudies,
    IReadOnlyList<AdminPipelineStageDto> Pipeline,
    IReadOnlyList<AdminRecentQuestionDto> RecentQuestions);

public sealed record AdminLearnerSummaryDto(
    Guid Id,
    string Name,
    string Email,
    string Pathway,
    bool IsActive,
    int CompletedExams,
    double? AverageScorePercentage,
    DateTime CreatedAtUtc);

public sealed record AdminQuestionTypeInfoDto(
    int CodeValue,
    string Code,
    string Name,
    string GradingMode,
    string Description,
    int QuestionCount);

public sealed record AdminTrackAnalyticsDto(
    string Pathway,
    int AttemptCount,
    int CompletedCount,
    double? MeanScorePercentage);

public sealed record AdminAnalyticsDto(
    int TotalAttempts,
    int CompletedAttempts,
    int InProgressAttempts,
    double? MeanScorePercentage,
    double? PassRatePercentage,
    IReadOnlyList<AdminTrackAnalyticsDto> TrackBreakdown);

public sealed record AdminTaxonomyCategoryDto(
    string Category,
    int QuestionCount,
    IReadOnlyList<string> Subjects);

public sealed record AdminTaxonomyDto(
    int TotalQuestions,
    IReadOnlyList<AdminTaxonomyCategoryDto> ClientNeedsCategories,
    IReadOnlyList<string> Pathways,
    IReadOnlyList<string> Subjects,
    IReadOnlyList<string> Topics);

public interface IAdminDashboardService
{
    Task<AdminOverviewDto> GetOverviewAsync(CancellationToken ct = default);
    Task<PagedResult<AdminLearnerSummaryDto>> GetLearnersAsync(string? search, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<IReadOnlyList<AdminQuestionTypeInfoDto>> GetQuestionTypesAsync(CancellationToken ct = default);
    Task<AdminAnalyticsDto> GetAnalyticsAsync(CancellationToken ct = default);
    Task<AdminTaxonomyDto> GetTaxonomyAsync(CancellationToken ct = default);
}

public sealed class AdminDashboardService : IAdminDashboardService
{
    private readonly INurviaDbContext _db;

    public AdminDashboardService(INurviaDbContext db)
    {
        _db = db;
    }

    public async Task<AdminOverviewDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var questionStatusCounts = await _db.Questions
            .AsNoTracking()
            .GroupBy(q => q.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        int CountFor(ContentStatus s) => questionStatusCounts.FirstOrDefault(x => x.Status == s)?.Count ?? 0;

        var totalQuestions = questionStatusCounts.Sum(x => x.Count);
        var publishedQuestions = CountFor(ContentStatus.Published);
        var totalExams = await _db.Exams.AsNoTracking().CountAsync(ct);
        var publishedExams = await _db.Exams.AsNoTracking().CountAsync(e => e.Status == ExamStatus.Published, ct);
        var totalLearners = await _db.UserAccounts.AsNoTracking().CountAsync(u => u.Role == "Learner", ct);
        var activeLearners = await _db.UserAccounts.AsNoTracking().CountAsync(u => u.Role == "Learner" && u.IsActive, ct);
        var clinicalCaseStudies = await _db.Questions
            .AsNoTracking()
            .CountAsync(q => q.CurrentVersion != null && q.CurrentVersion.QuestionType == QuestionType.ClinicalCaseStudy, ct);

        var pipeline = new List<AdminPipelineStageDto>
        {
            new("Drafts", CountFor(ContentStatus.Draft)),
            new("Validation Failed", CountFor(ContentStatus.ValidationFailed)),
            new("Pending Review", CountFor(ContentStatus.PendingReview)),
            new("Approved", CountFor(ContentStatus.Approved)),
            new("Published", publishedQuestions),
            new("Archived", CountFor(ContentStatus.Archived)),
        };

        var recentRaw = await _db.Questions
            .AsNoTracking()
            .Include(q => q.CurrentVersion)
            .OrderByDescending(q => q.CreatedAtUtc)
            .Take(6)
            .ToListAsync(ct);

        var recent = recentRaw.Select(q =>
        {
            var stem = q.CurrentVersion?.Stem ?? q.Code;
            var preview = stem.Length > 120 ? stem[..120] + "..." : stem;
            return new AdminRecentQuestionDto(
                q.Id,
                preview,
                q.CurrentVersion?.ClientNeedCategory.ToString() ?? q.Subject,
                q.CurrentVersion?.QuestionType.ToString() ?? "MultipleChoice",
                q.Status.ToString(),
                q.CreatedAtUtc);
        }).ToList();

        return new AdminOverviewDto(
            totalQuestions,
            publishedQuestions,
            totalExams,
            publishedExams,
            totalLearners,
            activeLearners,
            clinicalCaseStudies,
            pipeline,
            recent);
    }

    public async Task<PagedResult<AdminLearnerSummaryDto>> GetLearnersAsync(
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.UserAccounts
            .AsNoTracking()
            .Where(u => u.Role == "Learner");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(u => u.Name.ToLower().Contains(term) || u.Email.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(ct);
        var users = await query
            .OrderByDescending(u => u.CreatedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var userGuids = users.Select(u => u.Id).ToList();
        var userIds = users.Select(u => u.Id.ToString()).ToList();

        var profiles = await _db.UserProfiles
            .AsNoTracking()
            .Where(p => userGuids.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId, ct);

        var attemptStats = await _db.ExamAttempts
            .AsNoTracking()
            .Where(a => userIds.Contains(a.LearnerId) && (a.Status == ExamAttemptStatus.Submitted || a.Status == ExamAttemptStatus.Graded))
            .GroupBy(a => a.LearnerId)
            .Select(g => new
            {
                LearnerId = g.Key,
                CompletedCount = g.Count(),
                AvgScore = g.Average(x => (double?)x.ScorePercentage)
            })
            .ToDictionaryAsync(x => x.LearnerId, ct);

        var items = users.Select(u =>
        {
            profiles.TryGetValue(u.Id, out var profile);
            attemptStats.TryGetValue(u.Id.ToString(), out var stats);
            return new AdminLearnerSummaryDto(
                u.Id,
                u.Name,
                u.Email,
                profile?.Pathway?.ToString() ?? "Undeclared",
                u.IsActive,
                stats?.CompletedCount ?? 0,
                stats?.AvgScore is double avg ? Math.Round(avg, 1) : null,
                u.CreatedAtUtc);
        }).ToList();

        return new PagedResult<AdminLearnerSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<IReadOnlyList<AdminQuestionTypeInfoDto>> GetQuestionTypesAsync(CancellationToken ct = default)
    {
        var rawCounts = await _db.Questions
            .AsNoTracking()
            .Where(q => q.CurrentVersion != null)
            .GroupBy(q => q.CurrentVersion!.QuestionType)
            .Select(g => new { QuestionType = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var counts = rawCounts
            .GroupBy(x => (int)x.QuestionType)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Count));

        var specs = new (int CodeValue, string Code, string Name, string GradingMode, string Description)[]
        {
            (1, "MultipleChoice", "1. Multiple Choice (Single Response)", "AutoGraded (0/1 Binary)", "Traditional single-best-answer clinical scenario."),
            (2, "MultipleResponse", "2. Select All That Apply (SATA)", "AutoGraded (+/- Polytomous)", "Multiple-response item awarding partial credit with negative penalty floored at zero."),
            (3, "TrueFalse", "3. True / False", "AutoGraded (0/1 Binary)", "Binary clinical statement verification."),
            (4, "FillInTheBlank", "4. Cloze / Fill in the Blank", "AutoGraded (Exact / Numeric)", "Drop-down or text-entry completion inside clinical statements."),
            (5, "NumericResponse", "5. Numeric Calculation", "AutoGraded (Tolerance)", "Dosage, infusion rate, and intake/output calculation with tolerance."),
            (6, "OrderedResponse", "6. Ordered Response", "AutoGraded (Sequence)", "Drag-and-drop or numbered prioritization of nursing steps."),
            (7, "Matching", "7. Matching", "AutoGraded (Pairwise)", "Premise-to-response clinical pairing."),
            (8, "MatrixGrid", "8. Matrix / Grid", "AutoGraded (Row-wise)", "Multi-row classification across clinical columns (Indicated / Contraindicated)."),
            (9, "ClinicalCaseStudy", "9. Unfolding Clinical Case Study", "PendingManualReview", "Multi-part clinical vignette routed for educator/manual review."),
            (10, "BowTie", "10. Dynamic Lab / Bow-Tie", "AutoGraded (Triad)", "Central condition flanked by actions to take and parameters to monitor."),
            (11, "MultipleTrueFalse", "11. Multiple True / False", "AutoGraded (Row-wise)", "Series of independent true/false clinical assertions."),
            (12, "ImageBased", "12. Image-Based / Hotspot", "AutoGraded (Region / Option)", "Visual clinical exhibit or anatomical identification."),
            (13, "MultipleImageSelection", "13. Multiple-Image Selection", "AutoGraded (Multi-select)", "Select all applicable diagnostic or clinical images."),
            (14, "DragAndDrop", "14. Drag and Drop Classification", "AutoGraded (Bucket)", "Classify findings or interventions into target clinical buckets."),
            (15, "ExtendedResponse", "15. Extended Response / Essay", "PendingManualReview", "Free-text clinical rationale routed for manual review."),
            (16, "TabularResponse", "16. Tabular Response", "AutoGraded (Cell-wise)", "Structured data table with trended clinical cues."),
            (17, "ShortAnswer", "17. Short Answer", "AutoGraded (Keyed Text)", "Concise medical terminology or short calculation response."),
            (18, "SingleChoice", "18. Canonical Single Choice", "AutoGraded (0/1 Binary)", "Explicit canonical single-choice item format."),
        };

        return specs.Select(s => new AdminQuestionTypeInfoDto(
            s.CodeValue,
            s.Code,
            s.Name,
            s.GradingMode,
            s.Description,
            counts.GetValueOrDefault(s.CodeValue, 0))).ToList();
    }

    public async Task<AdminAnalyticsDto> GetAnalyticsAsync(CancellationToken ct = default)
    {
        var attempts = await _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Exam)
            .ToListAsync(ct);

        var totalAttempts = attempts.Count;
        var completed = attempts
            .Where(a => a.Status is ExamAttemptStatus.Submitted or ExamAttemptStatus.Graded)
            .ToList();
        var inProgress = attempts.Count(a => a.Status == ExamAttemptStatus.InProgress);

        var scored = completed.Where(a => a.ScorePercentage.HasValue).ToList();
        double? meanScore = scored.Count > 0
            ? Math.Round(scored.Average(a => (double)a.ScorePercentage!.Value), 1)
            : null;

        var gradedWithPass = completed.Where(a => a.Passed.HasValue).ToList();
        double? passRate = gradedWithPass.Count > 0
            ? Math.Round(gradedWithPass.Count(a => a.Passed == true) * 100.0 / gradedWithPass.Count, 1)
            : null;

        var trackBreakdown = attempts
            .GroupBy(a => a.Exam?.Pathway.ToString() ?? "Unknown")
            .Select(g =>
            {
                var trackCompleted = g.Where(a => a.Status is ExamAttemptStatus.Submitted or ExamAttemptStatus.Graded).ToList();
                var trackScored = trackCompleted.Where(a => a.ScorePercentage.HasValue).ToList();
                return new AdminTrackAnalyticsDto(
                    g.Key,
                    g.Count(),
                    trackCompleted.Count,
                    trackScored.Count > 0 ? Math.Round(trackScored.Average(a => (double)a.ScorePercentage!.Value), 1) : null);
            })
            .OrderBy(t => t.Pathway)
            .ToList();

        return new AdminAnalyticsDto(
            totalAttempts,
            completed.Count,
            inProgress,
            meanScore,
            passRate,
            trackBreakdown);
    }

    public async Task<AdminTaxonomyDto> GetTaxonomyAsync(CancellationToken ct = default)
    {
        var questions = await _db.Questions
            .AsNoTracking()
            .Include(q => q.CurrentVersion)
            .Select(q => new
            {
                Category = q.CurrentVersion != null ? q.CurrentVersion.ClientNeedCategory : ClientNeedCategory.PhysiologicalIntegrity,
                q.Subject,
                q.Topic
            })
            .ToListAsync(ct);

        var categories = Enum.GetValues<ClientNeedCategory>()
            .Select(cat =>
            {
                var matching = questions.Where(q => q.Category == cat).ToList();
                var subjects = matching
                    .Select(q => q.Subject)
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(s => s)
                    .ToList();

                return new AdminTaxonomyCategoryDto(cat.ToString(), matching.Count, subjects);
            })
            .ToList();

        var allSubjects = questions
            .Select(q => q.Subject)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(s => s)
            .ToList();

        var allTopics = questions
            .Select(q => q.Topic)
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(t => t)
            .ToList();

        var pathways = Enum.GetNames<NursingPathway>().ToList();

        return new AdminTaxonomyDto(questions.Count, categories, pathways, allSubjects, allTopics);
    }
}
