using Microsoft.AspNetCore.Mvc;
using Nurvia.Application.Common;
using Nurvia.Application.Security;
using Nurvia.Api.Common;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<UserProfileDto>.Error("Authentication is required."));

        var profile = await _profileService.GetProfileAsync(currentUser.Id, cancellationToken);
        if (profile == null)
            return NotFound(ApiResponse<UserProfileDto>.Error("Profile not found."));

        return Ok(ApiResponse<UserProfileDto>.Ok(profile));
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<UpdateProfileResponse>>> UpdateProfile(
        [FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<UpdateProfileResponse>.Error("Authentication is required."));

        var response = await _profileService.UpdateProfileAsync(currentUser.Id, request, cancellationToken);

        if (string.IsNullOrEmpty(response.Message))
        {
            return BadRequest(ApiResponse<UpdateProfileResponse>.Error("Failed to update profile."));
        }

        return Ok(ApiResponse<UpdateProfileResponse>.Ok(response, response.Message));
    }
}