using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using Nurvia.Api.Common;
using Nurvia.Api.Security;
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

public sealed class ForgotPasswordRequest
{
    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; set; } = string.Empty;
}

public sealed class ResetPasswordRequest
{
    [Required, MinLength(16), MaxLength(512)]
    public string Token { get; set; } = string.Empty;

    [Required, MinLength(12), MaxLength(256)]
    public string NewPassword { get; set; } = string.Empty;
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
    private readonly IAccountRateLimiter? _accountRateLimiter;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IJwtService jwtService,
        IAntiforgery antiforgery,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthController> logger,
        IAccountRateLimiter? accountRateLimiter = null)
    {
        _authService = authService;
        _jwtService = jwtService;
        _antiforgery = antiforgery;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
        _accountRateLimiter = accountRateLimiter;
    }

    [HttpGet("csrf")]
    public ActionResult<ApiResponse<string>> GetCsrfToken()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(ApiResponse<string>.Ok(tokens.RequestToken ?? string.Empty));
    }

    [HttpPost("register")]
    [EnableRateLimiting(AuthRateLimitingExtensions.RegisterIpPolicy)]
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
    [EnableRateLimiting(AuthRateLimitingExtensions.LoginIpPolicy)]
    public async Task<ActionResult<ApiResponse<AuthUserDto>>> Login(
        [FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (_accountRateLimiter is not null)
        {
            var (allowed, retryAfterSeconds) = _accountRateLimiter.TryAcquireLogin(request.Email);
            if (!allowed)
            {
                Response.Headers.RetryAfter = retryAfterSeconds.ToString();
                return StatusCode(
                    StatusCodes.Status429TooManyRequests,
                    ApiResponse<AuthUserDto>.Error("Too many sign-in attempts. Please try again later."));
            }
        }

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

        var firstName = request.FirstName.Trim();
        if (firstName.Length is < 2 or > 200)
            return BadRequest(ApiResponse<AuthUserDto>.Error("First name must contain between 2 and 200 characters."));

        var user = await _authService.UpdateProfileAsync(currentUser.Id, firstName, cancellationToken);
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

    [HttpPost("forgot-password")]
    [EnableRateLimiting(AuthRateLimitingExtensions.PasswordResetIpPolicy)]
    public async Task<ActionResult<ApiResponse<string>>> ForgotPassword(
        [FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        if (_accountRateLimiter is not null)
        {
            var (allowed, retryAfterSeconds) = _accountRateLimiter.TryAcquirePasswordReset(request.Email);
            if (!allowed)
            {
                Response.Headers.RetryAfter = retryAfterSeconds.ToString();
                return StatusCode(
                    StatusCodes.Status429TooManyRequests,
                    ApiResponse<string>.Error("Too many password reset requests. Please try again later."));
            }
        }

        var origin = Request.Headers.Origin.FirstOrDefault();
        var baseUrl = !string.IsNullOrWhiteSpace(origin) && Uri.TryCreate(origin, UriKind.Absolute, out _)
            ? $"{origin.TrimEnd('/')}/reset-password"
            : $"{Request.Scheme}://{Request.Host}/reset-password";

        await _authService.RequestPasswordResetAsync(request.Email, baseUrl, cancellationToken);

        return Accepted(ApiResponse<string>.Ok(
            "If an account with that email exists, password reset instructions have been sent."));
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting(AuthRateLimitingExtensions.PasswordResetIpPolicy)]
    public async Task<ActionResult<ApiResponse<string>>> ResetPassword(
        [FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var updated = await _authService.ResetPasswordAsync(request.Token, request.NewPassword, cancellationToken);
        if (!updated)
            return BadRequest(ApiResponse<string>.Error("The password reset token is invalid or has expired."));

        ClearSessionCookie();
        return Ok(ApiResponse<string>.Ok("Your password has been reset. You may now sign in."));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<PagedResult<AuthUserSummaryDto>>>> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken cancellationToken = default)
    {
        var caller = HttpContext.GetCurrentUser();
        if (!caller.IsAuthenticated)
            return Unauthorized(ApiResponse<PagedResult<AuthUserSummaryDto>>.Error("Authentication is required."));

        if (!string.Equals(caller.Role, "Administrator", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(caller.Role, "Superadmin", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var result = await _authService.GetUsersAsync(search, pageNumber, pageSize, cancellationToken);
        return Ok(ApiResponse<PagedResult<AuthUserSummaryDto>>.Ok(result));
    }

    [HttpPost("assign-role")]
    public async Task<ActionResult<ApiResponse<string>>> AssignRole(
        [FromBody] AssignRoleRequest request, CancellationToken cancellationToken)
    {
        var caller = HttpContext.GetCurrentUser();
        if (!caller.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required to assign user roles."));

        if (!RoleAssignmentPolicy.CanAssign(caller.Role, request.Role))
        {
            return Forbid();
        }

        var assigned = await _authService.AssignRoleAsync(
            request.TargetUserId, request.Role, caller.Id, caller.Role, cancellationToken);
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
