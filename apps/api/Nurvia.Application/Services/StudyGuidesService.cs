using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Learning;

namespace Nurvia.Application.Services;

public sealed record StudyGuideSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    string Category,
    string Pathway,
    string Summary,
    int ReadingMinutes,
    bool IsPublished,
    DateTime CreatedAtUtc);

public sealed record StudyGuideDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Category,
    string Pathway,
    string Summary,
    string ContentMarkdown,
    int ReadingMinutes,
    bool IsPublished,
    DateTime CreatedAtUtc);

public sealed record CreateStudyGuideRequest(
    string Title,
    string Category,
    string Pathway,
    string Summary,
    string ContentMarkdown,
    int ReadingMinutes = 10,
    bool IsPublished = true);

public interface IStudyGuidesService
{
    Task<IReadOnlyList<StudyGuideSummaryDto>> GetGuidesAsync(bool includeUnpublished, string? category, string? pathway, string? search, CancellationToken ct = default);
    Task<StudyGuideDetailDto?> GetByIdAsync(Guid id, bool includeUnpublished, CancellationToken ct = default);
    Task<(StudyGuideDetailDto? Guide, string? Error)> CreateAsync(string userId, CreateStudyGuideRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}

public class StudyGuidesService : IStudyGuidesService
{
    private readonly INurviaDbContext _db;

    public StudyGuidesService(INurviaDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<StudyGuideSummaryDto>> GetGuidesAsync(
        bool includeUnpublished,
        string? category,
        string? pathway,
        string? search,
        CancellationToken ct = default)
    {
        var query = _db.StudyGuides.AsNoTracking();
        if (!includeUnpublished)
            query = query.Where(g => g.IsPublished);

        if (!string.IsNullOrWhiteSpace(category) && !string.Equals(category, "All", StringComparison.OrdinalIgnoreCase))
        {
            var cat = category.Trim().ToLower();
            query = query.Where(g => g.Category.ToLower() == cat);
        }

        if (!string.IsNullOrWhiteSpace(pathway) && !string.Equals(pathway, "All", StringComparison.OrdinalIgnoreCase))
        {
            var pw = pathway.Trim().ToLower();
            query = query.Where(g => g.Pathway.ToLower() == pw);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(g =>
                g.Title.ToLower().Contains(term) ||
                g.Summary.ToLower().Contains(term) ||
                g.Category.ToLower().Contains(term));
        }

        return await query
            .OrderBy(g => g.Category)
            .ThenBy(g => g.Title)
            .Select(g => new StudyGuideSummaryDto(
                g.Id, g.Title, g.Slug, g.Category, g.Pathway, g.Summary, g.ReadingMinutes, g.IsPublished, g.CreatedAtUtc))
            .ToListAsync(ct);
    }

    public async Task<StudyGuideDetailDto?> GetByIdAsync(Guid id, bool includeUnpublished, CancellationToken ct = default)
    {
        var query = _db.StudyGuides.AsNoTracking().Where(g => g.Id == id);
        if (!includeUnpublished)
            query = query.Where(g => g.IsPublished);

        var g = await query.FirstOrDefaultAsync(ct);
        return g is null
            ? null
            : new StudyGuideDetailDto(g.Id, g.Title, g.Slug, g.Category, g.Pathway, g.Summary, g.ContentMarkdown, g.ReadingMinutes, g.IsPublished, g.CreatedAtUtc);
    }

    public async Task<(StudyGuideDetailDto? Guide, string? Error)> CreateAsync(
        string userId,
        CreateStudyGuideRequest request,
        CancellationToken ct = default)
    {
        var title = request.Title?.Trim() ?? string.Empty;
        var markdown = request.ContentMarkdown?.Trim() ?? string.Empty;
        if (title.Length < 3 || title.Length > 240)
            return (null, "Title must be between 3 and 240 characters.");
        if (markdown.Length < 10)
            return (null, "Content markdown must contain at least 10 characters.");

        var baseSlug = string.Join("-", title.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries))
            .Replace("/", "-");
        if (baseSlug.Length > 200) baseSlug = baseSlug[..200];
        var slug = $"{baseSlug}-{Guid.NewGuid().ToString("N")[..6]}";

        var entity = new StudyGuide
        {
            Title = title,
            Slug = slug,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            Pathway = string.IsNullOrWhiteSpace(request.Pathway) ? "RN" : request.Pathway.Trim(),
            Summary = request.Summary?.Trim() ?? string.Empty,
            ContentMarkdown = markdown,
            ReadingMinutes = Math.Clamp(request.ReadingMinutes, 1, 120),
            IsPublished = request.IsPublished,
            CreatedByUserId = userId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.StudyGuides.Add(entity);
        await _db.SaveChangesAsync(ct);

        return (new StudyGuideDetailDto(
            entity.Id, entity.Title, entity.Slug, entity.Category, entity.Pathway,
            entity.Summary, entity.ContentMarkdown, entity.ReadingMinutes, entity.IsPublished, entity.CreatedAtUtc), null);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.StudyGuides.FirstOrDefaultAsync(g => g.Id == id, ct);
        if (entity is null) return false;
        _db.StudyGuides.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
