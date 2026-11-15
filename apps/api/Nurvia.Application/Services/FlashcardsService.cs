using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Domain.Learning;

namespace Nurvia.Application.Services;

public sealed record FlashcardDto(
    Guid Id,
    string Category,
    string Pathway,
    string Front,
    string Back,
    string? Hint,
    bool IsSystemCard,
    bool IsOwnedByCaller,
    int Repetitions,
    int IntervalDays,
    double EaseFactor,
    string LastRating,
    DateTime NextReviewAtUtc,
    DateTime? LastReviewedAtUtc);

public sealed record CreateFlashcardRequest(
    string Category,
    string Pathway,
    string Front,
    string Back,
    string? Hint);

public sealed record ReviewFlashcardRequest(string Rating);

public interface IFlashcardsService
{
    Task<IReadOnlyList<FlashcardDto>> GetFlashcardsAsync(string userId, string? category, bool dueOnly, CancellationToken ct = default);
    Task<(FlashcardDto? Card, string? Error)> CreateAsync(string userId, CreateFlashcardRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string userId, Guid flashcardId, CancellationToken ct = default);
    Task<(FlashcardDto? Card, string? Error, bool NotFound)> ReviewAsync(string userId, Guid flashcardId, string rating, CancellationToken ct = default);
}

public class FlashcardsService : IFlashcardsService
{
    private readonly INurviaDbContext _db;

