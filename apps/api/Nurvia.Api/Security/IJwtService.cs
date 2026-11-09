using System.Security.Claims;

namespace Nurvia.Api.Security;

public class JwtSettings
{
    public string Secret { get; set; } = "NurviaSecretKeyForJwtTokenGeneration2026!ExamPlatformSecureToken";
    public string Issuer { get; set; } = "NurviaApi";
    public string Audience { get; set; } = "NurviaWeb";
    public int ExpiryMinutes { get; set; } = 1440;
}

public class AuthUser
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Learner";
}

public interface IJwtService
{
    string GenerateToken(AuthUser user, TimeSpan? expiry = null);
    ClaimsPrincipal? ValidateToken(string token);
}
