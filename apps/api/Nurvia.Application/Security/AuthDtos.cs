namespace Nurvia.Application.Security;

public sealed class AuthUserDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

public sealed class RegistrationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
}

public interface IAuthService
{
    Task<bool> RegisterAsync(RegistrationRequest request, CancellationToken cancellationToken);
    Task<AuthUserDto?> AuthenticateAsync(string email, string password, CancellationToken cancellationToken);
    Task<AuthUserDto?> GetUserAsync(string id, CancellationToken cancellationToken);
    Task<AuthUserDto?> UpdateProfileAsync(string id, string name, CancellationToken cancellationToken);
    Task<bool> AssignRoleAsync(string targetUserId, string role, string updatedBy, CancellationToken cancellationToken);
}
