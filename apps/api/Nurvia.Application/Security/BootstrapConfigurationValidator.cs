namespace Nurvia.Application.Security;

/// <summary>
/// Runtime validation of the secure Superadmin bootstrap configuration.
///
/// The bootstrap path exists so a platform owner can be provisioned once during
/// an explicitly opted-in setup. It must never activate accidentally:
///  - In Development and Test it is permitted when credentials are explicitly configured.
///  - In Staging and Production it is rejected at startup, even when the operator
///    believes bootstrap is "disabled" but credentials are still present.
///  - Partial configuration is always rejected so no component silently falls back.
/// No bootstrap secret may ever appear in validation messages or logs.
/// </summary>
public static class BootstrapConfigurationValidator
{
    /// <summary>
    /// Environments in which the bootstrap opt-in is permitted.
    /// </summary>
    private static readonly string[] PermittedEnvironments = ["Development", "Test"];

    /// <summary>
    /// Validates a bootstrap configuration. Returns an empty list when bootstrap
    /// is securely configured (or intentionally not configured); otherwise
    /// returns the list of blocking errors. Messages never contain secret values.
    /// </summary>
    public static IReadOnlyList<string> Validate(
        string? environment, string? name, string? email, string? password)
    {
        var errors = new List<string>();
        var configured = !string.IsNullOrWhiteSpace(name) ||
                         !string.IsNullOrWhiteSpace(email) ||
                         !string.IsNullOrWhiteSpace(password);

        if (!configured)
        {
            // Bootstrap intentionally not configured — a permitted, safe state.
            return errors;
        }

        if (string.IsNullOrWhiteSpace(name) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            errors.Add(
                "BootstrapAdmin:Name, BootstrapAdmin:Email, and BootstrapAdmin:Password must be configured together.");
            return errors;
        }

        if (password.Length < 12)
        {
            errors.Add("BootstrapAdmin:Password must contain at least 12 characters.");
        }

        if (string.IsNullOrWhiteSpace(environment) ||
            !PermittedEnvironments.Contains(environment.Trim(), StringComparer.OrdinalIgnoreCase))
        {
            errors.Add(
                $"Superadmin bootstrap is only permitted in Development or Test. " +
                $"The current environment ('{environment ?? "unspecified"}') must not run bootstrap.");
        }

        return errors;
    }
}
