using System.Security.Claims;

namespace Nurvia.Api.Common;

public class CurrentUser
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsAuthenticated { get; set; }
}

public static class HttpContextExtensions
{
    public static CurrentUser GetCurrentUser(this HttpContext context)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return new CurrentUser
            {
                Id = string.Empty,
                Name = "Unauthenticated User",
                Email = string.Empty,
                Role = string.Empty,
                IsAuthenticated = false
            };
        }

        var id = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? context.User.FindFirst("sub")?.Value
                 ?? string.Empty;

        var name = context.User.FindFirstValue(ClaimTypes.Name)
                   ?? "Authenticated User";

        var email = context.User.FindFirstValue(ClaimTypes.Email)
                    ?? string.Empty;

        var role = context.User.FindFirstValue(ClaimTypes.Role)
                   ?? "Learner";

        return new CurrentUser
        {
            Id = id,
            Name = name,
            Email = email,
            Role = role,
            IsAuthenticated = true
        };
    }

    public static bool HasRole(this HttpContext context, params string[] allowedRoles)
    {
        var user = context.GetCurrentUser();
        if (!user.IsAuthenticated || string.IsNullOrWhiteSpace(user.Role))
            return false;

        // Superadmin bypasses all role checks
        if (user.Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase))
            return true;

        // Administrator has access to all standard administrative roles except Superadmin-only operations
        if (user.Role.Equals("Administrator", StringComparison.OrdinalIgnoreCase))
        {
            if (allowedRoles.Length == 1 && allowedRoles[0].Equals("Superadmin", StringComparison.OrdinalIgnoreCase))
                return false; // Administrator cannot perform Superadmin-only actions

            return true;
        }

        return allowedRoles.Any(r => r.Equals(user.Role, StringComparison.OrdinalIgnoreCase));
    }
}
