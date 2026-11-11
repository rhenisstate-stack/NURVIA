using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

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
        var validationResult = await ValidateFileAsync(fileStream, fileName, contentType, cancellationToken);
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

        // Store the file first (before updating DB to avoid inconsistency)
        var storageKey = await _fileStorageService.SaveFileAsync(fileStream, fileName, contentType, cancellationToken);

        // Only update DB after successful file storage
        try
        {
            // If there's an existing avatar, remove it
            if (!string.IsNullOrEmpty(userProfile.AvatarStorageKey))
            {
                await _fileStorageService.DeleteFileAsync(userProfile.AvatarStorageKey, cancellationToken);
            }

            // Update the user profile with the avatar storage key
            userProfile.AvatarStorageKey = storageKey;
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception)
        {
            // If DB update fails, remove the newly created file
            await _fileStorageService.DeleteFileAsync(storageKey, cancellationToken);
            throw;
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

    private async Task<AvatarValidationResult> ValidateFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken)
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

        // Validate file extension
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

        // Validate MIME type consistency
        var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!string.IsNullOrEmpty(contentType) && !allowedMimeTypes.Contains(contentType.ToLowerInvariant()))
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "Unsupported MIME type."
            };
        }

        // Validate actual file signature (magic numbers)
        var fileSignature = await GetFileSignatureAsync(fileStream);
        if (!IsValidImageSignature(fileSignature))
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "Invalid file signature - not a recognized image format."
            };
        }

        // Validate file extension and signature consistency
        if (!IsExtensionAndSignatureConsistent(fileExtension, fileSignature))
        {
            return new AvatarValidationResult
            {
                IsValid = false,
                ErrorMessage = "File extension does not match image signature."
            };
        }

        // For now, we'll skip detailed image decoding as it requires System.Drawing
        // which is platform-specific and not fully compatible with all environments
        
        // Reset stream position for further processing
        fileStream.Position = 0;

        return new AvatarValidationResult
        {
            IsValid = true
        };
    }

    private async Task<byte[]> GetFileSignatureAsync(Stream stream)
    {
        var signature = new byte[12];
        var bytesRead = await stream.ReadAsync(signature, 0, signature.Length);
        stream.Position = 0; // Reset position
        return signature.Take(bytesRead).ToArray();
    }

    private bool IsValidImageSignature(byte[] signature)
    {
        // JPEG signature
        if (signature.Length >= 3 && 
            signature[0] == 0xFF && 
            signature[1] == 0xD8 && 
            signature[2] == 0xFF)
        {
            return true;
        }
        
        // PNG signature
        if (signature.Length >= 8 &&
            signature[0] == 0x89 && 
            signature[1] == 0x50 && 
            signature[2] == 0x4E && 
            signature[3] == 0x47 && 
            signature[4] == 0x0D && 
            signature[5] == 0x0A && 
            signature[6] == 0x1A && 
            signature[7] == 0x0A)
        {
            return true;
        }
        
        // WebP signature
        if (signature.Length >= 12 &&
            signature[8] == 0x57 && 
            signature[9] == 0x45 && 
            signature[10] == 0x42 && 
            signature[11] == 0x50)
        {
            return true;
        }
        
        return false;
    }

    private bool IsExtensionAndSignatureConsistent(string extension, byte[] signature)
    {
        // Check for JPEG
        if (extension.Equals(".jpg", StringComparison.OrdinalIgnoreCase) || 
            extension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
        {
            return signature.Length >= 3 && 
                   signature[0] == 0xFF && 
                   signature[1] == 0xD8 && 
                   signature[2] == 0xFF;
        }
        
        // Check for PNG
        if (extension.Equals(".png", StringComparison.OrdinalIgnoreCase))
        {
            return signature.Length >= 8 &&
                   signature[0] == 0x89 && 
                   signature[1] == 0x50 && 
                   signature[2] == 0x4E && 
                   signature[3] == 0x47 && 
                   signature[4] == 0x0D && 
                   signature[5] == 0x0A && 
                   signature[6] == 0x1A && 
                   signature[7] == 0x0A;
        }
        
        // Check for WebP
        if (extension.Equals(".webp", StringComparison.OrdinalIgnoreCase))
        {
            return signature.Length >= 12 &&
                   signature[8] == 0x57 && 
                   signature[9] == 0x45 && 
                   signature[10] == 0x42 && 
                   signature[11] == 0x50;
        }
        
        return false;
    }
}

public class AvatarValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
}