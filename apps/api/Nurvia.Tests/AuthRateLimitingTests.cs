using System.Net;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Nurvia.Api.Controllers;
using Nurvia.Api.Security;
using Nurvia.Application.Common;
using Nurvia.Application.Security;
using Xunit;

namespace Nurvia.Tests;

public class AuthRateLimitingTests
{
    [Fact]
    public void AccountRateLimiter_Login_ThrottlesSameEmailCaseInsensitively()
    {
        using var limiter = new AccountRateLimiter(Options.Create(new AuthRateLimitOptions
        {
            LoginPermitLimitPerAccount = 2,
            LoginWindowSeconds = 60
        }));

        Assert.True(limiter.TryAcquireLogin("Nurse@Example.com").Allowed);
        Assert.True(limiter.TryAcquireLogin("  nurse@example.com ").Allowed);

        var blocked = limiter.TryAcquireLogin("NURSE@EXAMPLE.COM");
        Assert.False(blocked.Allowed);
        Assert.True(blocked.RetryAfterSeconds >= 1);

        // Distinct email remains unaffected
        Assert.True(limiter.TryAcquireLogin("other@example.com").Allowed);
    }

    [Fact]
    public void AccountRateLimiter_PasswordReset_ThrottlesAfterLimit()
    {
        using var limiter = new AccountRateLimiter(Options.Create(new AuthRateLimitOptions
        {
            PasswordResetPermitLimitPerAccount = 1,
            PasswordResetWindowSeconds = 300
        }));

        Assert.True(limiter.TryAcquirePasswordReset("user@example.com").Allowed);

        var blocked = limiter.TryAcquirePasswordReset("user@example.com");
        Assert.False(blocked.Allowed);
        Assert.True(blocked.RetryAfterSeconds >= 1);
    }

    [Fact]
    public async Task AuthController_Login_Returns429WithRetryAfter_WhenAccountLimitExceeded()
    {
        var authService = new Mock<IAuthService>();
        authService
            .Setup(s => s.AuthenticateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuthUserDto?)null);

        using var limiter = new AccountRateLimiter(Options.Create(new AuthRateLimitOptions
        {
            LoginPermitLimitPerAccount = 1,
            LoginWindowSeconds = 45
        }));

        var controller = new AuthController(
            authService.Object,
            Mock.Of<IJwtService>(),
            Mock.Of<IAntiforgery>(),
            Options.Create(new JwtSettings { ExpiryMinutes = 60 }),
            NullLogger<AuthController>.Instance,
            limiter)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var first = await controller.Login(
            new LoginRequest { Email = "learner@nurvia.test", Password = "wrong-password" },
            CancellationToken.None);
        Assert.IsType<UnauthorizedObjectResult>(first.Result);

        var second = await controller.Login(
            new LoginRequest { Email = "learner@nurvia.test", Password = "wrong-password" },
            CancellationToken.None);
        var statusResult = Assert.IsType<ObjectResult>(second.Result);
        Assert.Equal(StatusCodes.Status429TooManyRequests, statusResult.StatusCode);
        Assert.True(controller.Response.Headers.ContainsKey("Retry-After"));
        var payload = Assert.IsType<ApiResponse<AuthUserDto>>(statusResult.Value);
        Assert.False(payload.Success);
    }

    [Fact]
    public void GetClientIpPartitionKey_IgnoresUntrustedForwardedForHeader()
    {
        var context = new DefaultHttpContext();
        context.Connection.RemoteIpAddress = IPAddress.Parse("198.51.100.10");
        context.Request.Headers["X-Forwarded-For"] = "203.0.113.99";

        var key = AuthRateLimitingExtensions.GetClientIpPartitionKey(context);

        Assert.Equal("198.51.100.10", key);
    }
}
