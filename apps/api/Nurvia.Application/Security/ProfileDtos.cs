using System.ComponentModel.DataAnnotations;

namespace Nurvia.Application.Security;

public sealed class UserProfileDto
{
    public string Id { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? Biography { get; init; }
    public string? PhoneNumber { get; init; }
    public string? Country { get; init; }
    public string? City { get; init; }
    public string? ProfessionalTitle { get; init; }
    public string? Organization { get; init; }
    public string? AvatarStorageKey { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedBy { get; init; }
}

public sealed class UpdateProfileRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Required, StringLength(100, MinimumLength = 1)]
    public string LastName { get; set; } = string.Empty;

    [Required, StringLength(200, MinimumLength = 1)]
    public string DisplayName { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Biography { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(200)]
    public string? ProfessionalTitle { get; set; }

    [StringLength(200)]
    public string? Organization { get; set; }
}

public sealed class UpdateProfileResponse
{
    public UserProfileDto Profile { get; init; } = new();
    public string Message { get; init; } = string.Empty;
}

public interface IProfileService
{
    Task<UserProfileDto?> GetProfileAsync(string userId, CancellationToken cancellationToken);
    Task<UpdateProfileResponse> UpdateProfileAsync(
        string userId, 
        UpdateProfileRequest request, 
        CancellationToken cancellationToken);
}