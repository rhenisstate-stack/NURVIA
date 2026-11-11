using System.ComponentModel.DataAnnotations;

namespace Nurvia.Application.Security;

public sealed class AvatarUploadRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;
}

public sealed class AvatarUploadResponse
{
    public string StorageKey { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}

public sealed class AvatarDto
{
    public string StorageKey { get; init; } = string.Empty;
    public string Url { get; init; } = string.Empty;
    public DateTime UploadedAtUtc { get; init; }
}

public interface IAvatarService
{
    Task<AvatarUploadResponse> UploadAvatarAsync(string userId, IFormFile file, CancellationToken cancellationToken);
    Task<AvatarDto?> GetAvatarAsync(string userId, CancellationToken cancellationToken);
    Task<bool> RemoveAvatarAsync(string userId, CancellationToken cancellationToken);
}