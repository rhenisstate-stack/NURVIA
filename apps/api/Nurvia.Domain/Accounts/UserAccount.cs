using Nurvia.Domain.Common;

namespace Nurvia.Domain.Accounts;

public sealed class UserAccount : Entity, IAuditableEntity
{
    private UserAccount()
    {
    }

    public UserAccount(string name, string email, string passwordHash)
    {
        Name = name;
        Email = email.Trim().ToLowerInvariant();
        NormalizedEmail = Email.ToUpperInvariant();
        PasswordHash = passwordHash;
        Role = "Learner";
        CreatedAtUtc = DateTime.UtcNow;
        CreatedBy = Id.ToString();
    }

    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string NormalizedEmail { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Role { get; private set; } = "Learner";
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    public void UpdateProfile(string name, string updatedBy)
    {
        Name = name;
        UpdatedBy = updatedBy;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ChangePassword(string passwordHash, string updatedBy)
    {
        PasswordHash = passwordHash;
        UpdatedBy = updatedBy;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ChangeRole(string role, string updatedBy)
    {
        Role = role;
        UpdatedBy = updatedBy;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Deactivate(string updatedBy)
    {
        IsActive = false;
        UpdatedBy = updatedBy;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Activate(string updatedBy)
    {
        IsActive = true;
        UpdatedBy = updatedBy;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
