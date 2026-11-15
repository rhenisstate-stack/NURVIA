using Microsoft.Extensions.Logging;
using Nurvia.Application.Interfaces;

namespace Nurvia.Infrastructure.Services;

/// <summary>
/// Safe fallback email sender when no external SMTP/transactional provider is configured.
/// Never logs reset tokens or full reset URLs.
/// </summary>
public sealed class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;

    public LoggingEmailSender(ILogger<LoggingEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendPasswordResetEmailAsync(
        string toEmail,
        string recipientName,
        string resetUrl,
        CancellationToken cancellationToken = default)
    {
        var atIndex = toEmail.IndexOf('@');
        var domain = atIndex >= 0 && atIndex < toEmail.Length - 1
            ? toEmail[(atIndex + 1)..]
            : "unknown";

        _logger.LogInformation(
            "Password reset email queued via LoggingEmailSender for domain '{EmailDomain}'. Configure an SMTP/email provider for production delivery.",
            domain);

        return Task.CompletedTask;
    }
}
