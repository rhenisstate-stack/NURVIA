using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;

namespace Nurvia.Application.Services;

public sealed class AvatarService : IAvatarService
{
    private readonly INurviaDbContext _context;

    public AvatarService(INurviaDbContext context)
    {
        _context = context;
    }

    public async Task<AvatarUploadResponse> UploadAvatarAsync(
        string userId, 
        IFormFile file, 
        CancellationToken cancellationToken)
    {
        // In a real implementation, this would:
        // 1. Validate the file (size, type, etc.)
        // 2. Generate a secure storage key
        // 3. Store the file securely
        // 4. Update the user profile with the avatar storage key
        
        if (!Guid.TryParse(userId, out var guidUserId))
        {
            return new AvatarUploadResponse
            {
                Message = "Invalid user ID format."
            };
        }

        // Placeholder implementation - in reality this would validate and store the file
        var storageKey = $"avatar_{userId}_{DateTime.UtcNow.Ticks}";
        
        // Update the user profile with the avatar storage key
        var userProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == guidUserId, cancellationToken);
        
        if (userProfile == null)
        {
            // Create a new profile if it doesn't exist
            userProfile = new UserProfile(guidUserId);
            _context.UserProfiles.Add(userProfile);
        }

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

        userProfile.AvatarStorageKey = null;
        await _context.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}