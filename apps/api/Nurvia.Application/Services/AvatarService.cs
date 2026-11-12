using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;
using System.IO;

namespace Nurvia.Application.Services;

public sealed class AvatarService : IAvatarService
{
    private readonly INurviaDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly IAvatarImageValidator _imageValidator;

    public AvatarService(
        INurviaDbContext context,
        IFileStorageService fileStorageService,
        IAvatarImageValidator imageValidator)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _imageValidator = imageValidator;
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

        // Store the new file before changing the database reference.
        var storageKey = await _fileStorageService.SaveFileAsync(
            fileStream, fileName, contentType, cancellationToken);

        var previousStorageKey = userProfile.AvatarStorageKey;

        // Commit the new avatar reference before deleting the previous file.
        userProfile.AvatarStorageKey = storageKey;

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            // Restore the tracked entity's previous value.
            userProfile.AvatarStorageKey = previousStorageKey;

            // Best-effort cleanup; preserve the original database exception.
            try
            {
                await _fileStorageService.DeleteFileAsync(
                    storageKey, CancellationToken.None);
            }
            catch
            {
                // Cleanup can be retried separately.
            }

            throw;
        }

        // The database now points to the new file. Retire the old file afterward.
        if (!string.IsNullOrWhiteSpace(previousStorageKey))
        {
            try
            {
                await _fileStorageService.DeleteFileAsync(
                    previousStorageKey, CancellationToken.None);
            }
            catch
            {
                // A failed cleanup may leave an orphaned old file.
            }
        }
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

        // Store the storage key before removing from DB to handle cleanup
        var storageKey = userProfile.AvatarStorageKey;
        
        // Remove the database reference first
        userProfile.AvatarStorageKey = null;
        await _context.SaveChangesAsync(cancellationToken);

        // Then remove the file
        if (!string.IsNullOrEmpty(storageKey))
        {
            await _fileStorageService.DeleteFileAsync(storageKey, cancellationToken);
        }

        return true;
    }

    private AvatarValidationResult ValidateFile(
        Stream fileStream,
        string fileName,
        string contentType)
    {
        if (fileStream is null || !fileStream.CanRead || !fileStream.CanSeek)
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "The uploaded file stream is invalid."
            };
        }

        if (fileStream.Length == 0)
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "No file was uploaded."
            };
        }

        const long maxSizeInBytes = 5 * 1024 * 1024;

        if (fileStream.Length > maxSizeInBytes)
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "File size exceeds the maximum limit of 5MB."
            };
        }

        var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();

        if (fileExtension is not (".jpg" or ".jpeg" or ".png" or ".webp"))
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "Only JPG, PNG and WebP image formats are allowed."
            };
        }

        var result = _imageValidator.Validate(
            fileStream,
            fileExtension,
            contentType);

        return new AvatarValidationResult
        {
            IsValid = result.IsValid,
            ErrorMessage = result.ErrorMessage
        };
    }
}

public class AvatarValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
}


