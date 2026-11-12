using Microsoft.AspNetCore.Mvc;
using Nurvia.Application.Common;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Api.Common;

namespace Nurvia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AvatarController : ControllerBase
{
    private readonly IAvatarService _avatarService;
    private readonly IFileStorageService _fileStorageService;

    public AvatarController(
        IAvatarService avatarService,
        IFileStorageService fileStorageService)
    {
        _avatarService = avatarService;
        _fileStorageService = fileStorageService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AvatarUploadResponse>>> UploadAvatar(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<AvatarUploadResponse>.Error("Authentication is required."));

        // Check if file was uploaded
        var file = Request.Form.Files["file"];
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<AvatarUploadResponse>.Error("No file was uploaded."));
        }

        // Process the avatar upload
        var response = await _avatarService.UploadAvatarAsync(currentUser.Id, file.OpenReadStream(), file.FileName, file.ContentType, cancellationToken);

        if (string.IsNullOrEmpty(response.StorageKey))
        {
            return BadRequest(ApiResponse<AvatarUploadResponse>.Error(response.Message));
        }

        return Ok(ApiResponse<AvatarUploadResponse>.Ok(response));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<AvatarDto>>> GetAvatar(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<AvatarDto>.Error("Authentication is required."));

        var avatar = await _avatarService.GetAvatarAsync(currentUser.Id, cancellationToken);

        if (avatar == null)
        {
            return NotFound(ApiResponse<AvatarDto>.Error("Avatar not found."));
        }

        return Ok(ApiResponse<AvatarDto>.Ok(avatar));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<string>>> RemoveAvatar(
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (!currentUser.IsAuthenticated)
            return Unauthorized(ApiResponse<string>.Error("Authentication is required."));

        var success = await _avatarService.RemoveAvatarAsync(currentUser.Id, cancellationToken);

        if (!success)
        {
            return NotFound(ApiResponse<string>.Error("Avatar not found or could not be removed."));
        }

        return Ok(ApiResponse<string>.Ok("Avatar removed successfully"));
    }

    [HttpGet("{storageKey}")]
    public async Task<IActionResult> GetAvatarImage(
        string storageKey,
        CancellationToken cancellationToken)
    {
        var currentUser = HttpContext.GetCurrentUser();

        if (!currentUser.IsAuthenticated)
            return Unauthorized();

        var avatar = await _avatarService.GetAvatarAsync(
            currentUser.Id,
            cancellationToken);

        if (avatar == null ||
            string.IsNullOrWhiteSpace(avatar.StorageKey) ||
            !string.Equals(storageKey, avatar.StorageKey, StringComparison.Ordinal))
        {
            return NotFound();
        }

        var contentType = Path.GetExtension(storageKey).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => null
        };

        if (contentType == null)
            return NotFound();

        var imageStream = await _fileStorageService.GetFileStreamAsync(
            avatar.StorageKey,
            cancellationToken);

        if (imageStream == null)
            return NotFound();

        Response.Headers["X-Content-Type-Options"] = "nosniff";
        Response.Headers["Cache-Control"] = "private, no-store";

        return File(imageStream, contentType);
    }}

