using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;

namespace Nurvia.Application.Services;

public sealed class AvatarService : IAvatarService
{
    private readonly INurviaDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public AvatarService(INurviaDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<AvatarUploadResponse> UploadAvatarAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken)
    {
        // Validate user ID
        if (!Guid.TryParse(userId, out var guidUserId))
        {
            return new AvatarUploadResponse
            {
                Message = "Invalid user ID format."
            };
        }

        // Validate file
        var validationResult = ValidateFile(fileStream, fileName, contentType);
        if (!validationResult.IsValid)
        {
            return new AvatarUploadResponse
            {
                Message = validationResult.ErrorMessage ?? "Invalid file format or size."
            };
        }

        // Check if user has an existing profile
        var userProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == guidUserId, cancellationToken);

        if (userProfile == null)
        {
            // Create a new profile if it doesn't exist
            userProfile = new UserProfile(guidUserId);
            _context.UserProfiles.Add(userProfile);
        }

        // If there's an existing avatar, remove it
        if (!string.IsNullOrEmpty(userProfile.AvatarStorageKey))
        {
            await _fileStorageService.DeleteFileAsync(userProfile.AvatarStorageKey, cancellationToken);
        }

        // Store the file
        var storageKey = await _fileStorageService.SaveFileAsync(fileStream, fileName, contentType, cancellationToken);

        // Update the user profile with the avatar storage key
        userProfile.AvatarStorageKey = storageKey;
        await _context.SaveChangesAsync(cancellationToken);

        return new AvatarUploadResponse
        {
            StorageKey = storageKey,
            Message = "Avatar uploaded successfully."
        };
    }

    public async Task<AvatarDto?> GetAvatarAsync(string userId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var guidUserId))
            return null;

        var profile = await _context.UserProfiles
            .Where(p => p.UserId == guidUserId)
            .Select(p => new AvatarDto
            {
                StorageKey = p.AvatarStorageKey ?? "",
                Url = p.AvatarStorageKey != null ? $"/api/avatar/{p.AvatarStorageKey}" : "",
                UploadedAtUtc = p.CreatedAtUtc
            })
            .FirstOrDefaultAsync(cancellationToken);

        return profile;
    }

    public async Task<bool> RemoveAvatarAsync(string userId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var guidUserId))
            return false;

        var userProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == guidUserId, cancellationToken);

        if (userProfile == null)
            return false;

        // If there's an existing avatar, remove it from storage
        if (!string.IsNullOrEmpty(userProfile.AvatarStorageKey))
        {
            await _fileStorageService.DeleteFileAsync(userProfile.AvatarStorageKey, cancellationToken);
        }

        userProfile.AvatarStorageKey = null;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private AvatarValidationResult ValidateFile(Stream fileStream, string fileName, string contentType)
    {
        // Check for empty file
        if (fileStream == null || fileStream.Length == 0)
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "No file was uploaded."
            };
        }

        // Check file size (max 5MB)
        const long maxSizeInBytes = 5 * 1024 * 1024;
        if (fileStream.Length > maxSizeInBytes)
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "File size exceeds the maximum limit of 5MB."
            };
        }

        // Check file extension
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "Only JPG, PNG and WebP image formats are allowed."
            };
        }

        // Basic validation - we'll defer detailed image validation to the file storage service
        // For now, we'll just validate the file isn't empty and has correct extension
        return new AvatarValidationResult
        {
            IsValid = true
        };
    }
}

public class AvatarValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
}