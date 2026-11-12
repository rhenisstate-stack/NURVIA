using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Exams;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Exams;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Services;

public class ExamService : IExamService
{
    private readonly INurviaDbContext _context;
    private readonly IAuditService _audit;

    public ExamService(INurviaDbContext context, IAuditService audit)
    {
        _context = context;
        _audit = audit;
    }

    public async Task<PagedResult<ExamDto>> GetExamsAsync(ExamFilterRequest filter, CancellationToken ct = default)
    {
        var query = _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(e =>
                e.Code.ToLower().Contains(term) ||
                e.Title.ToLower().Contains(term) ||
                e.Description.ToLower().Contains(term));
        }

        if (filter.Pathway.HasValue)
            query = query.Where(e => e.Pathway == filter.Pathway.Value);

        if (filter.Category.HasValue)
            query = query.Where(e => e.Category == filter.Category.Value);

        if (filter.Status.HasValue)
            query = query.Where(e => e.Status == filter.Status.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(e => e.UpdatedAtUtc ?? e.CreatedAtUtc)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(e => MapToDto(e, false))
            .ToListAsync(ct);

        return new PagedResult<ExamDto>(items, total, filter.PageNumber, filter.PageSize);
    }

    public async Task<ExamDto?> GetExamByIdAsync(Guid id, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.Versions)
                .ThenInclude(v => v.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
                        .ThenInclude(q => q!.CurrentVersion)
                            .ThenInclude(cv => cv!.Options)
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.Blueprint)
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
                        .ThenInclude(q => q!.CurrentVersion)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        return exam != null ? MapToDto(exam, true) : null;
    }

    public async Task<ExamDto> CreateExamAsync(CreateExamRequest request, string author, CancellationToken ct = default)
    {
        var code = !string.IsNullOrWhiteSpace(request.Code)
            ? request.Code.Trim()
            : $"EXAM-{request.Pathway}-{request.Category.ToString().Substring(0, 3).ToUpper()}-{DateTime.UtcNow.Ticks % 10000:D4}";

        var exam = new Exam(code, request.Title, request.Description, request.Pathway, request.Category, author)
        {
            ModeAllowed = request.ModeAllowed,
            TimeLimitMinutes = request.TimeLimitMinutes,
            PassingScorePercentage = request.PassingScorePercentage,
            Status = ExamStatus.Draft
        };

        var version = new ExamVersion(exam.Id, 1, request.Title, request.Description, author)
        {
            Instructions = request.Instructions,
            TimeLimitMinutes = request.TimeLimitMinutes,
            PassingScorePercentage = request.PassingScorePercentage,
            ReviewReleasePolicy = request.ReviewReleasePolicy,
            AllowedLayouts = request.AllowedLayouts,
            DefaultLayout = request.DefaultLayout,
            Status = ExamStatus.Draft,
            Blueprint = new ExamBlueprint(Guid.NewGuid(), request.TargetQuestionCount)
        };

        if (request.InitialQuestionIds != null && request.InitialQuestionIds.Count > 0)
        {
            var questions = await _context.Questions
                .Where(q => request.InitialQuestionIds.Contains(q.Id))
                .ToListAsync(ct);

            int order = 1;
            foreach (var q in questions)
            {
                if (q.CurrentVersionId.HasValue)
                {
                    version.ExamQuestions.Add(new ExamQuestion(version.Id, q.Id, q.CurrentVersionId.Value, order++));
                }
            }
            exam.TotalQuestions = version.ExamQuestions.Count;
        }

        exam.Versions.Add(version);
        _context.Exams.Add(exam);
        await _context.SaveChangesAsync(ct);

        exam.CurrentVersion = version;
        exam.CurrentVersionId = version.Id;
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Exam", exam.Id.ToString(), "CreateExam", author, author, "ContentAuthor", $"Created exam blueprint '{exam.Title}' ({exam.Code})", ct);

        return MapToDto(exam, true);
    }

    public async Task<ExamDto> ConfigureExamAsync(Guid id, ConfigureExamRequest request, string author, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.Blueprint)
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        if (exam.Status == ExamStatus.Published)
            throw new DomainException("Cannot modify a published exam directly. Create a new version first.");

        if (exam.ConcurrencyToken != request.ConcurrencyToken)
            throw new DomainException("Concurrency Conflict: This exam was modified by another user. Please reload the latest blueprint.");

        exam.Title = request.Title;
        exam.Description = request.Description;
        exam.Pathway = request.Pathway;
        exam.Category = request.Category;
        exam.ModeAllowed = request.ModeAllowed;
        exam.TimeLimitMinutes = request.TimeLimitMinutes;
        exam.PassingScorePercentage = request.PassingScorePercentage;
        exam.UpdatedAtUtc = DateTime.UtcNow;
        exam.UpdatedBy = author;
        exam.ConcurrencyToken = Guid.NewGuid();

        if (exam.CurrentVersion != null)
        {
            exam.CurrentVersion.Title = request.Title;
            exam.CurrentVersion.Description = request.Description;
            exam.CurrentVersion.Instructions = request.Instructions;
            exam.CurrentVersion.TimeLimitMinutes = request.TimeLimitMinutes;
            exam.CurrentVersion.PassingScorePercentage = request.PassingScorePercentage;
            exam.CurrentVersion.ReviewReleasePolicy = request.ReviewReleasePolicy;
            exam.CurrentVersion.AllowedLayouts = request.AllowedLayouts;
            exam.CurrentVersion.DefaultLayout = request.DefaultLayout;
            exam.CurrentVersion.UpdatedAtUtc = DateTime.UtcNow;
            exam.CurrentVersion.UpdatedBy = author;

            if (exam.CurrentVersion.Blueprint != null)
            {
                exam.CurrentVersion.Blueprint.TargetQuestionCount = request.TargetQuestionCount;
            }

            // Re-assign questions
            _context.ExamQuestions.RemoveRange(exam.CurrentVersion.ExamQuestions);
            exam.CurrentVersion.ExamQuestions.Clear();

            var questions = await _context.Questions
                .Where(q => request.AssignedQuestionIds.Contains(q.Id))
                .ToListAsync(ct);

            int order = 1;
            foreach (var q in questions)
            {
                if (q.CurrentVersionId.HasValue)
                {
                    exam.CurrentVersion.ExamQuestions.Add(new ExamQuestion(exam.CurrentVersion.Id, q.Id, q.CurrentVersionId.Value, order++));
                }
            }
            exam.TotalQuestions = exam.CurrentVersion.ExamQuestions.Count;
            exam.Status = ExamStatus.Configured;
            exam.CurrentVersion.Status = ExamStatus.Configured;
        }

        await _context.SaveChangesAsync(ct);
        await _audit.LogAsync("Exam", exam.Id.ToString(), "ConfigureExam", author, author, "ContentAuthor", $"Configured exam blueprint '{exam.Title}' with {exam.TotalQuestions} questions", ct);

        return MapToDto(exam, true);
    }

    public async Task<List<string>> ValidateExamAsync(Guid id, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null || exam.CurrentVersion == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        exam.CurrentVersion.Validate(out var errors);

        // Check question publication status
        foreach (var eq in exam.CurrentVersion.ExamQuestions)
        {
            if (eq.Question != null && eq.Question.Status != ContentStatus.Published)
            {
                errors.Add($"Question '{eq.Question.Code}' is in status '{eq.Question.Status}'. All exam questions must be Approved & Published.");
            }
        }

        return errors;
    }

    public async Task<ExamDto> SubmitForReviewAsync(Guid id, string actor, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        exam.SubmitForReview(actor);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Exam", exam.Id.ToString(), "SubmitForReview", actor, actor, "ContentAuthor", $"Submitted exam '{exam.Title}' for review", ct);

        return MapToDto(exam, true);
    }

    public async Task<ExamDto> ApproveExamAsync(Guid id, string reviewerName, string comments, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        exam.Approve(reviewerName, comments);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Exam", exam.Id.ToString(), "Approve", reviewerName, reviewerName, "Admin", $"Approved exam blueprint '{exam.Title}'", ct);

        return MapToDto(exam, true);
    }

    public async Task<ExamDto> PublishExamAsync(Guid id, string publisher, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        exam.Publish(publisher);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Exam", exam.Id.ToString(), "Publish", publisher, publisher, "Superadmin", $"Published exam '{exam.Title}' to live student catalog", ct);

        return MapToDto(exam, true);
    }

    public async Task<ExamDto> ArchiveExamAsync(Guid id, string actor, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.CurrentVersion)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        exam.Archive(actor);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Exam", exam.Id.ToString(), "Archive", actor, actor, "Admin", $"Archived exam '{exam.Title}'", ct);

        return MapToDto(exam, true);
    }

    /// <summary>
    /// Releases review availability for every version of the exam, unlocking answer keys and
    /// rationales for submitted attempts governed by <see cref="ReviewReleasePolicy.ManualRelease"/>.
    /// </summary>
    public async Task<ExamDto> ReleaseReviewAsync(Guid id, string actor, CancellationToken ct = default)
    {
        var exam = await _context.Exams
            .Include(e => e.Versions)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        var releasedAt = DateTime.UtcNow;
        foreach (var version in exam.Versions)
        {
            version.ReviewReleasedAtUtc = version.ReviewReleasedAtUtc ?? releasedAt;
            version.UpdatedAtUtc = releasedAt;
            version.UpdatedBy = actor;
        }

        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Exam", exam.Id.ToString(), "ReleaseReview", actor, actor, "Admin", $"Released review results for exam '{exam.Title}'", ct);

        return MapToDto(exam, true);
    }

    public async Task<ExamDto> CreateNewVersionAsync(Guid id, string author, CancellationToken ct = default)    {
        var exam = await _context.Exams
            .Include(e => e.Versions)
                .ThenInclude(v => v.ExamQuestions)
            .Include(e => e.CurrentVersion)
                .ThenInclude(v => v!.ExamQuestions)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (exam == null)
            throw new DomainException($"Exam with ID '{id}' was not found.");

        var newVersion = exam.CreateNewVersion(author);
        _context.ExamVersions.Add(newVersion);

        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Exam", exam.Id.ToString(), "CreateNewVersion", author, author, "ContentAuthor", $"Created new draft version #{newVersion.VersionNumber} for exam '{exam.Title}'", ct);

        return MapToDto(exam, true);
    }

    private static ExamDto MapToDto(Exam e, bool includeQuestions)
    {
        return new ExamDto
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
            Status = e.Status,
            CurrentVersionId = e.CurrentVersionId,
            TotalQuestions = e.TotalQuestions,
            ConcurrencyToken = e.ConcurrencyToken,
            CreatedAtUtc = e.CreatedAtUtc,
            CreatedBy = e.CreatedBy,
            UpdatedAtUtc = e.UpdatedAtUtc,
            UpdatedBy = e.UpdatedBy,
            TotalVersions = e.Versions?.Count ?? 1,
            CurrentVersion = e.CurrentVersion != null ? new ExamVersionDto
            {
                Id = e.CurrentVersion.Id,
                ExamId = e.CurrentVersion.ExamId,
                VersionNumber = e.CurrentVersion.VersionNumber,
                Title = e.CurrentVersion.Title,
                Description = e.CurrentVersion.Description,
                Instructions = e.CurrentVersion.Instructions,
                TimeLimitMinutes = e.CurrentVersion.TimeLimitMinutes,
                PassingScorePercentage = e.CurrentVersion.PassingScorePercentage,
                Status = e.CurrentVersion.Status,
                ValidationErrors = e.CurrentVersion.ValidationErrors,
                ReviewReleasePolicy = e.CurrentVersion.ReviewReleasePolicy,
                ReviewReleasedAtUtc = e.CurrentVersion.ReviewReleasedAtUtc,
                AllowedLayouts = e.CurrentVersion.AllowedLayouts,
                DefaultLayout = e.CurrentVersion.DefaultLayout,
                CreatedAtUtc = e.CurrentVersion.CreatedAtUtc,
                CreatedBy = e.CurrentVersion.CreatedBy,
                Blueprint = e.CurrentVersion.Blueprint != null ? new ExamBlueprintDto
                {
                    Id = e.CurrentVersion.Blueprint.Id,
                    ExamVersionId = e.CurrentVersion.Blueprint.ExamVersionId,
                    TargetQuestionCount = e.CurrentVersion.Blueprint.TargetQuestionCount,
                    SubjectDistributionJson = e.CurrentVersion.Blueprint.SubjectDistributionJson,
                    CognitiveDistributionJson = e.CurrentVersion.Blueprint.CognitiveDistributionJson,
                    DifficultyDistributionJson = e.CurrentVersion.Blueprint.DifficultyDistributionJson
                } : null,
                ExamQuestions = includeQuestions && e.CurrentVersion.ExamQuestions != null ? e.CurrentVersion.ExamQuestions.Select(eq => new ExamQuestionDto
                {
                    Id = eq.Id,
                    ExamVersionId = eq.ExamVersionId,
                    QuestionId = eq.QuestionId,
                    QuestionVersionId = eq.QuestionVersionId,
                    OrderIndex = eq.OrderIndex,
                    Points = eq.Points
                }).ToList() : new List<ExamQuestionDto>()
            } : null
        };
    }
}
