using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.StudyLibrary;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;

namespace Nurvia.Application.Services;

public class StudyLibraryService : IStudyLibraryService
{
    private readonly INurviaDbContext _context;

    public StudyLibraryService(INurviaDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<StudySetCardDto>> GetCatalogAsync(
        StudyLibraryFilterRequest filter,
        string? learnerId,
        CancellationToken ct = default)
    {
        var pageNumber = Math.Max(1, filter.PageNumber);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var query = _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .AsNoTracking()
            .Where(e => e.Status == ExamStatus.Published && e.CurrentVersion != null);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            var isNumericYear = int.TryParse(term, out var parsedYear);

            query = query.Where(e =>
                e.Code.ToLower().Contains(term) ||
                e.Title.ToLower().Contains(term) ||
                e.Description.ToLower().Contains(term) ||
                (e.School != null && e.School.ToLower().Contains(term)) ||
                (e.Subject != null && e.Subject.ToLower().Contains(term)) ||
                (e.Topic != null && e.Topic.ToLower().Contains(term)) ||
                (e.Season != null && e.Season.ToLower().Contains(term)) ||
                (isNumericYear && e.AcademicYear == parsedYear) ||
                e.CurrentVersion!.ExamQuestions.Any(eq =>
                    eq.Question != null && (
                        eq.Question.Subject.ToLower().Contains(term) ||
                        eq.Question.Topic.ToLower().Contains(term))));
        }

        if (filter.Pathway.HasValue)
            query = query.Where(e => e.Pathway == filter.Pathway.Value);

        if (filter.Category.HasValue)
            query = query.Where(e => e.Category == filter.Category.Value);

        if (!string.IsNullOrWhiteSpace(filter.School))
        {
            var school = filter.School.Trim().ToLower();
            query = query.Where(e => e.School != null && e.School.ToLower() == school);
        }

        if (filter.AcademicYear.HasValue)
            query = query.Where(e => e.AcademicYear == filter.AcademicYear.Value);

        if (!string.IsNullOrWhiteSpace(filter.Season))
        {
            var season = filter.Season.Trim().ToLower();
            query = query.Where(e => e.Season != null && e.Season.ToLower() == season);
        }

        if (!string.IsNullOrWhiteSpace(filter.Subject))
        {
            var subject = filter.Subject.Trim().ToLower();
            query = query.Where(e =>
                (e.Subject != null && e.Subject.ToLower() == subject) ||
                e.CurrentVersion!.ExamQuestions.Any(eq =>
                    eq.Question != null && eq.Question.Subject.ToLower() == subject));
        }

        if (!string.IsNullOrWhiteSpace(filter.Topic))
        {
            var topic = filter.Topic.Trim().ToLower();
            query = query.Where(e =>
                (e.Topic != null && e.Topic.ToLower() == topic) ||
                e.CurrentVersion!.ExamQuestions.Any(eq =>
                    eq.Question != null && eq.Question.Topic.ToLower() == topic));
        }

        if (filter.Difficulty.HasValue)
        {
            var diff = filter.Difficulty.Value;
            query = query.Where(e =>
                e.Difficulty == diff ||
                e.CurrentVersion!.ExamQuestions.Any(eq =>
                    eq.Question != null && eq.Question.Difficulty == diff));
        }

        if (filter.QuestionType.HasValue)
        {
            var qType = filter.QuestionType.Value;
            query = query.Where(e =>
                e.CurrentVersion!.ExamQuestions.Any(eq =>
                    eq.QuestionVersion != null && eq.QuestionVersion.QuestionType == qType));
        }

        if (filter.ExamId.HasValue)
            query = query.Where(e => e.Id == filter.ExamId.Value);

        if (filter.SavedOnly)
        {
            if (string.IsNullOrWhiteSpace(learnerId))
            {
                return new PagedResult<StudySetCardDto>(new List<StudySetCardDto>(), 0, pageNumber, pageSize);
            }

            query = query.Where(e => _context.SavedStudySets.Any(s => s.UserId == learnerId && s.ExamId == e.Id));
        }

        var totalCount = await query.CountAsync(ct);

        var pageExams = await query
            .OrderByDescending(e => e.UpdatedAtUtc ?? e.CreatedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var cards = await BuildStudySetCardsAsync(pageExams, learnerId, ct);
        return new PagedResult<StudySetCardDto>(cards, totalCount, pageNumber, pageSize);
    }

    public async Task<StudyLibraryFiltersDto> GetFiltersAsync(CancellationToken ct = default)
    {
        var publishedExams = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.QuestionVersion)
            .AsNoTracking()
            .Where(e => e.Status == ExamStatus.Published && e.CurrentVersion != null)
            .ToListAsync(ct);

        var subjects = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var topics = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var difficulties = new HashSet<DifficultyLevel>();
        var questionTypes = new HashSet<QuestionType>();

        foreach (var exam in publishedExams)
        {
            if (!string.IsNullOrWhiteSpace(exam.Subject)) subjects.Add(exam.Subject);
            if (!string.IsNullOrWhiteSpace(exam.Topic)) topics.Add(exam.Topic);
            if (exam.Difficulty.HasValue) difficulties.Add(exam.Difficulty.Value);

            if (exam.CurrentVersion?.ExamQuestions != null)
            {
                foreach (var eq in exam.CurrentVersion.ExamQuestions)
                {
                    if (eq.Question != null)
                    {
                        if (!string.IsNullOrWhiteSpace(eq.Question.Subject)) subjects.Add(eq.Question.Subject);
                        if (!string.IsNullOrWhiteSpace(eq.Question.Topic)) topics.Add(eq.Question.Topic);
                        difficulties.Add(eq.Question.Difficulty);
                    }
                    if (eq.QuestionVersion != null)
                    {
                        questionTypes.Add(eq.QuestionVersion.QuestionType);
                    }
                }
            }
        }

        return new StudyLibraryFiltersDto
        {
            Pathways = publishedExams.Select(e => e.Pathway).Distinct().OrderBy(p => p).ToList(),
            Categories = publishedExams.Select(e => e.Category).Distinct().OrderBy(c => c).ToList(),
            Schools = publishedExams.Where(e => !string.IsNullOrWhiteSpace(e.School)).Select(e => e.School!).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(s => s).ToList(),
            AcademicYears = publishedExams.Where(e => e.AcademicYear.HasValue).Select(e => e.AcademicYear!.Value).Distinct().OrderByDescending(y => y).ToList(),
            Seasons = publishedExams.Where(e => !string.IsNullOrWhiteSpace(e.Season)).Select(e => e.Season!).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(s => s).ToList(),
            Subjects = subjects.OrderBy(s => s).ToList(),
            Topics = topics.OrderBy(t => t).ToList(),
            Difficulties = difficulties.OrderBy(d => d).ToList(),
            QuestionTypes = questionTypes.OrderBy(qt => qt).ToList(),
            Exams = publishedExams.OrderBy(e => e.Title).Select(e => new StudyLibraryExamOptionDto
            {
                Id = e.Id,
                Code = e.Code,
                Title = e.Title
            }).ToList()
        };
    }

