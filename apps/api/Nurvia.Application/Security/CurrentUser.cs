namespace Nurvia.Application.Security;

public class CurrentUser
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsAuthenticated { get; set; }

    public bool HasRole(params string[] allowedRoles)
    {
        if (!IsAuthenticated || string.IsNullOrWhiteSpace(Role))
            return false;

        if (Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase))
            return true;

        if (Role.Equals("Administrator", StringComparison.OrdinalIgnoreCase))
        {
            if (allowedRoles.Length == 1 && allowedRoles[0].Equals("Superadmin", StringComparison.OrdinalIgnoreCase))
                return false;

            return true;
        }

        return allowedRoles.Any(r => r.Equals(Role, StringComparison.OrdinalIgnoreCase));
    }
}
