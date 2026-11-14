using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Lectures;
using Nurvia.Application.Security;
using Nurvia.Domain.Enums;
using Nurvia.Domain.Exceptions;
using Nurvia.Domain.Lectures;

namespace Nurvia.Application.Services;

public class LectureService : ILectureService
{
    private readonly INurviaDbContext _context;
    private readonly IAuditService _audit;

    public LectureService(INurviaDbContext context, IAuditService audit)
    {
        _context = context;
        _audit = audit;
    }

    public Task<IReadOnlyList<LectureCatalogueItemDto>> GetPublishedCatalogueAsync(
        CancellationToken ct = default)
        => GetPublishedCatalogueAsync(null, ct);

    public async Task<IReadOnlyList<LectureCatalogueItemDto>> GetPublishedCatalogueAsync(
        CurrentUser? user,
        CancellationToken ct = default)
    {
        var canReadProtected = CanReadProtectedLectures(user);

        var lectures = await _context.Lectures
            .AsNoTracking()
            .Where(l => l.Status == ContentStatus.Published)
            .OrderBy(l => l.Number)
            .ToListAsync(ct);

        return lectures
            .Select(l => MapToCatalogueDto(l, canReadProtected))
            .ToList();
    }

    public async Task<LectureContentDto?> GetPublishedBySlugAsync(
        string slug,
        CurrentUser user,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return null;

        var normalizedSlug = slug.Trim().ToLower();

        var lecture = await _context.Lectures
            .AsNoTracking()
            .FirstOrDefaultAsync(
                l => l.Slug.ToLower() == normalizedSlug &&
                     l.Status == ContentStatus.Published,
                ct);

        if (lecture == null)
            return null;

        if (lecture.AccessLevel == LectureAccessLevel.AuthenticatedLearner &&
            !CanReadProtectedLectures(user))
        {
            throw new UnauthorizedAccessException(
                "Authentication and learner access are required to read this lecture.");
        }

        return MapToContentDto(lecture);
    }

    public async Task<IReadOnlyList<LectureManagementDto>> GetAllForManagementAsync(
        CancellationToken ct = default)
    {
        var lectures = await _context.Lectures
            .AsNoTracking()
            .OrderBy(l => l.Number)
            .ToListAsync(ct);

        return lectures.Select(MapToManagementDto).ToList();
    }

    public async Task<LectureManagementDto?> GetByIdForManagementAsync(
        Guid id,
        CancellationToken ct = default)
    {
        var lecture = await _context.Lectures
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id, ct);

