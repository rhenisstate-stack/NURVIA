using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Nurvia.Api.Controllers;
using Nurvia.Application.Common;
using Nurvia.Application.Security;
using Nurvia.Application.Services;
using Nurvia.Domain.Accounts;
using Nurvia.Infrastructure.Persistence;
using System.Security.Claims;
using Xunit;

namespace Nurvia.Tests;

public class RbacUserManagementTests
{
    private static NurviaDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<NurviaDbContext>()
            .UseInMemoryDatabase($"nurvia_rbac_{Guid.NewGuid():N}")
            .Options;
        return new NurviaDbContext(options);
    }

    private static AuthController CreateController(IAuthService authService, string? callerRole)
    {
        var context = new DefaultHttpContext();
        if (!string.IsNullOrEmpty(callerRole))
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, callerRole)
            };
            context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer"));
        }

        return new AuthController(
            authService,
            Mock.Of<IJwtService>(),
            Mock.Of<IAntiforgery>(),
            Options.Create(new JwtSettings { ExpiryMinutes = 60 }),
            NullLogger<AuthController>.Instance)
        {
            ControllerContext = new ControllerContext { HttpContext = context }
        };
    }

    [Fact]
    public async Task GetUsersAsync_ReturnsNonSensitiveSummariesAndSupportsSearch()
    {
        await using var db = CreateInMemoryContext();
        var hasher = new Pbkdf2PasswordHasher();
        db.UserAccounts.AddRange(
            new UserAccount("Alice Learner", "alice@nurvia.test", hasher.Hash("SecretPass123!")),
            new UserAccount("Bob Author", "bob@nurvia.test", hasher.Hash("SecretPass123!")));
        await db.SaveChangesAsync();

        var service = new AuthService(db, hasher);
        var page = await service.GetUsersAsync("bob", 1, 10, CancellationToken.None);

        Assert.Equal(1, page.TotalCount);
        var item = Assert.Single(page.Items);
        Assert.Equal("bob@nurvia.test", item.Email);
        Assert.Equal("Learner", item.Role);
        Assert.True(item.IsActive);
    }

    [Fact]
    public async Task AuthController_GetUsers_ForbidsLearnerAndAllowsAdministrator()
    {
        await using var db = CreateInMemoryContext();
        var service = new AuthService(db, new Pbkdf2PasswordHasher());

        var learnerController = CreateController(service, "Learner");
        var learnerResult = await learnerController.GetUsers(cancellationToken: CancellationToken.None);
        Assert.IsType<ForbidResult>(learnerResult.Result);

        var adminController = CreateController(service, "Administrator");
        var adminResult = await adminController.GetUsers(cancellationToken: CancellationToken.None);
        var ok = Assert.IsType<OkObjectResult>(adminResult.Result);
        var payload = Assert.IsType<ApiResponse<PagedResult<AuthUserSummaryDto>>>(ok.Value);
        Assert.True(payload.Success);
    }

    [Fact]
    public async Task AuthController_AssignRole_PreventsAdministratorFromAssigningSuperadmin()
    {
        var authService = new Mock<IAuthService>();
        var adminController = CreateController(authService.Object, "Administrator");

        var result = await adminController.AssignRole(
            new AssignRoleRequest { TargetUserId = Guid.NewGuid().ToString(), Role = "Superadmin" },
            CancellationToken.None);

        Assert.IsType<ForbidResult>(result.Result);
        authService.Verify(
            s => s.AssignRoleAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
