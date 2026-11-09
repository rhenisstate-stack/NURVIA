using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Security;

namespace Nurvia.Api.Controllers;

public sealed class LoginRequest
{
    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(1), MaxLength(256)]
    public string Password { get; set; } = string.Empty;
}

public sealed class SignUpRequest
{
    [Required, StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(12), MaxLength(256)]
    public string Password { get; set; } = string.Empty;
}

public sealed class AssignRoleRequest
{
    [Required]
    public string TargetUserId { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string Role { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private const string SessionCookieName = "nurvia_session";
    private readonly IAuthService _authService;
    private readonly IJwtService _jwtService;
    private readonly IAntiforgery _antiforgery;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IJwtService jwtService,
        IAntiforgery antiforgery,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _jwtService = jwtService;
        _antiforgery = antiforgery;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    [HttpGet("csrf")]
    public ActionResult<ApiResponse<string>> GetCsrfToken()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(ApiResponse<string>.Ok(tokens.RequestToken ?? string.Empty));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<string>>> Register(
        [FromBody] SignUpRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.RegisterAsync(new RegistrationRequest
            {
                Name = request.Name,
                Email = request.Email,
                Password = request.Password
            }, cancellationToken);
        }
        catch (DbUpdateException ex) when (
            ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            _logger.LogInformation("Registration attempted for an already registered email address.");
        }

        return Accepted(ApiResponse<string>.Ok(
            "If an account can be created with these details, it is ready to sign in."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthUserDto>>> Login(
        [FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _authService.AuthenticateAsync(
            request.Email, request.Password, cancellationToken);
        if (user == null)
            return Unauthorized(ApiResponse<AuthUserDto>.Error("Invalid email or password."));

        var token = _jwtService.GenerateToken(new AuthUser
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        });

        Response.Cookies.Append(SessionCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes)
        });

        return Ok(ApiResponse<AuthUserDto>.Ok(user, "Authentication successful."));
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<AuthUserDto>>> GetCurrentUser(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<AuthUserDto>.Error("User is not authenticated."));

        var user = await _authService.GetUserAsync(currentUser.Id, cancellationToken);
        if (user == null)
        {
            ClearSessionCookie();
            return Unauthorized(ApiResponse<AuthUserDto>.Error("User is not authenticated."));
        }

        return Ok(ApiResponse<AuthUserDto>.Ok(user));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<AuthUserDto>>> UpdateProfile(
        [FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<AuthUserDto>.Error("Authentication is required."));

        var name = request.Name.Trim();
        if (name.Length is < 2 or > 200)
            return BadRequest(ApiResponse<AuthUserDto>.Error("Name must contain between 2 and 200 characters."));

        var user = await _authService.UpdateProfileAsync(currentUser.Id, name, cancellationToken);
        if (user == null)
            return Unauthorized(ApiResponse<AuthUserDto>.Error("User is not authenticated."));

        return Ok(ApiResponse<AuthUserDto>.Ok(user, "Profile updated successfully."));
    }

    [HttpPost("logout")]
    public ActionResult<ApiResponse<string>> Logout()
    {
        ClearSessionCookie();
        return Ok(ApiResponse<string>.Ok("Signed out successfully."));
    }

    [HttpPost("assign-role")]
    public async Task<ActionResult<ApiResponse<string>>> AssignRole(
        [FromBody] AssignRoleRequest request, CancellationToken cancellationToken)
    {
        var caller = HttpContext.GetCurrentUser();
        if (!caller.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required to assign user roles."));

        if (!caller.Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase) &&
            !caller.Role.Equals("Administrator", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        if (request.Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase) &&
            !caller.Role.Equals("Superadmin", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var assigned = await _authService.AssignRoleAsync(
            request.TargetUserId, request.Role, caller.Id, cancellationToken);
        if (!assigned)
            return BadRequest(ApiResponse<string>.Error("The requested account or role is invalid."));

        _logger.LogInformation(
            "Role '{Role}' assigned to user '{TargetUserId}' by '{CallerId}'.",
            request.Role, request.TargetUserId, caller.Id);
        return Ok(ApiResponse<string>.Ok("Role assigned successfully."));
    }

    private void ClearSessionCookie()
    {
        Response.Cookies.Delete(SessionCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });
    }
}