    public FlashcardsService(INurviaDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<FlashcardDto>> GetFlashcardsAsync(
        string userId,
        string? category,
        bool dueOnly,
        CancellationToken ct = default)
    {
        var query = _db.Flashcards
            .AsNoTracking()
            .Where(f => f.IsSystemCard || f.OwnerUserId == userId);

        if (!string.IsNullOrWhiteSpace(category) && !string.Equals(category, "All", StringComparison.OrdinalIgnoreCase))
        {
            var cat = category.Trim().ToLower();
            query = query.Where(f => f.Category.ToLower() == cat);
        }

        var cards = await query
            .OrderByDescending(f => !f.IsSystemCard)
            .ThenBy(f => f.Category)
            .ThenBy(f => f.CreatedAtUtc)
            .ToListAsync(ct);

        var cardIds = cards.Select(c => c.Id).ToList();
        var progresses = await _db.UserFlashcardProgresses
            .AsNoTracking()
            .Where(p => p.UserId == userId && cardIds.Contains(p.FlashcardId))
            .ToDictionaryAsync(p => p.FlashcardId, ct);

        var now = DateTime.UtcNow;
        var dtos = cards.Select(c =>
        {
            progresses.TryGetValue(c.Id, out var p);
            return new FlashcardDto(
                c.Id,
                c.Category,
                c.Pathway,
                c.Front,
                c.Back,
                c.Hint,
                c.IsSystemCard,
                c.OwnerUserId == userId,
                p?.Repetitions ?? 0,
                p?.IntervalDays ?? 0,
                p?.EaseFactor ?? 2.5,
                p?.LastRating ?? "New",
                p?.NextReviewAtUtc ?? now,
                p?.LastReviewedAtUtc);
        });

        if (dueOnly)
        {
            dtos = dtos.Where(d => d.NextReviewAtUtc <= now);
        }

        return dtos.ToList();
    }

    public async Task<(FlashcardDto? Card, string? Error)> CreateAsync(
        string userId,
        CreateFlashcardRequest request,
        CancellationToken ct = default)
    {
        var front = request.Front?.Trim() ?? string.Empty;
        var back = request.Back?.Trim() ?? string.Empty;
        var category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim();
        var pathway = string.IsNullOrWhiteSpace(request.Pathway) ? "RN" : request.Pathway.Trim();

        if (front.Length < 3 || front.Length > 2000)
            return (null, "Flashcard front must be between 3 and 2000 characters.");
        if (back.Length < 3 || back.Length > 4000)
            return (null, "Flashcard back must be between 3 and 4000 characters.");

        var card = new Flashcard
        {
            OwnerUserId = userId,
            Category = category.Length > 100 ? category[..100] : category,
            Pathway = pathway.Length > 40 ? pathway[..40] : pathway,
            Front = front,
            Back = back,
            Hint = string.IsNullOrWhiteSpace(request.Hint) ? null : request.Hint.Trim(),
            IsSystemCard = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Flashcards.Add(card);
        await _db.SaveChangesAsync(ct);

        return (new FlashcardDto(
            card.Id,
            card.Category,
            card.Pathway,
            card.Front,
            card.Back,
            card.Hint,
            false,
            true,
            0,
            0,
            2.5,
            "New",
            DateTime.UtcNow,
            null), null);
    }

    public async Task<bool> DeleteAsync(string userId, Guid flashcardId, CancellationToken ct = default)
    {
        var card = await _db.Flashcards
            .FirstOrDefaultAsync(f => f.Id == flashcardId && !f.IsSystemCard && f.OwnerUserId == userId, ct);
        if (card is null)
            return false;

        var progresses = await _db.UserFlashcardProgresses
            .Where(p => p.FlashcardId == flashcardId)
            .ToListAsync(ct);
        if (progresses.Count > 0)
            _db.UserFlashcardProgresses.RemoveRange(progresses);

        _db.Flashcards.Remove(card);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<(FlashcardDto? Card, string? Error, bool NotFound)> ReviewAsync(
        string userId,
        Guid flashcardId,
        string rating,
        CancellationToken ct = default)
    {
        var normalized = rating?.Trim() ?? string.Empty;
        var quality = normalized.ToLowerInvariant() switch
        {
            "again" => 1,
            "hard" => 3,
            "good" => 4,
            "easy" => 5,
            _ => -1
        };
        if (quality < 0)
            return (null, "Rating must be one of: Again, Hard, Good, Easy.", false);

        var card = await _db.Flashcards
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == flashcardId && (f.IsSystemCard || f.OwnerUserId == userId), ct);
        if (card is null)
            return (null, "Flashcard not found.", true);

        var progress = await _db.UserFlashcardProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.FlashcardId == flashcardId, ct);

        var now = DateTime.UtcNow;
        if (progress is null)
        {
            progress = new UserFlashcardProgress
            {
                UserId = userId,
                FlashcardId = flashcardId,
                Repetitions = 0,
                IntervalDays = 0,
                EaseFactor = 2.5
            };
            _db.UserFlashcardProgresses.Add(progress);
        }

        // SM-2 spaced-repetition calculation
        if (quality < 3)
        {
            progress.Repetitions = 0;
            progress.IntervalDays = 1;
        }
        else
        {
            if (progress.Repetitions == 0)
                progress.IntervalDays = 1;
            else if (progress.Repetitions == 1)
                progress.IntervalDays = 6;
            else
                progress.IntervalDays = (int)Math.Max(1, Math.Round(progress.IntervalDays * progress.EaseFactor));

            progress.Repetitions += 1;
        }

        var efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
        progress.EaseFactor = Math.Max(1.3, Math.Round(progress.EaseFactor + efDelta, 2));
        progress.LastRating = char.ToUpperInvariant(normalized[0]) + normalized[1..].ToLowerInvariant();
        progress.LastReviewedAtUtc = now;
        progress.NextReviewAtUtc = quality < 3
            ? now.AddMinutes(10)
            : now.AddDays(progress.IntervalDays);

        await _db.SaveChangesAsync(ct);

        return (new FlashcardDto(
            card.Id,
            card.Category,
            card.Pathway,
            card.Front,
            card.Back,
            card.Hint,
            card.IsSystemCard,
            card.OwnerUserId == userId,
            progress.Repetitions,
            progress.IntervalDays,
            progress.EaseFactor,
            progress.LastRating,
            progress.NextReviewAtUtc,
            progress.LastReviewedAtUtc), null, false);
    }
}