    public async Task<StudyLibrarySummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var publishedExams = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .AsNoTracking()
            .Where(e => e.Status == ExamStatus.Published && e.CurrentVersion != null)
            .ToListAsync(ct);

        var totalQuestions = publishedExams.Sum(e =>
            e.CurrentVersion!.ExamQuestions.Count > 0
                ? e.CurrentVersion.ExamQuestions.Count
                : e.TotalQuestions);

        return new StudyLibrarySummaryDto
        {
            TotalPublishedStudySets = publishedExams.Count,
            TotalAvailableQuestions = totalQuestions,
            TotalCategories = publishedExams.Select(e => e.Category).Distinct().Count(),
            TotalPathways = publishedExams.Select(e => e.Pathway).Distinct().Count()
        };
    }

    public async Task<StudySetDetailDto?> GetStudySetDetailAsync(Guid examId, string? learnerId, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.QuestionVersion)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == examId && e.Status == ExamStatus.Published && e.CurrentVersion != null, ct);

        if (exam == null)
            return null;

        var cards = await BuildStudySetCardsAsync(new List<Exam> { exam }, learnerId, ct);
        var card = cards.Single();

        var approvedReviews = await _context.ExamReviews
            .AsNoTracking()
            .Where(r => r.ExamId == examId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(10)
            .Select(r => new ExamReviewDto
            {
                Id = r.Id,
                ExamId = r.ExamId,
                LearnerName = r.LearnerName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAtUtc = r.CreatedAtUtc
            })
            .ToListAsync(ct);

        bool canReview = false;
        ExamReviewDto? learnerReview = null;
        if (!string.IsNullOrWhiteSpace(learnerId))
        {
            canReview = await _context.ExamAttempts.AnyAsync(a =>
                a.ExamId == examId &&
                a.LearnerId == learnerId &&
                (a.Status == ExamAttemptStatus.Submitted || a.Status == ExamAttemptStatus.Graded), ct);

            learnerReview = await _context.ExamReviews
                .AsNoTracking()
                .Where(r => r.ExamId == examId && r.LearnerId == learnerId)
                .Select(r => new ExamReviewDto
                {
                    Id = r.Id,
                    ExamId = r.ExamId,
                    LearnerName = r.LearnerName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAtUtc = r.CreatedAtUtc
                })
                .FirstOrDefaultAsync(ct);
        }

        var eqs = exam.CurrentVersion!.ExamQuestions;
        var subjectsCovered = eqs
            .Where(eq => eq.Question != null && !string.IsNullOrWhiteSpace(eq.Question.Subject))
            .Select(eq => eq.Question!.Subject)
            .Concat(string.IsNullOrWhiteSpace(exam.Subject) ? Array.Empty<string>() : new[] { exam.Subject })
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(s => s)
            .ToList();

        var topicsCovered = eqs
            .Where(eq => eq.Question != null && !string.IsNullOrWhiteSpace(eq.Question.Topic))
            .Select(eq => eq.Question!.Topic)
            .Concat(string.IsNullOrWhiteSpace(exam.Topic) ? Array.Empty<string>() : new[] { exam.Topic })
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(t => t)
            .ToList();

        var questionTypes = eqs
            .Where(eq => eq.QuestionVersion != null)
            .Select(eq => eq.QuestionVersion!.QuestionType)
            .Distinct()
            .OrderBy(qt => qt)
            .ToList();

        return new StudySetDetailDto
        {
            Id = card.Id,
            Code = card.Code,
            Title = card.Title,
            Description = card.Description,
            Pathway = card.Pathway,
            Category = card.Category,
            ModeAllowed = card.ModeAllowed,
            TimeLimitMinutes = card.TimeLimitMinutes,
            PassingScorePercentage = card.PassingScorePercentage,
            TotalQuestions = card.TotalQuestions,
            School = card.School,
            AcademicYear = card.AcademicYear,
            Season = card.Season,
            Subject = card.Subject,
            Topic = card.Topic,
            Difficulty = card.Difficulty,
            AllowedLayouts = card.AllowedLayouts,
            DefaultLayout = card.DefaultLayout,
            AverageRating = card.AverageRating,
            ReviewCount = card.ReviewCount,
            FeaturedTestimonial = card.FeaturedTestimonial,
            IsSaved = card.IsSaved,
            Instructions = exam.CurrentVersion.Instructions,
            LearningObjectives = exam.LearningObjectives ?? new List<string>(),
            SubjectsCovered = subjectsCovered,
            TopicsCovered = topicsCovered,
            QuestionTypesIncluded = questionTypes,
            Reviews = approvedReviews,
            CanReview = canReview,
            LearnerReview = learnerReview
        };
    }

    public async Task<List<StudySetCardDto>> GetSavedStudySetsAsync(string learnerId, CancellationToken ct = default)
    {
        var savedExamIds = await _context.SavedStudySets
            .AsNoTracking()
            .Where(s => s.UserId == learnerId)
            .OrderByDescending(s => s.SavedAtUtc)
            .Select(s => s.ExamId)
            .ToListAsync(ct);

        if (savedExamIds.Count == 0)
            return new List<StudySetCardDto>();

        var exams = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .AsNoTracking()
            .Where(e => savedExamIds.Contains(e.Id) && e.Status == ExamStatus.Published && e.CurrentVersion != null)
            .ToListAsync(ct);

        var cards = await BuildStudySetCardsAsync(exams, learnerId, ct);
        var orderMap = savedExamIds.Select((id, idx) => (id, idx)).ToDictionary(x => x.id, x => x.idx);
        return cards.OrderBy(c => orderMap.GetValueOrDefault(c.Id, int.MaxValue)).ToList();
    }

    public async Task SaveStudySetAsync(Guid examId, string learnerId, CancellationToken ct = default)
    {
        var exists = await _context.Exams.AnyAsync(e => e.Id == examId && e.Status == ExamStatus.Published, ct);
        if (!exists)
            throw new DomainException("Study set not found or not published.");

        var alreadySaved = await _context.SavedStudySets.AnyAsync(s => s.UserId == learnerId && s.ExamId == examId, ct);
        if (alreadySaved)
            return;

        _context.SavedStudySets.Add(new SavedStudySet(learnerId, examId));
        await _context.SaveChangesAsync(ct);
    }

    public async Task RemoveSavedStudySetAsync(Guid examId, string learnerId, CancellationToken ct = default)
    {
        var saved = await _context.SavedStudySets
            .FirstOrDefaultAsync(s => s.UserId == learnerId && s.ExamId == examId, ct);

        if (saved != null)
        {
            _context.SavedStudySets.Remove(saved);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<PagedResult<ExamReviewDto>> GetReviewsAsync(Guid examId, int pageNumber = 1, int pageSize = 10, CancellationToken ct = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _context.ExamReviews
            .AsNoTracking()
            .Where(r => r.ExamId == examId && r.IsApproved);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ExamReviewDto
            {
                Id = r.Id,
                ExamId = r.ExamId,
                LearnerName = r.LearnerName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAtUtc = r.CreatedAtUtc
            })
            .ToListAsync(ct);

        return new PagedResult<ExamReviewDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<ExamReviewDto> SubmitReviewAsync(
        Guid examId,
        string learnerId,
        string learnerName,
        SubmitExamReviewRequest request,
        CancellationToken ct = default)
    {
        if (request.Rating < 1 || request.Rating > 5)
            throw new DomainException("Rating must be between 1 and 5 stars.");

        var examExists = await _context.Exams.AnyAsync(e => e.Id == examId && e.Status == ExamStatus.Published, ct);
        if (!examExists)
            throw new DomainException("Study set not found or not published.");

        var hasCompletedAttempt = await _context.ExamAttempts.AnyAsync(a =>
            a.ExamId == examId &&
            a.LearnerId == learnerId &&
            (a.Status == ExamAttemptStatus.Submitted || a.Status == ExamAttemptStatus.Graded), ct);

        if (!hasCompletedAttempt)
            throw new UnauthorizedAccessException("You must complete at least one attempt of this study set before submitting a review.");

        var existing = await _context.ExamReviews
            .FirstOrDefaultAsync(r => r.ExamId == examId && r.LearnerId == learnerId, ct);

        if (existing != null)
        {
            existing.Update(request.Rating, request.Comment);
        }
        else
        {
            existing = new ExamReview(examId, learnerId, learnerName, request.Rating, request.Comment);
            _context.ExamReviews.Add(existing);
        }

        await _context.SaveChangesAsync(ct);

        return new ExamReviewDto
        {
            Id = existing.Id,
            ExamId = existing.ExamId,
            LearnerName = existing.LearnerName,
            Rating = existing.Rating,
            Comment = existing.Comment,
            CreatedAtUtc = existing.CreatedAtUtc
        };
    }

    private async Task<List<StudySetCardDto>> BuildStudySetCardsAsync(List<Exam> exams, string? learnerId, CancellationToken ct)
    {
        if (exams.Count == 0)
            return new List<StudySetCardDto>();

        var examIds = exams.Select(e => e.Id).ToList();

        var reviewStats = await _context.ExamReviews
            .AsNoTracking()
            .Where(r => examIds.Contains(r.ExamId) && r.IsApproved)
            .GroupBy(r => r.ExamId)
            .Select(g => new
            {
                ExamId = g.Key,
                AverageRating = g.Average(r => (double)r.Rating),
                ReviewCount = g.Count(),
                FeaturedTestimonial = g
                    .Where(r => r.Comment != null && r.Comment != "")
                    .OrderByDescending(r => r.Rating)
                    .ThenByDescending(r => r.CreatedAtUtc)
                    .Select(r => r.Comment)
                    .FirstOrDefault()
            })
            .ToDictionaryAsync(x => x.ExamId, ct);

        HashSet<Guid> savedSetIds = new();
        if (!string.IsNullOrWhiteSpace(learnerId))
        {
            var savedList = await _context.SavedStudySets
                .AsNoTracking()
                .Where(s => s.UserId == learnerId && examIds.Contains(s.ExamId))
                .Select(s => s.ExamId)
                .ToListAsync(ct);
            savedSetIds = savedList.ToHashSet();
        }

        return exams.Select(e =>
        {
            var hasStats = reviewStats.TryGetValue(e.Id, out var stats);
            var questionCount = e.CurrentVersion?.ExamQuestions.Count > 0
                ? e.CurrentVersion.ExamQuestions.Count
                : e.TotalQuestions;

            return new StudySetCardDto
            {
                Id = e.Id,
                Code = e.Code,
                Title = e.Title,
                Description = e.Description,
                Pathway = e.Pathway,
                Category = e.Category,
                ModeAllowed = e.ModeAllowed,
                TimeLimitMinutes = e.TimeLimitMinutes,
                PassingScorePercentage = e.PassingScorePercentage,
                TotalQuestions = questionCount,
                School = e.School,
                AcademicYear = e.AcademicYear,
                Season = e.Season,
                Subject = e.Subject,
                Topic = e.Topic,
                Difficulty = e.Difficulty,
                AllowedLayouts = e.CurrentVersion?.AllowedLayouts ?? ExamLayoutPolicy.Both,
                DefaultLayout = e.CurrentVersion?.DefaultLayout ?? ExamLayout.Sequential,
                AverageRating = hasStats ? Math.Round(stats!.AverageRating, 1) : null,
                ReviewCount = hasStats ? stats!.ReviewCount : 0,
                FeaturedTestimonial = hasStats ? stats!.FeaturedTestimonial : null,
                IsSaved = savedSetIds.Contains(e.Id)
            };
        }).ToList();
    }
}
