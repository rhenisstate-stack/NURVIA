using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Nurvia.Application.Security;

public class JwtService : IJwtService
{
    private readonly JwtSettings _settings;
    private readonly byte[] _keyBytes;

    public JwtService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
        if (Encoding.UTF8.GetByteCount(_settings.Secret) < 32)
            throw new InvalidOperationException("JwtSettings:Secret must contain at least 32 bytes.");

        _keyBytes = Encoding.UTF8.GetBytes(_settings.Secret);
    }

    public string GenerateToken(AuthUser user, TimeSpan? expiry = null)
    {
        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.Add(expiry ?? TimeSpan.FromMinutes(_settings.ExpiryMinutes));

        var header = new Dictionary<string, object>
        {
            { "alg", "HS256" },
            { "typ", "JWT" }
        };

        var payload = new Dictionary<string, object>
        {
            { "sub", user.Id },
            { "name", user.Name },
            { "email", user.Email },
            { "role", user.Role },
            { "iss", _settings.Issuer },
            { "aud", _settings.Audience },
            { "iat", now.ToUnixTimeSeconds() },
            { "exp", expiresAt.ToUnixTimeSeconds() },
            { "jti", Guid.NewGuid().ToString("N") }
        };

        var headerJson = JsonSerializer.Serialize(header);
        var payloadJson = JsonSerializer.Serialize(payload);

        var headerB64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payloadB64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

        var dataToSign = $"{headerB64}.{payloadB64}";
        using var hmac = new HMACSHA256(_keyBytes);
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(dataToSign));
        var signatureB64 = Base64UrlEncode(signatureBytes);

        return $"{dataToSign}.{signatureB64}";
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var parts = token.Split('.');
        if (parts.Length != 3)
            return null;

        var headerB64 = parts[0];
        var payloadB64 = parts[1];
        var signatureB64 = parts[2];

        var dataToSign = $"{headerB64}.{payloadB64}";
        using var hmac = new HMACSHA256(_keyBytes);
        var expectedSignatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(dataToSign));
        var expectedSignatureB64 = Base64UrlEncode(expectedSignatureBytes);

        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(signatureB64),
            Encoding.UTF8.GetBytes(expectedSignatureB64)))
        {
            return null;
        }

        try
        {
            var headerBytes = Base64UrlDecode(headerB64);
            using var headerDoc = JsonDocument.Parse(headerBytes);
            if (!headerDoc.RootElement.TryGetProperty("alg", out var algorithm) ||
                algorithm.GetString() != "HS256")
            {
                return null;
            }

            var payloadBytes = Base64UrlDecode(payloadB64);
            var payloadJson = Encoding.UTF8.GetString(payloadBytes);
            using var doc = JsonDocument.Parse(payloadJson);
            var root = doc.RootElement;

            if (!root.TryGetProperty("exp", out var expElement) ||
                DateTimeOffset.FromUnixTimeSeconds(expElement.GetInt64()) <= DateTimeOffset.UtcNow ||
                !root.TryGetProperty("iss", out var issuer) ||
                issuer.GetString() != _settings.Issuer ||
                !root.TryGetProperty("aud", out var audience) ||
                audience.GetString() != _settings.Audience)
                return null;

            var sub = root.TryGetProperty("sub", out var subProp) ? subProp.GetString() ?? "" : "";
            var name = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "";
            var email = root.TryGetProperty("email", out var emailProp) ? emailProp.GetString() ?? "" : "";
            var role = root.TryGetProperty("role", out var roleProp) ? roleProp.GetString() ?? "" : "";
            if (!Guid.TryParse(sub, out _) || string.IsNullOrWhiteSpace(role))
                return null;

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, sub),
                new("sub", sub),
                new(ClaimTypes.Name, name),
                new(ClaimTypes.Email, email),
                new(ClaimTypes.Role, role)
            };

            var identity = new ClaimsIdentity(claims, "Bearer", ClaimTypes.Name, ClaimTypes.Role);
            return new ClaimsPrincipal(identity);
        }
        catch (Exception ex) when (
            ex is JsonException or FormatException or InvalidOperationException or ArgumentOutOfRangeException)
        {
            return null;
        }
    }

    private static string Base64UrlEncode(byte[] input)
    {
        var output = Convert.ToBase64String(input);
        output = output.Split('=')[0]; // Remove padding
        output = output.Replace('+', '-'); // 62nd char
        output = output.Replace('/', '_'); // 63rd char
        return output;
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var output = input.Replace('-', '+').Replace('_', '/');
        switch (output.Length % 4)
        {
            case 0: break;
            case 2: output += "=="; break;
            case 3: output += "="; break;
            default: throw new FormatException("Illegal base64url string!");
        }
        return Convert.FromBase64String(output);
    }
}
