using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Nurvia.Api.Common;
using Nurvia.Application.Common;
using Nurvia.Application.Security;
using Nurvia.Application.Services;

namespace Nurvia.Api.Controllers;

public sealed class CreateInvitationRequest
{
    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string Role { get; set; } = string.Empty;
}

public sealed class AcceptInvitationRequest
{
    [Required, MinLength(16), MaxLength(256)]
    public string Token { get; set; } = string.Empty;

    [Required, StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, MinLength(12), MaxLength(256)]
    public string Password { get; set; } = string.Empty;
}

[ApiController]
[Route("api/auth/invitations")]
public sealed class StaffInvitationsController : ControllerBase
{
    private readonly IStaffInvitationService _service;
    private readonly IHostEnvironment _env;

    public StaffInvitationsController(IStaffInvitationService service, IHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StaffInvitationDto>>>> GetInvitations(CancellationToken ct = default)
    {
        var caller = HttpContext.GetCurrentUser();
        if (!caller.IsAuthenticated)
            return Unauthorized(ApiResponse<IReadOnlyList<StaffInvitationDto>>.Error("Authentication is required."));

        if (!string.Equals(caller.Role, "Administrator", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(caller.Role, "Superadmin", StringComparison.OrdinalIgnoreCase))
            return Forbid();

        var items = await _service.GetInvitationsAsync(ct);
        return Ok(ApiResponse<IReadOnlyList<StaffInvitationDto>>.Ok(items));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CreateStaffInvitationResult>>> CreateInvitation(
        [FromBody] CreateInvitationRequest request,
        CancellationToken ct = default)
    {
        var caller = HttpContext.GetCurrentUser();
        if (!caller.IsAuthenticated)
            return Unauthorized(ApiResponse<CreateStaffInvitationResult>.Error("Authentication is required."));

        if (!string.Equals(caller.Role, "Administrator", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(caller.Role, "Superadmin", StringComparison.OrdinalIgnoreCase))
            return Forbid();

        if (!RoleAssignmentPolicy.CanAssign(caller.Role, request.Role))
            return Forbid();

        var includeToken = _env.IsDevelopment() || _env.IsEnvironment("Test");
        var (result, error) = await _service.CreateInvitationAsync(
            request.Email, request.Role, caller.Id, caller.Role, includeToken, ct);
        if (error is not null || result is null)
            return BadRequest(ApiResponse<CreateStaffInvitationResult>.Error(error ?? "Unable to create invitation."));

        return Ok(ApiResponse<CreateStaffInvitationResult>.Ok(result, "Staff invitation created."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> RevokeInvitation(Guid id, CancellationToken ct = default)
    {
        var caller = HttpContext.GetCurrentUser();
        if (!caller.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        if (!string.Equals(caller.Role, "Administrator", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(caller.Role, "Superadmin", StringComparison.OrdinalIgnoreCase))
            return Forbid();

        var revoked = await _service.RevokeInvitationAsync(id, caller.Id, ct);
        if (!revoked)
            return NotFound(ApiResponse<string>.Error("Active invitation not found."));

        return Ok(ApiResponse<string>.Ok("Invitation revoked."));
    }

    [HttpPost("accept")]
    public async Task<ActionResult<ApiResponse<string>>> AcceptInvitation(
        [FromBody] AcceptInvitationRequest request,
        CancellationToken ct = default)
    {
        var (success, error) = await _service.AcceptInvitationAsync(request.Token, request.Name, request.Password, ct);
        if (!success)
            return BadRequest(ApiResponse<string>.Error(error ?? "Unable to accept invitation."));

        return Ok(ApiResponse<string>.Ok("Invitation accepted. You may now sign in with your new staff account."));
    }
}
