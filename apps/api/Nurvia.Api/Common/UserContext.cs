using System.Security.Claims;
using Nurvia.Application.Security;

namespace Nurvia.Api.Common;

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
        return user.HasRole(allowedRoles);
    }
}
