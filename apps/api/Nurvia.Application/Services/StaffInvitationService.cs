using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;
using Nurvia.Domain.Auditing;

namespace Nurvia.Application.Services;

public sealed record StaffInvitationDto(
    Guid Id,
    string Email,
    string Role,
    string InvitedByUserId,
    DateTime ExpiresAtUtc,
    DateTime? AcceptedAtUtc,
    DateTime? RevokedAtUtc,
    DateTime CreatedAtUtc,
    string Status);

public sealed record CreateStaffInvitationResult(
    StaffInvitationDto Invitation,
    string? DevInviteToken);

public interface IStaffInvitationService
{
    Task<IReadOnlyList<StaffInvitationDto>> GetInvitationsAsync(CancellationToken ct = default);
    Task<(CreateStaffInvitationResult? Result, string? Error)> CreateInvitationAsync(
        string email, string role, string callerId, string callerRole, bool includeTokenInResponse, CancellationToken ct = default);
    Task<bool> RevokeInvitationAsync(Guid invitationId, string callerId, CancellationToken ct = default);
    Task<(bool Success, string? Error)> AcceptInvitationAsync(string token, string name, string password, CancellationToken ct = default);
}

public class StaffInvitationService : IStaffInvitationService
{
    private readonly INurviaDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public StaffInvitationService(INurviaDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    public async Task<IReadOnlyList<StaffInvitationDto>> GetInvitationsAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var list = await _db.StaffInvitations
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        return list.Select(i => MapDto(i, now)).ToList();
    }

    public async Task<(CreateStaffInvitationResult? Result, string? Error)> CreateInvitationAsync(
        string email,
        string role,
        string callerId,
        string callerRole,
        bool includeTokenInResponse,
        CancellationToken ct = default)
    {
        if (!RoleAssignmentPolicy.CanAssign(callerRole, role))
            return (null, "You are not authorized to invite users with this role.");

        var normalizedEmail = email?.Trim().ToUpperInvariant() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalizedEmail) || !normalizedEmail.Contains('@'))
            return (null, "A valid email address is required.");

        if (await _db.UserAccounts.AnyAsync(u => u.NormalizedEmail == normalizedEmail, ct))
            return (null, "An account with this email address already exists. Use role assignment instead.");

        var rawTokenBytes = RandomNumberGenerator.GetBytes(32);
        var rawToken = Convert.ToBase64String(rawTokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
        var tokenHash = HashToken(rawToken);
        var now = DateTime.UtcNow;

        var invitation = new StaffInvitation
        {
            Email = email!.Trim(),
            Role = role.Trim(),
            TokenHash = tokenHash,
            InvitedByUserId = callerId,
            ExpiresAtUtc = now.AddDays(7),
            CreatedAtUtc = now
        };

        _db.StaffInvitations.Add(invitation);
        _db.AuditLogs.Add(new AuditLog(
            "StaffInvitation",
            invitation.Id.ToString(),
            "StaffInvitationCreated",
            callerId,
            callerId,
            callerRole,
            $"{{\"role\":\"{invitation.Role}\"}}"));

        await _db.SaveChangesAsync(ct);

        return (new CreateStaffInvitationResult(
            MapDto(invitation, now),
            includeTokenInResponse ? rawToken : null), null);
    }

    public async Task<bool> RevokeInvitationAsync(Guid invitationId, string callerId, CancellationToken ct = default)
    {
        var invitation = await _db.StaffInvitations.FirstOrDefaultAsync(i => i.Id == invitationId, ct);
        if (invitation is null || invitation.AcceptedAtUtc is not null || invitation.RevokedAtUtc is not null)
            return false;

        invitation.RevokedAtUtc = DateTime.UtcNow;
        _db.AuditLogs.Add(new AuditLog(
            "StaffInvitation",
            invitation.Id.ToString(),
            "StaffInvitationRevoked",
            callerId,
            callerId,
            "Administrator",
            "{}"));

        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<(bool Success, string? Error)> AcceptInvitationAsync(
        string token,
        string name,
        string password,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token) || token.Length < 16)
            return (false, "Invalid or expired invitation token.");
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length < 2)
            return (false, "Full name must be at least 2 characters.");
        if (string.IsNullOrWhiteSpace(password) || password.Length < 12)
            return (false, "Password must be at least 12 characters.");

        var tokenHash = HashToken(token.Trim());
        var now = DateTime.UtcNow;
        var invitation = await _db.StaffInvitations
            .FirstOrDefaultAsync(i => i.TokenHash == tokenHash, ct);

        if (invitation is null || !invitation.IsActiveAt(now))
            return (false, "Invalid, expired, or already used invitation token.");

        var normalizedEmail = invitation.Email.Trim().ToUpperInvariant();
        if (await _db.UserAccounts.AnyAsync(u => u.NormalizedEmail == normalizedEmail, ct))
            return (false, "An account with this email already exists.");

        var account = new UserAccount(name.Trim(), invitation.Email.Trim(), _passwordHasher.Hash(password));
        account.ChangeRole(invitation.Role, account.Id.ToString());

        invitation.AcceptedAtUtc = now;
        _db.UserAccounts.Add(account);
        _db.AuditLogs.Add(new AuditLog(
            "StaffInvitation",
            invitation.Id.ToString(),
            "StaffInvitationAccepted",
            account.Id.ToString(),
            account.Name,
            invitation.Role,
            $"{{\"role\":\"{invitation.Role}\"}}"));

        await _db.SaveChangesAsync(ct);
        return (true, null);
    }

    private static string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static StaffInvitationDto MapDto(StaffInvitation i, DateTime now)
    {
        var status = i.AcceptedAtUtc is not null ? "Accepted"
            : i.RevokedAtUtc is not null ? "Revoked"
            : i.ExpiresAtUtc <= now ? "Expired"
            : "Pending";
        return new StaffInvitationDto(
            i.Id, i.Email, i.Role, i.InvitedByUserId,
            i.ExpiresAtUtc, i.AcceptedAtUtc, i.RevokedAtUtc, i.CreatedAtUtc, status);
    }
}
