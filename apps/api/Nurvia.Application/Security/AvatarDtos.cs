using System.ComponentModel.DataAnnotations;

namespace Nurvia.Application.Security;

public sealed class AvatarUploadRequest
{
    public Stream File { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
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
    Task<AvatarUploadResponse> UploadAvatarAsync(string userId, Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken);
    Task<AvatarDto?> GetAvatarAsync(string userId, CancellationToken cancellationToken);
    Task<bool> RemoveAvatarAsync(string userId, CancellationToken cancellationToken);
}