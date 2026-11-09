using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Questions;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Questions;

namespace Nurvia.Application.Services;

public class QuestionService : IQuestionService
{
    private readonly INurviaDbContext _context;
    private readonly IAuditService _audit;

    public QuestionService(INurviaDbContext context, IAuditService audit)
    {
        _context = context;
        _audit = audit;
    }

    public async Task<PagedResult<QuestionDto>> GetQuestionsAsync(QuestionFilterRequest filter, CancellationToken ct = default)
    {
        var query = _context.Questions
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Exhibits)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(q =>
                q.Code.ToLower().Contains(term) ||
                q.Subject.ToLower().Contains(term) ||
                q.Topic.ToLower().Contains(term) ||
                (q.CurrentVersion != null && q.CurrentVersion.Stem.ToLower().Contains(term)));
        }

        if (filter.Pathway.HasValue)
            query = query.Where(q => q.Pathway == filter.Pathway.Value);

        if (filter.Category.HasValue)
            query = query.Where(q => q.Category == filter.Category.Value);

        if (!string.IsNullOrWhiteSpace(filter.Subject))
            query = query.Where(q => q.Subject == filter.Subject);

        if (!string.IsNullOrWhiteSpace(filter.Topic))
            query = query.Where(q => q.Topic == filter.Topic);

        if (filter.Difficulty.HasValue)
            query = query.Where(q => q.Difficulty == filter.Difficulty.Value);

        if (filter.Status.HasValue)
            query = query.Where(q => q.Status == filter.Status.Value);

        if (filter.QuestionType.HasValue)
            query = query.Where(q => q.CurrentVersion != null && q.CurrentVersion.QuestionType == filter.QuestionType.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(q => q.UpdatedAtUtc ?? q.CreatedAtUtc)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(q => MapToDto(q, false))
            .ToListAsync(ct);

        return new PagedResult<QuestionDto>(items, total, filter.PageNumber, filter.PageSize);
    }

    public async Task<QuestionDto?> GetQuestionByIdAsync(Guid id, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.Versions)
                .ThenInclude(v => v.Options)
            .Include(q => q.Versions)
                .ThenInclude(v => v.Exhibits)
            .Include(q => q.Reviews)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Exhibits)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        return question != null ? MapToDto(question, true) : null;
    }

    public async Task<QuestionDto> CreateDraftAsync(CreateQuestionRequest request, string author, CancellationToken ct = default)
    {
        var code = !string.IsNullOrWhiteSpace(request.Code)
            ? request.Code.Trim()
            : $"Q-{request.Pathway}-{request.Category.ToString().Substring(0, 3).ToUpper()}-{DateTime.UtcNow.Ticks % 100000:D5}";

        var question = new Question(
            code,
            request.Pathway,
            request.Category,
            request.Subject,
            request.Topic,
            request.Difficulty,
            author
        )
        {
            Subtopic = request.Subtopic
        };

        var version = new QuestionVersion(question.Id, 1, request.Stem, request.QuestionType, author)
        {
            CognitiveSkill = request.CognitiveSkill,
            ClientNeedCategory = request.ClientNeedCategory,
            GeneralRationale = request.GeneralRationale,
            ContentJsonData = request.ContentJsonData
        };

        foreach (var opt in request.Options)
        {
            version.Options.Add(new QuestionOption(opt.OptionIndex, opt.OptionText, opt.IsCorrect, opt.SpecificRationale, opt.DisplayOrder));
        }

        foreach (var exh in request.Exhibits)
        {
            version.Exhibits.Add(new QuestionExhibit(exh.Type, exh.Title, exh.Content, exh.DisplayOrder));
        }

        question.Versions.Add(version);
        _context.Questions.Add(question);
        await _context.SaveChangesAsync(ct);

        question.CurrentVersion = version;
        question.CurrentVersionId = version.Id;
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Question", question.Id.ToString(), "CreateDraft", author, author, "ContentAuthor", $"Created draft question '{question.Code}'", ct);

        return MapToDto(question, true);
    }

    public async Task<QuestionDto> UpdateDraftAsync(Guid id, UpdateQuestionDraftRequest request, string author, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Exhibits)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (question == null)
            throw new DomainException($"Question with ID '{id}' was not found.");

        if (question.Status == ContentStatus.Published)
            throw new DomainException("Cannot edit a published question directly. Please create a new version to revise published content.");

        // Concurrency Check
        if (question.ConcurrencyToken != request.ConcurrencyToken)
            throw new DomainException("Concurrency Conflict: This question was modified by another user. Please reload the latest version to avoid overwriting changes.");

        question.Pathway = request.Pathway;
        question.Category = request.Category;
        question.Subject = request.Subject;
        question.Topic = request.Topic;
        question.Subtopic = request.Subtopic;
        question.Difficulty = request.Difficulty;
        question.UpdatedAtUtc = DateTime.UtcNow;
        question.UpdatedBy = author;
        question.ConcurrencyToken = Guid.NewGuid();

        if (question.CurrentVersion != null)
        {
            question.CurrentVersion.Stem = request.Stem;
            question.CurrentVersion.QuestionType = request.QuestionType;
            question.CurrentVersion.CognitiveSkill = request.CognitiveSkill;
            question.CurrentVersion.ClientNeedCategory = request.ClientNeedCategory;
            question.CurrentVersion.GeneralRationale = request.GeneralRationale;
            question.CurrentVersion.ContentJsonData = request.ContentJsonData;
            question.CurrentVersion.UpdatedAtUtc = DateTime.UtcNow;
            question.CurrentVersion.UpdatedBy = author;

            // Clear and reload options
            _context.QuestionOptions.RemoveRange(question.CurrentVersion.Options);
            question.CurrentVersion.Options.Clear();
            foreach (var opt in request.Options)
            {
                question.CurrentVersion.Options.Add(new QuestionOption(opt.OptionIndex, opt.OptionText, opt.IsCorrect, opt.SpecificRationale, opt.DisplayOrder));
            }

            // Clear and reload exhibits
            _context.QuestionExhibits.RemoveRange(question.CurrentVersion.Exhibits);
            question.CurrentVersion.Exhibits.Clear();
            foreach (var exh in request.Exhibits)
            {
                question.CurrentVersion.Exhibits.Add(new QuestionExhibit(exh.Type, exh.Title, exh.Content, exh.DisplayOrder));
            }
        }

        await _context.SaveChangesAsync(ct);
        await _audit.LogAsync("Question", question.Id.ToString(), "UpdateDraft", author, author, "ContentAuthor", $"Updated draft question '{question.Code}'", ct);

        return MapToDto(question, true);
    }

    public async Task<List<string>> ValidateQuestionAsync(Guid id, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Exhibits)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (question == null || question.CurrentVersion == null)
            throw new DomainException($"Question with ID '{id}' was not found.");

        question.CurrentVersion.Validate(out var errors);
        await _context.SaveChangesAsync(ct);

        return errors;
    }

    public async Task<QuestionDto> SubmitForReviewAsync(Guid id, string actor, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Exhibits)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (question == null)
            throw new DomainException($"Question with ID '{id}' was not found.");

        question.SubmitForReview(actor);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Question", question.Id.ToString(), "SubmitForReview", actor, actor, "ContentAuthor", $"Submitted question '{question.Code}' for clinical review", ct);

        return MapToDto(question, true);
    }

    public async Task<QuestionDto> ReviewQuestionAsync(Guid id, QuestionReviewRequest request, string reviewerId, string reviewerName, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .Include(q => q.Reviews)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (question == null)
            throw new DomainException($"Question with ID '{id}' was not found.");

        if (request.Decision == ReviewDecision.Approved)
        {
            question.Approve(reviewerId, reviewerName, request.Comments);
            await _audit.LogAsync("Question", question.Id.ToString(), "Approve", reviewerId, reviewerName, "ContentReviewer", $"Approved question '{question.Code}'", ct);
        }
        else
        {
            question.Reject(reviewerId, reviewerName, request.Comments);
            await _audit.LogAsync("Question", question.Id.ToString(), "Reject", reviewerId, reviewerName, "ContentReviewer", $"Rejected question '{question.Code}': {request.Comments}", ct);
        }

        await _context.SaveChangesAsync(ct);
        return MapToDto(question, true);
    }

    public async Task<QuestionDto> PublishQuestionAsync(Guid id, string publisher, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (question == null)
            throw new DomainException($"Question with ID '{id}' was not found.");

        question.Publish(publisher);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Question", question.Id.ToString(), "Publish", publisher, publisher, "Admin", $"Published question '{question.Code}' to live question bank", ct);

        return MapToDto(question, true);
    }

    public async Task<QuestionDto> ArchiveQuestionAsync(Guid id, string actor, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.CurrentVersion)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (question == null)
            throw new DomainException($"Question with ID '{id}' was not found.");

        question.Archive(actor);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Question", question.Id.ToString(), "Archive", actor, actor, "Admin", $"Archived question '{question.Code}'", ct);

        return MapToDto(question, true);
    }

    public async Task<QuestionDto> CreateNewVersionAsync(Guid id, string author, CancellationToken ct = default)
    {
        var question = await _context.Questions
            .Include(q => q.Versions)
                .ThenInclude(v => v.Options)
            .Include(q => q.Versions)
                .ThenInclude(v => v.Exhibits)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Options)
            .Include(q => q.CurrentVersion)
                .ThenInclude(v => v!.Exhibits)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (question == null)
            throw new DomainException($"Question with ID '{id}' was not found.");

        var newVersion = question.CreateNewVersion(author);
        _context.QuestionVersions.Add(newVersion);

        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync("Question", question.Id.ToString(), "CreateNewVersion", author, author, "ContentAuthor", $"Created new draft version #{newVersion.VersionNumber} for '{question.Code}'", ct);

        return MapToDto(question, true);
    }

    private static QuestionDto MapToDto(Question q, bool includeAllVersions)
    {
        return new QuestionDto
        {
            Id = q.Id,
            Code = q.Code,
            Pathway = q.Pathway,
            Category = q.Category,
            Subject = q.Subject,
            Topic = q.Topic,
            Subtopic = q.Subtopic,
            Difficulty = q.Difficulty,
            Status = q.Status,
            CurrentVersionId = q.CurrentVersionId,
            ConcurrencyToken = q.ConcurrencyToken,
            CreatedAtUtc = q.CreatedAtUtc,
            CreatedBy = q.CreatedBy,
            UpdatedAtUtc = q.UpdatedAtUtc,
            UpdatedBy = q.UpdatedBy,
            TotalVersions = q.Versions?.Count ?? 1,
            CurrentVersion = q.CurrentVersion != null ? new QuestionVersionDto
            {
                Id = q.CurrentVersion.Id,
                QuestionId = q.CurrentVersion.QuestionId,
                VersionNumber = q.CurrentVersion.VersionNumber,
                Stem = q.CurrentVersion.Stem,
                QuestionType = q.CurrentVersion.QuestionType,
                CognitiveSkill = q.CurrentVersion.CognitiveSkill,
                ClientNeedCategory = q.CurrentVersion.ClientNeedCategory,
                GeneralRationale = q.CurrentVersion.GeneralRationale,
                ContentJsonData = q.CurrentVersion.ContentJsonData,
                Status = q.CurrentVersion.Status,
                ValidationErrors = q.CurrentVersion.ValidationErrors,
                ReviewNotes = q.CurrentVersion.ReviewNotes,
                CreatedAtUtc = q.CurrentVersion.CreatedAtUtc,
                CreatedBy = q.CurrentVersion.CreatedBy,
                Options = q.CurrentVersion.Options.OrderBy(o => o.DisplayOrder).Select(o => new QuestionOptionDto
                {
                    Id = o.Id,
                    OptionIndex = o.OptionIndex,
                    OptionText = o.OptionText,
                    IsCorrect = o.IsCorrect,
                    SpecificRationale = o.SpecificRationale,
                    DisplayOrder = o.DisplayOrder
                }).ToList(),
                Exhibits = q.CurrentVersion.Exhibits.OrderBy(e => e.DisplayOrder).Select(e => new QuestionExhibitDto
                {
                    Id = e.Id,
                    Type = e.Type,
                    Title = e.Title,
                    Content = e.Content,
                    DisplayOrder = e.DisplayOrder
                }).ToList(),
                Reviews = q.Reviews?.Select(r => new QuestionReviewDto
                {
                    Id = r.Id,
                    QuestionVersionId = r.QuestionVersionId,
                    ReviewerId = r.ReviewerId,
                    ReviewerName = r.ReviewerName,
                    Decision = r.Decision,
                    Comments = r.Comments,
                    ReviewedAtUtc = r.ReviewedAtUtc
                }).ToList() ?? new List<QuestionReviewDto>()
            } : null
        };
    }
}
