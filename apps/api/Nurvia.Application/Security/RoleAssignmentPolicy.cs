namespace Nurvia.Application.Security;

/// <summary>
/// Central, backend-enforced policy for role assignment.
/// Non-negotiable invariant: only an authenticated Superadmin may assign the
/// Superadmin role. An Administrator must never be able to elevate any account
/// to Superadmin. Every role-assignment path must route through this policy.
/// </summary>
public static class RoleAssignmentPolicy
{
    /// <summary>
    /// Roles that may be assigned by authorized callers. Superadmin is handled
    /// by the dedicated rule below and therefore excluded from this list.
    /// </summary>
    private static readonly string[] AssignableNonSuperadminRoles =
    [
        "Learner", "Instructor", "Author", "Reviewer", "Publisher", "Administrator"
    ];

    /// <summary>
    /// Determines whether a caller with the given role may assign the requested role.
    /// The comparison is case-insensitive so that casing tricks cannot bypass the rule.
    /// </summary>
    public static bool CanAssign(string? callerRole, string? requestedRole)
    {
        if (string.IsNullOrWhiteSpace(callerRole) || string.IsNullOrWhiteSpace(requestedRole))
        {
            return false;
        }

        var isSuperadminCaller = callerRole.Equals("Superadmin", StringComparison.OrdinalIgnoreCase);
        var isAdministratorCaller = callerRole.Equals("Administrator", StringComparison.OrdinalIgnoreCase);

        if (!isSuperadminCaller && !isAdministratorCaller)
        {
            return false;
        }

        if (requestedRole.Equals("Superadmin", StringComparison.OrdinalIgnoreCase))
        {
            // Only a Superadmin may create another Superadmin.
            return isSuperadminCaller;
        }

        return AssignableNonSuperadminRoles.Contains(
            requestedRole,
            StringComparer.OrdinalIgnoreCase);
    }
}
