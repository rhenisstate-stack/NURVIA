using Microsoft.EntityFrameworkCore;
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

    public AuthService(INurviaDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
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
        string targetUserId, string role, string updatedBy, CancellationToken cancellationToken)
    {
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

    private static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private static AuthUserDto Map(UserAccount account) => new()
    {
        Id = account.Id.ToString(),
        Name = account.Name,
        Email = account.Email,
        Role = account.Role
    };
}
