namespace Nurvia.Application.Interfaces;

public interface IEmailSender
{
    Task SendPasswordResetEmailAsync(
        string toEmail,
        string recipientName,
        string resetUrl,
        CancellationToken cancellationToken = default);
}
