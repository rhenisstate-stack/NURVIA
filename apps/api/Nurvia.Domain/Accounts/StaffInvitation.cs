using Nurvia.Domain.Common;

namespace Nurvia.Domain.Accounts;

/// <summary>
/// Persisted single-use, expiring staff invitation record.
/// </summary>
public class StaffInvitation : Entity
{
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public string InvitedByUserId { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? AcceptedAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public StaffInvitation() { }

    public bool IsActiveAt(DateTime utcNow) =>
        AcceptedAtUtc is null && RevokedAtUtc is null && ExpiresAtUtc > utcNow;
}
