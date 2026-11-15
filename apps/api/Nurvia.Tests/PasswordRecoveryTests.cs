using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Nurvia.Api.Controllers;
using Nurvia.Api.Security;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Domain.Accounts;
using Nurvia.Infrastructure.Persistence;
using Xunit;

namespace Nurvia.Tests;

public class PasswordRecoveryTests
{
    private static NurviaDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseInMemoryDatabase($"nurvia_pwd_reset_{Guid.NewGuid():N}")
            .Options;
        return new NurviaDbContext(options);
    }

    [Fact]
    public async Task RequestPasswordReset_UnknownOrInactiveAccount_DoesNotIssueTokenOrSendEmail()
    {
        await using var db = CreateInMemoryContext();
        var hasher = new Pbkdf2PasswordHasher();
        var inactive = new UserAccount("Inactive Nurse", "inactive@nurvia.test", hasher.Hash("InitialStrongPass123!"));
        inactive.Deactivate("admin");
        db.UserAccounts.Add(inactive);
        await db.SaveChangesAsync();

        var emailSender = new Mock<IEmailSender>();
        var service = new AuthService(db, hasher, emailSender.Object);

        await service.RequestPasswordResetAsync("missing@nurvia.test", "https://app.nurvia.test/reset-password", CancellationToken.None);
        await service.RequestPasswordResetAsync("inactive@nurvia.test", "https://app.nurvia.test/reset-password", CancellationToken.None);

        Assert.Empty(db.PasswordResetTokens);
        emailSender.Verify(
            e => e.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task PasswordReset_FullLifecycle_HashesToken_UpdatesPassword_AndEnforcesSingleUse()
    {
        await using var db = CreateInMemoryContext();
        var hasher = new Pbkdf2PasswordHasher();
        var user = new UserAccount("Jane Nurse", "jane@nurvia.test", hasher.Hash("OldStrongPass123!"));
        db.UserAccounts.Add(user);
        await db.SaveChangesAsync();

        string? capturedUrl = null;
        var emailSender = new Mock<IEmailSender>();
        emailSender
            .Setup(e => e.SendPasswordResetEmailAsync("jane@nurvia.test", "Jane Nurse", It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, string, string, CancellationToken>((_, _, url, _) => capturedUrl = url)
            .Returns(Task.CompletedTask);

        var auditService = new Mock<IAuditService>();
        var service = new AuthService(db, hasher, emailSender.Object, auditService.Object);

        await service.RequestPasswordResetAsync("JANE@nurvia.test", "https://app.nurvia.test/reset-password", CancellationToken.None);

        Assert.NotNull(capturedUrl);
        var tokenIndex = capturedUrl!.IndexOf("token=", StringComparison.Ordinal);
        Assert.True(tokenIndex >= 0);
        var rawToken = Uri.UnescapeDataString(capturedUrl[(tokenIndex + "token=".Length)..]);

        var storedToken = await db.PasswordResetTokens.SingleAsync();
        Assert.NotEqual(rawToken, storedToken.TokenHash);
        Assert.Equal(AuthService.HashResetToken(rawToken), storedToken.TokenHash);

        // Complete reset
        var resetOk = await service.ResetPasswordAsync(rawToken, "NewStrongPass456!", CancellationToken.None);
        Assert.True(resetOk);

        // Old password no longer authenticates; new password does
        Assert.Null(await service.AuthenticateAsync("jane@nurvia.test", "OldStrongPass123!", CancellationToken.None));
        Assert.NotNull(await service.AuthenticateAsync("jane@nurvia.test", "NewStrongPass456!", CancellationToken.None));

        // Reusing the same token must fail
        var reuseOk = await service.ResetPasswordAsync(rawToken, "AnotherPass789!", CancellationToken.None);
        Assert.False(reuseOk);

        auditService.Verify(
            a => a.LogAsync("UserAccount", user.Id.ToString(), "PasswordResetRequested", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Once);
        auditService.Verify(
            a => a.LogAsync("UserAccount", user.Id.ToString(), "PasswordResetCompleted", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ResetPassword_ExpiredToken_ReturnsFalse()
    {
        await using var db = CreateInMemoryContext();
        var hasher = new Pbkdf2PasswordHasher();
        var user = new UserAccount("Expired User", "expired@nurvia.test", hasher.Hash("OldStrongPass123!"));
        db.UserAccounts.Add(user);

        var rawToken = "expired-raw-token-value-123456";
        db.PasswordResetTokens.Add(new PasswordResetToken(
            user.Id,
            AuthService.HashResetToken(rawToken),
            DateTime.UtcNow.AddMinutes(-5)));
        await db.SaveChangesAsync();

        var service = new AuthService(db, hasher);
        var ok = await service.ResetPasswordAsync(rawToken, "NewStrongPass456!", CancellationToken.None);

        Assert.False(ok);
    }

    [Fact]
    public async Task AuthController_ForgotPassword_AlwaysReturns202Accepted()
    {
        var authService = new Mock<IAuthService>();
        var controller = new AuthController(
            authService.Object,
            Mock.Of<IJwtService>(),
            Mock.Of<IAntiforgery>(),
            Options.Create(new JwtSettings { ExpiryMinutes = 60 }),
            NullLogger<AuthController>.Instance)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
        controller.HttpContext.Request.Scheme = "https";
        controller.HttpContext.Request.Host = new HostString("localhost:3000");

        var result = await controller.ForgotPassword(
            new ForgotPasswordRequest { Email = "anyone@nurvia.test" },
            CancellationToken.None);

        var accepted = Assert.IsType<AcceptedResult>(result.Result);
        var payload = Assert.IsType<ApiResponse<string>>(accepted.Value);
        Assert.True(payload.Success);
    }
}
