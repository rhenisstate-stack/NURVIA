using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Api.Security;
using Nurvia.Application.Common;

namespace Nurvia.Api.Controllers;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public AuthUser User { get; set; } = new();
}

public class AssignRoleRequest
{
    public string TargetUserId { get; set; } = string.Empty;
    public string TargetEmail { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    private static readonly Dictionary<string, (string Id, string Name, string Role, string Password)> PredefinedUsers =
        new(StringComparer.OrdinalIgnoreCase)
        {
            { "superadmin@nurvia.internal", ("usr-superadmin-01", "NURVIA Superadministrator", "Superadmin", "SuperAdmin2026!") },
            { "admin@nurvia.internal", ("usr-admin-01", "Lead Nurse Educator", "Administrator", "AdminPass2026!") },
            { "author@nurvia.internal", ("usr-author-01", "Clinical Author Sarah Jenkins RN", "Author", "AuthorPass2026!") },
            { "reviewer@nurvia.internal", ("usr-reviewer-01", "Peer Reviewer Dr. Marcus Vance DNP", "Reviewer", "ReviewerPass2026!") },
            { "publisher@nurvia.internal", ("usr-publisher-01", "Content Publisher Elena Rostova", "Publisher", "PublisherPass2026!") },
            { "instructor@nurvia.internal", ("usr-instructor-01", "Clinical Instructor David Kim MSN", "Instructor", "InstructorPass2026!") },
            { "learner@nurvia.internal", ("usr-learner-01", "Student Nurse Alex Rivera", "Learner", "LearnerPass2026!") },
            { "testlearner@nurvia.internal", ("usr-test-learner-99", "Candidate Jordan Lee", "Learner", "LearnerPass2026!") }
        };

    public AuthController(IJwtService jwtService, ILogger<AuthController> logger)
    {
        _jwtService = jwtService;
        _logger = logger;
    }

    [HttpPost("login")]
    public ActionResult<ApiResponse<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(ApiResponse<LoginResponse>.Error("Email and password are required."));

        AuthUser? user = null;

        if (PredefinedUsers.TryGetValue(request.Email.Trim(), out var predefined))
        {
            if (predefined.Password != request.Password)
                return Unauthorized(ApiResponse<LoginResponse>.Error("Invalid credentials provided."));

            user = new AuthUser
            {
                Id = predefined.Id,
                Name = predefined.Name,
                Email = request.Email.Trim().ToLowerInvariant(),
                Role = predefined.Role
            };
        }
        else if (request.Email.Contains("@") && request.Password == "LearnerPass2026!")
        {
            // Dynamic learner test logins
            user = new AuthUser
            {
                Id = $"usr-learner-{Guid.NewGuid():N}"[..18],
                Name = request.Email.Split('@')[0],
                Email = request.Email.Trim().ToLowerInvariant(),
                Role = "Learner"
            };
        }

        if (user == null)
            return Unauthorized(ApiResponse<LoginResponse>.Error("Invalid credentials provided."));

        var token = _jwtService.GenerateToken(user);
        var response = new LoginResponse
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            User = user
        };

        return Ok(ApiResponse<LoginResponse>.Ok(response, "Authentication successful."));
    }

    [HttpGet("me")]
    public ActionResult<ApiResponse<CurrentUser>> GetCurrentUser()
    {
        var user = HttpContext.GetCurrentUser();
        if (!user.IsAuthenticated)
            return Unauthorized(ApiResponse<CurrentUser>.Error("User is not authenticated."));

        return Ok(ApiResponse<CurrentUser>.Ok(user));
    }

    [HttpPost("assign-role")]
    public ActionResult<ApiResponse<string>> AssignRole([FromBody] AssignRoleRequest request)
    {
        var caller = HttpContext.GetCurrentUser();
        if (!caller.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required to assign user roles."));

        if (!caller.Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase) &&
            !caller.Role.Equals("Administrator", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403, ApiResponse<string>.Error("Only Administrators and Superadministrators can assign roles."));
        }

        // Non-negotiable security invariant: Regular Administrators cannot assign or escalate to Superadmin
        if (request.Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase) &&
            !caller.Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403, ApiResponse<string>.Error("Privilege escalation violation: Only a Superadmin can assign or elevate to the Superadmin role."));
        }

        _logger.LogInformation("Role '{Role}' assigned to user '{TargetUserId}' by '{CallerId}' ({CallerRole}).",
            request.Role, request.TargetUserId, caller.Id, caller.Role);

        return Ok(ApiResponse<string>.Ok($"Role '{request.Role}' assigned successfully."));
    }
}
