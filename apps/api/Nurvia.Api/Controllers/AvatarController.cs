using Microsoft.AspNetCore.Mvc;
using Nurvia.Application.Common;
using Nurvia.Application.Security;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AvatarController : ControllerBase
{
    private readonly IAvatarService _avatarService;

    public AvatarController(IAvatarService avatarService)
    {
        _avatarService = avatarService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AvatarUploadResponse>>> UploadAvatar(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<AvatarUploadResponse>.Error("Authentication is required."));

        // Note: In a real implementation, we would read the uploaded file from the request
        // For now, we'll return a placeholder response
        return Ok(ApiResponse<AvatarUploadResponse>.Ok(
            new AvatarUploadResponse { 
                StorageKey = "avatar_" + currentUser.Id, 
                Message = "Avatar uploaded successfully" 
            }));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<AvatarDto>>> GetAvatar(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<AvatarDto>.Error("Authentication is required."));

        // Note: In a real implementation, we would retrieve the avatar from storage
        // For now, we'll return a placeholder response
        return Ok(ApiResponse<AvatarDto>.Ok(
            new AvatarDto { 
                StorageKey = "avatar_" + currentUser.Id, 
                Url = $"/api/avatar/{currentUser.Id}",
                UploadedAtUtc = DateTime.UtcNow 
            }));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<string>>> RemoveAvatar(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        // Note: In a real implementation, we would remove the avatar from storage
        // For now, we'll return a placeholder response
        return Ok(ApiResponse<string>.Ok("Avatar removed successfully"));
    }
}