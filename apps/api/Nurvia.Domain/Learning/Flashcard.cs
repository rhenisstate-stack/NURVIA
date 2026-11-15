using Nurvia.Domain.Common;

namespace Nurvia.Domain.Learning;

/// <summary>
/// Represents a clinical nursing flashcard (either system-curated or learner-owned).
/// </summary>
public class Flashcard : Entity
{
    public string? OwnerUserId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Pathway { get; set; } = "RN";
    public string Front { get; set; } = string.Empty;
    public string Back { get; set; } = string.Empty;
    public string? Hint { get; set; }
    public bool IsSystemCard { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Flashcard() { }
}

/// <summary>
/// Per-learner SM-2 spaced-repetition scheduling progress for a flashcard.
/// </summary>
public class UserFlashcardProgress : Entity
{
    public string UserId { get; set; } = string.Empty;
    public Guid FlashcardId { get; set; }
    public int Repetitions { get; set; }
    public int IntervalDays { get; set; }
    public double EaseFactor { get; set; } = 2.5;
    public string LastRating { get; set; } = "New";
    public DateTime NextReviewAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastReviewedAtUtc { get; set; }

    public UserFlashcardProgress() { }
}
