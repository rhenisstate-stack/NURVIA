namespace Nurvia.Api.Common;

public class CurrentUser
{
    public string Id { get; set; } = "admin-01";
    public string Name { get; set; } = "Lead Nurse Educator";
    public string Role { get; set; } = "Administrator"; // Author, Reviewer, Publisher, Administrator
}

public static class HttpContextExtensions
{
    public static CurrentUser GetCurrentUser(this HttpContext context)
    {
        var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
        var id = context.Request.Headers["X-User-Id"].FirstOrDefault();
        var name = context.Request.Headers["X-User-Name"].FirstOrDefault();

        return new CurrentUser
        {
            Id = !string.IsNullOrWhiteSpace(id) ? id : "usr-admin-default",
            Name = !string.IsNullOrWhiteSpace(name) ? name : "Clinical Content Director",
            Role = !string.IsNullOrWhiteSpace(role) ? role : "Administrator"
        };
    }

    public static bool HasRole(this HttpContext context, params string[] allowedRoles)
    {
        var user = context.GetCurrentUser();
        if (user.Role.Equals("Administrator", StringComparison.OrdinalIgnoreCase))
            return true;

        return allowedRoles.Any(r => r.Equals(user.Role, StringComparison.OrdinalIgnoreCase));
    }
}
