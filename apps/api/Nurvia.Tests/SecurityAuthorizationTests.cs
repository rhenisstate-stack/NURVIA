using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Nurvia.Api.Common;
using Nurvia.Api.Controllers;
using Nurvia.Api.Security;
using Nurvia.Application.Questions;
using Xunit;

namespace Nurvia.Tests;

public class SecurityAuthorizationTests
{
    private readonly IJwtService _jwtService;
    private readonly JwtSettings _jwtSettings;

    public SecurityAuthorizationTests()
    {
        _jwtSettings = new JwtSettings
        {
            Secret = "NurviaSecretKeyForJwtTokenGeneration2026!ExamPlatformSecureToken",
            Issuer = "NurviaApi",
            Audience = "NurviaWeb",
            ExpiryMinutes = 60
        };

        var optionsMock = new Mock<IOptions<JwtSettings>>();
        optionsMock.Setup(o => o.Value).Returns(_jwtSettings);
        _jwtService = new JwtService(optionsMock.Object);
    }

    [Fact]
    public void Unauthenticated_UserContext_Returns_NotAuthenticated_And_Empty_Role()
    {
        var context = new DefaultHttpContext();

        var currentUser = context.GetCurrentUser();

        Assert.False(currentUser.IsAuthenticated);
        Assert.Equal(string.Empty, currentUser.Id);
        Assert.Equal(string.Empty, currentUser.Role);
        Assert.False(context.HasRole("Administrator"));
        Assert.False(context.HasRole("Author"));
        Assert.False(context.HasRole("Learner"));
    }

    [Fact]
    public void Untrusted_Role_Headers_Are_Completely_Ignored_DEF002_Remediation()
    {
        var context = new DefaultHttpContext();
        context.Request.Headers["X-User-Role"] = "Administrator";
        context.Request.Headers["X-User-Id"] = "hacker-99";
        context.Request.Headers["X-User-Name"] = "Attacker Impersonating Admin";

        var currentUser = context.GetCurrentUser();

        Assert.False(currentUser.IsAuthenticated);
        Assert.Equal(string.Empty, currentUser.Id);
        Assert.Equal(string.Empty, currentUser.Role);
        Assert.False(context.HasRole("Administrator"));
    }

    [Fact]
    public void JwtService_Generates_And_Validates_Cryptographically_Signed_Tokens()
    {
        var authUser = new AuthUser
        {
            Id = "usr-author-77",
            Name = "Dr. Author",
            Email = "author@nurvia.internal",
            Role = "Author"
        };

        var token = _jwtService.GenerateToken(authUser);
        Assert.NotNull(token);
        Assert.Equal(3, token.Split('.').Length);

        var principal = _jwtService.ValidateToken(token);
        Assert.NotNull(principal);
        Assert.True(principal.Identity?.IsAuthenticated);
        Assert.Equal("usr-author-77", principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("Author", principal.FindFirstValue(ClaimTypes.Role));
        Assert.Equal("author@nurvia.internal", principal.FindFirstValue(ClaimTypes.Email));
    }

    [Fact]
    public void Tampered_Jwt_Token_Fails_Validation()
    {
        var authUser = new AuthUser
        {
            Id = "usr-learner-01",
            Name = "Student Alex",
            Email = "student@nurvia.internal",
            Role = "Learner"
        };

        var token = _jwtService.GenerateToken(authUser);
        var parts = token.Split('.');

        // Tamper with payload (substitute second part with forged role)
        var tamperedToken = $"{parts[0]}.eyJyZXNwb25zZSI6ImZvcmdlZCIsInJvbGUiOiJTdXBlcmFkbWluIn0.{parts[2]}";

        var principal = _jwtService.ValidateToken(tamperedToken);
        Assert.Null(principal);
    }

    [Fact]
    public void Expired_Jwt_Token_Fails_Validation()
    {
        var authUser = new AuthUser
        {
            Id = "usr-learner-expired",
            Name = "Expired Session",
            Email = "expired@nurvia.internal",
            Role = "Learner"
        };

        // Negative expiry time simulates expired token
        var expiredToken = _jwtService.GenerateToken(authUser, TimeSpan.FromSeconds(-10));

        var principal = _jwtService.ValidateToken(expiredToken);
        Assert.Null(principal);
    }

    [Fact]
    public void Administrator_Cannot_Assign_Or_Elevate_To_Superadmin_Role()
    {
        var loggerMock = new Mock<ILogger<AuthController>>();
        var controller = new AuthController(_jwtService, loggerMock.Object);

        // Simulate request authenticated as standard Administrator
        var httpContext = new DefaultHttpContext();
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "usr-admin-01"),
            new(ClaimTypes.Name, "Lead Nurse Administrator"),
            new(ClaimTypes.Role, "Administrator")
        };
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer"));
        controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
        {
            HttpContext = httpContext
        };

        // Administrator attempts to assign Superadmin role
        var request = new AssignRoleRequest
        {
            TargetUserId = "usr-candidate-02",
            Role = "Superadmin"
        };

        var result = controller.AssignRole(request);
        var objectResult = Assert.IsType<Microsoft.AspNetCore.Mvc.ObjectResult>(result.Result);

        Assert.Equal(403, objectResult.StatusCode);
    }

    [Fact]
    public void Superadmin_Can_Successfully_Assign_Roles()
    {
        var loggerMock = new Mock<ILogger<AuthController>>();
        var controller = new AuthController(_jwtService, loggerMock.Object);

        // Simulate request authenticated as Superadmin
        var httpContext = new DefaultHttpContext();
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "usr-superadmin-01"),
            new(ClaimTypes.Name, "Superadmin Officer"),
            new(ClaimTypes.Role, "Superadmin")
        };
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer"));
        controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
        {
            HttpContext = httpContext
        };

        var request = new AssignRoleRequest
        {
            TargetUserId = "usr-admin-02",
            Role = "Administrator"
        };

        var result = controller.AssignRole(request);
        var okResult = Assert.IsType<Microsoft.AspNetCore.Mvc.OkObjectResult>(result.Result);

        Assert.Equal(200, okResult.StatusCode);
    }

    [Fact]
    public void Active_Exam_Question_And_Option_DTOs_Never_Expose_Answer_Key_Or_Rationales()
    {
        // Reflection test proving contract guarantees
        var optionType = typeof(ActiveExamOptionDto);
        var isCorrectProp = optionType.GetProperty("IsCorrect");
        var specificRationaleProp = optionType.GetProperty("SpecificRationale");

        Assert.Null(isCorrectProp);
        Assert.Null(specificRationaleProp);

        var questionType = typeof(ActiveExamQuestionDto);
        var generalRationaleProp = questionType.GetProperty("GeneralRationale");

        Assert.Null(generalRationaleProp);
    }
}
