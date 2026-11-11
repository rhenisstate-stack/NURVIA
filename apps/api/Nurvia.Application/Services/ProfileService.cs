using Microsoft.EntityFrameworkCore;
using Nurvia.Application.Interfaces;
using Nurvia.Application.Security;
using Nurvia.Domain.Accounts;

namespace Nurvia.Application.Services;

public sealed class ProfileService : IProfileService
{
    private readonly INurviaDbContext _context;

    public ProfileService(INurviaDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileDto?> GetProfileAsync(string userId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var guidUserId))
            return null;

        var profile = await _context.UserProfiles
            .Where(p => p.UserId == guidUserId)
            .Select(p => new UserProfileDto
            {
                Id = p.Id.ToString(),
                UserId = p.UserId.ToString(),
                FirstName = p.FirstName,
                MiddleName = p.MiddleName,
                LastName = p.LastName,
                DisplayName = p.DisplayName,
                Biography = p.Biography,
                PhoneNumber = p.PhoneNumber,
                Country = p.Country,
                City = p.City,
                ProfessionalTitle = p.ProfessionalTitle,
                Organization = p.Organization,
                AvatarStorageKey = p.AvatarStorageKey,
                CreatedAtUtc = p.CreatedAtUtc,
                CreatedBy = p.CreatedBy,
                UpdatedAtUtc = p.UpdatedAtUtc,
                UpdatedBy = p.UpdatedBy
            })
            .FirstOrDefaultAsync(cancellationToken);

        return profile;
    }

    public async Task<UpdateProfileResponse> UpdateProfileAsync(
        string userId, 
        UpdateProfileRequest request, 
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var guidUserId))
        {
            return new UpdateProfileResponse
            {
                Message = "Invalid user ID format."
            };
        }

        var userProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == guidUserId, cancellationToken);
        
        if (userProfile == null)
        {
            // Create a new profile if it doesn't exist
            userProfile = new UserProfile(guidUserId);
            _context.UserProfiles.Add(userProfile);
        }

        userProfile.UpdateProfile(
            request.FirstName.Trim(),
            request.MiddleName?.Trim(),
            request.LastName.Trim(),
            request.DisplayName.Trim(),
            request.Biography?.Trim(),
            request.PhoneNumber?.Trim(),
            request.Country?.Trim(),
            request.City?.Trim(),
            request.ProfessionalTitle?.Trim(),
            request.Organization?.Trim(),
            userId);

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateProfileResponse
        {
            Profile = new UserProfileDto
            {
                Id = userProfile.Id.ToString(),
                UserId = userProfile.UserId.ToString(),
                FirstName = userProfile.FirstName,
                MiddleName = userProfile.MiddleName,
                LastName = userProfile.LastName,
                DisplayName = userProfile.DisplayName,
                Biography = userProfile.Biography,
                PhoneNumber = userProfile.PhoneNumber,
                Country = userProfile.Country,
                City = userProfile.City,
                ProfessionalTitle = userProfile.ProfessionalTitle,
                Organization = userProfile.Organization,
                AvatarStorageKey = userProfile.AvatarStorageKey,
                CreatedAtUtc = userProfile.CreatedAtUtc,
                CreatedBy = userProfile.CreatedBy,
                UpdatedAtUtc = userProfile.UpdatedAtUtc,
                UpdatedBy = userProfile.UpdatedBy
            },
            Message = "Profile updated successfully."
        };
    }
}