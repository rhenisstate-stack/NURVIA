using System.Drawing;
using System.Drawing.Imaging;
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

        // Validate image content by attempting to decode it
        try
        {
            using var image = Image.FromStream(fileStream);
            
            // Reset position to beginning for further processing
            fileStream.Position = 0;
            
            // Additional validation for image properties
            if (image.Width <= 0 || image.Height <= 0)
            {
                return new AvatarValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Invalid image dimensions."
                };
            }
            
            // Limit maximum dimensions to prevent excessive memory usage
            const int maxDimension = 4000;
            if (image.Width > maxDimension || image.Height > maxDimension)
            {
                return new AvatarValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Image dimensions exceed the maximum allowed size (4000x4000 pixels)."
                };
            }
            
            // Check total pixel count
            const long maxPixels = 16000000; // 4000x4000 = 16 million pixels
            if ((long)image.Width * image.Height > maxPixels)
            {
                return new AvatarValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Image exceeds maximum pixel count (16 million pixels)."
                };
            }
        }
        catch (ArgumentException)
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "Invalid image file format."
            };
        }
        catch (Exception)
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "Failed to process the image file."
            };
        }

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