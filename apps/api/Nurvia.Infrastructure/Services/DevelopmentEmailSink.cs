using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using Nurvia.Application.Interfaces;

namespace Nurvia.Infrastructure.Services;

public sealed record CapturedDevEmail(
    string ToEmail,
    string RecipientName,
    string ResetUrl,
    DateTime SentAtUtc);

/// <summary>
/// Development-only email sink that captures password reset messages in memory
/// so local workflows and E2E tests can retrieve reset links without SMTP.
/// Never registered in Production.
/// </summary>
public sealed class DevelopmentEmailSink : IEmailSender
{
    private readonly ConcurrentQueue<CapturedDevEmail> _messages = new();
    private readonly ILogger<DevelopmentEmailSink> _logger;

    public DevelopmentEmailSink(ILogger<DevelopmentEmailSink> logger)
    {
        _logger = logger;
    }

    public Task SendPasswordResetEmailAsync(
        string toEmail,
        string recipientName,
        string resetUrl,
        CancellationToken cancellationToken = default)
    {
        var entry = new CapturedDevEmail(toEmail, recipientName, resetUrl, DateTime.UtcNow);
        _messages.Enqueue(entry);

        while (_messages.Count > 50 && _messages.TryDequeue(out _))
        {
        }

        _logger.LogInformation("Captured development password reset email for {Email}.", toEmail);
        return Task.CompletedTask;
    }

    public IReadOnlyList<CapturedDevEmail> GetMessages() => _messages.Reverse().ToArray();

    public void Clear()
    {
        while (_messages.TryDequeue(out _))
        {
        }
    }
}
