using Nurvia.Domain.Common;
using Nurvia.Domain.Enums;

namespace Nurvia.Domain.Accounts;

public sealed class UserProfile : Entity, IAuditableEntity
{
    private UserProfile()
    {
    }

    public UserProfile(Guid userId)
    {
        UserId = userId;
        CreatedAtUtc = DateTime.UtcNow;
        CreatedBy = userId.ToString();
    }

    public Guid UserId { get; private set; }
    
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Biography { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? ProfessionalTitle { get; set; }
    public string? Organization { get; set; }
    public string? AvatarStorageKey { get; set; }

    /// <summary>
    /// The nursing pathway this learner is studying (RN or PN/LPN). Null means the
    /// learner has not declared a pathway yet; attempt eligibility enforcement
    /// treats an unset pathway as unrestricted until the learner completes their profile.
    /// </summary>
    public NursingPathway? Pathway { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }

    public void UpdateProfile(
        string firstName,
        string? middleName,
        string lastName,
        string displayName,
        string? biography,
        string? phoneNumber,
        string? country,
        string? city,
        string? professionalTitle,
        string? organization,
        NursingPathway? pathway,
        string updatedBy)
    {
        FirstName = firstName;
        MiddleName = middleName;
        LastName = lastName;
        DisplayName = displayName;
        Biography = biography;
        PhoneNumber = phoneNumber;
        Country = country;
        City = city;
        ProfessionalTitle = professionalTitle;
        Organization = organization;
        Pathway = pathway;
        UpdatedBy = updatedBy;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}