        return lecture == null ? null : MapToManagementDto(lecture);
    }

    public async Task<LectureManagementDto> CreateDraftAsync(
        CreateLectureRequest request,
        string author,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        await EnsureUniqueNumberAndSlugAsync(
            request.Number, request.Slug, null, ct);

        var lecture = new Lecture(
            request.Number,
            request.Slug,
            request.Title,
            request.Category,
            request.Summary,
            request.BodyMarkdown,
            request.HighYieldConcepts ?? new List<string>(),
            request.AccessLevel,
            author);

        _context.Lectures.Add(lecture);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync(
            "Lecture",
            lecture.Id.ToString(),
            "CreateDraft",
            author,
            author,
            "ContentAuthor",
            $"Created draft for lecture {lecture.Number}: {lecture.Title}",
            ct);

        return MapToManagementDto(lecture);
    }

    public async Task<LectureManagementDto> UpdateDraftAsync(
        Guid id,
        UpdateLectureRequest request,
        string actor,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var lecture = await FindLectureAsync(id, ct);

        await EnsureUniqueNumberAndSlugAsync(
            lecture.Number, request.Slug, id, ct);

        lecture.UpdateContent(
            request.Slug,
            request.Title,
            request.Category,
            request.Summary,
            request.BodyMarkdown,
            request.HighYieldConcepts ?? new List<string>(),
            request.AccessLevel,
            actor);

        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync(
            "Lecture",
            lecture.Id.ToString(),
            "UpdateDraft",
            actor,
            actor,
            "ContentAuthor",
            $"Updated lecture {lecture.Number}: {lecture.Title}",
            ct);

        return MapToManagementDto(lecture);
    }

    public async Task<LectureManagementDto> SubmitForReviewAsync(
        Guid id,
        string actor,
        CancellationToken ct = default)
    {
        var lecture = await FindLectureAsync(id, ct);

        lecture.SubmitForReview(actor);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync(
            "Lecture",
            lecture.Id.ToString(),
            "SubmitForReview",
            actor,
            actor,
            "ContentAuthor",
            $"Submitted lecture {lecture.Number} for review",
            ct);

        return MapToManagementDto(lecture);
    }

    public async Task<LectureManagementDto> ReviewAsync(
        Guid id,
        ReviewLectureRequest request,
        string reviewerId,
        string reviewerName,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var lecture = await FindLectureAsync(id, ct);

        if (request.Decision == ReviewDecision.Approved &&
            string.Equals(lecture.CreatedBy, reviewerName, StringComparison.OrdinalIgnoreCase))
        {
            throw new DomainException(
                "Authors cannot approve their own lecture submissions.");
        }

        if (request.Decision == ReviewDecision.Approved)
        {
            lecture.Approve(
                reviewerId,
                reviewerName,
                request.Comments ?? string.Empty);
        }
        else if (request.Decision == ReviewDecision.Rejected)
        {
            lecture.Reject(
                reviewerId,
                reviewerName,
                request.Comments ?? string.Empty);
        }
        else
        {
            throw new DomainException(
                "The review decision must be Approved or Rejected.");
        }

        await _context.SaveChangesAsync(ct);

        var action = request.Decision.ToString();

        await _audit.LogAsync(
            "Lecture",
            lecture.Id.ToString(),
            action,
            reviewerId,
            reviewerName,
            "ContentReviewer",
            $"{action} lecture {lecture.Number}: {lecture.Title}. {request.Comments}",
            ct);

        return MapToManagementDto(lecture);
    }

    public async Task<LectureManagementDto> PublishAsync(
        Guid id,
        string publisher,
        CancellationToken ct = default)
    {
        var lecture = await FindLectureAsync(id, ct);

        lecture.Publish(publisher);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync(
            "Lecture",
            lecture.Id.ToString(),
            "Publish",
            publisher,
            publisher,
            "Publisher",
            $"Published lecture {lecture.Number}: {lecture.Title}",
            ct);

        return MapToManagementDto(lecture);
    }

    public async Task<LectureManagementDto> ArchiveAsync(
        Guid id,
        string actor,
        CancellationToken ct = default)
    {
        var lecture = await FindLectureAsync(id, ct);

        lecture.Archive(actor);
        await _context.SaveChangesAsync(ct);

        await _audit.LogAsync(
            "Lecture",
            lecture.Id.ToString(),
            "Archive",
            actor,
            actor,
            "Publisher",
            $"Archived lecture {lecture.Number}: {lecture.Title}",
            ct);

        return MapToManagementDto(lecture);
    }

    private async Task<Lecture> FindLectureAsync(
        Guid id,
        CancellationToken ct)
    {
        var lecture = await _context.Lectures
            .FirstOrDefaultAsync(l => l.Id == id, ct);

        return lecture ?? throw new DomainException(
            $"Lecture with ID '{id}' was not found.");
    }

    private async Task EnsureUniqueNumberAndSlugAsync(
        int number,
        string slug,
        Guid? excludeId,
        CancellationToken ct)
    {
        var normalizedSlug = slug?.Trim().ToLower() ?? string.Empty;

        var duplicateNumber = await _context.Lectures.AnyAsync(
            l => l.Number == number &&
                 (!excludeId.HasValue || l.Id != excludeId.Value),
            ct);

        if (duplicateNumber)
            throw new DomainException(
                $"Lecture number {number} is already assigned.");

        var duplicateSlug = await _context.Lectures.AnyAsync(
            l => l.Slug.ToLower() == normalizedSlug &&
                 (!excludeId.HasValue || l.Id != excludeId.Value),
            ct);

        if (duplicateSlug)
            throw new DomainException(
                $"Lecture slug '{slug}' is already in use.");
    }

    private static bool CanReadProtectedLectures(CurrentUser? user)
    {
        // Staff preview is served through /api/lectures/management/{id};
        // public/learner endpoints require Learner entitlement (or Admin/Superadmin via HasRole).
        return user != null && user.HasRole("Learner");
    }

    private static LectureCatalogueItemDto MapToCatalogueDto(Lecture lecture, bool canReadProtected)
    {
        var includeConcepts = lecture.AccessLevel == LectureAccessLevel.Public || canReadProtected;

        return new LectureCatalogueItemDto
        {
            Id = lecture.Id,
            Number = lecture.Number,
            Slug = lecture.Slug,
            Title = lecture.Title,
            Category = lecture.Category,
            Summary = lecture.Summary,
            HighYieldConcepts = includeConcepts
                ? lecture.HighYieldConcepts.ToList()
                : new List<string>(),
            AccessLevel = lecture.AccessLevel
        };
    }

    private static LectureContentDto MapToContentDto(Lecture lecture)
    {
        return new LectureContentDto
        {
            Id = lecture.Id,
            Number = lecture.Number,
            Slug = lecture.Slug,
            Title = lecture.Title,
            Category = lecture.Category,
            Summary = lecture.Summary,
            HighYieldConcepts = lecture.HighYieldConcepts.ToList(),
            AccessLevel = lecture.AccessLevel,
            BodyMarkdown = lecture.BodyMarkdown
        };
    }

    private static LectureManagementDto MapToManagementDto(Lecture lecture)
    {
        return new LectureManagementDto
        {
            Id = lecture.Id,
            Number = lecture.Number,
            Slug = lecture.Slug,
            Title = lecture.Title,
            Category = lecture.Category,
            Summary = lecture.Summary,
            HighYieldConcepts = lecture.HighYieldConcepts.ToList(),
            AccessLevel = lecture.AccessLevel,
            BodyMarkdown = lecture.BodyMarkdown,
            Status = lecture.Status,
            ReviewNotes = lecture.ReviewNotes,
            CreatedAtUtc = lecture.CreatedAtUtc,
            CreatedBy = lecture.CreatedBy,
            UpdatedAtUtc = lecture.UpdatedAtUtc,
            UpdatedBy = lecture.UpdatedBy
        };
    }
}

