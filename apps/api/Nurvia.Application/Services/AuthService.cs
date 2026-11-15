using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;

namespace Nurvia.Application.Services;

public sealed class AuthService : IAuthService
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Learner", "Instructor", "Author", "Reviewer", "Publisher", "Administrator", "Superadmin"
    };

    private readonly INurviaDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailSender? _emailSender;
    private readonly IAuditService? _auditService;

    public AuthService(
        INurviaDbContext context,
        IPasswordHasher passwordHasher,
        IEmailSender? emailSender = null,
        IAuditService? auditService = null)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _emailSender = emailSender;
        _auditService = auditService;
    }

    public async Task<bool> RegisterAsync(RegistrationRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        if (await _context.UserAccounts.AnyAsync(
                user => user.NormalizedEmail == normalizedEmail, cancellationToken))
        {
            return false;
        }

        var account = new UserAccount(
            request.Name.Trim(),
            request.Email.Trim(),
            _passwordHasher.Hash(request.Password));

        _context.UserAccounts.Add(account);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<AuthUserDto?> AuthenticateAsync(
        string email, string password, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);
        var account = await _context.UserAccounts.SingleOrDefaultAsync(
            user => user.NormalizedEmail == normalizedEmail, cancellationToken);

        if (account == null || !account.IsActive ||
            !_passwordHasher.Verify(password, account.PasswordHash))
        {
            return null;
        }

        return Map(account);
    }

    public async Task<AuthUserDto?> GetUserAsync(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var userId))
            return null;

        var account = await _context.UserAccounts.SingleOrDefaultAsync(
            user => user.Id == userId && user.IsActive, cancellationToken);
        return account == null ? null : Map(account);
    }

    public async Task<AuthUserDto?> UpdateProfileAsync(
        string id, string name, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var userId))
            return null;

        var account = await _context.UserAccounts.SingleOrDefaultAsync(
            user => user.Id == userId && user.IsActive, cancellationToken);
        if (account == null)
            return null;

        account.UpdateProfile(name.Trim(), id);
        await _context.SaveChangesAsync(cancellationToken);
        return Map(account);
    }

    public async Task<bool> AssignRoleAsync(
        string targetUserId, string role, string updatedBy, string callerRole, CancellationToken cancellationToken)
    {
        // Backend enforcement of the privilege-escalation invariant on every
        // role-assignment path, independent of any controller-level check:
        // only a Superadmin may assign the Superadmin role.
        if (!RoleAssignmentPolicy.CanAssign(callerRole, role))
            return false;

        if (!Guid.TryParse(targetUserId, out var userId) || !AllowedRoles.Contains(role))
            return false;

        var account = await _context.UserAccounts.SingleOrDefaultAsync(
            user => user.Id == userId, cancellationToken);
        if (account == null)
            return false;

        var canonicalRole = AllowedRoles.Single(allowedRole =>
            allowedRole.Equals(role, StringComparison.OrdinalIgnoreCase));
        account.ChangeRole(canonicalRole, updatedBy);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> BootstrapSuperadminAsync(
        string name, string email, string password, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (await _context.UserAccounts.AnyAsync(
                user => user.Role == "Superadmin", cancellationToken) ||
            await _context.UserAccounts.AnyAsync(
                user => user.NormalizedEmail == normalizedEmail, cancellationToken))
        {
            return false;
        }

        var account = new UserAccount(name.Trim(), email.Trim(), _passwordHasher.Hash(password));
        account.ChangeRole("Superadmin", "bootstrap");
        _context.UserAccounts.Add(account);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task RequestPasswordResetAsync(string email, string resetBaseUrl, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(email))
            return;

        var normalizedEmail = NormalizeEmail(email);
        var account = await _context.UserAccounts
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

        // Anti-enumeration: silently return when no active account exists.
        if (account == null || !account.IsActive)
            return;

        var now = DateTime.UtcNow;

        // Invalidate any prior unused reset tokens for this account.
        var outstandingTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == account.Id && t.UsedAtUtc == null && t.ExpiresAtUtc > now)
            .ToListAsync(cancellationToken);
        foreach (var existing in outstandingTokens)
            existing.MarkUsed(now);

        var rawBytes = RandomNumberGenerator.GetBytes(32);
        var rawToken = Convert.ToBase64String(rawBytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');

        var tokenHash = HashResetToken(rawToken);
        var resetToken = new PasswordResetToken(account.Id, tokenHash, now.AddMinutes(30));
        _context.PasswordResetTokens.Add(resetToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (_auditService != null)
        {
            await _auditService.LogAsync(
                "UserAccount",
                account.Id.ToString(),
                "PasswordResetRequested",
                account.Id.ToString(),
                account.Name,
                account.Role,
                "Password reset token issued.",
                cancellationToken);
        }

        if (_emailSender != null)
        {
            var separator = resetBaseUrl.Contains('?', StringComparison.Ordinal) ? "&" : "?";
            var resetUrl = $"{resetBaseUrl.TrimEnd('/')}{separator}token={Uri.EscapeDataString(rawToken)}";
            await _emailSender.SendPasswordResetEmailAsync(account.Email, account.Name, resetUrl, cancellationToken);
        }
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 12)
            return false;

        var now = DateTime.UtcNow;
        var tokenHash = HashResetToken(token.Trim());

        var resetToken = await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (resetToken == null || !resetToken.IsValidAt(now))
            return false;

        var account = await _context.UserAccounts
            .FirstOrDefaultAsync(u => u.Id == resetToken.UserId, cancellationToken);

        if (account == null || !account.IsActive)
            return false;

        account.ChangePassword(_passwordHasher.Hash(newPassword), account.Id.ToString());
        resetToken.MarkUsed(now);

        var otherActiveTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == account.Id && t.Id != resetToken.Id && t.UsedAtUtc == null)
            .ToListAsync(cancellationToken);
        foreach (var other in otherActiveTokens)
            other.MarkUsed(now);

        await _context.SaveChangesAsync(cancellationToken);

        if (_auditService != null)
        {
            await _auditService.LogAsync(
                "UserAccount",
                account.Id.ToString(),
                "PasswordResetCompleted",
                account.Id.ToString(),
                account.Name,
                account.Role,
                "Password updated via single-use reset token.",
                cancellationToken);
        }

        return true;
    }

    public static string HashResetToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes);
    }

    public async Task<PagedResult<AuthUserSummaryDto>> GetUsersAsync(
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var normalizedPage = Math.Max(1, pageNumber);
        var normalizedSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.UserAccounts.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Name.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term) ||
                u.Role.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(u => u.CreatedAtUtc)
            .Skip((normalizedPage - 1) * normalizedSize)
            .Take(normalizedSize)
            .Select(u => new AuthUserSummaryDto
            {
                Id = u.Id.ToString(),
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAtUtc = u.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<AuthUserSummaryDto>(items, totalCount, normalizedPage, normalizedSize);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private static AuthUserDto Map(UserAccount account) => new()
    {
        Id = account.Id.ToString(),
        Name = account.Name,
        Email = account.Email,
        Role = account.Role
    };
}
